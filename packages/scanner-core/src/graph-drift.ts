import fs from "node:fs/promises";
import path from "node:path";
import { getGeneratedDir } from "@repograph/shared";
import { computeScanSignature } from "./scan-signature.js";

export interface GraphDriftResult {
  drifted: boolean;
  message?: string;
  storedSignature?: string;
  currentSignature?: string;
}

export async function checkGraphDrift(root: string): Promise<GraphDriftResult> {
  const graphPath = path.join(getGeneratedDir(root), "graph.json");
  let graph: { stats?: { scanSignature?: string } };
  try {
    const raw = await fs.readFile(graphPath, "utf-8");
    graph = JSON.parse(raw) as { stats?: { scanSignature?: string } };
  } catch {
    return { drifted: false };
  }

  const stored = graph.stats?.scanSignature;
  if (!stored) {
    return {
      drifted: false,
      message: "No scan signature in graph.json (run repograph scan).",
    };
  }

  const current = await computeScanSignature(root);
  if (stored === current) {
    return { drifted: false, storedSignature: stored, currentSignature: current };
  }

  return {
    drifted: true,
    storedSignature: stored,
    currentSignature: current,
    message:
      "Repository changed since last scan. Run 'repograph scan' to refresh graph.json.",
  };
}
