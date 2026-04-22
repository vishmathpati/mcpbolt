import readline from 'node:readline'
import { input, confirm, checkbox, select } from '@inquirer/prompts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from '../targets/_base.ts'
import { c } from './display.ts'

// Read multi-line paste — no per-line prompt noise, just capture until Ctrl+D or double blank line
export async function readPaste(): Promise<string> {
  console.log(c.dim('  Paste your MCP config below, then press Ctrl+D when done:'))
  console.log()

  const lines: string[] = []
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity })

  return new Promise((resolve) => {
    rl.on('line', (line) => {
      // Two consecutive blank lines = done
      if (line === '' && lines.length > 0 && lines[lines.length - 1] === '') {
        rl.close()
        return
      }
      lines.push(line)
    })

    rl.on('close', () => {
      // Strip trailing blank lines and any stray prompt characters (> at start of line)
      const cleaned = lines
        .map((l) => l.replace(/^\s*>\s?/, '').trimEnd())
        .filter((l, i, arr) => !(l === '' && i === arr.length - 1))
      while (cleaned.length > 0 && cleaned[cleaned.length - 1] === '') cleaned.pop()
      resolve(cleaned.join('\n'))
    })
  })
}

// Ask user to confirm or rename the detected server name
export async function promptServerName(detected: string): Promise<string> {
  return input({
    message: 'Server name',
    default: detected,
  })
}

export type TargetSelection = {
  target: Target
  scope: Scope
}

// Only show detected/installed tools. Nothing pre-checked.
// Space = toggle, A = select all, Enter = confirm
export async function promptTargets(targets: Target[]): Promise<TargetSelection[]> {
  const installedTargets = targets.filter((t) => t.detect())

  if (installedTargets.length === 0) {
    throw new Error('No supported tools detected on this machine.')
  }

  const companies = [...new Set(installedTargets.map((t) => t.company))]
  const choices: Array<{ name: string; value: string; checked: boolean }> = []

  for (const company of companies) {
    const companyTargets = installedTargets.filter((t) => t.company === company)
    for (const target of companyTargets) {
      for (const scope of target.scopes) {
        choices.push({
          name: `${c.bold(target.company)}  ${target.name} ${c.dim(scope === 'user' ? '(global)' : '(this project)')}`,
          value: `${target.id}:${scope}`,
          checked: false,
        })
      }
    }
  }

  console.log()
  console.log(c.dim(`  ${installedTargets.length} tools detected on this machine.`))
  console.log(c.dim('  Space = toggle  ·  A = select all  ·  Enter = confirm'))
  console.log()

  const selected = await checkbox({
    message: 'Select targets to install into',
    choices,
    pageSize: 20,
  })

  return selected.map((val) => {
    const [id, scope] = val.split(':') as [string, Scope]
    const target = targets.find((t) => t.id === id)!
    return { target, scope }
  })
}

// If env vars look empty or placeholder, prompt for real values
export async function promptEnvValues(ir: IR): Promise<IR> {
  if (!ir.env || Object.keys(ir.env).length === 0) return ir

  const emptyKeys = Object.entries(ir.env)
    .filter(([, v]) => !v || v.startsWith('$') || v === '<YOUR_API_KEY>')
    .map(([k]) => k)

  if (emptyKeys.length === 0) return ir

  console.log()
  console.log(c.dim('  Some env vars need values:'))

  const filled = { ...ir.env }
  for (const key of emptyKeys) {
    const val = await input({ message: `  ${key}`, default: '' })
    if (val) filled[key] = val
  }

  return { ...ir, env: filled }
}

export async function promptDryRun(): Promise<boolean> {
  return confirm({ message: 'Preview changes before writing?', default: true })
}

export async function promptConfirm(): Promise<boolean> {
  return confirm({ message: 'Write files now?', default: true })
}

export async function promptContinueOnMultiple(servers: IR[]): Promise<IR> {
  if (servers.length === 1) return servers[0]!

  const choice = await select({
    message: `Found ${servers.length} servers — pick one to install now`,
    choices: servers.map((s) => ({ name: s.name, value: s })),
  })
  return choice
}
