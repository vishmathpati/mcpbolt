import { Callout } from "../../components/Callout";

export function WhatIsMcp() {
  return (
    <>
      <p>
        If you&apos;ve spent any time with AI coding tools in the past year, you&apos;ve seen the
        acronym MCP appear everywhere. Claude supports it. Cursor supports it. VS Code&apos;s agent
        mode supports it. Every week there&apos;s a new MCP server announcement on Hacker News.
      </p>

      <p>
        But the explanations tend to be either too abstract (&ldquo;a standard for connecting AI to
        tools&rdquo;) or too deep in protocol details to be immediately useful. This post is the
        middle version: enough to understand what MCP actually is, why it exists, and what the
        ecosystem looks like today.
      </p>

      <h2>Origin: Anthropic, November 2024</h2>

      <p>
        Anthropic open-sourced the Model Context Protocol on November 25, 2024.{" "}
        <em>
          (Source:{" "}
          <a href="https://www.anthropic.com/news/model-context-protocol">
            anthropic.com/news/model-context-protocol
          </a>
          )
        </em>{" "}
        The announcement described it as &ldquo;a universal, open standard for connecting AI systems
        with data sources.&rdquo;
      </p>

      <p>
        This was not a product launch. Anthropic released a protocol specification, SDKs in Python
        and TypeScript, and a handful of reference server implementations for Google Drive, Slack,
        GitHub, Postgres, and Puppeteer. The intention was explicit: they wanted other AI tool
        builders and service providers to adopt it, not just Claude.
      </p>

      <p>
        In December 2025, Anthropic donated MCP to the Agentic AI Foundation (AAIF), a directed
        fund under the Linux Foundation co-founded by Anthropic, Block, and OpenAI. The protocol is
        now governed independently of any single company.
      </p>

      <h2>The problem MCP solves</h2>

      <p>
        Before MCP, every AI tool that wanted to integrate with an external service had to build a
        custom integration. GitHub wanted Claude to read repositories? Anthropic builds a GitHub
        integration. GitHub also wants Cursor to read repositories? Cursor builds a separate GitHub
        integration. And so on, for every tool-service pair.
      </p>

      <p>
        This is the M times N problem. M AI clients times N external services equals M*N custom
        integrations, each maintained separately, each implemented differently. The Language Server
        Protocol solved the same problem for editor-language pairs in 2016 (one server per
        language, not one per editor-language combination). MCP applies the same insight to
        AI tool-service pairs.
      </p>

      <p>
        With MCP: GitHub builds one server. Every MCP client gets GitHub integration for free.
        Supabase builds one server. Same. Linear, Sentry, PostHog, Playwright: one server each,
        works everywhere.
      </p>

      <h2>Architecture: clients, servers, and the protocol</h2>

      <p>
        MCP has two sides: clients and servers.
      </p>

      <p>
        An <strong>MCP client</strong> is an AI tool that wants to use external capabilities: Claude
        Desktop, Cursor, VS Code, Zed, etc. Clients initiate connections, discover what a server
        can do, and make requests.
      </p>

      <p>
        An <strong>MCP server</strong> is a program that exposes capabilities to clients: the
        Supabase server, the GitHub server, the Filesystem server, etc. Servers respond to requests
        and return structured results.
      </p>

      <p>
        Between them runs the Model Context Protocol itself: JSON-RPC 2.0 messages, either over
        standard I/O (for local servers, launched as child processes) or over HTTP/SSE (for remote
        servers, accessed over the network).
      </p>

      <pre><code>{`AI Tool (Client)
     │
     │  JSON-RPC 2.0
     │  over stdio (local) or HTTP/SSE (remote)
     ▼
MCP Server
     │
     ▼
External Service (GitHub, Supabase, filesystem, etc.)`}</code></pre>

      <p>
        When a client connects to a server, the first thing it does is capability negotiation: the
        server announces what it can do, the client learns the schema, and from that point forward
        the client can call the server&apos;s tools with structured arguments and get structured
        results back.
      </p>

      <h2>What a server exposes: tools, resources, and prompts</h2>

      <p>
        MCP servers can expose three kinds of things:
      </p>

      <p>
        <strong>Tools</strong> are callable functions with defined input schemas. A GitHub server
        might expose a <code>create_issue</code> tool that takes <code>repo</code>,{" "}
        <code>title</code>, and <code>body</code> arguments. The AI calls the tool, the server
        creates the issue, the server returns the result. This is the most common thing servers
        expose and what most developers think of when they talk about MCP.
      </p>

      <p>
        <strong>Resources</strong> are readable data sources: files, database records, API responses.
        The client asks for a resource by URI and gets structured content back. A Filesystem server
        might expose each file in a directory as a resource.
      </p>

      <p>
        <strong>Prompts</strong> are reusable prompt templates that servers can define and clients
        can invoke. Less common than tools, but useful for servers that want to guide how the AI
        approaches a task.
      </p>

      <Callout kind="info" title="Tools are what you actually use">
        In practice, most MCP integrations are almost entirely tool-based. When your AI assistant
        says &ldquo;I used the Supabase MCP server to query your database,&rdquo; it called a tool
        that the server exposed, got a structured result, and folded that into its context window.
      </Callout>

      <h2>Who adopted it and when</h2>

      <p>
        Adoption after the November 2024 launch was faster than most protocol launches manage in
        their first year.
      </p>

      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>MCP support added</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Claude Desktop</td>
            <td>November 2024 (launch day)</td>
          </tr>
          <tr>
            <td>Cursor</td>
            <td>Early 2025</td>
          </tr>
          <tr>
            <td>VS Code (Copilot agent mode)</td>
            <td>2025, native support</td>
          </tr>
          <tr>
            <td>Windsurf</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>Zed</td>
            <td>2025 (experimental, actively improving)</td>
          </tr>
          <tr>
            <td>Claude Code (CLI)</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>Codex CLI (OpenAI)</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>Gemini CLI (Google)</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>Continue</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>Roo Code</td>
            <td>2025</td>
          </tr>
        </tbody>
      </table>

      <p>
        OpenAI announced MCP support across ChatGPT desktop and Codex in early 2025. Google added
        MCP support to Gemini CLI. By the end of 2025, every major AI coding tool either supported
        MCP or had it on a near-term roadmap.
      </p>

      <h2>Why it matters: the network effect</h2>

      <p>
        Once you build a server, it works in every client that speaks the protocol. The Supabase
        team built their MCP server once. Now it works in Claude Desktop, Cursor, VS Code,
        Windsurf, Zed, and any other tool that adopts MCP. For free. Without Supabase doing any
        additional work per client.
      </p>

      <p>
        As of early 2026, registries like Glama index over 21,000 MCP servers, Smithery lists
        over 7,000, and MCP.so hosts nearly 20,000 community-submitted entries.{" "}
        <em>
          (Source: automationswitch.com/ai-workflows/where-to-find-mcp-servers-2026)
        </em>{" "}
        That number is growing faster than almost any comparable developer ecosystem in recent
        memory. Every new client that adopts MCP immediately gets access to every server that
        already exists. Every new server immediately works in every client that already supports it.
      </p>

      <p>
        That&apos;s the network effect that made MCP go from a spec document to a de facto industry
        standard in under twelve months.
      </p>

      <h2>The remaining friction: installation</h2>

      <p>
        MCP solved the integration problem (one server, many clients) but left the installation
        problem open. Each client stores MCP server configuration in a different file, with a
        different schema. Connecting one server to five tools still requires translating the same
        config five times manually.
      </p>

      <p>
        That&apos;s the gap MCPBolt fills. If you&apos;re using more than one MCP-capable tool,{" "}
        <a href="/download">download MCPBolt</a> and paste your server configs once instead of
        translating them for each tool separately.
      </p>
    </>
  );
}
