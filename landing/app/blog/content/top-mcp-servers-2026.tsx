import { Callout } from "../../components/Callout";

export function TopMcpServers2026() {
  return (
    <>
      <p>
        The MCP ecosystem is large enough now that &ldquo;which servers should I install?&rdquo; is a
        real question with a non-obvious answer. Registries like Glama index over 21,000 servers;
        most of them are experiments, wrappers, or duplicates of official implementations. The
        signal-to-noise ratio is poor.
      </p>

      <p>
        This list is curated by category. Each entry is a server with a genuine production use
        case, maintained by an organization that has reason to keep it working, and available via
        a stable install path. Where multiple implementations exist, we list the official one.
      </p>

      <Callout kind="tip" title="Install any of these with MCPBolt">
        Copy the config snippet below any entry, run <code>npx mcpbolt</code>, paste, and select
        your target tools. MCPBolt handles the format translation for every tool you use.
      </Callout>

      <h2>Dev tools</h2>

      <h3>GitHub</h3>

      <p>
        GitHub&apos;s official MCP server (released April 2025, rewritten in Go) gives your AI
        assistant access to repositories, issues, pull requests, code search, GitHub Actions workflow
        runs, and Dependabot alerts. It is arguably the most useful single server you can install:
        every coding project lives in a GitHub repo, and being able to ask your AI to &ldquo;open a
        PR for this branch against main&rdquo; or &ldquo;find all open issues tagged bug&rdquo;
        without leaving your editor is genuinely time-saving.
      </p>

      <p>
        GitHub offers both a local server and a remote hosted option at{" "}
        <code>https://api.githubcopilot.com/mcp/</code> that requires no local installation.
        For the local version:
      </p>

      <pre><code>{`{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN" }
    }
  }
}`}</code></pre>

      <h3>Sentry</h3>

      <p>
        Sentry&apos;s official MCP server (<code>@sentry/mcp-server</code>) gives your AI direct
        access to your Sentry projects: issues, error traces, Seer AI analysis, and project
        configuration. The most useful workflow: paste an error message into Claude or Cursor,
        have the AI pull the related Sentry issue for full context, then fix the bug. That loop
        that used to involve three browser tabs and copy-pasting stack traces becomes one command.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server"],
      "env": { "SENTRY_ACCESS_TOKEN": "YOUR_TOKEN" }
    }
  }
}`}</code></pre>

      <h3>Linear</h3>

      <p>
        Linear&apos;s MCP server is available as a remote endpoint at{" "}
        <code>https://mcp.linear.app/sse</code>. It exposes your issues, projects, cycles, and
        teams. Useful for any workflow where you want your AI to create tasks from code review
        notes, triage incoming bugs into Linear, or check what&apos;s in the current sprint before
        suggesting what to work on next.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "linear": {
      "url": "https://mcp.linear.app/sse",
      "headers": { "Authorization": "Bearer YOUR_TOKEN" }
    }
  }
}`}</code></pre>

      <h2>Data and databases</h2>

      <h3>Supabase</h3>

      <p>
        The Supabase MCP server is the canonical example of what a database MCP server looks like
        done right. It exposes your Supabase project&apos;s tables, lets your AI run queries,
        manage schema migrations, and inspect data. If you&apos;re building anything with Supabase
        as your backend, this is a near-mandatory install. The AI can help write SQL, debug queries
        against real schema, and propose migrations without you having to paste table definitions
        into the context window by hand.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_SUPABASE_ACCESS_TOKEN" }
    }
  }
}`}</code></pre>

      <h3>PostHog</h3>

      <p>
        PostHog&apos;s MCP server (<code>@posthog/mcp-server</code>, also available at{" "}
        <code>https://mcp.posthog.com/mcp</code>) exposes your product analytics to your AI
        assistant. You can ask it to pull funnel data, query events, manage feature flags, and
        set up A/B experiments. The practical use case: you&apos;re implementing a feature and
        want to immediately instrument it correctly. Instead of jumping between your IDE and the
        PostHog dashboard, the AI can check what events already exist, propose the right event
        names, and verify the implementation against your existing schema.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "posthog": {
      "url": "https://mcp.posthog.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_POSTHOG_TOKEN" }
    }
  }
}`}</code></pre>

      <h3>Filesystem</h3>

      <p>
        The official Anthropic filesystem server from <code>@modelcontextprotocol/server-filesystem</code>{" "}
        gives your AI read and write access to a specified directory. It&apos;s the simplest server
        on this list and one of the most useful: it lets Claude Desktop (which does not have
        built-in filesystem access by default) actually read and write files. You specify which
        directories to expose at launch, so it&apos;s safe to give access to your projects folder
        without worrying about the AI touching system files.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects"]
    }
  }
}`}</code></pre>

      <h2>Web and automation</h2>

      <h3>Playwright</h3>

      <p>
        The Playwright MCP server (<code>@playwright/mcp</code>) is the most capable browser
        automation server available. Unlike screenshot-based browser tools, Playwright MCP
        operates through the accessibility tree: it reads page structure as structured data,
        clicks elements by accessible name, fills forms, and navigates. This makes it dramatically
        more reliable than pixel-clicking approaches, and it works without a vision model. Install
        this when you want your AI to interact with web applications: scraping, testing, form
        automation, UI verification.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}`}</code></pre>

      <h3>Fetch</h3>

      <p>
        The official Fetch server from <code>@modelcontextprotocol/server-fetch</code> lets your
        AI retrieve arbitrary web content and convert it to clean markdown. Less powerful than
        Playwright (no interaction, just retrieval) but much lighter weight. Useful when you want
        the AI to pull current documentation from a URL without needing a full browser instance.
        Think of it as a programmable <code>curl | lynx</code> available inside your AI session.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}`}</code></pre>

      <h2>Knowledge and productivity</h2>

      <h3>Context7</h3>

      <p>
        Context7, built by Upstash (<code>@upstash/context7-mcp</code>), solves one of the most
        frustrating AI coding failure modes: the AI confidently writes code against a library API
        that changed six months ago. Context7 pulls the current, version-specific documentation
        for any library and injects it into the context before the AI generates code. No more
        hallucinated APIs, no more deprecated patterns. You add <code>use context7</code> to your
        prompt and it fetches the right docs automatically.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}`}</code></pre>

      <h3>Memory</h3>

      <p>
        The official Memory server from <code>@modelcontextprotocol/server-memory</code>{" "}
        implements a knowledge graph that persists across sessions. Your AI can store facts, link
        entities, and retrieve them in future conversations. This is the basic infrastructure for
        making an AI assistant that remembers things across sessions: your preferences, project
        context, decisions you&apos;ve made, people you&apos;ve mentioned. Not magic, but the
        foundation for building something close to it.
      </p>

      <pre><code>{`{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}`}</code></pre>

      <h3>Brave Search</h3>

      <p>
        The Brave Search server gives your AI real web search access via the Brave Search API.
        Unlike retrieval-augmented generation approaches that embed your own documents, this
        lets the AI search the open web. Useful for anything that requires current information:
        checking whether a package has a breaking change, looking up a Stack Overflow answer,
        finding the current API endpoint for a service. Requires a Brave Search API key (free
        tier available).
      </p>

      <pre><code>{`{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "YOUR_KEY" }
    }
  }
}`}</code></pre>

      <Callout kind="info" title="Start with three">
        If you&apos;re new to MCP servers, start with Filesystem, GitHub, and Context7. They
        cover the most common AI-assisted coding workflows (reading/writing files, managing
        repos, avoiding stale API references) with minimal configuration overhead.
      </Callout>

      <p>
        To install any of these with MCPBolt, copy the config snippet, run{" "}
        <code>npx mcpbolt</code>, and paste. MCPBolt writes the correct format for every AI
        tool you select. See <a href="/docs/quickstart">the quickstart</a> for a step-by-step
        walkthrough.
      </p>
    </>
  );
}
