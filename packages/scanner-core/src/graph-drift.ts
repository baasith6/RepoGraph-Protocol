import fs from "node:fs/promises";
import path from "node:path";
import { getGeneratedDir } from "@repograph/shared";
import { computeScanSignature } from "./scan-signature.js";

export interface GraphDriftResult {
  drifted: boolean;
  /** True when graph.json is missing or cannot be read/parsed */
  unavailable?: boolean;
  message?: string;
  storedSignature?: string;
  currentSignature?: string;
}

function errnoCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    return (err as NodeJS.ErrnoException).code;
  }
  return undefined;
}

export async function checkGraphDrift(root: string): Promise<GraphDriftResult> {
  const graphPath = path.join(getGeneratedDir(root), "graph.json");
  let graph: { stats?: { scanSignature?: string } };
  try {
    const raw = await fs.readFile(graphPath, "utf-8");
    try {
      graph = JSON.parse(raw) as { stats?: { scanSignature?: string } };
    } catch (parseErr) {
      return {
        drifted: false,
        unavailable: true,
        message: `Could not parse graph.json: ${
          parseErr instanceof Error ? parseErr.message : String(parseErr)
        }`,
      };
    }
  } catch (err) {
    if (errnoCode(err) === "ENOENT") {
      return {
        drifted: false,
        unavailable: true,
        message: "No graph.json found. Run 'repograph scan' to generate it.",
      };
    }
    return {
      drifted: false,
      unavailable: true,
      message: `Could not read graph.json: ${err instanceof Error ? err.message : String(err)}`,
    };
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
