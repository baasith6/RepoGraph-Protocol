import type { GraphNode, RepoGraph, Violation } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";
import type { EnforcementMode, RuleCheckResult } from "./types.js";

interface LayerConfig {
  path: string;
  allowed_dependencies: string[];
}

interface CustomRule {
  id: string;
  description: string;
  severity?: "warning" | "error" | "critical";
  type?: string;
  from?: string;
  to?: string;
  forbidden?: boolean;
}

function getFileLayer(filePath: string, layers: Record<string, LayerConfig>): string | undefined {
  const normalized = filePath.replace(/\\/g, "/");
  for (const [name, config] of Object.entries(layers)) {
    const layerPath = config.path.replace(/\\/g, "/");
    if (normalized.startsWith(layerPath + "/") || normalized === layerPath) {
      return name;
    }
  }
  return undefined;
}

function inferLayerFromDependencyTarget(
  target: string,
  layers: Record<string, LayerConfig>
): string | undefined {
  const normalized = target.replace(/\\/g, "/").toLowerCase();

  for (const [layerName, config] of Object.entries(layers)) {
    const layerPath = config.path.replace(/\\/g, "/").toLowerCase();
    const layerSegment = layerPath.split("/").pop() ?? layerName.toLowerCase();

    if (
      normalized.includes(layerSegment) ||
      normalized.includes(layerName.toLowerCase()) ||
      normalized.includes(`/${layerName.toLowerCase()}/`)
    ) {
      return layerName;
    }
  }

  return undefined;
}

function buildLayerDependencyGraph(
  graph: RepoGraph,
  layers: Record<string, LayerConfig>
): Map<string, Set<string>> {
  const layerDeps = new Map<string, Set<string>>();

  for (const layerName of Object.keys(layers)) {
    layerDeps.set(layerName, new Set());
  }

  const fileToLayer = new Map<string, string>();
  for (const node of graph.nodes) {
    if (node.type === "FILE") {
      const layer = getFileLayer(node.label, layers);
      if (layer) fileToLayer.set(node.id, layer);
    }
  }

  for (const edge of graph.edges) {
    if (edge.type !== "DEPENDS_ON") continue;
    const sourceLayer = fileToLayer.get(edge.source);
    if (!sourceLayer) continue;

    let targetPath = edge.target;
    if (targetPath.startsWith("file:")) {
      targetPath = targetPath.slice(5);
    }

    const targetLayer =
      fileToLayer.get(edge.target) ??
      getFileLayer(targetPath, layers) ??
      inferLayerFromDependencyTarget(targetPath, layers);

    if (targetLayer && sourceLayer !== targetLayer) {
      layerDeps.get(sourceLayer)?.add(targetLayer);
    }
  }

  return layerDeps;
}

function detectCycles(layerDeps: Map<string, Set<string>>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) {
        cycles.push([...path.slice(cycleStart), node]);
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);
    path.push(node);

    for (const neighbor of layerDeps.get(node) ?? []) {
      dfs(neighbor, path);
    }

    path.pop();
    stack.delete(node);
  }

  for (const node of layerDeps.keys()) {
    dfs(node, []);
  }

  return cycles;
}

export function checkArchitectureRules(
  graph: RepoGraph,
  config: RepographConfig,
  mode: EnforcementMode = "error"
): RuleCheckResult {
  const violations: Violation[] = [];
  const layers = (config.architecture?.layers ?? {}) as Record<string, LayerConfig>;
  const archRules = (config.architecture?.rules ?? []) as Array<{
    id: string;
    description: string;
    severity?: string;
  }>;
  const customRules = (config.rules?.rules ?? []) as CustomRule[];

  const layerDeps = buildLayerDependencyGraph(graph, layers);

  for (const [sourceLayer, targets] of layerDeps) {
    const allowed = layers[sourceLayer]?.allowed_dependencies ?? [];
    for (const targetLayer of targets) {
      if (!allowed.includes(targetLayer)) {
        violations.push({
          id: `violation:layer-${sourceLayer}-${targetLayer}`,
          ruleId: `layer-dependency:${sourceLayer}->${targetLayer}`,
          severity: "error",
          message: `Layer "${sourceLayer}" must not depend on "${targetLayer}". Allowed: [${allowed.join(", ") || "none"}]`,
          source: sourceLayer,
          target: targetLayer,
        });
      }
    }
  }

  const cycles = detectCycles(layerDeps);
  for (const cycle of cycles) {
    violations.push({
      id: `violation:cycle-${cycle.join("-")}`,
      ruleId: "circular-dependency",
      severity: "error",
      message: `Circular layer dependency detected: ${cycle.join(" -> ")}`,
    });
  }

  for (const rule of customRules) {
    if (rule.type === "forbidden-dependency" && rule.from && rule.to) {
      const deps = layerDeps.get(rule.from);
      if (deps?.has(rule.to)) {
        violations.push({
          id: `violation:${rule.id}`,
          ruleId: rule.id,
          severity: (rule.severity as Violation["severity"]) ?? "error",
          message: rule.description,
          source: rule.from,
          target: rule.to,
        });
      }
    }
  }

  for (const rule of archRules) {
    if (rule.id === "no-web-to-infrastructure") {
      const webDeps = layerDeps.get("Web");
      if (webDeps?.has("Infrastructure")) {
        violations.push({
          id: `violation:${rule.id}`,
          ruleId: rule.id,
          severity: (rule.severity as Violation["severity"]) ?? "error",
          message: rule.description,
          source: "Web",
          target: "Infrastructure",
        });
      }
    }
  }

  const criticalCount = violations.filter((v) => v.severity === "critical").length;
  const errorCount = violations.filter((v) => v.severity === "error").length;

  let passed = true;
  if (mode === "strict") {
    passed = violations.length === 0;
  } else if (mode === "error") {
    passed = criticalCount === 0 && errorCount === 0;
  } else {
    passed = criticalCount === 0;
  }

  return { violations, passed };
}

export function getEnforcementMode(config: RepographConfig): EnforcementMode {
  const enforcement = config.rules?.enforcement as { mode?: EnforcementMode } | undefined;
  return enforcement?.mode ?? "error";
}

export function explainModule(
  graph: RepoGraph,
  moduleName: string
): string {
  const moduleNode = graph.nodes.find(
    (n) => n.type === "MODULE" && n.label === moduleName
  );
  if (!moduleNode) {
    return `Module "${moduleName}" not found.`;
  }

  const files = graph.edges
    .filter((e) => e.type === "BELONGS_TO" && e.target === moduleNode.id)
    .map((e) => graph.nodes.find((n) => n.id === e.source))
    .filter((n): n is GraphNode => n?.type === "FILE");

  const deps = graph.edges
    .filter((e) => e.type === "DEPENDS_ON")
    .filter((e) => files.some((f) => f.id === e.source));

  let output = `Module: ${moduleName}\n`;
  output += `Files: ${files.length}\n\n`;
  output += "Files in module:\n";
  for (const f of files.slice(0, 20)) {
    output += `  - ${f.label}\n`;
  }
  if (files.length > 20) {
    output += `  ... and ${files.length - 20} more\n`;
  }
  output += `\nDependencies: ${deps.length}\n`;

  return output;
}

export function explainFile(graph: RepoGraph, filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const fileNode = graph.nodes.find(
    (n) => n.type === "FILE" && (n.label === normalized || n.label.endsWith(normalized))
  );

  if (!fileNode) {
    return `File "${filePath}" not found in graph. Run 'repograph scan' first.`;
  }

  const belongsTo = graph.edges.filter(
    (e) => e.type === "BELONGS_TO" && e.source === fileNode.id
  );

  let output = `File: ${fileNode.label}\n`;
  output += `Language: ${fileNode.metadata?.language ?? "unknown"}\n\n`;

  for (const edge of belongsTo) {
    const target = graph.nodes.find((n) => n.id === edge.target);
    if (target) {
      output += `Belongs to ${target.type}: ${target.label}\n`;
    }
  }

  const deps = graph.edges.filter(
    (e) => e.type === "DEPENDS_ON" && e.source === fileNode.id
  );
  if (deps.length > 0) {
    output += `\nDependencies (${deps.length}):\n`;
    for (const dep of deps.slice(0, 10)) {
      output += `  -> ${dep.target.replace("file:", "")}\n`;
    }
  }

  return output;
}

export function explainProject(graph: RepoGraph, config: RepographConfig): string {
  const project = config.project?.project as Record<string, string> | undefined;
  const arch = config.architecture?.architecture as { style?: string } | undefined;
  const modules = (config.modules?.modules ?? []) as Array<{ name: string; critical?: boolean }>;

  let output = `${project?.name ?? graph.project.name}\n`;
  output += `${project?.description ?? ""}\n\n`;
  output += `Architecture: ${arch?.style ?? project?.architecture ?? "Unknown"}\n`;
  output += `Type: ${project?.type ?? "Unknown"}\n`;
  output += `Primary language: ${project?.primary_language ?? graph.project.primaryLanguage ?? "Unknown"}\n\n`;

  output += "Modules:\n";
  for (const mod of modules) {
    const marker = mod.critical ? " [critical]" : "";
    output += `  - ${mod.name}${marker}\n`;
  }

  const layers = Object.keys((config.architecture?.layers ?? {}) as Record<string, unknown>);
  if (layers.length > 0) {
    output += `\nLayers:\n`;
    for (const layer of layers) {
      output += `  - ${layer}\n`;
    }
  }

  output += `\nStats:\n`;
  output += `  Files: ${graph.stats.fileCount}\n`;
  output += `  Dependencies: ${graph.stats.dependencyCount}\n`;
  output += `  Unmapped files: ${graph.stats.unmappedFiles}\n`;
  output += `  Violations: ${graph.stats.violationCount}\n`;

  return output;
}

export function analyzeImpact(
  graph: RepoGraph,
  config: RepographConfig,
  filePath: string
): string {
  const explanation = explainFile(graph, filePath);
  const normalized = filePath.replace(/\\/g, "/");

  const fileNode = graph.nodes.find(
    (n) => n.type === "FILE" && (n.label === normalized || n.label.endsWith(normalized))
  );

  if (!fileNode) return explanation;

  const moduleEdge = graph.edges.find(
    (e) => e.type === "BELONGS_TO" && e.source === fileNode.id && e.target.startsWith("module:")
  );
  const moduleNode = moduleEdge
    ? graph.nodes.find((n) => n.id === moduleEdge.target)
    : undefined;

  const tests = (config.tests?.tests ?? []) as Array<{ module: string; paths: string[] }>;
  const relatedTests = moduleNode
    ? tests.filter((t) => t.module === moduleNode.label)
  : [];

  let output = explanation + "\n--- Impact Analysis ---\n\n";

  if (moduleNode) {
    output += `Affected module: ${moduleNode.label}\n`;

    const siblingFiles = graph.edges
      .filter((e) => e.type === "BELONGS_TO" && e.target === moduleNode.id)
      .length;
    output += `Files in same module: ${siblingFiles}\n`;
  }

  if (relatedTests.length > 0) {
    output += "\nRelated tests:\n";
    for (const test of relatedTests) {
      for (const p of test.paths) {
        output += `  - ${p}\n`;
      }
    }
  }

  const moduleMeta = moduleNode?.metadata;
  if (moduleMeta?.critical) {
    output += "\nRisk: HIGH (critical module)\n";
  }

  return output;
}
