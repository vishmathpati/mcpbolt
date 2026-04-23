import { CopyButton } from "./CopyButton";

const BREW_CMD = "brew install --cask vishmathpati/mcpbolt/mcpboltbar";
const GITHUB_URL = "https://github.com/vishmathpati/mcpbolt";
const DOWNLOAD_URL = `${GITHUB_URL}/releases/latest`;

const features = [
  {
    icon: "⚡",
    title: "One‑click install",
    body: "Add a server to Claude, Cursor, VS Code, Windsurf, Zed, Codex, and more in a single action. No JSON editing.",
  },
  {
    icon: "🟢",
    title: "Enable / disable toggle",
    body: "Flip any server on or off per app without deleting it. Green = running, red = paused. Config is preserved and restored instantly.",
  },
  {
    icon: "🚦",
    title: "Always‑on health status",
    body: "Green, amber, red. Auto‑refreshes every minute. See which servers are reachable or broken — always, not just on demand.",
  },
  {
    icon: "🔁",
    title: "Sync across apps",
    body: "Copy a server to every other tool in one action. MCPBolt handles the per‑app config shape for you.",
  },
  {
    icon: "✏️",
    title: "Edit in place",
    body: "Change command, args, and env with a real form. No terminal, no backslash escaping.",
  },
  {
    icon: "🗑️",
    title: "Remove from everywhere",
    body: "Uninstall a server from every tool at once, or just one. You're always in control.",
  },
  {
    icon: "📋",
    title: "Smart paste & import",
    body: "Paste JSON configs, CLI commands like `claude mcp add`, or detect wizard installers — MCPBolt tells you exactly what to do with each.",
  },
  {
    icon: "📊",
    title: "Coverage matrix",
    body: "See every server side‑by‑side across all tools. Hide columns you don't care about. Gaps in coverage are obvious at a glance.",
  },
  {
    icon: "🗂️",
    title: "Projects tab",
    body: "Manage per‑repo MCP configs. Add a folder, switch between global and project‑scoped servers in one place.",
  },
  {
    icon: "🔍",
    title: "Auto‑discovery",
    body: "MCPBolt scans your Mac for Claude Code and Codex CLI projects automatically — no manual setup needed.",
  },
  {
    icon: "🔄",
    title: "Restart host apps",
    body: "After a config change MCPBolt can relaunch Claude, Cursor, or VS Code so changes take effect immediately.",
  },
  {
    icon: "↩️",
    title: "Undo last change",
    body: "Every write makes a timestamped backup. One click restores the previous state.",
  },
  {
    icon: "🖥️",
    title: "Full‑screen dashboard",
    body: "Expand beyond the menu bar popover into a resizable window with sidebar navigation.",
  },
  {
    icon: "🚀",
    title: "Launch at login",
    body: "Optional. Starts in the menu bar and stays out of your way.",
  },
];

const compat = [
  { name: "Claude Desktop", dot: "#d97757" },
  { name: "Claude Code",    dot: "#d97757" },
  { name: "Cursor",         dot: "#7c5cbf" },
  { name: "Codex CLI",      dot: "#10a37f" },
  { name: "VS Code",        dot: "#1e88e5" },
  { name: "Windsurf",       dot: "#009688" },
  { name: "Zed",            dot: "#084ccf" },
  { name: "Gemini",         dot: "#4285f4" },
  { name: "opencode",       dot: "#e8941e" },
  { name: "Roo",            dot: "#e91e63" },
];

const security = [
  {
    title: "Atomic writes",
    body: "Config files are written atomically. If the disk dies mid‑write, the old file is still intact.",
  },
  {
    title: "Timestamped backups",
    body: "Every edit keeps the last three backups per file. Older .bak files rotate out automatically.",
  },
  {
    title: "Local‑only",
    body: "MCPBolt never phones home. No telemetry, no account, no cloud. It edits files on your disk and nothing else.",
  },
  {
    title: "Open source",
    body: "MIT licensed. Read the code, build it yourself, fork it. Trust by inspection.",
  },
];

// Mock server rows shown in the hero screenshot
const mockServers = [
  { name: "context7",  health: "#22c55e", on: true  },
  { name: "posthog",   health: "#f97316", on: true  },
  { name: "supabase",  health: "#22c55e", on: true  },
  { name: "magic",     health: "rgba(255,255,255,0.18)", on: false },
];

export default function Page() {
  return (
    <>
      {/* Nav */}
      <nav className="nav">
        <div className="container nav-inner">
          <a href="#top" className="logo">
            <span className="logo-mark"><span className="logo-bolt">⚡</span></span>
            <span>MCPBolt</span>
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#compat">Works with</a>
            <a href="#security">Security</a>
            <a href={GITHUB_URL} className="nav-cta" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="top" className="hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>v0.5.14 — Toggles, live health &amp; Gemini</span>
        </div>
        <h1>
          One‑click MCP servers<br />
          <span className="accent">for every app</span>
        </h1>
        <p className="sub">
          A tiny menu bar app that installs, syncs, and manages Model Context Protocol servers
          across Claude Desktop, Cursor, VS Code, Windsurf, Zed, Codex, Gemini, and more.
          Local. Free. Open source.
        </p>
        <div className="cta-row">
          <a href={DOWNLOAD_URL} className="btn btn-primary" target="_blank" rel="noreferrer">
            Download for macOS
          </a>
          <a href={GITHUB_URL} className="btn" target="_blank" rel="noreferrer">
            View source ↗
          </a>
        </div>
        <div className="meta-line">
          macOS 14+ · Apple Silicon and Intel · <a href={GITHUB_URL}>MIT licensed</a>
        </div>
      </header>

      {/* Brew */}
      <div className="brew">
        <div className="brew-panel">
          <div className="brew-code mono">
            <span className="prompt">$</span>
            {BREW_CMD}
          </div>
          <CopyButton text={BREW_CMD} />
        </div>
      </div>

      {/* Screenshot (simulated dashboard) */}
      <div className="shot-wrap container">
        <div className="shot-card" style={{ maxWidth: 520 }}>

          {/* Window header */}
          <div className="shot-header">
            <div className="bolt-round">⚡</div>
            <div className="shot-title">mcpbolt</div>
            <div style={{ flex: 1 }} />
            <div className="pill">32 servers</div>
            <div className="pill">9 apps</div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {["By App", "Coverage", "Projects", "Settings"].map((t, i) => (
              <div key={t} style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: i === 0 ? "linear-gradient(135deg,#f4c01e,#e8a000)" : "rgba(255,255,255,0.07)",
                color: i === 0 ? "#111" : "rgba(255,255,255,0.45)"
              }}>{t}</div>
            ))}
          </div>

          {/* Tool card — Claude Desktop expanded */}
          <div style={{ padding: "10px 12px 6px" }}>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(217,119,87,0.28)",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "#d97757",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#fff",
                }}>✦</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Claude Desktop</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>4 servers installed</div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#d97757",
                  padding: "2px 8px", borderRadius: 20,
                  background: "rgba(217,119,87,0.14)",
                }}>4</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>⌄</div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginLeft: 58 }} />

              {/* Server rows */}
              {mockServers.map((s, i) => (
                <div key={s.name} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 58px",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  {/* Toggle pill */}
                  <div style={{
                    width: 28, height: 16, borderRadius: 8,
                    background: s.on ? "#22c55e" : "#ef4444",
                    display: "flex", alignItems: "center",
                    justifyContent: s.on ? "flex-end" : "flex-start",
                    padding: "0 2px", flexShrink: 0,
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
                  </div>
                  {/* Health dot */}
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.health, flexShrink: 0 }} />
                  {/* Name */}
                  <div style={{
                    fontSize: 12, fontWeight: 500,
                    color: s.on ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)",
                    textDecoration: s.on ? "none" : "line-through",
                    flex: 1,
                  }}>{s.name}</div>
                  {/* Local chip */}
                  <div style={{
                    fontSize: 10, fontWeight: 600,
                    padding: "1px 7px", borderRadius: 5,
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.4)",
                  }}>Local</div>
                </div>
              ))}
            </div>
          </div>

          {/* Health legend */}
          <div style={{
            display: "flex", gap: 14, alignItems: "center",
            padding: "7px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            {([
              ["#22c55e", "Reachable"],
              ["#f97316", "Degraded"],
              ["#ef4444", "Unreachable"],
              ["rgba(255,255,255,0.18)", "Not checked"],
            ] as [string, string][]).map(([color, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="block">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Features</div>
            <h2>Everything you'd want, nothing you wouldn't</h2>
            <p>MCPBolt does one job. It writes the right JSON to the right file, every time, across every app.</p>
          </div>
          <div className="feature-grid">
            {features.map((f) => (
              <div key={f.title} className="feature">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compat */}
      <section id="compat" className="block">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Works with</div>
            <h2>Every major MCP client</h2>
            <p>Native apps, editor extensions, CLIs. Config shape translation is handled automatically.</p>
          </div>
          <div className="compat-row">
            {compat.map((c) => (
              <div key={c.name} className="compat-chip">
                <span className="compat-dot" style={{ background: c.dot }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="block">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Security</div>
            <h2>Your config is yours</h2>
            <p>MCPBolt runs entirely on your machine. No server, no account, no data leaves your disk.</p>
          </div>
          <div className="security-grid">
            {security.map((s) => (
              <div key={s.title} className="sec-card">
                <h3><span className="check">✓</span> {s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="foot-links">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
            <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">Issues</a>
            <a href={`${GITHUB_URL}/releases`} target="_blank" rel="noreferrer">Releases</a>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">License</a>
          </div>
          <div>Built by <a href={GITHUB_URL}>@vishmathpati</a> · MIT licensed · macOS 14+</div>
        </div>
      </footer>
    </>
  );
}
