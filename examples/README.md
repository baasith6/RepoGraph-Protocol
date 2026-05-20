# RepoGraph Examples

Three reference repositories show how RepoGraph maps different stacks to modules, layers, and rules.

| Example | Stack | What it demonstrates |
|---------|-------|----------------------|
| [clean-architecture-csharp-angular](clean-architecture-csharp-angular/) | .NET 8 + Angular | Clean Architecture layers, intentional Web→Infrastructure violation |
| [nodejs-layered-api](nodejs-layered-api/) | Node.js + TypeScript | Layered API (api / services / domain), module mapping |
| [dotnet-modular-monolith](dotnet-modular-monolith/) | .NET minimal | Modular monolith (Catalog / Orders), project references |

## Run any example

From the example directory (after installing the CLI globally):

```bash
npm install -g @repographprotocol/cli@0.3.0
repograph validate
repograph scan
repograph sync
repograph check
repograph explain -m <ModuleName>
```

From the monorepo (development build):

```bash
pnpm build
cd examples/<example-name>
node ../../apps/cli/dist/index.js scan
node ../../apps/cli/dist/index.js check
```

## Pick a template for your repo

```bash
repograph init --template clean-architecture-csharp-angular
# or
repograph init --template default
```

See [docs/adopting.md](../docs/adopting.md) for mapping a real repository.
