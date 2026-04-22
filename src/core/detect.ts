import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execSync } from 'node:child_process'

export function home(...parts: string[]): string {
  return path.join(os.homedir(), ...parts)
}

export function onPath(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

export function dirExists(...parts: string[]): boolean {
  return fs.existsSync(home(...parts))
}

export function appExists(name: string): boolean {
  return fs.existsSync(`/Applications/${name}.app`)
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}
