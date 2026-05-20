# Dogfood Report — Example Project

RepoGraph was run on [`examples/clean-architecture-csharp-angular`](../examples/clean-architecture-csharp-angular/).

## Commands

```bash
cd examples/clean-architecture-csharp-angular
repograph validate
repograph scan
repograph check
repograph list violations
repograph explain -m Auth
```

## Findings

| Area | Result |
|------|--------|
| **Init template** | `clean-architecture-csharp-angular` maps modules (Auth, Booking, Payment) to C# + Angular paths |
| **Intentional violation** | `Web → Infrastructure` dependency detected by `repograph check` |
| **Scan output** | `graph.json`, `graph.mmd`, `context-pack.md` generated under `.repograph/generated/` |
| **api.yml sync** | Populated when Roslyn detects API endpoints (requires .NET + MSBuild locally) |
| **database.yml sync** | Populated when `*Entity` classes or `Entities/` paths are found in scan symbols |
| **npm global install** | Use `@repographprotocol/cli@0.2.1+`; heuristic C# without Roslyn |

## Template improvements applied

- Protocol sync writes `api.yml` / `database.yml` after scan when data is available
- Quickstart documents Roslyn vs heuristic behavior
- CI validates monorepo build, published npm CLI, and composite action

## Recommended for real repos

1. Run `repograph init` with the closest template
2. Tune `modules.yml` paths until `repograph stats` shows few unmapped files
3. Commit `.repograph/` config; commit `generated/graph.json` if using `repograph diff` in CI
4. Add `baasith6/RepoGraph-Protocol/action@v0.2.1` to pull requests
