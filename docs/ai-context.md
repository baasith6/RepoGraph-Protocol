# AI context (v0.4)

RepoGraph generates **task-aware** context for AI assistants instead of dumping the entire repository.

## Commands

### Task prompt

```bash
repograph scan
repograph prompt "Add booking cancellation with refund"
repograph prompt "Fix auth token refresh" --mode strict -o task.md
```

Modes:

| Mode | Behavior |
|------|----------|
| `short` | Fewer files (default cap 15), top 2 modules |
| `full` | More files (cap 50), top 3 modules |
| `strict` | Minimal files (cap 8), rules and risks always included |

### Impact analysis

```bash
repograph impact src/domain/order.ts
repograph impact src/api/orders.ts --json
```

Shows module, risk, reverse dependents, APIs, tests, reviewers, and suggested AI context files.

### Export for AI tools

```bash
repograph export --format cursor
repograph export --format claude
repograph export --format copilot
repograph export --format claude --task "Add refund to cancellation"
```

| Format | Default output |
|--------|----------------|
| `cursor` | `.cursor/rules/repograph.mdc` |
| `claude` | `CLAUDE.md` |
| `copilot` | `.github/copilot-instructions.md` |

### Scan artifacts

After `repograph scan`:

- `context-pack.md` — full project context
- `context-pack.short.md` — compact general-development context

## MCP (Cursor, Claude Desktop)

```bash
pnpm build
REPOGRAPH_ROOT=/path/to/repo node apps/mcp-server/dist/index.js
```

Tools:

- `repograph_prompt` — task string → markdown context
- `repograph_impact` — file path → impact report (`json` optional)

## VS Code

Command palette: **RepoGraph: Copy Task Prompt** — asks for a task and copies structured context to the clipboard.

## How module matching works

Deterministic scoring (no LLM):

1. Task keywords vs module names and descriptions
2. Glossary terms and `related_modules`
3. API routes and handlers in `api.yml`

If nothing matches, critical modules are used and a warning is included in the output.

## Safety

Paths in `ai.yml` `exclude_paths` are never suggested for edits. Generated output under `.repograph/generated/` is excluded by default.
