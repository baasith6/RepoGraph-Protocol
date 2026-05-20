import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { checkGraphDrift } from "./graph-drift.js";
import { computeScanSignature } from "./scan-signature.js";

async function writeGraph(
  root: string,
  body: { stats?: { scanSignature?: string } } | string
): Promise<void> {
  const generated = path.join(root, ".repograph", "generated");
  await fs.mkdir(generated, { recursive: true });
  const content = typeof body === "string" ? body : JSON.stringify(body);
  await fs.writeFile(path.join(generated, "graph.json"), content, "utf-8");
}

describe("checkGraphDrift", () => {
  it("returns unavailable when graph.json is missing", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repograph-drift-"));
    const result = await checkGraphDrift(root);
    expect(result.unavailable).toBe(true);
    expect(result.drifted).toBe(false);
    expect(result.message).toContain("No graph.json found");
  });

  it("returns unavailable when graph.json is invalid JSON", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repograph-drift-"));
    await writeGraph(root, "{ not json");
    const result = await checkGraphDrift(root);
    expect(result.unavailable).toBe(true);
    expect(result.drifted).toBe(false);
    expect(result.message).toContain("Could not parse graph.json");
  });

  it("returns info message when scanSignature is absent", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repograph-drift-"));
    await writeGraph(root, { stats: {} });
    const result = await checkGraphDrift(root);
    expect(result.unavailable).toBeUndefined();
    expect(result.drifted).toBe(false);
    expect(result.message).toContain("No scan signature");
  });

  it("returns drifted:false when stored signature matches repository", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repograph-drift-"));
    await fs.writeFile(path.join(root, "app.ts"), "export const x = 1;\n", "utf-8");
    const signature = await computeScanSignature(root);
    await writeGraph(root, { stats: { scanSignature: signature } });

    const result = await checkGraphDrift(root);
    expect(result.drifted).toBe(false);
    expect(result.storedSignature).toBe(signature);
    expect(result.currentSignature).toBe(signature);
  });

  it("returns drifted:true after a tracked code file changes", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repograph-drift-"));
    const filePath = path.join(root, "app.ts");
    await fs.writeFile(filePath, "export const x = 1;\n", "utf-8");
    const signature = await computeScanSignature(root);
    await writeGraph(root, { stats: { scanSignature: signature } });

    await fs.writeFile(filePath, "export const x = 2;\n", "utf-8");
    const result = await checkGraphDrift(root);
    expect(result.drifted).toBe(true);
    expect(result.message).toContain("Repository changed");
    expect(result.storedSignature).toBe(signature);
    expect(result.currentSignature).not.toBe(signature);
  });

  it("ignores gitignored files when computing drift", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repograph-drift-"));
    await fs.writeFile(path.join(root, "app.ts"), "export const x = 1;\n", "utf-8");
    await fs.writeFile(path.join(root, ".gitignore"), "ignored.ts\n", "utf-8");
    const signature = await computeScanSignature(root);
    await writeGraph(root, { stats: { scanSignature: signature } });

    await fs.writeFile(path.join(root, "ignored.ts"), "export const y = 9;\n", "utf-8");
    const result = await checkGraphDrift(root);
    expect(result.drifted).toBe(false);
  });
});
