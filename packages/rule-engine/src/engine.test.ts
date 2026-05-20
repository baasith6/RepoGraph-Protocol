import { describe, it, expect } from "vitest";
import type { RepoGraph } from "@repograph/graph-core";
import { checkArchitectureRules } from "./engine.js";

const baseGraph: RepoGraph = {
  version: "0.1.0",
  generatedAt: new Date().toISOString(),
  project: { name: "Test", root: "/test" },
  nodes: [
    { id: "file:src/Web/Bad.cs", type: "FILE", label: "src/Web/Bad.cs" },
  ],
  edges: [
    {
      id: "e1",
      type: "DEPENDS_ON",
      source: "file:src/Web/Bad.cs",
      target: "CarRentalExample.Infrastructure.Persistence",
    },
  ],
  violations: [],
  stats: {
    fileCount: 1,
    moduleCount: 0,
    layerCount: 0,
    dependencyCount: 1,
    unmappedFiles: 0,
    violationCount: 0,
  },
};

const config = {
  architecture: {
    layers: {
      Domain: { path: "src/Domain", allowed_dependencies: [] },
      Application: { path: "src/Application", allowed_dependencies: ["Domain"] },
      Infrastructure: {
        path: "src/Infrastructure",
        allowed_dependencies: ["Application", "Domain"],
      },
      Web: { path: "src/Web", allowed_dependencies: ["Application"] },
    },
    rules: [
      {
        id: "no-web-to-infrastructure",
        description: "Web must not depend on Infrastructure",
        severity: "error",
      },
    ],
  },
  rules: {
    rules: [
      {
        id: "no-web-to-infrastructure",
        description: "Web must not reference Infrastructure",
        severity: "error",
        type: "forbidden-dependency",
        from: "Web",
        to: "Infrastructure",
        forbidden: true,
      },
    ],
    enforcement: { mode: "error" },
  },
};

describe("checkArchitectureRules", () => {
  it("detects Web -> Infrastructure violation from using", () => {
    const result = checkArchitectureRules(baseGraph, config);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
  });
});
