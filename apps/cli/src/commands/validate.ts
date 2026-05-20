import { validateRepographDir } from "@repograph/protocol";
import { checkGraphDrift } from "@repograph/scanner-core";
import { getRepographDir, log, repographExists } from "@repograph/shared";
import { getRoot } from "../context.js";

export interface ValidateOptions {
  strict?: boolean;
}

export async function validateCommand(options: ValidateOptions = {}): Promise<void> {
  const root = getRoot();

  if (!(await repographExists(root))) {
    log("error", "No .repograph directory found. Run 'repograph init' first.");
    process.exit(1);
  }

  const result = await validateRepographDir(getRepographDir(root));

  if (!result.valid) {
    for (const err of result.errors) {
      const location = err.path ? `${err.file}${err.path}` : err.file;
      log("error", `${location}: ${err.message}`);
    }
    process.exit(1);
  }

  log("info", "All configuration files are valid.");

  const drift = await checkGraphDrift(root);
  if (drift.drifted) {
    log("warn", drift.message ?? "Graph is out of date.");
    if (options.strict) {
      process.exit(1);
    }
  } else if (drift.message && !drift.drifted) {
    log("info", drift.message);
  }
}
