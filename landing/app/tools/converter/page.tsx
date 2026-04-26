import type { Metadata } from "next";
import { ConverterTool } from "./ConverterTool";

export const metadata: Metadata = {
  title: "MCP Config Converter — MCPBolt Tools",
  description:
    "Convert any MCP server config to Claude Desktop, Cursor, VS Code, Zed, Codex CLI, Continue, and more. Paste JSON, npx command, or URL — runs entirely in your browser.",
};

export default function ConverterPage() {
  return (
    <>
      <div className="converter-page-hero">
        <div className="container">
          <div className="section-kicker">Web tool</div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", marginBottom: 12 }}>
            MCP Config Converter
          </h1>
          <p style={{ color: "var(--fg-dim)", maxWidth: 600, margin: "0 auto", lineHeight: 1.65 }}>
            Paste any MCP server config — JSON, <code>npx</code> command, or URL — and instantly
            get the correctly formatted output for every AI coding tool. Runs entirely in your
            browser.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px 96px" }}>
        <ConverterTool />

        {/* Educational section below the tool */}
        <div style={{ marginTop: 64 }}>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}
          >
            Supported input formats
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                title: "Claude Desktop / Cursor JSON",
                example: `{ "mcpServers": {\n  "supabase": {\n    "url": "https://mcp.supabase.com/mcp"\n  }\n}}`,
              },
              {
                title: "VS Code JSON",
                example: `{ "servers": {\n  "filesystem": {\n    "type": "stdio",\n    "command": "npx",\n    "args": ["@mcp/filesystem"]\n  }\n}}`,
              },
              {
                title: "Zed JSON",
                example: `{ "context_servers": {\n  "my-server": {\n    "command": {\n      "path": "npx",\n      "args": ["-y", "@my/mcp"]\n    }\n  }\n}}`,
              },
              {
                title: "npx / CLI command",
                example: `npx -y @modelcontextprotocol/server-filesystem ~/Downloads`,
              },
              {
                title: "Bare URL (Streamable HTTP)",
                example: `https://mcp.supabase.com/mcp`,
              },
              {
                title: "claude mcp add command",
                example: `claude mcp add context7 -- npx -y @upstash/context7-mcp`,
              },
            ].map((fmt) => (
              <div
                key={fmt.title}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "var(--fg)",
                  }}
                >
                  {fmt.title}
                </div>
                <pre
                  style={{
                    margin: 0,
                    background: "#0e1013",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 11.5,
                    color: "#d8dde4",
                    lineHeight: 1.55,
                    overflowX: "auto",
                    whiteSpace: "pre",
                  }}
                >
                  <code>{fmt.example}</code>
                </pre>
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
            <div
              style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Skip the copy-paste
            </div>
            <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.65 }}>
              This tool shows you what the output looks like. The free MCPBolt menu bar app writes it
              directly to every config file — no manual editing, no terminal.
            </p>
          </div>
          <a
            href="/download"
            className="btn btn-primary"
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Download MCPBolt
          </a>
        </div>
      </div>
    </>
  );
}
