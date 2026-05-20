import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { normalizePath } from "@repograph/shared";
import { loadIgnore } from "./ignore.js";

const CODE_EXTENSIONS = new Set([".cs", ".ts", ".tsx", ".js", ".jsx", ".csproj", ".sln"]);

export async function computeScanSignature(root: string): Promise<string> {
  const ig = await loadIgnore(root);
  const allFiles = await glob("**/*", {
    cwd: root,
    nodir: true,
    dot: false,
    ignore: ["**/node_modules/**", "**/bin/**", "**/obj/**", "**/dist/**", "**/.git/**"],
  });

  const parts: string[] = [];
  for (const rel of allFiles.sort()) {
    const normalized = normalizePath(rel);
    if (ig.ignores(normalized)) continue;
    const ext = path.extname(normalized).toLowerCase();
    if (!CODE_EXTENSIONS.has(ext)) continue;
    try {
      const stat = await fs.stat(path.join(root, normalized));
      parts.push(`${normalized}:${stat.mtimeMs}:${stat.size}`);
    } catch {
      parts.push(`${normalized}:missing`);
    }
  }

  return crypto.createHash("sha256").update(parts.join("\n")).digest("hex");
}
