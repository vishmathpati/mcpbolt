import { GITHUB_URL, DOWNLOAD_URL } from "../lib/site";

export const metadata = {
  title: "Features",
  description:
    "A detailed look at every feature in MCPBolt — one-click installs, sync, health checks, coverage matrix, undo, and more. Free and open source.",
};

const compat = [
  { name: "Claude Desktop", dot: "#d97757" },
  { name: "Claude Code",    dot: "#d97757" },
  { name: "Cursor",         dot: "#7c5cbf" },
  { name: "Codex CLI",      dot: "#10a37f" },
  { name: "VS Code",        dot: "#1e88e5" },
  { name: "Windsurf",       dot: "#009688" },
  { name: "Zed",            dot: "#084ccf" },
  { name: "Gemini CLI",     dot: "#4285f4" },
  { name: "opencode",       dot: "#e8941e" },
  { name: "Roo",            dot: "#e91e63" },
];

const navItems = [
  { id: "one-click",    label: "One-click install" },
  { id: "toggle",       label: "Toggle" },
  { id: "health",       label: "Health status" },
  { id: "sync",         label: "Sync across apps" },
  { id: "edit",         label: "Edit in place" },
  { id: "remove",       label: "Remove everywhere" },
  { id: "smart-paste",  label: "Smart paste" },
  { id: "coverage",     label: "Coverage matrix" },
  { id: "projects",     label: "Projects tab" },
  { id: "discovery",    label: "Auto-discovery" },
  { id: "restart",      label: "Restart host apps" },
  { id: "undo",         label: "Undo" },
  { id: "dashboard",    label: "Dashboard" },
  { id: "launch",       label: "Launch at login" },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <header className="page-hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>All 14 features — free and open source</span>
        </div>
        <h1>
          What MCPBolt <span className="accent">actually does</span>
        </h1>
        <p className="sub">
          The home page has the short version. This page goes deep on every feature — what it solves, how it works, and where to read the docs.
        </p>
      </header>

      {/* Works with */}
      <section style={{ padding: "40px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: 24 }}>
            <div className="section-kicker">Works with</div>
            <h2>Every major MCP client</h2>
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

      {/* In-page subnav */}
      <div className="container">
        <nav className="page-subnav">
          {navItems.map((n) => (
            <a key={n.id} href={`#${n.id}`}>{n.label}</a>
          ))}
        </nav>
      </div>

      {/* ── Feature sections ── */}

      {/* 1. One-click install */}
      <section id="one-click" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            One-click install across tools
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            Paste a server config once and MCPBolt writes the correct format into every AI coding tool you select. Claude Desktop expects <code style={{ background: "rgba(255,211,77,0.08)", color: "#ffe38a", padding: "1px 6px", borderRadius: 5, fontSize: "0.88em", border: "1px solid rgba(255,211,77,0.15)" }}>mcpServers</code>, VS Code wants a <code style={{ background: "rgba(255,211,77,0.08)", color: "#ffe38a", padding: "1px 6px", borderRadius: 5, fontSize: "0.88em", border: "1px solid rgba(255,211,77,0.15)" }}>type</code> field, Codex uses TOML, Continue uses YAML, Zed uses a nested key inside its main settings file. MCPBolt knows all of this and handles the translation automatically. You pick the targets, preview the diff, and confirm — three keystrokes for what used to take ten minutes of careful copy-paste.
          </p>
          {/* Mini mockup: target picker */}
          <div style={{
            background: "var(--bg-soft)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            maxWidth: 520,
          }}>
            <div style={{ background: "var(--graphite-grad)", padding: "10px 14px", fontSize: 12, fontWeight: 700, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>⚡</span> Install supabase
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Claude Desktop", "Claude Code (global)", "Cursor (global)", "VS Code (project)"].map((t, i) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: "var(--accent)", flexShrink: 0, display: "grid", placeItems: "center" }}>
                    <span style={{ fontSize: 9, color: "#111", fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/install" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 2. Toggle */}
      <section id="toggle" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🟢</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Enable / disable toggle per app
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            Toggling a server off in MCPBolt removes it from the tool&apos;s active config but keeps the full definition in a local backup, so you can turn it back on instantly without re-pasting. This is useful for servers you use only occasionally — a database inspector you enable for a sprint, or a browser-control server you only want active when testing. The toggle is per-app: you can have supabase active in Claude but paused in Cursor. Green means the server is currently configured and enabled; red means it&apos;s paused but saved.
          </p>
          {/* Toggle mockup */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { name: "context7",  on: true,  health: "#22c55e" },
              { name: "supabase",  on: true,  health: "#22c55e" },
              { name: "playwright", on: false, health: "rgba(255,255,255,0.18)" },
            ].map((s) => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10, minWidth: 200,
              }}>
                <div style={{
                  width: 32, height: 18, borderRadius: 9,
                  background: s.on ? "#22c55e" : "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center",
                  justifyContent: s.on ? "flex-end" : "flex-start",
                  padding: "0 3px", flexShrink: 0,
                }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.health, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: s.on ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)", textDecoration: s.on ? "none" : "line-through" }}>{s.name}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/toggle" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 3. Health status */}
      <section id="health" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🚦</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Always-on health status
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            MCPBolt polls every installed server every minute and shows a live health dot: green for reachable, amber for degraded (slow or returning errors), red for unreachable. For local stdio servers it checks whether the command exists and can start. For remote HTTP/SSE servers it does a lightweight connectivity check. The status is visible in the menu bar popover at all times — no need to open settings or run a test command. When a server goes red, you know immediately rather than finding out mid-session when a tool call fails silently.
          </p>
          {/* Health legend mockup */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { color: "#22c55e", label: "Reachable", desc: "Server is up and responding" },
              { color: "#f97316", label: "Degraded",  desc: "Responding but slow or erroring" },
              { color: "#ef4444", label: "Unreachable", desc: "Can't connect or command missing" },
            ].map((h) => (
              <div key={h.label} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 18px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10, flex: 1, minWidth: 200,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: h.color, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{h.label}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-dim)", marginTop: 2 }}>{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/health" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 4. Sync across apps */}
      <section id="sync" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🔁</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Sync a server across apps
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            If you already have a server installed in Claude Desktop and want it in Cursor too, you don&apos;t need to re-paste the config. MCPBolt reads the canonical definition it already stored, translates it to Cursor&apos;s native format, and writes it. The same one-action sync works for any pair of tools — or all of them at once. This is the feature that most directly addresses why MCPBolt exists: every AI coding tool has its own config format, and they&apos;re not compatible. MCPBolt is the translation layer between all of them.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/sync" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 5. Edit in place */}
      <section id="edit" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>✏️</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Edit in place
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            Every installed server has an Edit button that opens a structured form: server name, command, arguments (one per line, no quoting headaches), and environment variables as key-value pairs. Changes are validated before writing and go through the same backup-then-write path as every other MCPBolt operation. This means you never have to touch a JSON file directly just to add an environment variable — a task that catches people out with incorrect escaping more often than it should.
          </p>
          {/* Edit form mockup */}
          <div style={{
            background: "var(--bg-soft)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
            maxWidth: 440,
          }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-faint)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Command</div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: "var(--fg)" }}>npx</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-faint)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Arguments</div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: "var(--fg)", lineHeight: 1.8 }}>
                -y<br />@modelcontextprotocol/server-filesystem<br />/Users/me/projects
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-faint)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Environment</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: "var(--fg)" }}>NODE_ENV</div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: "var(--fg)" }}>production</div>
              </div>
            </div>
          </div>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/edit" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 6. Remove from everywhere */}
      <section id="remove" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🗑️</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Remove from everywhere
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            When you&apos;re done with a server, the Remove action gives you a choice: remove it from a specific tool, or remove it from all tools at once. MCPBolt reads each config file, strips just the target server key, and writes back — leaving every other server and every other key in the file exactly as it was. This merge-safe approach means there&apos;s no risk of a removal wiping settings you weren&apos;t trying to touch. A timestamped backup is made before each removal, so you can undo if you change your mind.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/remove" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 7. Smart paste */}
      <section id="smart-paste" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>📋</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Smart paste and import
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            MCPBolt accepts paste in every format you&apos;re likely to encounter: JSON in Claude Desktop / VS Code / Cursor format, TOML (Codex), YAML (Continue), bare URLs, npx one-liners, Docker commands, and <code style={{ background: "rgba(255,211,77,0.08)", color: "#ffe38a", padding: "1px 6px", borderRadius: 5, fontSize: "0.88em", border: "1px solid rgba(255,211,77,0.15)" }}>claude mcp add</code> CLI commands. The parser detects the format automatically using structural heuristics rather than file extension. When it encounters a wizard installer command — the kind that asks you questions interactively — it tells you exactly what to do instead of silently failing. The goal is zero friction from "I found this server" to "it&apos;s installed everywhere."
          </p>
          {/* Format list */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {[
              "JSON (Claude / Cursor / Windsurf)",
              "JSON (VS Code servers format)",
              "TOML (Codex CLI)",
              "YAML (Continue)",
              "Remote URL (HTTP/SSE)",
              "npx one-liner",
              "docker run command",
              "claude mcp add CLI command",
            ].map((f) => (
              <div key={f} style={{
                padding: "8px 14px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--fg-dim)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ color: "var(--ok)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/import" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 8. Coverage matrix */}
      <section id="coverage" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>📊</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Coverage matrix
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            The Coverage tab shows every MCP server you have installed in a grid, with columns for each of your AI tools. A filled dot means the server is installed in that tool; an empty dot means it isn&apos;t. Gaps are obvious at a glance. From the matrix you can click any empty cell to install the server into that tool in one action. You can also hide columns for tools you don&apos;t use — the matrix remembers your column visibility preferences between sessions. If you have 20 servers and 8 tools, the coverage view makes it immediately clear which servers aren&apos;t yet available in which tools.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/coverage" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 9. Projects tab */}
      <section id="projects" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🗂️</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Projects tab
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            Most AI coding tools support both global and project-scoped MCP configs. Global configs apply everywhere; project configs live inside the repository and apply only to that project. The Projects tab in MCPBolt lets you manage project-scoped configs without leaving the menu bar. Add a project folder, and MCPBolt reads the relevant config file for that folder (e.g. <code style={{ background: "rgba(255,211,77,0.08)", color: "#ffe38a", padding: "1px 6px", borderRadius: 5, fontSize: "0.88em", border: "1px solid rgba(255,211,77,0.15)" }}>.mcp.json</code> for Claude Code or <code style={{ background: "rgba(255,211,77,0.08)", color: "#ffe38a", padding: "1px 6px", borderRadius: 5, fontSize: "0.88em", border: "1px solid rgba(255,211,77,0.15)" }}>.cursor/mcp.json</code> for Cursor). You can install, remove, and toggle servers in project scope exactly like you do at global scope, and switch between them in one click.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/projects" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 10. Auto-discovery */}
      <section id="discovery" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🔍</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Auto-discovery of Claude Code and Codex projects
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            MCPBolt scans your Mac for Claude Code and Codex CLI projects automatically. For Claude Code it reads <code style={{ background: "rgba(255,211,77,0.08)", color: "#ffe38a", padding: "1px 6px", borderRadius: 5, fontSize: "0.88em", border: "1px solid rgba(255,211,77,0.15)" }}>~/.claude.json</code> to find all known project paths. For Codex it checks <code style={{ background: "rgba(255,211,77,0.08)", color: "#ffe38a", padding: "1px 6px", borderRadius: 5, fontSize: "0.88em", border: "1px solid rgba(255,211,77,0.15)" }}>~/.codex/config.toml</code> and the Codex project history. Discovered projects show up in the Projects tab immediately with no manual configuration. For other tools like Cursor and VS Code, you can point MCPBolt at a folder and it figures out which config file to read. Auto-discovery is the reason you don&apos;t have to register each project by hand.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/discovery" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 11. Restart host apps */}
      <section id="restart" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🔄</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Restart host apps
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            Most AI coding tools don&apos;t hot-reload their MCP config. After MCPBolt writes a change, Claude Desktop needs to be quit and reopened; Cursor needs an MCP refresh; VS Code needs a Developer: Reload Window. MCPBolt offers to do this for you. After writing a config, you&apos;ll see a restart prompt for each affected tool. Accept it and MCPBolt handles the relaunch — you don&apos;t have to go find the quit shortcut in each app. This is optional; dismiss the prompt if you want to accumulate a few changes before reloading.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/restart" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 12. Undo */}
      <section id="undo" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>↩️</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Undo last change
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            Before every write, MCPBolt creates a timestamped backup of the config file it&apos;s about to modify. If something looks wrong after an edit — a server disappeared from Claude Desktop, or a config key you didn&apos;t expect is missing — one click in the Undo panel restores the previous file state. MCPBolt keeps the last three backups per file and rotates older ones out automatically so your disk doesn&apos;t fill up. The backup files are plain text sitting next to the config they came from, so you can also open them manually if you need to inspect what changed.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/undo" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 13. Full-screen dashboard */}
      <section id="dashboard" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🖥️</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Full-screen dashboard
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            The menu bar popover is the fast path for quick installs and health checks. For a full view of your MCP landscape — dozens of servers across ten tools — you can expand into a resizable window with a sidebar for tool navigation, a main content area for server management, and tabs for Coverage, Projects, and Settings. The window persists between opens, so you can leave it in your Spaces and refer back to it without hunting through the menu bar. All the same actions (install, toggle, edit, remove, restart) are available in the expanded view.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/dashboard" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* 14. Launch at login */}
      <section id="launch" style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="feature-icon" style={{ marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Launch at login
          </h2>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
            Enable this in Settings and MCPBolt registers itself with macOS to start when you log in. It appears in the menu bar and stays there, passively monitoring server health and ready for installs. It adds no dock icon and uses minimal resources when idle. Turn it off just as easily from the same Settings panel. Launch at login is opt-in and disabled by default on first install.
          </p>
          <p style={{ marginTop: 24 }}>
            <a href="/docs/launch-at-login" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: "0.9rem" }}>Read the docs &rarr;</a>
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>Download MCPBolt</h2>
          <p>Every feature listed here. Free and open source, now and in the future.</p>
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
