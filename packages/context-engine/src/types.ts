export type ContextMode = "short" | "full" | "strict";

export interface ScoredModule {
  name: string;
  score: number;
  description?: string;
  critical?: boolean;
}

export interface TaskContextOptions {
  mode?: ContextMode;
  maxModules?: number;
}

export interface TaskContext {
  task: string;
  mode: ContextMode;
  modules: ScoredModule[];
  files: string[];
  rules: Array<{ id: string; description: string }>;
  risks: Array<{ path: string; risk: string; reason?: string }>;
  tests: Array<{ module: string; paths: string[] }>;
  apis: Array<{ method: string; path: string; module: string; handler?: string }>;
  owners: string[];
  excludePaths: string[];
  warnings: string[];
  suggestedTests: string[];
}

export interface ImpactReport {
  file: string;
  fileFound: boolean;
  module?: string;
  moduleRisk?: string;
  affectedFiles: string[];
  reverseDependents: string[];
  forwardDependencies: string[];
  affectedApis: Array<{ method: string; path: string; handler?: string }>;
  relatedTests: Array<{ module: string; paths: string[] }>;
  reviewers: string[];
  riskLevel?: string;
  aiContextFiles: string[];
  summary: string;
}
