import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { getConfigPath, loadRepographConfig } from "./config-loader.js";
import { getRepographDir, normalizePath } from "./paths.js";

export interface OwnershipDoc {
  owners?: Record<string, { members?: string[]; modules?: string[] }>;
}

type CodeownersRule = { pattern: string; owners: string[] };

const MANAGED_START = "# --- REPOGRAPH MANAGED START ---";
const MANAGED_END = "# --- REPOGRAPH MANAGED END ---";

async function readIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

function parseCodeowners(content: string): CodeownersRule[] {
  const rules: CodeownersRule[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/).filter(Boolean);
    if (parts.length < 2) continue;
    const [pattern, ...owners] = parts;
    rules.push({ pattern, owners });
  }
  return rules;
}

function pickCodeownersPath(root: string): string {
  // Prefer .github/CODEOWNERS when writing.
  return path.join(root, ".github", "CODEOWNERS");
}

async function locateCodeowners(root: string): Promise<string | null> {
  const candidates = [
    path.join(root, "CODEOWNERS"),
    path.join(root, ".github", "CODEOWNERS"),
    path.join(root, "docs", "CODEOWNERS"),
  ];
  for (const p of candidates) {
    const content = await readIfExists(p);
    if (content != null) return p;
  }
  return null;
}

function matchPattern(filePath: string, codeownersPattern: string): boolean {
  // CODEOWNERS patterns are gitignore-ish; we do a conservative approximation.
  const p = normalizePath(codeownersPattern).replace(/^\//, "");
  const f = normalizePath(filePath);

  // Simple prefix patterns like "src/" or "/src/"
  if (!p.includes("*") && p.endsWith("/")) {
    return f.startsWith(p);
  }
  if (!p.includes("*") && !p.endsWith("/")) {
    return f === p || f.startsWith(`${p}/`);
  }

  // Fallback: translate a subset to minimatch-like by using a light regex.
  // We avoid adding new deps here; scanner-core already uses minimatch but shared does not.
  const escaped = p.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    "^" +
      escaped
        .replace(/\\\*\\\*/g, ".*")
        .replace(/\\\*/g, "[^/]*")
        .replace(/\?/g, ".") +
      "$",
    "i"
  );
  return re.test(f);
}

function mergeOwnerModules(
  acc: Record<string, Set<string>>,
  owner: string,
  moduleName: string
): void {
  const key = owner.trim();
  if (!key) return;
  if (!acc[key]) acc[key] = new Set<string>();
  acc[key].add(moduleName);
}

export async function importOwnershipFromCodeowners(root: string): Promise<{
  updated: boolean;
  codeownersPath: string | null;
}> {
  const codeownersPath = await locateCodeowners(root);
  if (!codeownersPath) return { updated: false, codeownersPath: null };

  const config = await loadRepographConfig(root);
  const modules = (config.modules?.modules as Array<{ name: string; paths: string[] }> | undefined) ?? [];
  if (modules.length === 0) {
    return { updated: false, codeownersPath };
  }

  const scanGraphPath = path.join(getRepographDir(root), "generated", "graph.json");
  const graphRaw = await readIfExists(scanGraphPath);
  if (!graphRaw) {
    // Without a scan, we can't reliably map patterns to modules.
    return { updated: false, codeownersPath };
  }

  const graph = JSON.parse(graphRaw) as {
    nodes: Array<{ id: string; type: string; label: string }>;
    edges: Array<{ type: string; from: string; to: string }>;
  };

  // Build filePath -> moduleName mapping using BELONGS_TO edges.
  const moduleById = new Map<string, string>();
  for (const n of graph.nodes) {
    if (n.type === "MODULE") moduleById.set(n.id, n.label);
  }
  const fileById = new Map<string, string>();
  for (const n of graph.nodes) {
    if (n.type === "FILE") fileById.set(n.id, n.label);
  }
  const fileToModule = new Map<string, string>();
  for (const e of graph.edges) {
    if (e.type !== "BELONGS_TO") continue;
    const file = fileById.get(e.from);
    const mod = moduleById.get(e.to);
    if (file && mod) fileToModule.set(file, mod);
  }

  const rules = parseCodeowners((await fs.readFile(codeownersPath, "utf-8")) as string);
  const ownerModules: Record<string, Set<string>> = {};

  for (const [filePath, moduleName] of fileToModule.entries()) {
    for (const rule of rules) {
      if (!matchPattern(filePath, rule.pattern)) continue;
      for (const owner of rule.owners) {
        mergeOwnerModules(ownerModules, owner, moduleName);
      }
    }
  }

  const doc: OwnershipDoc = { owners: {} };
  for (const [owner, mods] of Object.entries(ownerModules)) {
    doc.owners![owner] = { modules: [...mods].sort() };
  }

  const outPath = getConfigPath(root, "ownership.yml" as any);
  // config-loader doesn’t currently list ownership.yml as a config file; write directly.
  await fs.writeFile(path.join(getRepographDir(root), "ownership.yml"), stringifyYaml(doc, { lineWidth: 0 }), "utf-8");
  void outPath;

  return { updated: true, codeownersPath };
}

function renderManagedBlock(doc: OwnershipDoc, moduleDefs: Array<{ name: string; paths: string[] }>): string {
  const lines: string[] = [];
  lines.push(MANAGED_START);
  lines.push("# This section is generated from .repograph/ownership.yml");
  lines.push("# Edit ownership.yml (or remove this block) to change it.");

  const owners = doc.owners ?? {};
  const entries: Array<{ path: string; owner: string }> = [];
  for (const [owner, def] of Object.entries(owners)) {
    const mods = def.modules ?? [];
    for (const modName of mods) {
      const mod = moduleDefs.find((m) => m.name === modName);
      if (!mod) continue;
      for (const p of mod.paths) {
        entries.push({ path: p, owner });
      }
    }
  }
  entries.sort((a, b) => (a.path === b.path ? a.owner.localeCompare(b.owner) : a.path.localeCompare(b.path)));
  for (const e of entries) {
    lines.push(`${e.path} ${e.owner}`);
  }

  lines.push(MANAGED_END);
  return lines.join("\n") + "\n";
}

function upsertManagedBlock(existing: string, block: string): string {
  const start = existing.indexOf(MANAGED_START);
  const end = existing.indexOf(MANAGED_END);
  if (start !== -1 && end !== -1 && end > start) {
    const afterEnd = end + MANAGED_END.length;
    return existing.slice(0, start) + block + existing.slice(afterEnd).replace(/^\s*\r?\n/, "\n");
  }
  const trimmed = existing.trimEnd();
  return (trimmed ? trimmed + "\n\n" : "") + block;
}

export async function exportCodeownersFromOwnership(root: string): Promise<{ updated: boolean; codeownersPath: string }> {
  const ownershipPath = path.join(getRepographDir(root), "ownership.yml");
  const raw = await readIfExists(ownershipPath);
  if (!raw) {
    return { updated: false, codeownersPath: pickCodeownersPath(root) };
  }
  const doc = (parseYaml(raw) as OwnershipDoc) ?? {};
  const config = await loadRepographConfig(root);
  const modules = (config.modules?.modules as Array<{ name: string; paths: string[] }> | undefined) ?? [];
  const codeownersPath = pickCodeownersPath(root);
  await fs.mkdir(path.dirname(codeownersPath), { recursive: true });

  const existing = (await readIfExists(codeownersPath)) ?? "";
  const block = renderManagedBlock(doc, modules);
  const next = upsertManagedBlock(existing, block);
  const updated = next !== existing;
  if (updated) {
    await fs.writeFile(codeownersPath, next, "utf-8");
  }
  return { updated, codeownersPath };
}

