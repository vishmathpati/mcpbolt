import Link from "next/link";
import type { Metadata } from "next";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata: Metadata = {
  title: "Install a local (stdio) MCP server — MCPBolt docs",
  description:
    "Step-by-step guide to installing a local stdio MCP server into Claude Desktop, Cursor, VS Code, and other AI coding tools using npx, uvx, or a direct command.",
};

export default function InstallLocalPage() {
  return (
    <>
      <div className="prose">
        <h1>Install a local (stdio) MCP server</h1>
        <p className="lead">
          Local MCP servers run as a process on your machine. Your AI tool launches them, pipes
          data over stdin/stdout, and shuts them down when you close the session. This is the most
          common type of MCP server.
        </p>

        <hr />

        <h2>What is a stdio server?</h2>
        <p>
          A stdio MCP server is a regular command-line program. Your AI tool starts it using a{" "}
          <code>command</code> and optional <code>args</code>, exactly like running a program in
          your terminal:
        </p>
        <pre>{`npx -y @modelcontextprotocol/server-filesystem ~/Downloads`}</pre>
        <p>
          In a config file this looks like:
        </p>
        <pre>{`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/Downloads"]
    }
  }
}`}</pre>
        <p>
          The server runs only while your AI tool is open — it is not a persistent background
          process or a remote service.
        </p>

        <h2>Common launchers</h2>
        <p>
          Most local MCP servers are distributed as npm packages or Python packages. The launcher
          you use depends on how the server is packaged:
        </p>
        <ul>
          <li>
            <strong><code>npx -y @package/name</code></strong> — runs an npm package without
            installing it globally. Most JavaScript/TypeScript MCP servers.
          </li>
          <li>
            <strong><code>uvx package-name</code></strong> — Python equivalent of npx using{" "}
            <a href="https://github.com/astral-sh/uv" target="_blank" rel="noreferrer">uv</a>.
            Python MCP servers.
          </li>
          <li>
            <strong><code>node /path/to/server.js</code></strong> — runs a locally cloned server
            directly.
          </li>
          <li>
            <strong><code>python /path/to/server.py</code></strong> — runs a Python server
            directly.
          </li>
          <li>
            <strong><code>docker run ...</code></strong> — servers distributed as Docker images.
          </li>
        </ul>

        <hr />

        <h2>Step 1 — Find the install command</h2>
        <p>
          Every MCP server's README includes a config snippet. It will look something like one of
          these:
        </p>
        <pre>{`# npx command from README
npx -y @upstash/context7-mcp

# or a full JSON snippet
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>

        <h2>Step 2 — Install with MCPBolt (recommended)</h2>
        <p>
          Open the <Link href="/download">MCPBolt menu bar app</Link>, click the paste bar at the
          bottom, and paste either the <code>npx</code> command or the full JSON snippet.
          MCPBolt auto-detects the format and lets you pick which tools to install it into.
        </p>
        <pre>{`npx -y @upstash/context7-mcp`}</pre>
        <p>
          MCPBolt writes the correctly formatted config to every tool you select — no JSON editing
          required.
        </p>

        <Callout kind="tip" title="Environment variables">
          Many servers require API keys passed as environment variables. In MCPBolt, click the edit
          icon next to the server after installing to add <code>env</code> key-value pairs without
          touching any config files.
        </Callout>

        <h2>Step 3 — Manual install (any tool)</h2>

        <h3>Claude Desktop / Cursor / Windsurf / Gemini CLI / Roo / opencode</h3>
        <p>
          File: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (for
          Claude Desktop) or the tool-specific equivalent.
        </p>
        <pre>{`{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>
        <p>With environment variables:</p>
        <pre>{`{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my/mcp-server"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}`}</pre>

        <h3>Claude Code (project scope)</h3>
        <p>
          File: <code>.mcp.json</code> in your project root. Same format as Claude Desktop.
        </p>

        <h3>VS Code</h3>
        <p>
          File: <code>.vscode/mcp.json</code>
        </p>
        <pre>{`{
  "servers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>

        <h3>Zed</h3>
        <p>
          Add to Zed's <code>settings.json</code>:
        </p>
        <pre>{`{
  "context_servers": {
    "context7": {
      "command": {
        "path": "npx",
        "args": ["-y", "@upstash/context7-mcp"]
      },
      "settings": {}
    }
  }
}`}</pre>

        <h3>Codex CLI</h3>
        <p>
          File: <code>~/.codex/config.toml</code>
        </p>
        <pre>{`[[mcp_servers]]
name = "context7"
command = "npx"
args = ["-y", "@upstash/context7-mcp"]`}</pre>

        <h3>Continue</h3>
        <p>
          File: <code>~/.continue/config.yaml</code>
        </p>
        <pre>{`mcpServers:
  - name: context7
    command: "npx"
    args:
      - "-y"
      - "@upstash/context7-mcp"`}</pre>

        <hr />

        <h2>Troubleshooting</h2>
        <ul>
          <li>
            <strong>Server fails to start</strong> — Make sure the launcher is installed. For
            <code>npx</code>, Node.js 18+ is required. For <code>uvx</code>, install{" "}
            <a href="https://github.com/astral-sh/uv" target="_blank" rel="noreferrer">uv</a>.
          </li>
          <li>
            <strong>Command not found</strong> — The binary (npx, node, uvx) may not be on the
            PATH that your AI tool sees. Specify the full path to the binary, e.g.{" "}
            <code>/usr/local/bin/npx</code>.
          </li>
          <li>
            <strong>Server shows amber in MCPBolt</strong> — The process started but is responding
            slowly. Check if the server requires env vars that are missing.
          </li>
          <li>
            <strong>Works in terminal but not in Claude</strong> — Claude Desktop launches with a
            limited PATH. Use full absolute paths for the command, or add the bin directory to your
            shell's PATH in <code>~/.zprofile</code> or <code>~/.bash_profile</code>.
          </li>
        </ul>

        <Callout kind="tip" title="Use the converter">
          Have a config snippet in one format and need it in another?{" "}
          <Link href="/tools/converter">The MCPBolt Config Converter</Link> translates any format
          to any tool's native format in one click.
        </Callout>
      </div>

      <DocsPageNav
        prev={{ label: "Quickstart", href: "/docs/quickstart" }}
        next={{ label: "Install streamable server", href: "/docs/install-streamable" }}
      />
    </>
  );
}
