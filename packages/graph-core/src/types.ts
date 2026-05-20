export type NodeType =
  | "PROJECT"
  | "MODULE"
  | "LAYER"
  | "FILE"
  | "CLASS"
  | "INTERFACE"
  | "METHOD"
  | "API_ENDPOINT"
  | "DATABASE_ENTITY"
  | "TEST"
  | "DOCUMENT"
  | "RULE"
  | "ADR";

export type EdgeType =
  | "BELONGS_TO"
  | "DEPENDS_ON"
  | "IMPLEMENTS"
  | "CALLS"
  | "EXPOSES"
  | "USES_ENTITY"
  | "TESTS"
  | "OWNED_BY"
  | "DOCUMENTED_BY"
  | "VIOLATES"
  | "PROTECTED_BY"
  | "RELATED_TO";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  type: EdgeType;
  source: string;
  target: string;
  metadata?: Record<string, unknown>;
}

export interface Violation {
  id: string;
  ruleId: string;
  severity: "warning" | "error" | "critical";
  message: string;
  source?: string;
  target?: string;
}

export interface RepoGraph {
  version: string;
  generatedAt: string;
  project: {
    name: string;
    root: string;
    architecture?: string;
    primaryLanguage?: string;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  violations: Violation[];
  stats: {
    fileCount: number;
    moduleCount: number;
    layerCount: number;
    dependencyCount: number;
    unmappedFiles: number;
    violationCount: number;
  };
}
