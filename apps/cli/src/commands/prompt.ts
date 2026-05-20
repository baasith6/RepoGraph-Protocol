import fs from "node:fs/promises";
import type { ContextMode } from "@repograph/context-engine";
import { exportPrompt } from "@repograph/exporter-markdown";
import { log } from "@repograph/shared";
import { loadConfig, loadGraph } from "../context.js";

interface PromptOptions {
  output?: string;
  mode?: ContextMode;
}

export async function promptCommand(task: string, options: PromptOptions): Promise<void> {
  const config = await loadConfig();
  const graph = await loadGraph();
  const mode =
    options.mode === "short" || options.mode === "strict" ? options.mode : "full";
  const content = exportPrompt(graph, config, task, mode);

  if (options.output) {
    await fs.writeFile(options.output, content, "utf-8");
    log("info", `Prompt written to ${options.output}`);
  } else {
    console.log(content);
  }
}
