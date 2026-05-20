import type { RepoGraph } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";
import { exportMermaid } from "@repograph/exporter-mermaid";

export function exportContextPack(graph: RepoGraph, config: RepographConfig): string {
  const project = config.project?.project as Record<string, string> | undefined;
  const modules = (config.modules?.modules ?? []) as Array<{
    name: string;
    description?: string;
    critical?: boolean;
  }>;
  const ai = config.ai?.ai as {
    instructions?: string[];
    exclude_paths?: string[];
    risk_warnings?: string[];
  } | undefined;
  const arch = config.architecture?.architecture as { style?: string } | undefined;
  const layers = config.architecture?.layers as Record<string, { path: string; allowed_dependencies?: string[] }> | undefined;

  const lines: string[] = [
    "# RepoGraph Context Pack",
    "",
    `Generated: ${graph.generatedAt}`,
    "",
    "## Project",
    "",
    `- **Name:** ${project?.name ?? graph.project.name}`,
    `- **Description:** ${project?.description ?? ""}`,
    `- **Architecture:** ${arch?.style ?? project?.architecture ?? "Unknown"}`,
    `- **Primary language:** ${project?.primary_language ?? "Unknown"}`,
    "",
    "## Modules",
    "",
  ];

  for (const mod of modules) {
    const critical = mod.critical ? " (critical)" : "";
    lines.push(`### ${mod.name}${critical}`);
    if (mod.description) lines.push(mod.description);
    lines.push("");
  }

  if (layers) {
    lines.push("## Architecture Layers", "");
    for (const [name, layer] of Object.entries(layers)) {
      const allowed = layer.allowed_dependencies?.join(", ") ?? "none";
      lines.push(`- **${name}** (\`${layer.path}\`): may depend on [${allowed}]`);
    }
    lines.push("");
  }

  if (graph.violations.length > 0) {
    lines.push("## Architecture Violations", "");
    for (const v of graph.violations) {
      lines.push(`- [${v.severity}] ${v.message}`);
    }
    lines.push("");
  }

  if (ai?.instructions?.length) {
    lines.push("## AI Instructions", "");
    for (const inst of ai.instructions) {
      lines.push(`- ${inst}`);
    }
    lines.push("");
  }

  if (ai?.risk_warnings?.length) {
    lines.push("## Risk Warnings", "");
    for (const warn of ai.risk_warnings) {
      lines.push(`- ${warn}`);
    }
    lines.push("");
  }

  lines.push("## Stats", "");
  lines.push(`- Files scanned: ${graph.stats.fileCount}`);
  lines.push(`- Modules: ${graph.stats.moduleCount}`);
  lines.push(`- Dependencies: ${graph.stats.dependencyCount}`);
  lines.push(`- Unmapped files: ${graph.stats.unmappedFiles}`);
  lines.push("");

  lines.push("## Layer Diagram", "");
  lines.push("```mermaid");
  lines.push(exportMermaid(graph, "layer"));
  lines.push("```");

  return lines.join("\n");
}

export function exportPrompt(
  graph: RepoGraph,
  config: RepographConfig,
  task: string
): string {
  const context = exportContextPack(graph, config);
  const modules = (config.modules?.modules ?? []) as Array<{ name: string }>;

  const lines: string[] = [
    "# Task Context",
    "",
    `## Task`,
    task,
    "",
    "## Relevant Context",
    "",
    context,
    "",
    "## Suggested Approach",
    "",
    "1. Identify the affected module(s) from the task description",
    "2. Review architecture layer rules before making changes",
    "3. Update related tests listed in tests.yml",
    "",
    "## Available Modules",
    ...modules.map((m) => `- ${m.name}`),
    "",
    "## Architecture Rules",
    "",
  ];

  const archRules = (config.architecture?.rules ?? []) as Array<{ id: string; description: string }>;
  for (const rule of archRules) {
    lines.push(`- **${rule.id}:** ${rule.description}`);
  }

  const customRules = (config.rules?.rules ?? []) as Array<{ id: string; description: string }>;
  for (const rule of customRules) {
    lines.push(`- **${rule.id}:** ${rule.description}`);
  }

  return lines.join("\n");
}
