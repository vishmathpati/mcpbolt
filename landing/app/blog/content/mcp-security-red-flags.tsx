import Link from "next/link";

export function McpSecurityRedFlags() {
  return (
    <div className="prose">
      <p className="lead">
        Most developers install MCP servers without a second thought — you find a server, paste the
        config, move on. But an MCP server runs as a process with your credentials and file access.
        Here are five red flags that are worth five minutes of your time before you install
        anything.
      </p>

      <hr />

      <h2>Red flag 1 — The package owner has no track record</h2>
      <p>
        Before running <code>npx @someone/mcp-server</code>, check who &ldquo;someone&rdquo; is.
        Open the npm page. Look at the GitHub profile. A package published last week by an account
        with one repo and no followers is a higher risk than a package maintained by a team with a
        two-year commit history.
      </p>
      <p>
        This is not paranoia — there have been real incidents where MCP packages named to look like
        official tools (typosquatting) exfiltrated credentials or injected behavior into codebases.
      </p>
      <p>
        <strong>What to check:</strong>
      </p>
      <ul>
        <li>npm: when was the package first published? How many weekly downloads?</li>
        <li>GitHub: does the repo have issues, PRs, a commit history?</li>
        <li>Is the publisher the same organization that makes the product the server integrates with?</li>
      </ul>

      <hr />

      <h2>Red flag 2 — The config asks for broad file system access</h2>
      <p>
        Some servers are genuinely meant to access your file system —{" "}
        <code>@modelcontextprotocol/server-filesystem</code> is the obvious example. But when a
        server that has nothing to do with files includes a path like <code>/</code> or{" "}
        <code>~/</code> in its args, that is worth questioning.
      </p>
      <pre>{`// Suspicious: why does a database MCP need ~/
{
  "mcpServers": {
    "some-db": {
      "command": "npx",
      "args": ["-y", "@suspicious/db-mcp", "--root", "/"]
    }
  }
}`}</pre>
      <p>
        MCP servers can read and write files through your AI tool. Giving one broad file system
        access is the equivalent of running an untrusted script with access to everything.
      </p>
      <p>
        <strong>Rule of thumb:</strong> only grant file access to paths the server actually needs.
        Pass specific directories, not <code>~/</code> or <code>/</code>.
      </p>

      <hr />

      <h2>Red flag 3 — The URL uses HTTP or a raw IP address</h2>
      <p>
        Streamable HTTP MCP servers connect to a remote URL. If that URL is{" "}
        <code>http://</code> (not <code>https://</code>), every request including your
        authorization header is sent in plaintext. Anyone on the network can read it.
      </p>
      <p>
        Similarly, a URL like <code>http://192.168.1.100:8080/mcp</code> might be a legitimate
        local dev setup — or it might be an endpoint that should not be trusted with production
        credentials.
      </p>
      <p>
        <strong>What to do:</strong> only use <code>https://</code> URLs for any MCP server that
        handles real data or receives real credentials. Use the{" "}
        <Link href="/tools/validator">Config Validator</Link> — it flags HTTP URLs and IP-based
        endpoints automatically.
      </p>

      <hr />

      <h2>Red flag 4 — Hardcoded secrets in the config file</h2>
      <p>
        Many servers require an API key passed as an env var. The correct pattern is:
      </p>
      <pre>{`{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my/mcp-server"],
      "env": {
        "API_KEY": "sk-live-abc123..."
      }
    }
  }
}`}</pre>
      <p>
        This is fine <em>in isolation</em> — but <code>claude_desktop_config.json</code> is a
        plain text file. If you commit it, share it, or back it up to a cloud drive without
        encryption, that key leaks.
      </p>
      <p>
        <strong>Mitigations:</strong>
      </p>
      <ul>
        <li>Add <code>claude_desktop_config.json</code> to your global <code>.gitignore</code>.</li>
        <li>Use scoped API keys with minimum necessary permissions.</li>
        <li>Rotate keys immediately if you accidentally expose a config file.</li>
      </ul>

      <hr />

      <h2>Red flag 5 — Updates without a changelog</h2>
      <p>
        MCP servers distributed via <code>npx</code> with <code>-y</code> run{" "}
        <strong>the latest published version</strong> every time. If the maintainer publishes a
        new version — or if someone takes over the package — you will silently run new code on
        your next restart.
      </p>
      <p>
        This is the &ldquo;rug-pull update&rdquo; risk: a server that was safe when you installed
        it can become unsafe after an update you never saw.
      </p>
      <p>
        <strong>Mitigations:</strong>
      </p>
      <ul>
        <li>Pin to a specific version: <code>npx @package/mcp@1.2.3</code> instead of <code>-y</code>.</li>
        <li>Watch the GitHub repo for releases.</li>
        <li>For high-trust servers (anything with file, code, or credential access), prefer a locked version over the latest.</li>
      </ul>

      <hr />

      <h2>The 30-second pre-install checklist</h2>
      <ol>
        <li>Does the publisher have a verifiable identity (org GitHub, official docs page)?</li>
        <li>Does the npm package have a realistic download history?</li>
        <li>Does the config only request access to paths / tools the server actually needs?</li>
        <li>Is the URL <code>https://</code> with a known domain?</li>
        <li>Are you pinning a version, or at least watching the repo for updates?</li>
      </ol>
      <p>
        Five yes answers and you are in a reasonable place. Any no answers are worth five minutes
        of investigation before you give a new process access to your credentials and codebase.
      </p>
      <p>
        See <Link href="/docs/security">MCPBolt&apos;s security docs</Link> for how MCPBolt itself
        handles your config files, and use the <Link href="/tools/validator">Config Validator</Link>{" "}
        to automatically surface red flags 3 and 4 before you install anything.
      </p>
    </div>
  );
}
