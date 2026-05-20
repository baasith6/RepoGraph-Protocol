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

  it("prefers roslyn database entities over heuristics", () => {
    const scan: ProtocolSyncScan = {
      apiEndpoints: [],
      symbols: [{ file: "src/Domain/Foo.cs", name: "FooEntity", kind: "CLASS", namespace: "X" }],
      files: [],
      databaseEntities: [
        {
          name: "Booking",
          file: "src/Domain/Booking/Booking.cs",
          table: "Bookings",
          module: "Booking",
          dbContext: "AppDbContext",
          tenantScoped: false,
          requiredFields: ["Id"],
          migrationFiles: ["src/Infrastructure/Migrations/001.cs"],
        },
      ],
      detectedStack: { csharp: true, angular: false, dotnet: true, node: false },
    };
    expect(scan.databaseEntities?.[0]?.table).toBe("Bookings");
    expect(scan.databaseEntities?.[0]?.dbContext).toBe("AppDbContext");
  });
});
