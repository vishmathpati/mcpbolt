import { DOWNLOAD_URL, GITHUB_URL } from "../lib/site";

export const metadata = {
  title: "Pricing",
  description:
    "MCPBolt is free. All features, all tools, no account required. Learn what's free and what's planned.",
};

const freeFeatures = [
  "Install into Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Zed, Codex CLI, Gemini CLI, opencode, Roo",
  "Enable / disable toggle per server per app",
  "Always-on health status (green / amber / red)",
  "Sync any server across all tools in one action",
  "Edit server config without touching JSON",
  "Remove from one tool or all tools",
  "Smart paste — auto-detects JSON, TOML, YAML, npx, docker",
  "Coverage matrix",
  "Projects tab with auto-discovery",
  "Timestamped backups and undo",
  "Full-screen dashboard window",
  "Launch at login",
  "CLI (npx mcpbolt) included",
  "macOS Apple Silicon and Intel",
];

const proFeatures = [
  "Sync settings across your own machines via a Git repo you control",
  "Team coverage dashboards — aggregate views, no PII",
  "Priority support (email, response within one business day)",
  "Early access to new tool integrations",
];

const teamFeatures = [
  "Everything in Pro",
  "Enterprise SSO integration (SAML / OIDC)",
  "Centralised server catalog for your org",
  "All data stays in your infrastructure",
  "Compliance-friendly — no cloud dependency",
  "Custom contract and SLA",
];

const faqs = [
  {
    q: "Why is it free?",
    a: "MCPBolt started as a tool to solve my own problem: I was editing the same MCP configs in five different JSON files every time I added a server. It took a weekend to build and solves the problem completely. Releasing it as free and open source means other people benefit from it without me needing a billing system. The work is done.",
  },
  {
    q: "Will you ever charge for anything?",
    a: "The core product — install, sync, manage, health checks, CLI, menu bar — will stay free. If Pro or Team tiers launch, they will cover features that require server-side infrastructure (multi-machine sync, dashboards). The free tier won't get worse. Features won't be locked behind a paywall retroactively.",
  },
  {
    q: "Can I self-host anything?",
    a: "The CLI and the menu bar app run entirely on your machine — there's nothing to self-host. The source code is MIT licensed, so you can fork and modify freely. If Team-tier features require a server component, we will publish the server code as open source so you can run it yourself.",
  },
  {
    q: "Can I trust this with my config files?",
    a: "MCPBolt never sends your config files or their contents anywhere. It reads and writes local files only. No telemetry, no analytics, no account login. The source code is on GitHub — you can read every file it touches and every network call it makes (there are none, except optional health pings to the servers you have configured).",
  },
  {
    q: "Is there a paid license for companies that need one?",
    a: "Not yet. If your organization needs a commercial license, an invoice, or a vendor security review, email hello@mcpbolt.com and we will work something out.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <header className="page-hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>Free — no account required</span>
        </div>
        <h1>
          Simple pricing.<br />
          <span className="accent">Free forever.</span>
        </h1>
        <p className="sub">
          MCPBolt is free and open source. All features, all tools, no paywalls. Pro and Team tiers are on the roadmap for teams that need infrastructure-level features.
        </p>
      </header>

      {/* Price grid */}
      <section style={{ padding: "56px 0 0" }}>
        <div className="container">
          <div className="price-grid">

            {/* Free */}
            <div className="price-card featured">
              <h3>Free</h3>
              <div className="price-amount">$0<span>/ forever</span></div>
              <p style={{ color: "var(--fg-dim)", fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.5 }}>
                Every feature. All ten tools. CLI and menu bar app. Local-only — your configs never leave your machine.
              </p>
              <ul className="price-features">
                {freeFeatures.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <a href={DOWNLOAD_URL} className="btn btn-primary" target="_blank" rel="noreferrer" style={{ textAlign: "center", justifyContent: "center" }}>
                Download for macOS
              </a>
            </div>

            {/* Pro */}
            <div className="price-card" style={{ opacity: 0.72 }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                Pro
                <span style={{
                  fontSize: "var(--fs-xs)",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--fg-faint)",
                }}>Coming soon</span>
              </h3>
              <div className="price-amount" style={{ color: "var(--fg-faint)" }}>TBD</div>
              <p style={{ color: "var(--fg-dim)", fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.5 }}>
                For developers who work across multiple machines and want their server lists in sync without manual effort.
              </p>
              <ul className="price-features">
                {proFeatures.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <div style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                textAlign: "center",
                fontSize: "var(--fs-sm)",
                color: "var(--fg-faint)",
              }}>
                Leave your email at{" "}
                <a href="mailto:hello@mcpbolt.com" style={{ color: "var(--accent)" }}>hello@mcpbolt.com</a>{" "}
                to get notified
              </div>
            </div>

            {/* Team */}
            <div className="price-card" style={{ opacity: 0.72 }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                Team
                <span style={{
                  fontSize: "var(--fs-xs)",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--fg-faint)",
                }}>Contact us</span>
              </h3>
              <div className="price-amount" style={{ color: "var(--fg-faint)" }}>Custom</div>
              <p style={{ color: "var(--fg-dim)", fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.5 }}>
                For engineering teams that want centralised MCP server management with compliance guarantees and no external data dependency.
              </p>
              <ul className="price-features">
                {teamFeatures.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <a href="mailto:hello@mcpbolt.com" className="btn" style={{ textAlign: "center", justifyContent: "center" }}>
                Contact us
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "72px 0 80px" }}>
        <div className="container" style={{ maxWidth: 740 }}>
          <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px" }}>
            <div className="section-kicker">FAQ</div>
            <h2>Common questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 style={{ margin: "0 0 10px", fontSize: "var(--fs-md)", fontWeight: 700 }}>{faq.q}</h3>
                <p style={{ margin: 0, color: "var(--fg-dim)", lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>Start for free</h2>
          <p>Download the menu bar app or run the CLI. No account, no credit card.</p>
          <div className="cta-row">
            <a href={DOWNLOAD_URL} className="btn btn-primary" target="_blank" rel="noreferrer">
              Download for macOS
            </a>
            <a href={GITHUB_URL} className="btn" target="_blank" rel="noreferrer">
              View source ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
