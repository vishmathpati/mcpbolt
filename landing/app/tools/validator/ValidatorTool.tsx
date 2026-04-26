"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "pass" | "warn" | "fail";

interface Check {
  id: string;
  severity: Severity;
  label: string;
  detail: string;
}

interface ServerResult {
  name: string;
  transport: "stdio" | "http" | "sse" | "unknown";
  checks: Check[];
}

interface ValidationResult {
  format: string;
  servers: ServerResult[];
  topLevelChecks: Check[];
}

// ─── Validation logic ─────────────────────────────────────────────────────────

const DANGEROUS_FLAGS = ["--no-verify", "--no-ssl", "--insecure", "--disable-ssl-verification", "--skip-ssl"];
const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,      // OpenAI style
  /ghp_[a-zA-Z0-9]{36}/,      // GitHub PAT
  /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/i,  // UUID keys
];

function looksLikeSecret(val: string): boolean {
  if (val.length < 8) return false;
  return SECRET_PATTERNS.some((p) => p.test(val));
}

function validateServer(name: string, raw: Record<string, unknown>): ServerResult {
  const checks: Check[] = [];

  // Determine transport
  let transport: ServerResult["transport"] = "unknown";
  if (typeof raw["type"] === "string" && (raw["type"] === "http" || raw["type"] === "sse")) {
    transport = raw["type"] as "http" | "sse";
  } else if (typeof raw["url"] === "string") {
    transport = "http";
  } else if (typeof raw["command"] === "string" || raw["path"]) {
    transport = "stdio";
  }

  // Check: name is non-empty
  if (!name || name.trim() === "") {
    checks.push({ id: "name", severity: "fail", label: "Missing server name", detail: "Every server must have a name key." });
  } else {
    checks.push({ id: "name", severity: "pass", label: "Server name present", detail: `Name: "${name}"` });
  }

  if (transport === "stdio") {
    // command must be a string
    const cmd = raw["command"] ?? raw["path"];
    if (typeof cmd !== "string" || cmd.trim() === "") {
      checks.push({ id: "command", severity: "fail", label: "Missing command", detail: "stdio servers require a 'command' string (the executable to run)." });
    } else {
      checks.push({ id: "command", severity: "pass", label: "Command present", detail: `command: "${cmd}"` });

      // Warn about dangerous flags in command string
      const dangerFlag = DANGEROUS_FLAGS.find((f) => cmd.includes(f));
      if (dangerFlag) {
        checks.push({ id: "cmd-flag", severity: "warn", label: `Dangerous flag in command`, detail: `"${dangerFlag}" disables SSL verification — only use in local dev environments.` });
      }
    }

    // args must be an array if present
    if (raw["args"] !== undefined) {
      if (!Array.isArray(raw["args"])) {
        checks.push({ id: "args-type", severity: "fail", label: "args must be an array", detail: `args is "${typeof raw["args"]}" — it must be a JSON array like ["--flag", "value"].` });
      } else {
        checks.push({ id: "args-type", severity: "pass", label: "args is an array", detail: `${(raw["args"] as unknown[]).length} argument(s)` });

        // Check for dangerous flags in args
        const args = raw["args"] as string[];
        const dangerArg = args.find((a) => typeof a === "string" && DANGEROUS_FLAGS.some((f) => a.includes(f)));
        if (dangerArg) {
          checks.push({ id: "args-flag", severity: "warn", label: "Dangerous flag in args", detail: `"${dangerArg}" disables SSL/TLS verification. Avoid in production.` });
        }

        // Check for hardcoded secrets in args
        const secretArg = args.find((a) => typeof a === "string" && looksLikeSecret(a));
        if (secretArg) {
          checks.push({ id: "args-secret", severity: "warn", label: "Possible secret in args", detail: `An arg looks like an API key or token. Move it to an env var instead.` });
        }
      }
    }

    // env must be an object if present
    if (raw["env"] !== undefined) {
      if (typeof raw["env"] !== "object" || Array.isArray(raw["env"])) {
        checks.push({ id: "env-type", severity: "fail", label: "env must be an object", detail: `env should be a JSON object like { "KEY": "value" }.` });
      } else {
        const env = raw["env"] as Record<string, unknown>;
        const envEntries = Object.entries(env);

        // Warn about empty env var values
        const emptyKeys = envEntries.filter(([, v]) => v === "" || v === null || v === undefined).map(([k]) => k);
        if (emptyKeys.length > 0) {
          checks.push({
            id: "env-empty",
            severity: "warn",
            label: `${emptyKeys.length} env var${emptyKeys.length > 1 ? "s" : ""} with no value`,
            detail: `These look like missing API keys: ${emptyKeys.map((k) => `"${k}"`).join(", ")}. Set them before the server will work.`,
          });
        } else if (envEntries.length > 0) {
          checks.push({ id: "env-ok", severity: "pass", label: "env vars present", detail: `${envEntries.length} env var(s) defined` });
        }

        // Warn about secrets hardcoded in env values
        const secretKey = envEntries.find(([, v]) => typeof v === "string" && looksLikeSecret(v as string));
        if (secretKey) {
          checks.push({ id: "env-secret", severity: "warn", label: "Possible secret value in env", detail: `"${secretKey[0]}" looks like a real API key hardcoded in the config. Consider using a placeholder and setting it separately.` });
        }
      }
    }

  } else if (transport === "http" || transport === "sse") {
    // URL must be a string and valid
    const url = raw["url"];
    if (typeof url !== "string" || url.trim() === "") {
      checks.push({ id: "url", severity: "fail", label: "Missing url", detail: "http/sse servers require a 'url' field with the endpoint address." });
    } else {
      try {
        const parsed = new URL(url);
        checks.push({ id: "url", severity: "pass", label: "URL is valid", detail: url });

        // Warn about non-HTTPS
        if (parsed.protocol === "http:") {
          checks.push({ id: "url-http", severity: "warn", label: "URL uses HTTP (not HTTPS)", detail: "Plain HTTP sends requests unencrypted. Use HTTPS for any real server." });
        }

        // Warn about IP-based URLs (could be misconfigured or suspicious)
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
          checks.push({ id: "url-ip", severity: "warn", label: "URL uses an IP address", detail: "IP-based MCP endpoints are unusual outside local development. Verify this is intentional." });
        }
      } catch {
        checks.push({ id: "url", severity: "fail", label: "URL is not valid", detail: `"${url}" could not be parsed as a URL.` });
      }
    }

    // headers should be an object if present
    if (raw["headers"] !== undefined) {
      if (typeof raw["headers"] !== "object" || Array.isArray(raw["headers"])) {
        checks.push({ id: "headers-type", severity: "fail", label: "headers must be an object", detail: `headers should be { "Header-Name": "value" }.` });
      } else {
        const headers = raw["headers"] as Record<string, unknown>;
        const secretHeader = Object.entries(headers).find(([, v]) => typeof v === "string" && looksLikeSecret(v as string));
        if (secretHeader) {
          checks.push({ id: "headers-secret", severity: "warn", label: "Possible secret in headers", detail: `"${secretHeader[0]}" looks like a real API key hardcoded in the config.` });
        } else {
          checks.push({ id: "headers-ok", severity: "pass", label: "Headers look valid", detail: `${Object.keys(headers).length} header(s) defined` });
        }
      }
    }

  } else {
    checks.push({ id: "transport", severity: "fail", label: "Cannot detect transport", detail: "Server must have either a 'command' (stdio) or 'url' (http/sse) field." });
  }

  // Unknown extra fields
  const known = new Set(["command", "path", "args", "env", "url", "headers", "type", "name"]);
  const unknown = Object.keys(raw).filter((k) => !known.has(k));
  if (unknown.length > 0) {
    checks.push({ id: "unknown-keys", severity: "warn", label: "Unrecognized fields", detail: `These keys are not part of the MCP spec and will be ignored: ${unknown.map((k) => `"${k}"`).join(", ")}` });
  }

  return { name, transport, checks };
}

function validate(input: string): ValidationResult {
  const data = JSON.parse(input.trim()) as Record<string, unknown>;
  const topLevelChecks: Check[] = [];
  let format = "Unknown";
  let rawServers: Record<string, Record<string, unknown>> = {};

  // Detect format
  if (data["mcpServers"] && typeof data["mcpServers"] === "object") {
    format = "Claude Desktop / Cursor / Windsurf";
    rawServers = data["mcpServers"] as Record<string, Record<string, unknown>>;
    topLevelChecks.push({ id: "format", severity: "pass", label: "Valid top-level format", detail: `mcpServers key detected (${Object.keys(rawServers).length} server(s))` });
  } else if (data["servers"] && typeof data["servers"] === "object") {
    format = "VS Code";
    rawServers = data["servers"] as Record<string, Record<string, unknown>>;
    topLevelChecks.push({ id: "format", severity: "pass", label: "Valid top-level format", detail: `servers key detected (${Object.keys(rawServers).length} server(s))` });
  } else if (data["context_servers"] && typeof data["context_servers"] === "object") {
    format = "Zed";
    rawServers = data["context_servers"] as Record<string, Record<string, unknown>>;
    topLevelChecks.push({ id: "format", severity: "pass", label: "Valid top-level format", detail: `context_servers key detected (${Object.keys(rawServers).length} server(s))` });
  } else if (data["command"] || data["url"]) {
    format = "Single server object";
    rawServers = { "mcp-server": data as Record<string, unknown> };
    topLevelChecks.push({ id: "format", severity: "warn", label: "Single server object (no wrapper)", detail: "This is a bare server definition. Most tools expect it wrapped in mcpServers: { name: { ... } }." });
  } else {
    topLevelChecks.push({ id: "format", severity: "fail", label: "Unrecognized top-level structure", detail: "Expected mcpServers, servers, or context_servers key at the top level." });
    return { format: "Unknown", servers: [], topLevelChecks };
  }

  if (Object.keys(rawServers).length === 0) {
    topLevelChecks.push({ id: "empty", severity: "warn", label: "No servers defined", detail: "The config is valid but contains zero server entries." });
  }

  const servers = Object.entries(rawServers).map(([name, raw]) => validateServer(name, raw));
  return { format, servers, topLevelChecks };
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const SEVERITY_COLOR: Record<Severity, string> = {
  pass: "#37d67a",
  warn: "#ffb020",
  fail: "#ff5454",
};

const SEVERITY_ICON: Record<Severity, string> = {
  pass: "✓",
  warn: "⚠",
  fail: "✗",
};

function CheckRow({ check }: { check: Check }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          color: SEVERITY_COLOR[check.severity],
          fontWeight: 800,
          fontSize: 13,
          flexShrink: 0,
          width: 16,
          marginTop: 1,
        }}
      >
        {SEVERITY_ICON[check.severity]}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>
          {check.label}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2, lineHeight: 1.5 }}>
          {check.detail}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ checks }: { checks: Check[] }) {
  const fails = checks.filter((c) => c.severity === "fail").length;
  const warns = checks.filter((c) => c.severity === "warn").length;
  if (fails > 0) return <span className="validator-badge validator-badge--fail">{fails} error{fails > 1 ? "s" : ""}</span>;
  if (warns > 0) return <span className="validator-badge validator-badge--warn">{warns} warning{warns > 1 ? "s" : ""}</span>;
  return <span className="validator-badge validator-badge--pass">All checks passed</span>;
}

const PLACEHOLDER = `{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer "
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/Downloads"]
    }
  }
}`;

export function ValidatorTool() {
  const [input, setInput] = useState("");

  let result: ValidationResult | null = null;
  let parseError: string | null = null;

  if (input.trim()) {
    if (!input.trim().startsWith("{") && !input.trim().startsWith("[")) {
      parseError = "Input must be a JSON object. Paste a config file contents (not a command or URL).";
    } else {
      try {
        result = validate(input);
      } catch (e) {
        parseError = `JSON parse error: ${(e as Error).message}`;
      }
    }
  }

  const allChecks = result
    ? [...result.topLevelChecks, ...result.servers.flatMap((s) => s.checks)]
    : [];
  const totalFails = allChecks.filter((c) => c.severity === "fail").length;
  const totalWarns = allChecks.filter((c) => c.severity === "warn").length;
  const totalPass = allChecks.filter((c) => c.severity === "pass").length;

  return (
    <div className="converter-shell">
      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="converter-panel">
        <div className="converter-panel-head">
          <span className="converter-panel-label">Input (JSON)</span>
          {result && <ScoreBadge checks={allChecks} />}
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

        {parseError && (
          <div className="converter-error">
            <span style={{ marginRight: 6 }}>⚠</span>
            {parseError}
          </div>
        )}

        {!input.trim() && (
          <div className="converter-hint">
            Paste any MCP JSON config — Claude Desktop, VS Code, Zed, or a single server object.
            The validator checks structure, missing fields, empty API keys, and common security
            issues.
          </div>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="converter-panel">
        <div className="converter-panel-head">
          <span className="converter-panel-label">Results</span>
          {result && (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {totalPass}✓ &nbsp;{totalWarns}⚠ &nbsp;{totalFails}✗
            </span>
          )}
        </div>

        {!result && !parseError && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "rgba(255,255,255,0.25)",
              fontSize: 14,
            }}
          >
            ← Paste a JSON config to validate it
          </div>
        )}

        {result && (
          <div style={{ padding: "12px 16px", overflowY: "auto" }}>
            {/* Top-level */}
            <div style={{ marginBottom: 20 }}>
              <div className="validator-section-title">
                Top-level structure · <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>{result.format}</span>
              </div>
              {result.topLevelChecks.map((c) => (
                <CheckRow key={c.id} check={c} />
              ))}
            </div>

            {/* Per-server */}
            {result.servers.map((srv) => {
              const srvFails = srv.checks.filter((c) => c.severity === "fail").length;
              const srvWarns = srv.checks.filter((c) => c.severity === "warn").length;
              return (
                <div key={srv.name} style={{ marginBottom: 20 }}>
                  <div
                    className="validator-section-title"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>{srv.name}</span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 7px",
                        borderRadius: 4,
                        background:
                          srv.transport === "stdio"
                            ? "rgba(55,214,122,0.12)"
                            : "rgba(79,156,255,0.12)",
                        color:
                          srv.transport === "stdio" ? "#37d67a" : "#60a5fa",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {srv.transport}
                    </span>
                    {srvFails > 0 && (
                      <span style={{ fontSize: 11, color: "#ff5454", fontWeight: 700, marginLeft: "auto" }}>
                        {srvFails} error{srvFails > 1 ? "s" : ""}
                      </span>
                    )}
                    {srvFails === 0 && srvWarns > 0 && (
                      <span style={{ fontSize: 11, color: "#ffb020", fontWeight: 700, marginLeft: "auto" }}>
                        {srvWarns} warning{srvWarns > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {srv.checks.map((c) => (
                    <CheckRow key={c.id} check={c} />
                  ))}
                </div>
              );
            })}

            {/* Summary */}
            <div
              style={{
                marginTop: 8,
                padding: "14px 16px",
                borderRadius: 10,
                background:
                  totalFails > 0
                    ? "rgba(255,84,84,0.07)"
                    : totalWarns > 0
                    ? "rgba(255,176,32,0.07)"
                    : "rgba(55,214,122,0.07)",
                border: `1px solid ${
                  totalFails > 0
                    ? "rgba(255,84,84,0.25)"
                    : totalWarns > 0
                    ? "rgba(255,176,32,0.25)"
                    : "rgba(55,214,122,0.25)"
                }`,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color:
                    totalFails > 0 ? "#ff8080" : totalWarns > 0 ? "#ffcc66" : "#37d67a",
                  marginBottom: 4,
                }}
              >
                {totalFails > 0
                  ? `${totalFails} error${totalFails > 1 ? "s" : ""} must be fixed`
                  : totalWarns > 0
                  ? `Config is valid — ${totalWarns} warning${totalWarns > 1 ? "s" : ""} to review`
                  : "Config looks good — no issues found"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {totalPass} check{totalPass !== 1 ? "s" : ""} passed ·{" "}
                {totalWarns} warning{totalWarns !== 1 ? "s" : ""} ·{" "}
                {totalFails} error{totalFails !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
