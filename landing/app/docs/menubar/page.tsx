import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata = {
  title: "Menu bar tour",
  description:
    "A tour of MCPBoltBar — the Mac menu bar app for managing MCP servers across all your AI coding tools.",
};

export default function DocsMenubarPage() {
  return (
    <>
      <div className="prose">
        <h1>MCPBoltBar — the menu bar app</h1>
        <p>
          MCPBoltBar is a native macOS app that lives in your menu bar. It gives you a full GUI for
          everything the CLI does, plus always-on health monitoring and a coverage matrix. Click the
          bolt icon at any time to see the state of your MCP servers across every tool.
        </p>

        <hr />

        <h2>The four tabs</h2>

        <h3>By App</h3>
        <p>
          The default view. Every AI tool MCPBolt knows about appears as a collapsible card. Expand
          a card to see the MCP servers installed for that tool. Each server row shows:
        </p>
        <ul>
          <li>A <strong>toggle pill</strong> (green = enabled, red = disabled)</li>
          <li>A <strong>health dot</strong> (green / amber / red / grey — see <Link href="/docs/health">Health status</Link>)</li>
          <li>The server name and transport type (Local or Remote)</li>
          <li>Quick-action buttons for Edit and Remove</li>
        </ul>
        <p>
          Tools that MCPBolt detects on your machine are shown with their real server counts. Tools
          not installed are listed but grayed out.
        </p>

        <h3>Coverage</h3>
        <p>
          A matrix view: servers on the left, tools across the top. Each cell shows whether that
          server is installed in that tool. Missing coverage is immediately obvious — a gap in a row
          means a server isn't wired into that tool yet. Click any gap to add the server to that
          tool in one action.
        </p>
        <p>
          You can hide columns for tools you don't use. The hidden state persists across sessions.
        </p>

        <h3>Projects</h3>
        <p>
          Manage per-repository MCP configs — Claude Code's <code>.mcp.json</code>, VS Code's{" "}
          <code>.vscode/mcp.json</code>, and similar project-scoped files. See{" "}
          <Link href="/docs/projects">Projects tab</Link> for the full walkthrough.
        </p>

        <h3>Settings</h3>
        <p>
          App-level preferences: launch at login toggle, theme, default target pre-selections, and
          links to documentation and GitHub.
        </p>

        <hr />

        <h2>Toggle on / off</h2>
        <p>
          The green/red pill on each server row enables or disables that server for that specific
          tool without removing it. When you disable a server, MCPBolt comments out or temporarily
          moves the entry in the config file so the tool ignores it — but the configuration is
          preserved and restored immediately when you re-enable.
        </p>
        <p>
          This is useful when a server is causing startup slowdowns or errors: disable it in one
          click, then re-enable when you're ready.
        </p>

        <Callout kind="info" title="Per-tool toggle">
          Toggling a server in one tool does not affect other tools. You can have a server enabled
          in Claude Desktop but disabled in Cursor independently.
        </Callout>

        <hr />

        <h2>Live health status</h2>
        <p>
          MCPBoltBar checks the health of every registered server once per minute. The health dot
          next to each server name reflects the latest result. See{" "}
          <Link href="/docs/health">Health status</Link> for the full explanation of what each color
          means and how checks are performed.
        </p>

        <hr />

        <h2>Sync across apps</h2>
        <p>
          From any server row in the By App tab, open the context menu and choose{" "}
          <strong>Sync to other tools</strong>. MCPBolt shows a picker of all other tools and writes
          the server's config to every one you select — translating the format automatically. This
          is the same operation as running <code>npx mcpbolt</code> and picking targets, but done
          from the GUI without re-pasting anything.
        </p>

        <hr />

        <h2>Edit in place</h2>
        <p>
          Click the edit button on any server row to open a form showing the server's current{" "}
          <code>command</code>, <code>args</code>, <code>env</code>, and URL. Make changes and click
          Save — MCPBolt writes the updated config using the same merge-and-backup approach as the
          CLI. No manual JSON editing, no backslash escaping.
        </p>

        <Callout kind="tip" title="Env vars">
          Environment variable values are shown as editable text fields. If a value looks like a
          secret, treat the config file as the security boundary — see{" "}
          <Link href="/docs/security">Security</Link>.
        </Callout>

        <hr />

        <h2>Full-screen dashboard</h2>
        <p>
          Click <strong>Open Dashboard</strong> from the menu bar popover (or the toolbar icon in
          Settings) to expand MCPBoltBar into a full resizable window. The dashboard shows the same
          four tabs with more room — useful for the Coverage matrix or when managing many servers.
        </p>

        <hr />

        <h2>Launch at login</h2>
        <p>
          In the Settings tab, toggle <strong>Launch at login</strong> to have MCPBoltBar start
          automatically when you log in to your Mac. It starts minimized to the menu bar and runs
          silently in the background, keeping health status current without any interaction.
        </p>
      </div>
      <DocsPageNav
        prev={{ label: "Config formats", href: "/docs/config-formats" }}
        next={{ label: "Projects tab", href: "/docs/projects" }}
      />
    </>
  );
}
