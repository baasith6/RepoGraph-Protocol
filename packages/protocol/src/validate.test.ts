import { describe, it, expect } from "vitest";
import { validateConfigFile } from "./validate.js";

describe("validateConfigFile", () => {
  it("validates project.yml", async () => {
    const content = `
protocol:
  name: RepoGraph
  version: 0.1.0
project:
  name: TestProject
`;
    const result = await validateConfigFile("project.yml", content);
    expect(result.valid).toBe(true);
  });

  it("rejects invalid project.yml", async () => {
    const content = `
protocol:
  name: Wrong
  version: 0.1.0
project:
  name: Test
`;
    const result = await validateConfigFile("project.yml", content);
    expect(result.valid).toBe(false);
  });

  it("validates modules.yml", async () => {
    const content = `
modules:
  - name: Auth
    paths:
      - "src/**"
`;
    const result = await validateConfigFile("modules.yml", content);
    expect(result.valid).toBe(true);
  });
});
