import type { TaskContext } from "./types.js";

export function formatTaskContextMarkdown(ctx: TaskContext): string {
  const lines: string[] = [
    "# Task Context",
    "",
    "## Task",
    ctx.task,
    "",
  ];

  if (ctx.warnings.length > 0) {
    lines.push("## Warnings", "");
    for (const w of ctx.warnings) lines.push(`- ${w}`);
    lines.push("");
  }

  lines.push("## Relevant Modules", "");
  if (ctx.modules.length === 0) {
    lines.push("_No modules matched._", "");
  } else {
    for (const mod of ctx.modules) {
      const critical = mod.critical ? " (critical)" : "";
      lines.push(`### ${mod.name}${critical}`);
      if (mod.description) lines.push(mod.description);
      lines.push("");
    }
  }

  lines.push("## Relevant Files", "");
  if (ctx.files.length === 0) {
    lines.push("_No files selected. Run repograph scan._", "");
  } else {
    for (const f of ctx.files) lines.push(`- \`${f}\``);
    lines.push("");
  }

  if (ctx.apis.length > 0) {
    lines.push("## Related APIs", "");
    for (const api of ctx.apis) {
      const handler = api.handler ? ` — ${api.handler}` : "";
      lines.push(`- **${api.module}:** ${api.method} ${api.path}${handler}`);
    }
    lines.push("");
  }

  lines.push("## Architecture Rules", "");
  if (ctx.rules.length === 0) {
    lines.push("_No rules configured._", "");
  } else {
    for (const r of ctx.rules) lines.push(`- **${r.id}:** ${r.description}`);
    lines.push("");
  }

  if (ctx.risks.length > 0) {
    lines.push("## Risk Warnings", "");
    for (const r of ctx.risks) {
      const reason = r.reason ? ` — ${r.reason}` : "";
      lines.push(`- **[${r.risk}]** \`${r.path}\`${reason}`);
    }
    lines.push("");
  }

  if (ctx.owners.length > 0) {
    lines.push("## Reviewers", "");
    for (const o of ctx.owners) lines.push(`- ${o}`);
    lines.push("");
  }

  lines.push("## Suggested Tests", "");
  if (ctx.suggestedTests.length === 0) {
    lines.push("- Update tests for affected modules", "");
  } else {
    for (const t of ctx.suggestedTests) lines.push(`- ${t}`);
    lines.push("");
  }

  if (ctx.excludePaths.length > 0) {
    lines.push("## Forbidden Edits", "");
    lines.push("Do not modify files matching:");
    for (const p of ctx.excludePaths) lines.push(`- \`${p}\``);
    lines.push("");
  }

  lines.push("## Suggested Approach", "");
  lines.push("1. Work only within the modules and files listed above");
  lines.push("2. Follow architecture rules before editing");
  lines.push("3. Add or update tests in the suggested test paths");
  lines.push("4. Request review from listed owners for high-risk modules");

  return lines.join("\n");
}

export function formatTaskContextForInstructions(ctx: TaskContext, title: string): string {
  const sections = [
    `# ${title}`,
    "",
    `Architecture context mode: ${ctx.mode}`,
    "",
    "## Modules",
    ...ctx.modules.map((m) => `- ${m.name}${m.critical ? " [CRITICAL]" : ""}: ${m.description ?? ""}`),
    "",
    "## Key Files",
    ...ctx.files.slice(0, 25).map((f) => `- ${f}`),
    "",
    "## Rules",
    ...ctx.rules.slice(0, 15).map((r) => `- ${r.description}`),
  ];

  if (ctx.excludePaths.length) {
    sections.push("", "## Do Not Edit", ...ctx.excludePaths.map((p) => `- ${p}`));
  }

  if (ctx.risks.length) {
    sections.push(
      "",
      "## Risk Areas",
      ...ctx.risks.slice(0, 10).map((r) => `- [${r.risk}] ${r.path}`)
    );
  }

  return sections.join("\n");
}

export { formatImpactReport } from "./impact.js";
