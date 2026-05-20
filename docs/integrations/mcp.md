# RepoGraph MCP Server

Expose RepoGraph to Cursor, Claude Desktop, and other MCP clients.

## From monorepo (development)

```bash
pnpm build
REPOGRAPH_ROOT=/path/to/your/repo node apps/mcp-server/dist/index.js
```

## Cursor configuration

```json
{
  "mcpServers": {
    "repograph": {
      "command": "node",
      "args": ["F:/tic/Repograph/apps/mcp-server/dist/index.js"],
      "env": {
        "REPOGRAPH_ROOT": "F:/path/to/your/repo"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `repograph_get_graph` | Stats, modules, layers, violations |
| `repograph_explain` | Project, module, or file |
| `repograph_list_violations` | Architecture violations |
| `repograph_impact` | Blast radius (`mode`, `json` optional) |
| `repograph_prompt` | Task-aware AI context |
| `repograph_scan` | Refresh `graph.json` |

## npm package

`@repograph/mcp-server` can be published separately; until then use the monorepo build above.
