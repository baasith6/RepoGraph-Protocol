# RepoGraph Backlog

Status as of **v0.5.0**. Phase A (ownership, risk, glossary sync) is **shipped**.

## Completed in v0.4.0

### AI context (PRD Modules 9, 10, 20)

- [x] `@repograph/context-engine` — task→module scoring, file selection, reverse `DEPENDS_ON`
- [x] `repograph prompt --mode short|full|strict`
- [x] `repograph impact --json` with APIs, tests, reviewers
- [x] `repograph export --format claude|copilot`
- [x] `context-pack.short.md` on scan
- [x] MCP `repograph_prompt`
- [x] VS Code **Copy Task Prompt**

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

## Completed in v0.5.0

### Analyzers

- [x] EF / DbContext / migration parsing for `database.yml` (Roslyn)
- [x] Angular route extraction (`@repograph/analyzer-angular`)
- [x] Roslyn tool bundled in npm CLI (`dist/roslyn-tool`)

### Integrations

- [x] Azure DevOps pipeline template (`docs/ci/azure-pipelines-repograph.yml`)
- [x] GitLab CI template (`docs/ci/gitlab-repograph.yml`)
- [x] MCP integration docs; `@repograph/mcp-server` npm-ready
- [x] VS Code Marketplace metadata + integration docs

## v0.5.x deferred

### Integrations

- [ ] GitHub Marketplace listing for the action (manual submit)
- [ ] Publish VS Code extension to Marketplace (`vsce publish`)
- [ ] Publish `@repograph/mcp-server` to npm (requires `NPM_TOKEN`)

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
