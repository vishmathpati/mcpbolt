import os from 'node:os'
import path from 'node:path'
import { onPath, dirExists } from '../core/detect.ts'
import { mergeToml } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToCodexShape } from './_base.ts'

const userPath = path.join(os.homedir(), '.codex', 'config.toml')
const projectPath = path.join(process.cwd(), '.codex', 'config.toml')

export const codex: Target = {
  id: 'codex',
  company: 'OpenAI',
  name: 'Codex CLI',
  scopes: ['user', 'project'],

  detect() {
    return onPath('codex') || dirExists('.codex')
  },

  configPath(scope: Scope) {
    return scope === 'user' ? userPath : projectPath
  },

  toNative(ir: IR) {
    return irToCodexShape(ir)
  },

  write(scope: Scope, ir: IR, dryRun: boolean) {
    const filePath = this.configPath(scope)
    return mergeToml(filePath, 'mcp_servers', ir.name, this.toNative(ir), dryRun)
  },
}
