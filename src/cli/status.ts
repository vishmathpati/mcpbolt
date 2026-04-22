import { ALL_TARGETS } from '../targets/index.ts'
import type { ServerEntry } from '../core/reader.ts'
import { c } from './display.ts'

const LABEL: Record<string, string> = {
  'claude-desktop': 'Claude Desktop',
  'claude-code':    'Claude Code',
  'cursor':         'Cursor',
  'vscode':         'VS Code',
  'codex':          'Codex',
  'windsurf':       'Windsurf',
  'zed':            'Zed',
  'continue':       'Continue',
  'gemini':         'Gemini',
  'roo':            'Roo',
}

// Two-letter abbreviations used as grid column headers
const SHORT: Record<string, string> = {
  'claude-desktop': 'CD',
  'claude-code':    'CC',
  'cursor':         'Cu',
  'vscode':         'VS',
  'codex':          'Cx',
  'windsurf':       'Wi',
  'zed':            'Ze',
  'continue':       'Co',
  'gemini':         'Ge',
  'roo':            'Ro',
}

type ToolSummary = {
  id: string
  label: string
  detected: boolean
  servers: ServerEntry[]
}

export function runList(): void {
  console.log()
  console.log(c.bold('  mcpbolt list') + c.dim(' — MCP servers across your tools'))
  console.log()

  // Build one entry per logical tool (merge user + project scopes)
  const tools: ToolSummary[] = []
  for (const target of ALL_TARGETS) {
    const detected = target.detect()
    const merged = new Map<string, ServerEntry>()
    if (detected) {
      for (const scope of target.scopes) {
        for (const s of target.readServers(scope)) merged.set(s.name, s)
      }
    }
    tools.push({
      id: target.id,
      label: LABEL[target.id] ?? target.name,
      detected,
      servers: [...merged.values()],
    })
  }

  const detectedTools = tools.filter(t => t.detected)

  // All unique server names, sorted by how many tools have them (most first)
  const allServerNames = [...new Set(detectedTools.flatMap(t => t.servers.map(s => s.name)))]
    .sort((a, b) => {
      const ac = detectedTools.filter(t => t.servers.some(s => s.name === a)).length
      const bc = detectedTools.filter(t => t.servers.some(s => s.name === b)).length
      return bc - ac
    })

  if (allServerNames.length === 0) {
    console.log(c.dim('  No MCP servers installed yet. Run mcpbolt to install one.'))
    console.log()
    return
  }

  // ── By tool ───────────────────────────────────────────────────────────────
  console.log(c.bold('  By tool'))
  console.log(c.dim('  ' + '─'.repeat(60)))

  for (const tool of detectedTools) {
    console.log()
    console.log(`  ${c.bold(tool.label)}  ${c.dim(tool.servers.length + ' server' + (tool.servers.length !== 1 ? 's' : ''))}`)
    if (tool.servers.length === 0) {
      console.log(c.dim('    none'))
    } else {
      for (const s of tool.servers) {
        const tag    = s.transport === 'stdio' ? c.dim('stdio') : c.cyan(s.transport)
        // safe padding: compute extra spaces outside ANSI codes
        const tagPad = ' '.repeat(Math.max(0, 5 - s.transport.length))
        const detail = s.transport === 'stdio'
          ? c.dim((`${s.command ?? ''} ${(s.args ?? []).join(' ')}`).trim().slice(0, 55))
          : c.dim((s.url ?? '').slice(0, 55))
        console.log(`    ${c.bold(s.name.padEnd(24))} ${tag}${tagPad}  ${detail}`)
      }
    }
  }

  // ── Coverage grid ─────────────────────────────────────────────────────────
  //
  // Each column is exactly COL visible chars. We never run .padEnd()
  // on an ANSI string — spacing is done with plain literal spaces so
  // terminal columns stay in sync regardless of escape code length.
  //
  //   server name (NW chars)  |  CD  CC  Cu  VS  Cx  Wi  Ze  Co  Ge  Ro
  //   apifyvish               |   ●   ●   ●   ●   ·   ●   ●   ●   ●   ·
  //   supabase                |   ·   ●   ●   ●   ●   ●   ●   ●   ●   ·

  const COL = 4   // visible chars per grid column: 3 spaces + 1 symbol
  const NW  = 26  // server name column width

  console.log()
  console.log()
  console.log(c.bold('  Coverage') + c.dim('  ·  ● installed  ·  · not installed'))
  console.log(c.dim('  ' + '─'.repeat(60)))
  console.log()

  // Legend — 5 tools per row so it never wraps
  for (let i = 0; i < detectedTools.length; i += 5) {
    const chunk = detectedTools.slice(i, i + 5)
    const row = chunk
      .map(t => c.dim((SHORT[t.id] ?? '??') + '=') + t.label)
      .join(c.dim('  ·  '))
    console.log('  ' + row)
  }
  console.log()

  // Header row — blank name column + 2-char abbr right-aligned into COL-wide slot
  const hdrCells = detectedTools
    .map(t => (SHORT[t.id] ?? '??').padStart(COL))  // plain text, safe padStart
    .join('')
  console.log(c.dim('  ' + ' '.repeat(NW + 2) + hdrCells))

  // Data rows
  for (const serverName of allServerNames) {
    // padEnd on plain text — safe
    const name = serverName.length > NW
      ? serverName.slice(0, NW - 1) + '…'
      : serverName.padEnd(NW)

    // Each cell: 3 literal spaces + 1 colored symbol = 4 visible chars
    // (no padEnd on the colored char — spacing comes from the leading spaces)
    const cells = detectedTools
      .map(t => '   ' + (t.servers.some(s => s.name === serverName) ? c.green('●') : c.dim('·')))
      .join('')

    console.log('  ' + c.bold(name) + '  ' + cells)
  }

  console.log()
  console.log(c.dim(`  ${allServerNames.length} servers  ·  ${detectedTools.length} tools detected`))
  console.log()
}
