import { GITHUB_URL, VERSION } from "../lib/site";

export const metadata = {
  title: "Changelog",
  description:
    "Release history for MCPBolt. Every change is open source and lands on GitHub.",
};

const releases = [
  {
    version: "v0.5.16",
    date: "April 2026",
    title: "Stability and coverage polish",
    items: {
      Added: [
        "Continue support via YAML config at ~/.continue/config.yaml",
        "Coverage matrix now shows column-hide controls that persist between sessions",
      ],
      Changed: [
        "Health polling interval tunable in Settings (30 s / 1 min / 5 min)",
        "Improved error messages when a server command is not found on PATH",
      ],
      Fixed: [
        "Zed config write no longer clobbers other top-level settings.json keys",
        "Menu bar icon now updates reliably when all servers go healthy",
      ],
    },
  },
  {
    version: "v0.5.15",
    date: "April 2026",
    title: "Gemini CLI + opencode support",
    items: {
      Added: [
        "Gemini CLI support — reads and writes ~/.gemini/settings.json and .gemini/settings.json",
        "opencode support — project-scoped configs auto-discovered",
        "Roo Code support — reads .roo/mcp.json per project",
      ],
      Changed: [
        "Import flow now accepts bare HTTPS URLs as remote HTTP/SSE targets",
        "Coverage picker uses color-coded dots matching each tool's brand color",
      ],
      Fixed: [
        "Default selection no longer pre-checks tools that aren't installed",
        "Scope picker is now more prominent in the install flow",
      ],
    },
  },
  {
    version: "v0.5.14",
    date: "March 2026",
    title: "Toggles, live health, and the coverage picker",
    items: {
      Added: [
        "Enable/disable toggle per server per app — pauses without deleting config",
        "Always-on health status — green/amber/red polling every 60 seconds",
        "Health legend in the menu bar popover footer",
        "Coverage picker on the Coverage tab to hide/show tool columns",
      ],
      Changed: [
        "Dashboard sheets redesigned — actions are grouped by server, not scattered",
        "Real app logos throughout the UI instead of placeholder initials",
      ],
      Fixed: [
        "Full-row click now works on sidebar and project rows (contentShape fix)",
      ],
    },
  },
  {
    version: "v0.5.13",
    date: "March 2026",
    title: "Codex CLI project history",
    items: {
      Added: [
        "Auto-discovers Codex CLI projects from ~/.codex/config.toml and Codex's project history",
        "Multi-source project discovery — a project that appears in both Claude Code and Codex shows up once, with both contexts",
      ],
      Changed: [
        "Projects tab sidebar grouping updated to handle multi-tool project entries cleanly",
      ],
      Fixed: [
        "Projects tab no longer shows duplicate entries when the same folder is registered in multiple sources",
      ],
    },
  },
  {
    version: "v0.5.12",
    date: "February 2026",
    title: "Tab UI and dock icon",
    items: {
      Added: [
        "Tab bar: By App, Coverage, Projects, Settings — replaces the previous segmented control",
        "Dock icon shown when the full-screen dashboard window is open",
        "Relaunch-on-update now supported via Sparkle without user intervention",
      ],
      Changed: [
        "Settings tab moved to its own tab instead of being inside the By App view",
      ],
      Fixed: [
        "App relaunch after install was skipping the restart hint for VS Code",
      ],
    },
  },
  {
    version: "v0.5.11",
    date: "February 2026",
    title: "Codex CLI support",
    items: {
      Added: [
        "Codex CLI (global) support — reads and writes ~/.codex/config.toml",
        "Codex CLI (project) support — reads and writes .codex/config.toml",
        "TOML merger in core — merges server entry without touching other TOML keys",
        "Codex Settings tab with 10 feature cards for ~/.codex/config.toml options",
      ],
      Changed: [
        "Format auto-detection now recognises TOML input pasted directly into the import field",
      ],
      Fixed: [
        "TOML write was incorrectly double-quoting string values on some locales",
      ],
    },
  },
  {
    version: "v0.5.10",
    date: "January 2026",
    title: "Wizard command detection",
    items: {
      Added: [
        "Import now detects interactive wizard installer commands and shows a helpful error with instructions",
        "Import accepts docker run commands and converts them to the correct stdio shape",
      ],
      Changed: [
        "Import error messages rewritten to be more specific about why a format wasn't recognised",
      ],
      Fixed: [
        "Paste field no longer strips trailing newlines, fixing some multi-line YAML inputs",
      ],
    },
  },
  {
    version: "v0.5.9",
    date: "January 2026",
    title: "Toggle on/off and always-on health",
    items: {
      Added: [
        "Server-level toggle — flip a server off per app without removing it",
        "Real app icons throughout the menu bar UI",
        "Health status polling prototype (shipped as always-on in v0.5.14)",
        "Health legend at the bottom of the popover",
      ],
      Fixed: [
        "Dashboard sheets now close reliably on dismiss",
        "Toggle state was not persisted across MCPBolt restarts",
      ],
    },
  },
  {
    version: "v0.5.8",
    date: "December 2025",
    title: "Projects tab, auto-discovery, coverage matrix",
    items: {
      Added: [
        "Projects tab — manage per-repo MCP configs from the menu bar",
        "Auto-discovery of Claude Code projects via ~/.claude.json",
        "Coverage matrix — dot-grid showing which servers are installed in which tools",
        "Full-screen dashboard window with sidebar navigation",
      ],
      Changed: [
        "By App view now uses expandable cards rather than a flat list",
      ],
      Fixed: [
        "Coverage matrix dot alignment on small popover widths",
      ],
    },
  },
];

export default function ChangelogPage() {
  return (
    <>
      {/* Hero */}
      <header className="page-hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>Latest: {VERSION}</span>
        </div>
        <h1>
          Changelog
        </h1>
        <p className="sub">
          MCPBolt is open source. Every change lands in public on GitHub.{" "}
          <a href={`${GITHUB_URL}/releases`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            View GitHub Releases ↗
          </a>
        </p>
      </header>

      {/* Entries */}
      <div className="container" style={{ maxWidth: 780, padding: "48px 24px 80px" }}>
        {releases.map((r) => (
          <div key={r.version} className="changelog-entry">
            <div className="changelog-header">
              <span className="changelog-version">{r.version}</span>
              <span className="changelog-date">{r.date}</span>
              <span className="changelog-title">{r.title}</span>
            </div>
            <div className="changelog-body">
              {(["Added", "Changed", "Fixed"] as const).map((group) => {
                const items = r.items[group];
                if (!items || items.length === 0) return null;
                return (
                  <div key={group} style={{ marginTop: 12 }}>
                    <div style={{
                      fontSize: "var(--fs-xs)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: group === "Added" ? "var(--ok)" : group === "Fixed" ? "var(--accent)" : "var(--fg-faint)",
                      marginBottom: 6,
                    }}>
                      {group}
                    </div>
                    <ul>
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Older releases note */}
        <div style={{ paddingTop: 32, color: "var(--fg-faint)", fontSize: "var(--fs-sm)" }}>
          Releases before v0.5.8 are available on{" "}
          <a href={`${GITHUB_URL}/releases`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            GitHub Releases
          </a>.
        </div>
      </div>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>Always up to date</h2>
          <p>Star the repo to follow releases. The menu bar app updates itself via Homebrew.</p>
          <div className="cta-row">
            <a href={`${GITHUB_URL}/releases`} className="btn btn-primary" target="_blank" rel="noreferrer">
              See all releases ↗
            </a>
            <a href={GITHUB_URL} className="btn" target="_blank" rel="noreferrer">
              Star on GitHub ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
