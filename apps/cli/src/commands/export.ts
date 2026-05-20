import fs from "node:fs/promises";
import path from "node:path";
import { exportClaudeContext } from "@repograph/exporter-claude";
import { exportCopilotInstructions } from "@repograph/exporter-copilot";
import { exportCursorRules } from "@repograph/exporter-cursor";
import { exportJson } from "@repograph/exporter-json";
import { exportMermaid } from "@repograph/exporter-mermaid";
import { exportContextPack } from "@repograph/exporter-markdown";
import { log } from "@repograph/shared";
import { loadConfig, loadGraph, getRoot } from "../context.js";

interface ExportOptions {
  format: string;
  output?: string;
  task?: string;
}

export async function exportCommand(options: ExportOptions): Promise<void> {
  const config = await loadConfig();
  const graph = await loadGraph();
  const root = getRoot();

  let content: string;
  let defaultPath: string;

  switch (options.format) {
    case "json":
      content = exportJson(graph);
      defaultPath = ".repograph/generated/graph.json";
      break;
    case "markdown":
      content = exportContextPack(graph, config);
      defaultPath = ".repograph/generated/context-pack.md";
      break;
    case "mermaid":
      content = exportMermaid(graph);
      defaultPath = ".repograph/generated/graph.mmd";
      break;
    case "cursor":
      content = exportCursorRules(graph, config);
      defaultPath = ".cursor/rules/repograph.mdc";
      break;
    case "claude":
      content = exportClaudeContext(graph, config, { task: options.task });
      defaultPath = "CLAUDE.md";
      break;
    case "copilot":
      content = exportCopilotInstructions(graph, config, { task: options.task });
      defaultPath = ".github/copilot-instructions.md";
      break;
    default:
      log(
        "error",
        `Unknown format: ${options.format}. Use: json, markdown, mermaid, cursor, claude, copilot`
      );
      process.exit(1);
  }

  const outPath = options.output ?? path.join(root, defaultPath);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, content, "utf-8");

  log("info", `Exported to ${outPath}`);
}
