import fs from "node:fs/promises";
import { exportPrompt } from "@repograph/exporter-markdown";
import { log } from "@repograph/shared";
import { loadConfig, loadGraph } from "../context.js";

interface PromptOptions {
  output?: string;
}

export async function promptCommand(task: string, options: PromptOptions): Promise<void> {
  const config = await loadConfig();
  const graph = await loadGraph();
  const content = exportPrompt(graph, config, task);

  if (options.output) {
    await fs.writeFile(options.output, content, "utf-8");
    log("info", `Prompt written to ${options.output}`);
  } else {
    console.log(content);
  }
}
