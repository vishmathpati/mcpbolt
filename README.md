# mcpbolt ⚡

**Wire any MCP server into every AI coding tool — from one paste.**

You copy an MCP config from anywhere. mcpbolt detects the format, asks which tools to install into, and writes the correct config file for each. No manual JSON editing across 10 different apps.

```bash
npx mcpbolt
```

---

## Why

Every AI coding tool stores MCP configs differently:

- Claude Desktop uses `mcpServers` in a JSON file deep in `~/Library`
- VS Code uses `servers` with an explicit `type` field
- Zed uses `context_servers` inside its settings
- Codex uses TOML
- Continue uses YAML

Whenever you find a new MCP server, you have to manually translate and copy the config into each tool. mcpbolt does that translation automatically.

---

## Install

### CLI

Run without installing (recommended):
```bash
npx mcpbolt
```

Or install globally:
```bash
npm install -g mcpbolt
```

**Requirements:** Node.js 18+

### Mac menu bar app (MCPBoltBar)

A native macOS menu bar app for browsing, importing, and removing MCP servers without touching the terminal.

```bash
brew install --cask vishmathpati/mcpbolt/mcpboltbar
```

Or grab the zip directly from [Releases](https://github.com/vishmathpati/mcpbolt/releases).

**Requirements:** macOS Monterey (12) or newer.

---

## Usage

Just run it and paste:

```
$ npx mcpbolt

  mcpbolt ⚡ — wire MCP servers into any AI coding tool

  Paste config below. Press Enter twice (or Ctrl+D) when done:

  > { "mcpServers": { "supabase": { "url": "https://mcp.supabase.com/mcp" } } }
  >

  Detected
    Format: JSON (Claude Desktop / VS Code / Cursor / Zed)
    Servers: 1 — supabase

✔ Server name › supabase
✔ Select targets › Claude Desktop, Claude Code (global), Cursor (global), VS Code (project)
✔ Preview changes before writing? › Yes

  Preview
    Claude Desktop (user)   → ~/Library/Application Support/Claude/claude_desktop_config.json
    Claude Code (user)      → ~/.claude.json
    Cursor (user)           → ~/.cursor/mcp.json
    VS Code (project)       → .vscode/mcp.json

✔ Write files now? › Yes

  ✓ Wired "supabase" into 4 targets.

  → Quit and reopen Claude Desktop to load the new server.
  → Open Cursor → Settings → MCP and click Refresh to activate.
  → Run "Developer: Reload Window" in VS Code (Cmd+Shift+P).
```

---

## Accepted input formats

Paste any of these — mcpbolt auto-detects the format:

### Claude Desktop / Cursor / Windsurf JSON
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    }
  }
}
```

### VS Code JSON (`servers` + `type`)
```json
{
  "servers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}
```

### Remote HTTP / SSE server
```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_TOKEN" }
    }
  }
}
```

### npx one-liner
```
npx -y @modelcontextprotocol/server-filesystem /Users/me/projects
```

### Docker command
```
docker run -i --rm mcp/brave-search
```

### Bare URL
```
https://mcp.example.com/sse
```

### Continue YAML
```yaml
mcpServers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
```

### Codex TOML
```toml
[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem"]
```

---

## Supported tools

| Company | Tool | Config location |
|---|---|---|
| **Anthropic** | Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Anthropic** | Claude Code (global) | `~/.claude.json` |
| **Anthropic** | Claude Code (project) | `.mcp.json` |
| **Cursor** | Cursor (global) | `~/.cursor/mcp.json` |
| **Cursor** | Cursor (project) | `.cursor/mcp.json` |
| **Microsoft** | VS Code (global) | `~/Library/Application Support/Code/User/mcp.json` |
| **Microsoft** | VS Code (project) | `.vscode/mcp.json` |
| **OpenAI** | Codex CLI (global) | `~/.codex/config.toml` |
| **OpenAI** | Codex CLI (project) | `.codex/config.toml` |
| **Codeium** | Windsurf | `~/.codeium/windsurf/mcp_config.json` |
| **Zed** | Zed (global) | `~/.config/zed/settings.json` |
| **Zed** | Zed (project) | `.zed/settings.json` |
| **Continue** | Continue | `~/.continue/config.yaml` |
| **Google** | Gemini CLI (global) | `~/.gemini/settings.json` |
| **Google** | Gemini CLI (project) | `.gemini/settings.json` |
| **Roo Code** | Roo Code (project) | `.roo/mcp.json` |

mcpbolt auto-detects which tools are installed on your machine and pre-checks them in the selector.

---

## How it works

```
Paste (any format)
      ↓
  Auto-detect format
      ↓
  Parse → Internal IR
  { name, transport, command/args/env or url/headers }
      ↓
  You pick targets
      ↓
  Render native config per tool
  (mcpServers / servers / context_servers / TOML / YAML)
      ↓
  Merge into existing file (never overwrites sibling keys)
  Backup written to .bak first
      ↓
  Dry-run preview → confirm → write
```

Every existing config is preserved. mcpbolt reads the file, inserts or updates the one server entry, and writes back. A `.bak` backup is created alongside every file that gets modified.

---

## Safety

- **Merge, never overwrite** — only the target server key is touched; everything else in your config is preserved
- **Backup before write** — `.bak` file created next to every modified config
- **Dry-run by default** — preview all changes before anything is written
- **Auto-detect installed tools** — only shows tools it finds on your machine

---

## Contributing

Adding support for a new tool is one file.

**1. Create `src/targets/newtool.ts`** implementing the `Target` interface:

```ts
import type { Target, Scope } from './_base.ts'
import { irToClaudeShape } from './_base.ts'
import { mergeJson } from '../core/merger.ts'

export const myTool: Target = {
  id: 'my-tool',
  company: 'Acme',
  name: 'My Tool',
  scopes: ['user', 'project'],

  detect() {
    return /* check if tool is installed */
  },

  configPath(scope: Scope) {
    return scope === 'user' ? '~/.mytool/mcp.json' : '.mytool/mcp.json'
  },

  toNative(ir) {
    return irToClaudeShape(ir) // or write your own shape
  },

  write(scope, ir, dryRun) {
    return mergeJson(this.configPath(scope), 'mcpServers', ir.name, this.toNative(ir), dryRun)
  },

  restartHint: 'Restart My Tool to load the new server.',
}
```

**2. Register it in `src/targets/index.ts`:**

```ts
import { myTool } from './newtool.ts'

export const ALL_TARGETS: Target[] = [
  // ... existing targets
  myTool,
]
```

That's it. The CLI picks it up automatically.

**Shape helpers available in `_base.ts`:**

| Helper | Output format | Used by |
|---|---|---|
| `irToClaudeShape` | `{ command, args, env }` | Claude, Cursor, Windsurf, Gemini, Roo |
| `irToVsCodeShape` | `{ type, command, args, env }` | VS Code |
| `irToZedShape` | `{ command: { path, args, env } }` | Zed |
| `irToCodexShape` | `{ command, args, env }` (for TOML) | Codex |

**Merger helpers available in `core/merger.ts`:**

| Helper | Use for |
|---|---|
| `mergeJson` | Standard JSON config with a flat server map |
| `mergeJsonNested` | JSON where servers live inside a nested key (e.g. Zed's `settings.json`) |
| `mergeYamlArray` | YAML config where servers are an array (e.g. Continue) |
| `mergeToml` | TOML config (e.g. Codex) |

---

## Development

```bash
# Clone
git clone https://github.com/vishmathpati/mcpwire.git
cd mcpwire

# Install deps
bun install

# Run locally
bun dev

# Run tests
bun test.ts

# Build
bun run build
```

---

## License

MIT — [vishmathpati](https://github.com/vishmathpati)
