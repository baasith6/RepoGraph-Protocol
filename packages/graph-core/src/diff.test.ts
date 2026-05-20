import { describe, it, expect } from "vitest";
import { diffGraphs } from "./diff.js";
import type { RepoGraph } from "./types.js";

const emptyGraph = (): RepoGraph => ({
  version: "0.2.0",
  generatedAt: "",
  project: { name: "t", root: "/" },
  nodes: [],
  edges: [],
  violations: [],
  stats: {
    fileCount: 0,
    moduleCount: 0,
    layerCount: 0,
    dependencyCount: 0,
    unmappedFiles: 0,
    violationCount: 0,
  },
});

describe("diffGraphs", () => {
  it("detects new violations", () => {
    const base = emptyGraph();
    const head = emptyGraph();
    head.violations.push({
      id: "v1",
      ruleId: "test",
      severity: "error",
      message: "Web must not depend on Infrastructure",
    });

    const diff = diffGraphs(base, head, "main", "HEAD");
    expect(diff.newViolations).toHaveLength(1);
  });
});
