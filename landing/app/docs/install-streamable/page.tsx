import Link from "next/link";
import type { Metadata } from "next";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata: Metadata = {
  title: "Install a Streamable HTTP MCP server — MCPBolt docs",
  description:
    "Step-by-step guide to installing a Streamable HTTP (remote) MCP server into Claude Desktop, Cursor, VS Code, and other AI coding tools.",
};

export default function InstallStreamablePage() {
  return (
    <>
      <div className="prose">
        <h1>Install a Streamable HTTP MCP server</h1>
        <p className="lead">
          Streamable HTTP MCP servers run as remote services — you connect to them via a URL rather
          than running a local process. Examples include Supabase, PostHog, and other cloud-hosted
          MCP endpoints.
        </p>

        <hr />

        <h2>What is a Streamable HTTP server?</h2>
        <p>
          The MCP specification defines two transport types for servers:
        </p>
        <ul>
          <li>
            <strong>stdio</strong> — a local process that your AI tool launches and communicates
            with over stdin/stdout. These are the most common type.
          </li>
          <li>
            <strong>Streamable HTTP</strong> — a remote HTTP endpoint (previously called
            "HTTP/SSE"). Your AI tool connects to a URL and streams results over the connection.
            No local process needed.
          </li>
        </ul>
        <p>
          Streamable HTTP servers are identified by a URL instead of a command. In a config file
          they look like:
        </p>
        <pre>{`{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}`}</pre>

        <Callout kind="info" title="Note on naming">
          The MCP spec renamed "HTTP/SSE transport" to "Streamable HTTP" in version 0.7 (early
          2025). You may see both terms used interchangeably in documentation and tools. They
          refer to the same thing.
        </Callout>

        <hr />

        <h2>Step 1 — Find your server's URL</h2>
        <p>
          Providers that offer Streamable HTTP MCP servers publish their endpoint URL in their
          documentation. For example:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> —{" "}
            <code>https://mcp.supabase.com/mcp</code> (requires authorization header)
          </li>
          <li>
            <strong>PostHog</strong> — <code>https://mcp.posthog.com/mcp</code>
          </li>
        </ul>
        <p>
          The URL may require an API key passed as a header. Check the provider's docs.
        </p>

        <h2>Step 2 — Install with MCPBolt (recommended)</h2>
        <p>
          The fastest way to install is with the{" "}
          <Link href="/download">MCPBolt menu bar app</Link>. Open it, click the paste bar, and
          paste the URL:
        </p>
        <pre>{`https://mcp.supabase.com/mcp`}</pre>
        <p>
          MCPBolt auto-detects that this is a Streamable HTTP server, picks a server name from the
          URL, and lets you select which tools to install it into. It writes the correct config for
          every tool you pick.
        </p>
        <p>
          If the server requires an authorization header, paste the full JSON config instead (see
          Step 3 below).
        </p>

        <h2>Step 3 — Manual install (any tool)</h2>
        <p>
          If you prefer to edit config files manually, here is the correct format for each tool:
        </p>

        <h3>Claude Desktop / Cursor / Windsurf / Gemini CLI / Roo / opencode</h3>
        <p>
          File: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (for
          Claude Desktop) or the tool-specific path.
        </p>
        <pre>{`{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
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
          File: <code>.vscode/mcp.json</code> (project) or VS Code user settings.
        </p>
        <pre>{`{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}`}</pre>

        <h3>Zed</h3>
        <p>
          Add to Zed's <code>settings.json</code> under <code>context_servers</code>:
        </p>
        <pre>{`{
  "context_servers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "settings": {}
    }
  }
}`}</pre>

        <h3>Codex CLI</h3>
        <p>
          File: <code>~/.codex/config.toml</code>
        </p>
        <pre>{`[[mcp_servers]]
name = "supabase"
url = "https://mcp.supabase.com/mcp"`}</pre>

        <h3>Continue</h3>
        <p>
          File: <code>~/.continue/config.yaml</code>
        </p>
        <pre>{`mcpServers:
  - name: supabase
    url: https://mcp.supabase.com/mcp`}</pre>

        <hr />

        <h2>Troubleshooting</h2>
        <ul>
          <li>
            <strong>401 Unauthorized</strong> — The server requires authentication. Add your API
            key as an <code>Authorization</code> header.
          </li>
          <li>
            <strong>Connection refused / timeout</strong> — The URL may be incorrect, or the
            service may be temporarily unavailable. Check the provider's status page.
          </li>
          <li>
            <strong>Server shows red in MCPBolt</strong> — The health check failed. This usually
            means the URL is reachable but the server returned an error, often a missing auth
            header.
          </li>
        </ul>

        <Callout kind="tip" title="Use the converter">
          Not sure what format your config needs to be in?{" "}
          <Link href="/tools/converter">Try the MCPBolt Config Converter</Link> — paste the URL
          and get the right format for every tool instantly.
        </Callout>
      </div>

      <DocsPageNav
        prev={{ label: "Install local server", href: "/docs/install-local" }}
        next={{ label: "FAQ", href: "/docs/faq" }}
      />
    </>
  );
}
