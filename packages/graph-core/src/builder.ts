import type { GraphEdge, GraphNode, RepoGraph, Violation } from "./types.js";

export class GraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private violations: Violation[] = [];
  private edgeCounter = 0;

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  addEdge(type: GraphEdge["type"], source: string, target: string, metadata?: Record<string, unknown>): void {
    this.edgeCounter++;
    this.edges.push({
      id: `edge-${this.edgeCounter}`,
      type,
      source,
      target,
      metadata,
    });
  }

  addViolation(violation: Violation): void {
    this.violations.push(violation);
  }

  getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getEdges(): GraphEdge[] {
    return this.edges;
  }

  getViolations(): Violation[] {
    return this.violations;
  }

  build(project: RepoGraph["project"], unmappedFiles: number): RepoGraph {
    const nodes = this.getNodes();
    const moduleCount = nodes.filter((n) => n.type === "MODULE").length;
    const layerCount = nodes.filter((n) => n.type === "LAYER").length;

    return {
      version: "0.1.0",
      generatedAt: new Date().toISOString(),
      project,
      nodes,
      edges: this.edges,
      violations: this.violations,
      stats: {
        fileCount: nodes.filter((n) => n.type === "FILE").length,
        moduleCount,
        layerCount,
        dependencyCount: this.edges.filter((e) => e.type === "DEPENDS_ON").length,
        unmappedFiles,
        violationCount: this.violations.length,
      },
    };
  }
}
