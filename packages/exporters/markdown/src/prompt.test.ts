import { describe, it, expect } from "vitest";
import type { RepoGraph } from "@repograph/graph-core";
import { exportPrompt } from "./index.js";

const graph: RepoGraph = {
  version: "0.2.0",
  generatedAt: new Date().toISOString(),
  project: { name: "Orders API", root: "/test" },
  nodes: [
    { id: "module:Orders", type: "MODULE", label: "Orders", metadata: { critical: true } },
    { id: "file:src/api/orders.ts", type: "FILE", label: "src/api/orders.ts" },
  ],
  edges: [
    { id: "e1", type: "BELONGS_TO", source: "file:src/api/orders.ts", target: "module:Orders" },
  ],
  violations: [],
  stats: {
    fileCount: 1,
    moduleCount: 1,
    layerCount: 0,
    dependencyCount: 0,
    unmappedFiles: 0,
    violationCount: 0,
  },
};

const config = {
  modules: {
    modules: [
      {
        name: "Orders",
        description: "Order cancellation and placement",
        paths: ["src/**/order*"],
        critical: true,
      },
    ],
  },
  architecture: { rules: [] },
  rules: { rules: [] },
  ai: { ai: { exclude_paths: ["dist/**"] } },
};

describe("exportPrompt", () => {
  it("includes task and orders module without full context pack dump", () => {
    const md = exportPrompt(graph, config, "Add order cancellation", "strict");
    expect(md).toContain("Add order cancellation");
    expect(md).toContain("Orders");
    expect(md).not.toContain("## Layer Diagram");
    expect(md).not.toContain("Files scanned:");
  });
});
