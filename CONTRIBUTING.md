# Contributing to RepoGraph

Thank you for your interest in contributing to RepoGraph Protocol.

## Development Setup

1. Clone the repository
2. Install [pnpm](https://pnpm.io/) (v9+)
3. Run `pnpm install`
4. Run `pnpm build`
5. Run `pnpm test`

## Project Structure

```txt
apps/cli/              # CLI application
packages/protocol/     # JSON Schema + validation
packages/scanner-core/ # Repository scanner
packages/graph-core/   # Graph data model
packages/rule-engine/  # Architecture rule engine
packages/analyzers/    # Language analyzers
packages/exporters/    # Output formatters
packages/templates/    # Init templates
examples/              # Example repositories
docs/spec/             # Protocol documentation
```

## Protocol Changes

Protocol changes require an RFC. See [docs/spec/RFC-0001-protocol-versioning.md](docs/spec/RFC-0001-protocol-versioning.md).

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure `pnpm build` and `pnpm test` pass
5. Submit a pull request with a clear description

## Code Style

- TypeScript with strict mode
- Match existing patterns in the package you are editing
- Keep changes focused and minimal
