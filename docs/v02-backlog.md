# RepoGraph Backlog

Status as of v0.2.1. See [v0.3 roadmap](#v03-deferred) for next work.

## Completed in v0.2.x

### Analyzers

- [x] **Roslyn-based C# analyzer** (`tools/repograph-roslyn`, `@repograph/analyzer-csharp-roslyn`)
  - Symbol index, project references, API endpoints (when .NET SDK + MSBuild available)
  - Falls back to heuristic analyzer for npm global install / CI without MSBuild

- [x] **TypeScript compiler API analyzer** (v0.3 — `packages/analyzers/typescript`)
  - tsconfig-aware import resolution when `tsconfig.json` is present

### Protocol Extensions

- [x] `api.yml`, `database.yml`, `risk.yml`, `ownership.yml`, `glossary.yml` — stubs in `repograph init`
- [x] `api.yml` / `database.yml` — auto-populated from scan when endpoints/entities are detected (v0.3)

### CLI

- [x] `repograph diff` — compare graph between git refs
- [x] npm publish `@repographprotocol/cli` with bundled distribution

### Integrations

- [x] **GitHub Composite Action** (`action/action.yml`)
- [x] **MCP server** (`apps/mcp-server`) — graph, explain, impact, violations tools (v0.3)
- [x] **VS Code extension** (`apps/vscode`) — module tree + violations panel (read-only, v0.3)

## v0.3 deferred

### Analyzers

- [ ] EF configuration / migration parsing for `database.yml`
- [ ] Angular route and DI graph (full compiler integration)

### Protocol Extensions

- [ ] `ownership.yml` — CODEOWNERS import/export
- [ ] `risk.yml` — automated path-based risk scoring
- [ ] `glossary.yml` — term extraction from code/comments

### CLI

- [ ] `repograph validate` — validate generated graph against live code drift

### Integrations

- [ ] Azure DevOps pipeline task
- [ ] GitLab CI template
- [ ] GitHub Marketplace listing for the action

### Infrastructure

- [ ] SQLite cache for incremental scans
- [ ] Plugin system for custom analyzers and exporters
- [ ] Dashboard (`apps/dashboard`) for graph visualization

## Priority Order (v0.3+)

1. CODEOWNERS → `ownership.yml` sync
2. Incremental scan cache
3. Plugin system
4. Azure DevOps / GitLab templates
