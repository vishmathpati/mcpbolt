import type { IR } from '../core/ir.ts'
import { parseJson } from './json.ts'
import { parseYaml } from './yaml.ts'
import { parseToml } from './toml.ts'
import { parseCommand } from './command.ts'

export type ParseResult = {
  servers: IR[]
  detectedFormat: string
}

export function autoparse(input: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Empty input')

  // 1. Try JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const servers = parseJson(trimmed)
      return { servers, detectedFormat: 'JSON (Claude Desktop / VS Code / Cursor / Zed)' }
    } catch {
      // fall through
    }
  }

  // 2. Try TOML (has [table] syntax)
  if (trimmed.includes('[mcp_servers') || trimmed.match(/^\[[\w.]+\]/m)) {
    try {
      const servers = parseToml(trimmed)
      return { servers, detectedFormat: 'TOML (Codex)' }
    } catch {
      // fall through
    }
  }

  // 3. Try YAML (has colon-value pairs or array items)
  if (trimmed.includes(':\n') || trimmed.includes(': ') || trimmed.startsWith('-')) {
    try {
      const servers = parseYaml(trimmed)
      return { servers, detectedFormat: 'YAML (Continue)' }
    } catch {
      // fall through
    }
  }

  // 4. Try raw command / URL
  const fromCommand = parseCommand(trimmed)
  if (fromCommand) {
    const format = trimmed.startsWith('http') ? 'URL' : 'command string'
    return { servers: [fromCommand], detectedFormat: format }
  }

  throw new Error(
    'Could not parse input. Accepted formats: JSON (mcpServers/servers/context_servers), YAML (Continue), TOML (Codex), npx/docker command, or URL.'
  )
}
