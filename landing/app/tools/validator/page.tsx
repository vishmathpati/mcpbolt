import type { Metadata } from "next";
import { ValidatorTool } from "./ValidatorTool";

export const metadata: Metadata = {
  title: "MCP Config Validator — MCPBolt Tools",
  description:
    "Validate any MCP server config JSON. Catches missing fields, empty API keys, bad URLs, security issues, and format errors. Runs entirely in your browser.",
};

export default function ValidatorPage() {
  return (
    <>
      <div className="converter-page-hero">
        <div className="container">
          <div className="section-kicker">Web tool</div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", marginBottom: 12 }}>
            MCP Config Validator
          </h1>
          <p style={{ color: "var(--fg-dim)", maxWidth: 600, margin: "0 auto", lineHeight: 1.65 }}>
            Paste any MCP config JSON and get an instant report: format check, missing fields,
            empty API keys, bad URLs, and common security issues. Runs entirely in your browser.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px 96px" }}>
        <ValidatorTool />

        {/* What it checks */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>
            What gets checked
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {[
              {
                icon: "🏗️",
                title: "Structure",
                items: ["Top-level key (mcpServers / servers / context_servers)", "Each server has command or url", "args is an array, env is an object"],
              },
              {
                icon: "🔑",
                title: "Missing API keys",
                items: ["env vars with empty string values", "headers with empty Bearer tokens", "Highlights exactly which keys need to be filled in"],
              },
              {
                icon: "🔒",
                title: "Security",
                items: ["Possible secrets hardcoded in args or env values", "HTTP URLs (should be HTTPS)", "IP-based endpoints", "Dangerous flags (--no-verify, --insecure)"],
              },
              {
                icon: "📐",
                title: "Format",
                items: ["Detects Claude Desktop, VS Code, Zed formats", "Flags single-server objects missing a wrapper", "Warns about unrecognized extra fields"],
              },
            ].map((sec) => (
              <div
                key={sec.title}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "18px 20px",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 10 }}>{sec.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{sec.title}</div>
                <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 5 }}>
                  {sec.items.map((item) => (
                    <li key={item} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* MCPBolt promo */}
        <div
          style={{
            marginTop: 56,
            padding: "32px 36px",
            background: "rgba(255,211,77,0.04)",
            border: "1px solid rgba(255,211,77,0.18)",
            borderRadius: 14,
            display: "flex",
            gap: 24,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Config breaking after app updates?
            </div>
            <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.65 }}>
              MCPBolt manages your configs so they survive Claude Desktop, Cursor, and VS Code
              updates automatically. No more hunting for broken JSON paths.
            </p>
          </div>
          <a href="/download" className="btn btn-primary" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
            Download MCPBolt
          </a>
        </div>
      </div>
    </>
  );
}
