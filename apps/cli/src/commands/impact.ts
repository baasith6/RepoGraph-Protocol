import { analyzeImpact } from "@repograph/rule-engine";
import { loadConfig, loadGraph } from "../context.js";

export async function impactCommand(file: string): Promise<void> {
  const config = await loadConfig();
  const graph = await loadGraph();
  console.log(analyzeImpact(graph, config, file));
}
