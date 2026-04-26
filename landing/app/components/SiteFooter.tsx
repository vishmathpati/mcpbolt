import Link from "next/link";
import { GITHUB_URL, SITE_URL } from "../lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <div className="logo">
              <span className="logo-mark"><span className="logo-bolt">⚡</span></span>
              <span>MCPBolt</span>
            </div>
            <p className="footer-tag">
              One‑click MCP servers for every AI coding tool.
              Local, free, open source.
            </p>
          </div>
          <div className="footer-col">
            <div className="footer-title">Product</div>
            <Link href="/features">Features</Link>
            <Link href="/download">Download</Link>
            <Link href="/changelog">Changelog</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="footer-col">
            <div className="footer-title">Docs</div>
            <Link href="/docs/install">Install</Link>
            <Link href="/docs/quickstart">Quickstart</Link>
            <Link href="/docs/cli">CLI reference</Link>
            <Link href="/docs/apps">Supported apps</Link>
            <Link href="/docs/config-formats">Config formats</Link>
            <Link href="/docs/troubleshooting">Troubleshooting</Link>
            <Link href="/docs/faq">FAQ</Link>
          </div>
          <div className="footer-col">
            <div className="footer-title">Tools</div>
            <Link href="/tools">All tools</Link>
            <Link href="/tools/converter">Config converter</Link>
            <Link href="/docs/install-local">Local server guide</Link>
            <Link href="/docs/install-streamable">Streamable HTTP guide</Link>
          </div>
          <div className="footer-col">
            <div className="footer-title">Learn</div>
            <Link href="/blog">Blog</Link>
            <Link href="/blog/what-is-mcp">What is MCP?</Link>
            <Link href="/blog/mcp-config-hell">MCP config hell</Link>
            <Link href="/compare">Compare tools</Link>
          </div>
          <div className="footer-col">
            <div className="footer-title">Open source</div>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
            <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">Issues</a>
            <a href={`${GITHUB_URL}/releases`} target="_blank" rel="noreferrer">Releases</a>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">License</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>
            <a href={SITE_URL}>{SITE_URL.replace("https://", "")}</a>
            {" "}· Built by <a href={GITHUB_URL}>@vishmathpati</a> · MIT licensed · macOS 14+
          </div>
          <div className="footer-bottom-right">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
