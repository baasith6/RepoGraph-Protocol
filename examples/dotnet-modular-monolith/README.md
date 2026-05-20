# .NET Modular Monolith Example

Minimal .NET solution with **Catalog** and **Orders** modules across Domain, Application, and Api projects.

## Layout

```txt
src/
  Domain/        # entities
  Application/   # use cases
  Api/           # HTTP endpoints
```

## Try it

```bash
repograph validate
repograph scan
repograph check
repograph explain -m Catalog
```

## Optional Roslyn

For accurate C# dependency analysis, build `tools/repograph-roslyn` from the monorepo root (requires .NET SDK + MSBuild).
