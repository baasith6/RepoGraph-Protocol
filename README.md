# RepoGraph Protocol

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@repographprotocol/cli)](https://www.npmjs.com/package/@repographprotocol/cli)

> Machine-readable context for human and AI developers.

RepoGraph turns a repository into a structured knowledge graph that AI tools, developers, and CI pipelines can understand.

## Install

```bash
npm install -g @repographprotocol/cli
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
- uses: baasith6/RepoGraph-Protocol/action@v0.2.1
  with:
    working-directory: .
    fail-on: error
    comment-pr: true
```

Pin to `@0.2.1` or later. **Do not use `@0.2.0`** — that npm release fails at runtime.

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

## MCP Server (AI tools)

```bash
pnpm build
# From a repo with .repograph/ initialized:
REPOGRAPH_ROOT=/path/to/your/repo node apps/mcp-server/dist/index.js
```

Tools: `repograph_get_graph`, `repograph_explain`, `repograph_list_violations`, `repograph_impact`, `repograph_scan`.

## VS Code Extension

Open `apps/vscode` in VS Code and press F5, or build with `pnpm --filter repograph-vscode build`.  
Shows **RepoGraph Modules** and **RepoGraph Violations** in the Explorer when `.repograph/project.yml` exists.

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm repograph -- --help
```

Roslyn analyzer (optional, requires .NET 8 SDK + MSBuild on PATH):

```bash
dotnet build tools/repograph-roslyn/Repograph.Roslyn.csproj
```

Global npm install uses **heuristic** C# analysis unless Roslyn is available locally.

## License

Apache-2.0
