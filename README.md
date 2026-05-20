# RepoGraph Protocol

> Machine-readable context for human and AI developers.

RepoGraph turns a repository into a structured knowledge graph that AI tools, developers, and CI pipelines can understand.

## Quick Start

```bash
pnpm install
pnpm build

# In your project directory:
npx repograph init
npx repograph validate
npx repograph scan
npx repograph check
npx repograph explain
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `repograph init` | Create `.repograph` folder and starter config |
| `repograph validate` | Validate `.repograph` config files |
| `repograph doctor` | Check RepoGraph setup health |
| `repograph scan` | Scan repository and generate graph |
| `repograph sync` | Scan and update generated files |
| `repograph check` | Validate architecture rules |
| `repograph explain` | Explain project, module, or file |
| `repograph list <type>` | List modules, layers, or violations |
| `repograph visualize` | Generate Mermaid diagrams |
| `repograph stats` | Show repository metrics |
| `repograph export --format <fmt>` | Export to json, markdown, mermaid, cursor |
| `repograph prompt "<task>"` | Generate AI-ready task context |
| `repograph impact <file>` | Show change impact analysis |

## The `.repograph` Protocol

```txt
.repograph/
  project.yml       # Project metadata
  modules.yml       # Business module mapping
  architecture.yml  # Layers and dependency rules
  rules.yml         # Custom architecture rules
  tests.yml         # Test-to-module mapping
  ai.yml            # AI tool instructions
  decisions/        # Architecture Decision Records
  generated/        # Auto-generated outputs
    graph.json
    graph.mmd
    context-pack.md
```

See [docs/spec/0.1.0.md](docs/spec/0.1.0.md) for the full protocol specification.

## Example

```bash
cd examples/clean-architecture-csharp-angular
npx repograph scan
npx repograph check
npx repograph explain module Auth
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

Apache-2.0
