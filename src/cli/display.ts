const ESC = '\x1b'
export const c = {
  reset: `${ESC}[0m`,
  bold: (s: string) => `${ESC}[1m${s}${ESC}[0m`,
  dim: (s: string) => `${ESC}[2m${s}${ESC}[0m`,
  green: (s: string) => `${ESC}[32m${s}${ESC}[0m`,
  yellow: (s: string) => `${ESC}[33m${s}${ESC}[0m`,
  red: (s: string) => `${ESC}[31m${s}${ESC}[0m`,
  cyan: (s: string) => `${ESC}[36m${s}${ESC}[0m`,
  blue: (s: string) => `${ESC}[34m${s}${ESC}[0m`,
}

export function banner(): void {
  console.log()
  console.log(c.bold('  mcp-wire') + c.dim(' — wire MCP servers into any AI coding tool'))
  console.log(c.dim('  ─────────────────────────────────────────'))
  console.log()
}

export function success(msg: string): void {
  console.log(c.green('  ✓ ') + msg)
}

export function warn(msg: string): void {
  console.log(c.yellow('  ! ') + msg)
}

export function info(msg: string): void {
  console.log(c.dim('    ') + msg)
}

export function hint(msg: string): void {
  console.log(c.cyan('  → ') + msg)
}

export function error(msg: string): void {
  console.error(c.red('  ✗ ') + msg)
}

export function section(title: string): void {
  console.log()
  console.log(c.bold('  ' + title))
}
