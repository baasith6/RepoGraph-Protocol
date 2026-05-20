#!/usr/bin/env node
import { runCli } from "./cli.js";

runCli(process.argv).catch((err) => {
  console.error(`[repograph] Fatal: ${(err as Error).message}`);
  process.exit(1);
});
