import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "../src/schemas");
const dest = join(__dirname, "../dist/schemas");

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
