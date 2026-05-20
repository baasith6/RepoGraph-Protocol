import fs from "node:fs/promises";
import path from "node:path";
import { getRepographDir, getGeneratedDir, log } from "@repograph/shared";
import { getTemplate, type TemplateName } from "@repograph/templates";
import { getRoot } from "../context.js";

interface InitOptions {
  template: string;
  force?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const root = getRoot();
  const repographDir = getRepographDir(root);
  const generatedDir = getGeneratedDir(root);
  const decisionsDir = path.join(repographDir, "decisions");

  const templateName = (options.template ?? "clean-architecture-csharp-angular") as TemplateName;
  const files = getTemplate(templateName);

  await fs.mkdir(repographDir, { recursive: true });
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.mkdir(decisionsDir, { recursive: true });

  await fs.writeFile(
    path.join(generatedDir, ".gitkeep"),
    ""
  );

  for (const file of files) {
    const filePath = path.join(repographDir, file.path);
    const dir = path.dirname(filePath);

    try {
      await fs.access(filePath);
      if (!options.force) {
        log("warn", `Skipping existing file: ${file.path} (use --force to overwrite)`);
        continue;
      }
    } catch {
      // file does not exist
    }

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, file.content, "utf-8");
    log("info", `Created ${path.join(".repograph", file.path)}`);
  }

  log("info", `RepoGraph initialized with template: ${templateName}`);
  log("info", "Next steps: repograph validate && repograph scan");
}
