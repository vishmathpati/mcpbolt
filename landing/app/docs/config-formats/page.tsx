import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata = {
  title: "Config formats",
  description:
    "Every input format MCPBolt accepts: Claude Desktop JSON, VS Code JSON, Zed context_servers, Codex TOML, Continue YAML, npx commands, Docker commands, and bare URLs.",
};

export default function DocsConfigFormatsPage() {
  return (
    <>
      <div className="prose">
        <h1>Supported input formats</h1>
        <p>
          MCPBolt auto-detects the format of whatever you paste. You never need to tell it the
          format — it reads the shape of the content and picks the right parser. All formats are
          normalized to the same internal representation before being written out.
        </p>

        <h2>Format overview</h2>
        <table>
          <thead>
            <tr>
              <th>Format</th>
              <th>Apps that use it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Claude Desktop / Cursor / Windsurf JSON</td>
              <td>Claude Desktop, Claude Code, Cursor, Windsurf, Gemini CLI, Roo</td>
            </tr>
            <tr>
              <td>VS Code JSON (<code>servers</code> + <code>type</code>)</td>
              <td>VS Code</td>
            </tr>
            <tr>
              <td>Zed <code>context_servers</code></td>
              <td>Zed</td>
            </tr>
            <tr>
              <td>Codex TOML</td>
              <td>Codex CLI</td>
            </tr>
            <tr>
              <td>Continue YAML</td>
              <td>Continue</td>
            </tr>
            <tr>
              <td>npx one-liner</td>
              <td>Any (MCPBolt converts to the target's format)</td>
            </tr>
            <tr>
              <td>Docker command</td>
              <td>Any</td>
            </tr>
            <tr>
              <td>Bare URL</td>
              <td>Any (creates a remote HTTP/SSE server entry)</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>Claude Desktop / Cursor / Windsurf JSON</h2>
        <p>
          The most common format. The top-level key is <code>mcpServers</code> — a map of server
          name to config object. Used by Claude Desktop, Claude Code, Cursor, Windsurf, Gemini CLI,
          and Roo.
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
          For a remote HTTP server, use <code>url</code> instead of <code>command</code>:
        </p>
        <pre><code>{`{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_TOKEN" }
    }
  }
}`}</code></pre>
        <p>
          MCPBolt reads this format as-is and writes the correct native config for every selected
          target, translating field names where needed (e.g. wrapping in <code>type: "stdio"</code>{" "}
          for VS Code).
        </p>

        <hr />

        <h2>VS Code JSON</h2>
        <p>
          VS Code uses a <code>servers</code> key (not <code>mcpServers</code>) and requires an
          explicit <code>type</code> field on every entry.
        </p>
        <pre><code>{`{
  "servers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}`}</code></pre>
        <p>
          MCPBolt detects the <code>servers</code> + <code>type</code> shape and parses it
          correctly. When writing to VS Code targets, it adds <code>type</code> automatically;
          when writing to other targets, it strips it.
        </p>

        <hr />

        <h2>Zed context_servers</h2>
        <p>
          Zed stores MCP servers inside its <code>settings.json</code> under{" "}
          <code>context_servers</code>. The server command is nested differently:
        </p>
        <pre><code>{`{
  "context_servers": {
    "filesystem": {
      "command": {
        "path": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
      }
    }
  }
}`}</code></pre>
        <p>
          MCPBolt recognizes the <code>context_servers</code> key and uses the Zed merger
          (<code>mergeJsonNested</code>) to insert the server without touching any other settings
          in the file.
        </p>

        <hr />

        <h2>Codex TOML</h2>
        <p>
          Codex CLI uses TOML for its config. MCP server entries live under{" "}
          <code>[mcp_servers.&lt;name&gt;]</code>:
        </p>
        <pre><code>{`[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem"]`}</code></pre>
        <p>
          MCPBolt parses pasted TOML and writes the entry with <code>mergeToml</code>, preserving
          all existing sections.
        </p>

        <hr />

        <h2>Continue YAML</h2>
        <p>Continue stores servers as a YAML array under <code>mcpServers</code>:</p>
        <pre><code>{`mcpServers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem"]`}</code></pre>
        <p>
          MCPBolt appends to the array (or updates the entry if a server with the same name already
          exists) using <code>mergeYamlArray</code>.
        </p>

        <hr />

        <h2>npx one-liner</h2>
        <p>
          Many server READMEs show a quick <code>npx</code> command. Paste it directly — MCPBolt
          splits it into <code>command</code>, <code>args</code>, and an inferred server name:
        </p>
        <pre><code>{`npx -y @modelcontextprotocol/server-filesystem /Users/me/projects`}</code></pre>
        <p>
          MCPBolt derives the server name from the package name (e.g. <code>server-filesystem</code>)
          and prompts you to confirm before writing.
        </p>

        <hr />

        <h2>Docker command</h2>
        <p>
          If a server ships as a Docker image, paste the <code>docker run</code> command:
        </p>
        <pre><code>{`docker run -i --rm mcp/brave-search`}</code></pre>
        <p>
          MCPBolt parses this into a stdio server entry using <code>docker</code> as the command
          and the remaining tokens as args.
        </p>

        <hr />

        <h2>Bare URL</h2>
        <p>
          If you have just a URL pointing to a remote MCP server, paste it as-is:
        </p>
        <pre><code>{`https://mcp.example.com/sse`}</code></pre>
        <p>
          MCPBolt creates a remote server entry with the URL as the transport. It will prompt you
          for a server name and optional auth headers.
        </p>

        <Callout kind="warn" title="Headers and secrets">
          If your remote server needs an Authorization header, MCPBolt will prompt you for the
          value and write it into the config file as plaintext. Keep this in mind — config files
          on disk are not encrypted. See <Link href="/docs/security">Security</Link> for guidance.
        </Callout>
      </div>
      <DocsPageNav
        prev={{ label: "CLI reference", href: "/docs/cli" }}
        next={{ label: "Menu bar tour", href: "/docs/menubar" }}
      />
    </>
  );
}
