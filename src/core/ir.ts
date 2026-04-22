export type Transport = 'stdio' | 'http' | 'sse'

export interface IR {
  name: string
  transport: Transport
  // stdio
  command?: string
  args?: string[]
  env?: Record<string, string>
  // http / sse
  url?: string
  headers?: Record<string, string>
}
