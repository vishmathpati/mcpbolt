import Foundation

// MARK: - Parses pasted MCP server JSON into a preview list.

struct ParsedServer: Identifiable {
    let id = UUID()
    var name: String            // user-editable
    let config: [String: Any]

    var kindLabel: String {
        if config["url"] is String { return "Remote" }
        return "Local"
    }

    var preview: String {
        if let url = config["url"] as? String { return url }
        let cmd  = (config["command"] as? String) ?? ""
        let args = (config["args"]    as? [String]) ?? []
        return ([cmd] + args).joined(separator: " ").trimmingCharacters(in: .whitespaces)
    }
}

enum ImportParseError: Error, LocalizedError {
    case emptyInput
    case notJson
    case notAnObject
    case noServersFound
    case noCommandOrUrl
    case wizardCommand

    var errorDescription: String? {
        switch self {
        case .emptyInput:       return "Paste an MCP server config to get started."
        case .notJson:          return "Doesn't look like JSON or a \"mcp add\" CLI command. Check for a missing brace, trailing comma, or a typo."
        case .notAnObject:      return "Expected a JSON object (starting with {)."
        case .noServersFound:   return "Couldn't find any servers in that config."
        case .noCommandOrUrl:   return "Server is missing both \"command\" and \"url\"."
        case .wizardCommand:    return "This is a wizard installer — run it in your terminal and it will write the config directly. Then hit Refresh in MCPBolt to see the new server."
        }
    }
}

enum ImportParser {

    static func parse(_ raw: String) -> Result<[ParsedServer], ImportParseError> {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty { return .failure(.emptyInput) }

        // Path 1: CLI-style `claude mcp add ...` / `cursor mcp add ...` / `codex mcp add ...` etc.
        // Detect before JSON so a line that starts with `claude mcp add` never gets treated as text.
        if let cliServer = parseCliAdd(trimmed) {
            return .success([cliServer])
        }

        // Path 1b: Wizard command — `npx @pkg/wizard mcp add` / `bunx @pkg/wizard mcp add`.
        // These are interactive installers that write configs directly; they can't be parsed
        // into a server config. Return a specific, helpful error instead of the generic one.
        if isWizardCommand(trimmed) {
            return .failure(.wizardCommand)
        }

        // Path 2: JSON. Strip JSONC comments first so Claude Desktop–style pastes work.
        let clean = ConfigWriter.stripJsonComments(trimmed)

        guard let data = clean.data(using: .utf8) else {
            return .failure(.notJson)
        }
        guard let any = try? JSONSerialization.jsonObject(with: data) else {
            return .failure(.notJson)
        }
        guard let obj = any as? [String: Any] else {
            return .failure(.notAnObject)
        }

        // Case 1: wrapped — { mcpServers: {...} } or { servers: {...} }
        for wrapperKey in ["mcpServers", "servers", "context_servers"] {
            if let dict = obj[wrapperKey] as? [String: Any] {
                let parsed = serversFrom(dict: dict)
                if parsed.isEmpty { return .failure(.noServersFound) }
                return .success(parsed)
            }
        }

        // Case 2: directly a server config (has command or url at top)
        if obj["command"] != nil || obj["url"] != nil {
            return .success([ParsedServer(name: "", config: obj)])
        }

        // Case 3: dict of servers (each value is itself a config)
        let servers = serversFrom(dict: obj)
        if servers.isEmpty { return .failure(.noServersFound) }
        return .success(servers)
    }

    private static func serversFrom(dict: [String: Any]) -> [ParsedServer] {
        var out: [ParsedServer] = []
        for (name, value) in dict {
            guard let cfg = value as? [String: Any] else { continue }
            // Must have command or url to be a usable MCP server
            if cfg["command"] == nil && cfg["url"] == nil { continue }
            out.append(ParsedServer(name: name, config: cfg))
        }
        return out.sorted { $0.name.lowercased() < $1.name.lowercased() }
    }

    // MARK: - CLI command parser
    //
    // Parses `<tool> mcp add <name> [flags] <command | url> [args...]` where
    // <tool> is one of claude / cursor / codex / windsurf / gemini / zed (or omitted).
    //
    // Examples:
    //   claude mcp add context7 --transport http https://mcp.context7.com/mcp
    //   cursor mcp add filesystem --transport stdio npx -y @mcp/server-filesystem /tmp
    //   codex mcp add mytool -e API_KEY=abc npx -y my-mcp-server
    //   mcp add foo --transport sse https://example.com/sse -H Authorization=Bearer\ X
    //
    // Returns nil if the input doesn't look like an mcp-add command. Does NOT
    // throw on minor weirdness (we want JSON parsing to still get a crack at it).
    static func parseCliAdd(_ input: String) -> ParsedServer? {
        let tokens = shellSplit(input)
        if tokens.isEmpty { return nil }

        var i = 0
        let toolPrefixes: Set<String> = ["claude", "cursor", "codex", "windsurf", "gemini", "zed"]
        if i < tokens.count, toolPrefixes.contains(tokens[i].lowercased()) { i += 1 }

        guard i < tokens.count, tokens[i].lowercased() == "mcp" else { return nil }
        i += 1
        guard i < tokens.count, tokens[i].lowercased() == "add" else { return nil }
        i += 1

        guard i < tokens.count else { return nil }
        let name = tokens[i]
        if name.hasPrefix("-") { return nil }
        i += 1

        var transport = "stdio"
        var env: [String: String] = [:]
        var headers: [String: String] = [:]

        while i < tokens.count {
            let tok = tokens[i]

            if tok == "--transport" || tok == "-t" {
                i += 1
                if i < tokens.count {
                    let val = tokens[i]
                    transport = (val == "http" || val == "sse" || val == "stdio") ? val : "stdio"
                    i += 1
                }
                continue
            }

            if tok == "--env" || tok == "-e" {
                i += 1
                if i < tokens.count {
                    let kv = tokens[i]
                    if let eq = kv.firstIndex(of: "="), eq > kv.startIndex {
                        let k = String(kv[..<eq])
                        let v = String(kv[kv.index(after: eq)...])
                        env[k] = v
                    }
                    i += 1
                }
                continue
            }

            if tok == "--header" || tok == "-H" {
                i += 1
                if i < tokens.count {
                    let kv = tokens[i]
                    if let eq = kv.firstIndex(of: "="), eq > kv.startIndex {
                        let k = String(kv[..<eq])
                        let v = String(kv[kv.index(after: eq)...])
                        headers[k] = v
                    }
                    i += 1
                }
                continue
            }

            // Unknown flag + its value → skip both
            if tok.hasPrefix("--") { i += 2; continue }
            if tok.hasPrefix("-") && tok.count == 2 { i += 2; continue }

            break // reached the command / url
        }

        let rest = Array(tokens[i...])
        if rest.isEmpty { return nil }

        var config: [String: Any] = [:]

        if transport == "http" || transport == "sse" {
            config["url"] = rest[0]
            if !headers.isEmpty { config["headers"] = headers }
            config["type"] = transport  // remote servers want an explicit type
        } else {
            config["command"] = rest[0]
            if rest.count > 1 { config["args"] = Array(rest.dropFirst()) }
        }

        if !env.isEmpty { config["env"] = env }

        return ParsedServer(name: name, config: config)
    }

    /// Minimal shell tokenizer — handles single / double quoted strings and
    /// backslash escapes. Not POSIX complete, but plenty for `mcp add` pastes.
    static func shellSplit(_ input: String) -> [String] {
        var tokens: [String] = []
        var current = ""
        var inSingle = false
        var inDouble = false
        var escapeNext = false
        for ch in input {
            if escapeNext {
                current.append(ch)
                escapeNext = false
                continue
            }
            if ch == "\\" && !inSingle {
                escapeNext = true
                continue
            }
            if ch == "'" && !inDouble {
                inSingle.toggle(); continue
            }
            if ch == "\"" && !inSingle {
                inDouble.toggle(); continue
            }
            if ch.isWhitespace && !inSingle && !inDouble {
                if !current.isEmpty { tokens.append(current); current = "" }
                continue
            }
            current.append(ch)
        }
        if !current.isEmpty { tokens.append(current) }
        return tokens
    }

    // Returns true for `npx <pkg> mcp add [...]` / `bunx <pkg> mcp add [...]` patterns.
    // These are wizard-style installers, not pasteable configs.
    private static func isWizardCommand(_ input: String) -> Bool {
        let tokens = shellSplit(input)
        guard tokens.count >= 4 else { return false }
        let first = tokens[0].lowercased()
        guard first == "npx" || first == "bunx" else { return false }
        // Look for "mcp add" anywhere after the first token
        for i in 1..<(tokens.count - 1) {
            if tokens[i].lowercased() == "mcp" && tokens[i + 1].lowercased() == "add" {
                return true
            }
        }
        return false
    }

    /// Sanitizes a pasted name: lowercase, strip weird chars, collapse hyphens.
    static func cleanName(_ raw: String) -> String {
        let lowered = raw.lowercased()
            .trimmingCharacters(in: .whitespacesAndNewlines)
        let allowed = Set<Character>("abcdefghijklmnopqrstuvwxyz0123456789-_")
        var result = ""
        var lastDash = false
        for ch in lowered {
            if allowed.contains(ch) {
                result.append(ch)
                lastDash = (ch == "-")
            } else if ch.isWhitespace || ch == "." || ch == "/" || ch == "@" {
                if !lastDash && !result.isEmpty {
                    result.append("-"); lastDash = true
                }
            }
        }
        // Trim leading/trailing dashes
        while result.hasPrefix("-") { result.removeFirst() }
        while result.hasSuffix("-") { result.removeLast() }
        return result.isEmpty ? "server" : result
    }
}
