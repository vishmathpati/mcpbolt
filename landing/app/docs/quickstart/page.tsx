import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata = {
  title: "Quickstart",
  description:
    "Wire your first MCP server into Claude Desktop, Cursor, or VS Code in under 60 seconds using MCPBolt.",
};

export default function DocsQuickstartPage() {
  return (
    <>
      <div className="prose">
        <h1>Quickstart: wire your first MCP server in 60 seconds</h1>
        <p>
          This guide walks you through installing the filesystem MCP server into Claude Desktop,
          Claude Code, and Cursor. The same flow works for any server — swap out the config and
          pick your targets.
        </p>

        <hr />

        <h2>Step 1 — Find a server config</h2>
        <p>
          Every MCP server ships with a config snippet in its README. For this example we'll use
          the official filesystem server. Copy this JSON:
        </p>
        <pre><code>{`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    }
  }
}`}</code></pre>
        <p>
          This tells Claude Desktop (and other tools using the same format) to launch the
          filesystem server with <code>npx</code>, giving it access to <code>/tmp</code>. You can
          add more paths to the <code>args</code> array later.
        </p>

        <h2>Step 2 — Run MCPBolt</h2>
        <pre><code>{`npx mcpbolt`}</code></pre>
        <p>You'll see the paste prompt:</p>
        <pre><code>{`  mcpbolt ⚡ — wire MCP servers into any AI coding tool

  Paste config below. Press Enter twice (or Ctrl+D) when done:

  >`}</code></pre>

        <h2>Step 3 — Paste the config</h2>
        <p>
          Paste the JSON you copied in Step 1, then press <kbd>Enter</kbd> twice (or{" "}
          <kbd>Ctrl+D</kbd>). MCPBolt auto-detects the format and extracts the server name:
        </p>
        <pre><code>{`  Detected
    Format: JSON (Claude Desktop / VS Code / Cursor / Zed)
    Servers: 1 — filesystem`}</code></pre>

        <h2>Step 4 — Pick your targets</h2>
        <p>
          MCPBolt scans your machine for installed AI tools and pre-checks the ones it finds. Use{" "}
          <kbd>Space</kbd> to toggle each target, <kbd>Enter</kbd> to confirm:
        </p>
        <pre><code>{`✔ Server name › filesystem
✔ Select targets › Claude Desktop, Claude Code (global), Cursor (global)`}</code></pre>

        <Callout kind="tip" title="Tip">
          MCPBolt only shows tools it detects on your machine. If an app is missing from the list,
          it was not found at the expected install path. See{" "}
          <Link href="/docs/apps">Supported apps</Link> for the paths each tool uses.
        </Callout>

        <h2>Step 5 — Preview the changes</h2>
        <p>MCPBolt shows exactly what it will write before touching anything:</p>
        <pre><code>{`✔ Preview changes before writing? › Yes

  Preview
    Claude Desktop (user)  → ~/Library/Application Support/Claude/claude_desktop_config.json
    Claude Code (user)     → ~/.claude.json
    Cursor (user)          → ~/.cursor/mcp.json`}</code></pre>
        <p>The preview shows which file each target writes to. No files are modified at this step.</p>

        <h2>Step 6 — Write</h2>
        <pre><code>{`✔ Write files now? › Yes

  ✓ Wired "filesystem" into 3 targets.

  → Quit and reopen Claude Desktop to load the new server.
  → Open Cursor → Settings → MCP and click Refresh to activate.`}</code></pre>
        <p>
          MCPBolt merges the new server entry into each config file without touching any other keys.
          A <code>.bak</code> backup is written alongside each modified file.
        </p>

        <h2>Step 7 — Restart your tools</h2>
        <p>Most tools need a restart to pick up config changes:</p>
        <ul>
          <li>
            <strong>Claude Desktop</strong> — Quit and reopen the app.
          </li>
          <li>
            <strong>Claude Code</strong> — Reads config on each invocation; no restart needed.
          </li>
          <li>
            <strong>Cursor</strong> — Open Settings → MCP and click <strong>Refresh</strong>.
          </li>
          <li>
            <strong>VS Code</strong> — Run <strong>Developer: Reload Window</strong> (<kbd>Cmd+Shift+P</kbd>).
          </li>
        </ul>

        <hr />

        <h2>What's next</h2>
        <p>From here you can:</p>
        <ul>
          <li>
            Paste a different format — shell command, TOML, YAML, bare URL. See{" "}
            <Link href="/docs/config-formats">Config formats</Link>.
          </li>
          <li>
            Use the menu bar app for a GUI view of all your servers with live health status. See{" "}
            <Link href="/docs/menubar">Menu bar tour</Link>.
          </li>
          <li>
            Manage per-repo server configs without touching global files. See{" "}
            <Link href="/docs/projects">Projects tab</Link>.
          </li>
        </ul>
      </div>
      <DocsPageNav
        prev={{ label: "Install", href: "/docs/install" }}
        next={{ label: "CLI reference", href: "/docs/cli" }}
      />
    </>
  );
}
