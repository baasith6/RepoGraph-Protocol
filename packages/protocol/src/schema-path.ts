import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function resolveSchemaDir(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

  throw new Error("RepoGraph JSON schemas not found. Reinstall @repograph/cli.");
}
