import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { getRepographDir, REPOGRAPH_DIR } from "./paths.js";

export const CONFIG_FILES = [
  "project.yml",
  "modules.yml",
  "architecture.yml",
  "rules.yml",
  "tests.yml",
  "ai.yml",
] as const;

export type ConfigFileName = (typeof CONFIG_FILES)[number];

export interface RepographConfig {
  project?: Record<string, unknown>;
  modules?: Record<string, unknown>;
  architecture?: Record<string, unknown>;
  rules?: Record<string, unknown>;
  tests?: Record<string, unknown>;
  ai?: Record<string, unknown>;
}

export async function loadRepographConfig(root: string): Promise<RepographConfig> {
  const repographDir = getRepographDir(root);
  const config: RepographConfig = {};

  for (const file of CONFIG_FILES) {
    const key = file.replace(".yml", "") as keyof RepographConfig;
    const filePath = path.join(repographDir, file);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      config[key] = parseYaml(content) as Record<string, unknown>;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }
    }
  }

  return config;
}

export async function repographExists(root: string): Promise<boolean> {
  try {
    await fs.access(getRepographDir(root));
    return true;
  } catch {
    return false;
  }
}

export function getConfigPath(root: string, file: ConfigFileName): string {
  return path.join(root, REPOGRAPH_DIR, file);
}
