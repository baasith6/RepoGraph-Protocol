# RepoGraph Quickstart

Get RepoGraph running on a C# + Angular (or any) repository in under five minutes.

## Install

```bash
npm install -g @repographprotocol/cli
```

Or use without installing:

```bash
npx @repographprotocol/cli@latest --help
```

## Initialize

From your repository root:

```bash
repograph init --template clean-architecture-csharp-angular
repograph validate
```

This creates `.repograph/` with `project.yml`, `modules.yml`, `architecture.yml`, and other config files.

## Scan and check

```bash
repograph scan
repograph check
repograph explain
repograph stats
```

- `scan` writes `.repograph/generated/graph.json`, `graph.mmd`, and `context-pack.md`
- `check` fails (exit code 1) when architecture rules are violated

## Export for AI tools

```bash
repograph export --format cursor
repograph export --format markdown
repograph prompt "Add booking cancellation with refund"
```

## CI (GitHub Actions)

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
      - uses: baasith6/RepoGraph-Protocol/action@v0.3.0
        with:
          fail-on: error
```

## Roslyn (optional)

Accurate C# analysis requires .NET SDK and MSBuild (e.g. Visual Studio Build Tools on Windows).  
`npm install -g @repographprotocol/cli` uses heuristic C# analysis by default.

## Next steps

- [Adopting RepoGraph](adopting.md) — map your existing folders to modules and layers
- [Protocol spec](spec/0.1.0.md) — full `.repograph` file reference
- [Example project](../examples/clean-architecture-csharp-angular/) — working demo with intentional violations
