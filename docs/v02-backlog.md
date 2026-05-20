# RepoGraph v0.2 Backlog

Items deferred from v0.1 to keep the initial release focused.

## Analyzers

- [ ] **Roslyn-based C# analyzer** (`repograph-analyzer-csharp` v2)
  - Symbol-level index (classes, methods, interfaces)
  - Accurate dependency resolution across projects
  - Entity/model extraction from EF configurations

- [ ] **TypeScript compiler API analyzer**
  - Angular route and DI graph
  - Accurate import resolution via `tsconfig.json`

## Protocol Extensions

- [ ] `api.yml` — auto-detect from controllers/routes
- [ ] `database.yml` — EF migrations and entity mapping
- [ ] `ownership.yml` — CODEOWNERS import/export
- [ ] `risk.yml` — path-based risk scoring
- [ ] `glossary.yml` — domain terminology

## CLI

- [ ] `repograph diff` — compare graph between branches
- [ ] `repograph validate` — validate generated graph against live code

## Integrations

- [ ] **MCP server** (`apps/mcp-server`) — expose graph and explain over MCP
- [ ] **VS Code extension** — module sidebar, architecture warnings, impact preview
- [ ] Azure DevOps pipeline task
- [ ] GitLab CI template

## Infrastructure

- [ ] SQLite cache for incremental scans
- [ ] Plugin system for custom analyzers and exporters
- [ ] Dashboard (`apps/dashboard`) for graph visualization

## Priority Order

1. Roslyn C# analyzer (highest value for .NET teams)
2. `repograph diff` for PR reviews
3. MCP server for AI tool integration
4. VS Code extension (read-only module sidebar first)
5. `api.yml` and `database.yml` auto-population
