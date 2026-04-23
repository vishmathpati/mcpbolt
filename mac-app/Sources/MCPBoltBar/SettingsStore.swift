import Foundation
import Combine

// MARK: - Observable store for Claude Code settings.json

@MainActor
final class SettingsStore: ObservableObject {

    // MARK: - Scope

    enum Scope { case user, project }

    @Published var scope: Scope = .user {
        didSet { load() }
    }
    @Published var projectPath: String? = nil {
        didSet { if scope == .project { load() } }
    }

    // MARK: - Typed fields (what the form binds to)

    @Published var model: String = ""
    @Published var allowedTools: [String] = []
    @Published var deniedTools: [String] = []
    @Published var envVars: [(key: String, value: String)] = []
    @Published var apiKeyHelper: String = ""
    @Published var cleanupPeriodDays: String = ""
    @Published var includeCoAuthoredBy: Bool = false

    // MARK: - UI state

    @Published var isLoading = false
    @Published var isSaving = false
    @Published var lastError: String? = nil
    @Published var savedRecently = false

    // Raw dict from disk — preserves unknown keys (e.g. hooks)
    private var rawDict: [String: Any] = [:]

    // MARK: - Paths

    var currentPath: String {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        switch scope {
        case .user:
            return "\(home)/.claude/settings.json"
        case .project:
            guard let root = projectPath else { return "\(home)/.claude/settings.json" }
            return "\(root)/.claude/settings.json"
        }
    }

    var fileExists: Bool {
        FileManager.default.fileExists(atPath: currentPath)
    }

    // MARK: - Load

    func load() {
        isLoading = true
        lastError = nil
        let path = currentPath
        DispatchQueue.global(qos: .userInitiated).async {
            let (raw, parsed) = Self.readFromDisk(at: path)
            DispatchQueue.main.async { [weak self] in
                guard let self else { return }
                self.rawDict          = raw
                self.model            = parsed.model
                self.allowedTools     = parsed.allowedTools
                self.deniedTools      = parsed.deniedTools
                self.envVars          = parsed.envVars
                self.apiKeyHelper     = parsed.apiKeyHelper
                self.cleanupPeriodDays = parsed.cleanupPeriodDays
                self.includeCoAuthoredBy = parsed.includeCoAuthoredBy
                self.isLoading        = false
            }
        }
    }

    nonisolated private static func readFromDisk(at path: String) -> ([String: Any], ParsedSettings) {
        guard FileManager.default.fileExists(atPath: path),
              let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
              let raw = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return ([:], ParsedSettings()) }

        var p = ParsedSettings()
        p.model = raw["model"] as? String ?? ""

        if let perms = raw["permissions"] as? [String: Any] {
            p.allowedTools = perms["allow"] as? [String] ?? []
            p.deniedTools  = perms["deny"]  as? [String] ?? []
        }

        if let env = raw["env"] as? [String: String] {
            p.envVars = env.sorted { $0.key < $1.key }.map { (key: $0.key, value: $0.value) }
        }

        p.apiKeyHelper = raw["apiKeyHelper"] as? String ?? ""

        if let days = raw["cleanupPeriodDays"] as? Int {
            p.cleanupPeriodDays = "\(days)"
        }
        p.includeCoAuthoredBy = raw["includeCoAuthoredBy"] as? Bool ?? false

        return (raw, p)
    }

    // MARK: - Save

    func save() {
        isSaving = true
        lastError = nil
        var dict = rawDict

        // model
        if model.trimmingCharacters(in: .whitespaces).isEmpty {
            dict.removeValue(forKey: "model")
        } else {
            dict["model"] = model.trimmingCharacters(in: .whitespaces)
        }

        // permissions
        let allow = allowedTools.filter { !$0.isEmpty }
        let deny  = deniedTools.filter  { !$0.isEmpty }
        if allow.isEmpty && deny.isEmpty {
            dict.removeValue(forKey: "permissions")
        } else {
            var perms: [String: Any] = [:]
            if !allow.isEmpty { perms["allow"] = allow }
            if !deny.isEmpty  { perms["deny"]  = deny  }
            dict["permissions"] = perms
        }

        // env
        let filteredEnv = envVars.filter { !$0.key.isEmpty }
        if filteredEnv.isEmpty {
            dict.removeValue(forKey: "env")
        } else {
            var env: [String: String] = [:]
            for pair in filteredEnv { env[pair.key] = pair.value }
            dict["env"] = env
        }

        // apiKeyHelper
        let helper = apiKeyHelper.trimmingCharacters(in: .whitespaces)
        if helper.isEmpty { dict.removeValue(forKey: "apiKeyHelper") }
        else              { dict["apiKeyHelper"] = helper }

        // cleanupPeriodDays
        if let days = Int(cleanupPeriodDays), days > 0 {
            dict["cleanupPeriodDays"] = days
        } else {
            dict.removeValue(forKey: "cleanupPeriodDays")
        }

        // includeCoAuthoredBy — only store when true (omit false to keep file clean)
        if includeCoAuthoredBy {
            dict["includeCoAuthoredBy"] = true
        } else {
            dict.removeValue(forKey: "includeCoAuthoredBy")
        }

        let path = currentPath
        do {
            try Self.writeToDisk(dict: dict, at: path)
            rawDict = dict
            savedRecently = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) { [weak self] in
                self?.savedRecently = false
            }
        } catch {
            lastError = error.localizedDescription
        }
        isSaving = false
    }

    // MARK: - Undo

    func undo() {
        guard let bak = ConfigWriter.backups(forPath: currentPath).first else { return }
        try? FileManager.default.copyItem(atPath: bak, toPath: currentPath)
        load()
    }

    var hasUndo: Bool {
        !ConfigWriter.backups(forPath: currentPath).isEmpty
    }

    // MARK: - Disk helpers

    private static func writeToDisk(dict: [String: Any], at path: String) throws {
        let fm  = FileManager.default
        let url = URL(fileURLWithPath: path)
        let dir = url.deletingLastPathComponent().path
        try fm.createDirectory(atPath: dir, withIntermediateDirectories: true)

        if fm.fileExists(atPath: path) {
            let bak = "\(path).bak.\(backupStamp())"
            try? fm.copyItem(atPath: path, toPath: bak)
            pruneBackups(forPath: path)
        }

        let data = try JSONSerialization.data(
            withJSONObject: dict,
            options: [.prettyPrinted, .sortedKeys]
        )
        let tmp = path + ".tmp"
        try data.write(to: URL(fileURLWithPath: tmp))
        _ = try fm.replaceItemAt(url, withItemAt: URL(fileURLWithPath: tmp))
    }

    private static func backupStamp() -> String {
        let df = DateFormatter()
        df.locale     = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyyMMddHHmmssSSS"
        return df.string(from: Date())
    }

    private static func pruneBackups(forPath path: String) {
        let fm  = FileManager.default
        let url = URL(fileURLWithPath: path)
        let dir = url.deletingLastPathComponent().path
        let pfx = url.lastPathComponent + ".bak."
        guard let entries = try? fm.contentsOfDirectory(atPath: dir) else { return }
        let sorted = entries.filter { $0.hasPrefix(pfx) }.sorted().reversed()
        for old in Array(sorted).dropFirst(3) {
            try? fm.removeItem(atPath: "\(dir)/\(old)")
        }
    }
}

// MARK: - Private parsing scratch struct

private struct ParsedSettings {
    var model: String = ""
    var allowedTools: [String] = []
    var deniedTools: [String] = []
    var envVars: [(key: String, value: String)] = []
    var apiKeyHelper: String = ""
    var cleanupPeriodDays: String = ""
    var includeCoAuthoredBy: Bool = false
}
