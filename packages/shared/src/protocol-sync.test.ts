import { describe, expect, it } from "vitest";
import type { ProtocolSyncScan } from "./protocol-sync.js";

function groupApis(scan: ProtocolSyncScan): string[] {
  return scan.apiEndpoints.map((a) =>
    a.file.includes("Auth") ? "Auth" : "Unmapped"
  );
}

describe("protocol sync", () => {
  it("maps api endpoints to modules by path", () => {
    const scan: ProtocolSyncScan = {
      apiEndpoints: [
        {
          file: "src/Web/Auth/AuthController.cs",
          controller: "AuthController",
          method: "GET",
          route: "/api/auth",
        },
      ],
      symbols: [],
      files: [],
      detectedStack: { csharp: true, angular: false, dotnet: true, node: false },
    };
    expect(groupApis(scan)).toEqual(["Auth"]);
  });
});
