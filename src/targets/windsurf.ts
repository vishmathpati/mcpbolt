import os from 'node:os'
import path from 'node:path'
import { dirExists, appExists } from '../core/detect.ts'
import { mergeJson } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToClaudeShape } from './_base.ts'

const configPath = path.join(os.homedir(), '.codeium', 'windsurf', 'mcp_config.json')

export const windsurf: Target = {
  id: 'windsurf',
  company: 'Codeium',
  name: 'Windsurf',
  scopes: ['user'],

  detect() {
    return dirExists('.codeium', 'windsurf') || appExists('Windsurf')
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

  restartHint: 'Restart Windsurf or reload the Cascade panel.',
}
