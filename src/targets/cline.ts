import os from 'node:os'
import path from 'node:path'
import { fileExists } from '../core/detect.ts'
import { mergeJson, removeJson } from '../core/merger.ts'
import { readJsonServers } from '../core/reader.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'
import { irToClaudeShape } from './_base.ts'

// Cline is a VS Code extension (saoudrizwan.claude-dev) that stores its
// MCP config inside VS Code's globalStorage for the extension.
const configPath = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'Code',
  'User',
  'globalStorage',
  'saoudrizwan.claude-dev',
  'settings',
  'cline_mcp_settings.json'
)

export const cline: Target = {
  id: 'cline',
  company: 'Cline',
  name: 'Cline',
  scopes: ['user'],

  detect() {
    return fileExists(configPath) || fileExists(
      path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'Code',
        'User',
        'globalStorage',
        'saoudrizwan.claude-dev'
      )
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

  readServers(_scope: Scope) {
    return readJsonServers(configPath, 'mcpServers')
  },

  remove(_scope: Scope, name: string, dryRun: boolean) {
    return removeJson(configPath, 'mcpServers', name, dryRun)
  },

  restartHint: 'Reload VS Code (Cmd+Shift+P → "Developer: Reload Window") to pick up the new server.',
}
