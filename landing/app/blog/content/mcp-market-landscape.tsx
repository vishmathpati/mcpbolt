import { Callout } from "../../components/Callout";

export function McpMarketLandscape() {
  return (
    <>
      <p>
        Sixteen months after Anthropic open-sourced MCP in November 2024, the ecosystem has reached
        a scale that is genuinely hard to describe without superlatives. What started as a spec
        document and six reference server implementations now has tens of thousands of community
        servers, a donated-to-Linux-Foundation governance structure, and adoption by every major
        AI coding tool vendor. This post is a state-of-market analysis: what exists, what&apos;s
        actually being used, and where the honest gaps are.
      </p>

      <h2>Growth: the numbers</h2>

      <p>
        The most direct growth signal is server count. In November 2024, the official{" "}
        <code>modelcontextprotocol/servers</code> repository contained roughly a dozen reference
        implementations. By early 2026, third-party registries tell a different story:
      </p>

      <ul>
        <li>
          <strong>Glama</strong> (glama.ai/mcp/servers) indexes over 21,000 servers, updated
          daily with automated curation.
        </li>
        <li>
          <strong>MCP.so</strong> hosts nearly 20,000 community-submitted entries.
        </li>
        <li>
          <strong>Smithery</strong> (smithery.ai) lists 7,000+ with a curated, app-store-style
          interface and install commands.
        </li>
        <li>
          <strong>PulseMCP</strong> (pulsemcp.com) tracks 11,840+ hand-reviewed servers,
          describing itself as &ldquo;hand-reviewed daily by the founder since MCP&apos;s launch
          week.&rdquo;
        </li>
      </ul>

      <p>
        <em>
          (Source: automationswitch.com/ai-workflows/where-to-find-mcp-servers-2026, April 2026)
        </em>
      </p>

      <p>
        The punkpeye/awesome-mcp-servers GitHub list tracked roughly 7,260 servers as of May 2025,
        suggesting doubling-or-better growth in the second half of 2025.
      </p>

      <Callout kind="info" title="Registry counts include duplicates">
        Most of the 20,000+ entries across registries are community submissions, and significant
        overlap exists between registries. The number of distinct, maintained, production-quality
        servers is likely in the low thousands. The signal-to-noise ratio in the long tail is poor.
      </Callout>

      <h2>The registry landscape</h2>

      <p>
        Four registry types have emerged, each serving a different purpose.
      </p>

      <h3>The official registry</h3>

      <p>
        Anthropic launched the official MCP registry at{" "}
        <code>registry.modelcontextprotocol.io</code> in preview in September 2025. This is the
        machine-readable, canonical source for programmatic server discovery, not a
        human-browsable interface. Clients can query it to discover servers and get verified
        metadata. Think of it as the npm registry for MCP, not the npm website. The official
        registry is the most trustworthy source by definition, though its current server count is
        lower than community registries because it requires active submission and verification.
      </p>

      <h3>Curated directories</h3>

      <p>
        Smithery and PulseMCP occupy the curated tier. Smithery has the cleanest discovery
        experience: good search, install commands for many servers, and a hosted remote server
        option that makes it possible to use servers without running anything locally. PulseMCP&apos;s
        differentiator is genuine editorial review rather than automated ingestion.
      </p>

      <h3>Volume-indexed directories</h3>

      <p>
        Glama and MCP.so index the broadest possible set of servers, prioritizing coverage over
        curation. If a server exists, one of these directories probably knows about it. The
        tradeoff is quality: many entries are experiments, weekend projects, or wrappers around
        simpler tools. Useful for comprehensive research, less useful for &ldquo;what should I
        actually install?&rdquo; questions.
      </p>

      <h3>Meta-indexes</h3>

      <p>
        The awesome-mcp-servers family on GitHub (multiple forks with different curation
        philosophies) and mcpservers.org aggregate across directories. Useful as entry points
        but tend to go stale faster than dedicated registries.
      </p>

      <h2>Client support: who adopted MCP and when</h2>

      <p>
        The most important story in the MCP ecosystem is not the server count; it is the pace of
        client adoption. MCP&apos;s value proposition only works if there are clients to use the
        servers. The adoption curve was steep:
      </p>

      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Company</th>
            <th>Approximate adoption</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Claude Desktop</td>
            <td>Anthropic</td>
            <td>November 2024 (day one)</td>
          </tr>
          <tr>
            <td>Cursor</td>
            <td>Anysphere</td>
            <td>Early 2025</td>
          </tr>
          <tr>
            <td>Windsurf</td>
            <td>Codeium</td>
            <td>Early 2025</td>
          </tr>
          <tr>
            <td>Continue</td>
            <td>Continue.dev</td>
            <td>Early 2025</td>
          </tr>
          <tr>
            <td>Roo Code</td>
            <td>Community</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>VS Code (GitHub Copilot)</td>
            <td>Microsoft</td>
            <td>2025, native support</td>
          </tr>
          <tr>
            <td>Claude Code (CLI)</td>
            <td>Anthropic</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>Codex CLI</td>
            <td>OpenAI</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>Gemini CLI</td>
            <td>Google</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>Zed</td>
            <td>Zed Industries</td>
            <td>2025 (experimental)</td>
          </tr>
        </tbody>
      </table>

      <p>
        The three largest AI platform vendors (Microsoft via VS Code, Google via Gemini CLI, and
        OpenAI via Codex CLI) all adopted MCP in 2025. That was not guaranteed in November 2024.
        OpenAI had its own tool-use implementation; Microsoft had extensions. The fact that all
        three converged on MCP as a standard rather than each building their own protocol is the
        strongest possible adoption signal.
      </p>

      <h2>Server archetypes: what gets built</h2>

      <p>
        Looking across the major registries, MCP servers cluster into a few categories:
      </p>

      <p>
        <strong>Database and data access</strong> is the largest category. Supabase, Postgres,
        SQLite, MongoDB, and dozens of warehouse integrations. The pattern is consistent: expose
        schema introspection, query execution, and table management as tools. These servers make
        AI-assisted database work dramatically faster.
      </p>

      <p>
        <strong>Developer services</strong> is the second-largest. GitHub, Linear, Jira, Sentry,
        PostHog, Datadog, PagerDuty, and similar. The pattern here is wrapping an existing REST
        API as a set of typed MCP tools. Most major SaaS developer tools have either an official
        server or a well-maintained community one.
      </p>

      <p>
        <strong>Web and browser automation</strong> includes Playwright, Puppeteer, and several
        browser-specific implementations. These let AI assistants interact with web pages, which
        unlocks testing, scraping, and UI automation workflows.
      </p>

      <p>
        <strong>Knowledge and memory</strong> is a smaller but growing category: the official
        Memory server, various Obsidian integrations, Notion, and Confluence. The use case is
        giving AI persistent context across sessions.
      </p>

      <p>
        <strong>Infrastructure</strong> covers cloud provider tools: AWS, GCP, and Terraform
        integrations that let AI assistants inspect and manage cloud resources.
      </p>

      <h2>Open problems</h2>

      <p>
        The MCP ecosystem has real gaps that the next wave of tooling needs to solve.
      </p>

      <p>
        <strong>Discoverability is fragmented.</strong> There are four major registries with
        different inventories, different quality signals, and no common metadata format. A developer
        asking &ldquo;is there an MCP server for X?&rdquo; needs to check multiple registries.
        The official registry at modelcontextprotocol.io is the intended fix, but its adoption
        as the canonical submission target is not yet universal.
      </p>

      <p>
        <strong>Trust and security are unsolved.</strong> Any of the 20,000+ community servers
        could be malicious: exfiltrating data, running unexpected commands, making network calls to
        unexpected endpoints. There is currently no signing infrastructure, no code-scanning
        requirement for registry submission, and no reliable reputation system. The community
        convention of &ldquo;check the GitHub repo&rdquo; does not scale. This is likely the most
        important open problem in the ecosystem.
      </p>

      <p>
        <strong>Version compatibility is implicit.</strong> MCP has evolved since November 2024.
        Servers built against early specs may not behave correctly with clients implementing later
        capabilities, and vice versa. The negotiation protocol is designed to handle this, but
        edge cases exist and the error messages when compatibility breaks are typically unhelpful.
      </p>

      <p>
        <strong>Installation UX is inconsistent.</strong> Getting a server running in one tool
        is now reasonably straightforward. Getting the same server into every tool you use is still
        more friction than it should be. Each tool&apos;s config format is different, few tools
        have cross-tool awareness, and there is no shared state. This is what MCPBolt addresses.
      </p>

      <h2>Where it is going</h2>

      <p>
        The most interesting near-term development is agentic workflows. Until recently, MCP was
        used primarily to augment interactive sessions: a developer asks a question, the AI calls
        a tool, the developer sees the result. The emerging pattern is AI agents that run
        autonomously, calling MCP tools as part of multi-step workflows without a human in the
        loop for each step. The combination of cheap inference and a rich MCP server ecosystem
        makes this credible in a way it was not eighteen months ago.
      </p>

      <p>
        The governance donation to the Linux Foundation / Agentic AI Foundation also matters. MCP
        is no longer Anthropic&apos;s protocol; it is an industry standard with shared stewardship.
        That reduces the risk that any single vendor could modify the protocol in ways that break
        cross-vendor compatibility, which is the main precondition for continued broad adoption.
      </p>

      <p>
        The infrastructure layer for MCP (discovery, trust, installation) is still being built.
        The server ecosystem developed faster than the tooling to manage it. That gap is closing,
        but it is where most of the interesting near-term work is happening.
      </p>

      <p>
        If you want to manage your slice of that ecosystem without cloud dependencies,{" "}
        <a href="/download">MCPBolt</a> is a good place to start. And if you want to see what
        servers are worth installing, the{" "}
        <a href="/blog/top-mcp-servers-2026">top servers list</a> is a curated starting point.
      </p>
    </>
  );
}
