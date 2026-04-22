import { ALL_TARGETS } from '../targets/index.ts'
import type { ServerEntry } from '../core/reader.ts'
import { c } from './display.ts'

const ABBR: Record<string, string> = {
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
      label: ABBR[target.id] ?? target.name,
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

  // ── Per-tool view ──────────────────────────────────────────────────────────
  console.log(c.bold('  By tool'))
  console.log(c.dim('  ' + '─'.repeat(60)))

  for (const tool of detectedTools) {
    console.log()
    console.log(`  ${c.bold(tool.label)}  ${c.dim(tool.servers.length + ' server' + (tool.servers.length !== 1 ? 's' : ''))}`)
    if (tool.servers.length === 0) {
      console.log(c.dim('    none'))
    } else {
      for (const s of tool.servers) {
        const tag   = s.transport === 'stdio' ? c.dim('stdio') : c.cyan(s.transport)
        const detail = s.transport === 'stdio'
          ? c.dim((`${s.command ?? ''} ${(s.args ?? []).join(' ')}`).trim().slice(0, 55))
          : c.dim((s.url ?? '').slice(0, 55))
        console.log(`    ${c.bold(s.name.padEnd(24))} ${tag.padEnd(5)}  ${detail}`)
      }
    }
  }

  // ── Coverage view ──────────────────────────────────────────────────────────
  console.log()
  console.log()
  console.log(c.bold('  By server') + c.dim('  (which tools have it)'))
  console.log(c.dim('  ' + '─'.repeat(60)))
  console.log()

  const NAME_W = 26

  for (const serverName of allServerNames) {
    const toolsWithIt = detectedTools.filter(t => t.servers.some(s => s.name === serverName))
    const toolsWithout = detectedTools.filter(t => !t.servers.some(s => s.name === serverName))

    const name = serverName.length > NAME_W
      ? serverName.slice(0, NAME_W - 1) + '…'
      : serverName.padEnd(NAME_W)

    const have = toolsWithIt.map(t => c.green(t.label)).join(c.dim('  '))
    const miss = toolsWithout.length > 0
      ? c.dim('  missing: ') + toolsWithout.map(t => c.dim(t.label)).join(c.dim(', '))
      : ''

    console.log(`  ${c.bold(name)}  ${have}${miss}`)
  }

  console.log()
  console.log(c.dim(`  ${allServerNames.length} servers  ·  ${detectedTools.length} tools detected`))
  console.log()
}
