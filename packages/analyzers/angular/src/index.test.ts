import { describe, expect, it } from "vitest";

// Test regex extractor (mirrors analyzeAngularProject fallback)
function extractRoutesFromSource(filePath: string, content: string) {
  const ROUTE_PATH_REGEX = /path\s*:\s*['"`]([^'"`]+)['"`]/g;
  const routes: Array<{ file: string; path: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = ROUTE_PATH_REGEX.exec(content)) !== null) {
    routes.push({ file: filePath, path: match[1] });
  }
  return routes;
}

describe("angular route extraction", () => {
  it("finds path properties in route config", () => {
    const content = `
      export const routes = [
        { path: 'login', component: LoginComponent },
        { path: "booking", component: BookingComponent },
      ];
    `;
    const routes = extractRoutesFromSource("client/src/app.routes.ts", content);
    expect(routes.map((r) => r.path)).toEqual(["login", "booking"]);
  });
});
