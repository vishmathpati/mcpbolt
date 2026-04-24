import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";
import { GITHUB_URL } from "../../lib/site";

export const metadata = {
  title: "Security",
  description:
    "MCPBolt's security model — atomic writes, timestamped backups, local-only operation, open source MIT license, and guidance on handling secrets in MCP configs.",
};

export default function DocsSecurityPage() {
  return (
    <>
      <div className="prose">
        <h1>Security</h1>
        <p>
          MCPBolt is designed around a simple security model: it edits files on your disk and
          nothing else. No account, no cloud, no telemetry. This page explains what that means in
          practice and what you need to think about when using it.
        </p>

        <hr />

        <h2>Write safety</h2>

        <h3>Atomic writes</h3>
        <p>
          MCPBolt writes config files atomically. It prepares the new file content in memory,
          writes it to a temporary file, then renames the temporary file over the original. On
          POSIX systems, rename is atomic at the filesystem level — there is no window during which
          the file is partially written. If the process is killed mid-write, the original file
          remains intact.
        </p>

        <h3>Merge, never overwrite</h3>
        <p>
          MCPBolt reads the full existing config file before writing. It inserts or updates only the
          target server key and leaves all other keys exactly as they were. Your existing MCP
          servers, your other settings (for tools like Zed where MCP lives inside{" "}
          <code>settings.json</code>), and any comments (in TOML/YAML files) are preserved.
        </p>

        <hr />

        <h2>Backups</h2>
        <p>
          Before modifying any config file, MCPBolt writes a timestamped backup alongside it. The
          backup file is named with a <code>.bak</code> suffix:
        </p>
        <pre><code>{`~/.claude.json.bak`}</code></pre>
        <p>
          MCPBolt keeps the last three backups per file. When a fourth backup is created, the
          oldest is deleted. This rotation happens automatically — you don't need to manage backup
          files manually.
        </p>
        <p>
          To restore a backup, copy it over the current config file:
        </p>
        <pre><code>{`cp ~/.claude.json.bak ~/.claude.json`}</code></pre>

        <Callout kind="tip" title="Undo in the menu bar">
          MCPBoltBar has an Undo last change button that restores the most recent backup for the
          modified file without needing to touch the terminal.
        </Callout>

        <hr />

        <h2>Local-only operation</h2>
        <p>
          MCPBolt makes no outbound network requests except for health checks — and those go
          directly to your MCP servers (which you configured). There is no MCPBolt backend, no
          analytics endpoint, no crash reporting service. Nothing about your config, your server
          names, or your machine is transmitted anywhere.
        </p>
        <p>
          You can verify this by running MCPBolt with a network monitoring tool (e.g.{" "}
          <code>Little Snitch</code>, <code>lsof</code>, or Wireshark) — the only outbound
          connections you'll see are your health checks.
        </p>

        <hr />

        <h2>Open source</h2>
        <p>
          MCPBolt is MIT licensed. The full source code is on GitHub:
        </p>
        <p>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            {GITHUB_URL}
          </a>
        </p>
        <p>
          Trust by inspection: read the code, build it from source, or verify the published npm
          package against the source. There are no binary blobs.
        </p>

        <hr />

        <h2>Secrets and environment variables</h2>
        <p>
          MCP server configs can include an <code>env</code> field (for stdio servers) or an auth
          header (for remote servers). MCPBolt writes whatever you provide into the config file as
          plaintext. This is the same behavior as any other tool that manages these files — the
          files themselves are your security boundary.
        </p>

        <h3>What MCPBolt does with secrets</h3>
        <ul>
          <li>It writes the value you provide into the config file. That's it.</li>
          <li>It does not copy secrets off-disk, log them, or transmit them.</li>
          <li>It does not read values from your clipboard automatically.</li>
          <li>It does not store secrets in any MCPBolt-owned database or keychain.</li>
        </ul>

        <h3>How to handle secrets safely</h3>
        <p>
          The config files MCPBolt writes live on your home directory. They are readable by your
          user account and — if you share your machine or a project repo — potentially by others.
          Follow these practices:
        </p>
        <ul>
          <li>
            <strong>Use environment variable references.</strong> Instead of putting a literal
            secret in the config, reference an environment variable:{" "}
            <code>{`"env": { "SUPABASE_TOKEN": "$SUPABASE_TOKEN" }`}</code>. Set the actual value
            in your <code>~/.zshrc</code> or <code>~/.bashrc</code> (not in the config file).
          </li>
          <li>
            <strong>Don't commit project-scoped configs containing secrets.</strong> Add{" "}
            <code>.mcp.json</code>, <code>.cursor/mcp.json</code>, and similar project-scoped files
            to your <code>.gitignore</code> if they contain env values with real tokens.
          </li>
          <li>
            <strong>Use a secret manager for production.</strong> Tools like 1Password CLI,
            Vault, or macOS Keychain can inject secrets at runtime without storing them in
            plaintext files.
          </li>
        </ul>

        <Callout kind="warn" title="Config files are not encrypted">
          MCPBolt does not encrypt config files. The files it writes are standard JSON/TOML/YAML
          files on your disk, readable by any process running as your user. Treat them with the
          same care you'd give to a <code>~/.zshrc</code> containing API keys.
        </Callout>

        <hr />

        <h2>Reporting a vulnerability</h2>
        <p>
          If you find a security issue in MCPBolt, please report it via GitHub's private
          vulnerability reporting rather than opening a public issue:
        </p>
        <p>
          <a
            href={`${GITHUB_URL}/security/advisories/new`}
            target="_blank"
            rel="noreferrer"
          >
            Report a vulnerability
          </a>
        </p>
      </div>
      <DocsPageNav prev={{ label: "FAQ", href: "/docs/faq" }} />
    </>
  );
}
