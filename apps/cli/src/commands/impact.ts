import {
  analyzeImpactRich,
  formatImpactReportJson,
  type ContextMode,
} from "@repograph/context-engine";
import { analyzeImpact } from "@repograph/rule-engine";
import { loadConfig, loadGraph } from "../context.js";

function parseMode(mode: string | undefined): ContextMode {
  if (mode === "short" || mode === "strict") return mode;
  return "full";
}

interface ImpactOptions {
  json?: boolean;
  mode?: ContextMode;
}

export async function impactCommand(file: string, options: ImpactOptions): Promise<void> {
  const config = await loadConfig();
  const graph = await loadGraph();
  const mode = parseMode(options.mode);

  if (options.json) {
    const report = analyzeImpactRich(graph, config, file, mode);
    console.log(formatImpactReportJson(report));
    return;
  }

  console.log(analyzeImpact(graph, config, file, mode));
}
