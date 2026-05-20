import type { GraphEdge, GraphNode, RepoGraph, Violation } from "./types.js";

export interface GraphDiff {
  baseRef: string;
  headRef: string;
  addedFiles: string[];
  removedFiles: string[];
  addedDependencies: Array<{ source: string; target: string; type: string }>;
  removedDependencies: Array<{ source: string; target: string; type: string }>;
  newViolations: Violation[];
  resolvedViolations: Violation[];
  summary: string;
}

function fileNodes(graph: RepoGraph): GraphNode[] {
  return graph.nodes.filter((n) => n.type === "FILE");
}

function depKey(edge: GraphEdge): string {
  return `${edge.source}|${edge.target}|${edge.type}`;
}

export function diffGraphs(
  base: RepoGraph,
  head: RepoGraph,
  baseRef: string,
  headRef: string
): GraphDiff {
  const baseFiles = new Set(fileNodes(base).map((n) => n.label));
  const headFiles = new Set(fileNodes(head).map((n) => n.label));

  const addedFiles = [...headFiles].filter((f) => !baseFiles.has(f));
  const removedFiles = [...baseFiles].filter((f) => !headFiles.has(f));

  const baseDeps = new Map(
    base.edges.filter((e) => e.type === "DEPENDS_ON").map((e) => [depKey(e), e])
  );
  const headDeps = new Map(
    head.edges.filter((e) => e.type === "DEPENDS_ON").map((e) => [depKey(e), e])
  );

  const addedDependencies: GraphDiff["addedDependencies"] = [];
  const removedDependencies: GraphDiff["removedDependencies"] = [];

  for (const [key, edge] of headDeps) {
    if (!baseDeps.has(key)) {
      addedDependencies.push({
        source: edge.source.replace("file:", ""),
        target: edge.target.replace("file:", ""),
        type: edge.type,
      });
    }
  }

  for (const [key, edge] of baseDeps) {
    if (!headDeps.has(key)) {
      removedDependencies.push({
        source: edge.source.replace("file:", ""),
        target: edge.target.replace("file:", ""),
        type: edge.type,
      });
    }
  }

  const baseViolations = new Map(base.violations.map((v) => [v.ruleId + v.message, v]));
  const headViolations = new Map(head.violations.map((v) => [v.ruleId + v.message, v]));

  const newViolations = head.violations.filter(
    (v) => !baseViolations.has(v.ruleId + v.message)
  );
  const resolvedViolations = base.violations.filter(
    (v) => !headViolations.has(v.ruleId + v.message)
  );

  const summary = [
    `Graph diff: ${baseRef} → ${headRef}`,
    `Files: +${addedFiles.length} -${removedFiles.length}`,
    `Dependencies: +${addedDependencies.length} -${removedDependencies.length}`,
    `Violations: +${newViolations.length} -${resolvedViolations.length}`,
  ].join("\n");

  return {
    baseRef,
    headRef,
    addedFiles,
    removedFiles,
    addedDependencies,
    removedDependencies,
    newViolations,
    resolvedViolations,
    summary,
  };
}

export function formatGraphDiff(diff: GraphDiff): string {
  const lines: string[] = [diff.summary, ""];

  if (diff.addedFiles.length) {
    lines.push("## Added files");
    for (const f of diff.addedFiles.slice(0, 50)) lines.push(`  + ${f}`);
    if (diff.addedFiles.length > 50) lines.push(`  ... +${diff.addedFiles.length - 50} more`);
    lines.push("");
  }

  if (diff.removedFiles.length) {
    lines.push("## Removed files");
    for (const f of diff.removedFiles.slice(0, 50)) lines.push(`  - ${f}`);
    lines.push("");
  }

  if (diff.addedDependencies.length) {
    lines.push("## New dependencies");
    for (const d of diff.addedDependencies.slice(0, 30)) {
      lines.push(`  + ${d.source} -> ${d.target} (${d.type})`);
    }
    lines.push("");
  }

  if (diff.newViolations.length) {
    lines.push("## New violations");
    for (const v of diff.newViolations) {
      lines.push(`  ! [${v.severity}] ${v.message}`);
    }
    lines.push("");
  }

  if (diff.resolvedViolations.length) {
    lines.push("## Resolved violations");
    for (const v of diff.resolvedViolations) {
      lines.push(`  ✓ ${v.message}`);
    }
  }

  return lines.join("\n");
}
