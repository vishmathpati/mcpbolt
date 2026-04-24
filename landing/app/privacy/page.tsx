export const metadata = {
  title: "Privacy Policy",
  description:
    "MCPBolt doesn't collect anything. Local-only CLI and menu bar app — no telemetry, no account, no data leaves your machine.",
};

export default function PrivacyPage() {
  return (
    <>
      <header className="page-hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>Plain English</span>
        </div>
        <h1>Privacy Policy</h1>
        <p className="sub">
          Short version: MCPBolt doesn&apos;t collect anything about you. Your config files stay on your machine.
        </p>
      </header>

      <div className="container" style={{ padding: "56px 24px 80px" }}>
        <div className="prose">

          <p style={{ color: "var(--fg-faint)", fontSize: "var(--fs-sm)" }}>Last updated: April 2026</p>

          <h2>The app and CLI</h2>

          <p>
            MCPBolt — the Mac menu bar app (MCPBoltBar) and the CLI (<code>npx mcpbolt</code>) — run entirely on your machine. They read and write local config files. They make no outbound network connections except to the MCP servers you have configured, purely to run the health-check pings that you can see in the UI. No usage data, no crash reports, no analytics, no telemetry of any kind leaves your computer.
          </p>

          <p>
            We do not require an account. We do not know who you are, what tools you use, or how many MCP servers you have installed.
          </p>

          <h2>Health checks</h2>

          <p>
            The always-on health status feature pings the servers listed in your local config. Those pings go from your machine directly to the server (e.g. <code>https://mcp.supabase.com/mcp</code>). MCPBolt does not see this traffic — it originates from your machine the same way a curl command would. If you do not want health checks, you can disable them in Settings.
          </p>

          <h2>This website</h2>

          <p>
            When you visit mcpbolt.com, the site is hosted on Vercel. Vercel logs standard HTTP access data (IP address, request path, timestamp, user agent) for operational purposes. This is typical for any website and is governed by <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel&apos;s Privacy Policy</a>, not this one.
          </p>

          <p>
            If Vercel Analytics is enabled on this site, page views are counted without identifying individual visitors. No cookies are set for tracking. We do not use Google Analytics, Meta Pixel, or any cross-site tracking.
          </p>

          <h2>Cookies</h2>

          <p>
            This website sets no cookies beyond what Vercel may set for its own infrastructure purposes. No advertising cookies. No persistent tracking.
          </p>

          <h2>Data we don&apos;t have</h2>

          <p>
            We don&apos;t collect your name, email address, IP address, server list, config contents, or any other personal information through the app or CLI. We can&apos;t sell data we don&apos;t have.
          </p>

          <h2>Changes to this policy</h2>

          <p>
            If this policy changes materially, we will update the date at the top and note it in the changelog. Because we collect nothing, there is not much here that can change.
          </p>

          <h2>Contact</h2>

          <p>
            Questions about privacy: <a href="mailto:hello@mcpbolt.com">hello@mcpbolt.com</a>
          </p>

        </div>
      </div>
    </>
  );
}
