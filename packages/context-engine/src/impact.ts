import type { RepoGraph } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";
import {
  parseApiBlocks,
  parseModules,
  parseOwnership,
  parseRiskEntries,
  parseTests,
} from "./config-parse.js";
import {
  findFileNode,
  fileNodeId,
  getApisForFile,
  getModuleForFile,
  getApisForModule,
} from "./graph-utils.js";
import { selectImpactFiles, getModeLimits } from "./file-selector.js";
import { isExcludedPath, matchGlobPattern } from "./paths.js";
import type { ContextMode, ImpactReport } from "./types.js";

function resolveModuleRisk(
  config: RepographConfig,
  moduleName: string | undefined,
  filePath: string
): string | undefined {
  const modules = parseModules(config);
  const mod = modules.find((m) => m.name === moduleName);
  if (mod?.risk) return mod.risk;
  if (mod?.critical) return "high";

  const risks = parseRiskEntries(config);
  for (const r of risks) {
    if (matchGlobPattern(filePath, r.path)) return r.risk;
  }
  return undefined;
}

function resolveReviewers(config: RepographConfig, moduleName?: string): string[] {
  if (!moduleName) return [];
  const owners = parseOwnership(config);
  const reviewers = new Set<string>();
  for (const [, def] of Object.entries(owners)) {
    if ((def.modules ?? []).includes(moduleName)) {
      for (const m of def.members ?? []) reviewers.add(m);
    }
  }
  return [...reviewers];
}

function collectApisForImpact(
  graph: RepoGraph,
  config: RepographConfig,
  moduleName: string | undefined,
  filePath: string
): ImpactReport["affectedApis"] {
  const fromFile = getApisForFile(graph, filePath);
  if (fromFile.length > 0) {
    return fromFile.map((a) => ({ method: a.method, path: a.path, handler: a.handler }));
  }

  if (moduleName) {
    const fromGraph = getApisForModule(graph, moduleName);
    if (fromGraph.length > 0) {
      return fromGraph.slice(0, 20).map((a) => ({
        method: a.method,
        path: a.path,
        handler: a.handler,
      }));
    }
  }

  if (!moduleName) return [];
  const blocks = parseApiBlocks(config);
  const block = blocks.find((b) => b.module === moduleName);
  return (block?.endpoints ?? []).slice(0, 20).map((ep) => ({
    method: ep.method,
    path: ep.path,
    handler: ep.handler,
  }));
}

export function analyzeImpactRich(
  graph: RepoGraph,
  config: RepographConfig,
  filePath: string,
  mode: ContextMode = "full"
): ImpactReport {
  const normalized = filePath.replace(/\\/g, "/");
  const fileNode = findFileNode(graph, normalized);

  if (!fileNode) {
    return {
      file: normalized,
      fileFound: false,
      affectedFiles: [],
      reverseDependents: [],
      forwardDependencies: [],
      affectedApis: [],
      relatedTests: [],
      reviewers: [],
      aiContextFiles: [],
      summary: `File "${normalized}" not found in graph. Run 'repograph scan' first.`,
    };
  }

  const fileId = fileNodeId(fileNode);
  const moduleName = getModuleForFile(graph, fileId);
  const { reverseDependents, forwardDependencies, allAffected } = selectImpactFiles(
    graph,
    normalized,
    config,
    mode
  );

  const relatedTests = moduleName
    ? parseTests(config).filter((t) => t.module === moduleName)
    : [];

  const affectedApis = collectApisForImpact(graph, config, moduleName, normalized);
  const reviewers = resolveReviewers(config, moduleName);
  const riskLevel = resolveModuleRisk(config, moduleName, normalized);

  const aiContextFiles = allAffected
    .filter((f) => !isExcludedPath(f, (config.ai?.ai as { exclude_paths?: string[] })?.exclude_paths ?? []))
    .slice(0, getModeLimits(mode).maxFiles);

  const lines: string[] = [];
  lines.push(`Impact Analysis: ${fileNode.label}`);
  lines.push("");
  if (moduleName) lines.push(`Module: ${moduleName}`);
  if (riskLevel) lines.push(`Risk: ${riskLevel}`);
  if (reviewers.length) lines.push(`Review required from: ${reviewers.join(", ")}`);
  lines.push("");
  if (reverseDependents.length) {
    lines.push("Reverse dependents (may break):");
    for (const f of reverseDependents) lines.push(`  - ${f}`);
    lines.push("");
  }
  if (forwardDependencies.length) {
    lines.push("Dependencies:");
    for (const f of forwardDependencies) lines.push(`  - ${f}`);
    lines.push("");
  }
  if (allAffected.length) {
    lines.push("Affected files:");
    for (const f of allAffected) lines.push(`  - ${f}`);
    lines.push("");
  }
  if (affectedApis.length) {
    lines.push("Affected APIs:");
    for (const a of affectedApis) {
      const handler = a.handler ? ` (${a.handler})` : "";
      lines.push(`  - ${a.method} ${a.path}${handler}`);
    }
    lines.push("");
  }
  if (relatedTests.length) {
    lines.push("Required tests:");
    for (const t of relatedTests) {
      for (const p of t.paths) lines.push(`  - ${p}`);
    }
    lines.push("");
  }
  if (aiContextFiles.length) {
    lines.push("AI context files:");
    for (const f of aiContextFiles) lines.push(`  - ${f}`);
  }

  return {
    file: fileNode.label,
    fileFound: true,
    module: moduleName,
    moduleRisk: riskLevel,
    affectedFiles: allAffected,
    reverseDependents,
    forwardDependencies,
    affectedApis,
    relatedTests,
    reviewers,
    riskLevel,
    aiContextFiles,
    summary: lines.join("\n"),
  };
}

export function formatImpactReport(report: ImpactReport): string {
  return report.summary;
}

export function formatImpactReportJson(report: ImpactReport): string {
  return JSON.stringify(report, null, 2);
}
