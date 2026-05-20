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
apps/cli/              # CLI application (@repographprotocol/cli on npm)
apps/mcp-server/       # MCP server for AI tools
apps/vscode/           # VS Code extension (read-only graph view)
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

We publish **GitHub Releases** with notes in [`docs/releases/`](docs/releases/README.md) so users can follow changes without reading the full git history.

1. Update version in [`apps/cli/package.json`](apps/cli/package.json) and [`apps/cli/src/cli.ts`](apps/cli/src/cli.ts)
2. Add [`docs/releases/vX.Y.Z.md`](docs/releases/) release notes (user-facing summary)
3. Update [`CHANGELOG.md`](CHANGELOG.md)
4. Run `pnpm build && pnpm build:cli-bundle`
5. Publish npm (requires `@repographprotocol` org access):

```powershell
$env:NPM_TOKEN = "npm_..."   # never commit; see SECURITY.md
pnpm publish:cli
```

Or with 2FA: `$env:NPM_OTP = "123456"; pnpm publish:cli`

6. Tag: `git tag v0.x.y && git push origin v0.x.y` (pushing `v*` triggers [`.github/workflows/release.yml`](.github/workflows/release.yml))
7. Create or verify GitHub release (see [`docs/releases/`](docs/releases/)):

```bash
GITHUB_TOKEN=ghp_... node scripts/create-github-release.mjs v0.x.y
```

Or draft manually on GitHub Releases using the matching `docs/releases/vX.Y.Z.md` file.

8. Update [`action/action.yml`](action/action.yml) pinned CLI version when shipping a new CLI version
9. Refresh README install pin and [docs/releases/README.md](docs/releases/README.md) index if needed

## Security

See [SECURITY.md](SECURITY.md) for token handling and vulnerability reporting.

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
