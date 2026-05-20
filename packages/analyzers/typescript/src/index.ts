export { analyzeTypeScriptProject } from "./compiler.js";

const IMPORT_REGEX =
  /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
const ANGULAR_COMPONENT_REGEX = /@Component\s*\(\s*\{[^}]*\}/;
const ANGULAR_MODULE_REGEX = /@NgModule\s*\(\s*\{[^}]*\}/;

export interface FileDependency {
  source: string;
  target: string;
  type: "import" | "project-reference" | "using";
}

export function analyzeTypeScriptFile(filePath: string, content: string): FileDependency[] {
  const deps: FileDependency[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(IMPORT_REGEX.source, IMPORT_REGEX.flags);

  while ((match = regex.exec(content)) !== null) {
    deps.push({
      source: filePath,
      target: match[1],
      type: "import",
    });
  }

  if (ANGULAR_COMPONENT_REGEX.test(content)) {
    deps.push({
      source: filePath,
      target: "angular:component",
      type: "import",
    });
  }

  if (ANGULAR_MODULE_REGEX.test(content)) {
    deps.push({
      source: filePath,
      target: "angular:module",
      type: "import",
    });
  }

  return deps;
}
