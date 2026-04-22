import Foundation

// MARK: - Writes server configs into the right file for each tool.
// Supports JSON-based tools natively. TOML (Codex) + YAML (Continue) are
// reported as "unsupported — use CLI" so the user isn't silently dropped.

enum ConfigKind {
    case json(key: String)                  // { mcpServers: { ... } }   or servers
    case jsonNested(keys: [String])         // { ..., context_servers: {...} }
    case toml                                // [mcp_servers.name] sections
    case yaml                                // mcpServers: array
}

struct ToolSpec {
    let id:   String
    let path: String
    let kind: ConfigKind
}

enum ToolSpecs {
    static func spec(for toolID: String) -> ToolSpec? {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        let cwd  = FileManager.default.currentDirectoryPath

        switch toolID {
        case "claude-desktop":
            return .init(id: toolID,
                         path: "\(home)/Library/Application Support/Claude/claude_desktop_config.json",
                         kind: .json(key: "mcpServers"))
        case "claude-code":
            return .init(id: toolID,
                         path: "\(home)/.claude.json",
                         kind: .json(key: "mcpServers"))
        case "cursor":
            return .init(id: toolID,
                         path: "\(home)/.cursor/mcp.json",
                         kind: .json(key: "mcpServers"))
        case "vscode":
            return .init(id: toolID,
                         path: "\(home)/Library/Application Support/Code/User/mcp.json",
                         kind: .json(key: "servers"))
        case "windsurf":
            return .init(id: toolID,
                         path: "\(home)/.codeium/windsurf/mcp_config.json",
                         kind: .json(key: "mcpServers"))
        case "gemini":
            return .init(id: toolID,
                         path: "\(home)/.gemini/settings.json",
                         kind: .json(key: "mcpServers"))
        case "roo":
            return .init(id: toolID,
                         path: "\(cwd)/.roo/mcp.json",
                         kind: .json(key: "mcpServers"))
        case "zed":
            return .init(id: toolID,
                         path: "\(home)/.config/zed/settings.json",
                         kind: .jsonNested(keys: ["context_servers"]))
        case "codex":
            return .init(id: toolID,
                         path: "\(home)/.codex/config.toml",
                         kind: .toml)
        case "continue":
            return .init(id: toolID,
                         path: "\(home)/.continue/config.yaml",
                         kind: .yaml)
        default:
            return nil
        }
    }
}

enum ConfigWriter {

    enum WriteError: Error, LocalizedError {
        case unsupportedFormat(String)
        case readFailure(String)
        case writeFailure(String)

        var errorDescription: String? {
            switch self {
            case .unsupportedFormat(let t): return "Format not supported by in-app import: \(t)"
            case .readFailure(let m):       return "Could not read existing config: \(m)"
            case .writeFailure(let m):      return "Could not write config: \(m)"
            }
        }
    }

    /// Returns true if the tool's config file format can be written natively.
    static func supportsNativeWrite(toolID: String) -> Bool {
        guard let spec = ToolSpecs.spec(for: toolID) else { return false }
        switch spec.kind {
        case .json, .jsonNested: return true
        case .toml, .yaml:       return false
        }
    }

    /// Writes one server into the tool's config. Throws on failure.
    static func writeServer(
        toolID: String,
        name: String,
        config: [String: Any]
    ) throws {
        guard let spec = ToolSpecs.spec(for: toolID) else {
            throw WriteError.unsupportedFormat(toolID)
        }

        switch spec.kind {
        case .json(let key):
            try writeJson(path: spec.path, key: key, name: name, config: config)
        case .jsonNested(let keys):
            try writeJsonNested(path: spec.path, keys: keys, name: name, config: config)
        case .toml, .yaml:
            throw WriteError.unsupportedFormat(toolID)
        }
    }

    // MARK: - JSON writers

    private static func writeJson(
        path: String,
        key: String,
        name: String,
        config: [String: Any]
    ) throws {
        ensureParent(of: path)

        var root: [String: Any] = loadJsonRoot(path: path)
        var dict = root[key] as? [String: Any] ?? [:]
        dict[name] = config
        root[key] = dict

        try backupAndWrite(path: path, root: root)
    }

    private static func writeJsonNested(
        path: String,
        keys: [String],
        name: String,
        config: [String: Any]
    ) throws {
        ensureParent(of: path)

        let root: [String: Any] = loadJsonRoot(path: path)

        // Walk into nested dicts, creating missing ones
        var chain: [[String: Any]] = [root]
        for key in keys {
            let current = chain.last!
            let next = current[key] as? [String: Any] ?? [:]
            chain.append(next)
        }

        // Set the server in the innermost dict
        var innermost = chain.removeLast()
        innermost[name] = config

        // Walk back up, replacing each level
        for key in keys.reversed() {
            var parent = chain.removeLast()
            parent[key] = innermost
            innermost = parent
        }

        try backupAndWrite(path: path, root: innermost)
    }

    // MARK: - Helpers

    private static func loadJsonRoot(path: String) -> [String: Any] {
        let fm = FileManager.default
        guard fm.fileExists(atPath: path),
              let raw = try? String(contentsOfFile: path, encoding: .utf8)
        else { return [:] }
        // Strip JSONC comments using same logic as the reader
        let stripped = stripJsonComments(raw)
        guard let data = stripped.data(using: .utf8),
              let obj  = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return [:] }
        return obj
    }

    private static func backupAndWrite(path: String, root: [String: Any]) throws {
        let fm  = FileManager.default
        let bak = path + ".bak"

        // Backup
        if fm.fileExists(atPath: path) {
            if fm.fileExists(atPath: bak) { try? fm.removeItem(atPath: bak) }
            try? fm.copyItem(atPath: path, toPath: bak)
        }

        // Serialize pretty
        let data: Data
        do {
            data = try JSONSerialization.data(
                withJSONObject: root,
                options: [.prettyPrinted]
            )
        } catch {
            throw WriteError.writeFailure(error.localizedDescription)
        }

        do {
            try data.write(to: URL(fileURLWithPath: path))
        } catch {
            throw WriteError.writeFailure(error.localizedDescription)
        }
    }

    private static func ensureParent(of path: String) {
        let url = URL(fileURLWithPath: path)
        let dir = url.deletingLastPathComponent().path
        try? FileManager.default.createDirectory(
            atPath: dir,
            withIntermediateDirectories: true
        )
    }

    // MARK: - JSONC comment stripper (duplicated from reader to avoid coupling)

    static func stripJsonComments(_ src: String) -> String {
        var out = ""
        var i = src.startIndex
        var inString = false

        while i < src.endIndex {
            let ch = src[i]

            if ch == "\"" {
                let prev = i > src.startIndex ? src[src.index(before: i)] : Character("\0")
                if prev != "\\" { inString = !inString }
                out.append(ch); i = src.index(after: i); continue
            }

            if !inString {
                let next = src.index(after: i)
                if ch == "/" && next < src.endIndex {
                    if src[next] == "/" {
                        while i < src.endIndex && src[i] != "\n" { i = src.index(after: i) }
                        continue
                    }
                    if src[next] == "*" {
                        i = src.index(i, offsetBy: 2)
                        while i < src.endIndex {
                            if src[i] == "*" {
                                let n2 = src.index(after: i)
                                if n2 < src.endIndex && src[n2] == "/" {
                                    i = src.index(after: n2); break
                                }
                            }
                            i = src.index(after: i)
                        }
                        continue
                    }
                }
            }

            out.append(ch); i = src.index(after: i)
        }
        return out
    }
}
