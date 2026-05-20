import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { minimatch } from "minimatch";
import { loadIgnore } from "./ignore.js";
import {
  createEmptyCache,
  fileContentHash,
  hashConfig,
  loadScanCache,
  saveScanCache,
} from "./scan-cache.js";
import { GraphBuilder } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";
import { normalizePath } from "@repograph/shared";
import { analyzeCSharpFile, analyzeCsproj } from "@repograph/analyzer-csharp";
import { runRoslynAnalyzer } from "@repograph/analyzer-csharp-roslyn";
import { analyzeTypeScriptFile, analyzeTypeScriptProject } from "@repograph/analyzer-typescript";
import type { FileDependency, ScanResult, ScannedFile } from "./types.js";

const CODE_EXTENSIONS: Record<string, string> = {
  ".cs": "csharp",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".html": "html",
  ".css": "css",
  ".scss": "scss",
};

interface ModuleDef {
  name: string;
  paths: string[];
  critical?: boolean;
}

interface LayerDef {
  name: string;
  path: string;
}

function matchGlob(filePath: string, pattern: string): boolean {
  return minimatch(filePath, pattern, { dot: true, nocase: true });
}

function resolveModule(filePath: string, modules: ModuleDef[]): string | undefined {
  for (const mod of modules) {
    for (const p of mod.paths) {
      if (matchGlob(filePath, p)) {
        return mod.name;
      }
    }
  }
  return undefined;
}

function resolveLayer(filePath: string, layers: LayerDef[]): string | undefined {
  for (const layer of layers) {
    const layerPath = layer.path.replace(/\\/g, "/");
    if (filePath.startsWith(layerPath) || matchGlob(filePath, `${layerPath}/**`)) {
      return layer.name;
    }
  }
  return undefined;
}

export interface ScanOptions {
  generatedDir?: string;
  useCache?: boolean;
}

function parseModules(config: RepographConfig): ModuleDef[] {
  const modules = config.modules?.modules as ModuleDef[] | undefined;
  return modules ?? [];
}

function parseLayers(config: RepographConfig): LayerDef[] {
  const layers = config.architecture?.layers as Record<string, { path: string }> | undefined;
  if (!layers) return [];
  return Object.entries(layers).map(([name, def]) => ({
    name,
    path: def.path.replace(/\\/g, "/"),
  }));
}

export async function scanRepository(
  root: string,
  config: RepographConfig,
  options: ScanOptions = {}
): Promise<ScanResult & { cacheHits?: number }> {
  const ig = await loadIgnore(root);
  const modules = parseModules(config);
  const layers = parseLayers(config);
  const configHash = hashConfig(config);
  const useCache = options.useCache !== false && Boolean(options.generatedDir);
  const priorCache =
    useCache && options.generatedDir
      ? await loadScanCache(options.generatedDir, configHash)
      : null;
  const nextCache = priorCache ?? createEmptyCache(configHash);

  const allFiles = await glob("**/*", {
    cwd: root,
    nodir: true,
    dot: false,
    ignore: ["**/node_modules/**", "**/bin/**", "**/obj/**", "**/dist/**", "**/.git/**"],
  });

  const files: ScannedFile[] = [];
  const tsSourcePaths: string[] = [];
  let dependencies: FileDependency[] = [];
  const unmappedFiles: string[] = [];
  let symbols: ScanResult["symbols"] = [];
  let apiEndpoints: ScanResult["apiEndpoints"] = [];
  let analyzer: ScanResult["analyzer"] = "heuristic";
  let cacheHits = 0;
  const csharpPaths: string[] = [];

  const detectedStack = {
    csharp: false,
    angular: false,
    dotnet: false,
    node: false,
  };

  for (const rel of allFiles) {
    const normalized = normalizePath(rel);
    if (ig.ignores(normalized)) continue;

    const ext = path.extname(normalized).toLowerCase();
    const language = CODE_EXTENSIONS[ext];
    if (!language && ext !== ".csproj" && ext !== ".sln") continue;

    if (ext === ".csproj" || ext === ".sln") {
      detectedStack.dotnet = true;
      detectedStack.csharp = true;
      csharpPaths.push(normalized);
    }
    if (normalized.includes("angular.json")) {
      detectedStack.angular = true;
    }
    if (normalized === "package.json") {
      detectedStack.node = true;
    }

    if (!language) continue;

    const module = resolveModule(normalized, modules);
    const layer = resolveLayer(normalized, layers);

    if (!module && (language === "csharp" || language === "typescript")) {
      unmappedFiles.push(normalized);
    }

    if (language === "typescript" || language === "javascript") {
      tsSourcePaths.push(normalized);
    }
    if (language === "csharp") {
      csharpPaths.push(normalized);
    }

    const hash = await fileContentHash(root, normalized);
    const cached = priorCache?.files[normalized];
    if (cached && cached.hash === hash) {
      files.push(cached.file);
      dependencies.push(...cached.dependencies);
      cacheHits++;
      nextCache.files[normalized] = cached;
      continue;
    }

    const scanned: ScannedFile = {
      path: normalized,
      language,
      module,
      layer,
      extension: ext,
    };
    files.push(scanned);

    const fileDeps: FileDependency[] = [];
    const fullPath = path.join(root, normalized);
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      if (language === "csharp") {
        fileDeps.push(...analyzeCSharpFile(normalized, content));
        dependencies.push(...fileDeps);
      }
    } catch {
      // skip unreadable files
    }

    nextCache.files[normalized] = { hash, file: scanned, dependencies: fileDeps };
  }

  const tsProjectHash = crypto
    .createHash("sha256")
    .update(
      (
        await Promise.all(tsSourcePaths.map((p) => fileContentHash(root, p)))
      ).join("|")
    )
    .digest("hex")
    .slice(0, 16);

  if (
    priorCache &&
    priorCache.typescriptHash === tsProjectHash &&
    priorCache.typescriptDeps.length > 0
  ) {
    dependencies.push(...priorCache.typescriptDeps);
    nextCache.typescriptDeps = priorCache.typescriptDeps;
    nextCache.typescriptHash = tsProjectHash;
  } else {
    const tsProjectDeps = analyzeTypeScriptProject(root, tsSourcePaths);
    if (tsProjectDeps && tsProjectDeps.length > 0) {
      dependencies.push(...tsProjectDeps);
      nextCache.typescriptDeps = tsProjectDeps;
    } else {
      const perFileTsDeps: FileDependency[] = [];
      for (const normalized of tsSourcePaths) {
        try {
          const content = await fs.readFile(path.join(root, normalized), "utf-8");
          perFileTsDeps.push(...analyzeTypeScriptFile(normalized, content));
        } catch {
          // skip
        }
      }
      dependencies.push(...perFileTsDeps);
      nextCache.typescriptDeps = perFileTsDeps;
    }
    nextCache.typescriptHash = tsProjectHash;
  }

  const csprojFiles = await glob("**/*.csproj", { cwd: root, nodir: true });
  const roslynHash = crypto
    .createHash("sha256")
    .update(
      (
        await Promise.all(csharpPaths.map((p) => fileContentHash(root, p)))
      ).join("|")
    )
    .digest("hex")
    .slice(0, 16);

  if (csprojFiles.length > 0) {
    detectedStack.dotnet = true;
    detectedStack.csharp = true;

    if (
      priorCache &&
      priorCache.roslynHash === roslynHash &&
      priorCache.roslynDeps.length > 0 &&
      priorCache.analyzer === "roslyn"
    ) {
      analyzer = "roslyn";
      dependencies = [
        ...dependencies.filter((d) => !d.source.endsWith(".cs")),
        ...priorCache.roslynDeps,
      ];
      symbols = priorCache.roslynSymbols;
      apiEndpoints = priorCache.roslynApiEndpoints;
      nextCache.roslynDeps = priorCache.roslynDeps;
      nextCache.roslynSymbols = priorCache.roslynSymbols;
      nextCache.roslynApiEndpoints = priorCache.roslynApiEndpoints;
      nextCache.roslynHash = roslynHash;
      nextCache.analyzer = "roslyn";
    } else {
      const roslyn = await runRoslynAnalyzer(root);
      if (roslyn && roslyn.dependencies.length > 0) {
        analyzer = "roslyn";
        const nonRoslynDeps = dependencies.filter((d) => !d.source.endsWith(".cs"));
        dependencies = [
          ...nonRoslynDeps,
          ...roslyn.dependencies.map((d) => ({
            source: d.source,
            target: d.target,
            type: d.type as FileDependency["type"],
          })),
        ];
        symbols = roslyn.symbols;
        apiEndpoints = roslyn.apiEndpoints;
        nextCache.roslynDeps = roslyn.dependencies.map((d) => ({
          source: d.source,
          target: d.target,
          type: d.type as FileDependency["type"],
        }));
        nextCache.roslynSymbols = roslyn.symbols;
        nextCache.roslynApiEndpoints = roslyn.apiEndpoints;
        nextCache.roslynHash = roslynHash;
        nextCache.analyzer = "roslyn";
      } else {
        for (const csproj of csprojFiles) {
          try {
            const content = await fs.readFile(path.join(root, csproj), "utf-8");
            dependencies.push(...analyzeCsproj(normalizePath(csproj), content));
          } catch {
            // skip
          }
        }
        nextCache.roslynHash = roslynHash;
        nextCache.analyzer = "heuristic";
      }
    }
  }

  try {
    await fs.access(path.join(root, "angular.json"));
    detectedStack.angular = true;
  } catch {
    // not angular
  }

  nextCache.analyzer = analyzer;
  if (useCache && options.generatedDir) {
    await saveScanCache(options.generatedDir, nextCache);
  }

  return {
    files,
    dependencies,
    unmappedFiles,
    symbols,
    apiEndpoints,
    analyzer,
    detectedStack,
    cacheHits: useCache ? cacheHits : undefined,
  };
}

export function buildGraphFromScan(
  root: string,
  config: RepographConfig,
  scan: ScanResult
): GraphBuilder {
  const builder = new GraphBuilder();
  const projectConfig = config.project?.project as Record<string, string> | undefined;

  const projectId = "project:root";
  builder.addNode({
    id: projectId,
    type: "PROJECT",
    label: projectConfig?.name ?? path.basename(root),
    metadata: {
      architecture: projectConfig?.architecture,
      primaryLanguage: projectConfig?.primary_language,
    },
  });

  const modules = parseModules(config);
  const moduleIds = new Map<string, string>();

  for (const mod of modules) {
    const id = `module:${mod.name}`;
    moduleIds.set(mod.name, id);
    builder.addNode({
      id,
      type: "MODULE",
      label: mod.name,
      metadata: { critical: mod.critical ?? false },
    });
    builder.addEdge("BELONGS_TO", id, projectId);
  }

  const layers = parseLayers(config);
  const layerIds = new Map<string, string>();

  for (const layer of layers) {
    const id = `layer:${layer.name}`;
    layerIds.set(layer.name, id);
    builder.addNode({
      id,
      type: "LAYER",
      label: layer.name,
      metadata: { path: layer.path },
    });
    builder.addEdge("BELONGS_TO", id, projectId);
  }

  for (const file of scan.files) {
    const fileId = `file:${file.path}`;
    builder.addNode({
      id: fileId,
      type: "FILE",
      label: file.path,
      metadata: { language: file.language, extension: file.extension },
    });

    if (file.module) {
      const modId = moduleIds.get(file.module);
      if (modId) {
        builder.addEdge("BELONGS_TO", fileId, modId);
      }
    }

    if (file.layer) {
      const layerId = layerIds.get(file.layer);
      if (layerId) {
        builder.addEdge("BELONGS_TO", fileId, layerId);
      }
    }
  }

  for (const sym of scan.symbols) {
    const symId = `class:${sym.file}:${sym.name}`;
    builder.addNode({
      id: symId,
      type: sym.kind === "CLASS" ? "CLASS" : "CLASS",
      label: sym.name,
      metadata: { namespace: sym.namespace, file: sym.file },
    });
    builder.addEdge("BELONGS_TO", symId, `file:${sym.file}`);
  }

  for (const api of scan.apiEndpoints) {
    const apiId = `api:${api.file}:${api.method}`;
    builder.addNode({
      id: apiId,
      type: "API_ENDPOINT",
      label: `${api.method} ${api.route}`,
      metadata: { controller: api.controller, route: api.route, file: api.file },
    });
    builder.addEdge("EXPOSES", `file:${api.file}`, apiId);
  }

  for (const dep of scan.dependencies) {
    const sourceIsFile = scan.files.some((f) => f.path === dep.source);
    const sourceId = sourceIsFile ? `file:${dep.source}` : `file:${dep.source}`;
    let targetId = dep.target;
    if (!targetId.startsWith("file:") && !targetId.includes("/") && !targetId.endsWith(".csproj")) {
      targetId = dep.target;
    } else if (dep.target.endsWith(".csproj")) {
      targetId = `file:${dep.target}`;
    } else if (!dep.target.startsWith("file:")) {
      targetId = dep.target.includes("/") ? `file:${dep.target}` : dep.target;
    }
    if (sourceIsFile || dep.source.endsWith(".csproj")) {
      builder.addEdge("DEPENDS_ON", sourceId, targetId, { dependencyType: dep.type });
    }
  }

  return builder;
}
