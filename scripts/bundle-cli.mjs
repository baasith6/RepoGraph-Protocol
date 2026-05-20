import * as esbuild from "esbuild";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "apps/cli/dist");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [join(root, "apps/cli/src/index.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: join(outDir, "index.cjs"),
  format: "cjs",
  packages: "bundle",
  sourcemap: true,
});

// Keep the executable entrypoint as ESM with a shebang.
// (esbuild may emit "use strict" before banners in CJS output, breaking shebang parsing.)
writeFileSync(
  join(outDir, "index.js"),
  ["#!/usr/bin/env node", "import './index.cjs';", ""].join("\n")
);

cpSync(join(root, "packages/protocol/src/schemas"), join(outDir, "schemas"), {
  recursive: true,
});

const roslynSrc = join(root, "tools/repograph-roslyn");
const roslynDest = join(outDir, "roslyn-tool");
if (existsSync(roslynSrc)) {
  cpSync(roslynSrc, roslynDest, {
    recursive: true,
    filter: (src) => {
      const base = basename(src);
      return base !== "bin" && base !== "obj";
    },
  });
}

console.log("CLI bundle written to apps/cli/dist/");
