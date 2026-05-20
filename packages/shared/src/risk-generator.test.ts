import { describe, expect, it } from "vitest";
import { generateRiskYamlFromGraph } from "./risk-generator.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("risk generator", () => {
  it("writes risk.yml for central files", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repograph-risk-"));
    await fs.mkdir(path.join(root, ".repograph"), { recursive: true });

    const graph = {
      nodes: [
        { id: "file:a.ts", type: "FILE", label: "src/A.ts" },
        { id: "file:b.ts", type: "FILE", label: "src/B.ts" },
        { id: "file:c.ts", type: "FILE", label: "src/C.ts" },
      ],
      edges: [
        { type: "DEPENDS_ON", source: "file:a.ts", target: "file:b.ts" },
        { type: "DEPENDS_ON", source: "file:c.ts", target: "file:b.ts" },
      ],
    };

    const res = await generateRiskYamlFromGraph(root, graph as any);
    expect(res.updated).toBe(true);
    const raw = await fs.readFile(path.join(root, ".repograph", "risk.yml"), "utf-8");
    expect(raw).toContain("risks:");
  });
});

