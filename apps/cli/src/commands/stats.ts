import { loadGraph } from "../context.js";

export async function statsCommand(): Promise<void> {
  const graph = await loadGraph();
  const s = graph.stats;

  console.log("Repository Stats");
  console.log("================");
  console.log(`Files:          ${s.fileCount}`);
  console.log(`Modules:        ${s.moduleCount}`);
  console.log(`Layers:         ${s.layerCount}`);
  console.log(`Dependencies:   ${s.dependencyCount}`);
  console.log(`Unmapped files: ${s.unmappedFiles}`);
  console.log(`Violations:     ${s.violationCount}`);
}
