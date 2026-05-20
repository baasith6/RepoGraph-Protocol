import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import type { ScannedDatabaseEntity } from "./types.js";

const CREATE_TABLE = /CreateTable\s*\(\s*name:\s*["']([^"']+)["']/g;

export async function scanEfMigrations(
  root: string,
  resolveModule: (filePath: string) => string | undefined
): Promise<ScannedDatabaseEntity[]> {
  const files = await glob("**/Migrations/**/*.cs", {
    cwd: root,
    nodir: true,
    ignore: ["**/bin/**", "**/obj/**"],
  });

  const entities: ScannedDatabaseEntity[] = [];
  const seenTables = new Set<string>();

  for (const rel of files) {
    const normalized = rel.replace(/\\/g, "/");
    const content = await fs.readFile(path.join(root, rel), "utf-8");
    let match: RegExpExecArray | null;
    const regex = new RegExp(CREATE_TABLE.source, CREATE_TABLE.flags);
    while ((match = regex.exec(content)) !== null) {
      const table = match[1];
      if (seenTables.has(table)) continue;
      seenTables.add(table);
      const name = table.endsWith("s") ? table.slice(0, -1) : table;
      entities.push({
        name,
        file: normalized,
        table,
        module: resolveModule(normalized),
        migrationFiles: [normalized],
      });
    }
  }

  return entities;
}
