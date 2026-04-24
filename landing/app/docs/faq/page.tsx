import Link from "next/link";
import { DocsPageNav } from "../DocsPageNav";
import { GITHUB_URL } from "../../lib/site";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about MCPBolt — pricing, privacy, OS support, Windows/Linux, secrets, stability, and contributing.",
};

export default function DocsFaqPage() {
  return (
    <>
      <div className="prose">
        <h1>Frequently asked questions</h1>

        <hr />

        <h3>Is MCPBolt free?</h3>
        <p>
          Yes, completely. MCPBolt is MIT licensed and free forever. There's no paid tier, no
          freemium, and no plans to monetize it. The source code is on GitHub.
        </p>

        <h3>Does MCPBolt send any data anywhere?</h3>
        <p>
          No. MCPBolt runs entirely on your machine. It reads and writes config files on your disk.
          It makes no network requests except for health checks — and those go directly to your MCP
          servers, not to any MCPBolt-controlled endpoint. There is no telemetry, no analytics, no
          crash reporting, and no account system.
        </p>

        <h3>What OS does the menu bar app require?</h3>
        <p>
          macOS Monterey (12) or newer, on Apple Silicon or Intel. The CLI works on macOS, Linux,
          and Windows (with Node.js 18+).
        </p>

        <h3>Does MCPBolt work on Windows or Linux?</h3>
        <p>
          The CLI (<code>npx mcpbolt</code>) works on any platform that runs Node.js 18+. The menu
          bar app (MCPBoltBar) is macOS-only — Windows and Linux support are not currently planned,
          but the CLI covers the core workflow on those platforms.
        </p>

        <h3>How does MCPBolt compare to Cursor's built-in MCP UI?</h3>
        <p>
          Cursor's built-in MCP UI lets you manage servers inside Cursor only. MCPBolt manages
          servers across all your tools simultaneously. If you only use Cursor, the built-in UI is
          perfectly fine. If you use multiple tools (Claude Desktop, VS Code, Zed, etc.) and want
          them all to have the same servers without doing it manually for each, MCPBolt saves the
          tedium.
        </p>

        <h3>Can MCPBolt install remote MCP servers?</h3>
        <p>
          MCPBolt writes config entries for remote servers — it does not provision, host, or manage
          them. If you paste a URL pointing to a remote MCP server, MCPBolt creates the correct
          config entry (with optional auth headers) in every tool you select. Connectivity and
          uptime are the server's responsibility.
        </p>

        <h3>Does it support custom / private MCP servers?</h3>
        <p>
          Yes. MCPBolt doesn't care where the server comes from. Paste any valid config —
          a local binary, a Docker container, a private URL — and MCPBolt will wire it in. It has
          no opinion about the server's content or provenance.
        </p>

        <h3>Can I script MCPBolt in CI or a dotfiles setup?</h3>
        <p>
          Yes. Use <code>--non-interactive</code> combined with <code>--target</code> and pipe the
          config via stdin:
        </p>
        <pre><code>{`cat my-servers.json | npx mcpbolt --non-interactive --target claude-desktop,cursor-global`}</code></pre>
        <p>
          MCPBolt exits with code 0 on success and non-zero on error, making it easy to integrate
          into shell scripts or dotfile bootstrap scripts.
        </p>

        <h3>How are secrets handled?</h3>
        <p>
          MCPBolt treats <code>env</code> values and auth headers as plaintext — it writes whatever
          you provide directly into the config file. It never reads clipboard contents
          automatically, prompts you to paste values into form fields, or stores anything outside
          the config file it's writing to. Your config files are the security boundary. For
          production secrets, use references to environment variables (e.g. set the value as{" "}
          <code>$MY_TOKEN</code> and ensure that variable is exported in your shell profile) rather
          than hardcoding the secret in the file.
        </p>

        <h3>Where are backups stored?</h3>
        <p>
          MCPBolt writes a <code>.bak</code> file alongside every config file it modifies, just
          before writing. For example, if it modifies <code>~/.claude.json</code>, it creates{" "}
          <code>~/.claude.json.bak</code>. The last three backups per file are kept; older ones
          rotate out. See <Link href="/docs/security">Security</Link> for more detail.
        </p>

        <h3>Is MCPBolt stable enough for daily use?</h3>
        <p>
          MCPBolt's core operation — merging a server entry into a config file — is straightforward
          and has been tested against real config files for all supported tools. The main risk area
          is write safety: if a write fails partway through, you could end up with an invalid
          config file. MCPBolt uses atomic writes and pre-write backups to prevent this. In the
          unlikely event of corruption, the <code>.bak</code> file is always there.
        </p>

        <h3>Can I contribute a new tool?</h3>
        <p>
          Yes, and it's designed to be easy. Adding support for a new tool is a single file — you
          implement the <code>Target</code> interface and register it. See the Contributing section
          in the{" "}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            README
          </a>{" "}
          for the step-by-step walkthrough with code examples.
        </p>

        <h3>What happens to my other config keys when MCPBolt writes a file?</h3>
        <p>
          Nothing. MCPBolt reads the existing file, inserts or updates only the target server key,
          and writes the file back. All other keys — your existing MCP servers, any other settings
          in a file like Zed's <code>settings.json</code> — are preserved exactly as they were.
          This is the core design principle: merge, never overwrite.
        </p>

        <h3>Does MCPBolt validate the config I paste before writing?</h3>
        <p>
          MCPBolt parses the input and validates that it recognizes the format and can extract a
          server name and transport config. It does not validate whether the server itself is
          correct or reachable — that's what health checks are for. If you paste a malformed JSON
          snippet, MCPBolt will report a parse error and exit without writing anything.
        </p>
      </div>
      <DocsPageNav
        prev={{ label: "Troubleshooting", href: "/docs/troubleshooting" }}
        next={{ label: "Security", href: "/docs/security" }}
      />
    </>
  );
}
