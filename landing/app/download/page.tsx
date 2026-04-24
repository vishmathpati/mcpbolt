import { CopyButton } from "../CopyButton";
import { GITHUB_URL, DOWNLOAD_URL, BREW_CMD, NPX_CMD, VERSION } from "../lib/site";

export const metadata = {
  title: "Download",
  description:
    "Download MCPBolt — the free, local-only MCP server manager. Mac menu bar app via Homebrew, or CLI via npm. macOS 14+, Node.js 18+.",
};

export default function DownloadPage() {
  const npmInstall = "npm install -g mcpbolt";
  const checksumsUrl = `${GITHUB_URL}/releases/tag/${VERSION}`;

  return (
    <>
      {/* Hero */}
      <header className="page-hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>Latest: {VERSION}</span>
        </div>
        <h1>
          Download <span className="accent">MCPBolt</span>
        </h1>
        <p className="sub">
          Two ways to get started: the Mac menu bar app for a persistent GUI, or the CLI for quick one-off installs from any terminal.
        </p>
      </header>

      {/* Download paths */}
      <section style={{ padding: "56px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>

            {/* Mac app */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 11,
                  background: "var(--graphite-grad)",
                  display: "grid", placeItems: "center",
                  fontSize: 22, color: "var(--accent)",
                  border: "1px solid var(--border-strong)",
                  flexShrink: 0,
                }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Mac menu bar app</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--fg-faint)", marginTop: 2 }}>MCPBoltBar — macOS 14+</div>
                </div>
              </div>

              <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
                Lives in your menu bar. Manage MCP servers across all your AI coding tools without opening a terminal. Automatic updates via Homebrew.
              </p>

              {/* Brew */}
              <div>
                <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-faint)", marginBottom: 8 }}>
                  Install with Homebrew (recommended)
                </div>
                <div className="brew-panel" style={{ borderRadius: 10 }}>
                  <div className="brew-code mono">
                    <span className="prompt">$</span>
                    {BREW_CMD}
                  </div>
                  <CopyButton text={BREW_CMD} />
                </div>
              </div>

              {/* Direct download */}
              <div>
                <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-faint)", marginBottom: 8 }}>
                  Or download the zip
                </div>
                <a href={DOWNLOAD_URL} className="btn" target="_blank" rel="noreferrer" style={{ width: "100%", justifyContent: "center" }}>
                  Download {VERSION} (.zip) ↗
                </a>
              </div>
            </div>

            {/* CLI */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 11,
                  background: "rgba(255,255,255,0.04)",
                  display: "grid", placeItems: "center",
                  fontSize: 20, color: "var(--fg)",
                  border: "1px solid var(--border-strong)",
                  fontFamily: "monospace", fontWeight: 900,
                  flexShrink: 0,
                }}>$_</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>CLI</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--fg-faint)", marginTop: 2 }}>Node.js 18+ · macOS, Linux, Windows</div>
                </div>
              </div>

              <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
                Run without installing using npx, or install globally with npm. Works on macOS, Linux, and Windows — wherever Node.js runs.
              </p>

              {/* npx */}
              <div>
                <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-faint)", marginBottom: 8 }}>
                  Run without installing (recommended)
                </div>
                <div className="brew-panel" style={{ borderRadius: 10 }}>
                  <div className="brew-code mono">
                    <span className="prompt">$</span>
                    {NPX_CMD}
                  </div>
                  <CopyButton text={NPX_CMD} />
                </div>
              </div>

              {/* npm install */}
              <div>
                <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-faint)", marginBottom: 8 }}>
                  Or install globally
                </div>
                <div className="brew-panel" style={{ borderRadius: 10 }}>
                  <div className="brew-code mono">
                    <span className="prompt">$</span>
                    {npmInstall}
                  </div>
                  <CopyButton text={npmInstall} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* System requirements */}
      <section style={{ padding: "56px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="section-head" style={{ textAlign: "left", margin: "0 0 32px" }}>
            <div className="section-kicker">Requirements</div>
            <h2>System requirements</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div className="sec-card">
              <h3>Mac menu bar app</h3>
              <ul style={{ paddingLeft: "1.25em", color: "var(--fg-dim)", fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.8 }}>
                <li>macOS 14 Sonoma or newer</li>
                <li>Apple Silicon (M1 and later) or Intel</li>
                <li>Homebrew (for the brew install path)</li>
                <li>No other dependencies required</li>
              </ul>
            </div>
            <div className="sec-card">
              <h3>CLI</h3>
              <ul style={{ paddingLeft: "1.25em", color: "var(--fg-dim)", fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.8 }}>
                <li>Node.js 18 or newer</li>
                <li>macOS, Linux, or Windows</li>
                <li>npm or npx (comes with Node.js)</li>
                <li>No global install required for npx path</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Verify download */}
      <section style={{ padding: "56px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="section-head" style={{ textAlign: "left", margin: "0 0 24px" }}>
            <div className="section-kicker">Security</div>
            <h2>Verify your download</h2>
          </div>
          <p style={{ color: "var(--fg-dim)", lineHeight: 1.7, maxWidth: 640, marginBottom: 20 }}>
            SHA-256 checksums for every release are published alongside the release notes on GitHub. Compare the checksum of your downloaded file against the one listed there.
          </p>
          <a href={checksumsUrl} className="btn" target="_blank" rel="noreferrer">
            View checksums for {VERSION} on GitHub ↗
          </a>
        </div>
      </section>

      {/* Previous versions + Other platforms */}
      <section style={{ padding: "56px 0 80px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            <div>
              <div className="section-kicker" style={{ marginBottom: 12 }}>History</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 12px" }}>Previous versions</h3>
              <p style={{ color: "var(--fg-dim)", fontSize: "var(--fs-sm)", lineHeight: 1.7, margin: "0 0 16px" }}>
                All prior releases are available on the GitHub Releases page, including changelogs and checksums for each version.
              </p>
              <a href={`${GITHUB_URL}/releases`} className="btn" target="_blank" rel="noreferrer">
                All releases on GitHub ↗
              </a>
            </div>
            <div>
              <div className="section-kicker" style={{ marginBottom: 12 }}>Platforms</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 12px" }}>Other platforms</h3>
              <p style={{ color: "var(--fg-dim)", fontSize: "var(--fs-sm)", lineHeight: 1.7, marginBottom: 12 }}>
                The <strong style={{ color: "var(--fg)" }}>CLI works on Windows and Linux</strong> anywhere Node.js 18+ is installed — run <code style={{ background: "rgba(255,211,77,0.08)", color: "#ffe38a", padding: "1px 5px", borderRadius: 4, fontSize: "0.85em", border: "1px solid rgba(255,211,77,0.15)" }}>npx mcpbolt</code> and it works.
              </p>
              <p style={{ color: "var(--fg-dim)", fontSize: "var(--fs-sm)", lineHeight: 1.7, marginBottom: 16 }}>
                The <strong style={{ color: "var(--fg)" }}>menu bar app is macOS-only</strong> for now. A Windows system tray app and Linux tray app are on the wish list. Star the repo to vote with your interest — GitHub stars are a real signal for prioritisation.
              </p>
              <a href={GITHUB_URL} className="btn" target="_blank" rel="noreferrer">
                Star on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>Ready to install?</h2>
          <p>Free. No account. Your configs stay on your machine.</p>
          <div className="cta-row">
            <a href={DOWNLOAD_URL} className="btn btn-primary" target="_blank" rel="noreferrer">
              Download {VERSION} for macOS
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
