import { minimatch } from "minimatch";

export function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function matchGlobPattern(filePath: string, pattern: string): boolean {
  const normalized = normalizeFilePath(filePath);
  const pat = normalizeFilePath(pattern);
  return minimatch(normalized, pat, { dot: true, nocase: true });
}

export function isExcludedPath(filePath: string, excludePatterns: string[]): boolean {
  const normalized = normalizeFilePath(filePath);
  if (normalized.includes(".repograph/generated/")) return true;
  for (const pattern of excludePatterns) {
    if (matchGlobPattern(normalized, pattern)) return true;
  }
  return false;
}

export function tokenizeTask(task: string): string[] {
  return task
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length >= 2);
}
