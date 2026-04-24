import { GITHUB_URL, DOWNLOAD_URL } from "../lib/site";

export const metadata = {
  title: "Compare",
  description:
    "How MCPBolt compares to hand-editing JSON, built-in editor UIs, Smithery CLI, and mcp-installer. Honest feature-by-feature breakdown.",
};

const cols = [
  { key: "mcpbolt",      label: "MCPBolt",            highlight: true },
  { key: "json",         label: "Hand-edit JSON",      highlight: false },
  { key: "builtin",      label: "App built-in UI",     highlight: false },
  { key: "smithery",     label: "Smithery CLI",         highlight: false },
  { key: "mcp_installer", label: "mcp-installer",       highlight: false },
];

type RowValue = "yes" | "no" | "partial" | "—";

const rows: { feature: string; values: Record<string, RowValue> }[] = [
  {
    feature: "Works in Claude Desktop",
    values: { mcpbolt: "yes", json: "yes", builtin: "partial", smithery: "yes", mcp_installer: "yes" },
  },
  {
    feature: "Works in Claude Code",
    values: { mcpbolt: "yes", json: "yes", builtin: "no", smithery: "yes", mcp_installer: "yes" },
  },
  {
    feature: "Works in Cursor",
    values: { mcpbolt: "yes", json: "yes", builtin: "yes", smithery: "partial", mcp_installer: "partial" },
  },
  {
    feature: "Works in VS Code",
    values: { mcpbolt: "yes", json: "yes", builtin: "yes", smithery: "partial", mcp_installer: "partial" },
  },
  {
    feature: "Works in Windsurf",
    values: { mcpbolt: "yes", json: "yes", builtin: "no", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Works in Zed",
    values: { mcpbolt: "yes", json: "yes", builtin: "no", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Works in Codex CLI",
    values: { mcpbolt: "yes", json: "yes", builtin: "no", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Works in Gemini CLI",
    values: { mcpbolt: "yes", json: "yes", builtin: "no", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Install time < 1 min",
    values: { mcpbolt: "yes", json: "no", builtin: "partial", smithery: "yes", mcp_installer: "yes" },
  },
  {
    feature: "Sync server to all tools with one action",
    values: { mcpbolt: "yes", json: "no", builtin: "no", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Auto-translate JSON / TOML / YAML",
    values: { mcpbolt: "yes", json: "no", builtin: "no", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Live health checks",
    values: { mcpbolt: "yes", json: "no", builtin: "partial", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Enable / disable toggle",
    values: { mcpbolt: "yes", json: "no", builtin: "partial", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Local-only (no cloud, no account)",
    values: { mcpbolt: "yes", json: "yes", builtin: "yes", smithery: "no", mcp_installer: "yes" },
  },
  {
    feature: "Free",
    values: { mcpbolt: "yes", json: "yes", builtin: "yes", smithery: "partial", mcp_installer: "yes" },
  },
  {
    feature: "Open source / MIT",
    values: { mcpbolt: "yes", json: "—", builtin: "no", smithery: "no", mcp_installer: "yes" },
  },
  {
    feature: "Menu bar GUI",
    values: { mcpbolt: "yes", json: "no", builtin: "no", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "CLI",
    values: { mcpbolt: "yes", json: "no", builtin: "no", smithery: "yes", mcp_installer: "yes" },
  },
  {
    feature: "GUI config editor (no JSON)",
    values: { mcpbolt: "yes", json: "no", builtin: "partial", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Project-scoped configs",
    values: { mcpbolt: "yes", json: "yes", builtin: "partial", smithery: "partial", mcp_installer: "partial" },
  },
  {
    feature: "Timestamped backups and undo",
    values: { mcpbolt: "yes", json: "no", builtin: "no", smithery: "no", mcp_installer: "no" },
  },
  {
    feature: "Works offline",
    values: { mcpbolt: "yes", json: "yes", builtin: "yes", smithery: "no", mcp_installer: "yes" },
  },
];

function CellValue({ v }: { v: RowValue }) {
  if (v === "yes")     return <span className="check-yes">✓</span>;
  if (v === "no")      return <span className="check-no">✗</span>;
  if (v === "partial") return <span style={{ color: "var(--warn)", fontWeight: 700 }}>~</span>;
  return <span style={{ color: "var(--fg-faint)" }}>—</span>;
}

export default function ComparePage() {
  return (
    <>
      {/* Hero */}
      <header className="page-hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>Honest comparison</span>
        </div>
        <h1>
          How MCPBolt <span className="accent">compares</span>
        </h1>
        <p className="sub">
          There are a few ways to manage MCP server configs. Here is a straightforward look at what each approach supports.
        </p>
      </header>

      {/* When-to-pick cards */}
      <section style={{ padding: "48px 0 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: 24 }}>
            <div className="section-kicker">When to pick</div>
            <h2>The right tool for the job</h2>
          </div>
          <div className="security-grid">
            <div className="sec-card" style={{ borderColor: "var(--accent)" }}>
              <h3><span className="check">✓</span> Pick MCPBolt if…</h3>
              <p>
                You use two or more AI coding tools and want them in sync. You want a health readout without digging through terminal output. You install new MCP servers regularly and don&apos;t want to re-do the config work per tool every time.
              </p>
            </div>
            <div className="sec-card">
              <h3>Pick an app&apos;s built-in UI if…</h3>
              <p>
                You work exclusively in one editor (e.g. Cursor) and rarely add new servers. The built-in UI covers one tool well and is the lowest-friction option when you don&apos;t need cross-tool sync.
              </p>
            </div>
            <div className="sec-card">
              <h3>Pick Smithery if…</h3>
              <p>
                You primarily want a hosted registry to discover and install community-published MCP servers, and you&apos;re comfortable creating an account. Smithery focuses on the discovery layer; MCPBolt focuses on the config management layer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: "64px 0 80px" }}>
        <div className="container" style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 680 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Feature</th>
                {cols.map((c) => (
                  <th key={c.key} style={{
                    textAlign: "center",
                    color: c.highlight ? "var(--accent)" : undefined,
                    background: c.highlight ? "rgba(255,211,77,0.06)" : undefined,
                  }}>
                    {c.label}
                    {c.highlight && (
                      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", opacity: 0.7, marginTop: 2 }}>YOU ARE HERE</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  {cols.map((c) => (
                    <td key={c.key} style={{
                      textAlign: "center",
                      background: c.highlight ? "rgba(255,211,77,0.03)" : undefined,
                    }}>
                      <CellValue v={row.values[c.key] as RowValue} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{ display: "flex", gap: 24, marginTop: 20, fontSize: "var(--fs-xs)", color: "var(--fg-faint)", flexWrap: "wrap" }}>
            <span><span className="check-yes">✓</span> Full support</span>
            <span><span style={{ color: "var(--warn)", fontWeight: 700 }}>~</span> Partial support</span>
            <span><span className="check-no">✗</span> Not supported</span>
            <span><span style={{ color: "var(--fg-faint)" }}>—</span> Not applicable</span>
          </div>
          <p style={{ marginTop: 16, fontSize: "var(--fs-xs)", color: "var(--fg-faint)", maxWidth: 600 }}>
            Smithery and mcp-installer details based on their public documentation as of April 2026. Built-in UI coverage varies by app version. Corrections welcome via{" "}
            <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>GitHub Issues</a>.
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>Try MCPBolt</h2>
          <p>Free, local-only, open source. No account required.</p>
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
