# Contributing to RepoGraph

Thank you for your interest in contributing to RepoGraph Protocol.

## Development Setup

1. Clone https://github.com/baasith6/RepoGraph-Protocol
2. Install [pnpm](https://pnpm.io/) (v9+)
3. Run `pnpm install`
4. Run `pnpm build`
5. Run `pnpm test`

## Project Structure

```txt
apps/cli/              # CLI application
apps/mcp-server/       # MCP server (v0.3+)
action/                # GitHub Composite Action
packages/protocol/     # JSON Schema + validation
packages/scanner-core/ # Repository scanner
packages/graph-core/   # Graph data model
packages/rule-engine/  # Architecture rule engine
packages/analyzers/    # Language analyzers
packages/exporters/    # Output formatters
tools/repograph-roslyn/# .NET Roslyn worker
examples/              # Example repositories
docs/spec/             # Protocol documentation
```

## Release Process

1. Update version in `apps/cli/package.json` (and root if needed)
2. Update `CHANGELOG.md` with release notes
3. Run `pnpm build && pnpm build:cli-bundle`
4. Run `pnpm publish:cli` (requires npm login and `@repograph` scope access)
5. Tag: `git tag v0.x.y && git push origin v0.x.y`
6. Create GitHub release pointing to the tag
7. Update `action/action.yml` default CLI version if needed

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
