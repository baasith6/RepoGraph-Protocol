import type { RepoGraph } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";
import {
  parseApiBlocks,
  parseGlossary,
  parseModules,
  type ModuleDef,
} from "./config-parse.js";
import { tokenizeTask } from "./paths.js";
import type { ScoredModule } from "./types.js";

function scoreModuleAgainstTokens(mod: ModuleDef, tokens: string[]): number {
  let score = 0;
  const nameLower = mod.name.toLowerCase();
  const descLower = (mod.description ?? "").toLowerCase();

  for (const token of tokens) {
    if (nameLower === token) score += 10;
    else if (nameLower.includes(token)) score += 6;
    else if (descLower.includes(token)) score += 3;

    for (const p of mod.paths ?? []) {
      if (p.toLowerCase().includes(token)) score += 2;
    }
  }

  if (mod.critical) score += 0.5;
  return score;
}

function scoreFromGlossary(
  tokens: string[],
  glossary: ReturnType<typeof parseGlossary>
): Map<string, number> {
  const extra = new Map<string, number>();
  for (const entry of glossary) {
    const termLower = entry.term.toLowerCase();
    const matched = tokens.some(
      (t) => termLower.includes(t) || t.includes(termLower) || termLower === t
    );
    if (!matched) continue;

    const related = entry.related_modules ?? (entry.module ? [entry.module] : []);
    for (const modName of related) {
      extra.set(modName, (extra.get(modName) ?? 0) + 5);
    }
    if (entry.module) {
      extra.set(entry.module, (extra.get(entry.module) ?? 0) + 4);
    }
  }
  return extra;
}

function scoreFromApi(
  tokens: string[],
  apiBlocks: ReturnType<typeof parseApiBlocks>
): Map<string, number> {
  const extra = new Map<string, number>();
  for (const block of apiBlocks) {
    for (const ep of block.endpoints) {
      const hay = `${ep.path} ${ep.handler ?? ""} ${ep.description ?? ""}`.toLowerCase();
      for (const token of tokens) {
        if (hay.includes(token)) {
          extra.set(block.module, (extra.get(block.module) ?? 0) + 4);
        }
      }
    }
  }
  return extra;
}

export function resolveTaskModules(
  task: string,
  config: RepographConfig,
  _graph: RepoGraph,
  maxModules = 3
): { modules: ScoredModule[]; warnings: string[] } {
  const modules = parseModules(config);
  const tokens = tokenizeTask(task);
  const warnings: string[] = [];

  if (modules.length === 0) {
    return { modules: [], warnings: ["No modules defined in modules.yml"] };
  }

  const glossaryBoost = scoreFromGlossary(tokens, parseGlossary(config));
  const apiBoost = scoreFromApi(tokens, parseApiBlocks(config));

  const scored: ScoredModule[] = modules
    .map((mod) => {
      let score = scoreModuleAgainstTokens(mod, tokens);
      score += glossaryBoost.get(mod.name) ?? 0;
      score += apiBoost.get(mod.name) ?? 0;
      return {
        name: mod.name,
        score,
        description: mod.description,
        critical: mod.critical,
      };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const critical = modules.filter((m) => m.critical);
    const fallback = (critical.length > 0 ? critical : modules.slice(0, 2)).map((mod) => ({
      name: mod.name,
      score: 0,
      description: mod.description,
      critical: mod.critical,
    }));
    warnings.push(
      "No modules matched the task keywords; using critical modules or first modules as fallback."
    );
    return { modules: fallback.slice(0, maxModules), warnings };
  }

  return { modules: scored.slice(0, maxModules), warnings };
}
