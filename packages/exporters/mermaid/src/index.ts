import type { RepoGraph } from "@repograph/graph-core";

export type DiagramType = "module" | "layer" | "all";

export function exportMermaid(graph: RepoGraph, type: DiagramType = "all"): string {
  const lines: string[] = ["graph TD"];

  const modules = graph.nodes.filter((n) => n.type === "MODULE");
  const layers = graph.nodes.filter((n) => n.type === "LAYER");

  if (type === "module" || type === "all") {
    lines.push("  subgraph modules [Modules]");
    for (const mod of modules) {
      const safeId = mod.id.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`    ${safeId}["${mod.label}"]`);
    }
    lines.push("  end");

  }

  if (type === "layer" || type === "all") {
    lines.push("  subgraph layers [Layers]");
    for (const layer of layers) {
      const safeId = layer.id.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`    ${safeId}["${layer.label}"]`);
    }
    lines.push("  end");

    for (const v of graph.violations) {
      if (v.source && v.target) {
        const fromId = `layer:${v.source}`.replace(/[^a-zA-Z0-9]/g, "_");
        const toId = `layer:${v.target}`.replace(/[^a-zA-Z0-9]/g, "_");
        lines.push(`  ${fromId} -.->|violation| ${toId}`);
      }
    }
  }

  for (const v of graph.violations) {
    if (v.source && v.target && (type === "layer" || type === "all")) {
      const fromId = v.source.replace(/[^a-zA-Z0-9]/g, "_");
      const toId = v.target.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`  ${fromId} -.->|${v.ruleId}| ${toId}`);
    }
  }

  return lines.join("\n");
}
