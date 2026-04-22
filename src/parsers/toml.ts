import { parse } from 'smol-toml'
import type { IR } from '../core/ir.ts'

export function parseToml(input: string): IR[] {
  const data = parse(input) as Record<string, unknown>

  // Codex style: [mcp_servers.<name>]
  const table = data['mcp_servers']
  if (table && typeof table === 'object') {
    return Object.entries(table as Record<string, unknown>).map(([name, raw]) => {
      const entry = raw as Record<string, unknown>
      const ir: IR = {
        name,
        transport: typeof entry['url'] === 'string' ? 'http' : 'stdio',
      }
      if (ir.transport === 'stdio') {
        if (typeof entry['command'] === 'string') ir.command = entry['command']
        if (Array.isArray(entry['args'])) ir.args = entry['args'] as string[]
        if (entry['env'] && typeof entry['env'] === 'object')
          ir.env = entry['env'] as Record<string, string>
      } else {
        ir.url = entry['url'] as string
        if (entry['headers']) ir.headers = entry['headers'] as Record<string, string>
      }
      return ir
    })
  }

  throw new Error('Unrecognized TOML shape — expected [mcp_servers.<name>] table')
}
