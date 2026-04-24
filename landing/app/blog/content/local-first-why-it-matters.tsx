import { Callout } from "../../components/Callout";

export function LocalFirstWhyItMatters() {
  return (
    <>
      <p>
        MCPBolt runs entirely on your machine. No account. No telemetry. No cloud sync of your
        configuration. This is not an accident or a limitation; it is a deliberate choice, and the
        reasoning is worth explaining.
      </p>

      <h2>Reason 1: Your MCP configs contain secrets</h2>

      <p>
        Look at what actually lives in a typical MCP config file. A Supabase server entry includes
        a personal access token with read-write access to your database. A GitHub server entry
        includes a token that can create issues, open pull requests, and clone repositories. A
        Sentry entry includes a token that can read your error logs and production stack traces.
        A Brave Search entry includes an API key you are paying for by the request.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": { "Authorization": "Bearer sbp_REAL_TOKEN_HERE" }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_REAL_TOKEN_HERE" }
    },
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server"],
      "env": { "SENTRY_ACCESS_TOKEN": "sntryu_REAL_TOKEN_HERE" }
    }
  }
}`}</code></pre>

      <p>
        This is a real credential store. Sending this file to a cloud sync service, even over TLS,
        means a copy of your tokens exists on infrastructure you don&apos;t control. If that
        service is compromised, if it sells your data, or if it stores logs longer than its privacy
        policy implies, your tokens are exposed.
      </p>

      <p>
        The standard response is &ldquo;but we encrypt everything.&rdquo; Maybe. But the service
        needs to decrypt in order to use: to display your config, to sync it across devices, to
        show you a dashboard. At that point, the plaintext exists on their server. Encryption at
        rest does not solve the problem when the application layer reads the plaintext.
      </p>

      <Callout kind="danger" title="MCP configs are credential files">
        Treat your MCP config files the same way you treat <code>~/.ssh/id_rsa</code> or your{" "}
        <code>.env</code> file. They should exist only on machines you control, and they should
        never transit a third-party service.
      </Callout>

      <h2>Reason 2: Your dev environment should not depend on a third-party service being up</h2>

      <p>
        MCP servers are part of your development workflow. When you&apos;re debugging at 11pm before
        a deploy, you need your tools to work. If your MCP config sync depends on a cloud service,
        then your ability to install a new server (or restore a corrupted config) is gated on that
        service being available.
      </p>

      <p>
        This is not a theoretical concern. Every SaaS has maintenance windows. Every API has
        outages. The npm registry itself goes down occasionally. Building a hard dependency on any
        external service into a configuration management tool means accepting that your workflow
        fails when that service fails.
      </p>

      <p>
        MCPBolt writes directly to files on your local filesystem. It uses no network connections
        during normal operation. It works on an airplane, in a hotel with bad wifi, in a corporate
        environment with aggressive egress filtering. The only network calls it makes are the ones
        you make explicitly (running <code>npx mcpbolt</code> fetches the package from npm if you
        haven&apos;t installed it globally; after that, nothing).
      </p>

      <h2>Reason 3: No account means no friction, no lock-in, and no pressure</h2>

      <p>
        Creating an account has a cost that compounds over time. You sign up, give your email, get
        added to a mailing list, start receiving product updates. The service now has a business
        relationship with you. That relationship creates pressure: to upsell you to a paid tier, to
        collect usage data to inform their roadmap, to send you emails that bring you back to their
        product.
      </p>

      <p>
        MCPBolt has no user accounts, no email addresses, no usage data. There is no mechanism by
        which MCPBolt can become a subscription product, because there is no identity layer that a
        subscription could attach to. This is enforced by design, not just promised by policy.
      </p>

      <p>
        The practical benefit is also real. MCPBolt installs and runs in about 30 seconds:{" "}
        <code>npx mcpbolt</code>. No signup flow, no email verification, no onboarding checklist.
        You paste a config and it works. When you want to stop using MCPBolt, you just stop
        running it. There is nothing to delete, no account to close, no data to request erasure of.
      </p>

      <h2>The safety design, concretely</h2>

      <p>
        Local-first does not mean unsafe. MCPBolt has three safety layers built into every write
        operation:
      </p>

      <p>
        <strong>Merge, never overwrite.</strong> MCPBolt reads the existing config file, inserts
        or updates the one server key you asked it to write, and writes the result back. Every
        other key in your config is untouched. You do not lose your other servers when you add one.
      </p>

      <p>
        <strong>Atomic backup.</strong> Before writing any file, MCPBolt creates a{" "}
        <code>.bak</code> file alongside it. If something goes wrong (power loss, corrupted write,
        a bug in MCPBolt), you have a copy of the file as it was before the operation.
      </p>

      <p>
        <strong>Dry-run preview.</strong> The default flow always shows you a preview of every
        change before writing. You see exactly which files will be modified and what the change
        will look like. The write only happens after you explicitly confirm.
      </p>

      <h2>The social contract</h2>

      <p>
        MCPBolt is MIT licensed. The source is on GitHub and can be read, audited, and forked by
        anyone. There is no venture capital investment, which means there is no pressure to
        monetize, to pivot toward enterprise, or to introduce a &ldquo;freemium&rdquo; tier that
        gates features behind a cloud account.
      </p>

      <p>
        Local-first is not just an engineering choice. It is a statement about what kind of
        relationship a tool should have with the developer who uses it: it does its job, it stays
        out of your way, and it does not try to become indispensable by accumulating your data.
      </p>

      <p>
        If you want a tool that respects that relationship,{" "}
        <a href="/download">download MCPBolt</a>.
      </p>
    </>
  );
}
