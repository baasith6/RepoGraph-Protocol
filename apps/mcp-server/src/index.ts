#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import type { RepoGraph } from "@repograph/graph-core";
import { analyzeImpactRich, formatImpactReportJson } from "@repograph/context-engine";
import { exportPrompt } from "@repograph/exporter-markdown";
import {
  checkArchitectureRules,
  explainFile,
  explainModule,
  explainProject,
  getEnforcementMode,
} from "@repograph/rule-engine";
import { buildGraphFromScan, scanRepository } from "@repograph/scanner-core";
import {
  getGeneratedDir,
  loadRepographConfig,
  repographExists,
} from "@repograph/shared";

const WORKSPACE = process.env.REPOGRAPH_ROOT ?? process.cwd();

async function loadOrBuildGraph(): Promise<{
  graph: RepoGraph;
  root: string;
  fromCache: boolean;
}> {
  const root = path.resolve(WORKSPACE);
  if (!(await repographExists(root))) {
    throw new Error(`No .repograph folder in ${root}. Run 'repograph init' first.`);
  }

  const graphPath = path.join(getGeneratedDir(root), "graph.json");
  try {
    const raw = await fs.readFile(graphPath, "utf-8");
    return { graph: JSON.parse(raw) as RepoGraph, root, fromCache: true };
  } catch {
    const config = await loadRepographConfig(root);
    const scan = await scanRepository(root, config);
    const builder = buildGraphFromScan(root, config, scan);
    const projectConfig = config.project?.project as Record<string, string> | undefined;
    let graph = builder.build(
      {
        name: projectConfig?.name ?? path.basename(root),
        root,
        architecture: projectConfig?.architecture,
        primaryLanguage: projectConfig?.primary_language,
      },
      scan.unmappedFiles.length
    );
    const ruleResult = checkArchitectureRules(graph, config, getEnforcementMode(config));
    for (const v of ruleResult.violations) {
      builder.addViolation(v);
    }
    graph = builder.build(graph.project, scan.unmappedFiles.length);
    return { graph, root, fromCache: false };
  }
}

const server = new McpServer({
  name: "repograph",
  version: "0.5.0",
});

server.tool(
  "repograph_get_graph",
  "Return RepoGraph stats and a summary of modules, layers, and violations",
  {},
  async () => {
    const { graph, fromCache } = await loadOrBuildGraph();
    const modules = graph.nodes.filter((n) => n.type === "MODULE").map((n) => n.label);
    const layers = graph.nodes.filter((n) => n.type === "LAYER").map((n) => n.label);
    const summary = {
      fromCache,
      stats: graph.stats,
      modules,
      layers,
      violations: graph.violations.slice(0, 50),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
    };
  }
);

server.tool(
  "repograph_explain",
  "Explain the project, a module, or a file using RepoGraph context",
  {
    target: z
      .enum(["project", "module", "file"])
      .optional()
      .describe("What to explain (default: project)"),
    name: z.string().optional().describe("Module name or file path when target is module/file"),
  },
  async ({ target, name }) => {
    const { graph, root } = await loadOrBuildGraph();
    const config = await loadRepographConfig(root);
    let text: string;
    if (target === "module" && name) {
      text = explainModule(graph, name);
    } else if (target === "file" && name) {
      text = explainFile(graph, name);
    } else {
      text = explainProject(graph, config);
    }
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "repograph_list_violations",
  "List architecture rule violations from the current graph",
  {
    limit: z.number().optional().default(30),
  },
  async ({ limit }) => {
    const { graph } = await loadOrBuildGraph();
    const lines = graph.violations.slice(0, limit).map(
      (v) => `[${v.severity}] ${v.ruleId ?? "rule"}: ${v.message}`
    );
    return {
      content: [
        {
          type: "text",
          text: lines.length ? lines.join("\n") : "No violations.",
        },
      ],
    };
  }
);

server.tool(
  "repograph_impact",
  "Analyze blast radius of changing a file",
  {
    file: z.string().describe("Repository-relative file path"),
    mode: z.enum(["short", "full", "strict"]).optional().default("full"),
    json: z.boolean().optional().default(false),
  },
  async ({ file, mode, json }) => {
    const { graph, root } = await loadOrBuildGraph();
    const config = await loadRepographConfig(root);
    const report = analyzeImpactRich(graph, config, file, mode);
    const text = json ? formatImpactReportJson(report) : report.summary;
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "repograph_prompt",
  "Generate task-aware AI context for a development task",
  {
    task: z.string().describe("Task description, e.g. Add booking cancellation"),
    mode: z.enum(["short", "full", "strict"]).optional().default("full"),
  },
  async ({ task, mode }) => {
    const { graph, root } = await loadOrBuildGraph();
    const config = await loadRepographConfig(root);
    const text = exportPrompt(graph, config, task, mode);
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "repograph_scan",
  "Scan the repository and refresh graph.json (requires write access to .repograph/generated)",
  {},
  async () => {
    const root = path.resolve(WORKSPACE);
    const config = await loadRepographConfig(root);
    const scan = await scanRepository(root, config);
    const builder = buildGraphFromScan(root, config, scan);
    const projectConfig = config.project?.project as Record<string, string> | undefined;
    let graph = builder.build(
      {
        name: projectConfig?.name ?? path.basename(root),
        root,
      },
      scan.unmappedFiles.length
    );
    const ruleResult = checkArchitectureRules(graph, config, getEnforcementMode(config));
    for (const v of ruleResult.violations) {
      builder.addViolation(v);
    }
    graph = builder.build(graph.project, scan.unmappedFiles.length);
    const generatedDir = getGeneratedDir(root);
    await fs.mkdir(generatedDir, { recursive: true });
    await fs.writeFile(
      path.join(generatedDir, "graph.json"),
      JSON.stringify(graph, null, 2),
      "utf-8"
    );
    return {
      content: [
        {
          type: "text",
          text: `Scan complete: ${graph.stats.fileCount} files, ${graph.violations.length} violations.`,
        },
      ],
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("[repograph-mcp] Fatal:", (err as Error).message);
  process.exit(1);
});
