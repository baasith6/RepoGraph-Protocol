import { validateRepographDir } from "@repograph/protocol";
import { getRepographDir, log, repographExists } from "@repograph/shared";
import { getRoot } from "../context.js";

export async function validateCommand(): Promise<void> {
  const root = getRoot();

  if (!(await repographExists(root))) {
    log("error", "No .repograph directory found. Run 'repograph init' first.");
    process.exit(1);
  }

  const result = await validateRepographDir(getRepographDir(root));

  if (result.valid) {
    log("info", "All configuration files are valid.");
    return;
  }

  for (const err of result.errors) {
    const location = err.path ? `${err.file}${err.path}` : err.file;
    log("error", `${location}: ${err.message}`);
  }

  process.exit(1);
}
