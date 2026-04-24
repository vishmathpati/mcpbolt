import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata = {
  title: "CLI reference",
  description:
    "Complete CLI reference for MCPBolt — commands, flags, writer targets, config paths, and environment variables.",
};

export default function DocsCliPage() {
  return (
    <>
      <div className="prose">
        <h1>CLI reference</h1>
        <p>
          The <code>mcpbolt</code> CLI reads a pasted config, translates it, and writes the result
          to one or more AI tool config files. It has a single interactive mode (default) and a
          handful of flags for scripting.
        </p>

        <hr />

        <h2>Invocation</h2>
        <pre><code>{`npx mcpbolt [flags]`}</code></pre>
        <p>Or, if installed globally:</p>
        <pre><code>{`mcpbolt [flags]`}</code></pre>

        <h2>Flags</h2>
        <table>
          <thead>
            <tr>
              <th>Flag</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--version</code></td>
              <td>Print the installed version and exit.</td>
            </tr>
            <tr>
              <td><code>--help</code></td>
              <td>Show usage and available flags.</td>
            </tr>
            <tr>
              <td><code>--dry-run</code></td>
              <td>
                Parse and preview all changes but do not write any files. Equivalent to answering
                "No" at the "Write files now?" prompt, but skips the prompt entirely.
              </td>
            </tr>
            <tr>
              <td><code>--target &lt;id&gt;</code></td>
              <td>
                Pre-select one or more targets (comma-separated) instead of showing the interactive
                picker. Example: <code>--target claude-desktop,cursor-global</code>.
              </td>
            </tr>
            <tr>
              <td><code>--non-interactive</code></td>
              <td>
                Skip all prompts. Requires the config to be piped or passed via stdin. Combines
                well with <code>--target</code> for scripting.
              </td>
            </tr>
            <tr>
              <td><code>--format &lt;fmt&gt;</code></td>
              <td>
                Force a specific input format instead of auto-detecting. Valid values:{" "}
                <code>claude</code>, <code>vscode</code>, <code>zed</code>, <code>codex</code>,{" "}
                <code>continue</code>, <code>url</code>, <code>npx</code>, <code>docker</code>.
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Environment variables</h2>
        <table>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>MCPBOLT_CONFIG_DIR</code></td>
              <td>
                Override the directory MCPBolt uses for its own internal state (backups index,
                etc.). Defaults to <code>~/.mcpbolt</code>.
              </td>
            </tr>
            <tr>
              <td><code>MCPBOLT_NO_COLOR</code></td>
              <td>
                Set to any non-empty value to disable ANSI colors in output. Useful for CI logs
                or terminals that don't support color.
              </td>
            </tr>
          </tbody>
        </table>

        <Callout kind="tip" title="Scripting">
          For non-interactive use, pipe your config via stdin and combine flags:{" "}
          <code>
            {"cat config.json | mcpbolt --non-interactive --target claude-desktop"}
          </code>
          . MCPBolt exits with code 0 on success, non-zero on error.
        </Callout>

        <hr />

        <h2>Writer targets</h2>
        <p>
          These are the <code>id</code> values you pass to <code>--target</code>. MCPBolt
          auto-detects which are installed on your machine during interactive mode.
        </p>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>App</th>
              <th>Scope</th>
              <th>Config file</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>claude-desktop</code></td>
              <td>Claude Desktop</td>
              <td>user</td>
              <td><code>~/Library/Application Support/Claude/claude_desktop_config.json</code></td>
            </tr>
            <tr>
              <td><code>claude-code-global</code></td>
              <td>Claude Code</td>
              <td>user</td>
              <td><code>~/.claude.json</code></td>
            </tr>
            <tr>
              <td><code>claude-code-project</code></td>
              <td>Claude Code</td>
              <td>project</td>
              <td><code>.mcp.json</code></td>
            </tr>
            <tr>
              <td><code>cursor-global</code></td>
              <td>Cursor</td>
              <td>user</td>
              <td><code>~/.cursor/mcp.json</code></td>
            </tr>
            <tr>
              <td><code>cursor-project</code></td>
              <td>Cursor</td>
              <td>project</td>
              <td><code>.cursor/mcp.json</code></td>
            </tr>
            <tr>
              <td><code>vscode-global</code></td>
              <td>VS Code</td>
              <td>user</td>
              <td><code>~/Library/Application Support/Code/User/mcp.json</code></td>
            </tr>
            <tr>
              <td><code>vscode-project</code></td>
              <td>VS Code</td>
              <td>project</td>
              <td><code>.vscode/mcp.json</code></td>
            </tr>
            <tr>
              <td><code>codex-global</code></td>
              <td>Codex CLI</td>
              <td>user</td>
              <td><code>~/.codex/config.toml</code></td>
            </tr>
            <tr>
              <td><code>codex-project</code></td>
              <td>Codex CLI</td>
              <td>project</td>
              <td><code>.codex/config.toml</code></td>
            </tr>
            <tr>
              <td><code>windsurf</code></td>
              <td>Windsurf</td>
              <td>user</td>
              <td><code>~/.codeium/windsurf/mcp_config.json</code></td>
            </tr>
            <tr>
              <td><code>zed-global</code></td>
              <td>Zed</td>
              <td>user</td>
              <td><code>~/.config/zed/settings.json</code></td>
            </tr>
            <tr>
              <td><code>zed-project</code></td>
              <td>Zed</td>
              <td>project</td>
              <td><code>.zed/settings.json</code></td>
            </tr>
            <tr>
              <td><code>continue</code></td>
              <td>Continue</td>
              <td>user</td>
              <td><code>~/.continue/config.yaml</code></td>
            </tr>
            <tr>
              <td><code>gemini-global</code></td>
              <td>Gemini CLI</td>
              <td>user</td>
              <td><code>~/.gemini/settings.json</code></td>
            </tr>
            <tr>
              <td><code>gemini-project</code></td>
              <td>Gemini CLI</td>
              <td>project</td>
              <td><code>.gemini/settings.json</code></td>
            </tr>
            <tr>
              <td><code>roo</code></td>
              <td>Roo Code</td>
              <td>project</td>
              <td><code>.roo/mcp.json</code></td>
            </tr>
          </tbody>
        </table>

        <Callout kind="info" title="Merge, not overwrite">
          MCPBolt always merges the target server key into the existing config file. Every other
          key in the file is left untouched. If the file does not exist, it is created with only
          the new server entry.
        </Callout>
      </div>
      <DocsPageNav
        prev={{ label: "Quickstart", href: "/docs/quickstart" }}
        next={{ label: "Config formats", href: "/docs/config-formats" }}
      />
    </>
  );
}
