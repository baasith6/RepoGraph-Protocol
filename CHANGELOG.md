# Changelog

## [0.2.0] - 2026-05-20

### Added

- `repograph diff` — compare architecture graphs between git refs
- Roslyn C# analyzer (`tools/repograph-roslyn`) with fallback to heuristics
- Protocol v0.2.0 stub files: `api.yml`, `database.yml`, `risk.yml`, `ownership.yml`, `glossary.yml`
- GitHub Composite Action at `action/action.yml`
- npm bundle publish pipeline for `@repograph/cli`
- [docs/quickstart.md](docs/quickstart.md) and [docs/adopting.md](docs/adopting.md)
- [docs/spec/0.2.0.md](docs/spec/0.2.0.md)

### Changed

- CLI version 0.2.0; improved schema path resolution for global installs
- Example project updated to protocol 0.2.0

## [0.1.1] - 2026-05-20

### Added

- npm publish support for `@repograph/cli` (bundled distribution)
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
