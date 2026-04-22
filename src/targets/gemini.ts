import os from 'node:os'
import path from 'node:path'
import { onPath, dirExists } from '../core/detect.ts'
import { mergeJson } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToClaudeShape } from './_base.ts'

const userPath = path.join(os.homedir(), '.gemini', 'settings.json')
const projectPath = path.join(process.cwd(), '.gemini', 'settings.json')

export const gemini: Target = {
  id: 'gemini',
  company: 'Google',
  name: 'Gemini CLI',
  scopes: ['user', 'project'],

  detect() {
    return onPath('gemini') || dirExists('.gemini')
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
