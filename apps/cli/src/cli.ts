import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { doctorCommand } from "./commands/doctor.js";
import { scanCommand } from "./commands/scan.js";
import { syncCommand } from "./commands/sync.js";
import { checkCommand } from "./commands/check.js";
import { explainCommand } from "./commands/explain.js";
import { listCommand } from "./commands/list.js";
import { visualizeCommand } from "./commands/visualize.js";
import { statsCommand } from "./commands/stats.js";
import { exportCommand } from "./commands/export.js";
import { promptCommand } from "./commands/prompt.js";
import { impactCommand } from "./commands/impact.js";

export async function runCli(argv: string[]): Promise<void> {
  const program = new Command();

  program
    .name("repograph")
    .description("Machine-readable context for human and AI developers")
    .version("0.1.0");

  program
    .command("init")
    .description("Create .repograph folder and starter config")
    .option("-t, --template <name>", "Template name", "clean-architecture-csharp-angular")
    .option("-f, --force", "Overwrite existing files")
    .action(initCommand);

  program.command("validate").description("Validate .repograph config files").action(validateCommand);

  program.command("doctor").description("Check RepoGraph setup health").action(doctorCommand);

  program.command("scan").description("Scan repository and generate graph").action(scanCommand);

  program.command("sync").description("Scan and update generated files").action(syncCommand);

  program
    .command("check")
    .description("Validate architecture and rules")
    .option("--strict", "Fail on any violation including warnings")
    .action(checkCommand);

  program
    .command("explain [target]")
    .description("Explain project, module, or file")
    .option("-m, --module <name>", "Explain a module")
    .option("-f, --file <path>", "Explain a file")
    .action(explainCommand);

  program
    .command("list <type>")
    .description("List modules, layers, or violations")
    .action(listCommand);

  program
    .command("visualize")
    .description("Generate dependency diagrams")
    .option("--format <format>", "Output format", "mermaid")
    .option("--type <type>", "Diagram type: module, layer, all", "all")
    .action(visualizeCommand);

  program.command("stats").description("Show repository complexity metrics").action(statsCommand);

  program
    .command("export")
    .description("Export graph/context to different formats")
    .requiredOption("--format <format>", "Format: json, markdown, mermaid, cursor")
    .option("-o, --output <path>", "Output file path")
    .action(exportCommand);

  program
    .command("prompt <task>")
    .description("Generate AI-ready task context")
    .option("-o, --output <path>", "Output file path")
    .action(promptCommand);

  program
    .command("impact <file>")
    .description("Show impact of changing a file")
    .action(impactCommand);

  await program.parseAsync(argv);
}
