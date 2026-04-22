import path from 'node:path'
import { fileExists } from '../core/detect.ts'
import { mergeJson } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToClaudeShape } from './_base.ts'

const projectPath = path.join(process.cwd(), '.roo', 'mcp.json')

export const roo: Target = {
  id: 'roo',
  company: 'Roo Code',
  name: 'Roo Code',
  scopes: ['project'],

  detect() {
    return fileExists(path.join(process.cwd(), '.roo'))
  },

  configPath(_scope: Scope) {
    return projectPath
  },

  toNative(ir: IR) {
    return irToClaudeShape(ir)
  },

  write(scope: Scope, ir: IR, dryRun: boolean) {
    return mergeJson(projectPath, 'mcpServers', ir.name, this.toNative(ir), dryRun)
  },
}
