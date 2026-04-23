import Foundation
import Combine

// MARK: - Observable store for Claude Code settings

@MainActor
final class SettingsStore: ObservableObject {

    // MARK: - Scope

    enum Scope { case user, local, project }

    @Published var scope: Scope = .user { didSet { load() } }
    @Published var projectPath: String? = nil { didSet { if scope == .project || scope == .local { load() } } }

    // MARK: - Feature flags (settings.json)

    // Performance
    @Published var extendedOutputLimit:  Bool = false  // env.CLAUDE_CODE_TERMINAL_OUTPUT_LIMIT = "150000"
    @Published var largeFileReading:     Bool = false  // env.CLAUDE_CODE_MAX_READ_LINES = "5000"
    @Published var highOutputLimit:      Bool = false  // env.MAX_OUTPUT_TOKENS = "64000"

    // Interface
    @Published var fullscreenTerminal:   Bool = false  // tui: "fullscreen"
    @Published var stableUpdates:        Bool = false  // autoUpdatesChannel: "stable"
    @Published var reducedMotion:        Bool = false  // prefersReducedMotion: true
    @Published var hideSpinnerTips:      Bool = false  // spinnerTipsEnabled: false

    // History & Privacy
    @Published var keepSessions1Year:    Bool = false  // cleanupPeriodDays: 365
    @Published var cleanCommits:         Bool = false  // attribution: {commit: "", pr: ""}
    @Published var disableTelemetry:     Bool = false  // env.CLAUDE_CODE_DISABLE_TELEMETRY = "1"
    @Published var disableAutoMemory:    Bool = false  // autoMemoryEnabled: false
    @Published var disableSessionRecap:  Bool = false  // awaySummaryEnabled: false

    // Workflow
    @Published var autoTrustProjectMCPs: Bool = false  // enableAllProjectMcpServers: true
    @Published var worktreeSymlinks:     Bool = false  // worktree.symlinkDirectories: [...]
    @Published var filePickerShowAll:    Bool = false  // respectGitignore: false

    // Thinking & Effort
    @Published var maxEffortMode:        Bool = false  // effortLevel: "xhigh"
    @Published var extendedThinking:     Bool = false  // alwaysThinkingEnabled: true + showThinkingSummaries: true

    // Feature flags from ~/.claude.json (global, not scope-aware)
    @Published var vimKeys:              Bool = false  // editorMode: "vim"
    @Published var autoConnectIde:       Bool = false  // autoConnectIde: true
    @Published var responseInEditor:     Bool = false  // externalEditorContext: true
    @Published var hideTurnDuration:     Bool = false  // showTurnDuration: false
    @Published var disableProgressBar:   Bool = false  // terminalProgressBarEnabled: false

    // MARK: - UI state

    @Published var isLoading     = false
    @Published var savedRecently = false
    @Published var lastError: String? = nil

    private var rawSettings:     [String: Any] = [:]
    private var rawGlobalConfig: [String: Any] = [:]

    // MARK: - Paths

    var settingsPath: String {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        switch scope {
        case .user:    return "\(home)/.claude/settings.json"
        case .local:
            guard let root = projectPath else { return "\(home)/.claude/settings.json" }
            return "\(root)/.claude/settings.local.json"
        case .project:
            guard let root = projectPath else { return "\(home)/.claude/settings.json" }
            return "\(root)/.claude/settings.json"
        }
    }

    var globalConfigPath: String {
        "\(FileManager.default.homeDirectoryForCurrentUser.path)/.claude.json"
    }

    var settingsFileExists: Bool { FileManager.default.fileExists(atPath: settingsPath) }

    // MARK: - Load

    func load() {
        isLoading = true
        lastError = nil
        let sPath = settingsPath
        let gPath = globalConfigPath
        DispatchQueue.global(qos: .userInitiated).async {
            let (rawS, featS) = Self.readSettings(at: sPath)
            let (rawG, featG) = Self.readGlobalConfig(at: gPath)
            DispatchQueue.main.async { [weak self] in
                guard let self else { return }
                self.rawSettings         = rawS
                self.rawGlobalConfig     = rawG
                self.extendedOutputLimit  = featS.extendedOutputLimit
                self.largeFileReading     = featS.largeFileReading
                self.highOutputLimit      = featS.highOutputLimit
                self.fullscreenTerminal   = featS.fullscreenTerminal
                self.stableUpdates        = featS.stableUpdates
                self.reducedMotion        = featS.reducedMotion
                self.hideSpinnerTips      = featS.hideSpinnerTips
                self.keepSessions1Year    = featS.keepSessions1Year
                self.cleanCommits         = featS.cleanCommits
                self.disableTelemetry     = featS.disableTelemetry
                self.disableAutoMemory    = featS.disableAutoMemory
                self.disableSessionRecap  = featS.disableSessionRecap
                self.autoTrustProjectMCPs = featS.autoTrustProjectMCPs
                self.worktreeSymlinks     = featS.worktreeSymlinks
                self.filePickerShowAll    = featS.filePickerShowAll
                self.maxEffortMode        = featS.maxEffortMode
                self.extendedThinking     = featS.extendedThinking
                self.vimKeys              = featG.vimKeys
                self.autoConnectIde       = featG.autoConnectIde
                self.responseInEditor     = featG.responseInEditor
                self.hideTurnDuration     = featG.hideTurnDuration
                self.disableProgressBar   = featG.disableProgressBar
                self.isLoading            = false
            }
        }
    }

    // MARK: - Feature toggle (immediate save)

    enum Feature {
        case extendedOutputLimit, largeFileReading, highOutputLimit
        case fullscreenTerminal, stableUpdates, reducedMotion, hideSpinnerTips
        case keepSessions1Year, cleanCommits, disableTelemetry, disableAutoMemory, disableSessionRecap
        case autoTrustProjectMCPs, worktreeSymlinks, filePickerShowAll
        case maxEffortMode, extendedThinking
        case vimKeys, autoConnectIde, responseInEditor, hideTurnDuration, disableProgressBar
    }

    func toggle(_ feature: Feature) {
        switch feature {
        case .extendedOutputLimit:  extendedOutputLimit  = !extendedOutputLimit;  saveSettings()
        case .largeFileReading:     largeFileReading     = !largeFileReading;     saveSettings()
        case .highOutputLimit:      highOutputLimit      = !highOutputLimit;      saveSettings()
        case .fullscreenTerminal:   fullscreenTerminal   = !fullscreenTerminal;   saveSettings()
        case .stableUpdates:        stableUpdates        = !stableUpdates;        saveSettings()
        case .reducedMotion:        reducedMotion        = !reducedMotion;        saveSettings()
        case .hideSpinnerTips:      hideSpinnerTips      = !hideSpinnerTips;      saveSettings()
        case .keepSessions1Year:    keepSessions1Year    = !keepSessions1Year;    saveSettings()
        case .cleanCommits:         cleanCommits         = !cleanCommits;         saveSettings()
        case .disableTelemetry:     disableTelemetry     = !disableTelemetry;     saveSettings()
        case .disableAutoMemory:    disableAutoMemory    = !disableAutoMemory;    saveSettings()
        case .disableSessionRecap:  disableSessionRecap  = !disableSessionRecap;  saveSettings()
        case .autoTrustProjectMCPs: autoTrustProjectMCPs = !autoTrustProjectMCPs; saveSettings()
        case .worktreeSymlinks:     worktreeSymlinks     = !worktreeSymlinks;     saveSettings()
        case .filePickerShowAll:    filePickerShowAll    = !filePickerShowAll;    saveSettings()
        case .maxEffortMode:        maxEffortMode        = !maxEffortMode;        saveSettings()
        case .extendedThinking:     extendedThinking     = !extendedThinking;     saveSettings()
        case .vimKeys:              vimKeys              = !vimKeys;              saveGlobalConfig()
        case .autoConnectIde:       autoConnectIde       = !autoConnectIde;       saveGlobalConfig()
        case .responseInEditor:     responseInEditor     = !responseInEditor;     saveGlobalConfig()
        case .hideTurnDuration:     hideTurnDuration     = !hideTurnDuration;     saveGlobalConfig()
        case .disableProgressBar:   disableProgressBar   = !disableProgressBar;   saveGlobalConfig()
        }
    }

    // MARK: - Undo

    func undo() {
        guard let bak = ConfigWriter.backups(forPath: settingsPath).first else { return }
        try? FileManager.default.copyItem(atPath: bak, toPath: settingsPath)
        load()
    }

    var hasUndo: Bool { !ConfigWriter.backups(forPath: settingsPath).isEmpty }

    // MARK: - Save settings.json

    private func saveSettings() {
        var dict = rawSettings

        // env — touch only managed keys, preserve unknown ones
        var env = dict["env"] as? [String: Any] ?? [:]
        setOrRemove(&env, key: "CLAUDE_CODE_TERMINAL_OUTPUT_LIMIT", value: extendedOutputLimit ? "150000" : nil)
        setOrRemove(&env, key: "CLAUDE_CODE_MAX_READ_LINES",        value: largeFileReading    ? "5000"   : nil)
        setOrRemove(&env, key: "CLAUDE_CODE_DISABLE_TELEMETRY",     value: disableTelemetry    ? "1"      : nil)
        setOrRemove(&env, key: "MAX_OUTPUT_TOKENS",                  value: highOutputLimit     ? "64000"  : nil)
        // Migrate: remove old deprecated env keys we used to write
        env.removeValue(forKey: "CLAUDE_CODE_EFFORT_LEVEL")
        env.removeValue(forKey: "MAX_THINKING_TOKENS")
        env.removeValue(forKey: "SHOW_EXTENDED_THINKING_SUMMARIES")
        env.removeValue(forKey: "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING")
        if env.isEmpty { dict.removeValue(forKey: "env") } else { dict["env"] = env }

        // tui
        if fullscreenTerminal { dict["tui"] = "fullscreen" } else { dict.removeValue(forKey: "tui") }

        // autoUpdatesChannel
        if stableUpdates { dict["autoUpdatesChannel"] = "stable" }
        else             { dict.removeValue(forKey: "autoUpdatesChannel") }

        // prefersReducedMotion
        if reducedMotion { dict["prefersReducedMotion"] = true }
        else             { dict.removeValue(forKey: "prefersReducedMotion") }

        // spinnerTipsEnabled — false to hide, key absent = default (shown)
        if hideSpinnerTips { dict["spinnerTipsEnabled"] = false }
        else               { dict.removeValue(forKey: "spinnerTipsEnabled") }

        // cleanupPeriodDays
        if keepSessions1Year { dict["cleanupPeriodDays"] = 365 }
        else                 { dict.removeValue(forKey: "cleanupPeriodDays") }

        // attribution (migration: always remove deprecated includeCoAuthoredBy)
        dict.removeValue(forKey: "includeCoAuthoredBy")
        var attr = dict["attribution"] as? [String: Any] ?? [:]
        if cleanCommits {
            attr["commit"] = ""
            attr["pr"]     = ""
        } else {
            attr.removeValue(forKey: "commit")
            attr.removeValue(forKey: "pr")
        }
        if attr.isEmpty { dict.removeValue(forKey: "attribution") } else { dict["attribution"] = attr }

        // autoMemoryEnabled
        if disableAutoMemory { dict["autoMemoryEnabled"] = false }
        else                 { dict.removeValue(forKey: "autoMemoryEnabled") }

        // awaySummaryEnabled — false to disable recap
        if disableSessionRecap { dict["awaySummaryEnabled"] = false }
        else                   { dict.removeValue(forKey: "awaySummaryEnabled") }

        // enableAllProjectMcpServers
        if autoTrustProjectMCPs { dict["enableAllProjectMcpServers"] = true }
        else                    { dict.removeValue(forKey: "enableAllProjectMcpServers") }

        // worktree.symlinkDirectories
        var wt = dict["worktree"] as? [String: Any] ?? [:]
        if worktreeSymlinks { wt["symlinkDirectories"] = ["node_modules", ".cache"] }
        else                { wt.removeValue(forKey: "symlinkDirectories") }
        if wt.isEmpty { dict.removeValue(forKey: "worktree") } else { dict["worktree"] = wt }

        // respectGitignore — false to show all files (key absent = true = default)
        if filePickerShowAll { dict["respectGitignore"] = false }
        else                 { dict.removeValue(forKey: "respectGitignore") }

        // effortLevel (replaces old env.CLAUDE_CODE_EFFORT_LEVEL)
        if maxEffortMode { dict["effortLevel"] = "xhigh" }
        else             { dict.removeValue(forKey: "effortLevel") }

        // alwaysThinkingEnabled + showThinkingSummaries (replaces old env bundle)
        if extendedThinking {
            dict["alwaysThinkingEnabled"] = true
            dict["showThinkingSummaries"] = true
        } else {
            dict.removeValue(forKey: "alwaysThinkingEnabled")
            dict.removeValue(forKey: "showThinkingSummaries")
        }

        persist(dict: dict, to: settingsPath, into: &rawSettings)
    }

    private func setOrRemove(_ dict: inout [String: Any], key: String, value: String?) {
        if let v = value { dict[key] = v } else { dict.removeValue(forKey: key) }
    }

    // MARK: - Save ~/.claude.json

    private func saveGlobalConfig() {
        var dict = rawGlobalConfig
        if vimKeys           { dict["editorMode"] = "vim"        } else { dict.removeValue(forKey: "editorMode") }
        if autoConnectIde    { dict["autoConnectIde"] = true     } else { dict.removeValue(forKey: "autoConnectIde") }
        if responseInEditor  { dict["externalEditorContext"] = true } else { dict.removeValue(forKey: "externalEditorContext") }
        if hideTurnDuration  { dict["showTurnDuration"] = false  } else { dict.removeValue(forKey: "showTurnDuration") }
        if disableProgressBar { dict["terminalProgressBarEnabled"] = false } else { dict.removeValue(forKey: "terminalProgressBarEnabled") }
        persist(dict: dict, to: globalConfigPath, into: &rawGlobalConfig)
    }

    private func persist(dict: [String: Any], to path: String, into raw: inout [String: Any]) {
        do {
            try Self.writeToDisk(dict: dict, at: path)
            raw = dict
            lastError = nil
            flashSaved()
        } catch {
            lastError = error.localizedDescription
        }
    }

    private func flashSaved() {
        savedRecently = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.savedRecently = false
        }
    }

    // MARK: - Disk readers (nonisolated — runs on background thread)

    nonisolated private static func readSettings(at path: String) -> ([String: Any], SettingsFeatures) {
        guard let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
              let raw  = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return ([:], SettingsFeatures()) }

        let env = raw["env"] as? [String: Any] ?? [:]
        var f = SettingsFeatures()

        // Performance
        f.extendedOutputLimit = envInt(env, "CLAUDE_CODE_TERMINAL_OUTPUT_LIMIT").map { $0 >= 100_000 } ?? false
        f.largeFileReading    = envInt(env, "CLAUDE_CODE_MAX_READ_LINES").map        { $0 >= 3_000   } ?? false
        f.highOutputLimit     = envInt(env, "MAX_OUTPUT_TOKENS").map                 { $0 >= 32_000  } ?? false

        // Interface
        f.fullscreenTerminal  = (raw["tui"] as? String) == "fullscreen"
        f.stableUpdates       = (raw["autoUpdatesChannel"] as? String) == "stable"
        f.reducedMotion       = (raw["prefersReducedMotion"] as? Bool) == true
        f.hideSpinnerTips     = (raw["spinnerTipsEnabled"] as? Bool) == false

        // History & Privacy
        f.keepSessions1Year   = (raw["cleanupPeriodDays"] as? Int).map { $0 >= 365 } ?? false
        f.disableTelemetry    = envString(env, "CLAUDE_CODE_DISABLE_TELEMETRY") == "1"
        f.disableAutoMemory   = (raw["autoMemoryEnabled"] as? Bool) == false
        f.disableSessionRecap = (raw["awaySummaryEnabled"] as? Bool) == false

        // cleanCommits: new attribution key (falls back to deprecated includeCoAuthoredBy)
        if let attr = raw["attribution"] as? [String: Any] {
            f.cleanCommits = (attr["commit"] as? String) == "" && (attr["pr"] as? String) == ""
        } else if let v = raw["includeCoAuthoredBy"] as? Bool {
            f.cleanCommits = !v
        }

        // Workflow
        f.autoTrustProjectMCPs = (raw["enableAllProjectMcpServers"] as? Bool) == true
        if let wt = raw["worktree"] as? [String: Any],
           let dirs = wt["symlinkDirectories"] as? [String], !dirs.isEmpty {
            f.worktreeSymlinks = true
        }
        f.filePickerShowAll = (raw["respectGitignore"] as? Bool) == false

        // Thinking & Effort — check official keys first, fall back to old env vars for migration
        f.maxEffortMode    = (raw["effortLevel"] as? String) == "xhigh"
                          || envString(env, "CLAUDE_CODE_EFFORT_LEVEL") == "max"
        f.extendedThinking = (raw["alwaysThinkingEnabled"] as? Bool) == true
                          || (envInt(env, "MAX_THINKING_TOKENS").map { $0 >= 10_000 } ?? false)

        return (raw, f)
    }

    nonisolated private static func readGlobalConfig(at path: String) -> ([String: Any], GlobalConfigFeatures) {
        guard let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
              let raw  = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return ([:], GlobalConfigFeatures()) }

        var f = GlobalConfigFeatures()
        f.vimKeys            = (raw["editorMode"] as? String) == "vim"
        f.autoConnectIde     = (raw["autoConnectIde"] as? Bool) == true
        f.responseInEditor   = (raw["externalEditorContext"] as? Bool) == true
        f.hideTurnDuration   = (raw["showTurnDuration"] as? Bool) == false
        f.disableProgressBar = (raw["terminalProgressBarEnabled"] as? Bool) == false
        return (raw, f)
    }

    nonisolated private static func envInt(_ env: [String: Any], _ key: String) -> Int? {
        if let s = env[key] as? String { return Int(s) }
        if let n = env[key] as? Int    { return n }
        return nil
    }

    nonisolated private static func envString(_ env: [String: Any], _ key: String) -> String? {
        if let s = env[key] as? String { return s }
        if let n = env[key] as? Int    { return "\(n)" }
        return nil
    }

    // MARK: - Disk writer

    private static func writeToDisk(dict: [String: Any], at path: String) throws {
        let fm  = FileManager.default
        let url = URL(fileURLWithPath: path)
        let dir = url.deletingLastPathComponent().path
        try fm.createDirectory(atPath: dir, withIntermediateDirectories: true)

        if fm.fileExists(atPath: path) {
            let bak = "\(path).bak.\(stamp())"
            try? fm.copyItem(atPath: path, toPath: bak)
            pruneBackups(forPath: path)
        }

        let data = try JSONSerialization.data(withJSONObject: dict, options: [.prettyPrinted, .sortedKeys])
        let tmp  = path + ".tmp"
        try data.write(to: URL(fileURLWithPath: tmp))
        _ = try fm.replaceItemAt(url, withItemAt: URL(fileURLWithPath: tmp))
    }

    private static func stamp() -> String {
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

// MARK: - Parsing scratch structs

private struct SettingsFeatures {
    var extendedOutputLimit:  Bool = false
    var largeFileReading:     Bool = false
    var highOutputLimit:      Bool = false
    var fullscreenTerminal:   Bool = false
    var stableUpdates:        Bool = false
    var reducedMotion:        Bool = false
    var hideSpinnerTips:      Bool = false
    var keepSessions1Year:    Bool = false
    var cleanCommits:         Bool = false
    var disableTelemetry:     Bool = false
    var disableAutoMemory:    Bool = false
    var disableSessionRecap:  Bool = false
    var autoTrustProjectMCPs: Bool = false
    var worktreeSymlinks:     Bool = false
    var filePickerShowAll:    Bool = false
    var maxEffortMode:        Bool = false
    var extendedThinking:     Bool = false
}

private struct GlobalConfigFeatures {
    var vimKeys:            Bool = false
    var autoConnectIde:     Bool = false
    var responseInEditor:   Bool = false
    var hideTurnDuration:   Bool = false
    var disableProgressBar: Bool = false
}
