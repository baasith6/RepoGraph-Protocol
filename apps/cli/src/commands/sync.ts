import { scanRepositoryAndWrite } from "./scan.js";
import {
  exportCodeownersFromOwnership,
  generateRiskYamlFromGraph,
  importOwnershipFromCodeowners,
  log,
  suggestGlossary,
} from "@repograph/shared";
import { getRoot } from "../context.js";
import fs from "node:fs/promises";
import path from "node:path";
import { getGeneratedDir } from "@repograph/shared";

export async function syncCommand(): Promise<void> {
  await scanRepositoryAndWrite();

  const root = getRoot();
  const imported = await importOwnershipFromCodeowners(root);
  if (imported.updated) {
    log("info", `Imported ownership from ${imported.codeownersPath}`);
  }

  const exported = await exportCodeownersFromOwnership(root);
  if (exported.updated) {
    log("info", `Updated ${exported.codeownersPath} from .repograph/ownership.yml`);
  }

  try {
    const raw = await fs.readFile(path.join(getGeneratedDir(root), "graph.json"), "utf-8");
    const graph = JSON.parse(raw) as { nodes: unknown[]; edges: unknown[] };
    const risk = await generateRiskYamlFromGraph(root, graph as any);
    if (risk.updated) log("info", "Updated .repograph/risk.yml");
  } catch {
    // no graph.json or invalid; skip risk generation
  }

  const glossary = await suggestGlossary(root);
  if (glossary.updated) {
    log("info", `Updated .repograph/glossary.yml (+${glossary.added} suggested terms)`);
  }
}
