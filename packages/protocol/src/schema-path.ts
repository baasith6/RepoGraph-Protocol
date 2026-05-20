import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function getImportMetaUrl(): string | undefined {
  try {
    // Avoid syntax errors in CommonJS bundles by evaluating dynamically.
    return new Function("return import.meta.url")() as string;
  } catch {
    return undefined;
  }
}

export function resolveSchemaDir(): string {
  const metaUrl = getImportMetaUrl() ?? pathToFileURL(__filename).toString();
  const __dirname = path.dirname(fileURLToPath(metaUrl));
  const candidates = [
    path.join(__dirname, "schemas"),
    path.join(__dirname, "..", "schemas"),
    path.join(path.dirname(process.argv[1] ?? ""), "schemas"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "project.schema.json"))) {
      return dir;
    }
  }

  throw new Error("RepoGraph JSON schemas not found. Reinstall @repographprotocol/cli.");
}
