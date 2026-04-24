import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";
import { BREW_CMD, NPX_CMD, GITHUB_URL, DOWNLOAD_URL } from "../../lib/site";

export const metadata = {
  title: "Install",
  description:
    "Install MCPBolt via npx, npm global install, or the Homebrew-powered Mac menu bar app. Requirements and uninstall instructions included.",
};

export default function DocsInstallPage() {
  return (
    <>
      <div className="prose">
        <h1>Install MCPBolt</h1>
        <p>
          MCPBolt ships in two forms: a CLI you run with <code>npx</code> (no install required) and
          a native macOS menu bar app called MCPBoltBar. You can use either or both — they operate
          on the same config files.
        </p>

        <hr />

        <h2>Option 1 — CLI</h2>
        <p>
          The CLI is the quickest way to get started. Run it without installing anything:
        </p>
        <pre><code>{NPX_CMD}</code></pre>
        <p>
          npx will fetch the latest version from npm every time. If you'd prefer a stable version
          pinned globally:
        </p>
        <pre><code>{`npm install -g mcpbolt`}</code></pre>
        <p>Then invoke it as:</p>
        <pre><code>{`mcpbolt`}</code></pre>

        <h3>Requirements</h3>
        <ul>
          <li>Node.js 18 or newer</li>
          <li>macOS, Linux, or Windows with WSL</li>
        </ul>

        <Callout kind="tip" title="Tip">
          Run <code>node --version</code> to check your Node version. If it's below 18, update via{" "}
          <a href="https://nodejs.org" target="_blank" rel="noreferrer">nodejs.org</a> or your
          version manager (<code>nvm use 18</code>, <code>fnm use 18</code>, etc.).
        </Callout>

        <h3>Verify CLI install</h3>
        <pre><code>{`mcpbolt --version`}</code></pre>

        <h3>Uninstall CLI</h3>
        <p>If you installed globally:</p>
        <pre><code>{`npm uninstall -g mcpbolt`}</code></pre>
        <p>
          If you only ever used <code>npx mcpbolt</code>, there's nothing to uninstall — npx
          doesn't persist a global binary.
        </p>

        <hr />

        <h2>Option 2 — Mac menu bar app (MCPBoltBar)</h2>
        <p>
          MCPBoltBar lives in your menu bar and gives you a full GUI for managing MCP servers —
          toggles, health status, coverage matrix, per-repo projects, and more. No terminal
          required for day-to-day use.
        </p>

        <h3>Install via Homebrew</h3>
        <pre><code>{BREW_CMD}</code></pre>

        <h3>Install via direct download</h3>
        <p>
          Grab the latest zip from the{" "}
          <a href={DOWNLOAD_URL} target="_blank" rel="noreferrer">
            Releases page
          </a>{" "}
          on GitHub, unzip it, and drag MCPBoltBar into your{" "}
          <strong>Applications</strong> folder.
        </p>

        <h3>Requirements</h3>
        <ul>
          <li>macOS Monterey (12) or newer</li>
          <li>Apple Silicon or Intel</li>
        </ul>

        <Callout kind="info" title="Note">
          The menu bar app includes its own bundled runtime — you don't need Node.js installed
          separately to use MCPBoltBar.
        </Callout>

        <h3>Verify menu bar install</h3>
        <p>
          After launching MCPBoltBar, the bolt icon should appear in your menu bar. Click it — if
          you see the server list (or an empty state prompting you to add a server), the install
          was successful.
        </p>

        <h3>Uninstall menu bar app</h3>
        <p>If you installed via Homebrew:</p>
        <pre><code>{`brew uninstall mcpboltbar`}</code></pre>
        <p>If you installed manually: drag MCPBoltBar out of <strong>Applications</strong> into Trash.</p>
        <p>
          Config files that MCPBolt wrote to your AI tools are <strong>not</strong> removed on
          uninstall — your MCP server entries stay in place. Remove them manually if needed (see{" "}
          <Link href="/docs/apps">Supported apps</Link> for config file locations).
        </p>

        <hr />

        <h2>Which should I use?</h2>
        <p>
          Use the CLI if you're comfortable in the terminal or want to script MCPBolt into a
          dotfiles setup. Use the menu bar app if you want a GUI, always-on health monitoring, and
          one-click sync across tools. Both read and write the same config files, so you can switch
          between them freely.
        </p>

        <Callout kind="tip" title="Source">
          MCPBolt is MIT licensed. You can read the source, build it yourself, or contribute at{" "}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            {GITHUB_URL}
          </a>
          .
        </Callout>
      </div>
      <DocsPageNav
        prev={{ label: "Introduction", href: "/docs" }}
        next={{ label: "Quickstart", href: "/docs/quickstart" }}
      />
    </>
  );
}
