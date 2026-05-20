import { describe, it, expect } from "vitest";
import { analyzeCSharpFile, analyzeCsproj } from "./index.js";

describe("analyzeCSharpFile", () => {
  it("extracts using statements", () => {
    const content = `
using System;
using CarRentalExample.Domain.Auth;

namespace Test;
`;
    const deps = analyzeCSharpFile("src/Web/Test.cs", content);
    expect(deps.some((d) => d.target.includes("Domain"))).toBe(true);
  });
});

describe("analyzeCsproj", () => {
  it("extracts project references", () => {
    const content = `<ProjectReference Include="../Infrastructure/Infrastructure.csproj" />`;
    const deps = analyzeCsproj("src/Web/Web.csproj", content);
    expect(deps.length).toBe(1);
    expect(deps[0].target).toContain("Infrastructure");
  });
});
