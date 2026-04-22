import Foundation
import AppKit

// MARK: - Config reader

final class ConfigReader {
    static let shared = ConfigReader()
    private init() {}

    private let home = FileManager.default.homeDirectoryForCurrentUser.path
    private let cwd  = FileManager.default.currentDirectoryPath
    private let fm   = FileManager.default

    // Read every tool and return summaries (called off the main thread)
    func readAllTools() -> [ToolSummary] {
        ALL_TOOL_META.map { meta in
            let (detected, servers) = readTool(id: meta.id)
            return ToolSummary(
                toolID:   meta.id,
                label:    meta.label,
                short:    meta.short,
                detected: detected,
                servers:  servers
            )
        }
    }

    // MARK: - Per-tool dispatch

    private func readTool(id: String) -> (detected: Bool, servers: [ServerEntry]) {
        switch id {

        case "claude-desktop":
            let dir  = "\(home)/Library/Application Support/Claude"
            let path = "\(dir)/claude_desktop_config.json"
            return (fm.fileExists(atPath: dir) || appExists("com.anthropic.claudefordesktop"),
                    readJsonServers(path: path, key: "mcpServers"))

        case "claude-code":
            let path = "\(home)/.claude.json"
            return (onPath("claude") || fm.fileExists(atPath: path),
                    readJsonServers(path: path, key: "mcpServers"))

        case "cursor":
            let path = "\(home)/.cursor/mcp.json"
            return (fm.fileExists(atPath: "\(home)/.cursor") || appExists("com.todesktop.230313mzl4w4u92"),
                    readJsonServers(path: path, key: "mcpServers"))

        case "vscode":
            let path = "\(home)/Library/Application Support/Code/User/mcp.json"
            return (onPath("code") || appExists("com.microsoft.VSCode"),
                    readJsonServers(path: path, key: "servers"))

        case "codex":
            let path = "\(home)/.codex/config.toml"
            return (onPath("codex") || fm.fileExists(atPath: "\(home)/.codex"),
                    readTomlServers(path: path))

        case "windsurf":
            let path = "\(home)/.codeium/windsurf/mcp_config.json"
            return (fm.fileExists(atPath: "\(home)/.codeium/windsurf") || appExists("com.codeium.windsurf"),
                    readJsonServers(path: path, key: "mcpServers"))

        case "zed":
            let path = "\(home)/.config/zed/settings.json"
            return (fm.fileExists(atPath: "\(home)/.config/zed") || appExists("dev.zed.Zed"),
                    readJsonNestedServers(path: path, keys: ["context_servers"]))

        case "continue":
            let path = "\(home)/.continue/config.yaml"
            return (fm.fileExists(atPath: "\(home)/.continue"),
                    readYamlServers(path: path))

        case "gemini":
            let path = "\(home)/.gemini/settings.json"
            return (onPath("gemini") || fm.fileExists(atPath: "\(home)/.gemini"),
                    readJsonServers(path: path, key: "mcpServers"))

        case "roo":
            let path = "\(cwd)/.roo/mcp.json"
            return (fm.fileExists(atPath: "\(cwd)/.roo"),
                    readJsonServers(path: path, key: "mcpServers"))

        case "opencode":
            // sst/opencode — global config uses `mcp` key (not mcpServers).
            let path = "\(home)/.config/opencode/opencode.json"
            return (onPath("opencode") || fm.fileExists(atPath: "\(home)/.config/opencode"),
                    readJsonServers(path: path, key: "mcp"))

        case "cline":
            // Cline is a VS Code extension; it writes to its own globalStorage dir.
            let path = "\(home)/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
            return (fm.fileExists(atPath: path) ||
                    fm.fileExists(atPath: "\(home)/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev"),
                    readJsonServers(path: path, key: "mcpServers"))

        default:
            return (false, [])
        }
    }

    // MARK: - JSON / JSONC

    private func readJsonServers(path: String, key: String) -> [ServerEntry] {
        guard let raw = try? String(contentsOfFile: path, encoding: .utf8) else { return [] }
        let stripped = stripJsonComments(raw)
        guard
            let data = stripped.data(using: .utf8),
            let obj  = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let dict = obj[key] as? [String: Any]
        else { return [] }
        return parseServerDict(dict)
    }

    private func readJsonNestedServers(path: String, keys: [String]) -> [ServerEntry] {
        guard let raw = try? String(contentsOfFile: path, encoding: .utf8) else { return [] }
        let stripped = stripJsonComments(raw)
        guard
            let data = stripped.data(using: .utf8),
            var obj  = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return [] }

        for key in keys.dropLast() {
            guard let next = obj[key] as? [String: Any] else { return [] }
            obj = next
        }
        guard let lastKey = keys.last, let dict = obj[lastKey] as? [String: Any] else { return [] }
        return parseServerDict(dict)
    }

    private func parseServerDict(_ dict: [String: Any]) -> [ServerEntry] {
        dict.compactMap { name, value in
            guard let props = value as? [String: Any] else { return nil }
            let command = props["command"] as? String
            let args    = (props["args"] as? [String]) ?? []
            let url     = props["url"] as? String
            let transport: String
            if let t = props["type"] as? String { transport = t }
            else if url != nil { transport = "http" }
            else { transport = "stdio" }
            return ServerEntry(name: name, transport: transport, command: command, args: args, url: url)
        }
        .sorted { $0.name.lowercased() < $1.name.lowercased() }
    }

    // MARK: - TOML (Codex: [mcp_servers.name] sections)

    private func readTomlServers(path: String) -> [ServerEntry] {
        guard let raw = try? String(contentsOfFile: path, encoding: .utf8) else { return [] }
        return parseTomlMcpServers(raw)
    }

    private func parseTomlMcpServers(_ content: String) -> [ServerEntry] {
        var servers: [ServerEntry] = []
        var currentName: String?
        var props: [String: Any] = [:]

        func flush() {
            guard let name = currentName else { return }
            let command   = props["command"] as? String
            let args      = props["args"] as? [String] ?? []
            let url       = props["url"] as? String
            let transport: String
            if let t = props["type"] as? String { transport = t }
            else if url != nil { transport = "http" }
            else { transport = "stdio" }
            servers.append(ServerEntry(name: name, transport: transport, command: command, args: args, url: url))
            props = [:]
        }

        for line in content.components(separatedBy: .newlines) {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            if trimmed.isEmpty || trimmed.hasPrefix("#") { continue }

            // [mcp_servers.name]
            if trimmed.hasPrefix("[mcp_servers.") && trimmed.hasSuffix("]") && !trimmed.hasPrefix("[[") {
                flush()
                currentName = String(trimmed.dropFirst(13).dropLast())
                continue
            }

            if trimmed.hasPrefix("[") { continue } // other section

            // key = value
            guard let eqRange = trimmed.range(of: " = ") ?? trimmed.range(of: "=") else { continue }
            let key    = String(trimmed[trimmed.startIndex..<eqRange.lowerBound]).trimmingCharacters(in: .whitespaces)
            let rawVal = String(trimmed[eqRange.upperBound...]).trimmingCharacters(in: .whitespaces)

            if rawVal.hasPrefix("[") {
                // Array: ["-y", "cmd"]
                let inner = rawVal.dropFirst().dropLast()
                let items = inner.components(separatedBy: ",").map {
                    $0.trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: "\"'"))
                }.filter { !$0.isEmpty }
                props[key] = items
            } else if (rawVal.hasPrefix("\"") && rawVal.hasSuffix("\"")) ||
                      (rawVal.hasPrefix("'") && rawVal.hasSuffix("'")) {
                props[key] = String(rawVal.dropFirst().dropLast())
            } else {
                props[key] = rawVal
            }
        }

        flush()
        return servers.sorted { $0.name.lowercased() < $1.name.lowercased() }
    }

    // MARK: - YAML (Continue: mcpServers array)

    private func readYamlServers(path: String) -> [ServerEntry] {
        guard let raw = try? String(contentsOfFile: path, encoding: .utf8) else { return [] }
        return parseYamlMcpServers(raw)
    }

    private func parseYamlMcpServers(_ content: String) -> [ServerEntry] {
        var servers: [ServerEntry] = []
        var inBlock  = false
        var inItem   = false
        var props: [String: Any] = [:]

        func flush() {
            guard inItem, let name = props["name"] as? String else { return }
            let command   = props["command"] as? String
            let args      = props["args"] as? [String] ?? []
            let url       = props["url"] as? String
            let transport = url != nil ? "http" : "stdio"
            servers.append(ServerEntry(name: name, transport: transport, command: command, args: args, url: url))
            props = [:]; inItem = false
        }

        for line in content.components(separatedBy: .newlines) {
            if line.trimmingCharacters(in: .whitespaces).isEmpty { continue }

            if line == "mcpServers:" || line.hasPrefix("mcpServers:") {
                inBlock = true; continue
            }

            guard inBlock else { continue }

            // Left the block (no leading whitespace)
            if !line.hasPrefix(" ") && !line.hasPrefix("\t") {
                flush(); break
            }

            let trimmed = line.trimmingCharacters(in: .whitespaces)

            if trimmed.hasPrefix("- ") {
                flush()
                inItem = true
                let rest = String(trimmed.dropFirst(2))
                parseYamlKeyVal(rest, into: &props)
            } else if inItem {
                parseYamlKeyVal(trimmed, into: &props)
            }
        }

        flush()
        return servers.sorted { $0.name.lowercased() < $1.name.lowercased() }
    }

    private func parseYamlKeyVal(_ s: String, into props: inout [String: Any]) {
        guard let colonRange = s.range(of: ": ") else { return }
        let key    = String(s[s.startIndex..<colonRange.lowerBound])
        let rawVal = String(s[colonRange.upperBound...]).trimmingCharacters(in: CharacterSet(charactersIn: "\"'"))
        if rawVal.hasPrefix("[") {
            let inner = rawVal.dropFirst().dropLast()
            let items = inner.components(separatedBy: ",").map {
                $0.trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: "\"'"))
            }.filter { !$0.isEmpty }
            props[key] = items
        } else {
            props[key] = rawVal
        }
    }

    // MARK: - JSONC comment stripper

    private func stripJsonComments(_ src: String) -> String {
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
                                if n2 < src.endIndex && src[n2] == "/" { i = src.index(after: n2); break }
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

    // MARK: - Detection helpers

    private func appExists(_ bundleID: String) -> Bool {
        NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleID) != nil
    }

    private func onPath(_ cmd: String) -> Bool {
        let p = Process()
        p.executableURL = URL(fileURLWithPath: "/usr/bin/which")
        p.arguments = [cmd]
        let pipe = Pipe()
        p.standardOutput = pipe
        p.standardError  = pipe
        try? p.run(); p.waitUntilExit()
        return p.terminationStatus == 0
    }
}
