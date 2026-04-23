import AppKit
import Foundation
import ServiceManagement

// MARK: - Central place for app-level actions (menu + right-click + buttons)

@MainActor
enum AppActions {

    // MARK: - Launch at login (macOS 13+, SMAppService)

    static var launchAtLoginEnabled: Bool {
        get { SMAppService.mainApp.status == .enabled }
        set {
            do {
                if newValue {
                    if SMAppService.mainApp.status == .enabled { return }
                    try SMAppService.mainApp.register()
                } else {
                    if SMAppService.mainApp.status != .enabled { return }
                    try SMAppService.mainApp.unregister()
                }
            } catch {
                let alert = NSAlert()
                alert.messageText = newValue ? "Couldn't enable launch at login" : "Couldn't disable launch at login"
                alert.informativeText = error.localizedDescription
                alert.alertStyle = .warning
                alert.addButton(withTitle: "OK")
                NSApp.activate(ignoringOtherApps: true)
                alert.runModal()
            }
        }
    }

    // MARK: - Auto Update preference

    static var autoUpdateEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: "mcpbolt.autoUpdate") }
        set { UserDefaults.standard.set(newValue, forKey: "mcpbolt.autoUpdate") }
    }

    // MARK: - Version + URLs

    static var currentVersion: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "?"
    }

    static let repoURL     = URL(string: "https://github.com/vishmathpati/mcpbolt")!
    static let releasesURL = URL(string: "https://github.com/vishmathpati/mcpbolt/releases")!

    // MARK: - Actions

    static func quit() { NSApp.terminate(nil) }

    static func openRepo()     { NSWorkspace.shared.open(repoURL) }
    static func openReleases() { NSWorkspace.shared.open(releasesURL) }

    static func about() {
        let alert = NSAlert()
        alert.messageText = "mcpbolt"
        alert.informativeText = """
        Version \(currentVersion)

        Manage MCP servers across your AI coding tools — Claude, Cursor, VS Code, Codex, and more — from one menu bar app.

        github.com/vishmathpati/mcpbolt
        """
        alert.alertStyle = .informational
        alert.addButton(withTitle: "OK")
        alert.addButton(withTitle: "Open GitHub")
        NSApp.activate(ignoringOtherApps: true)
        if alert.runModal() == .alertSecondButtonReturn { openRepo() }
    }

    // MARK: - Check for updates

    /// Ask GitHub for the latest release.
    /// `silent=true` suppresses the "up to date" + error alerts (used for the
    /// background launch check). When `autoUpdateEnabled` is on and an update is
    /// found in silent mode, the upgrade runs automatically.
    static func checkForUpdates(silent: Bool = false) {
        Task {
            let result = await UpdateChecker.check()
            await MainActor.run {
                switch result {
                case .upToDate(let v):
                    guard !silent else { return }
                    let alert = NSAlert()
                    alert.messageText = "You're up to date."
                    alert.informativeText = "mcpbolt \(v) is the latest release."
                    alert.alertStyle = .informational
                    alert.addButton(withTitle: "OK")
                    NSApp.activate(ignoringOtherApps: true)
                    alert.runModal()

                case .updateAvailable(let current, let latest):
                    if silent && autoUpdateEnabled {
                        // Auto-update silently in background
                        performBrewUpgrade(latest: latest, userInitiated: false)
                        return
                    }
                    if silent { return }  // auto-update off, don't bother on launch

                    let alert = NSAlert()
                    alert.messageText = "Update available — \(latest)"
                    alert.informativeText = "mcpbolt \(latest) is out. You're on \(current).\n\nInstalling via Homebrew takes about 30 seconds."
                    alert.alertStyle = .informational
                    alert.addButton(withTitle: "Update Now")
                    alert.addButton(withTitle: "Later")
                    NSApp.activate(ignoringOtherApps: true)
                    if alert.runModal() == .alertFirstButtonReturn {
                        performBrewUpgrade(latest: latest, userInitiated: true)
                    }

                case .failed(let err):
                    guard !silent else { return }
                    let alert = NSAlert()
                    alert.messageText = "Couldn't check for updates"
                    alert.informativeText = err
                    alert.alertStyle = .warning
                    alert.addButton(withTitle: "OK")
                    NSApp.activate(ignoringOtherApps: true)
                    alert.runModal()
                }
            }
        }
    }

    // MARK: - Homebrew upgrade

    /// Path to the brew binary (checks Apple Silicon + Intel locations).
    nonisolated private static var brewPath: String? {
        ["/opt/homebrew/bin/brew", "/usr/local/bin/brew"]
            .first { FileManager.default.isExecutableFile(atPath: $0) }
    }

    /// Run `brew upgrade --cask vishmathpati/mcpbolt/mcpboltbar` in the background.
    /// Shows a relaunch prompt on success; shows an error alert on failure.
    static func performBrewUpgrade(latest: String, userInitiated: Bool) {
        Task.detached(priority: .utility) {
            guard let brew = AppActions.brewPath else {
                guard userInitiated else { return }
                await MainActor.run {
                    let alert = NSAlert()
                    alert.messageText = "Homebrew not found"
                    alert.informativeText = "Couldn't find brew at /opt/homebrew/bin/brew or /usr/local/bin/brew.\n\nDownload the latest release manually from GitHub."
                    alert.alertStyle = .warning
                    alert.addButton(withTitle: "Open Releases")
                    alert.addButton(withTitle: "Cancel")
                    NSApp.activate(ignoringOtherApps: true)
                    if alert.runModal() == .alertFirstButtonReturn { AppActions.openReleases() }
                }
                return
            }

            let proc = Process()
            proc.executableURL = URL(fileURLWithPath: brew)
            proc.arguments = ["upgrade", "--cask", "vishmathpati/mcpbolt/mcpboltbar"]
            proc.environment = [
                "PATH":                     "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
                "HOME":                     NSHomeDirectory(),
                "HOMEBREW_NO_AUTO_UPDATE":  "1",
                "HOMEBREW_NO_ENV_HINTS":    "1",
                "HOMEBREW_NO_ANALYTICS":    "1"
            ]

            let stdoutPipe = Pipe()
            let stderrPipe = Pipe()
            proc.standardOutput = stdoutPipe
            proc.standardError  = stderrPipe

            do { try proc.run() } catch {
                await MainActor.run {
                    AppActions.showUpgradeError("Couldn't start brew: \(error.localizedDescription)", latest: latest)
                }
                return
            }

            proc.waitUntilExit()

            let exitCode = proc.terminationStatus
            let stderr   = String(data: stderrPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
            let stdout   = String(data: stdoutPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""

            await MainActor.run {
                if exitCode == 0 {
                    AppActions.showRelaunchPrompt(latest: latest)
                } else {
                    let detail = (stderr + stdout).trimmingCharacters(in: .whitespacesAndNewlines)
                    AppActions.showUpgradeError(
                        detail.isEmpty ? "brew exited with code \(exitCode)." : String(detail.prefix(400)),
                        latest: latest
                    )
                }
            }
        }
    }

    private static func showRelaunchPrompt(latest: String) {
        let alert = NSAlert()
        alert.messageText = "mcpbolt \(latest) installed"
        alert.informativeText = "Quit and relaunch to use the new version."
        alert.alertStyle = .informational
        alert.addButton(withTitle: "Relaunch Now")
        alert.addButton(withTitle: "Later")
        NSApp.activate(ignoringOtherApps: true)
        if alert.runModal() == .alertFirstButtonReturn {
            relaunchSelf()
        }
    }

    private static func showUpgradeError(_ message: String, latest: String) {
        let alert = NSAlert()
        alert.messageText = "Update failed"
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.addButton(withTitle: "Open Releases")
        alert.addButton(withTitle: "Cancel")
        NSApp.activate(ignoringOtherApps: true)
        if alert.runModal() == .alertFirstButtonReturn { openReleases() }
    }

    // MARK: - Relaunch self

    static func relaunchSelf() {
        // Always launch from /Applications — brew upgrades the binary there,
        // not at Bundle.main.bundlePath which points to the running (old) binary.
        let appURL = URL(fileURLWithPath: "/Applications/MCPBoltBar.app")
        let url = FileManager.default.fileExists(atPath: appURL.path)
            ? appURL
            : URL(fileURLWithPath: Bundle.main.bundlePath)
        let cfg = NSWorkspace.OpenConfiguration()
        cfg.activates = true
        NSWorkspace.shared.openApplication(at: url, configuration: cfg) { _, _ in
            NSApp.terminate(nil)
        }
    }
}
