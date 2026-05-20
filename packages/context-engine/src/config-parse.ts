import type { RepographConfig } from "@repograph/shared";

export interface ModuleDef {
  name: string;
  description?: string;
  paths?: string[];
  critical?: boolean;
  risk?: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  module?: string;
  related_modules?: string[];
}

export interface ApiEndpointEntry {
  method: string;
  path: string;
  handler?: string;
  description?: string;
}

export interface ApiModuleBlock {
  module: string;
  endpoints: ApiEndpointEntry[];
}

export function parseModules(config: RepographConfig): ModuleDef[] {
  const raw = config.modules?.modules;
  if (!Array.isArray(raw)) return [];
  return raw as ModuleDef[];
}

export function parseGlossary(config: RepographConfig): GlossaryEntry[] {
  const raw = config.glossary?.glossary;
  if (!Array.isArray(raw)) return [];
  return raw as GlossaryEntry[];
}

export function parseApiBlocks(config: RepographConfig): ApiModuleBlock[] {
  const raw = config.api?.apis;
  if (!Array.isArray(raw)) return [];
  return raw as ApiModuleBlock[];
}

export function parseTests(
  config: RepographConfig
): Array<{ module: string; paths: string[]; description?: string }> {
  const raw = config.tests?.tests;
  if (!Array.isArray(raw)) return [];
  return raw as Array<{ module: string; paths: string[]; description?: string }>;
}

export function parseOwnership(
  config: RepographConfig
): Record<string, { members?: string[]; modules?: string[] }> {
  const raw = config.ownership?.owners;
  if (!raw || typeof raw !== "object") return {};
  return raw as Record<string, { members?: string[]; modules?: string[] }>;
}

export function parseAiExclude(config: RepographConfig): string[] {
  const ai = config.ai?.ai as { exclude_paths?: string[] } | undefined;
  return ai?.exclude_paths ?? [];
}

export function parseAiInstructions(config: RepographConfig): string[] {
  const ai = config.ai?.ai as { instructions?: string[]; risk_warnings?: string[] } | undefined;
  return [...(ai?.instructions ?? []), ...(ai?.risk_warnings ?? [])];
}

export function parseRiskEntries(
  config: RepographConfig
): Array<{ path: string; risk: string; reason?: string }> {
  const risks = config.risk?.risks;
  if (!Array.isArray(risks)) return [];
  return risks as Array<{ path: string; risk: string; reason?: string }>;
}

export function parseArchitectureRules(
  config: RepographConfig
): Array<{ id: string; description: string }> {
  const arch = (config.architecture?.rules ?? []) as Array<{ id: string; description: string }>;
  const custom = (config.rules?.rules ?? []) as Array<{ id: string; description: string }>;
  const seen = new Set<string>();
  const out: Array<{ id: string; description: string }> = [];
  for (const r of [...arch, ...custom]) {
    if (!r.id || seen.has(r.id)) continue;
    seen.add(r.id);
    out.push({ id: r.id, description: r.description ?? r.id });
  }
  return out;
}
