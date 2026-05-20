import type { FileDependency } from "./types.js";

export type { FileDependency };

const USING_REGEX = /^\s*using\s+([\w.]+)\s*;/gm;
const NAMESPACE_REGEX = /^\s*namespace\s+([\w.]+)/m;
const ROUTE_REGEX = /\[Route\s*\(\s*["']([^"']+)["']\s*\)\]/;
const CLASS_REGEX = /(?:public|internal|private|protected)?\s*(?:abstract|sealed|static|partial)?\s*class\s+(\w+)/g;

export function analyzeCSharpFile(filePath: string, content: string): FileDependency[] {
  const deps: FileDependency[] = [];

  let match: RegExpExecArray | null;
  const usingRegex = new RegExp(USING_REGEX.source, USING_REGEX.flags);
  while ((match = usingRegex.exec(content)) !== null) {
    deps.push({
      source: filePath,
      target: match[1],
      type: "using",
    });
  }

  const nsMatch = NAMESPACE_REGEX.exec(content);
  if (nsMatch) {
    deps.push({
      source: filePath,
      target: `namespace:${nsMatch[1]}`,
      type: "import",
    });
  }

  const routeMatch = ROUTE_REGEX.exec(content);
  if (routeMatch && filePath.includes("Controller")) {
    deps.push({
      source: filePath,
      target: `api:${routeMatch[1]}`,
      type: "import",
    });
  }

  return deps;
}

export function analyzeCsproj(filePath: string, content: string): FileDependency[] {
  const deps: FileDependency[] = [];
  const refRegex = /<ProjectReference\s+Include="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = refRegex.exec(content)) !== null) {
    const refPath = match[1].replace(/\\/g, "/");
    deps.push({
      source: filePath,
      target: refPath,
      type: "project-reference",
    });
  }
  return deps;
}

export function extractCSharpClasses(content: string): string[] {
  const classes: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(CLASS_REGEX.source, CLASS_REGEX.flags);
  while ((match = regex.exec(content)) !== null) {
    classes.push(match[1]);
  }
  return classes;
}
