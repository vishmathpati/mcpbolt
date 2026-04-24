import { Callout } from "../../components/Callout";

export function McpConfigHell() {
  return (
    <>
      <p>
        It starts simply enough. You read a tweet about the Supabase MCP server, click through to
        the docs, and find a neat JSON snippet. You paste it into Claude Desktop&apos;s config file.
        It works. You close the laptop feeling clever.
      </p>

      <p>
        Three days later you&apos;re setting up Cursor on a new machine. You want the same Supabase
        server. You open <code>~/.cursor/mcp.json</code>, paste the same snippet, reload Cursor. Red
        error. The schema is slightly different. You spend twenty minutes debugging.
      </p>

      <p>
        A week after that, your team adopts VS Code&apos;s agent mode. Now you need the server in
        VS Code too. Same story, different shape.
      </p>

      <p>
        By the end of the month you&apos;ve also got Codex CLI, Windsurf, and Zed in your stack.
        Five tools. Five config files. Five slightly different representations of the same
        one-sentence fact: &ldquo;there is a Supabase MCP server at this URL.&rdquo;
      </p>

      <h2>The actual config shapes, side by side</h2>

      <p>
        This is not a hypothetical. These are the real formats each tool expects, taken directly
        from their documentation.
      </p>

      <p>
        <strong>Claude Desktop, Cursor, Windsurf</strong> all expect the <code>mcpServers</code>{" "}
        key with command and args nested under the server name:
      </p>

      <pre><code>{`{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": { "SUPABASE_ACCESS_TOKEN": "YOUR_TOKEN" }
    }
  }
}`}</code></pre>

      <p>
        <strong>VS Code</strong> uses a <code>servers</code> key and requires an explicit{" "}
        <code>type</code> field that the other clients don&apos;t use:
      </p>

      <pre><code>{`{
  "servers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": { "SUPABASE_ACCESS_TOKEN": "YOUR_TOKEN" }
    }
  }
}`}</code></pre>

      <p>
        <strong>Zed</strong> nests everything under <code>context_servers</code> and then{" "}
        <code>command</code> is itself a nested object with a <code>path</code> key:
      </p>

      <pre><code>{`{
  "context_servers": {
    "supabase": {
      "command": {
        "path": "npx",
        "args": ["-y", "@supabase/mcp-server-supabase@latest"]
      },
      "settings": {}
    }
  }
}`}</code></pre>

      <p>
        <strong>Codex CLI</strong> abandons JSON entirely in favor of TOML:
      </p>

      <pre><code>{`[mcp_servers.supabase]
command = "npx"
args = ["-y", "@supabase/mcp-server-supabase@latest"]

[mcp_servers.supabase.env]
SUPABASE_ACCESS_TOKEN = "YOUR_TOKEN"`}</code></pre>

      <p>
        <strong>Continue</strong> uses YAML with a list structure instead of a map:
      </p>

      <pre><code>{`mcpServers:
  - name: supabase
    command: npx
    args: ["-y", "@supabase/mcp-server-supabase@latest"]
    env:
      SUPABASE_ACCESS_TOKEN: YOUR_TOKEN`}</code></pre>

      <Callout kind="info" title="Count the differences">
        The same server entry changes format five times across five tools. Some use{" "}
        <code>mcpServers</code>, some <code>servers</code>, some <code>context_servers</code>. Some
        require <code>type</code>, some don&apos;t. Some are JSON, one is TOML, one is YAML. One
        nests <code>command</code> inside an object; the others treat it as a string.
      </Callout>

      <h2>Why did this happen?</h2>

      <p>
        The Model Context Protocol defines what a server <em>does</em> (the JSON-RPC messages it
        exchanges with clients) but not how client applications should store server configuration on
        disk. That&apos;s a deliberate scope choice: MCP is a network protocol, not a package
        manager.
      </p>

      <p>
        So each tool team made their own call. Cursor looked at their existing settings JSON and
        added an <code>mcpServers</code> key to match Claude Desktop&apos;s published format.
        VS Code had an existing settings architecture that called for a <code>type</code>{" "}
        discriminator on every server entry, so they added one. Zed had <code>context_servers</code>{" "}
        already in their settings file from an earlier feature. The Codex CLI team defaulted to TOML
        because OpenAI&apos;s other config files use TOML. Continue, as a YAML-first tool, kept it
        YAML.
      </p>

      <p>
        None of these decisions were wrong, exactly. They each made sense given each team&apos;s
        existing code and conventions. But the aggregate result is a maintenance burden that falls
        entirely on the developer installing servers.
      </p>

      <h2>What this costs in practice</h2>

      <p>
        The time cost is the obvious part. Fifteen minutes of frustration every time you add a new
        server is bad, but it&apos;s bounded. The subtler costs compound over time.
      </p>

      <p>
        <strong>Sync drift.</strong> Once you&apos;ve hand-copied a server config into five files,
        those five files immediately start diverging. You update the Supabase token in Claude
        Desktop. You forget to update it in Cursor. Two weeks later you file a bug about Cursor not
        having database access, and spend 40 minutes before you realize the token expired everywhere
        else too.
      </p>

      <p>
        <strong>Source-of-truth confusion.</strong> Which config file is canonical? If a colleague
        asks &ldquo;what MCP servers do we use?,&rdquo; the answer is scattered across five
        files in three different formats. There&apos;s no single list. You develop the habit of
        checking each file manually, which means you frequently miss one.
      </p>

      <p>
        <strong>Onboarding friction.</strong> When someone new joins your team, they need to install
        all the servers. There&apos;s no <code>package.json</code> equivalent for MCP configs. The
        documentation is &ldquo;look at John&apos;s Claude Desktop config and translate it for
        whatever tools you use.&rdquo; John uses Cursor. You use VS Code. The translation is manual.
      </p>

      <p>
        <strong>Format regressions.</strong> Each of these tools updates. VS Code added the{" "}
        <code>type</code> field requirement mid-way through 2024. If you&apos;d copied a
        VS Code config from before that change, it would silently stop working after an update.
        With five tools, you have five independent versioned config schemas to track.
      </p>

      <Callout kind="warn" title="The .bak problem">
        Most developers know to make a backup before editing any config file by hand. So now you
        also have five <code>claude_desktop_config.json.bak</code>,{" "}
        <code>mcp.json.bak</code>, <code>settings.json.bak</code> files floating around, each
        potentially containing a different version of the same server list. Good luck knowing
        which one is current.
      </Callout>

      <h2>The abstraction that&apos;s missing</h2>

      <p>
        What all five formats have in common is the same underlying information: a server has a
        name, a transport (stdio or HTTP), and either a command with arguments or a URL with headers.
        That&apos;s it. Every format difference above is just a different rendering of that four-field
        record.
      </p>

      <p>
        The missing piece is a tool that holds one copy of that record and renders it into each
        format on demand. Something you paste your config into once, and it figures out the rest.
      </p>

      <p>
        That&apos;s what MCPBolt is. But the config-hell problem is real regardless of how you solve
        it, and understanding it fully is the prerequisite to appreciating why any solution has to
        work at the format-translation layer, not just at the GUI layer.
      </p>

      <p>
        In the <a href="/blog/introducing-mcpbolt">next post</a>, we walk through what MCPBolt does
        and why it was built the way it was.
      </p>
    </>
  );
}
