import { parse } from 'yaml'
import type { IR } from '../core/ir.ts'
import { parseJson } from './json.ts'

export function parseYaml(input: string): IR[] {
  const data = parse(input) as Record<string, unknown>

  // Continue style: mcpServers is an array
  if (Array.isArray(data['mcpServers'])) {
    return (data['mcpServers'] as Record<string, unknown>[]).map((entry) => {
      const name = (entry['name'] as string | undefined) ?? 'mcp-server'
      const ir: IR = {
        name,
        transport: typeof entry['url'] === 'string' ? 'http' : 'stdio',
      }
      if (ir.transport === 'stdio') {
        if (typeof entry['command'] === 'string') ir.command = entry['command']
        if (Array.isArray(entry['args'])) ir.args = entry['args'] as string[]
        if (entry['env']) ir.env = entry['env'] as Record<string, string>
      } else {
        ir.url = entry['url'] as string
        if (entry['headers']) ir.headers = entry['headers'] as Record<string, string>
      }
      return ir
    })
  }

  // If it looks like a JSON-compatible shape, delegate
  return parseJson(JSON.stringify(data))
}
