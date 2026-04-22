import type { Target } from './_base.ts'
import { claudeDesktop } from './claude-desktop.ts'
import { claudeCode } from './claude-code.ts'
import { cursor } from './cursor.ts'
import { vscode } from './vscode.ts'
import { codex } from './codex.ts'
import { windsurf } from './windsurf.ts'
import { zed } from './zed.ts'
import { continueDev } from './continue.ts'
import { gemini } from './gemini.ts'
import { roo } from './roo.ts'
import { opencode } from './opencode.ts'
import { cline } from './cline.ts'

export const ALL_TARGETS: Target[] = [
  claudeDesktop,
  claudeCode,
  cursor,
  vscode,
  codex,
  windsurf,
  zed,
  continueDev,
  gemini,
  roo,
  opencode,
  cline,
]

export function getTarget(id: string): Target | undefined {
  return ALL_TARGETS.find((t) => t.id === id)
}
