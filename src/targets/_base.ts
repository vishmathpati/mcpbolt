import type { IR } from '../core/ir.ts'

export type Scope = 'user' | 'project'

export interface Target {
  id: string
  company: string
  name: string
  scopes: Scope[]
  detect(): boolean
  configPath(scope: Scope): string
  // Returns the server config object in this tool's native shape
  toNative(ir: IR): unknown
  // Writes IR into the config file; returns change description
  write(scope: Scope, ir: IR, dryRun: boolean): string
  restartHint?: string
}

// Standard "Claude Desktop shape": { command, args, env } or { url, headers }
export function irToClaudeShape(ir: IR): unknown {
  if (ir.transport === 'stdio') {
    return {
      command: ir.command,
      ...(ir.args?.length ? { args: ir.args } : {}),
      ...(ir.env && Object.keys(ir.env).length ? { env: ir.env } : {}),
    }
  }
  return {
    url: ir.url,
    ...(ir.headers && Object.keys(ir.headers).length ? { headers: ir.headers } : {}),
  }
}

// VS Code shape: { type, command, args, env } or { type, url, headers }
export function irToVsCodeShape(ir: IR): unknown {
  if (ir.transport === 'stdio') {
    return {
      type: 'stdio',
      command: ir.command,
      ...(ir.args?.length ? { args: ir.args } : {}),
      ...(ir.env && Object.keys(ir.env).length ? { env: ir.env } : {}),
    }
  }
  return {
    type: ir.transport,
    url: ir.url,
    ...(ir.headers && Object.keys(ir.headers).length ? { headers: ir.headers } : {}),
  }
}

// Zed shape: { command: { path, args, env } } or { url }
export function irToZedShape(ir: IR): unknown {
  if (ir.transport === 'stdio') {
    return {
      command: {
        path: ir.command,
        args: ir.args ?? [],
        ...(ir.env && Object.keys(ir.env).length ? { env: ir.env } : {}),
      },
      settings: {},
    }
  }
  return { url: ir.url, settings: {} }
}

// Codex TOML shape: { command, args, env }
export function irToCodexShape(ir: IR): unknown {
  if (ir.transport === 'stdio') {
    return {
      command: ir.command,
      ...(ir.args?.length ? { args: ir.args } : {}),
      ...(ir.env && Object.keys(ir.env).length ? { env: ir.env } : {}),
    }
  }
  return {
    url: ir.url,
    ...(ir.headers && Object.keys(ir.headers).length ? { headers: ir.headers } : {}),
  }
}
