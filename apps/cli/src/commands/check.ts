import { checkArchitectureRules, getEnforcementMode } from "@repograph/rule-engine";
import { log } from "@repograph/shared";
import { loadConfig, loadGraph } from "../context.js";

interface CheckOptions {
  strict?: boolean;
}

export async function checkCommand(options: CheckOptions): Promise<void> {
  const config = await loadConfig();
  const graph = await loadGraph();

  const mode = options.strict ? "strict" : getEnforcementMode(config);
  const result = checkArchitectureRules(graph, config, mode);

  if (result.violations.length === 0) {
    log("info", "All architecture checks passed.");
    return;
  }

  for (const v of result.violations) {
    log(v.severity === "warning" ? "warn" : "error", `[${v.ruleId}] ${v.message}`);
  }

  if (!result.passed) {
    log("error", `Check failed: ${result.violations.length} violation(s)`);
    process.exit(1);
  }

  log("info", "Checks passed with warnings only.");
}
