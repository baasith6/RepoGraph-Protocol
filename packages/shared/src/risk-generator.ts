import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { getRepographDir, normalizePath } from "./paths.js";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskEntry {
  path: string;
  risk: RiskLevel;
  reason?: string;
}

export interface RiskDoc {
  risks?: RiskEntry[];
}

export interface RiskSignalsInputGraph {
  nodes: Array<{ id: string; type: string; label: string }>;
  edges: Array<{ type: string; source?: string; target?: string; from?: string; to?: string }>;
}

function clampRisk(score: number): RiskLevel {
  if (score >= 9) return "critical";
  if (score >= 6) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function scorePathHeuristics(p: string): { score: number; reason: string[] } {
  const reasons: string[] = [];
  const s = p.toLowerCase();
  let score = 0;

  const bump = (n: number, why: string) => {
    score += n;
    reasons.push(why);
  };

  if (s.includes("auth") || s.includes("identity") || s.includes("login")) bump(3, "auth/identity path");
  if (s.includes("payment") || s.includes("billing") || s.includes("invoice")) bump(4, "payment/billing path");
  if (s.includes("migrations") || s.includes("migration")) bump(4, "db migrations path");
  if (s.includes("infrastructure") || s.includes("infra")) bump(2, "infrastructure path");
  if (s.includes("secrets") || s.includes("keyvault") || s.includes(".env")) bump(6, "secrets path");
  if (s.includes(".github/workflows")) bump(3, "CI workflow");

  const ext = path.extname(s);
  if (ext === ".sql") bump(4, "SQL file");
  if (ext === ".tf" || ext === ".bicep") bump(3, "IaC file");
  if (ext === ".csproj" || ext === ".sln") bump(2, "project file");

  return { score, reason: reasons };
}

function computeCentrality(graph: RiskSignalsInputGraph): Map<string, number> {
  const fileNodes = new Set<string>();
  const idToPath = new Map<string, string>();
  for (const n of graph.nodes) {
    if (n.type === "FILE") {
      fileNodes.add(n.id);
      idToPath.set(n.id, normalizePath(n.label));
    }
  }

  const indegree = new Map<string, number>();
  const outdegree = new Map<string, number>();

  for (const e of graph.edges) {
    const type = e.type;
    if (type !== "DEPENDS_ON") continue;
    const src = (e.source ?? e.from) as string | undefined;
    const dst = (e.target ?? e.to) as string | undefined;
    if (!src || !dst) continue;
    if (!fileNodes.has(src) || !fileNodes.has(dst)) continue;
    indegree.set(dst, (indegree.get(dst) ?? 0) + 1);
    outdegree.set(src, (outdegree.get(src) ?? 0) + 1);
  }

  const centrality = new Map<string, number>();
  for (const id of fileNodes) {
    const inD = indegree.get(id) ?? 0;
    const outD = outdegree.get(id) ?? 0;
    // Fan-in weighted a bit higher (shared libraries tend to be higher risk).
    centrality.set(idToPath.get(id) ?? id, inD * 2 + outD);
  }
  return centrality;
}

function tryGitChurn(root: string): Map<string, number> {
  const churn = new Map<string, number>();
  try {
    const out = execSync("git log --name-only --since=90.days", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    for (const line of out.split(/\r?\n/)) {
      const p = normalizePath(line.trim());
      if (!p || p.startsWith("commit ") || p.startsWith("Author:") || p.startsWith("Date:")) continue;
      churn.set(p, (churn.get(p) ?? 0) + 1);
    }
  } catch {
    // git unavailable or not a repo; skip churn signal
  }
  return churn;
}

function mergeWithOverrides(computed: RiskEntry[], existing: RiskDoc | null): RiskEntry[] {
  const overrides = new Map<string, RiskEntry>();
  for (const e of existing?.risks ?? []) {
    overrides.set(normalizePath(e.path), e);
  }
  const out: RiskEntry[] = [];
  const seen = new Set<string>();
  for (const c of computed) {
    const key = normalizePath(c.path);
    if (overrides.has(key)) {
      out.push(overrides.get(key)!);
    } else {
      out.push(c);
    }
    seen.add(key);
  }
  // Add overrides that computed didn't emit.
  for (const [k, v] of overrides.entries()) {
    if (!seen.has(k)) out.push(v);
  }
  // stable order
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

export async function generateRiskYamlFromGraph(root: string, graph: RiskSignalsInputGraph): Promise<{ updated: boolean }> {
  const repographDir = getRepographDir(root);
  const riskPath = path.join(repographDir, "risk.yml");

  const existingRaw = await (async () => {
    try {
      return await fs.readFile(riskPath, "utf-8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  })();
  const existingDoc = existingRaw ? (parseYaml(existingRaw) as RiskDoc) : null;

  const centrality = computeCentrality(graph);
  const churn = tryGitChurn(root);

  // Select candidates: files that are central or match heuristic risky paths.
  const candidates = new Set<string>();
  for (const p of centrality.keys()) candidates.add(p);
  for (const p of churn.keys()) candidates.add(p);

  const computed: RiskEntry[] = [];
  for (const p of candidates) {
    const pathScore = scorePathHeuristics(p);
    const cScore = centrality.get(p) ?? 0;
    const churnScore = churn.get(p) ?? 0;

    let score = pathScore.score;
    const reasons = [...pathScore.reason];

    if (cScore >= 20) {
      score += 4;
      reasons.push(`high centrality (fan-in/out=${cScore})`);
    } else if (cScore >= 10) {
      score += 2;
      reasons.push(`medium centrality (fan-in/out=${cScore})`);
    } else if (cScore >= 4) {
      score += 1;
      reasons.push(`central file (fan-in/out=${cScore})`);
    }

    if (churnScore >= 25) {
      score += 3;
      reasons.push(`high churn (90d commits touching file=${churnScore})`);
    } else if (churnScore >= 10) {
      score += 1;
      reasons.push(`churn (90d commits touching file=${churnScore})`);
    }

    const risk = clampRisk(score);
    // Keep noise low: only emit medium+ unless file had explicit path reasons.
    if (risk === "low" && reasons.length === 0) continue;

    computed.push({
      path: p,
      risk,
      reason: reasons.join("; ") || undefined,
    });
  }

  const merged = mergeWithOverrides(computed, existingDoc);
  const doc: RiskDoc = { risks: merged };
  const next = stringifyYaml(doc, { lineWidth: 0 });
  const updated = next !== (existingRaw ?? "");
  if (updated) {
    await fs.mkdir(repographDir, { recursive: true });
    await fs.writeFile(riskPath, next, "utf-8");
  }
  return { updated };
}

