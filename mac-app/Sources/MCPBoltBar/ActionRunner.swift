import Foundation
import AppKit

// MARK: - Runs mcpbolt CLI commands in Terminal (no technical jargon in the UI)

enum ActionRunner {

    /// Open the install picker (equivalent to `mcpbolt`).
    static func install() {
        runInTerminal("mcpbolt")
    }

    /// Interactively remove a server by name (user picks which tools in the TTY).
    static func remove(serverName: String) {
        // Shell-quote the name just in case
        let safe = serverName.replacingOccurrences(of: "\"", with: "\\\"")
        runInTerminal("mcpbolt remove \"\(safe)\"")
    }

    /// Show the `mcpbolt list` output (for users who want the full picture).
    static func showList() {
        runInTerminal("mcpbolt list")
    }

    // MARK: - Internals

    /// Launches Terminal.app, opens a new window, runs the command.
    private static func runInTerminal(_ command: String) {
        let escaped = command.replacingOccurrences(of: "\"", with: "\\\"")
        let script = """
        tell application "Terminal"
            activate
            do script "\(escaped)"
        end tell
        """
        if let obj = NSAppleScript(source: script) {
            var err: NSDictionary?
            obj.executeAndReturnError(&err)
            if let err = err {
                NSLog("ActionRunner error: \(err)")
            }
        }
    }
}
