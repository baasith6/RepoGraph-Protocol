import fs from "node:fs/promises";
import path from "node:path";
import { exportMermaid, type DiagramType } from "@repograph/exporter-mermaid";
import { getGeneratedDir, log } from "@repograph/shared";
import { loadGraph, getRoot } from "../context.js";

interface VisualizeOptions {
  format: string;
  type: string;
}

export async function visualizeCommand(options: VisualizeOptions): Promise<void> {
  const graph = await loadGraph();
  const diagramType = (options.type ?? "all") as DiagramType;

  if (options.format !== "mermaid") {
    log("error", `Unsupported format: ${options.format}. Use: mermaid`);
    process.exit(1);
  }

  const output = exportMermaid(graph, diagramType);
  console.log(output);

  const root = getRoot();
  const outPath = path.join(getGeneratedDir(root), "graph.mmd");
  await fs.writeFile(outPath, output, "utf-8");
  log("info", `Written to ${outPath}`);
}
