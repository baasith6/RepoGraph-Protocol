import path from "node:path";
import fs from "node:fs/promises";
import type { RepoGraph } from "@repograph/graph-core";
import { loadRepographConfig, getGeneratedDir, repographExists } from "@repograph/shared";

export function getRoot(): string {
  return process.cwd();
}

export async function loadConfig() {
  const root = getRoot();
  if (!(await repographExists(root))) {
    throw new Error("No .repograph directory found. Run 'repograph init' first.");
  }
  return loadRepographConfig(root);
}

export async function loadGraph(): Promise<RepoGraph> {
  const root = getRoot();
  const graphPath = path.join(getGeneratedDir(root), "graph.json");
  try {
    const content = await fs.readFile(graphPath, "utf-8");
    return JSON.parse(content) as RepoGraph;
  } catch {
    throw new Error("No graph found. Run 'repograph scan' first.");
  }
}
