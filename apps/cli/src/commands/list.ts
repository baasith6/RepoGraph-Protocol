import { loadConfig, loadGraph } from "../context.js";

export async function listCommand(type: string): Promise<void> {
  const config = await loadConfig();
  const graph = await loadGraph();

  switch (type) {
    case "modules": {
      const modules = (config.modules?.modules ?? []) as Array<{ name: string; critical?: boolean }>;
      for (const mod of modules) {
        const critical = mod.critical ? " [critical]" : "";
        console.log(`  ${mod.name}${critical}`);
      }
      break;
    }
    case "layers": {
      const layers = config.architecture?.layers as Record<string, { path: string }> | undefined;
      if (!layers) {
        console.log("  No layers defined.");
        break;
      }
      for (const [name, layer] of Object.entries(layers)) {
        console.log(`  ${name} (${layer.path})`);
      }
      break;
    }
    case "violations": {
      if (graph.violations.length === 0) {
        console.log("  No violations.");
        break;
      }
      for (const v of graph.violations) {
        console.log(`  [${v.severity}] ${v.ruleId}: ${v.message}`);
      }
      break;
    }
    default:
      console.error(`Unknown list type: ${type}. Use: modules, layers, violations`);
      process.exit(1);
  }
}
