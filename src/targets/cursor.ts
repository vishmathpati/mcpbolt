import os from 'node:os'
import path from 'node:path'
import { dirExists, appExists } from '../core/detect.ts'
import { mergeJson } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToClaudeShape } from './_base.ts'

const userPath = path.join(os.homedir(), '.cursor', 'mcp.json')
const projectPath = path.join(process.cwd(), '.cursor', 'mcp.json')

export const cursor: Target = {
  id: 'cursor',
  company: 'Cursor',
  name: 'Cursor',
  scopes: ['user', 'project'],

  detect() {
    return dirExists('.cursor') || appExists('Cursor')
  },

  configPath(scope: Scope) {
    return scope === 'user' ? userPath : projectPath
  },

  toNative(ir: IR) {
    return irToClaudeShape(ir)
  },

  write(scope: Scope, ir: IR, dryRun: boolean) {
    const filePath = this.configPath(scope)
    return mergeJson(filePath, 'mcpServers', ir.name, this.toNative(ir), dryRun)
  },

  restartHint: 'Open Cursor → Settings → MCP and click Refresh to activate.',
}
