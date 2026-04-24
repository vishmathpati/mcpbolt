import Link from "next/link";
import { Callout } from "../components/Callout";
import { DocsPageNav } from "./DocsPageNav";

export const metadata = {
  title: "Introduction",
  description:
    "MCPBolt documentation — learn how to install, configure, and manage MCP servers across every AI coding tool from one place.",
};

export default function DocsIntro() {
  return (
    <>
      <div className="prose">
        <h1>MCPBolt docs</h1>
        <p className="lead">
          MCPBolt is a free, open-source tool that installs, syncs, and manages{" "}
          <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer">
            Model Context Protocol
          </a>{" "}
          servers across every AI coding tool on your machine. You paste a config once — MCPBolt
          translates it into the correct format and writes it to every app you choose.
        </p>

        <hr />

        <h2>Start here</h2>
        <p>Three pages cover everything you need to go from zero to wired:</p>

        <div className="docs-card-row" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          <Link href="/docs/install" style={{ display: "block", padding: "16px 20px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, textDecoration: "none" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>1. Install</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
              Get the CLI via <code>npx mcpbolt</code> or install the Mac menu bar app via Homebrew.
            </div>
          </Link>
          <Link href="/docs/quickstart" style={{ display: "block", padding: "16px 20px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, textDecoration: "none" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>2. Quickstart</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
              Wire your first MCP server into Claude Desktop, Cursor, or VS Code in 60 seconds.
            </div>
          </Link>
          <Link href="/docs/cli" style={{ display: "block", padding: "16px 20px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, textDecoration: "none" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>3. CLI reference</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
              Every command, flag, and writer target documented in one place.
            </div>
          </Link>
        </div>

        <hr />

        <h2>What's in these docs</h2>
        <ul>
          <li>
            <strong>Getting started</strong> — Install, Quickstart. Start here if you're new.
          </li>
          <li>
            <strong>CLI</strong> — CLI reference and every supported input format (JSON, TOML, YAML,
            shell commands, bare URLs).
          </li>
          <li>
            <strong>Menu bar app</strong> — Tour of MCPBoltBar's four tabs, the Projects tab for
            per-repo configs, and the always-on health status system.
          </li>
          <li>
            <strong>Reference</strong> — Supported apps with config paths, troubleshooting common
            issues, FAQ, and security model.
          </li>
        </ul>

        <hr />

        <h2>What MCPBolt is not</h2>
        <p>Being precise about scope saves confusion:</p>
        <ul>
          <li>
            <strong>Not a paid SaaS.</strong> MCPBolt is MIT-licensed and runs entirely on your
            machine. There is no account, no subscription, and no cloud backend.
          </li>
          <li>
            <strong>Not a registry of MCP servers.</strong> MCPBolt doesn't ship a catalog of
            servers you can browse and install. You bring the config (from a server's README, from
            a vendor's docs) and MCPBolt handles the translation and writing.
          </li>
          <li>
            <strong>Not a host or runtime.</strong> MCPBolt does not run your MCP servers. It edits
            the config files that tell your AI tools how to launch and connect to servers. The tools
            themselves are responsible for starting, stopping, and communicating with servers.
          </li>
          <li>
            <strong>Not opinionated about which servers you run.</strong> MCPBolt works with any
            MCP server — local stdio processes, remote HTTP/SSE endpoints, Docker containers. It
            reads what you paste and writes it faithfully.
          </li>
        </ul>

        <Callout kind="tip" title="Tip">
          If you already know what MCPBolt does and want to jump straight into it, skip to the{" "}
          <Link href="/docs/quickstart">Quickstart</Link>.
        </Callout>
      </div>
      <DocsPageNav next={{ label: "Install", href: "/docs/install" }} />
    </>
  );
}
