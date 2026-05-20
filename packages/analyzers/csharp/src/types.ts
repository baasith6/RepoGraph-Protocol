export interface FileDependency {
  source: string;
  target: string;
  type: "import" | "project-reference" | "using";
}
