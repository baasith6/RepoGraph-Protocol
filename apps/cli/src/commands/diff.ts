import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { diffGraphs, formatGraphDiff, type RepoGraph } from "@repograph/graph-core";
import { log } from "@repograph/shared";
import { getRoot } from "../context.js";
import { scanRepositoryAndWrite } from "./scan.js";

interface DiffOptions {
  base?: string;
  head?: string;
  output?: string;
}

function gitRefExists(ref: string, root: string): boolean {
  try {
    execSync(`git rev-parse --verify ${ref}`, { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function loadGraphFromGitRef(root: string, ref: string): Promise<RepoGraph | null> {
  const graphPath = ".repograph/generated/graph.json";
  try {
    const content = execSync(`git show ${ref}:${graphPath}`, {
      cwd: root,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(content) as RepoGraph;
  } catch {
    return null;
  }
}

export async function diffCommand(options: DiffOptions): Promise<void> {
  const root = getRoot();
  const baseRef = options.base ?? "main";
  const headRef = options.head ?? "HEAD";

  if (!gitRefExists("HEAD", root)) {
    log("error", "Not a git repository or no commits found.");
    process.exit(1);
  }

  let headGraph = await loadGraphFromGitRef(root, headRef);
  if (!headGraph) {
    log("info", "Head graph not in git; scanning current workspace...");
    await scanRepositoryAndWrite();
    const content = await fs.readFile(
      path.join(root, ".repograph/generated/graph.json"),
      "utf-8"
    );
    headGraph = JSON.parse(content) as RepoGraph;
  }

  let baseGraph = await loadGraphFromGitRef(root, baseRef);
  if (!baseGraph) {
    if (!gitRefExists(baseRef, root)) {
      log("error", `Base ref '${baseRef}' not found.`);
      process.exit(1);
    }
    log("info", `Base graph not committed at ${baseRef}; run 'repograph scan' on ${baseRef} and commit graph.json for accurate diffs.`);
    baseGraph = {
      version: "0.1.0",
      generatedAt: "",
      project: headGraph.project,
      nodes: [],
      edges: [],
      violations: [],
      stats: {
        fileCount: 0,
        moduleCount: 0,
        layerCount: 0,
        dependencyCount: 0,
        unmappedFiles: 0,
        violationCount: 0,
      },
    };
  }

  const diff = diffGraphs(baseGraph, headGraph, baseRef, headRef);
  const formatted = formatGraphDiff(diff);

  if (options.output) {
    await fs.writeFile(options.output, formatted, "utf-8");
    log("info", `Diff written to ${options.output}`);
  } else {
    console.log(formatted);
  }

  if (diff.newViolations.length > 0) {
    log("error", `${diff.newViolations.length} new violation(s) introduced`);
    process.exit(1);
  }
}
