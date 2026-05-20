import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { glob } from "glob";
import { getRepographDir } from "./paths.js";

export interface GlossaryEntry {
  term: string;
  definition: string;
  module?: string;
}

export interface GlossaryDoc {
  glossary?: GlossaryEntry[];
}

function tokenizeIdentifiers(input: string): string[] {
  return input
    .replace(/[^A-Za-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((t) => t.split(/(?=[A-Z])/))
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && /^[A-Za-z][A-Za-z0-9]+$/.test(t));
}

function extractFromMarkdown(md: string): string[] {
  const terms: string[] = [];
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^\s{0,3}#{1,6}\s+(.+)$/);
    if (h) terms.push(...tokenizeIdentifiers(h[1]));
    const inline = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    for (const s of inline) terms.push(...tokenizeIdentifiers(s));
    const bold = [...line.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]);
    for (const s of bold) terms.push(...tokenizeIdentifiers(s));
  }
  return terms;
}

function uniqSorted(list: string[]): string[] {
  return [...new Set(list.map((t) => t.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

async function readIfExists(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function suggestGlossary(root: string): Promise<{ updated: boolean; added: number }> {
  const repographDir = getRepographDir(root);
  const glossaryPath = path.join(repographDir, "glossary.yml");
  const existingRaw = await readIfExists(glossaryPath);
  const existing = (existingRaw ? (parseYaml(existingRaw) as GlossaryDoc) : {}) ?? {};

  const existingTerms = new Set((existing.glossary ?? []).map((g) => g.term.toLowerCase()));

  const candidates: string[] = [];

  // From identifiers: module names and folder segments.
  const modulesPath = path.join(repographDir, "modules.yml");
  const modulesRaw = await readIfExists(modulesPath);
  if (modulesRaw) {
    const doc = parseYaml(modulesRaw) as { modules?: Array<{ name: string }> };
    for (const m of doc?.modules ?? []) candidates.push(...tokenizeIdentifiers(m.name));
  }

  // From docs: README + docs/**/*.md
  const readme = await readIfExists(path.join(root, "README.md"));
  if (readme) candidates.push(...extractFromMarkdown(readme));

  const docFiles = await glob("docs/**/*.md", { cwd: root, nodir: true, ignore: ["**/node_modules/**"] });
  for (const rel of docFiles) {
    const raw = await readIfExists(path.join(root, rel));
    if (raw) candidates.push(...extractFromMarkdown(raw));
  }

  const terms = uniqSorted(candidates)
    .map((t) => t.replace(/s$/i, (m) => m)) // no-op placeholder, keep stable behavior
    .filter((t) => t.length <= 40);

  const addedEntries: GlossaryEntry[] = [];
  for (const term of terms) {
    if (existingTerms.has(term.toLowerCase())) continue;
    // Suggested entries use a placeholder definition; users can refine.
    addedEntries.push({ term, definition: "TODO: define (suggested)" });
  }

  if (addedEntries.length === 0) return { updated: false, added: 0 };

  const nextDoc: GlossaryDoc = {
    glossary: [...(existing.glossary ?? []), ...addedEntries].sort((a, b) => a.term.localeCompare(b.term)),
  };

  const nextRaw = stringifyYaml(nextDoc, { lineWidth: 0 });
  await fs.mkdir(repographDir, { recursive: true });
  await fs.writeFile(glossaryPath, nextRaw, "utf-8");
  return { updated: true, added: addedEntries.length };
}

