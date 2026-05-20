import type { RepoGraph } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";
import { parseAiExclude, parseModules } from "./config-parse.js";
import { getFilesInModule, walkForwardDependencies, walkReverseDependents } from "./graph-utils.js";
import { isExcludedPath, matchGlobPattern } from "./paths.js";
import type { ContextMode, ScoredModule } from "./types.js";

const MODE_LIMITS: Record<ContextMode, { maxFiles: number; maxModules: number }> = {
  short: { maxFiles: 15, maxModules: 2 },
  full: { maxFiles: 50, maxModules: 3 },
  strict: { maxFiles: 8, maxModules: 2 },
};

export function getModeLimits(mode: ContextMode): { maxFiles: number; maxModules: number } {
  return MODE_LIMITS[mode];
}

export function selectModuleFiles(
  graph: RepoGraph,
  modules: ScoredModule[],
  config: RepographConfig,
  mode: ContextMode
): string[] {
  const { maxFiles } = getModeLimits(mode);
  const exclude = parseAiExclude(config);
  const moduleDefs = parseModules(config);
  const selected = new Set<string>();

  for (const mod of modules) {
    const def = moduleDefs.find((m) => m.name === mod.name);
    const fromGraph = getFilesInModule(graph, mod.name);

    for (const f of fromGraph) {
      if (!isExcludedPath(f, exclude)) selected.add(f);
    }

    if (def?.paths) {
      for (const node of graph.nodes) {
        if (node.type !== "FILE") continue;
        for (const pattern of def.paths) {
          if (matchGlobPattern(node.label, pattern) && !isExcludedPath(node.label, exclude)) {
            selected.add(node.label);
          }
        }
      }
    }
  }

  return [...selected].slice(0, maxFiles);
}

export function selectImpactFiles(
  graph: RepoGraph,
  filePath: string,
  config: RepographConfig,
  mode: ContextMode
): {
  reverseDependents: string[];
  forwardDependencies: string[];
  moduleFiles: string[];
  allAffected: string[];
} {
  const { maxFiles } = getModeLimits(mode);
  const exclude = parseAiExclude(config);
  const normalized = filePath.replace(/\\/g, "/");

  const fileNode = graph.nodes.find(
    (n) =>
      n.type === "FILE" &&
      (n.label === normalized || n.label.endsWith(`/${normalized}`) || normalized.endsWith(n.label))
  );

  const fileId = fileNode?.id ?? `file:${normalized}`;
  const reverse = walkReverseDependents(graph, fileId, 2, maxFiles).filter(
    (f) => !isExcludedPath(f, exclude)
  );
  const forward = fileNode
    ? walkForwardDependencies(graph, fileId, 1, 15).filter((f) => !isExcludedPath(f, exclude))
    : [];

  const modName = fileNode
    ? graph.edges.find((e) => e.type === "BELONGS_TO" && e.source === fileId && e.target.startsWith("module:"))
    : undefined;
  const moduleLabel = modName
    ? graph.nodes.find((n) => n.id === modName.target)?.label
    : undefined;

  const moduleFiles = moduleLabel
    ? getFilesInModule(graph, moduleLabel).filter((f) => !isExcludedPath(f, exclude))
    : [];

  const all = new Set<string>();
  if (fileNode) all.add(fileNode.label);
  for (const f of reverse) all.add(f);
  for (const f of forward) all.add(f);
  for (const f of moduleFiles.slice(0, 10)) all.add(f);

  return {
    reverseDependents: reverse,
    forwardDependencies: forward.slice(0, 15),
    moduleFiles,
    allAffected: [...all].slice(0, maxFiles),
  };
}
