import type { IR } from '../core/ir.ts'

// Parse a raw command string like:
//   npx -y @modelcontextprotocol/server-filesystem /path
//   docker run -i --rm mcp/server
//   uvx mcp-server-git
//   python -m some_mcp_server
//   https://api.example.com/mcp
export function parseCommand(input: string): IR | null {
  const trimmed = input.trim()

  // Bare URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { name: urlToName(trimmed), transport: 'http', url: trimmed }
  }

  // Shell command — split respecting basic quoting
  const tokens = shellSplit(trimmed)
  if (tokens.length === 0) return null

  const command = tokens[0]!
  const args = tokens.slice(1)

  // Derive a human-readable name from the package/image
  const name = deriveNameFromCommand(command, args)

  return { name, transport: 'stdio', command, args }
}

function urlToName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^api\./, '')
  } catch {
    return 'remote-mcp'
  }
}

function deriveNameFromCommand(command: string, args: string[]): string {
  // npx -y @scope/pkg or npx -y pkg
  if (command === 'npx' || command === 'bunx') {
    const pkg = args.find((a) => !a.startsWith('-'))
    if (pkg) return pkg.replace(/^@[^/]+\//, '').replace(/^mcp-?server-?/, '')
  }

  // uvx pkg or pipx run pkg
  if (command === 'uvx' || command === 'pipx') {
    const pkg = args.find((a) => !a.startsWith('-'))
    if (pkg) return pkg.replace(/^mcp-?/, '')
  }

  // docker run ... image:tag
  if (command === 'docker') {
    const image = args[args.length - 1]
    if (image) return image.split('/').pop()?.split(':')[0] ?? 'docker-mcp'
  }

  return command
}

// Minimal shell tokenizer: handles single/double quoted strings
function shellSplit(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inSingle = false
  let inDouble = false

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!
    if (ch === "'" && !inDouble) { inSingle = !inSingle; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; continue }
    if (ch === ' ' && !inSingle && !inDouble) {
      if (current) { tokens.push(current); current = '' }
      continue
    }
    current += ch
  }
  if (current) tokens.push(current)
  return tokens
}
