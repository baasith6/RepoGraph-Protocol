import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  checkGraphDrift: vi.fn(),
  validateRepographDir: vi.fn(),
  repographExists: vi.fn(),
  getRepographDir: vi.fn(),
  getRoot: vi.fn(),
  log: vi.fn(),
}));

vi.mock("@repograph/scanner-core", () => ({
  checkGraphDrift: mocks.checkGraphDrift,
}));

vi.mock("@repograph/protocol", () => ({
  validateRepographDir: mocks.validateRepographDir,
}));

vi.mock("@repograph/shared", () => ({
  getRepographDir: mocks.getRepographDir,
  log: mocks.log,
  repographExists: mocks.repographExists,
}));

vi.mock("../context.js", () => ({
  getRoot: mocks.getRoot,
}));

import { validateCommand } from "./validate.js";

describe("validateCommand", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRoot.mockReturnValue("/tmp/repo");
    mocks.getRepographDir.mockReturnValue("/tmp/repo/.repograph");
    mocks.repographExists.mockResolvedValue(true);
    mocks.validateRepographDir.mockResolvedValue({ valid: true, errors: [] });
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it("exits 1 with error when graph is unavailable and --strict", async () => {
    mocks.checkGraphDrift.mockResolvedValue({
      drifted: false,
      unavailable: true,
      message: "No graph.json found. Run 'repograph scan' to generate it.",
    });

    await validateCommand({ strict: true });

    expect(mocks.log).toHaveBeenCalledWith(
      "error",
      "No graph.json found. Run 'repograph scan' to generate it."
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("warns but does not exit when graph is unavailable without --strict", async () => {
    mocks.checkGraphDrift.mockResolvedValue({
      drifted: false,
      unavailable: true,
      message: "No graph.json found. Run 'repograph scan' to generate it.",
    });

    await validateCommand();

    expect(mocks.log).toHaveBeenCalledWith(
      "warn",
      "No graph.json found. Run 'repograph scan' to generate it."
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("exits 1 when drifted and --strict", async () => {
    mocks.checkGraphDrift.mockResolvedValue({
      drifted: true,
      message: "Repository changed since last scan. Run 'repograph scan' to refresh graph.json.",
    });

    await validateCommand({ strict: true });

    expect(mocks.log).toHaveBeenCalledWith(
      "warn",
      "Repository changed since last scan. Run 'repograph scan' to refresh graph.json."
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("warns but does not exit when drifted without --strict", async () => {
    mocks.checkGraphDrift.mockResolvedValue({
      drifted: true,
      message: "Repository changed since last scan.",
    });

    await validateCommand();

    expect(mocks.log).toHaveBeenCalledWith("warn", "Repository changed since last scan.");
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("logs info when graph has no scan signature", async () => {
    mocks.checkGraphDrift.mockResolvedValue({
      drifted: false,
      message: "No scan signature in graph.json (run repograph scan).",
    });

    await validateCommand();

    expect(mocks.log).toHaveBeenCalledWith(
      "info",
      "No scan signature in graph.json (run repograph scan)."
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
