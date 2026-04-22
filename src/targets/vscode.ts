import os from 'node:os'
import path from 'node:path'
import { onPath, appExists } from '../core/detect.ts'
import { mergeJson } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToVsCodeShape } from './_base.ts'

// macOS user-level MCP config (inside VS Code profile)
const userPath = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'Code',
  'User',
  'mcp.json'
)
const projectPath = path.join(process.cwd(), '.vscode', 'mcp.json')

export const vscode: Target = {
  id: 'vscode',
  company: 'Microsoft',
  name: 'VS Code',
  scopes: ['user', 'project'],

  detect() {
    return onPath('code') || appExists('Visual Studio Code')
  },

  configPath(scope: Scope) {
    return scope === 'user' ? userPath : projectPath
  },

  toNative(ir: IR) {
    return irToVsCodeShape(ir)
  },

  write(scope: Scope, ir: IR, dryRun: boolean) {
    const filePath = this.configPath(scope)
    // VS Code uses "servers" not "mcpServers"
    return mergeJson(filePath, 'servers', ir.name, this.toNative(ir), dryRun)
  },

  restartHint: 'Run "Developer: Reload Window" in VS Code (Cmd+Shift+P).',
}
