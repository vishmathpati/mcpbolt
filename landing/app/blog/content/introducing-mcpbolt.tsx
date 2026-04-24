import { Callout } from "../../components/Callout";

export function IntroducingMcpbolt() {
  return (
    <>
      <p>
        I got tired of copy-pasting the same Supabase config into eight different JSON files. So I
        built a tool to do it for me.
      </p>

      <p>
        MCPBolt is a free, open-source, local-only CLI and Mac menu bar app that installs any MCP
        server into any AI coding tool from a single paste. No account. No cloud. No JSON
        archaeology.
      </p>

      <h2>The three-second pitch</h2>

      <p>You paste a config snippet once. MCPBolt:</p>

      <ul>
        <li>Detects the format automatically (Claude JSON, VS Code JSON, TOML, YAML, bare URL, npx one-liner, Docker command)</li>
        <li>Parses it into an internal representation that captures name, transport, and credentials</li>
        <li>Writes the correct native config for each tool you select, at each scope (user-level or project-level)</li>
      </ul>

      <p>
        That&apos;s the whole thing. It&apos;s not a registry, a marketplace, or a cloud service. It&apos;s
        a format translator and a file writer.
      </p>

      <h2>What a run actually looks like</h2>

      <p>
        Here is a real session. You found the Supabase MCP server and grabbed their config snippet:
      </p>

      <pre><code>{`$ npx mcpbolt

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
  → Run "Developer: Reload Window" in VS Code (Cmd+Shift+P).`}</code></pre>

      <p>
        Start to finish: about 30 seconds. And you never touched a JSON file manually.
      </p>

      <Callout kind="tip" title="It handles every input format">
        Paste a bare URL (<code>https://mcp.example.com/sse</code>), an npx one-liner, a Docker
        command, a Claude Desktop JSON blob, a VS Code servers block, Continue YAML, or Codex
        TOML. MCPBolt auto-detects all of them and converts to whatever each target needs.
      </Callout>

      <h2>Ten tools supported on day one</h2>

      <p>
        MCPBolt knows how to write to all of these, at both user (global) and project scope where
        applicable:
      </p>

      <ul>
        <li>Claude Desktop</li>
        <li>Claude Code (global <code>~/.claude.json</code> and project <code>.mcp.json</code>)</li>
        <li>Cursor</li>
        <li>VS Code</li>
        <li>Codex CLI</li>
        <li>Windsurf</li>
        <li>Zed</li>
        <li>Continue</li>
        <li>Gemini CLI</li>
        <li>Roo Code</li>
      </ul>

      <p>
        MCPBolt auto-detects which tools are installed on your machine and pre-checks only those in
        the target selector. You won&apos;t be prompted to write to Zed if Zed isn&apos;t installed.
      </p>

      <h2>The menu bar app</h2>

      <p>
        For developers who prefer to stay out of the terminal, MCPBolt also ships as a native macOS
        menu bar app (MCPBoltBar). Click the lightning bolt icon in your menu bar, paste a config,
        pick your targets, and write. Same flow, no terminal.
      </p>

      <p>
        It also gives you a health view: which servers are wired into which tools, which are present
        in some tools but missing from others, and a coverage badge so you can see at a glance
        whether your Claude Desktop and Cursor configs are in sync.
      </p>

      <h2>What makes it different</h2>

      <p>
        There are a few things about MCPBolt that matter to me as the person who built it:
      </p>

      <p>
        <strong>Local-only.</strong> Your MCP configs contain API keys, database URLs, and service
        tokens. They should never leave your machine. MCPBolt runs entirely locally. Nothing is
        sent anywhere.
      </p>

      <p>
        <strong>Merge, never overwrite.</strong> MCPBolt reads your existing config, inserts or
        updates the one server entry you asked it to write, and writes back. Everything else in
        your config is untouched. A <code>.bak</code> file is created next to every file that gets
        modified, so if something goes wrong you can restore.
      </p>

      <p>
        <strong>Dry-run by default.</strong> You see a preview of every change before anything is
        written. The &ldquo;write files now?&rdquo; prompt is not optional.
      </p>

      <p>
        <strong>MIT licensed and open source.</strong> The code is on GitHub. You can read it,
        fork it, contribute to it, or audit it. Adding a new tool target is one file.
      </p>

      <h2>Install it</h2>

      <p>Run without installing:</p>

      <pre><code>{`npx mcpbolt`}</code></pre>

      <p>Or install globally:</p>

      <pre><code>{`npm install -g mcpbolt`}</code></pre>

      <p>Mac menu bar app via Homebrew:</p>

      <pre><code>{`brew install --cask vishmathpati/mcpbolt/mcpboltbar`}</code></pre>

      <p>
        If you run into anything unexpected or want to add support for a tool MCPBolt doesn&apos;t
        cover yet, open an issue or a pull request. Adding a new target really is one file.
      </p>

      <p>
        <a href="/download">Download MCPBolt</a> and let me know what you think.
      </p>
    </>
  );
}
