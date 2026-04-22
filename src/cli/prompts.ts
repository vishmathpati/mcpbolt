import readline from 'node:readline'
import { input, confirm, checkbox, select } from '@inquirer/prompts'
import type { IR } from '../core/ir.ts'
import type { Target, Scope } from '../targets/_base.ts'
import { c } from './display.ts'

// Read multi-line paste from stdin — collects until two consecutive blank lines or Ctrl+D
export async function readPaste(): Promise<string> {
  process.stdout.write(
    c.dim('  Paste config below. Press Enter twice (or Ctrl+D) when done:\n\n  > ')
  )

  const lines: string[] = []
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity })

  return new Promise((resolve) => {
    rl.on('line', (line) => {
      // Two blank lines in a row = done
      if (line === '' && lines.length > 0 && lines[lines.length - 1] === '') {
        rl.close()
        return
      }
      lines.push(line)
      if (lines.length > 1) process.stdout.write('  > ')
    })

    rl.on('close', () => {
      // Strip trailing blank lines
      while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
      resolve(lines.join('\n'))
    })
  })
}

// Ask user to rename a server if needed
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

// Build grouped checkbox options; auto-detect installed tools and put them first
export async function promptTargets(targets: Target[]): Promise<TargetSelection[]> {
  // Group by company
  const companies = [...new Set(targets.map((t) => t.company))]

  const choices: Array<{ name: string; value: string; checked: boolean }> = []

  for (const company of companies) {
    const companyTargets = targets.filter((t) => t.company === company)
    for (const target of companyTargets) {
      const detected = target.detect()
      for (const scope of target.scopes) {
        const label =
          `${target.name} ${scope === 'user' ? '(global)' : '(this project)'}` +
          (detected ? '' : c.dim(' [not detected]'))
        choices.push({
          name: label,
          value: `${target.id}:${scope}`,
          checked: detected,
        })
      }
    }
  }

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

// If server has no env values filled in, prompt for them
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

export async function promptContinueOnMultiple(
  servers: IR[]
): Promise<IR> {
  if (servers.length === 1) return servers[0]!

  const choice = await select({
    message: `Found ${servers.length} servers — pick one to install now`,
    choices: servers.map((s) => ({ name: s.name, value: s })),
  })
  return choice
}
