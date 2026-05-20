# RepoGraph Backlog

Status as of **v0.3.0**. Phase A (ownership, risk, glossary sync) is **shipped**.

## Completed in v0.2.x – v0.3.0

### Analyzers

- [x] Roslyn-based C# analyzer (`tools/repograph-roslyn`)
- [x] TypeScript compiler API analyzer (`packages/analyzers/typescript`)
- [x] Protocol sync: `api.yml`, `database.yml` from scan

### Protocol & governance (Phase A)

- [x] `ownership.yml` — CODEOWNERS import/export via `repograph sync`
- [x] `risk.yml` — signals-based scoring with manual override preservation
- [x] `glossary.yml` — term suggestions from identifiers and docs

### CLI

- [x] `repograph diff` — compare graphs between git refs
- [x] Incremental scan cache (`scan-cache.json`)
- [x] Graph drift in `repograph validate` (`scanSignature` + `--strict`)

### Integrations

- [x] GitHub Composite Action
- [x] MCP server (`apps/mcp-server`)
- [x] VS Code extension (`apps/vscode`, read-only)

### Repo / docs

- [x] README, 3 examples, GitHub Releases workflow, demo GIF

## v0.3.x deferred

### Analyzers

- [ ] EF configuration / migration parsing for `database.yml`
- [ ] Angular route and DI graph (full compiler integration)

### Integrations

- [ ] Azure DevOps pipeline task
- [ ] GitLab CI template
- [ ] GitHub Marketplace listing for the action
- [ ] Publish VS Code extension to Marketplace

### Infrastructure

- [ ] SQLite-backed cache (optional upgrade from JSON cache)
- [ ] Plugin system for custom analyzers and exporters
- [ ] Dashboard (`apps/dashboard`) for graph visualization

## Priority order (v0.3.1+)

1. EF → `database.yml` enrichment
2. Angular analyzer depth
3. VS Code extension publish + Marketplace action
4. Azure DevOps / GitLab templates
5. Plugin system
6. Dashboard
