import fs from "node:fs/promises";
import path from "node:path";
import { stringify as stringifyYaml } from "yaml";
import { getRepographDir } from "./paths.js";

/** Scan snapshot passed from scanner-core (avoids circular dependency). */
export interface ProtocolSyncScan {
  apiEndpoints: Array<{
    file: string;
    controller: string;
    method: string;
    route: string;
  }>;
  symbols: Array<{ file: string; name: string; kind: string; namespace: string }>;
  files: Array<{ path: string; module?: string }>;
  databaseEntities?: Array<{
    name: string;
    file: string;
    table: string;
    module?: string;
    dbContext?: string;
    tenantScoped?: boolean;
    requiredFields?: string[];
    migrationFiles?: string[];
  }>;
  angularRoutes?: Array<{ file: string; path: string; component?: string }>;
  detectedStack: { csharp: boolean; angular: boolean; dotnet: boolean; node: boolean };
}

interface ApiEndpointEntry {
  method: string;
  path: string;
  handler?: string;
  description?: string;
}

interface ApiModuleBlock {
  module: string;
  endpoints: ApiEndpointEntry[];
}

interface DatabaseEntity {
  name: string;
  module: string;
  table?: string;
  db_context?: string;
  tenant_scoped?: boolean;
  required_fields?: string[];
  migration_files?: string[];
}

function resolveModuleForFile(
  filePath: string,
  modules: Array<{ name: string; paths: string[] }>
): string | undefined {
  for (const mod of modules) {
    for (const pattern of mod.paths) {
      const normalized = pattern.replace(/\\/g, "/");
      const prefix = normalized.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\/$/, "");
      if (prefix && filePath.includes(prefix.replace(/^\//, ""))) {
        return mod.name;
      }
      if (filePath.includes(mod.name)) {
        return mod.name;
      }
    }
  }
  return undefined;
}

function buildApiYaml(scan: ProtocolSyncScan, modules: Array<{ name: string; paths: string[] }>): object {
  const byModule = new Map<string, ApiEndpointEntry[]>();

  for (const api of scan.apiEndpoints) {
    const mod =
      resolveModuleForFile(api.file, modules) ??
      api.controller.replace(/Controller$/, "") ??
      "Unmapped";
    const list = byModule.get(mod) ?? [];
    list.push({
      method: api.method,
      path: api.route,
      handler: api.controller,
      description: `Detected in ${api.file}`,
    });
    byModule.set(mod, list);
  }

  for (const route of scan.angularRoutes ?? []) {
    const mod = resolveModuleForFile(route.file, modules) ?? "Frontend";
    const list = byModule.get(mod) ?? [];
    list.push({
      method: "GET",
      path: route.path,
      handler: route.component,
      description: `Angular route in ${route.file}`,
    });
    byModule.set(mod, list);
  }

  const apis: ApiModuleBlock[] = [...byModule.entries()].map(([module, endpoints]) => ({
    module,
    endpoints,
  }));

  return { apis };
}

function inferEntitiesFromSymbols(
  scan: ProtocolSyncScan,
  modules: Array<{ name: string; paths: string[] }>
): DatabaseEntity[] {
  const entities: DatabaseEntity[] = [];
  const seen = new Set<string>();

  for (const sym of scan.symbols) {
    const isEntity =
      sym.kind === "CLASS" &&
      (sym.name.endsWith("Entity") ||
        sym.file.includes("/Entities/") ||
        sym.file.includes("\\Entities\\"));
    if (!isEntity || seen.has(sym.name)) continue;
    seen.add(sym.name);
    entities.push({
      name: sym.name,
      module: resolveModuleForFile(sym.file, modules) ?? "Unmapped",
      table: sym.name.replace(/Entity$/, ""),
    });
  }

  for (const file of scan.files) {
    if (!file.path.includes("Entities") && !file.path.endsWith("Entity.cs")) continue;
    const base = path.basename(file.path, path.extname(file.path));
    if (seen.has(base)) continue;
    if (!base.endsWith("Entity") && !file.path.includes("Entities")) continue;
    seen.add(base);
    entities.push({
      name: base,
      module: file.module ?? resolveModuleForFile(file.path, modules) ?? "Unmapped",
      table: base.replace(/Entity$/, ""),
    });
  }

  return entities;
}

function mergeRoslynEntities(
  scan: ProtocolSyncScan,
  modules: Array<{ name: string; paths: string[] }>
): DatabaseEntity[] {
  const fromRoslyn = scan.databaseEntities ?? [];
  return fromRoslyn.map((e) => ({
    name: e.name,
    module: e.module ?? resolveModuleForFile(e.file, modules) ?? "Unmapped",
    table: e.table,
    db_context: e.dbContext,
    tenant_scoped: e.tenantScoped,
    required_fields: e.requiredFields?.length ? e.requiredFields : undefined,
    migration_files: e.migrationFiles?.length ? e.migrationFiles : undefined,
  }));
}

function buildDatabaseYaml(
  scan: ProtocolSyncScan,
  modules: Array<{ name: string; paths: string[] }>
): object {
  const roslynEntities = mergeRoslynEntities(scan, modules);
  const entities =
    roslynEntities.length > 0 ? roslynEntities : inferEntitiesFromSymbols(scan, modules);

  return {
    database: {
      provider: scan.detectedStack.dotnet ? "ef-core" : scan.detectedStack.node ? "unknown" : "unknown",
      entities,
    },
  };
}

export async function syncProtocolFromScan(
  root: string,
  scan: ProtocolSyncScan,
  configModules?: Record<string, unknown>
): Promise<{ apiUpdated: boolean; databaseUpdated: boolean }> {
  const repographDir = getRepographDir(root);
  const modulesRaw = configModules?.modules as Array<{ name: string; paths: string[] }> | undefined;
  const modules = modulesRaw ?? [];

  let apiUpdated = false;
  let databaseUpdated = false;

  const hasApis = scan.apiEndpoints.length > 0 || (scan.angularRoutes?.length ?? 0) > 0;
  if (hasApis) {
    const apiDoc = buildApiYaml(scan, modules);
    await fs.writeFile(
      path.join(repographDir, "api.yml"),
      stringifyYaml(apiDoc, { lineWidth: 0 }),
      "utf-8"
    );
    apiUpdated = true;
  }

  const dbDoc = buildDatabaseYaml(scan, modules) as {
    database: { entities: DatabaseEntity[] };
  };
  if (dbDoc.database.entities.length > 0) {
    await fs.writeFile(
      path.join(repographDir, "database.yml"),
      stringifyYaml(dbDoc, { lineWidth: 0 }),
      "utf-8"
    );
    databaseUpdated = true;
  }

  return { apiUpdated, databaseUpdated };
}
