import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata = {
  title: "Projects tab",
  description:
    "Manage per-repository MCP configs in MCPBoltBar — auto-discovery, manual folder adding, and switching between global and project-scoped servers.",
};

export default function DocsProjectsPage() {
  return (
    <>
      <div className="prose">
        <h1>Projects: per-repo MCP configs</h1>
        <p>
          Most MCP servers live in global config files — they're available in every project you
          open. But some servers are project-specific: a database MCP pointed at a particular
          connection string, a filesystem server scoped to a specific repo, or a custom tool only
          relevant to one codebase. The Projects tab is where you manage those.
        </p>

        <hr />

        <h2>What a project is</h2>
        <p>
          In MCPBolt's terms, a project is any folder that contains a project-scoped MCP config
          file. These files live inside the project's directory rather than in <code>~</code>:
        </p>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Project config file</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Claude Code</td>
              <td><code>.mcp.json</code> (project root)</td>
            </tr>
            <tr>
              <td>Cursor</td>
              <td><code>.cursor/mcp.json</code></td>
            </tr>
            <tr>
              <td>VS Code</td>
              <td><code>.vscode/mcp.json</code></td>
            </tr>
            <tr>
              <td>Codex CLI</td>
              <td><code>.codex/config.toml</code></td>
            </tr>
            <tr>
              <td>Zed</td>
              <td><code>.zed/settings.json</code></td>
            </tr>
            <tr>
              <td>Gemini CLI</td>
              <td><code>.gemini/settings.json</code></td>
            </tr>
            <tr>
              <td>Roo Code</td>
              <td><code>.roo/mcp.json</code></td>
            </tr>
          </tbody>
        </table>
        <p>
          When a tool opens a project, it merges both the global config and the project config.
          Project-scoped entries take precedence when there's a naming conflict.
        </p>

        <hr />

        <h2>Auto-discovery</h2>
        <p>
          MCPBoltBar automatically scans common development directories on your Mac for projects
          that contain Claude Code (<code>.mcp.json</code>) or Codex CLI (<code>.codex/config.toml</code>)
          project configs. Discovered projects appear in the Projects tab immediately — no setup
          required.
        </p>
        <p>Scanned paths include:</p>
        <ul>
          <li><code>~/Developer</code></li>
          <li><code>~/Projects</code></li>
          <li><code>~/Code</code></li>
          <li><code>~/repos</code></li>
          <li><code>~/src</code></li>
        </ul>
        <p>
          If your projects live somewhere else, add the folder manually (see below).
        </p>

        <Callout kind="tip" title="Tip">
          Auto-discovery runs when MCPBoltBar launches and can be triggered manually with the
          refresh button in the Projects tab header.
        </Callout>

        <hr />

        <h2>Adding a folder manually</h2>
        <p>
          Click <strong>Add folder</strong> in the Projects tab. A standard macOS folder picker
          opens. Select the root of the repo (or any folder). MCPBolt immediately checks it for
          project-scoped config files and lists any it finds.
        </p>
        <p>
          You can add as many folders as you like. The list persists across restarts.
        </p>

        <hr />

        <h2>Viewing and editing project-scoped servers</h2>
        <p>
          Clicking a project in the list expands it to show the servers defined in each
          project-scoped config file. The same toggle, edit, and remove actions available in the
          By App tab work here too — but writes go to the project file, not the global one.
        </p>
        <p>
          To add a new server to a project, use the <strong>+ Add server</strong> button inside the
          project view. You can paste a config snippet or pick a server you've already registered
          globally and MCPBolt will copy the entry into the project file.
        </p>

        <hr />

        <h2>Global vs. project-scoped: which wins?</h2>
        <p>
          Each tool handles the merge differently, but the general rule is:
        </p>
        <ul>
          <li>
            Both global and project servers are active when you open the project.
          </li>
          <li>
            If a server with the same name appears in both, the project-scoped entry wins.
          </li>
          <li>
            Disabling a server in the project scope does not affect the global config.
          </li>
        </ul>

        <Callout kind="warn" title="Committing project configs">
          Project-scoped config files (<code>.mcp.json</code>, <code>.vscode/mcp.json</code>, etc.)
          are regular files in your repository. If they contain secrets (tokens, API keys) in{" "}
          <code>env</code> values, do not commit them. Add them to <code>.gitignore</code> or use
          environment variable references instead of hardcoded values.
        </Callout>
      </div>
      <DocsPageNav
        prev={{ label: "Menu bar tour", href: "/docs/menubar" }}
        next={{ label: "Health status", href: "/docs/health" }}
      />
    </>
  );
}
