import fs from "node:fs/promises";
import path from "node:path";
import { validateRepographDir } from "@repograph/protocol";
import { getRepographDir, getGeneratedDir, log, repographExists } from "@repograph/shared";
import { getRoot } from "../context.js";

export async function doctorCommand(): Promise<void> {
  const root = getRoot();
  let healthy = true;

  if (!(await repographExists(root))) {
    log("error", ".repograph directory missing");
    process.exit(1);
  }

  const repographDir = getRepographDir(root);
  const requiredFiles = ["project.yml", "modules.yml", "architecture.yml"];

  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(repographDir, file));
      log("info", `OK: ${file}`);
    } catch {
      log("error", `Missing: ${file}`);
      healthy = false;
    }
  }

  const validation = await validateRepographDir(repographDir);
  if (validation.valid) {
    log("info", "OK: schema validation");
  } else {
    log("error", `Schema validation failed (${validation.errors.length} errors)`);
    healthy = false;
  }

  const generatedDir = getGeneratedDir(root);
  try {
    await fs.access(generatedDir);
    const testFile = path.join(generatedDir, ".write-test");
    await fs.writeFile(testFile, "");
    await fs.unlink(testFile);
    log("info", "OK: generated/ is writable");
  } catch {
    log("error", "generated/ directory not writable");
    healthy = false;
  }

  try {
    await fs.access(path.join(generatedDir, "graph.json"));
    log("info", "OK: graph.json exists (run scan to refresh)");
  } catch {
    log("warn", "graph.json not found - run 'repograph scan'");
  }

  if (!healthy) {
    process.exit(1);
  }

  log("info", "RepoGraph setup is healthy.");
}
