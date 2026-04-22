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

    /// Removes a server from one specific tool's config, then refreshes.
    /// Returns (success, errorMessage). errorMessage is nil on success.
    @discardableResult
    func removeServer(toolID: String, name: String) -> (ok: Bool, error: String?) {
        // TOML/YAML unsupported for native write — caller should check first
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
}
