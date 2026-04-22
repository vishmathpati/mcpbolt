import SwiftUI
import AppKit

// MARK: - Entry point

@main
struct MCPBoltBarApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        // No windows — this is a menu bar only app.
        // Settings scene is required to avoid "no scenes" crash.
        Settings { EmptyView() }
    }
}

// MARK: - App delegate (manages status item + popover)

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem!
    private var popover:    NSPopover!
    private let store = ServerStore()
    private let projectStore = ProjectStore()

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Hide from Dock
        NSApp.setActivationPolicy(.accessory)

        setupStatusItem()
        setupPopover()

        store.refresh()

        // Silent update check on launch — shows an alert only if a newer
        // version is available. Never bothers the user otherwise.
        AppActions.checkForUpdates(silent: true)
    }

    // MARK: - Status item

    private func setupStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        guard let button = statusItem.button else { return }

        let img = NSImage(systemSymbolName: "bolt.fill", accessibilityDescription: "mcpbolt")
        img?.isTemplate = true
        button.image = img
        button.imagePosition = .imageLeft
        button.action = #selector(handleClick)
        button.target = self
        button.sendAction(on: [.leftMouseUp, .rightMouseUp])
    }

    @objc private func handleClick(sender: NSStatusBarButton) {
        guard let event = NSApp.currentEvent else { return }
        if event.type == .rightMouseUp {
            showContextMenu()
        } else {
            togglePopover()
        }
    }

    // MARK: - Popover

    private func setupPopover() {
        popover = NSPopover()
        popover.contentSize = NSSize(width: 460, height: 720)
        popover.behavior = .transient
        popover.contentViewController = NSHostingController(
            rootView: ContentView()
                .environmentObject(store)
                .environmentObject(projectStore)
        )
    }

    @objc private func togglePopover() {
        if popover.isShown {
            popover.performClose(nil)
        } else {
            guard let button = statusItem.button else { return }
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            NSApp.activate(ignoringOtherApps: true)
            // Refresh data every time the popover opens
            store.refresh()
        }
    }

    // MARK: - Right-click menu

    private func showContextMenu() {
        let menu = NSMenu()

        let header = NSMenuItem(title: "mcpbolt \(AppActions.currentVersion)", action: nil, keyEquivalent: "")
        header.isEnabled = false
        menu.addItem(header)
        menu.addItem(NSMenuItem.separator())

        menu.addItem(withTitle: "Refresh", action: #selector(refreshFromMenu), keyEquivalent: "r")
        menu.addItem(withTitle: "Check for Updates…", action: #selector(checkForUpdatesFromMenu), keyEquivalent: "")
        menu.addItem(NSMenuItem.separator())
        menu.addItem(withTitle: "About mcpbolt", action: #selector(aboutFromMenu), keyEquivalent: "")
        menu.addItem(withTitle: "Visit GitHub", action: #selector(openRepoFromMenu), keyEquivalent: "")
        menu.addItem(NSMenuItem.separator())
        menu.addItem(withTitle: "Quit mcpbolt", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        menu.items.forEach { if $0.action != nil { $0.target = self } }
        statusItem.menu = menu
        statusItem.button?.performClick(nil)
        statusItem.menu = nil  // reset so left click works normally again
    }

    @objc private func refreshFromMenu()          { store.refresh() }
    @objc private func checkForUpdatesFromMenu()  { AppActions.checkForUpdates() }
    @objc private func aboutFromMenu()            { AppActions.about() }
    @objc private func openRepoFromMenu()         { AppActions.openRepo() }
}
