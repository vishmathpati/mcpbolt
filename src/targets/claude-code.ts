import os from 'node:os'
import path from 'node:path'
import { onPath, fileExists } from '../core/detect.ts'
import { mergeJson } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToClaudeShape } from './_base.ts'

const userPath = path.join(os.homedir(), '.claude.json')
const projectPath = path.join(process.cwd(), '.mcp.json')

export const claudeCode: Target = {
  id: 'claude-code',
  company: 'Anthropic',
  name: 'Claude Code',
  scopes: ['user', 'project'],

  detect() {
    return onPath('claude') || fileExists(userPath)
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
}
