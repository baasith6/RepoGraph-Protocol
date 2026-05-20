import {
  buildGeneralContext,
  buildTaskContext,
  formatTaskContextForInstructions,
  type ContextMode,
} from "@repograph/context-engine";
import type { RepoGraph } from "@repograph/graph-core";
import type { RepographConfig } from "@repograph/shared";

export function exportClaudeContext(
  graph: RepoGraph,
  config: RepographConfig,
  options?: { task?: string; mode?: ContextMode }
): string {
  const mode = options?.mode ?? "full";
  const ctx = options?.task
    ? buildTaskContext(options.task, graph, config, { mode })
    : buildGeneralContext(graph, config, mode);

  const project = config.project?.project as Record<string, string> | undefined;
  const title = project?.name ?? graph.project.name;

  return formatTaskContextForInstructions(ctx, `${title} — RepoGraph Context`);
}
