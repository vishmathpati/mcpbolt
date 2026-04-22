import type { IR, Transport } from '../core/ir.ts'

type RawServer = Record<string, unknown>

function rawToIR(name: string, raw: RawServer): IR {
  // VS Code format has explicit "type" field
  const transport: Transport =
    typeof raw['type'] === 'string' && (raw['type'] === 'http' || raw['type'] === 'sse')
      ? raw['type']
      : typeof raw['url'] === 'string'
        ? 'http'
        : 'stdio'

  const ir: IR = { name, transport }

  if (transport === 'stdio') {
    if (typeof raw['command'] === 'string') ir.command = raw['command']
    if (Array.isArray(raw['args'])) ir.args = raw['args'] as string[]
    if (raw['env'] && typeof raw['env'] === 'object') ir.env = raw['env'] as Record<string, string>
  } else {
    if (typeof raw['url'] === 'string') ir.url = raw['url']
    if (raw['headers'] && typeof raw['headers'] === 'object')
      ir.headers = raw['headers'] as Record<string, string>
  }

  return ir
}

// Parse the Zed "command" wrapper: { command: { path, args, env } }
function rawZedToIR(name: string, raw: RawServer): IR {
  const cmd = raw['command'] as RawServer | undefined
  if (cmd && typeof cmd === 'object') {
    return rawToIR(name, {
      command: cmd['path'],
      args: cmd['args'],
      env: cmd['env'],
    })
  }
  if (typeof raw['url'] === 'string') {
    return rawToIR(name, { url: raw['url'] })
  }
  return rawToIR(name, raw)
}

export function parseJson(input: string): IR[] {
  const data = JSON.parse(input) as Record<string, unknown>

  // Claude Desktop / Cursor / Windsurf / Gemini / Roo style
  if (data['mcpServers'] && typeof data['mcpServers'] === 'object') {
    const servers = data['mcpServers'] as Record<string, RawServer>
    return Object.entries(servers).map(([name, raw]) => rawToIR(name, raw))
  }

  // VS Code style
  if (data['servers'] && typeof data['servers'] === 'object') {
    const servers = data['servers'] as Record<string, RawServer>
    return Object.entries(servers).map(([name, raw]) => rawToIR(name, raw))
  }

  // Zed style
  if (data['context_servers'] && typeof data['context_servers'] === 'object') {
    const servers = data['context_servers'] as Record<string, RawServer>
    return Object.entries(servers).map(([name, raw]) => rawZedToIR(name, raw))
  }

  // Bare single-server object — user pasted just one entry
  if (data['command'] || data['url']) {
    const name = (data['name'] as string | undefined) ?? 'mcp-server'
    return [rawToIR(name, data as RawServer)]
  }

  throw new Error('Unrecognized JSON shape — expected mcpServers, servers, or context_servers key')
}
