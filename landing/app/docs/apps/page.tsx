import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata = {
  title: "Supported apps",
  description:
    "Every AI coding tool MCPBolt supports — config paths, formats, restart requirements, and special notes for Claude Desktop, Claude Code, Cursor, VS Code, Codex CLI, Windsurf, Zed, Gemini CLI, opencode, Roo, and Continue.",
};

export default function DocsAppsPage() {
  return (
    <>
      <div className="prose">
        <h1>Supported apps</h1>
        <p>
          MCPBolt writes to the config file for each tool you select. This page documents the exact
          paths, format, restart requirement, and any special notes for every supported app.
        </p>

        <h2>Summary table</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>App</th>
              <th>Scope</th>
              <th>Config file</th>
              <th>Format</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Claude Desktop</td>
              <td>user</td>
              <td><code>~/Library/Application Support/Claude/claude_desktop_config.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>Claude Code</td>
              <td>user</td>
              <td><code>~/.claude.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>Claude Code</td>
              <td>project</td>
              <td><code>.mcp.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>Cursor</td>
              <td>user</td>
              <td><code>~/.cursor/mcp.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>Cursor</td>
              <td>project</td>
              <td><code>.cursor/mcp.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>VS Code</td>
              <td>user</td>
              <td><code>~/Library/Application Support/Code/User/mcp.json</code></td>
              <td>JSON (<code>servers</code> + <code>type</code>)</td>
            </tr>
            <tr>
              <td>VS Code</td>
              <td>project</td>
              <td><code>.vscode/mcp.json</code></td>
              <td>JSON (<code>servers</code> + <code>type</code>)</td>
            </tr>
            <tr>
              <td>Codex CLI</td>
              <td>user</td>
              <td><code>~/.codex/config.toml</code></td>
              <td>TOML</td>
            </tr>
            <tr>
              <td>Codex CLI</td>
              <td>project</td>
              <td><code>.codex/config.toml</code></td>
              <td>TOML</td>
            </tr>
            <tr>
              <td>Windsurf</td>
              <td>user</td>
              <td><code>~/.codeium/windsurf/mcp_config.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>Zed</td>
              <td>user</td>
              <td><code>~/.config/zed/settings.json</code></td>
              <td>JSON (<code>context_servers</code>)</td>
            </tr>
            <tr>
              <td>Zed</td>
              <td>project</td>
              <td><code>.zed/settings.json</code></td>
              <td>JSON (<code>context_servers</code>)</td>
            </tr>
            <tr>
              <td>Gemini CLI</td>
              <td>user</td>
              <td><code>~/.gemini/settings.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>Gemini CLI</td>
              <td>project</td>
              <td><code>.gemini/settings.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>Roo Code</td>
              <td>project</td>
              <td><code>.roo/mcp.json</code></td>
              <td>JSON (<code>mcpServers</code>)</td>
            </tr>
            <tr>
              <td>Continue</td>
              <td>user</td>
              <td><code>~/.continue/config.yaml</code></td>
              <td>YAML array</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>Claude Desktop</h2>
        <p>
          The original MCP client. Reads its config at startup — any change requires a full quit
          and reopen. Config path varies by OS; on macOS it's in <code>~/Library/Application Support/Claude/</code>.
          MCPBolt writes to the <code>mcpServers</code> key and preserves all other keys in the
          file.
        </p>
        <p><strong>Restart required:</strong> Yes — quit and reopen Claude Desktop.</p>

        <h2>Claude Code</h2>
        <p>
          Anthropic's CLI AI coding tool. Supports both a user-level config (<code>~/.claude.json</code>)
          and a project-level config (<code>.mcp.json</code> at the project root). Claude Code
          reads config on each invocation, so no restart is needed — the next command you run will
          pick up the new server.
        </p>
        <p><strong>Restart required:</strong> No.</p>

        <Callout kind="tip" title="Project scope">
          Use <code>.mcp.json</code> (project scope) to share MCP server configs with your team
          via version control. Be careful not to commit tokens or secrets in the <code>env</code>{" "}
          field.
        </Callout>

        <h2>Cursor</h2>
        <p>
          Supports both user-level (<code>~/.cursor/mcp.json</code>) and project-level (
          <code>.cursor/mcp.json</code>) configs. Uses the same <code>mcpServers</code> JSON shape
          as Claude Desktop. After writing, you need to refresh MCP in Cursor's settings.
        </p>
        <p>
          <strong>Restart required:</strong> Open Settings → MCP → click <strong>Refresh</strong>.
        </p>

        <h2>VS Code</h2>
        <p>
          VS Code uses a distinct JSON shape: the top-level key is <code>servers</code> (not{" "}
          <code>mcpServers</code>) and every entry requires an explicit <code>type</code> field
          (<code>"stdio"</code> or <code>"sse"</code>). MCPBolt handles this translation
          automatically when writing to VS Code targets.
        </p>
        <p>
          <strong>Restart required:</strong> Run <strong>Developer: Reload Window</strong> from the
          Command Palette (<kbd>Cmd+Shift+P</kbd> on macOS).
        </p>

        <h2>Codex CLI</h2>
        <p>
          OpenAI's Codex CLI uses TOML for config. MCP server entries live under{" "}
          <code>[mcp_servers.&lt;name&gt;]</code>. MCPBolt merges new entries into the TOML file
          while preserving all existing sections. Codex reads config on launch — restart the CLI
          session to pick up changes.
        </p>
        <p><strong>Restart required:</strong> Start a new Codex session.</p>

        <h2>Windsurf</h2>
        <p>
          Codeium's Windsurf uses a single user-level JSON config at{" "}
          <code>~/.codeium/windsurf/mcp_config.json</code> with the standard{" "}
          <code>mcpServers</code> shape.
        </p>
        <p><strong>Restart required:</strong> Restart Windsurf.</p>

        <h2>Zed</h2>
        <p>
          Zed stores MCP servers inside its main <code>settings.json</code> under the{" "}
          <code>context_servers</code> key. The server command uses a nested{" "}
          <code>{"{ path, args }"}</code> shape rather than flat <code>command</code>/<code>args</code>.
          MCPBolt uses <code>mergeJsonNested</code> to insert the server without touching any other
          Zed settings.
        </p>
        <p><strong>Restart required:</strong> Reload Zed or restart the editor.</p>

        <h2>Gemini CLI</h2>
        <p>
          Google's Gemini CLI reads MCP server configs from <code>~/.gemini/settings.json</code>{" "}
          (user scope) or <code>.gemini/settings.json</code> (project scope). Uses the{" "}
          <code>mcpServers</code> shape.
        </p>
        <p><strong>Restart required:</strong> Start a new Gemini CLI session.</p>

        <h2>opencode</h2>
        <p>
          opencode is detected and written to by MCPBolt. Config path and format follow the
          standard MCPBolt detection logic. Check{" "}
          <a href="https://github.com/vishmathpati/mcpbolt" target="_blank" rel="noreferrer">
            the GitHub repo
          </a>{" "}
          for the current config path as opencode's spec evolves.
        </p>

        <h2>Roo Code</h2>
        <p>
          Roo Code uses a project-scoped config at <code>.roo/mcp.json</code> with the standard{" "}
          <code>mcpServers</code> JSON shape. Only project scope is supported — there is no global
          Roo config.
        </p>
        <p><strong>Restart required:</strong> Reload the VS Code window (Roo runs as an extension).</p>

        <h2>Continue</h2>
        <p>
          Continue uses a YAML config at <code>~/.continue/config.yaml</code>. MCP servers are
          stored as a YAML array under <code>mcpServers</code>. MCPBolt appends to the array or
          updates an existing entry by name.
        </p>
        <p><strong>Restart required:</strong> Reload the Continue extension in VS Code.</p>
      </div>
      <DocsPageNav
        prev={{ label: "Health status", href: "/docs/health" }}
        next={{ label: "Troubleshooting", href: "/docs/troubleshooting" }}
      />
    </>
  );
}
