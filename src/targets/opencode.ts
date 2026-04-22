import os from 'node:os'
import path from 'node:path'
import { dirExists, onPath } from '../core/detect.ts'
import { mergeJson, removeJson } from '../core/merger.ts'
import { readJsonServers } from '../core/reader.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'

// sst/opencode — global config stores MCP servers under `mcp`.
// Per-server shape uses { type: "local" | "remote", command: [...] | url } which
// differs from Claude Desktop's { command, args }. We translate IR -> opencode.
const userPath = path.join(os.homedir(), '.config', 'opencode', 'opencode.json')
const projectPath = path.join(process.cwd(), 'opencode.json')

function irToOpencodeShape(ir: IR): unknown {
  if (ir.transport === 'stdio') {
    const cmd = [ir.command, ...(ir.args ?? [])].filter(Boolean) as string[]
    return {
      type: 'local',
      command: cmd,
      ...(ir.env && Object.keys(ir.env).length ? { environment: ir.env } : {}),
    }
  }
  return {
    type: 'remote',
    url: ir.url,
    ...(ir.headers && Object.keys(ir.headers).length ? { headers: ir.headers } : {}),
  }
}

export const opencode: Target = {
  id: 'opencode',
  company: 'SST',
  name: 'opencode',
  scopes: ['user', 'project'],

  detect() {
    return onPath('opencode') || dirExists('.config', 'opencode')
  },

  configPath(scope: Scope) {
    return scope === 'user' ? userPath : projectPath
  },

  toNative(ir: IR) {
    return irToOpencodeShape(ir)
  },

  write(scope: Scope, ir: IR, dryRun: boolean) {
    const filePath = this.configPath(scope)
    return mergeJson(filePath, 'mcp', ir.name, this.toNative(ir), dryRun)
  },

  readServers(scope: Scope) {
    return readJsonServers(this.configPath(scope), 'mcp')
  },

  remove(scope: Scope, name: string, dryRun: boolean) {
    return removeJson(this.configPath(scope), 'mcp', name, dryRun)
  },

  restartHint: 'Restart your opencode session (exit and re-run `opencode`) to pick up the new server.',
}
