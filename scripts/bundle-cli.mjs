import * as esbuild from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
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
  outfile: join(outDir, "index.js"),
  format: "esm",
  packages: "bundle",
  sourcemap: true,
});

cpSync(join(root, "packages/protocol/src/schemas"), join(outDir, "schemas"), {
  recursive: true,
});

console.log("CLI bundle written to apps/cli/dist/");
