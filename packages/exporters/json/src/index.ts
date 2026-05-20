import type { RepoGraph } from "@repograph/graph-core";

export function exportJson(graph: RepoGraph): string {
  return JSON.stringify(graph, null, 2);
}
