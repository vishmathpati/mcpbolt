import Link from "next/link";

export function McpWindowsGuide() {
  return (
    <div className="prose">
      <p className="lead">
        Windows accounts for the majority of MCP install failures posted to Reddit, GitHub, and
        Discord. The problems are almost always the same: the wrong shell, a broken{" "}
        <code>npx</code> invocation, or a PATH that Claude Desktop cannot see. Here is the
        complete fix.
      </p>

      <hr />

      <h2>Why MCP installs fail on Windows</h2>
      <p>
        MCP server configs tell your AI tool to launch a process — something like{" "}
        <code>npx -y @upstash/context7-mcp</code>. On macOS and Linux, that just works. On
        Windows, it breaks for three predictable reasons:
      </p>
      <ol>
        <li>
          <strong>Shell mismatch.</strong> VS Code and Cursor launch MCP servers using your
          configured default terminal profile. If that profile is WSL or Git Bash instead of
          PowerShell or CMD, the Windows PATH is invisible and <code>npx</code> fails with
          &ldquo;command not found.&rdquo;
        </li>
        <li>
          <strong>npx resolution.</strong> Claude Desktop and Cursor launch as GUI apps, not from
          a terminal. GUI apps on Windows inherit a stripped-down PATH that often omits the Node
          bin folder entirely.
        </li>
        <li>
          <strong>Backslash escaping.</strong> Windows paths use <code>\</code>, which must be
          doubled to <code>\\</code> inside JSON strings. Forgetting this causes silent parse
          failures.
        </li>
      </ol>

      <hr />

      <h2>The fastest fix: cmd wrapper</h2>
      <p>
        Instead of calling <code>npx</code> directly, route the call through{" "}
        <code>cmd.exe</code>. This lets Windows resolve <code>npx</code> using its own search
        logic, which works regardless of how your PATH is configured:
      </p>
      <pre>{`{
  "mcpServers": {
    "context7": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>
      <p>
        This one change fixes 80% of Windows failures. Replace{" "}
        <code>@upstash/context7-mcp</code> with whatever server you are installing.
      </p>

      <h2>If cmd doesn&apos;t work: use the full path</h2>
      <p>
        Find where <code>npx</code> lives by running <code>where npx</code> in Command Prompt.
        You will get something like{" "}
        <code>C:\Program Files\nodejs\npx.cmd</code>. Use that path directly:
      </p>
      <pre>{`{
  "mcpServers": {
    "context7": {
      "command": "C:\\\\Program Files\\\\nodejs\\\\npx.cmd",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>
      <p>
        Note the doubled backslashes — that is required JSON escaping, not a typo.
      </p>

      <h2>Fix PATH for all servers at once</h2>
      <p>
        You can inject the Node bin directory into the environment for any MCP server using the{" "}
        <code>env</code> field:
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

      <hr />

      <h2>The clean solution: WSL</h2>
      <p>
        If you keep hitting Windows-specific friction, move your MCP servers to WSL. Node, Python,
        and <code>uvx</code> all work exactly as documented once you are in a Linux environment:
      </p>
      <pre>{`# 1. Install WSL (PowerShell as Administrator)
wsl --install

# 2. Inside WSL: install Node
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. In your Claude Desktop config
{
  "mcpServers": {
    "context7": {
      "command": "wsl.exe",
      "args": ["npx", "-y", "@upstash/context7-mcp"]
    }
  }
}`}</pre>

      <hr />

      <h2>Where is the Claude Desktop config on Windows?</h2>
      <p>
        Paste this path directly into Explorer&apos;s address bar:
      </p>
      <pre>{`%APPDATA%\\Claude\\claude_desktop_config.json`}</pre>
      <p>
        After editing, quit and reopen Claude Desktop completely — it doesn&apos;t hot-reload config
        changes.
      </p>

      <h2>Error messages decoded</h2>
      <p>
        <strong>&ldquo;spawn npx ENOENT&rdquo;</strong> — Claude cannot find npx. Use the{" "}
        <code>cmd /c</code> wrapper or the full path.
      </p>
      <p>
        <strong>&ldquo;Server not initialized&rdquo;</strong> — The process started but crashed
        before it responded. Run the same <code>npx</code> command manually in a terminal to see
        the real error. Most often it is a missing env var (API key).
      </p>
      <p>
        <strong>Config resets after update</strong> — Claude Desktop sometimes regenerates its
        config on update. Run <code>npx mcpbolt</code> to re-apply all your servers from a
        declarative config in one step.
      </p>

      <hr />

      <h2>One-command install with MCPBolt CLI</h2>
      <p>
        Instead of manually editing JSON, use the MCPBolt CLI — it works on Windows, detects
        your installed tools, and writes the correct config for each one:
      </p>
      <pre>{`npx mcpbolt`}</pre>
      <p>
        Paste your server config (any format), select Claude Desktop and Cursor, and MCPBolt
        writes both configs with the correct Windows paths automatically.
      </p>

      <p>
        See the full <Link href="/docs/windows">Windows install guide in the docs</Link> for more
        troubleshooting steps, or use the{" "}
        <Link href="/tools/validator">Config Validator</Link> to catch issues before they cause
        problems.
      </p>
    </div>
  );
}
