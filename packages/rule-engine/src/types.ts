import type { Violation } from "@repograph/graph-core";

export type EnforcementMode = "warning" | "error" | "strict";

export interface RuleCheckResult {
  violations: Violation[];
  passed: boolean;
}
