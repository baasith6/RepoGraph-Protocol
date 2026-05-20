import path from "node:path";

export const REPOGRAPH_DIR = ".repograph";
export const GENERATED_DIR = "generated";

export function getRepographDir(root: string): string {
  return path.join(root, REPOGRAPH_DIR);
}

export function getGeneratedDir(root: string): string {
  return path.join(root, REPOGRAPH_DIR, GENERATED_DIR);
}

export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function relativeToRoot(root: string, filePath: string): string {
  return normalizePath(path.relative(root, filePath));
}
