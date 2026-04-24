import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";
import { GITHUB_URL } from "../../lib/site";

export const metadata = {
  title: "Troubleshooting",
  description:
    "Fix common MCPBolt issues — servers not appearing in Claude Desktop, Cursor errors, VS Code reload, npx failures, permission errors, and amber health status.",
};

export default function DocsTroubleshootingPage() {
  return (
    <>
      <div className="prose">
        <h1>Troubleshooting</h1>
        <p>
          Most issues come down to one of three things: the tool hasn't restarted to pick up the
          new config, the config file has a syntax error, or the server's command isn't installed.
          The sections below cover the specific fixes for each common scenario.
        </p>

        <hr />

        <h3>My server doesn't appear in Claude Desktop after adding it</h3>
        <p>
          Claude Desktop reads its config at startup only. You must fully quit and reopen the app —
          closing the window is not enough. On macOS, right-click the Claude icon in the Dock and
          choose <strong>Quit</strong>, then relaunch.
        </p>
        <p>
          If it still doesn't appear after restarting, open the config file at{" "}
          <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> and verify
          the server entry is present under <code>mcpServers</code>. If MCPBolt wrote the file
          correctly, the entry will be there. If the file is empty or missing the key, something
          interrupted the write — check the <code>.bak</code> file next to it.
        </p>

        <h3>Cursor shows an error loading MCP / the server doesn't appear</h3>
        <p>
          After writing, open Cursor's Settings, navigate to the MCP section, and click{" "}
          <strong>Refresh</strong>. A hard restart of Cursor is sometimes needed.
        </p>
        <p>
          If Cursor reports a config parse error, the JSON file has a syntax issue. Open{" "}
          <code>~/.cursor/mcp.json</code> (or <code>.cursor/mcp.json</code> for project scope) in
          a text editor and validate it — a missing comma or trailing comma before a closing brace
          is the usual culprit. MCPBolt won't produce invalid JSON, but manual edits can break it.
          Restore from the <code>.bak</code> file if needed.
        </p>

        <h3>VS Code doesn't show the new server / "Reload Window" required</h3>
        <p>
          VS Code requires a window reload to pick up MCP config changes. Press{" "}
          <kbd>Cmd+Shift+P</kbd> (macOS) or <kbd>Ctrl+Shift+P</kbd> (Windows/Linux), type{" "}
          <strong>Developer: Reload Window</strong>, and press Enter. The server should appear in
          the MCP panel after reload.
        </p>
        <p>
          If it still doesn't appear, check that MCPBolt wrote to the correct scope. User-scope
          changes go to{" "}
          <code>~/Library/Application Support/Code/User/mcp.json</code>; project-scope changes go
          to <code>.vscode/mcp.json</code> in your project root.
        </p>

        <h3>npx can't find mcpbolt / "command not found: mcpbolt"</h3>
        <p>
          If <code>npx mcpbolt</code> fails, Node.js is either not installed or is below version
          18. Run <code>node --version</code> — if the command is not found, install Node from{" "}
          <a href="https://nodejs.org" target="_blank" rel="noreferrer">nodejs.org</a>. If the
          version is below 18, upgrade via your version manager (<code>nvm install 18</code>,{" "}
          <code>fnm install 18</code>, etc.).
        </p>
        <p>
          If you installed MCPBolt globally (<code>npm install -g mcpbolt</code>) and the{" "}
          <code>mcpbolt</code> command is still not found, the npm global bin directory is not on
          your <code>PATH</code>. Run <code>npm bin -g</code> to find the bin directory and add it
          to your <code>~/.zshrc</code> or <code>~/.bashrc</code>.
        </p>

        <h3>Permission denied when writing to ~/.claude.json or a config file</h3>
        <p>
          This usually means the config file is owned by root or has restrictive permissions.
          Check the permissions:
        </p>
        <pre><code>{`ls -la ~/.claude.json`}</code></pre>
        <p>
          If it's owned by root, you (or a previous tool run with <code>sudo</code>) created it
          with elevated privileges. Fix it:
        </p>
        <pre><code>{`sudo chown $USER ~/.claude.json
chmod 644 ~/.claude.json`}</code></pre>
        <p>Then run MCPBolt again.</p>

        <h3>Health status stuck on amber</h3>
        <p>
          Amber means the server is reachable but slow, or responded with a non-success status.
          Common causes:
        </p>
        <ul>
          <li>
            <strong>First run with <code>npx -y</code></strong> — the package needs to download.
            Wait 30 seconds and click the health dot to re-check. It should turn green.
          </li>
          <li>
            <strong>Server takes longer than the timeout to start</strong> — Go to MCPBoltBar's
            Settings and increase the health check timeout.
          </li>
          <li>
            <strong>Remote server is rate-limiting the health check</strong> — Some servers return
            429 on repeated HEAD requests. MCPBolt treats 429 as amber. This doesn't affect actual
            usage — your AI tool establishes its own session.
          </li>
        </ul>

        <h3>Server appears in MCPBolt but not in the AI tool</h3>
        <p>
          Confirm you selected the right scope when writing. Global scope writes to the user-level
          config file; project scope writes to a file inside your project directory. Open the
          target file and verify the entry is present. If it's not there, re-run MCPBolt and
          select the correct target.
        </p>

        <Callout kind="info" title="Checking the backup">
          Every file MCPBolt modifies gets a <code>.bak</code> file written alongside it before
          any changes. If a config gets corrupted, copy the <code>.bak</code> file over the
          original to restore the previous state.
        </Callout>

        <hr />

        <h2>Getting more help</h2>
        <p>
          If none of the above resolves your issue, open a GitHub Issue with as much detail as
          possible: the config you pasted, the target you selected, the exact error message, and
          your OS/Node version.
        </p>
        <p>
          <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">
            Open an issue on GitHub
          </a>
        </p>
      </div>
      <DocsPageNav
        prev={{ label: "Supported apps", href: "/docs/apps" }}
        next={{ label: "FAQ", href: "/docs/faq" }}
      />
    </>
  );
}
