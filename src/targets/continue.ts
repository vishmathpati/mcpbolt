import os from 'node:os'
import path from 'node:path'
import { dirExists } from '../core/detect.ts'
import { mergeYamlArray } from '../core/merger.ts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from './_base.ts'

const userPath = path.join(os.homedir(), '.continue', 'config.yaml')

export const continueDev: Target = {
  id: 'continue',
  company: 'Continue',
  name: 'Continue',
  scopes: ['user'],

  detect() {
    return dirExists('.continue')
  },

  configPath(_scope: Scope) {
    return userPath
  },

  toNative(ir: IR): unknown {
    if (ir.transport === 'stdio') {
      return {
        command: ir.command,
        ...(ir.args?.length ? { args: ir.args } : {}),
        ...(ir.env && Object.keys(ir.env).length ? { env: ir.env } : {}),
      }
    }
    return {
      url: ir.url,
      ...(ir.headers && Object.keys(ir.headers).length ? { headers: ir.headers } : {}),
    }
  },

  write(scope: Scope, ir: IR, dryRun: boolean) {
    // Continue uses an array under "mcpServers" key; mergeYamlArray handles name-based upsert
    return mergeYamlArray(userPath, 'mcpServers', ir.name, this.toNative(ir), dryRun)
  },
}
