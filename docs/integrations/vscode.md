# RepoGraph VS Code Extension

Read-only Explorer views plus task prompt copy.

## Development

1. Open `apps/vscode` in VS Code
2. Press **F5** (requires `.repograph/project.yml` in workspace)
3. Run `repograph scan` in the workspace root first

## Commands

| Command | Action |
|---------|--------|
| RepoGraph: Refresh Views | Reload module/violation trees |
| RepoGraph: Open graph.json | Open generated graph |
| RepoGraph: Copy Task Prompt | Build task context and copy to clipboard |

## Marketplace

Publishing uses `repograph-vscode` from [apps/vscode/package.json](../../apps/vscode/package.json). Package with `vsce package` when ready to list on the Marketplace.
