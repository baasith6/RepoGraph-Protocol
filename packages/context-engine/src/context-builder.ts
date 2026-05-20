import type { RepoGraph } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";
import {
  parseApiBlocks,
  parseArchitectureRules,
  parseOwnership,
  parseRiskEntries,
  parseTests,
} from "./config-parse.js";
import { getApisForModule } from "./graph-utils.js";
import { selectModuleFiles, getModeLimits } from "./file-selector.js";
import { resolveTaskModules } from "./module-resolver.js";
import { matchGlobPattern } from "./paths.js";
import type { ContextMode, TaskContext, TaskContextOptions } from "./types.js";

function filterRulesForModules(
  rules: Array<{ id: string; description: string }>,
  moduleNames: string[]
): Array<{ id: string; description: string }> {
  if (moduleNames.length === 0) return rules.slice(0, 20);
  const lower = moduleNames.map((m) => m.toLowerCase());
  const filtered = rules.filter((r) => {
    const hay = `${r.id} ${r.description}`.toLowerCase();
    return lower.some((m) => hay.includes(m));
  });
  return (filtered.length > 0 ? filtered : rules).slice(0, 25);
}

function filterRisksForFiles(
  risks: Array<{ path: string; risk: string; reason?: string }>,
  files: string[],
  moduleNames: string[]
): Array<{ path: string; risk: string; reason?: string }> {
  const out: Array<{ path: string; risk: string; reason?: string }> = [];
  for (const r of risks) {
    const matchesFile = files.some((f) => matchGlobPattern(f, r.path));
    const matchesModule = moduleNames.some((m) => r.path.toLowerCase().includes(m.toLowerCase()));
    if (matchesFile || matchesModule) out.push(r);
  }
  return out.slice(0, 30);
}

function resolveOwnersForModules(
  config: RepographConfig,
  moduleNames: string[]
): string[] {
  const owners = parseOwnership(config);
  const reviewers = new Set<string>();
  for (const [, def] of Object.entries(owners)) {
    const mods = def.modules ?? [];
    if (mods.some((m) => moduleNames.includes(m))) {
      for (const member of def.members ?? []) {
        reviewers.add(member);
      }
    }
  }
  return [...reviewers];
}

function collectApis(
  graph: RepoGraph,
  config: RepographConfig,
  moduleNames: string[]
): TaskContext["apis"] {
  const fromConfig = parseApiBlocks(config);
  const apis: TaskContext["apis"] = [];

  for (const block of fromConfig) {
    if (!moduleNames.includes(block.module)) continue;
    for (const ep of block.endpoints) {
      apis.push({
        method: ep.method,
        path: ep.path,
        module: block.module,
        handler: ep.handler,
      });
    }
  }

  if (apis.length === 0) {
    for (const name of moduleNames) {
      for (const api of getApisForModule(graph, name)) {
        apis.push({
          method: api.method,
          path: api.path,
          module: name,
          handler: api.handler,
        });
      }
    }
  }

  return apis.slice(0, 30);
}

function collectTests(
  config: RepographConfig,
  moduleNames: string[]
): TaskContext["tests"] {
  return parseTests(config).filter((t) => moduleNames.includes(t.module));
}

export function buildTaskContext(
  task: string,
  graph: RepoGraph,
  config: RepographConfig,
  options: TaskContextOptions = {}
): TaskContext {
  const mode: ContextMode = options.mode ?? "full";
  const { maxModules } = getModeLimits(mode);
  const limit = options.maxModules ?? maxModules;

  const { modules, warnings } = resolveTaskModules(task, config, graph, limit);
  const moduleNames = modules.map((m) => m.name);
  const files = selectModuleFiles(graph, modules, config, mode);
  const excludePaths = (config.ai?.ai as { exclude_paths?: string[] } | undefined)?.exclude_paths ?? [];

  const rules = filterRulesForModules(parseArchitectureRules(config), moduleNames);
  const risks = filterRisksForFiles(parseRiskEntries(config), files, moduleNames);
  const tests = collectTests(config, moduleNames);
  const apis = collectApis(graph, config, moduleNames);
  const owners = resolveOwnersForModules(config, moduleNames);

  const suggestedTests: string[] = [];
  for (const t of tests) {
    for (const p of t.paths) {
      suggestedTests.push(p);
    }
  }
  if (suggestedTests.length === 0 && moduleNames.length > 0) {
    for (const name of moduleNames) {
      suggestedTests.push(`Add or update tests for module ${name} related to: ${task}`);
    }
  }

  return {
    task,
    mode,
    modules,
    files,
    rules,
    risks,
    tests,
    apis,
    owners,
    excludePaths,
    warnings,
    suggestedTests: suggestedTests.slice(0, 20),
  };
}

export function buildGeneralContext(
  graph: RepoGraph,
  config: RepographConfig,
  mode: ContextMode = "short"
): TaskContext {
  return buildTaskContext("general development and maintenance", graph, config, { mode });
}
