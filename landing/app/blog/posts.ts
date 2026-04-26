export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: "Problem" | "Solution" | "Guide" | "Deep dive" | "Comparison";
  readTime: string;
  author?: string;
};

export const POSTS: BlogPost[] = [
  {
    slug: "mcp-config-hell",
    title: "MCP config hell: why every AI coding tool stores the same thing differently",
    description:
      "Claude wants JSON with `mcpServers`. VS Code wants a `type` field. Zed nests under `context_servers`. Codex uses TOML. Continue uses YAML. Here's why that happened — and the cost every developer is paying.",
    date: "2026-04-20",
    category: "Problem",
    readTime: "8 min",
  },
  {
    slug: "introducing-mcpbolt",
    title: "Introducing MCPBolt — one config, every AI tool",
    description:
      "After six months of copy-pasting the same Supabase server into eight different JSON files, we built the tool we wanted. Here's what MCPBolt does and why it stays local-only.",
    date: "2026-04-19",
    category: "Solution",
    readTime: "6 min",
  },
  {
    slug: "what-is-mcp",
    title: "What is the Model Context Protocol? A developer's field guide",
    description:
      "MCP is Anthropic's open protocol that lets AI tools plug into external data and actions. Here's a plain-English tour: what it is, how it differs from tool-use, and why every major IDE adopted it in under a year.",
    date: "2026-04-15",
    category: "Guide",
    readTime: "10 min",
  },
  {
    slug: "top-mcp-servers-2026",
    title: "The top MCP servers to install in 2026",
    description:
      "We surveyed the ecosystem: Supabase, Context7, PostHog, Playwright, GitHub, Linear, Sentry, and more. Here's what each one does, when you'd install it, and the one-click config for MCPBolt.",
    date: "2026-04-12",
    category: "Guide",
    readTime: "12 min",
  },
  {
    slug: "mcp-tool-comparison",
    title: "MCPBolt vs. manual editing vs. built-in tool UIs: a developer's comparison",
    description:
      "You have three options for managing MCP servers: edit JSON by hand, use each app's built-in UI, or let MCPBolt do it. We benchmarked all three on install time, error rate, and cross-app sync.",
    date: "2026-04-10",
    category: "Comparison",
    readTime: "7 min",
  },
  {
    slug: "local-first-why-it-matters",
    title: "Why MCPBolt stays local-first — and always will",
    description:
      "No telemetry. No account. No cloud sync of your secrets. Here's the engineering reason your MCP tool should never phone home, and how MCPBolt enforces it at every layer.",
    date: "2026-04-08",
    category: "Deep dive",
    readTime: "5 min",
  },
  {
    slug: "mcp-market-landscape",
    title: "The MCP ecosystem in 2026: market landscape",
    description:
      "Who's building MCP servers, who's using them, and where the next wave of agentic tooling is heading. A state-of-the-market report based on GitHub stars, registry submissions, and developer surveys.",
    date: "2026-04-05",
    category: "Deep dive",
    readTime: "11 min",
  },
  {
    slug: "mcp-windows-guide",
    title: "MCP on Windows: stop fighting with npx",
    description:
      "The three root causes behind every Windows MCP failure — wrong shell, broken PATH, bad npx resolution — and the exact fixes for each one. Includes WSL setup, cmd wrapper configs, and a decoded error message table.",
    date: "2026-04-27",
    category: "Guide",
    readTime: "7 min",
  },
  {
    slug: "mcp-security-red-flags",
    title: "5 MCP security red flags to check before you install",
    description:
      "An MCP server runs as a process with your credentials and file access. Here are five warning signs — unverified publishers, broad file access, HTTP endpoints, hardcoded secrets, unpinned versions — and what to do about each one.",
    date: "2026-04-27",
    category: "Deep dive",
    readTime: "6 min",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
