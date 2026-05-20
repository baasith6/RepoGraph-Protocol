import {
  explainFile,
  explainModule,
  explainProject,
} from "@repograph/rule-engine";
import { loadConfig, loadGraph } from "../context.js";

interface ExplainOptions {
  module?: string;
  file?: string;
}

export async function explainCommand(
  target: string | undefined,
  options: ExplainOptions
): Promise<void> {
  const config = await loadConfig();
  const graph = await loadGraph();

  let output: string;

  if (options.module) {
    output = explainModule(graph, options.module);
  } else if (options.file) {
    output = explainFile(graph, options.file);
  } else if (target?.startsWith("module ")) {
    output = explainModule(graph, target.replace("module ", ""));
  } else if (target?.startsWith("file ")) {
    output = explainFile(graph, target.replace("file ", ""));
  } else {
    output = explainProject(graph, config);
  }

  console.log(output);
}
