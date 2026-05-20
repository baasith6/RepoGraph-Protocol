import type { RepoGraph } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";

export function exportCursorRules(graph: RepoGraph, config: RepographConfig): string {
  const project = config.project?.project as Record<string, string> | undefined;
  const ai = config.ai?.ai as { instructions?: string[]; exclude_paths?: string[]; risk_warnings?: string[] } | undefined;
  const arch = config.architecture?.architecture as { style?: string } | undefined;
  const layers = config.architecture?.layers as Record<string, { path: string; allowed_dependencies?: string[] }> | undefined;
  const modules = (config.modules?.modules ?? []) as Array<{ name: string; critical?: boolean }>;

  const lines: string[] = [
    "---",
    "description: RepoGraph-generated rules for this repository",
    "globs:",
    "  - \"**/*\"",
    "---",
    "",
    `# ${project?.name ?? "Project"} - RepoGraph Rules`,
    "",
    `Architecture: ${arch?.style ?? project?.architecture ?? "Unknown"}`,
    "",
    "## Architecture Rules",
    "",
  ];

  if (layers) {
    for (const [name, layer] of Object.entries(layers)) {
      const allowed = layer.allowed_dependencies?.join(", ") ?? "none";
      lines.push(`- **${name}** (\`${layer.path}\`) may only depend on: ${allowed}`);
    }
    lines.push("");
  }

  const archRules = (config.architecture?.rules ?? []) as Array<{ id: string; description: string }>;
  for (const rule of archRules) {
    lines.push(`- ${rule.description}`);
  }

  const customRules = (config.rules?.rules ?? []) as Array<{ id: string; description: string }>;
  for (const rule of customRules) {
    lines.push(`- ${rule.description}`);
  }

  lines.push("", "## Modules", "");
  for (const mod of modules) {
    const critical = mod.critical ? " [CRITICAL]" : "";
    lines.push(`- ${mod.name}${critical}`);
  }

  if (ai?.instructions?.length) {
    lines.push("", "## AI Instructions", "");
    for (const inst of ai.instructions) {
      lines.push(`- ${inst}`);
    }
  }

  if (ai?.risk_warnings?.length) {
    lines.push("", "## Risk Warnings", "");
    for (const warn of ai.risk_warnings) {
      lines.push(`- ${warn}`);
    }
  }

  if (ai?.exclude_paths?.length) {
    lines.push("", "## Excluded Paths", "");
    for (const p of ai.exclude_paths) {
      lines.push(`- \`${p}\``);
    }
  }

  if (graph.violations.length > 0) {
    lines.push("", "## Known Violations (fix before merging)", "");
    for (const v of graph.violations) {
      lines.push(`- [${v.severity}] ${v.message}`);
    }
  }

  lines.push(
    "",
    "## Before Editing",
    "",
    "- Run `repograph scan` after structural changes",
    "- Run `repograph check` before committing",
    "- Use `repograph impact <file>` to understand change scope",
    ""
  );

  return lines.join("\n");
}
