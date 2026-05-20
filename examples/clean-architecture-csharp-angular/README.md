# Clean Architecture C# + Angular Example

Example repository for RepoGraph Protocol demonstrating Clean Architecture with intentional layer violations for testing.

## Usage

```bash
npm install -g @repographprotocol/cli@0.5.0
cd examples/clean-architecture-csharp-angular
repograph scan
repograph check
repograph explain -m Auth
repograph impact src/Web/Violation/BadDependency.cs
```

Monorepo development:

```bash
node ../../apps/cli/dist/index.js scan
```

## Intentional Violation

`src/Web/Violation/BadDependency.cs` references Infrastructure from the Web layer, which violates Clean Architecture rules. `repograph check` should detect this.
