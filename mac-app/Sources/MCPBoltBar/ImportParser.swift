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

    var errorDescription: String? {
        switch self {
        case .emptyInput:       return "Paste an MCP server config to get started."
        case .notJson:          return "Doesn't look like valid JSON. Check for a missing brace or trailing comma."
        case .notAnObject:      return "Expected a JSON object (starting with {)."
        case .noServersFound:   return "Couldn't find any servers in that config."
        case .noCommandOrUrl:   return "Server is missing both \"command\" and \"url\"."
        }
    }
}

enum ImportParser {

    static func parse(_ raw: String) -> Result<[ParsedServer], ImportParseError> {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty { return .failure(.emptyInput) }

        // Strip JSONC comments first so Claude Desktop–style pastes work
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
