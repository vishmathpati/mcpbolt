import Foundation
import Combine

// MARK: - Observable store (drives all views)

@MainActor
final class ServerStore: ObservableObject {
    @Published var tools:      [ToolSummary] = []
    @Published var isLoading:  Bool          = false
    @Published var searchText: String        = ""

    // Only detected tools, in display order
    var detectedTools: [ToolSummary] { tools.filter { $0.detected } }

    // Unique server names across all detected tools
    var allServerNames: [String] {
        let detected = detectedTools
        return Array(Set(detected.flatMap { $0.servers.map { $0.name } }))
            .sorted { a, b in
                let ac = detected.filter { t in t.servers.contains { $0.name == a } }.count
                let bc = detected.filter { t in t.servers.contains { $0.name == b } }.count
                if ac != bc { return ac > bc }
                return a.lowercased() < b.lowercased()
            }
    }

    // Total unique servers across all detected tools
    var serverCount: Int { allServerNames.count }

    // Case-insensitive substring filter. Empty query passes everything.
    func matches(_ name: String) -> Bool {
        let q = searchText.trimmingCharacters(in: .whitespaces).lowercased()
        if q.isEmpty { return true }
        return name.lowercased().contains(q)
    }

    func refresh() {
        guard !isLoading else { return }
        isLoading = true
        Task.detached(priority: .userInitiated) {
            let result = ConfigReader.shared.readAllTools()
            await MainActor.run {
                self.tools     = result
                self.isLoading = false
            }
        }
    }

    // MARK: - Lookups

    /// Tool IDs (in display order) that currently host a server with this name.
    func toolsHosting(name: String) -> [String] {
        ALL_TOOL_META
            .map { $0.id }
            .filter { id in
                tools.first(where: { $0.toolID == id })?.servers.contains(where: { $0.name == name }) == true
            }
    }

    /// Tool IDs that are detected and support native write (JSON-based tools).
    var nativeWritableDetectedToolIDs: [String] {
        detectedTools
            .map { $0.toolID }
            .filter { ConfigWriter.supportsNativeWrite(toolID: $0) }
    }

    // MARK: - Env updates

    /// Updates env values on a server across one or more tools.
    /// Returns per-tool results. Refreshes on completion.
    @discardableResult
    func updateServerEnv(
        name: String,
        env: [String: String],
        across toolIDs: [String]
    ) -> (successes: [String], failures: [(toolID: String, message: String)]) {
        var successes: [String] = []
        var failures:  [(String, String)] = []
        for toolID in toolIDs {
            guard ConfigWriter.supportsNativeWrite(toolID: toolID) else {
                failures.append((toolID, "Format not supported"))
                continue
            }
            do {
                try ConfigWriter.updateServerEnv(toolID: toolID, name: name, env: env)
                successes.append(toolID)
            } catch {
                failures.append((toolID, error.localizedDescription))
            }
        }
        refresh()
        return (successes, failures)
    }

    // MARK: - Remove

    /// Removes a server from one specific tool's config, then refreshes.
    /// Returns (success, errorMessage). errorMessage is nil on success.
    @discardableResult
    func removeServer(toolID: String, name: String) -> (ok: Bool, error: String?) {
        guard ConfigWriter.supportsNativeWrite(toolID: toolID) else {
            return (false, "This app's config format (TOML/YAML) isn't supported yet. Remove it manually.")
        }
        do {
            try ConfigWriter.removeServer(toolID: toolID, name: name)
            refresh()
            return (true, nil)
        } catch {
            return (false, error.localizedDescription)
        }
    }

    /// Removes a server from every tool that currently hosts it (native-write only).
    /// Returns per-tool results. Refreshes on completion.
    @discardableResult
    func removeServerEverywhere(
        name: String
    ) -> (successes: [String], failures: [(toolID: String, message: String)]) {
        var successes: [String] = []
        var failures:  [(String, String)] = []

        let hosts = toolsHosting(name: name)
        for toolID in hosts {
            guard ConfigWriter.supportsNativeWrite(toolID: toolID) else {
                failures.append((toolID, "Unsupported format — remove manually"))
                continue
            }
            do {
                try ConfigWriter.removeServer(toolID: toolID, name: name)
                successes.append(toolID)
            } catch {
                failures.append((toolID, error.localizedDescription))
            }
        }
        refresh()
        return (successes, failures)
    }

    // MARK: - Copy

    /// Copies a server from one tool's config into one or more target tools.
    /// Refreshes on completion.
    @discardableResult
    func copyServer(
        name: String,
        from sourceToolID: String,
        to targetToolIDs: [String]
    ) -> (successes: [String], failures: [(toolID: String, message: String)]) {
        var successes: [String] = []
        var failures:  [(String, String)] = []

        guard let config = ConfigWriter.readServer(toolID: sourceToolID, name: name) else {
            return ([], [(sourceToolID, "Couldn't read '\(name)' from \(sourceToolID)")])
        }

        for toolID in targetToolIDs {
            guard ConfigWriter.supportsNativeWrite(toolID: toolID) else {
                failures.append((toolID, "Unsupported format — paste manually"))
                continue
            }
            do {
                try ConfigWriter.writeServer(toolID: toolID, name: name, config: config)
                successes.append(toolID)
            } catch {
                failures.append((toolID, error.localizedDescription))
            }
        }
        refresh()
        return (successes, failures)
    }

    // MARK: - Edit (replace entire config)

    @discardableResult
    func replaceServerConfig(
        toolID: String,
        name: String,
        config: [String: Any]
    ) -> (ok: Bool, error: String?) {
        replaceServerConfig(
            toolID: toolID,
            scope: .user,
            projectRoot: nil,
            name: name,
            config: config
        )
    }

    /// Scope-aware replace. Use `.project` + a `projectRoot` to write into
    /// `<projectRoot>/.cursor/mcp.json` (or the equivalent for the tool).
    /// Refreshes user-scope tool list after writing; project-scope reads are
    /// always made fresh from disk by ProjectDetailView.
    @discardableResult
    func replaceServerConfig(
        toolID: String,
        scope: ConfigScope,
        projectRoot: String?,
        name: String,
        config: [String: Any]
    ) -> (ok: Bool, error: String?) {
        guard ConfigWriter.supportsNativeWrite(toolID: toolID) else {
            return (false, "This app's config format isn't supported yet.")
        }
        do {
            try ConfigWriter.writeServer(
                toolID: toolID,
                scope: scope,
                projectRoot: projectRoot,
                name: name,
                config: config
            )
            if scope == .user { refresh() }
            return (true, nil)
        } catch {
            return (false, error.localizedDescription)
        }
    }

    // MARK: - Undo

    /// Restores the most-recent backup for a tool's config file.
    @discardableResult
    func undoLastChange(toolID: String) -> (ok: Bool, error: String?) {
        guard let spec = ToolSpecs.spec(for: toolID) else {
            return (false, "Unknown tool")
        }
        let ok = ConfigWriter.restoreLatestBackup(forPath: spec.path)
        if ok {
            refresh()
            return (true, nil)
        } else {
            return (false, "No backup to restore.")
        }
    }

    func hasUndoableChange(toolID: String) -> Bool {
        guard let spec = ToolSpecs.spec(for: toolID) else { return false }
        return !ConfigWriter.backups(forPath: spec.path).isEmpty
    }
}
