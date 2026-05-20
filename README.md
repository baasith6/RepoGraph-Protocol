# RepoGraph Protocol

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@repograph/cli)](https://www.npmjs.com/package/@repograph/cli)

> Machine-readable context for human and AI developers.

RepoGraph turns a repository into a structured knowledge graph that AI tools, developers, and CI pipelines can understand.

## Install

```bash
npm install -g @repograph/cli
```

## Quick Start

```bash
repograph init --template clean-architecture-csharp-angular
repograph validate
repograph scan
repograph check
repograph explain
repograph export --format cursor
```

See [docs/quickstart.md](docs/quickstart.md) for the full guide.

## CLI Commands

| Command | Description |
|---------|-------------|
| `repograph init` | Create `.repograph` folder and starter config |
| `repograph validate` | Validate `.repograph` config files |
| `repograph doctor` | Check RepoGraph setup health |
| `repograph scan` | Scan repository and generate graph |
| `repograph sync` | Scan and update generated files |
| `repograph check` | Validate architecture rules |
| `repograph diff` | Compare graphs between git refs |
| `repograph explain` | Explain project, module, or file |
| `repograph list <type>` | List modules, layers, or violations |
| `repograph visualize` | Generate Mermaid diagrams |
| `repograph stats` | Show repository metrics |
| `repograph export --format <fmt>` | Export to json, markdown, mermaid, cursor |
| `repograph prompt "<task>"` | Generate AI-ready task context |
| `repograph impact <file>` | Show change impact analysis |

## GitHub Actions

```yaml
- uses: baasith6/RepoGraph-Protocol/action@v0.2.0
  with:
    fail-on: error
    comment-pr: true
```

## The `.repograph` Protocol

```txt
.repograph/
  project.yml
  modules.yml
  architecture.yml
  rules.yml
  tests.yml
  ai.yml
  api.yml           # v0.2+
  database.yml
  risk.yml
  ownership.yml
  glossary.yml
  decisions/
  generated/
    graph.json
    graph.mmd
    context-pack.md
```

- Protocol v0.1: [docs/spec/0.1.0.md](docs/spec/0.1.0.md)
- Protocol v0.2: [docs/spec/0.2.0.md](docs/spec/0.2.0.md)

## Example

```bash
cd examples/clean-architecture-csharp-angular
repograph scan
repograph check
repograph explain -m Auth
```

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm repograph -- --help
```

Roslyn analyzer (optional, requires .NET 8 SDK):

```bash
dotnet build tools/repograph-roslyn/Repograph.Roslyn.csproj
```

## License

Apache-2.0
