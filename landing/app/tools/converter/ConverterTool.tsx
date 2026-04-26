"use client";

import { useState } from "react";

// ─── IR types ───────────────────────────────────────────────────────────────

type Transport = "stdio" | "http" | "sse";

interface IR {
  name: string;
  transport: Transport;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

// ─── Tokenizer ───────────────────────────────────────────────────────────────

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: string | null = null;
  for (const ch of input) {
    if (quote) {
      if (ch === quote) { quote = null; tokens.push(current); current = ""; }
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === " " || ch === "\t") {
      if (current) { tokens.push(current); current = ""; }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function inferName(parts: string[]): string {
  const skip = new Set(["npx", "node", "python", "python3", "uvx", "bunx", "-y", "--yes"]);
  for (const p of parts) {
    if (skip.has(p) || p.startsWith("-") || p.startsWith("http")) continue;
    const base = p.split("/").pop() ?? p;
    return base.replace(/-mcp$/, "").replace(/^mcp-/, "") || "mcp-server";
  }
  return "mcp-server";
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

type RawServer = Record<string, unknown>;

function rawToIR(name: string, raw: RawServer): IR {
  const transport: Transport =
    typeof raw["type"] === "string" && (raw["type"] === "http" || raw["type"] === "sse")
      ? (raw["type"] as Transport)
      : typeof raw["url"] === "string"
      ? "http"
      : "stdio";
  const ir: IR = { name, transport };
  if (transport === "stdio") {
    if (typeof raw["command"] === "string") ir.command = raw["command"];
    if (Array.isArray(raw["args"])) ir.args = raw["args"] as string[];
    if (raw["env"] && typeof raw["env"] === "object") ir.env = raw["env"] as Record<string, string>;
  } else {
    if (typeof raw["url"] === "string") ir.url = raw["url"];
    if (raw["headers"] && typeof raw["headers"] === "object")
      ir.headers = raw["headers"] as Record<string, string>;
  }
  return ir;
}

function rawZedToIR(name: string, raw: RawServer): IR {
  const cmd = raw["command"] as RawServer | undefined;
  if (cmd && typeof cmd === "object") {
    return rawToIR(name, { command: cmd["path"], args: cmd["args"], env: cmd["env"] });
  }
  if (typeof raw["url"] === "string") return rawToIR(name, { url: raw["url"] });
  return rawToIR(name, raw);
}

function parseJsonToIR(data: Record<string, unknown>): IR[] {
  if (data["mcpServers"] && typeof data["mcpServers"] === "object") {
    const s = data["mcpServers"] as Record<string, RawServer>;
    return Object.entries(s).map(([n, r]) => rawToIR(n, r));
  }
  if (data["servers"] && typeof data["servers"] === "object") {
    const s = data["servers"] as Record<string, RawServer>;
    return Object.entries(s).map(([n, r]) => rawToIR(n, r));
  }
  if (data["context_servers"] && typeof data["context_servers"] === "object") {
    const s = data["context_servers"] as Record<string, RawServer>;
    return Object.entries(s).map(([n, r]) => rawZedToIR(n, r));
  }
  if (data["command"] || data["url"]) {
    const name = (data["name"] as string | undefined) ?? "mcp-server";
    return [rawToIR(name, data as RawServer)];
  }
  throw new Error("Unrecognized JSON — expected mcpServers, servers, or context_servers key");
}

function parseInput(raw: string): { servers: IR[]; format: string } {
  const s = raw.trim();

  if (s.startsWith("{") || s.startsWith("[")) {
    const data = JSON.parse(s) as Record<string, unknown>;
    return { servers: parseJsonToIR(data), format: "JSON" };
  }

  if (s.startsWith("http://") || s.startsWith("https://")) {
    const url = s.split(/\s/)[0];
    const name = url.split("/").filter(Boolean).pop()?.split("?")[0] ?? "mcp-server";
    return { servers: [{ name, transport: "http", url }], format: "URL" };
  }

  if (s.startsWith("claude mcp add")) {
    const parts = tokenize(s);
    let idx = 3;
    if (parts[idx] === "-s" || parts[idx] === "--scope") idx += 2;
    const name = parts[idx] ?? "mcp-server";
    idx++;
    if (parts[idx] === "--") idx++;
    const command = parts[idx];
    const args = parts.slice(idx + 1);
    if (command) return { servers: [{ name, transport: "stdio", command, args }], format: "claude mcp add" };
  }

  const CLI_LAUNCHERS = ["npx ", "bunx ", "node ", "python ", "python3 ", "uvx "];
  if (CLI_LAUNCHERS.some((p) => s.startsWith(p))) {
    const parts = tokenize(s);
    return {
      servers: [{ name: inferName(parts), transport: "stdio", command: parts[0], args: parts.slice(1) }],
      format: "CLI command",
    };
  }

  throw new Error("Unrecognized format. Paste JSON, an npx command, or a URL.");
}

// ─── Output generators ───────────────────────────────────────────────────────

function toClaudeShape(ir: IR): unknown {
  if (ir.transport === "stdio") {
    return {
      command: ir.command,
      ...(ir.args?.length ? { args: ir.args } : {}),
      ...(ir.env && Object.keys(ir.env).length ? { env: ir.env } : {}),
    };
  }
  return {
    url: ir.url,
    ...(ir.headers && Object.keys(ir.headers).length ? { headers: ir.headers } : {}),
  };
}

function toVsCodeShape(ir: IR): unknown {
  if (ir.transport === "stdio") {
    return {
      type: "stdio",
      command: ir.command,
      ...(ir.args?.length ? { args: ir.args } : {}),
      ...(ir.env && Object.keys(ir.env).length ? { env: ir.env } : {}),
    };
  }
  return {
    type: ir.transport,
    url: ir.url,
    ...(ir.headers && Object.keys(ir.headers).length ? { headers: ir.headers } : {}),
  };
}

function toZedShape(ir: IR): unknown {
  if (ir.transport === "stdio") {
    return {
      command: {
        path: ir.command,
        args: ir.args ?? [],
        ...(ir.env && Object.keys(ir.env).length ? { env: ir.env } : {}),
      },
      settings: {},
    };
  }
  return { url: ir.url, settings: {} };
}

function genClaudeJson(servers: IR[]): string {
  return JSON.stringify({ mcpServers: Object.fromEntries(servers.map((s) => [s.name, toClaudeShape(s)])) }, null, 2);
}

function genVsCode(servers: IR[]): string {
  return JSON.stringify({ servers: Object.fromEntries(servers.map((s) => [s.name, toVsCodeShape(s)])) }, null, 2);
}

function genZed(servers: IR[]): string {
  return JSON.stringify({ context_servers: Object.fromEntries(servers.map((s) => [s.name, toZedShape(s)])) }, null, 2);
}

function genCodexToml(servers: IR[]): string {
  return servers
    .map((s) => {
      const lines = [`[[mcp_servers]]`, `name = ${JSON.stringify(s.name)}`];
      if (s.transport === "stdio") {
        if (s.command) lines.push(`command = ${JSON.stringify(s.command)}`);
        if (s.args?.length) lines.push(`args = [${s.args.map((a) => JSON.stringify(a)).join(", ")}]`);
        if (s.env && Object.keys(s.env).length) {
          lines.push(`\n[mcp_servers.env]`);
          for (const [k, v] of Object.entries(s.env)) lines.push(`${k} = ${JSON.stringify(v)}`);
        }
      } else {
        if (s.url) lines.push(`url = ${JSON.stringify(s.url)}`);
        if (s.headers && Object.keys(s.headers).length) {
          lines.push(`\n[mcp_servers.headers]`);
          for (const [k, v] of Object.entries(s.headers)) lines.push(`${k} = ${JSON.stringify(v)}`);
        }
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

function genContinueYaml(servers: IR[]): string {
  const items = servers.map((s) => {
    if (s.transport === "stdio") {
      const argsStr = s.args?.length
        ? `\n    args:\n${s.args.map((a) => `      - ${JSON.stringify(a)}`).join("\n")}`
        : "";
      const envStr =
        s.env && Object.keys(s.env).length
          ? `\n    env:\n${Object.entries(s.env)
              .map(([k, v]) => `      ${k}: ${JSON.stringify(v)}`)
              .join("\n")}`
          : "";
      return `  - name: ${s.name}\n    command: ${JSON.stringify(s.command)}${argsStr}${envStr}`;
    }
    return `  - name: ${s.name}\n    url: ${s.url ?? ""}`;
  });
  return `mcpServers:\n${items.join("\n")}`;
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

interface ToolDef {
  id: string;
  name: string;
  format: string;
  color: string;
  generate: (servers: IR[]) => string;
}

const TOOLS: ToolDef[] = [
  { id: "claude-desktop", name: "Claude Desktop", format: "JSON", color: "#d97757", generate: genClaudeJson },
  { id: "claude-code",    name: "Claude Code",    format: "JSON (.mcp.json)", color: "#d97757", generate: genClaudeJson },
  { id: "cursor",         name: "Cursor",         format: "JSON", color: "#7c5cbf", generate: genClaudeJson },
  { id: "windsurf",       name: "Windsurf",       format: "JSON", color: "#0ea5e9", generate: genClaudeJson },
  { id: "gemini",         name: "Gemini CLI",     format: "JSON", color: "#4285f4", generate: genClaudeJson },
  { id: "opencode",       name: "opencode",       format: "JSON", color: "#94a3b8", generate: genClaudeJson },
  { id: "roo",            name: "Roo",            format: "JSON", color: "#6366f1", generate: genClaudeJson },
  { id: "vscode",         name: "VS Code",        format: "JSON (.vscode/mcp.json)", color: "#1e88e5", generate: genVsCode },
  { id: "zed",            name: "Zed",            format: "JSON (settings)", color: "#8b5cf6", generate: genZed },
  { id: "codex",          name: "Codex CLI",      format: "TOML (.codex/config.toml)", color: "#22c55e", generate: genCodexToml },
  { id: "continue",       name: "Continue",       format: "YAML (.continue/config.yaml)", color: "#f59e0b", generate: genContinueYaml },
];

const PLACEHOLDER = `Paste any of these:

• JSON config:
  { "mcpServers": { "supabase": { "url": "https://mcp.supabase.com/mcp" } } }

• npx command:
  npx -y @modelcontextprotocol/server-filesystem ~/Downloads

• Bare URL:
  https://mcp.supabase.com/mcp

• claude mcp add command:
  claude mcp add context7 -- npx -y @upstash/context7-mcp`;

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button className="copy-btn" onClick={copy} style={{ fontSize: 12 }}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function ConverterTool() {
  const [input, setInput] = useState("");
  const [activeToolId, setActiveToolId] = useState("claude-desktop");

  let parsed: { servers: IR[]; format: string } | null = null;
  let parseError: string | null = null;

  if (input.trim()) {
    try {
      parsed = parseInput(input);
    } catch (e) {
      parseError = (e as Error).message;
    }
  }

  const activeTool = TOOLS.find((t) => t.id === activeToolId) ?? TOOLS[0];
  const output = parsed ? activeTool.generate(parsed.servers) : "";

  return (
    <div className="converter-shell">
      {/* ── Input panel ──────────────────────────────────────────────────── */}
      <div className="converter-panel">
        <div className="converter-panel-head">
          <span className="converter-panel-label">Input</span>
          {parsed ? (
            <span className="converter-badge converter-badge--ok">{parsed.format}</span>
          ) : (
            <span className="converter-badge">Paste below</span>
          )}
        </div>

        <textarea
          className="converter-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
        />

        {parsed && (
          <div className="converter-chips">
            {parsed.servers.map((s) => (
              <span key={s.name} className="converter-chip">
                <span className="converter-chip-name">{s.name}</span>
                <span className={`converter-chip-transport converter-chip-transport--${s.transport}`}>
                  {s.transport}
                </span>
              </span>
            ))}
          </div>
        )}

        {parseError && (
          <div className="converter-error">
            <span style={{ marginRight: 6 }}>⚠</span>
            {parseError}
          </div>
        )}

        {!input.trim() && (
          <div className="converter-hint">
            Supports JSON, npx commands, URLs, and <code>claude mcp add</code> commands.
            Conversion happens locally — nothing is sent to any server.
          </div>
        )}
      </div>

      {/* ── Output panel ─────────────────────────────────────────────────── */}
      <div className="converter-panel">
        <div className="converter-panel-head">
          <span className="converter-panel-label">Output</span>
          {output && <CopyBtn text={output} />}
        </div>

        {/* Tool selector tabs */}
        <div className="converter-tabs">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              className={`converter-tab${activeToolId === tool.id ? " converter-tab--active" : ""}`}
              onClick={() => setActiveToolId(tool.id)}
              style={
                activeToolId === tool.id
                  ? ({ "--tab-accent": tool.color } as React.CSSProperties)
                  : {}
              }
            >
              {tool.name}
            </button>
          ))}
        </div>

        <div style={{ padding: "8px 16px 4px", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="converter-badge" style={{ fontSize: 11 }}>
            {activeTool.format}
          </span>
        </div>

        <pre className="converter-output">
          <code>
            {output
              ? output
              : input.trim()
              ? "Fix the error above to see output"
              : "← Paste a config to get started"}
          </code>
        </pre>
      </div>
    </div>
  );
}
