import { CopyButton } from "./CopyButton";
import { BREW_CMD, GITHUB_URL, DOWNLOAD_URL, VERSION } from "./lib/site";

const features = [
  {
    icon: "⚡",
    title: "One‑click install",
    body: "Add any MCP server to Claude, Cursor, VS Code, Windsurf, Zed, Codex CLI, and more in a single action. No JSON editing required.",
  },
  {
    icon: "🟢",
    title: "Enable / disable toggle",
    body: "Turn any server on or off per app without removing it. Green means enabled, red means disabled. Your config is preserved and restored instantly.",
  },
  {
    icon: "🚦",
    title: "Always‑on health status",
    body: "Green, amber, or red — auto‑refreshed every minute. See which servers are reachable or broken at a glance, always, not just on demand.",
  },
  {
    icon: "🔁",
    title: "Sync across apps",
    body: "Copy a server to every other tool in one action. MCPBolt handles each app's unique config format automatically.",
  },
  {
    icon: "✏️",
    title: "Edit in place",
    body: "Update a server's command, args, and environment variables through a real form — no terminal, no backslash escaping.",
  },
  {
    icon: "🗑️",
    title: "Remove from everywhere",
    body: "Remove a server from every tool at once, or from just one. You're always in control.",
  },
  {
    icon: "📋",
    title: "Smart paste",
    body: "Paste a JSON config, a CLI command like `claude mcp add`, or a bare URL — MCPBolt auto‑detects the format and writes it to the right place.",
  },
  {
    icon: "📊",
    title: "Coverage matrix",
    body: "See every server side‑by‑side across all your tools. Hide columns you don't need. Coverage gaps are obvious at a glance.",
  },
  {
    icon: "🗂️",
    title: "Projects tab",
    body: "Manage per‑repo MCP configs from one place. Switch between global and project‑scoped servers without touching any files manually.",
  },
  {
    icon: "🔍",
    title: "Auto‑discovery",
    body: "MCPBolt scans your Mac for Claude Code and Codex CLI projects automatically — no manual setup needed.",
  },
  {
    icon: "🔄",
    title: "Restart host apps",
    body: "After a config change, MCPBolt can relaunch Claude, Cursor, or VS Code so changes take effect immediately.",
  },
  {
    icon: "↩️",
    title: "Undo last change",
    body: "Every write creates a timestamped backup. One click restores the previous state.",
  },
  {
    icon: "🖥️",
    title: "Full‑screen dashboard",
    body: "Expand beyond the menu bar into a resizable full‑screen window with sidebar navigation.",
  },
  {
    icon: "🚀",
    title: "Launch at login",
    body: "Starts quietly in the menu bar and stays out of your way until you need it.",
  },
];

const compat: { name: string; icon: string }[] = [
  { name: "Claude Desktop", icon: "/icons/claude.png" },
  { name: "Claude Code",    icon: "/icons/claude.png" },
  { name: "Cursor",         icon: "/icons/cursor.png" },
  { name: "Codex CLI",      icon: "/icons/openai.png" },
  { name: "VS Code",        icon: "/icons/vscode.png" },
  { name: "Windsurf",       icon: "/icons/windsurf.png" },
  { name: "Zed",            icon: "/icons/zed.png" },
  { name: "Gemini CLI",     icon: "/icons/gemini.svg" },
  { name: "opencode",       icon: "/icons/opencode.png" },
  { name: "Roo",            icon: "/icons/roo.png" },
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
  { name: "context7",  health: "#22c55e", on: true,  scope: "global" },
  { name: "posthog",   health: "#f97316", on: true,  scope: "global" },
  { name: "supabase",  health: "#22c55e", on: true,  scope: "global" },
  { name: "magic",     health: "rgba(255,255,255,0.18)", on: false, scope: "global" },
];

const projectServers = [
  { name: "supabase",  on: true,  health: "#22c55e" },
  { name: "context7",  on: true,  health: "#22c55e" },
  { name: "posthog",   on: false, health: "rgba(255,255,255,0.18)" },
];

function ServerToggle({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 28, height: 16, borderRadius: 8,
      background: on ? "#22c55e" : "rgba(255,255,255,0.15)",
      display: "flex", alignItems: "center",
      justifyContent: on ? "flex-end" : "flex-start",
      padding: "0 2px", flexShrink: 0,
    }}>
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
    </div>
  );
}

export default function Page() {
  return (
    <>
      {/* Hero */}
      <header id="top" className="hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>{VERSION} — Toggles, live health &amp; Gemini CLI</span>
        </div>
        <h1>
          One‑click MCP servers<br />
          <span className="accent">for every app</span>
        </h1>
        <p className="sub">
          A tiny Mac menu bar app that installs, syncs, and manages Model Context Protocol servers
          across Claude Desktop, Cursor, VS Code, Windsurf, Zed, Codex CLI, Gemini CLI, and more.
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

      {/* App mock — By App tab */}
      <div className="shot-wrap container">
        <div className="shot-card" style={{ maxWidth: 540 }}>
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

          {/* Claude Desktop card */}
          <div style={{ padding: "10px 12px 6px" }}>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(217,119,87,0.28)",
              borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: "#d97757",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#fff",
                }}>✦</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Claude Desktop</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>4 servers · 3 enabled</div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6 }}>Sync to all ↗</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>⌄</div>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginLeft: 58 }} />
              {mockServers.map((s, i) => (
                <div key={s.name} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 58px",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <ServerToggle on={s.on} />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.health, flexShrink: 0 }} />
                  <div style={{
                    fontSize: 12, fontWeight: 500, flex: 1,
                    color: s.on ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.3)",
                    textDecoration: s.on ? "none" : "line-through",
                  }}>{s.name}</div>
                  <div style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>global</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>✎</div>
                </div>
              ))}
            </div>
          </div>

          {/* Paste bar */}
          <div style={{
            margin: "6px 12px 8px",
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 12px",
            background: "rgba(244,192,30,0.07)",
            border: "1px solid rgba(244,192,30,0.18)",
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 11, color: "rgba(244,192,30,0.7)" }}>📋</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", flex: 1 }}>Paste a config, npx command, or URL…</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", background: "rgba(244,192,30,0.15)", color: "#f4c01e", borderRadius: 5 }}>Import</span>
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

      {/* Problem / Solution */}
      <section id="problem" className="block">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">The problem</div>
            <h2>You added one server.<br />Now it runs everywhere.</h2>
            <p>
              MCP servers are installed globally by default. Every project you open loads every
              server — eating context tokens and burning through your subscription limit, whether
              you need those servers or not.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 40 }}>
            {/* Problem side */}
            <div style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 16, padding: "28px 28px 24px",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 20, letterSpacing: "0.08em", textTransform: "uppercase" }}>Without MCPBolt</div>
              {[
                ["Every MCP server you install runs globally — loaded on every project, every session, burning context tokens you're paying for.", "#ef4444"],
                ["No visibility into which servers are active in which tools without hunting through JSON config files.", "#f97316"],
                ["Turning a server off means editing config files by hand. Turning it back on is just as painful.", "#f97316"],
              ].map(([text, color], i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 16 : 0 }}>
                  <span style={{ color, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✗</span>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Solution side */}
            <div style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 16, padding: "28px 28px 24px",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginBottom: 20, letterSpacing: "0.08em", textTransform: "uppercase" }}>With MCPBolt</div>
              {[
                "Add a project folder — only servers assigned to that project run when you're in it. Global servers stay off by default.",
                "Toggle any server on or off per app with one click, any time, without losing your configuration.",
                "Coverage matrix shows every server across every tool and project at a glance — no config files, no guessing.",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 16 : 0 }}>
                  <span style={{ color: "#22c55e", fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects deep-dive */}
      <section id="projects" className="block">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>

            {/* Left: text */}
            <div>
              <div className="section-kicker" style={{ textAlign: "left" }}>Projects tab</div>
              <h2 style={{ textAlign: "left" }}>Global and per‑project,<br />fully in your control</h2>
              <p style={{ textAlign: "left", color: "var(--fg-dim)", lineHeight: 1.7 }}>
                Drop any project folder into MCPBolt. Assign only the servers that project needs.
                Those servers activate when you open the project — and only then. Your global servers
                are grouped separately and can be toggled off per app independently.
              </p>
              <ul style={{ margin: "24px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["📁", "Drop a folder — MCPBolt auto‑detects Claude Code and Codex CLI projects"],
                  ["🔒", "Project servers are scoped to .mcp.json or .cursor/mcp.json — never global"],
                  ["⚡", "Global servers are grouped separately; disable them per app in one click"],
                  ["🔄", "Sync any server from project scope to global, or the other way around"],
                ].map(([icon, text]) => (
                  <li key={text as string} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Projects tab mock */}
            <div className="shot-card" style={{ maxWidth: "100%" }}>
              <div className="shot-header">
                <div className="bolt-round">⚡</div>
                <div className="shot-title">mcpbolt</div>
                <div style={{ flex: 1 }} />
                <div className="pill">Projects</div>
              </div>

              {/* Tab bar — Projects active */}
              <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["By App", "Coverage", "Projects", "Settings"].map((t, i) => (
                  <div key={t} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: i === 2 ? "linear-gradient(135deg,#f4c01e,#e8a000)" : "rgba(255,255,255,0.07)",
                    color: i === 2 ? "#111" : "rgba(255,255,255,0.45)"
                  }}>{t}</div>
                ))}
              </div>

              {/* Global group */}
              <div style={{ padding: "10px 12px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Global</div>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, overflow: "hidden", marginBottom: 10,
                }}>
                  {[
                    { name: "context7", on: true, health: "#22c55e" },
                    { name: "posthog", on: false, health: "rgba(255,255,255,0.18)" },
                  ].map((s, i) => (
                    <div key={s.name} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
                      borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <ServerToggle on={s.on} />
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.health }} />
                      <div style={{ fontSize: 12, fontWeight: 500, flex: 1, color: s.on ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", textDecoration: s.on ? "none" : "line-through" }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>all apps</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project group */}
              <div style={{ padding: "0 12px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>~/projects/snapfinder</div>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(34,197,94,0.18)",
                  borderRadius: 10, overflow: "hidden",
                }}>
                  {projectServers.map((s, i) => (
                    <div key={s.name} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
                      borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <ServerToggle on={s.on} />
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.health }} />
                      <div style={{ fontSize: 12, fontWeight: 500, flex: 1, color: s.on ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", textDecoration: s.on ? "none" : "line-through" }}>{s.name}</div>
                      <div style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(34,197,94,0.1)", color: "rgba(34,197,94,0.7)" }}>.mcp.json</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>+ Add project folder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Import flow */}
      <section id="import" className="block">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">How it works</div>
            <h2>Paste once. Wire everywhere.</h2>
            <p>
              MCPBolt reads whatever format a server ships in and translates it into the right
              config for every app you use — no JSON editing, no terminal.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 40 }}>
            {[
              {
                step: "1",
                title: "Paste any config",
                body: "Paste a JSON snippet, an npx command, a Docker run line, or a bare URL. MCPBolt detects the format automatically.",
                preview: (
                  <div style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, padding: "10px 12px", fontFamily: "monospace", fontSize: 11,
                    color: "rgba(255,255,255,0.55)", lineHeight: 1.6,
                  }}>
                    <span style={{ color: "rgba(244,192,30,0.7)" }}>{`{`}</span>{"\n"}
                    {"  "}<span style={{ color: "#7dd3fc" }}>"mcpServers"</span>{`: `}{"\n"}
                    {"    "}<span style={{ color: "#86efac" }}>"supabase"</span>{`: …`}{"\n"}
                    <span style={{ color: "rgba(244,192,30,0.7)" }}>{`}`}</span>
                  </div>
                ),
              },
              {
                step: "2",
                title: "Pick your targets",
                body: "Select which apps and scopes to write to. MCPBolt shows only the tools it detects on your Mac.",
                preview: (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { name: "Claude Desktop", checked: true, color: "#d97757" },
                      { name: "Cursor (global)", checked: true, color: "#7c5cbf" },
                      { name: "VS Code (project)", checked: false, color: "#1e88e5" },
                    ].map((t) => (
                      <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                          background: t.checked ? "rgba(244,192,30,0.2)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${t.checked ? "rgba(244,192,30,0.5)" : "rgba(255,255,255,0.12)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {t.checked && <span style={{ color: "#f4c01e", fontSize: 9, lineHeight: 1 }}>✓</span>}
                        </div>
                        <span style={{ color: t.checked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}>{t.name}</span>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, marginLeft: "auto" }} />
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                step: "3",
                title: "Done — servers wired",
                body: "MCPBolt writes the correct JSON or TOML to every target, makes backups, and tells you which apps need a restart.",
                preview: (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
                    <div style={{ color: "#22c55e" }}>✓ Claude Desktop — written</div>
                    <div style={{ color: "#22c55e" }}>✓ Cursor (global) — written</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                      → Quit and reopen Claude Desktop<br />
                      → Cursor: Settings → MCP → Refresh
                    </div>
                  </div>
                ),
              },
            ].map((step) => (
              <div key={step.step} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "24px 20px",
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#f4c01e,#e8a000)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "#111",
                }}>{step.step}</div>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>{step.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{step.body}</p>
                </div>
                <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {step.preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="block">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Features</div>
            <h2>Everything you'd want, nothing you wouldn't</h2>
            <p>MCPBolt does one job. It writes the right config to the right file, every time, across every app.</p>
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
            <p>Native apps, editor extensions, and CLIs. MCPBolt translates each app's config format automatically — nothing to configure.</p>
          </div>
          <div className="compat-row">
            {compat.map((c) => (
              <div key={c.name} className="compat-chip">
                <span className="compat-logo">
                  <img src={c.icon} width={28} height={28} alt={c.name} style={{ display: "block", borderRadius: 6, objectFit: "contain" }} />
                </span>
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

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>Start in 30 seconds</h2>
          <p>Download the menu bar app or run the CLI. Free. No account. No credit card.</p>
          <div className="cta-row">
            <a href={DOWNLOAD_URL} className="btn btn-primary" target="_blank" rel="noreferrer">
              Download for macOS
            </a>
            <a href={GITHUB_URL} className="btn" target="_blank" rel="noreferrer">
              View source ↗
            </a>
          </div>
          <div className="meta-line" style={{ marginTop: 16 }}>
            macOS 14+ · Apple Silicon and Intel · MIT licensed
          </div>
        </div>
      </section>

    </>
  );
}
