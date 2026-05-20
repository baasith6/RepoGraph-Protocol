import type { GraphNode, RepoGraph } from "@repograph/graph-core";
import { normalizeFilePath } from "./paths.js";

export function findFileNode(graph: RepoGraph, filePath: string): GraphNode | undefined {
  const normalized = normalizeFilePath(filePath);
  return graph.nodes.find(
    (n) =>
      n.type === "FILE" &&
      (n.label === normalized || n.label.endsWith(`/${normalized}`) || normalized.endsWith(n.label))
  );
}

export function fileNodeId(node: GraphNode): string {
  return node.id.startsWith("file:") ? node.id : `file:${node.label}`;
}

export function resolveDependencyPath(target: string): string | undefined {
  if (target.startsWith("file:")) {
    return target.slice(5);
  }
  if (target.includes("/") || target.endsWith(".ts") || target.endsWith(".cs")) {
    return target;
  }
  return undefined;
}

export function getModuleForFile(graph: RepoGraph, fileId: string): string | undefined {
  const edge = graph.edges.find(
    (e) => e.type === "BELONGS_TO" && e.source === fileId && e.target.startsWith("module:")
  );
  if (!edge) return undefined;
  const mod = graph.nodes.find((n) => n.id === edge.target);
  return mod?.label;
}

export function getFilesInModule(graph: RepoGraph, moduleName: string): string[] {
  const modId = `module:${moduleName}`;
  return graph.edges
    .filter((e) => e.type === "BELONGS_TO" && e.target === modId)
    .map((e) => graph.nodes.find((n) => n.id === e.source))
    .filter((n): n is GraphNode => n?.type === "FILE")
    .map((n) => n.label);
}

export function walkReverseDependents(
  graph: RepoGraph,
  fileId: string,
  maxDepth: number,
  maxCount: number
): string[] {
  const result: string[] = [];
  const seen = new Set<string>([fileId]);
  let frontier = [fileId];

  for (let depth = 0; depth < maxDepth && result.length < maxCount; depth++) {
    const next: string[] = [];
    for (const targetId of frontier) {
      for (const edge of graph.edges) {
        if (edge.type !== "DEPENDS_ON" || edge.target !== targetId) continue;
        if (seen.has(edge.source)) continue;
        seen.add(edge.source);
        const node = graph.nodes.find((n) => n.id === edge.source);
        if (node?.type === "FILE") {
          result.push(node.label);
          next.push(edge.source);
          if (result.length >= maxCount) break;
        }
      }
      if (result.length >= maxCount) break;
    }
    frontier = next;
  }

  return result;
}

export function walkForwardDependencies(
  graph: RepoGraph,
  fileId: string,
  maxDepth: number,
  maxCount: number
): string[] {
  const result: string[] = [];
  const seen = new Set<string>([fileId]);
  let frontier = [fileId];

  for (let depth = 0; depth < maxDepth && result.length < maxCount; depth++) {
    const next: string[] = [];
    for (const sourceId of frontier) {
      for (const edge of graph.edges) {
        if (edge.type !== "DEPENDS_ON" || edge.source !== sourceId) continue;
        const depPath = resolveDependencyPath(edge.target);
        const targetNode = graph.nodes.find((n) => n.id === edge.target);
        const label = targetNode?.type === "FILE" ? targetNode.label : depPath;
        if (!label || seen.has(edge.target)) continue;
        seen.add(edge.target);
        if (targetNode?.type === "FILE") {
          result.push(label);
          next.push(edge.target);
        }
        if (result.length >= maxCount) break;
      }
      if (result.length >= maxCount) break;
    }
    frontier = next;
  }

  return result;
}

export function getApisForFile(
  graph: RepoGraph,
  filePath: string
): Array<{ method: string; path: string; handler?: string }> {
  const normalized = normalizeFilePath(filePath);
  const fileId = `file:${normalized}`;
  return graph.edges
    .filter((e) => e.type === "EXPOSES" && e.source === fileId)
    .map((e) => graph.nodes.find((n) => n.id === e.target))
    .filter((n): n is GraphNode => n?.type === "API_ENDPOINT")
    .map((n) => ({
      method: String(n.metadata?.method ?? n.label.split(" ")[0] ?? "GET"),
      path: String(n.metadata?.route ?? n.label.replace(/^\w+\s+/, "")),
      handler: n.metadata?.controller as string | undefined,
    }));
}

export function getApisForModule(
  graph: RepoGraph,
  moduleName: string
): Array<{ method: string; path: string; handler?: string; file?: string }> {
  const files = getFilesInModule(graph, moduleName);
  const apis: Array<{ method: string; path: string; handler?: string; file?: string }> = [];
  for (const f of files) {
    for (const api of getApisForFile(graph, f)) {
      apis.push({ ...api, file: f });
    }
  }
  return apis;
}
