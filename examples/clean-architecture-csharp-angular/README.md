# Clean Architecture C# + Angular Example

Example repository for RepoGraph Protocol demonstrating Clean Architecture with intentional layer violations for testing.

## Usage

```bash
# From monorepo root after build:
cd examples/clean-architecture-csharp-angular
node ../../apps/cli/dist/index.js scan
node ../../apps/cli/dist/index.js check
node ../../apps/cli/dist/index.js explain module Auth
node ../../apps/cli/dist/index.js impact src/Web/Violation/BadDependency.cs
```

## Intentional Violation

`src/Web/Violation/BadDependency.cs` references Infrastructure from the Web layer, which violates Clean Architecture rules. `repograph check` should detect this.
