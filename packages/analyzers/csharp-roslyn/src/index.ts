import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function getImportMetaUrl(): string | undefined {
  try {
    // Avoid syntax errors in CommonJS bundles by evaluating dynamically.
    return new Function("return import.meta.url")() as string;
  } catch {
    return undefined;
  }
}

const metaUrl = getImportMetaUrl();
const __dirname = metaUrl
  ? path.dirname(fileURLToPath(metaUrl))
  : process.cwd();

export interface RoslynFileDependency {
  source: string;
  target: string;
  type: string;
}

export interface RoslynSymbol {
  file: string;
  name: string;
  kind: string;
  namespace: string;
}

export interface RoslynApiEndpoint {
  file: string;
  controller: string;
  method: string;
  route: string;
}

export interface RoslynAnalysisResult {
  projects: string[];
  dependencies: RoslynFileDependency[];
  symbols: RoslynSymbol[];
  apiEndpoints: RoslynApiEndpoint[];
  errors: string[];
}

function findRoslynProject(): string | null {
  const candidates = [
    path.join(__dirname, "../../../../tools/repograph-roslyn/Repograph.Roslyn.csproj"),
    path.join(process.cwd(), "tools/repograph-roslyn/Repograph.Roslyn.csproj"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export async function runRoslynAnalyzer(root: string): Promise<RoslynAnalysisResult | null> {
  const csproj = findRoslynProject();
  if (!csproj) return null;

  return new Promise((resolve) => {
    const proc = spawn(
      "dotnet",
      ["run", "--project", csproj, "-c", "Release", "--", root],
      { stdio: ["ignore", "pipe", "pipe"], shell: true }
    );

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }
      try {
        const line = stdout.trim().split("\n").find((l) => l.startsWith("{"));
        if (!line) {
          resolve(null);
          return;
        }
        const raw = JSON.parse(line) as {
          Projects?: string[];
          Dependencies?: Array<{ Source: string; Target: string; Type: string }>;
          Symbols?: Array<{ File: string; Name: string; Kind: string; Namespace: string }>;
          ApiEndpoints?: Array<{ File: string; Controller: string; Method: string; Route: string }>;
          Errors?: string[];
        };

        resolve({
          projects: raw.Projects ?? [],
          dependencies: (raw.Dependencies ?? []).map((d) => ({
            source: d.Source,
            target: d.Target,
            type: d.Type,
          })),
          symbols: (raw.Symbols ?? []).map((s) => ({
            file: s.File,
            name: s.Name,
            kind: s.Kind,
            namespace: s.Namespace,
          })),
          apiEndpoints: (raw.ApiEndpoints ?? []).map((a) => ({
            file: a.File,
            controller: a.Controller,
            method: a.Method,
            route: a.Route,
          })),
          errors: raw.Errors ?? [],
        });
      } catch {
        resolve(null);
      }
    });

    proc.on("error", () => resolve(null));
  });
}
