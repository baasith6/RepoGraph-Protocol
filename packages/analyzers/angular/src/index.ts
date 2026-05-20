import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import ts from "typescript";

export interface AngularRoute {
  file: string;
  path: string;
  component?: string;
}

const ROUTE_PATH_REGEX = /path\s*:\s*['"`]([^'"`]+)['"`]/g;
const ROUTES_EXPORT_REGEX = /export\s+(?:const\s+)?routes\s*:\s*Routes/i;

function findAngularRoots(root: string): string[] {
  const roots: string[] = [];
  if (fs.existsSync(path.join(root, "angular.json"))) roots.push(root);
  const clientJson = path.join(root, "client", "angular.json");
  if (fs.existsSync(clientJson)) roots.push(path.join(root, "client"));
  return roots;
}

function findTsConfig(angularRoot: string): string | null {
  const candidates = ["tsconfig.json", "tsconfig.app.json", "src/tsconfig.json"];
  for (const rel of candidates) {
    const full = path.join(angularRoot, rel);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function extractRoutesFromSource(filePath: string, content: string): AngularRoute[] {
  const routes: AngularRoute[] = [];
  if (!ROUTE_PATH_REGEX.test(content) && !ROUTES_EXPORT_REGEX.test(content)) {
    ROUTE_PATH_REGEX.lastIndex = 0;
    return routes;
  }
  ROUTE_PATH_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = ROUTE_PATH_REGEX.exec(content)) !== null) {
    routes.push({
      file: filePath,
      path: match[1],
    });
  }

  return routes;
}

function extractRoutesWithCompiler(
  root: string,
  angularRoot: string,
  sourceFiles: string[]
): AngularRoute[] | null {
  const tsconfigPath = findTsConfig(angularRoot);
  if (!tsconfigPath) return null;

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) return null;

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );
  if (parsed.errors.length > 0) return null;

  const routes: AngularRoute[] = [];
  const compilerHost = ts.createCompilerHost(parsed.options);
  const program = ts.createProgram(
    sourceFiles.map((f) => path.join(root, f)),
    parsed.options,
    compilerHost
  );

  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile) continue;
    const rel = path.relative(root, sf.fileName).replace(/\\/g, "/");
    if (!rel.includes("client/") && !rel.endsWith(".ts")) continue;

    const visit = (node: ts.Node): void => {
      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "path") {
        if (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) {
          let component: string | undefined;
          const parent = node.parent && ts.isObjectLiteralExpression(node.parent) ? node.parent : undefined;
          if (parent) {
            for (const prop of parent.properties) {
              if (
                ts.isPropertyAssignment(prop) &&
                ts.isIdentifier(prop.name) &&
                prop.name.text === "component" &&
                ts.isIdentifier(prop.initializer)
              ) {
                component = prop.initializer.text;
              }
            }
          }
          routes.push({
            file: rel,
            path: node.initializer.text,
            component,
          });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }

  return routes.length > 0 ? routes : null;
}

export async function analyzeAngularProject(root: string): Promise<AngularRoute[]> {
  const angularRoots = findAngularRoots(root);
  if (angularRoots.length === 0) return [];

  const allRoutes: AngularRoute[] = [];

  for (const angularRoot of angularRoots) {
    const relPrefix = path.relative(root, angularRoot).replace(/\\/g, "/");
    const prefix = relPrefix && relPrefix !== "." ? `${relPrefix}/` : "";

    const tsFiles = await glob("**/*.{ts,tsx}", {
      cwd: angularRoot,
      nodir: true,
      ignore: ["**/node_modules/**", "**/dist/**"],
    });

    const relFiles = tsFiles.map((f) => `${prefix}${f.replace(/\\/g, "/")}`);
    const compilerRoutes = extractRoutesWithCompiler(root, angularRoot, relFiles);
    if (compilerRoutes && compilerRoutes.length > 0) {
      allRoutes.push(...compilerRoutes);
      continue;
    }

    for (const rel of relFiles) {
      const full = path.join(root, rel);
      try {
        const content = fs.readFileSync(full, "utf-8");
        allRoutes.push(...extractRoutesFromSource(rel, content));
      } catch {
        // skip
      }
    }
  }

  const seen = new Set<string>();
  return allRoutes.filter((r) => {
    const key = `${r.file}:${r.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
