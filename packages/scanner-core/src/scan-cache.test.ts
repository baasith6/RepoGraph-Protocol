import { describe, it, expect } from "vitest";
import { hashConfig, createEmptyCache } from "./scan-cache.js";

describe("scan-cache", () => {
  it("hashConfig changes when modules change", () => {
    const a = hashConfig({
      modules: { modules: [{ name: "A", paths: ["src/a/**"] }] },
    } as never);
    const b = hashConfig({
      modules: { modules: [{ name: "B", paths: ["src/b/**"] }] },
    } as never);
    expect(a).not.toBe(b);
  });

  it("createEmptyCache has version and files map", () => {
    const cache = createEmptyCache("abc");
    expect(cache.version).toBe(1);
    expect(cache.configHash).toBe("abc");
    expect(cache.files).toEqual({});
  });
});
