import fs from "node:fs/promises";
import path from "node:path";
import { exportJson } from "@repograph/exporter-json";
import { exportMermaid } from "@repograph/exporter-mermaid";
import { exportContextPack } from "@repograph/exporter-markdown";
import { checkArchitectureRules, getEnforcementMode } from "@repograph/rule-engine";
import { buildGraphFromScan, scanRepository } from "@repograph/scanner-core";
import { getGeneratedDir, log, syncProtocolFromScan } from "@repograph/shared";
import { loadConfig, getRoot } from "../context.js";

export async function scanRepositoryAndWrite(): Promise<void> {
  const root = getRoot();
  const config = await loadConfig();

  log("info", "Scanning repository...");
  const scan = await scanRepository(root, config);

  const builder = buildGraphFromScan(root, config, scan);
  const projectConfig = config.project?.project as Record<string, string> | undefined;

  let graph = builder.build(
    {
      name: projectConfig?.name ?? path.basename(root),
      root,
      architecture: projectConfig?.architecture,
      primaryLanguage: projectConfig?.primary_language,
    },
    scan.unmappedFiles.length
  );

  const ruleResult = checkArchitectureRules(graph, config, getEnforcementMode(config));
  for (const violation of ruleResult.violations) {
    builder.addViolation(violation);
  }

  graph = builder.build(graph.project, scan.unmappedFiles.length);

  const generatedDir = getGeneratedDir(root);
  await fs.mkdir(generatedDir, { recursive: true });

  await fs.writeFile(path.join(generatedDir, "graph.json"), exportJson(graph), "utf-8");
  await fs.writeFile(path.join(generatedDir, "graph.mmd"), exportMermaid(graph), "utf-8");
  await fs.writeFile(
    path.join(generatedDir, "context-pack.md"),
    exportContextPack(graph, config),
    "utf-8"
  );

  const syncResult = await syncProtocolFromScan(root, scan, config.modules);
  if (syncResult.apiUpdated) {
    log("info", "Updated .repograph/api.yml from scan");
  }
  if (syncResult.databaseUpdated) {
    log("info", "Updated .repograph/database.yml from scan");
  }

  log("info", `Scan complete (${scan.analyzer}): ${graph.stats.fileCount} files, ${graph.stats.moduleCount} modules`);
  log("info", `Dependencies: ${graph.stats.dependencyCount}, Unmapped: ${graph.stats.unmappedFiles}`);
  if (graph.violations.length > 0) {
    log("warn", `Violations found: ${graph.violations.length} (run 'repograph check' for details)`);
  }
  log("info", `Output written to .repograph/generated/`);
}

export async function scanCommand(): Promise<void> {
  await scanRepositoryAndWrite();
}
