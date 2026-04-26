import Link from "next/link";
import { GITHUB_URL } from "../lib/site";

export function SiteNav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          <span className="logo-mark"><span className="logo-bolt">⚡</span></span>
          <span>MCPBolt</span>
        </Link>
        <div className="nav-links">
          <Link href="/features">Features</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/changelog">Changelog</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <Link href="/download" className="nav-cta">Download</Link>
        </div>
      </div>
    </nav>
  );
}
