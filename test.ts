import { autoparse } from './src/parsers/index.ts'
import { ALL_TARGETS } from './src/targets/index.ts'
import type { IR } from './src/core/ir.ts'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'

function ok(s: string) { console.log(`  ${GREEN}✓${RESET} ${s}`) }
function fail(s: string) { console.log(`  ${RED}✗${RESET} ${s}`) }
function header(s: string) { console.log(`\n${BOLD}${s}${RESET}`) }
function sub(s: string) { console.log(`  ${DIM}${s}${RESET}`) }

// ─── PARSER TESTS ─────────────────────────────────────────────────────────────

header('1. Parsers')

const cases: { label: string; input: string }[] = [
  {
    label: 'Claude Desktop JSON (mcpServers)',
    input: JSON.stringify({
      mcpServers: {
        filesystem: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'] },
      },
    }),
  },
  {
    label: 'VS Code JSON (servers + type)',
    input: JSON.stringify({
      servers: {
        playwright: { type: 'stdio', command: 'npx', args: ['-y', '@playwright/mcp'] },
      },
    }),
  },
  {
    label: 'Zed JSON (context_servers)',
    input: JSON.stringify({
      context_servers: {
        myserver: { command: { path: 'npx', args: ['-y', 'mcp-server-git'] }, settings: {} },
      },
    }),
  },
  {
    label: 'HTTP remote (url + headers)',
    input: JSON.stringify({
      mcpServers: {
        github: { url: 'https://api.githubcopilot.com/mcp', headers: { Authorization: 'Bearer tok' } },
      },
    }),
  },
  {
    label: 'npx one-liner command',
    input: 'npx -y @modelcontextprotocol/server-filesystem /Users/me/projects',
  },
  {
    label: 'docker command',
    input: 'docker run -i --rm mcp/brave-search',
  },
  {
    label: 'bare HTTPS URL',
    input: 'https://mcp.example.com/sse',
  },
  {
    label: 'Continue YAML (mcpServers array)',
    input: `mcpServers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
    env:
      HOME: /tmp`,
  },
  {
    label: 'Codex TOML ([mcp_servers.*])',
    input: `[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem"]`,
  },
]

const parsed: { label: string; ir: IR }[] = []

for (const { label, input } of cases) {
  try {
    const result = autoparse(input)
    const ir = result.servers[0]!
    parsed.push({ label, ir })
    ok(`${CYAN}${label}${RESET}`)
    sub(`format: ${result.detectedFormat}`)
    sub(`name: ${ir.name}  transport: ${ir.transport}`)
    if (ir.command) sub(`command: ${ir.command} ${(ir.args ?? []).join(' ')}`)
    if (ir.url) sub(`url: ${ir.url}`)
    if (ir.env) sub(`env: ${JSON.stringify(ir.env)}`)
  } catch (e) {
    fail(`${label}: ${(e as Error).message}`)
  }
}

// ─── TARGET DETECTION ─────────────────────────────────────────────────────────

header('2. Installed tool detection')

for (const target of ALL_TARGETS) {
  const detected = target.detect()
  const mark = detected ? `${GREEN}✓ detected${RESET}` : `${DIM}○ not found${RESET}`
  console.log(`  ${mark}  ${BOLD}${target.company}${RESET} — ${target.name}`)
  for (const scope of target.scopes) {
    sub(`${scope}: ${target.configPath(scope)}`)
  }
}

// ─── NATIVE SHAPE CONVERSION ───────────────────────────────────────────────────

header('3. Native shape output per target')

// Use the filesystem stdio server as the test IR
const testIR: IR = {
  name: 'filesystem',
  transport: 'stdio',
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
  env: { ALLOWED_DIRS: '/tmp' },
}

for (const target of ALL_TARGETS) {
  try {
    const native = target.toNative(testIR)
    ok(`${target.name}`)
    sub(JSON.stringify(native))
  } catch (e) {
    fail(`${target.name}: ${(e as Error).message}`)
  }
}

// ─── DRY-RUN WRITE ────────────────────────────────────────────────────────────

header('4. Dry-run write (no files touched)')

for (const target of ALL_TARGETS) {
  for (const scope of target.scopes) {
    try {
      target.write(scope, testIR, true /* dryRun */)
      ok(`${target.name} (${scope}) → ${DIM}${target.configPath(scope)}${RESET}`)
    } catch (e) {
      // Dry run may fail if TOML/YAML stringify has an issue — flag it
      fail(`${target.name} (${scope}): ${(e as Error).message}`)
    }
  }
}

console.log(`\n${GREEN}${BOLD}All tests complete.${RESET}\n`)
