import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { FileDependency } from "./index.js";

function findTsConfig(root: string): string | null {
  const candidates = [
    "tsconfig.json",
    "tsconfig.app.json",
    "client/tsconfig.json",
    "src/tsconfig.json",
  ];
  for (const rel of candidates) {
    const full = path.join(root, rel);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function resolveImportTarget(
  moduleSpecifier: string,
  containingFile: string,
  root: string
): string {
  if (moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("/")) {
    const dir = path.dirname(path.join(root, containingFile));
    const resolved = path.normalize(path.join(dir, moduleSpecifier));
    const exts = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"];
    for (const ext of exts) {
      const withExt = ext.startsWith("/") ? resolved + ext : resolved + ext;
      if (fs.existsSync(withExt)) {
        return path.relative(root, withExt).replace(/\\/g, "/");
      }
    }
    return path.relative(root, resolved).replace(/\\/g, "/");
  }
  return moduleSpecifier;
}

/**
 * Analyze TypeScript/JavaScript imports using the compiler API when tsconfig exists.
 */
export function analyzeTypeScriptProject(
  root: string,
  sourceFiles: string[]
): FileDependency[] | null {
  const tsconfigPath = findTsConfig(root);
  if (!tsconfigPath) return null;

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) return null;

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );
  if (parsed.errors.length > 0) return null;

  const options = parsed.options;
  const program = ts.createProgram(
    sourceFiles.map((f) => path.join(root, f)),
    options
  );
  const checker = program.getTypeChecker();
  const deps: FileDependency[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;
    const rel = path.relative(root, sourceFile.fileName).replace(/\\/g, "/");
    if (!sourceFiles.includes(rel)) continue;

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const spec = node.moduleSpecifier.text;
        const target = resolveImportTarget(spec, rel, root);
        deps.push({ source: rel, target, type: "import" });
      }
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "require" &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const spec = node.arguments[0].text;
        deps.push({
          source: rel,
          target: resolveImportTarget(spec, rel, root),
          type: "import",
        });
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sourceFile, visit);
  }
  void checker;

  return deps;
}
