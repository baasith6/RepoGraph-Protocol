import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import ignoreModule from "ignore";

type IgnoreInstance = {
  add: (pattern: string | string[]) => IgnoreInstance;
  ignores: (path: string) => boolean;
};

function createIgnore(): IgnoreInstance {
  const factory = ignoreModule as unknown as () => IgnoreInstance;
  const withDefault = ignoreModule as unknown as { default: () => IgnoreInstance };
  return typeof factory === "function" ? factory() : withDefault.default();
}
import { minimatch } from "minimatch";
import { GraphBuilder } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";
import { normalizePath } from "@repograph/shared";
import { analyzeCSharpFile, analyzeCsproj } from "@repograph/analyzer-csharp";
import { analyzeTypeScriptFile } from "@repograph/analyzer-typescript";
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

async function loadIgnore(root: string): Promise<IgnoreInstance> {
  const ig = createIgnore();
  ig.add(["node_modules", "dist", "bin", "obj", ".git", ".repograph/generated"]);

  const gitignorePath = path.join(root, ".gitignore");
  try {
    const content = await fs.readFile(gitignorePath, "utf-8");
    ig.add(content);
  } catch {
    // no .gitignore
  }

  const repographIgnorePath = path.join(root, ".repographignore");
  try {
    const content = await fs.readFile(repographIgnorePath, "utf-8");
    ig.add(content);
  } catch {
    // no .repographignore
  }

  return ig;
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
  config: RepographConfig
): Promise<ScanResult> {
  const ig = await loadIgnore(root);
  const modules = parseModules(config);
  const layers = parseLayers(config);

  const allFiles = await glob("**/*", {
    cwd: root,
    nodir: true,
    dot: false,
    ignore: ["**/node_modules/**", "**/bin/**", "**/obj/**", "**/dist/**", "**/.git/**"],
  });

  const files: ScannedFile[] = [];
  const dependencies: FileDependency[] = [];
  const unmappedFiles: string[] = [];

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

    files.push({
      path: normalized,
      language,
      module,
      layer,
      extension: ext,
    });

    const fullPath = path.join(root, normalized);
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      if (language === "csharp") {
        dependencies.push(...analyzeCSharpFile(normalized, content));
      } else if (language === "typescript" || language === "javascript") {
        dependencies.push(...analyzeTypeScriptFile(normalized, content));
      }
    } catch {
      // skip unreadable files
    }
  }

  // Scan csproj files for project references
  const csprojFiles = await glob("**/*.csproj", { cwd: root, nodir: true });
  for (const csproj of csprojFiles) {
    try {
      const content = await fs.readFile(path.join(root, csproj), "utf-8");
      dependencies.push(...analyzeCsproj(normalizePath(csproj), content));
    } catch {
      // skip
    }
  }

  // Check for angular.json
  try {
    await fs.access(path.join(root, "angular.json"));
    detectedStack.angular = true;
  } catch {
    // not angular
  }

  return { files, dependencies, unmappedFiles, detectedStack };
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

  for (const dep of scan.dependencies) {
    const sourceId = `file:${dep.source}`;
    const targetId = dep.target.startsWith("file:")
      ? dep.target
      : `file:${dep.target}`;
    if (scan.files.some((f) => f.path === dep.source)) {
      builder.addEdge("DEPENDS_ON", sourceId, targetId, { dependencyType: dep.type });
    }
  }

  return builder;
}
