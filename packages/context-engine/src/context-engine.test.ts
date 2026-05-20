import { describe, it, expect } from "vitest";
import type { RepoGraph } from "@repograph/graph-core";
import { resolveTaskModules } from "./module-resolver.js";
import { buildTaskContext } from "./context-builder.js";
import { analyzeImpactRich } from "./impact.js";
import { tokenizeTask, isExcludedPath } from "./paths.js";

const graph: RepoGraph = {
  version: "0.2.0",
  generatedAt: new Date().toISOString(),
  project: { name: "Test", root: "/test" },
  nodes: [
    { id: "module:Orders", type: "MODULE", label: "Orders", metadata: { critical: true } },
    { id: "module:Payment", type: "MODULE", label: "Payment" },
    { id: "file:src/api/orders.ts", type: "FILE", label: "src/api/orders.ts" },
    { id: "file:src/services/order-service.ts", type: "FILE", label: "src/services/order-service.ts" },
    { id: "file:src/domain/order.ts", type: "FILE", label: "src/domain/order.ts" },
    { id: "file:src/api/payment.ts", type: "FILE", label: "src/api/payment.ts" },
  ],
  edges: [
    { id: "e1", type: "BELONGS_TO", source: "file:src/api/orders.ts", target: "module:Orders" },
    { id: "e2", type: "BELONGS_TO", source: "src/services/order-service.ts", target: "module:Orders" },
    { id: "e3", type: "BELONGS_TO", source: "file:src/domain/order.ts", target: "module:Orders" },
    { id: "e4", type: "BELONGS_TO", source: "file:src/api/payment.ts", target: "module:Payment" },
    {
      id: "e5",
      type: "DEPENDS_ON",
      source: "file:src/api/orders.ts",
      target: "file:src/services/order-service.ts",
    },
    {
      id: "e6",
      type: "DEPENDS_ON",
      source: "file:src/services/order-service.ts",
      target: "file:src/domain/order.ts",
    },
    {
      id: "e7",
      type: "DEPENDS_ON",
      source: "file:src/api/payment.ts",
      target: "file:src/domain/order.ts",
    },
  ],
  violations: [],
  stats: {
    fileCount: 4,
    moduleCount: 2,
    layerCount: 0,
    dependencyCount: 3,
    unmappedFiles: 0,
    violationCount: 0,
  },
};

// Fix edge e2 source id
graph.edges[1] = {
  id: "e2",
  type: "BELONGS_TO",
  source: "file:src/services/order-service.ts",
  target: "module:Orders",
};

const config = {
  modules: {
    modules: [
      {
        name: "Orders",
        description: "Order placement and cancellation",
        paths: ["src/**/order*", "src/api/orders.ts"],
        critical: true,
      },
      {
        name: "Payment",
        description: "Payment and refund processing",
        paths: ["src/**/payment*"],
      },
    ],
  },
  glossary: {
    glossary: [
      {
        term: "Booking",
        definition: "Customer reservation",
        related_modules: ["Orders"],
      },
    ],
  },
  api: {
    apis: [
      {
        module: "Orders",
        endpoints: [{ method: "POST", path: "/api/orders/cancel", handler: "CancelOrder" }],
      },
    ],
  },
  tests: {
    tests: [{ module: "Orders", paths: ["tests/orders.test.ts"] }],
  },
  ownership: {
    owners: {
      "orders-team": { members: ["@orders-dev"], modules: ["Orders"] },
    },
  },
  ai: {
    ai: {
      exclude_paths: ["dist/**", "node_modules/**"],
    },
  },
  architecture: {
    rules: [{ id: "layering", description: "API must not import domain directly" }],
  },
  rules: {
    rules: [],
  },
  risk: {
    risks: [{ path: "src/api/**", risk: "high", reason: "Public API surface" }],
  },
};

describe("tokenizeTask", () => {
  it("splits words", () => {
    expect(tokenizeTask("Add booking cancellation")).toContain("booking");
    expect(tokenizeTask("Add booking cancellation")).toContain("cancellation");
  });
});

describe("isExcludedPath", () => {
  it("matches exclude globs", () => {
    expect(isExcludedPath("dist/out.js", ["dist/**"])).toBe(true);
    expect(isExcludedPath("src/a.ts", ["dist/**"])).toBe(false);
  });
});

describe("resolveTaskModules", () => {
  it("scores Orders for cancellation task", () => {
    const { modules } = resolveTaskModules("Add booking cancellation feature", config, graph);
    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0]?.name).toBe("Orders");
  });

  it("scores Payment for refund task", () => {
    const { modules } = resolveTaskModules("Add refund support", config, graph);
    expect(modules.some((m) => m.name === "Payment")).toBe(true);
  });
});

describe("buildTaskContext", () => {
  it("returns bounded files in strict mode", () => {
    const ctx = buildTaskContext("cancel order", graph, config, { mode: "strict" });
    expect(ctx.files.length).toBeLessThanOrEqual(8);
    expect(ctx.modules.some((m) => m.name === "Orders")).toBe(true);
    expect(ctx.rules.length).toBeGreaterThan(0);
    expect(ctx.excludePaths).toContain("dist/**");
  });

  it("includes apis and owners for orders task", () => {
    const ctx = buildTaskContext("cancel order API", graph, config, { mode: "full" });
    expect(ctx.apis.some((a) => a.path.includes("cancel"))).toBe(true);
    expect(ctx.owners).toContain("@orders-dev");
  });
});

describe("analyzeImpactRich", () => {
  it("finds reverse dependents for domain file", () => {
    const report = analyzeImpactRich(graph, config, "src/domain/order.ts", "full");
    expect(report.fileFound).toBe(true);
    expect(report.module).toBe("Orders");
    expect(report.reverseDependents.length).toBeGreaterThan(0);
    expect(report.reviewers).toContain("@orders-dev");
  });
});
