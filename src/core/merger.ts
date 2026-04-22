import fs from 'node:fs'
import path from 'node:path'
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

// Strip // and /* */ comments while respecting string literals (JSONC support for Zed settings)
function stripJsonComments(src: string): string {
  let out = ''
  let i = 0
  let inString = false

  while (i < src.length) {
    const ch = src[i]!

    // Track string boundaries (handle escaped quotes inside strings)
    if (ch === '"' && (i === 0 || src[i - 1] !== '\\')) {
      inString = !inString
      out += ch
      i++
      continue
    }

    if (!inString) {
      // Single-line comment
      if (ch === '/' && src[i + 1] === '/') {
        while (i < src.length && src[i] !== '\n') i++
        continue
      }
      // Block comment
      if (ch === '/' && src[i + 1] === '*') {
        i += 2
        while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++
        i += 2
        continue
      }
    }

    out += ch
    i++
  }

  return out
}

function parseJson(raw: string): Record<string, unknown> {
  return JSON.parse(stripJsonComments(raw)) as Record<string, unknown>
}

export function backup(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, filePath + '.bak')
  }
}

export function ensureDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

// Merge one server entry into a JSON file at the given key (e.g. "mcpServers")
export function mergeJson(
  filePath: string,
  key: string,
  serverName: string,
  serverConfig: unknown,
  dryRun = false
): string {
  let data: Record<string, unknown> = {}

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8').trim()
    data = raw ? parseJson(raw) : {}
  }

  const servers = (data[key] ?? {}) as Record<string, unknown>
  servers[serverName] = serverConfig
  data[key] = servers

  const out = JSON.stringify(data, null, 2) + '\n'

  if (!dryRun) {
    backup(filePath)
    ensureDir(filePath)
    fs.writeFileSync(filePath, out)
  }

  return out
}

// Merge into a nested key path, e.g. ["context_servers"] inside settings.json
export function mergeJsonNested(
  filePath: string,
  keys: string[],
  serverName: string,
  serverConfig: unknown,
  dryRun = false
): string {
  let data: Record<string, unknown> = {}

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8').trim()
    data = raw ? parseJson(raw) : {}
  }

  // Walk/create the key path
  let cursor = data
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]!
    if (typeof cursor[k] !== 'object' || cursor[k] === null) cursor[k] = {}
    cursor = cursor[k] as Record<string, unknown>
  }

  const lastKey = keys[keys.length - 1]!
  if (typeof cursor[lastKey] !== 'object' || cursor[lastKey] === null) cursor[lastKey] = {}
  ;(cursor[lastKey] as Record<string, unknown>)[serverName] = serverConfig

  const out = JSON.stringify(data, null, 2) + '\n'

  if (!dryRun) {
    backup(filePath)
    ensureDir(filePath)
    fs.writeFileSync(filePath, out)
  }

  return out
}

// Merge into a YAML file where mcpServers is an array of { name, ... }
export function mergeYamlArray(
  filePath: string,
  key: string,
  serverName: string,
  serverConfig: unknown,
  dryRun = false
): string {
  let data: Record<string, unknown> = {}

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    data = (parseYaml(raw) as Record<string, unknown>) ?? {}
  }

  if (!Array.isArray(data[key])) data[key] = []
  const arr = data[key] as Record<string, unknown>[]
  const idx = arr.findIndex((s) => s['name'] === serverName)
  const entry = { name: serverName, ...(serverConfig as object) }
  if (idx >= 0) arr[idx] = entry
  else arr.push(entry)

  const out = stringifyYaml(data)

  if (!dryRun) {
    backup(filePath)
    ensureDir(filePath)
    fs.writeFileSync(filePath, out)
  }

  return out
}

// Merge into a TOML file under [mcp_servers.<name>]
export function mergeToml(
  filePath: string,
  tableKey: string,
  serverName: string,
  serverConfig: unknown,
  dryRun = false
): string {
  let data: Record<string, unknown> = {}

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    data = parseToml(raw) as Record<string, unknown>
  }

  if (typeof data[tableKey] !== 'object' || data[tableKey] === null) data[tableKey] = {}
  ;(data[tableKey] as Record<string, unknown>)[serverName] = serverConfig

  const out = stringifyToml(data)

  if (!dryRun) {
    backup(filePath)
    ensureDir(filePath)
    fs.writeFileSync(filePath, out)
  }

  return out
}
