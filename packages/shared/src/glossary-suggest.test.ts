import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { suggestGlossary } from "./glossary-suggest.js";

describe("glossary suggest", () => {
  it("creates glossary.yml with suggested terms", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repograph-glossary-"));
    await fs.mkdir(path.join(root, ".repograph"), { recursive: true });
    await fs.writeFile(path.join(root, "README.md"), "# Payments Service\n\nUses `PaymentTransaction`", "utf-8");

    const res = await suggestGlossary(root);
    expect(res.updated).toBe(true);
    const yml = await fs.readFile(path.join(root, ".repograph", "glossary.yml"), "utf-8");
    expect(yml).toContain("glossary:");
  });
});

