import os from 'node:os'
import path from 'node:path'
import { appExists, dirExists } from '../core/detect.ts'
import { mergeJson } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToClaudeShape } from './_base.ts'

const configPath = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'Claude',
  'claude_desktop_config.json'
)

export const claudeDesktop: Target = {
  id: 'claude-desktop',
  company: 'Anthropic',
  name: 'Claude Desktop',
  scopes: ['user'],

  detect() {
    return (
      dirExists('Library', 'Application Support', 'Claude') || appExists('Claude')
    )
  },

  configPath(_scope: Scope) {
    return configPath
  },

  toNative(ir: IR) {
    return irToClaudeShape(ir)
  },

  write(scope: Scope, ir: IR, dryRun: boolean) {
    return mergeJson(configPath, 'mcpServers', ir.name, this.toNative(ir), dryRun)
  },

  restartHint: 'Quit and reopen Claude Desktop to load the new server.',
}
