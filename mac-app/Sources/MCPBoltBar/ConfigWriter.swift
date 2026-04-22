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

/// Scope for a tool config. User = global (home directory); Project = per-project
/// file inside a picked folder. Not every tool has a project scope — those
/// return nil from `spec(for:scope:projectRoot:)` when scope is .project.
enum ConfigScope: String {
    case user
    case project
}

enum ToolSpecs {
    /// Default: user scope (what the existing call sites get).
    static func spec(for toolID: String) -> ToolSpec? {
        spec(for: toolID, scope: .user, projectRoot: nil)
    }

    /// Project-scope variants are currently defined only for tools that
    /// officially support a per-project MCP config file.
    static func spec(for toolID: String, scope: ConfigScope, projectRoot: String?) -> ToolSpec? {
        let home = FileManager.default.homeDirectoryForCurrentUser.path

        // Project-scoped specs (only a subset of tools support this).
        if scope == .project {
            guard let root = projectRoot else { return nil }
            switch toolID {
            case "cursor":
                return .init(id: toolID,
                             path: "\(root)/.cursor/mcp.json",
                             kind: .json(key: "mcpServers"))
            case "vscode":
                return .init(id: toolID,
                             path: "\(root)/.vscode/mcp.json",
                             kind: .json(key: "servers"))
            case "roo":
                return .init(id: toolID,
                             path: "\(root)/.roo/mcp.json",
                             kind: .json(key: "mcpServers"))
            case "claude-code":
                // Claude Code respects .mcp.json in the project root.
                return .init(id: toolID,
                             path: "\(root)/.mcp.json",
                             kind: .json(key: "mcpServers"))
            default:
                return nil
            }
        }

        // User scope (default path for every tool).
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
                         path: "\(home)/.roo/mcp.json",
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
        case "opencode":
            // opencode uses a slightly different per-server shape
            // ({ type: "local"|"remote", command: [...] }) than Claude Desktop.
            // ConfigWriter translates at I/O boundaries.
            return .init(id: toolID,
                         path: "\(home)/.config/opencode/opencode.json",
                         kind: .json(key: "mcp"))
        case "cline":
            return .init(id: toolID,
                         path: "\(home)/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
                         kind: .json(key: "mcpServers"))
        default:
            return nil
        }
    }

    /// Tool IDs that support project scope.
    static let projectScopedTools: Set<String> = ["cursor", "vscode", "roo", "claude-code"]
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

    /// Writes one server into the tool's config (user scope). Throws on failure.
    static func writeServer(
        toolID: String,
        name: String,
        config: [String: Any]
    ) throws {
        try writeServer(toolID: toolID, scope: .user, projectRoot: nil, name: name, config: config)
    }

    /// Scope-aware write. Use `scope: .project` with a `projectRoot` to land
    /// the server in `<projectRoot>/.cursor/mcp.json` (or equivalent).
    /// `config` is in claude-shape ({ command, args, env, ... } or { url, headers, ... }).
    /// We translate to opencode-shape at write time if the target is opencode.
    static func writeServer(
        toolID: String,
        scope: ConfigScope,
        projectRoot: String?,
        name: String,
        config: [String: Any]
    ) throws {
        guard let spec = ToolSpecs.spec(for: toolID, scope: scope, projectRoot: projectRoot) else {
            throw WriteError.unsupportedFormat(scope == .project ? "\(toolID) (project scope)" : toolID)
        }

        let shaped: [String: Any] = (toolID == "opencode")
            ? claudeShapeToOpencode(config)
            : config

        switch spec.kind {
        case .json(let key):
            try writeJson(path: spec.path, key: key, name: name, config: shaped)
        case .jsonNested(let keys):
            try writeJsonNested(path: spec.path, keys: keys, name: name, config: shaped)
        case .toml, .yaml:
            throw WriteError.unsupportedFormat(toolID)
        }
    }

    /// Returns the target file path we'd write to for a given tool + scope.
    /// Useful for the diff preview.
    static func previewPath(toolID: String, scope: ConfigScope, projectRoot: String?) -> String? {
        ToolSpecs.spec(for: toolID, scope: scope, projectRoot: projectRoot)?.path
    }

    /// Builds what the file contents WOULD be if we wrote this server now.
    /// Returns (beforeText, afterText). Used for diff preview.
    static func previewWrite(
        toolID: String,
        scope: ConfigScope,
        projectRoot: String?,
        name: String,
        config: [String: Any]
    ) -> (before: String, after: String)? {
        guard let spec = ToolSpecs.spec(for: toolID, scope: scope, projectRoot: projectRoot) else { return nil }

        // Before: what's currently on disk (raw).
        let before: String = {
            guard FileManager.default.fileExists(atPath: spec.path),
                  let raw = try? String(contentsOfFile: spec.path, encoding: .utf8)
            else { return "" }
            return raw
        }()

        let shaped: [String: Any] = (toolID == "opencode")
            ? claudeShapeToOpencode(config)
            : config

        // After: simulated root with the new server applied.
        var root = loadJsonRoot(path: spec.path)
        switch spec.kind {
        case .json(let key):
            var dict = root[key] as? [String: Any] ?? [:]
            dict[name] = shaped
            root[key] = dict
        case .jsonNested(let keys):
            var chain: [[String: Any]] = [root]
            for k in keys {
                let current = chain.last!
                chain.append(current[k] as? [String: Any] ?? [:])
            }
            var innermost = chain.removeLast()
            innermost[name] = shaped
            var up = innermost
            for k in keys.reversed() {
                var parent = chain.removeLast()
                parent[k] = up
                up = parent
            }
            root = up
        case .toml, .yaml:
            return (before, "(TOML / YAML preview not supported)")
        }

        let data = try? JSONSerialization.data(withJSONObject: root, options: [.prettyPrinted])
        let after = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
        return (before, after)
    }

    /// Reads one server's full config from a tool's file, returned in claude-shape (user scope).
    /// Returns nil if the tool's format is unsupported or the server isn't there.
    static func readServer(toolID: String, name: String) -> [String: Any]? {
        readServer(toolID: toolID, scope: .user, projectRoot: nil, name: name)
    }

    /// Scope-aware single-server read.
    static func readServer(
        toolID: String,
        scope: ConfigScope,
        projectRoot: String?,
        name: String
    ) -> [String: Any]? {
        guard let spec = ToolSpecs.spec(for: toolID, scope: scope, projectRoot: projectRoot) else { return nil }
        return readServer(spec: spec, toolID: toolID, name: name)
    }

    private static func readServer(spec: ToolSpec, toolID: String, name: String) -> [String: Any]? {
        let raw: [String: Any]?

        switch spec.kind {
        case .json(let key):
            let root = loadJsonRoot(path: spec.path)
            raw = (root[key] as? [String: Any])?[name] as? [String: Any]

        case .jsonNested(let keys):
            var cursor: [String: Any] = loadJsonRoot(path: spec.path)
            for k in keys {
                cursor = (cursor[k] as? [String: Any]) ?? [:]
            }
            raw = cursor[name] as? [String: Any]

        case .toml, .yaml:
            return nil
        }

        guard var entry = raw else { return nil }

        if toolID == "opencode" {
            entry = opencodeShapeToClaude(entry)
        }
        return entry
    }

    /// Reads every server declared in a tool's config file at the given scope.
    /// Returns a `[name: config]` dictionary, with each config in claude-shape.
    /// Empty dict if the file doesn't exist or the tool's format is unsupported.
    static func readAllServers(
        toolID: String,
        scope: ConfigScope,
        projectRoot: String?
    ) -> [String: [String: Any]] {
        guard let spec = ToolSpecs.spec(for: toolID, scope: scope, projectRoot: projectRoot),
              FileManager.default.fileExists(atPath: spec.path)
        else { return [:] }

        let dict: [String: Any]
        switch spec.kind {
        case .json(let key):
            dict = (loadJsonRoot(path: spec.path)[key] as? [String: Any]) ?? [:]
        case .jsonNested(let keys):
            var cursor: [String: Any] = loadJsonRoot(path: spec.path)
            for k in keys { cursor = (cursor[k] as? [String: Any]) ?? [:] }
            dict = cursor
        case .toml, .yaml:
            return [:]
        }

        var out: [String: [String: Any]] = [:]
        for (name, value) in dict {
            guard var cfg = value as? [String: Any] else { continue }
            if toolID == "opencode" { cfg = opencodeShapeToClaude(cfg) }
            out[name] = cfg
        }
        return out
    }

    /// Does the tool's config file exist at the given scope? Cheap check — no parsing.
    static func configExists(toolID: String, scope: ConfigScope, projectRoot: String?) -> Bool {
        guard let spec = ToolSpecs.spec(for: toolID, scope: scope, projectRoot: projectRoot) else { return false }
        return FileManager.default.fileExists(atPath: spec.path)
    }

    // MARK: - Opencode shape translation

    /// Claude-shape: { command: "npx", args: ["-y", "pkg"], env: {...} }
    ///             OR { url: "...", headers: {...} }
    /// Opencode: { type: "local", command: ["npx", "-y", "pkg"], environment: {...} }
    ///         OR { type: "remote", url: "...", headers: {...} }
    static func claudeShapeToOpencode(_ c: [String: Any]) -> [String: Any] {
        if let url = c["url"] as? String {
            var out: [String: Any] = ["type": "remote", "url": url]
            if let h = c["headers"] as? [String: Any], !h.isEmpty { out["headers"] = h }
            return out
        }
        var cmd: [String] = []
        if let command = c["command"] as? String, !command.isEmpty { cmd.append(command) }
        if let args = c["args"] as? [String] { cmd.append(contentsOf: args) }
        var out: [String: Any] = ["type": "local", "command": cmd]
        if let env = c["env"] as? [String: Any], !env.isEmpty { out["environment"] = env }
        return out
    }

    static func opencodeShapeToClaude(_ c: [String: Any]) -> [String: Any] {
        let type = c["type"] as? String ?? "local"
        if type == "remote" {
            var out: [String: Any] = [:]
            if let url = c["url"] as? String { out["url"] = url }
            if let h = c["headers"] as? [String: Any], !h.isEmpty { out["headers"] = h }
            return out
        }
        var command = ""
        var args: [String] = []
        if let parts = c["command"] as? [String] {
            command = parts.first ?? ""
            args    = Array(parts.dropFirst())
        } else if let s = c["command"] as? String {
            command = s
        }
        var out: [String: Any] = ["command": command, "args": args]
        if let env = c["environment"] as? [String: Any], !env.isEmpty { out["env"] = env }
        return out
    }

    /// Merges env values into an existing server's config, writing back.
    /// Only updates env keys provided; other env keys are left alone.
    /// Empty string values are treated as a delete of that env key.
    static func updateServerEnv(
        toolID: String,
        name: String,
        env: [String: String]
    ) throws {
        guard let spec = ToolSpecs.spec(for: toolID) else {
            throw WriteError.unsupportedFormat(toolID)
        }

        switch spec.kind {
        case .json(let key):
            try updateEnvJson(path: spec.path, key: key, name: name, env: env)
        case .jsonNested(let keys):
            try updateEnvJsonNested(path: spec.path, keys: keys, name: name, env: env)
        case .toml, .yaml:
            throw WriteError.unsupportedFormat(toolID)
        }
    }

    private static func updateEnvJson(
        path: String,
        key: String,
        name: String,
        env: [String: String]
    ) throws {
        var root = loadJsonRoot(path: path)
        var dict = root[key] as? [String: Any] ?? [:]
        guard var server = dict[name] as? [String: Any] else {
            throw WriteError.readFailure("Server '\(name)' not found in \(path)")
        }
        var currentEnv = (server["env"] as? [String: Any]) ?? [:]
        for (k, v) in env {
            if v.isEmpty { currentEnv.removeValue(forKey: k) }
            else         { currentEnv[k] = v }
        }
        server["env"] = currentEnv
        dict[name]   = server
        root[key]    = dict
        try backupAndWrite(path: path, root: root)
    }

    private static func updateEnvJsonNested(
        path: String,
        keys: [String],
        name: String,
        env: [String: String]
    ) throws {
        let root = loadJsonRoot(path: path)

        var chain: [[String: Any]] = [root]
        for key in keys {
            let current = chain.last!
            let next = current[key] as? [String: Any] ?? [:]
            chain.append(next)
        }

        var innermost = chain.removeLast()
        guard var server = innermost[name] as? [String: Any] else {
            throw WriteError.readFailure("Server '\(name)' not found in \(path)")
        }
        var currentEnv = (server["env"] as? [String: Any]) ?? [:]
        for (k, v) in env {
            if v.isEmpty { currentEnv.removeValue(forKey: k) }
            else         { currentEnv[k] = v }
        }
        server["env"]   = currentEnv
        innermost[name] = server

        var up = innermost
        for key in keys.reversed() {
            var parent = chain.removeLast()
            parent[key] = up
            up = parent
        }

        try backupAndWrite(path: path, root: up)
    }

    /// Removes a server from the tool's config (user scope). Throws on failure.
    static func removeServer(
        toolID: String,
        name: String
    ) throws {
        try removeServer(toolID: toolID, scope: .user, projectRoot: nil, name: name)
    }

    /// Scope-aware remove. With `scope: .project` + a `projectRoot`, removes the
    /// server from `<projectRoot>/.cursor/mcp.json` (or the equivalent per tool).
    static func removeServer(
        toolID: String,
        scope: ConfigScope,
        projectRoot: String?,
        name: String
    ) throws {
        guard let spec = ToolSpecs.spec(for: toolID, scope: scope, projectRoot: projectRoot) else {
            throw WriteError.unsupportedFormat(scope == .project ? "\(toolID) (project scope)" : toolID)
        }

        switch spec.kind {
        case .json(let key):
            try removeJson(path: spec.path, key: key, name: name)
        case .jsonNested(let keys):
            try removeJsonNested(path: spec.path, keys: keys, name: name)
        case .toml, .yaml:
            throw WriteError.unsupportedFormat(toolID)
        }
    }

    // MARK: - JSON removers

    private static func removeJson(
        path: String,
        key: String,
        name: String
    ) throws {
        let fm = FileManager.default
        guard fm.fileExists(atPath: path) else { return } // nothing to remove

        var root: [String: Any] = loadJsonRoot(path: path)
        var dict = root[key] as? [String: Any] ?? [:]
        dict.removeValue(forKey: name)
        root[key] = dict

        try backupAndWrite(path: path, root: root)
    }

    private static func removeJsonNested(
        path: String,
        keys: [String],
        name: String
    ) throws {
        let fm = FileManager.default
        guard fm.fileExists(atPath: path) else { return }

        let root: [String: Any] = loadJsonRoot(path: path)

        // Walk into nested dicts
        var chain: [[String: Any]] = [root]
        for key in keys {
            let current = chain.last!
            let next = current[key] as? [String: Any] ?? [:]
            chain.append(next)
        }

        // Remove from innermost
        var innermost = chain.removeLast()
        innermost.removeValue(forKey: name)

        // Walk back up
        for key in keys.reversed() {
            var parent = chain.removeLast()
            parent[key] = innermost
            innermost = parent
        }

        try backupAndWrite(path: path, root: innermost)
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

    // Keep the most recent N backups per config file.
    private static let maxBackupsPerFile = 3

    private static func backupAndWrite(path: String, root: [String: Any]) throws {
        let fm = FileManager.default

        // Timestamped backup: <path>.bak.<yyyyMMddHHmmssSSS>
        if fm.fileExists(atPath: path) {
            let stamp = backupStamp()
            let bak = "\(path).bak.\(stamp)"
            try? fm.copyItem(atPath: path, toPath: bak)
            pruneBackups(forPath: path)

            // Also clean up the legacy single ".bak" from older app versions
            // so it doesn't sit around indefinitely with stale keys.
            let legacy = path + ".bak"
            if fm.fileExists(atPath: legacy) { try? fm.removeItem(atPath: legacy) }
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

        // Atomic write: writes to a tmp file and renames. Either the old file
        // or the new file is there — never a truncated partial.
        do {
            try data.write(to: URL(fileURLWithPath: path), options: [.atomic])
        } catch {
            throw WriteError.writeFailure(error.localizedDescription)
        }
    }

    private static func backupStamp() -> String {
        let df = DateFormatter()
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyyMMddHHmmssSSS"
        return df.string(from: Date())
    }

    /// Returns backup paths for a config, newest first.
    static func backups(forPath path: String) -> [String] {
        let fm  = FileManager.default
        let url = URL(fileURLWithPath: path)
        let dir = url.deletingLastPathComponent().path
        let base = url.lastPathComponent + ".bak."

        guard let entries = try? fm.contentsOfDirectory(atPath: dir) else { return [] }
        let matches = entries.filter { $0.hasPrefix(base) }
        // Timestamps sort lexically because of the yyyyMMddHHmmssSSS format.
        return matches.sorted().reversed().map { "\(dir)/\($0)" }
    }

    private static func pruneBackups(forPath path: String) {
        let all = backups(forPath: path)
        guard all.count > maxBackupsPerFile else { return }
        let fm = FileManager.default
        for old in all.dropFirst(maxBackupsPerFile) {
            try? fm.removeItem(atPath: old)
        }
    }

    /// Restores the most-recent backup over the live file (used by Undo).
    /// Returns true if a restore happened.
    @discardableResult
    static func restoreLatestBackup(forPath path: String) -> Bool {
        let fm = FileManager.default
        guard let latest = backups(forPath: path).first else { return false }
        do {
            if fm.fileExists(atPath: path) { try fm.removeItem(atPath: path) }
            try fm.copyItem(atPath: latest, toPath: path)
            // Consume the backup so Undo is a one-shot (prevents ping-pong).
            try? fm.removeItem(atPath: latest)
            return true
        } catch {
            return false
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
