import Link from "next/link";
import type { Metadata } from "next";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata: Metadata = {
  title: "MCP on Windows — MCPBolt docs",
  description:
    "Complete guide to installing and running MCP servers on Windows. Fix npx failures, PATH issues, shell mismatches, and claude_desktop_config.json problems.",
};

export default function WindowsPage() {
  return (
    <>
      <div className="prose">
        <h1>MCP on Windows</h1>
        <p className="lead">
          Windows is the most common source of MCP install failures. Most problems trace back to
          three root causes: the wrong shell, a broken <code>npx</code> invocation, or a PATH that
          Claude Desktop cannot see. This page covers all of them.
        </p>

        <Callout kind="info" title="MCPBolt on Windows">
          MCPBolt&apos;s menu bar app is macOS-only, but the <strong>CLI tool works on
          Windows</strong>:{" "}
          <code>npx mcpbolt</code>. It handles config translation for Claude Desktop, VS Code,
          Cursor, and Codex CLI. The web tools (Config Converter, Validator) work in any browser.
        </Callout>

        <hr />

        <h2>Root cause 1 — Wrong shell in VS Code / Cursor</h2>
        <p>
          When VS Code or Cursor launches an MCP server, it uses the shell configured in your
          editor. If that shell is <code>zsh</code> (which some setups pick up from WSL), the
          Windows PATH is not available and <code>npx</code> fails with &ldquo;command not found.&rdquo;
        </p>
        <h3>Fix: set the default terminal profile</h3>
        <p>
          In VS Code / Cursor, open the command palette (<kbd>Ctrl+Shift+P</kbd>) and run{" "}
          <strong>Terminal: Select Default Profile</strong>. Choose{" "}
          <strong>Command Prompt</strong> or <strong>PowerShell</strong> — not Git Bash or WSL.
        </p>
        <p>
          Then restart the editor and try the MCP server again.
        </p>

        <hr />

        <h2>Root cause 2 — npx path issues</h2>
        <p>
          <code>npx</code> on Windows resolves differently depending on how Node.js was installed.
          The MCP config needs the full resolved command, not just <code>npx</code>.
        </p>

        <h3>Check: find where npx lives</h3>
        <p>Open Command Prompt and run:</p>
        <pre>{`where npx`}</pre>
        <p>You will get a path like <code>C:\\Program Files\\nodejs\\npx.cmd</code>.</p>

        <h3>Fix A — Use cmd as the command</h3>
        <p>
          Wrap the <code>npx</code> call through <code>cmd.exe</code> so Windows resolves the path
          correctly:
        </p>
        <pre>{`{
  "mcpServers": {
    "context7": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>

        <h3>Fix B — Use the full path to npx</h3>
        <pre>{`{
  "mcpServers": {
    "context7": {
      "command": "C:\\\\Program Files\\\\nodejs\\\\npx.cmd",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>

        <Callout kind="warn" title="Backslashes in JSON">
          Windows paths use <code>\</code>, which must be escaped as <code>\\</code> in JSON.
          So <code>C:\Program Files\nodejs</code> becomes{" "}
          <code>C:\\Program Files\\nodejs</code> in the config.
        </Callout>

        <hr />

        <h2>Root cause 3 — PATH not visible to Claude Desktop</h2>
        <p>
          Claude Desktop launches as a GUI app, not from a terminal. GUI apps on Windows do not
          inherit the PATH you set in PowerShell or your user environment in the same way. This
          means <code>node</code>, <code>npx</code>, <code>python</code>, and <code>uvx</code> may
          all be invisible to Claude even if they work fine in your terminal.
        </p>

        <h3>Fix A — Set PATH via the env field</h3>
        <p>
          You can inject PATH into the MCP server&apos;s environment directly in the config:
        </p>
        <pre>{`{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my/mcp-server"],
      "env": {
        "PATH": "C:\\\\Program Files\\\\nodejs;C:\\\\Windows\\\\System32"
      }
    }
  }
}`}</pre>

        <h3>Fix B — Use the full absolute path to node</h3>
        <pre>{`{
  "mcpServers": {
    "my-server": {
      "command": "C:\\\\Program Files\\\\nodejs\\\\node.exe",
      "args": ["C:\\\\Users\\\\YourName\\\\my-mcp-server\\\\index.js"]
    }
  }
}`}</pre>

        <hr />

        <h2>The WSL approach (cleanest solution)</h2>
        <p>
          If you keep hitting Windows-specific issues, running MCP servers inside WSL (Windows
          Subsystem for Linux) eliminates them entirely. Node, Python, and all standard Unix tools
          work exactly as documented.
        </p>

        <h3>Step 1 — Install WSL</h3>
        <pre>{`# Run in PowerShell as Administrator
wsl --install`}</pre>
        <p>This installs Ubuntu by default. Restart when prompted.</p>

        <h3>Step 2 — Install Node inside WSL</h3>
        <pre>{`# Inside WSL Ubuntu terminal
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs`}</pre>

        <h3>Step 3 — Reference the WSL binary from Claude Desktop</h3>
        <p>
          Claude Desktop on Windows can call WSL executables via the <code>wsl.exe</code> wrapper:
        </p>
        <pre>{`{
  "mcpServers": {
    "context7": {
      "command": "wsl.exe",
      "args": ["npx", "-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>

        <Callout kind="tip" title="Where is claude_desktop_config.json on Windows?">
          <code>%APPDATA%\\Claude\\claude_desktop_config.json</code> — paste that path directly into
          Explorer&apos;s address bar to open the folder.
        </Callout>

        <hr />

        <h2>Common error messages and fixes</h2>

        <h3>&ldquo;spawn npx ENOENT&rdquo;</h3>
        <p>
          Claude cannot find <code>npx</code>. Use Fix B above (full path) or the{" "}
          <code>cmd /c</code> wrapper (Fix A).
        </p>

        <h3>&ldquo;Server not initialized&rdquo;</h3>
        <p>
          The server process started but failed before it could respond. Common causes: missing
          env vars (API keys), a package that failed to download on the first <code>npx</code> run,
          or a Node version mismatch. Run the <code>npx</code> command manually in a terminal to
          see the real error.
        </p>

        <h3>&ldquo;Bad Request&rdquo; on a Streamable HTTP server</h3>
        <p>
          Usually a missing or malformed <code>Authorization</code> header. Check that your API
          key is set and that the header name matches exactly what the provider expects.
        </p>

        <h3>Config resets after Claude Desktop updates</h3>
        <p>
          Claude Desktop occasionally moves or regenerates <code>claude_desktop_config.json</code>{" "}
          on update. Keep a backup copy and use <code>npx mcpbolt</code> to re-apply your servers
          in one command.
        </p>

        <hr />

        <h2>Quick checklist</h2>
        <ol>
          <li>Run <code>where npx</code> and <code>where node</code> in Command Prompt — note the paths.</li>
          <li>Use <code>cmd /c npx …</code> or the full npx path in your config.</li>
          <li>If PATH is the issue, add it to the <code>env</code> block in your config.</li>
          <li>For VS Code / Cursor: set the default terminal profile to PowerShell or CMD.</li>
          <li>For a clean slate: switch to WSL and use Linux paths.</li>
        </ol>

        <Callout kind="tip" title="Validate your config">
          Use the <Link href="/tools/validator">MCPBolt Config Validator</Link> to check your
          config for missing fields, empty API keys, and common mistakes before restarting Claude.
        </Callout>
      </div>

      <DocsPageNav
        prev={{ label: "Troubleshooting", href: "/docs/troubleshooting" }}
        next={{ label: "FAQ", href: "/docs/faq" }}
      />
    </>
  );
}
