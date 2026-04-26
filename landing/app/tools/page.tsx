import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools — MCPBolt",
  description: "Free web tools for MCP developers. Convert configs, validate formats, and more.",
};

const tools = [
  {
    href: "/tools/converter",
    icon: "🔄",
    title: "MCP Config Converter",
    description:
      "Paste any MCP server config — JSON, npx command, or URL — and get the correctly formatted output for every AI coding tool instantly. No install required.",
    tags: ["Claude Desktop", "Cursor", "VS Code", "Zed", "Codex", "Continue"],
    badge: "Free · Runs in your browser",
  },
];

export default function ToolsPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="section-kicker">Web tools</div>
          <h1>Tools for MCP developers</h1>
          <p className="sub">
            Free utilities that run entirely in your browser. No account, no server, no data sent
            anywhere.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "56px 24px 96px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
          }}
        >
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div className="tool-hub-card">
                <div className="tool-hub-icon">{tool.icon}</div>
                <div>
                  <h2 className="tool-hub-title">{tool.title}</h2>
                  <p className="tool-hub-desc">{tool.description}</p>
                  <div className="tool-hub-tags">
                    {tool.tags.map((t) => (
                      <span key={t} className="tool-hub-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="tool-hub-badge">{tool.badge}</div>
                </div>
                <div className="tool-hub-arrow">→</div>
              </div>
            </Link>
          ))}

          {/* Coming soon slot */}
          <div className="tool-hub-card tool-hub-card--dim">
            <div className="tool-hub-icon">🔍</div>
            <div>
              <h2 className="tool-hub-title">Config Validator</h2>
              <p className="tool-hub-desc">
                Validate any MCP config file against the spec. Catch common mistakes before they
                break your setup.
              </p>
              <div className="tool-hub-badge">Coming soon</div>
            </div>
          </div>

          <div className="tool-hub-card tool-hub-card--dim">
            <div className="tool-hub-icon">📋</div>
            <div>
              <h2 className="tool-hub-title">Format Detector</h2>
              <p className="tool-hub-desc">
                Not sure what format your config is in? Paste it and instantly identify whether
                it is Claude Desktop, VS Code, Zed, or another format.
              </p>
              <div className="tool-hub-badge">Coming soon</div>
            </div>
          </div>
        </div>

        {/* Promo band */}
        <div
          style={{
            marginTop: 72,
            padding: "40px 40px",
            background: "rgba(255,211,77,0.04)",
            border: "1px solid rgba(255,211,77,0.18)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 16,
          }}
        >
          <div className="section-kicker">Want to skip the copy-paste?</div>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem,3vw,2rem)", letterSpacing: "-0.02em" }}>
            MCPBolt installs configs directly from your Mac
          </h2>
          <p style={{ color: "var(--fg-dim)", maxWidth: 520, margin: 0 }}>
            The web converter shows you the output. The MCPBolt menu bar app writes it to the right
            config file automatically — no copy-paste, no JSON editing.
          </p>
          <Link href="/download" className="btn btn-primary" style={{ marginTop: 4 }}>
            Download MCPBolt free
          </Link>
        </div>
      </div>
    </>
  );
}
