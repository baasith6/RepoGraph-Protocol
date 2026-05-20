import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import type { OwnershipDoc } from "./ownership-sync.js";

describe("ownership schema shape", () => {
  it("parses owners->modules mapping", () => {
    const raw = `
owners:
  "@team-auth":
    modules: [Auth, Booking]
`;
    const doc = parseYaml(raw) as OwnershipDoc;
    expect(doc.owners?.["@team-auth"]?.modules).toEqual(["Auth", "Booking"]);
  });
});

