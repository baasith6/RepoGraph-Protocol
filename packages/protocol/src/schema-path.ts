import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function getImportMetaUrl(): string | undefined {
  try {
    // Avoid syntax errors in CommonJS bundles by evaluating dynamically.
    return new Function("return import.meta.url")() as string;
  } catch {
    return undefined;
  }
}

export function resolveSchemaDir(): string {
  const metaUrl = getImportMetaUrl();
  const __dirname = metaUrl ? path.dirname(fileURLToPath(metaUrl)) : process.cwd();
  const candidates = [
    path.join(__dirname, "schemas"),
    path.join(__dirname, "..", "schemas"),
    path.join(path.dirname(process.argv[1] ?? ""), "schemas"),
    // Monorepo/dev environments (vitest, local imports)
    path.join(process.cwd(), "packages", "protocol", "src", "schemas"),
    path.join(process.cwd(), "packages", "protocol", "dist", "schemas"),
    // Installed package layout
    path.join(process.cwd(), "node_modules", "@repograph", "protocol", "dist", "schemas"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "project.schema.json"))) {
      return dir;
    }
  }

  throw new Error("RepoGraph JSON schemas not found. Reinstall @repographprotocol/cli.");
}
