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
    private var statusItem:    NSStatusItem!
    private var popover:       NSPopover!
    private let store          = ServerStore()
    private let projectStore   = ProjectStore()
    private let settingsStore  = SettingsStore()
    private let codexStore     = CodexSettingsStore()

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Hide from Dock
        NSApp.setActivationPolicy(.accessory)

        setupStatusItem()
        setupPopover()

        store.refresh()

        // On very first launch, open the popover so the user sees where the app lives.
        if !UserDefaults.standard.bool(forKey: "mcpbolt.didShowWelcome") {
            UserDefaults.standard.set(true, forKey: "mcpbolt.didShowWelcome")
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) { [weak self] in
                self?.togglePopover()
            }
        }

        // Silent update check — if autoUpdate is on and a newer version exists,
        // it upgrades via brew automatically. Otherwise only alerts if the user
        // explicitly clicks "Check for Updates…"
        AppActions.checkForUpdates(silent: true)

        // Open Dashboard notification (from ContentView button or menu)
        NotificationCenter.default.addObserver(
            forName: .mcpboltOpenDashboard,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor [weak self] in
                guard let self else { return }
                DashboardWindow.shared.open(
                    store: self.store,
                    projectStore: self.projectStore,
                    settingsStore: self.settingsStore,
                    codexStore: self.codexStore
                )
            }
        }
    }

    // MARK: - URL scheme (mcpbolt://)

    func application(_ application: NSApplication, open urls: [URL]) {
        for url in urls { handleDeepLink(url) }
    }

    private func handleDeepLink(_ url: URL) {
        guard url.scheme == "mcpbolt" else { return }

        // Open the popover first so the user sees the result
        if !popover.isShown, let button = statusItem.button {
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            NSApp.activate(ignoringOtherApps: true)
            store.refresh()
        }

        switch url.host {
        case "install":
            // mcpbolt://install?config=<base64-encoded JSON with mcpServers key>
            handleInstall(url: url)
        case "open-project":
            // mcpbolt://open-project?path=<url-encoded path>
            handleOpenProject(url: url)
        default:
            break
        }
    }

    private func handleInstall(url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let configParam = components.queryItems?.first(where: { $0.name == "config" })?.value,
              let data = Data(base64Encoded: configParam),
              let json = String(data: data, encoding: .utf8) else { return }

        // Post to NotificationCenter so ImportSheet can receive it
        NotificationCenter.default.post(
            name: .mcpboltInstallURL,
            object: nil,
            userInfo: ["json": json]
        )
    }

    private func handleOpenProject(url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let pathParam = components.queryItems?.first(where: { $0.name == "path" })?.value,
              !pathParam.isEmpty else { return }

        let resolved = (pathParam as NSString).expandingTildeInPath
        projectStore.add(path: resolved)

        NotificationCenter.default.post(
            name: .mcpboltOpenProject,
            object: nil,
            userInfo: ["path": resolved]
        )
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
                .environmentObject(settingsStore)
                .environmentObject(codexStore)
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

        menu.addItem(withTitle: "Open Dashboard", action: #selector(openDashboardFromMenu), keyEquivalent: "d")
        menu.addItem(NSMenuItem.separator())

        let autoUpdateItem = NSMenuItem(title: "Auto Update", action: #selector(toggleAutoUpdateFromMenu), keyEquivalent: "")
        autoUpdateItem.state = AppActions.autoUpdateEnabled ? .on : .off
        menu.addItem(autoUpdateItem)
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

    @objc private func openDashboardFromMenu() {
        DashboardWindow.shared.open(store: store, projectStore: projectStore, settingsStore: settingsStore, codexStore: codexStore)
    }
    @objc private func refreshFromMenu()          { store.refresh() }
    @objc private func checkForUpdatesFromMenu()  { AppActions.checkForUpdates() }
    @objc private func toggleAutoUpdateFromMenu() { AppActions.autoUpdateEnabled.toggle() }
    @objc private func aboutFromMenu()            { AppActions.about() }
    @objc private func openRepoFromMenu()         { AppActions.openRepo() }
}

// MARK: - Notification names for URL scheme events

extension Notification.Name {
    static let mcpboltInstallURL    = Notification.Name("com.mcpbolt.installURL")
    static let mcpboltOpenProject   = Notification.Name("com.mcpbolt.openProject")
    static let mcpboltOpenDashboard = Notification.Name("com.mcpbolt.openDashboard")
}
