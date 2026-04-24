import { Callout } from "../../components/Callout";

export function McpToolComparison() {
  return (
    <>
      <p>
        When you want to add an MCP server to your workflow, you have a few options. You can edit
        the JSON files by hand. You can use the built-in UI that some tools now provide. You can
        use a CLI tool like Smithery. Or you can use MCPBolt. Each approach has genuine tradeoffs,
        and the right answer depends on how many tools you use and how often you add servers.
      </p>

      <p>
        This comparison is honest. Where competitors are better, I&apos;ll say so. The goal is to
        help you make the right choice, not to sell you on MCPBolt.
      </p>

      <h2>The comparison</h2>

      <table>
        <thead>
          <tr>
            <th>Approach</th>
            <th>Install time (single tool)</th>
            <th>Cross-app sync</th>
            <th>Format translation</th>
            <th>Works offline</th>
            <th>Cost</th>
            <th>Open source</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hand-editing JSON</td>
            <td>5-15 min</td>
            <td>Manual</td>
            <td>Manual</td>
            <td>Yes</td>
            <td>Free</td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>Each app&apos;s built-in UI</td>
            <td>2-5 min</td>
            <td>None</td>
            <td>None</td>
            <td>Yes</td>
            <td>Free</td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>Smithery CLI</td>
            <td>1-2 min</td>
            <td>None</td>
            <td>Limited</td>
            <td>Partial</td>
            <td>Free (registry)</td>
            <td>AGPL-3.0</td>
          </tr>
          <tr>
            <td>MCPBolt</td>
            <td>30 sec</td>
            <td>All supported tools</td>
            <td>Full (7 formats)</td>
            <td>Yes</td>
            <td>Free</td>
            <td>MIT</td>
          </tr>
        </tbody>
      </table>

      <h2>Hand-editing JSON (and TOML, and YAML)</h2>

      <p>
        This is the baseline. You find a server, you read its documentation, you open the relevant
        config file, and you type or paste the right JSON shape for that tool. Then you repeat for
        every other tool you use.
      </p>

      <p>
        The upsides: no dependencies, works offline, you know exactly what&apos;s happening, and
        you can tweak anything. For a developer who uses one tool and adds servers rarely, hand-editing
        is completely reasonable.
      </p>

      <p>
        The costs appear when you use multiple tools. Claude Desktop, Cursor, VS Code, and Codex
        CLI each have different config schemas. You need to get the format right for each one
        (Claude uses <code>mcpServers</code>, VS Code requires a <code>type</code> field, Codex
        uses TOML). A mistake means the server silently fails to load. The error messages from
        most clients when a config is malformed are unhelpful at best.
      </p>

      <p>
        The bigger long-term cost is sync drift. Once you&apos;ve manually copied a server into
        four places, those four copies will diverge. You update a token in one file and forget the
        others. The cognitive overhead of keeping them in sync grows with every server you add.
      </p>

      <h2>Each app&apos;s built-in UI</h2>

      <p>
        Cursor, VS Code, and Claude Desktop all have some form of built-in MCP management. These
        are improving rapidly. VS Code lets you add servers through a settings UI. Cursor has an
        MCP panel in its settings where you can see connected servers and their status.
      </p>

      <p>
        If you only use one tool, a built-in UI is probably the right answer. It&apos;s the lowest
        friction path for single-tool users: no CLI to install, no extra dependencies, integrated
        status display, and the app team is responsible for keeping it current.
      </p>

      <p>
        The limitation is that built-in UIs are scoped to their own app. Cursor&apos;s MCP UI
        writes to Cursor&apos;s config. It does not know or care about your Claude Desktop config
        or your Codex CLI config. If you use three tools, you need to configure each one separately.
        There is no cross-tool sync.
      </p>

      <Callout kind="tip" title="Use the built-in UI if you live in one tool">
        If Cursor is your only AI coding environment, use Cursor&apos;s built-in MCP settings. It
        handles Cursor-specific edge cases and gets updated with Cursor. MCPBolt adds value when
        you&apos;re managing servers across multiple tools.
      </Callout>

      <h2>Smithery CLI</h2>

      <p>
        Smithery is the largest MCP server registry (7,000+ servers as of early 2026), and they
        offer a CLI (<code>smithery install &lt;server&gt;</code>) for installing servers from
        their registry.{" "}
        <em>
          (Source:{" "}
          <a href="https://github.com/smithery-ai/cli">github.com/smithery-ai/cli</a>, 691 stars,
          AGPL-3.0)
        </em>
      </p>

      <p>
        Smithery&apos;s strengths are discoverability and the registry. If you don&apos;t know what
        servers exist, Smithery is the best place to browse. Their app-store interface has good
        search and filtering, and the install command does work: for some servers, one command
        writes to your Claude Desktop config.
      </p>

      <p>
        The limitations: Smithery CLI&apos;s cross-app sync is limited compared to MCPBolt&apos;s
        full multi-target write. It also requires a network connection to look up servers from the
        registry. And the AGPL-3.0 license means if you embed Smithery CLI in your own tooling,
        that tooling becomes subject to AGPL terms.
      </p>

      <p>
        Smithery and MCPBolt also have different orientations. Smithery is a registry first, CLI
        second: it excels at helping you discover servers from their curated catalog. MCPBolt is a
        format translator first: it excels at taking any config snippet (from any source, not just
        Smithery&apos;s registry) and writing it correctly to every tool you use. These are
        complementary, not competing, use cases.
      </p>

      <h2>MCPBolt</h2>

      <p>
        MCPBolt is focused on one thing: take any MCP config snippet in any format, and write it
        correctly to every AI tool on your machine. It does not have a registry. It does not
        require a network connection. It does not require an account.
      </p>

      <p>
        The format translation is the key capability. MCPBolt knows the native schema for 10
        tools (Claude Desktop, Claude Code, Cursor, VS Code, Codex CLI, Windsurf, Zed, Continue,
        Gemini CLI, Roo Code) and can write to all of them from a single paste. If you use five
        tools, that&apos;s one operation instead of five.
      </p>

      <p>
        The honest limitation: MCPBolt has no built-in discovery. You need to know what server you
        want before you can install it. For discovery, use Smithery, PulseMCP, or the official
        registry at registry.modelcontextprotocol.io. Then bring the config snippet to MCPBolt to
        install it everywhere.
      </p>

      <h2>When to pick which</h2>

      <p>
        <strong>Use each app&apos;s built-in UI</strong> if you primarily live in one AI coding
        tool (usually Cursor or VS Code) and add MCP servers infrequently.
      </p>

      <p>
        <strong>Use Smithery</strong> if you want a browsable registry and you&apos;re primarily
        working with Claude Desktop or another tool Smithery&apos;s CLI targets directly.
      </p>

      <p>
        <strong>Use MCPBolt</strong> if you use two or more AI coding tools, you add servers from
        external sources (GitHub READMEs, documentation sites, coworker configs), and you want
        one paste to handle all the format translation. Also use MCPBolt if you want the install
        to be fully offline and local.
      </p>

      <p>
        The combination that works well in practice: browse Smithery or PulseMCP for discovery,
        copy the config snippet, and run <a href="/download">MCPBolt</a> to write it everywhere.
      </p>
    </>
  );
}
