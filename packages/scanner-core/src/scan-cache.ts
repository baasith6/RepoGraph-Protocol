import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { RepographConfig } from "@repograph/shared";
import type {
  FileDependency,
  ScannedApiEndpoint,
  ScannedFile,
  ScannedSymbol,
} from "./types.js";

const CACHE_VERSION = 1;
const CACHE_FILE = "scan-cache.json";

export interface CachedFileEntry {
  hash: string;
  file: ScannedFile;
  dependencies: FileDependency[];
}

export interface ScanCacheData {
  version: number;
  configHash: string;
  files: Record<string, CachedFileEntry>;
  typescriptDeps: FileDependency[];
  typescriptHash: string;
  roslynDeps: FileDependency[];
  roslynSymbols: ScannedSymbol[];
  roslynApiEndpoints: ScannedApiEndpoint[];
  roslynHash: string;
  analyzer: "roslyn" | "heuristic";
}

export function getScanCachePath(generatedDir: string): string {
  return path.join(generatedDir, CACHE_FILE);
}

export function hashConfig(config: RepographConfig): string {
  const modules = config.modules?.modules ?? [];
  const layers = config.architecture?.layers ?? {};
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ modules, layers }))
    .digest("hex")
    .slice(0, 16);
}

export async function fileContentHash(root: string, relPath: string): Promise<string> {
  const stat = await fs.stat(path.join(root, relPath));
  return crypto
    .createHash("sha256")
    .update(`${relPath}:${stat.mtimeMs}:${stat.size}`)
    .digest("hex")
    .slice(0, 16);
}

export async function loadScanCache(
  generatedDir: string,
  configHash: string
): Promise<ScanCacheData | null> {
  try {
    const raw = await fs.readFile(getScanCachePath(generatedDir), "utf-8");
    const data = JSON.parse(raw) as ScanCacheData;
    if (data.version !== CACHE_VERSION || data.configHash !== configHash) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function saveScanCache(generatedDir: string, data: ScanCacheData): Promise<void> {
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.writeFile(getScanCachePath(generatedDir), JSON.stringify(data, null, 2), "utf-8");
}

export function createEmptyCache(configHash: string): ScanCacheData {
  return {
    version: CACHE_VERSION,
    configHash,
    files: {},
    typescriptDeps: [],
    typescriptHash: "",
    roslynDeps: [],
    roslynSymbols: [],
    roslynApiEndpoints: [],
    roslynHash: "",
    analyzer: "heuristic",
  };
}
