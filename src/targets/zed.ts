import os from 'node:os'
import path from 'node:path'
import { dirExists, appExists } from '../core/detect.ts'
import { mergeJsonNested } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToZedShape } from './_base.ts'

const userPath = path.join(os.homedir(), '.config', 'zed', 'settings.json')
const projectPath = path.join(process.cwd(), '.zed', 'settings.json')

export const zed: Target = {
  id: 'zed',
  company: 'Zed',
  name: 'Zed',
  scopes: ['user', 'project'],

  detect() {
    return dirExists('.config', 'zed') || appExists('Zed')
  },

  configPath(scope: Scope) {
    return scope === 'user' ? userPath : projectPath
  },

  toNative(ir: IR) {
    return irToZedShape(ir)
  },

  write(scope: Scope, ir: IR, dryRun: boolean) {
    const filePath = this.configPath(scope)
    // Zed stores MCPs under "context_servers" inside the broader settings.json
    return mergeJsonNested(filePath, ['context_servers'], ir.name, this.toNative(ir), dryRun)
  },

  restartHint: 'Restart Zed to pick up the new context server.',
}
