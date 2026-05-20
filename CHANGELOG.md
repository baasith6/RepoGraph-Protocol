# Changelog

All notable changes are documented here. GitHub Release notes live in [docs/releases/](docs/releases/).

## [0.5.0] - 2026-05-20

### Added

- Roslyn EF Core / migration scanner → rich `database.yml`
- Bundled `roslyn-tool` in npm CLI package for global installs
- `@repograph/analyzer-angular` for Angular route detection
- Azure DevOps and GitLab CI templates (`docs/ci/`)
- MCP and VS Code integration guides (`docs/integrations/`)

### Changed

- `@repograph/mcp-server` publishable on npm (version 0.5.0)
- CLI version **0.5.0**

## [0.4.0] - 2026-05-20

### Added

- Task-aware AI context engine (`@repograph/context-engine`)
- `repograph prompt --mode short|full|strict` — focused modules, files, rules, risks
- `repograph impact --json` — reverse dependents, APIs, reviewers, AI file list
- `repograph export --format claude|copilot`
- `context-pack.short.md` on scan
- MCP tool `repograph_prompt`
- VS Code command **RepoGraph: Copy Task Prompt**

### Changed

- `repograph prompt` no longer embeds the full context pack for every task
- CLI version **0.4.0**

## [0.3.0] - 2026-05-20

### Added

- Incremental scan cache (`.repograph/generated/scan-cache.json`) for faster `repograph scan`
- Graph drift detection in `repograph validate` with optional `--strict`
- `scanSignature` in `graph.json` stats
- README demo GIF (`docs/assets/demo.gif`)

### Changed

- CLI and GitHub Action version **0.3.0**

## [1.0.0] - 2026-05-20

First public release — recommended for new adopters.

### Added

- Strong README with install, quick start, demo preview, and three examples
- Examples: [nodejs-layered-api](examples/nodejs-layered-api/), [dotnet-modular-monolith](examples/dotnet-modular-monolith/)
- [examples/README.md](examples/README.md) index
- GitHub Releases workflow and [docs/releases/README.md](docs/releases/README.md)
- Demo asset [docs/assets/demo-flow.svg](docs/assets/demo-flow.svg) + [RECORD_DEMO.md](docs/assets/RECORD_DEMO.md)
- [.github/TOPICS.md](.github/TOPICS.md) — suggested repository topics

### Includes (from prior releases)

- MCP server, VS Code extension (monorepo)
- Ownership / risk / glossary sync via `repograph sync`
- `@repographprotocol/cli@0.2.1` on npm
- GitHub Action `action@v0.2.1`

## [0.2.1] - 2026-05-20

### Fixed

- npm-published CLI runtime crash by bundling to CommonJS output (`dist/index.cjs`) and updating `bin`.

## [0.2.0] - 2026-05-20

### Added

- `repograph diff` — compare architecture graphs between git refs
- Roslyn C# analyzer (`tools/repograph-roslyn`) with fallback to heuristics
- Protocol v0.2.0 stub files: `api.yml`, `database.yml`, `risk.yml`, `ownership.yml`, `glossary.yml`
- GitHub Composite Action at `action/action.yml`
- npm bundle publish pipeline for `@repographprotocol/cli`
- [docs/quickstart.md](docs/quickstart.md) and [docs/adopting.md](docs/adopting.md)
- [docs/spec/0.2.0.md](docs/spec/0.2.0.md)

### Changed

- CLI version 0.2.0; improved schema path resolution for global installs
- Example project updated to protocol 0.2.0

## [0.1.1] - 2026-05-20

### Added

- npm publish support for `@repographprotocol/cli` (bundled distribution)
- GitHub Composite Action at `action/action.yml`
- Quickstart and adopting guides
- `repograph diff` command (compare graphs between git refs)
- Roslyn-based C# analyzer (optional, when .NET SDK available)
- Protocol v0.2.0 stub files in `repograph init`

### Changed

- Schema resolution works when CLI is installed globally via npm

## [0.1.0] - 2026-05-20

### Added

- Initial RepoGraph Protocol v0.1
- CLI: init, validate, doctor, scan, sync, check, explain, list, visualize, stats, export, prompt, impact
- Heuristic C# and TypeScript analyzers
- Example Clean Architecture C# + Angular project
