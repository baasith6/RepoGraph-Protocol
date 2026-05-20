# RepoGraph Protocol

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@repographprotocol/cli)](https://www.npmjs.com/package/@repographprotocol/cli)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](.github/workflows/repograph.yml)

> **Machine-readable context for human and AI developers.**

RepoGraph turns a repository into a structured **knowledge graph** — modules, layers, dependencies, APIs, risks, ownership, and architecture rules — so developers, CI, and AI tools work from **trusted context**, not guesses.

<p align="center">
  <img src="docs/assets/demo-flow.svg" alt="RepoGraph workflow: init, scan, check, export" width="900"/>
</p>

<p align="center">
  <em>Static preview. Record a GIF with <a href="docs/assets/RECORD_DEMO.md">docs/assets/RECORD_DEMO.md</a>.</em>
</p>

---

## Install

**Requires Node.js 20+**

```bash
npm install -g @repographprotocol/cli@0.2.1
repograph --version
```

One-off (no global install):

```bash
npx @repographprotocol/cli@0.2.1 --help
```

> Use **0.2.1 or later**. `@repographprotocol/cli@0.2.0` has a known runtime issue on global install.

---

## Quick start (60 seconds)

```bash
cd your-repo
repograph init --template clean-architecture-csharp-angular
repograph validate
repograph scan
repograph sync
repograph check
repograph export --format cursor
```

| Step | What you get |
|------|----------------|
| `init` | `.repograph/*.yml` — modules, layers, rules, AI hints |
| `scan` | `graph.json`, Mermaid diagram, context pack |
| `sync` | Updates ownership, risk, glossary from scan + CODEOWNERS |
| `check` | Fails CI when architecture rules break |
| `export` | Cursor rules / markdown for AI assistants |

Full guide: [docs/quickstart.md](docs/quickstart.md)

---

## Examples

Three real examples are included — pick the stack closest to yours:

| Example | Stack | Highlights |
|---------|-------|------------|
| [clean-architecture-csharp-angular](examples/clean-architecture-csharp-angular/) | .NET + Angular | Layer violations, Roslyn-ready |
| [nodejs-layered-api](examples/nodejs-layered-api/) | TypeScript API | api → services → domain |
| [dotnet-modular-monolith](examples/dotnet-modular-monolith/) | .NET modular | Catalog + Orders modules |

```bash
cd examples/nodejs-layered-api
repograph scan && repograph check
```

Index: [examples/README.md](examples/README.md)

---

## GitHub Actions

Add to pull requests:

```yaml
name: RepoGraph

on:
  pull_request:
    branches: [main]

jobs:
  repograph:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: baasith6/RepoGraph-Protocol/action@v0.2.1
        with:
          fail-on: error
          comment-pr: true
```

---

## CLI commands

| Command | Description |
|---------|-------------|
| `repograph init` | Create `.repograph` and starter config |
| `repograph validate` | Validate YAML against JSON Schema |
| `repograph doctor` | Health check for RepoGraph setup |
| `repograph scan` | Scan repo and generate graph |
| `repograph sync` | Scan + sync ownership, risk, glossary |
| `repograph check` | Enforce architecture rules |
| `repograph diff` | Compare graphs between git refs |
| `repograph explain` | Explain project, module, or file |
| `repograph list` | List modules, layers, or violations |
| `repograph visualize` | Mermaid dependency diagrams |
| `repograph stats` | Repository metrics |
| `repograph export` | json, markdown, mermaid, cursor |
| `repograph prompt` | AI-ready task context |
| `repograph impact` | Blast radius for a file change |

---

## The `.repograph` protocol

```txt
.repograph/
  project.yml
  modules.yml
  architecture.yml
  rules.yml
  tests.yml
  ai.yml
  api.yml
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

- Spec v0.1: [docs/spec/0.1.0.md](docs/spec/0.1.0.md)
- Spec v0.2: [docs/spec/0.2.0.md](docs/spec/0.2.0.md)

---

## Integrations

### MCP (Cursor, Claude, etc.)

```bash
pnpm build
REPOGRAPH_ROOT=/path/to/your/repo node apps/mcp-server/dist/index.js
```

Tools: `repograph_get_graph`, `repograph_explain`, `repograph_list_violations`, `repograph_impact`, `repograph_scan`.

### VS Code

Open `apps/vscode` and press **F5** — Explorer views for modules and violations when `.repograph/project.yml` exists.

---

## Releases and changelog

We publish [GitHub Releases](https://github.com/baasith6/RepoGraph-Protocol/releases) with human-readable notes so you can see what changed without reading the whole repo.

| Version | Notes |
|---------|--------|
| [v1.0.0](docs/releases/v1.0.0.md) | First public release (recommended starting point) |
| [v0.2.1](docs/releases/v0.2.1.md) | npm CLI runtime fix |
| [v0.2.0](docs/releases/v0.2.0.md) | diff, Roslyn, protocol 0.2 |
| [v0.1.0](docs/releases/v0.1.0.md) | Initial protocol + CLI |

Full history: [CHANGELOG.md](CHANGELOG.md) · Release index: [docs/releases/README.md](docs/releases/README.md)

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

---

## License

[Apache-2.0](LICENSE) — see [LICENSE](LICENSE) for full text.

---

## Suggested GitHub topics

When promoting the repo, add topics such as: `architecture`, `static-analysis`, `developer-tools`, `ai-tools`, `cursor`, `clean-architecture`, `dotnet`, `typescript`, `monorepo`, `github-actions`, `knowledge-graph`.

Full list: [.github/TOPICS.md](.github/TOPICS.md)
