import SwiftUI
import AppKit

// MARK: - Full-size dashboard window
//
// Opens a standalone NSWindow (1200×800, resizable) showing the same
// ContentView that lives inside the popover, but with room to breathe.
// Only one instance exists at a time — calling open() on an existing
// window just brings it to front.

@MainActor
final class DashboardWindow {

    static let shared = DashboardWindow()

    private var window: NSWindow?
    private var hostingController: NSHostingController<AnyView>?

    private init() {}

    func open(store: ServerStore, projectStore: ProjectStore, settingsStore: SettingsStore, codexStore: CodexSettingsStore) {
        if let existing = window, existing.isVisible {
            existing.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        let content = DashboardRootView()
            .environmentObject(store)
            .environmentObject(projectStore)
            .environmentObject(settingsStore)
            .environmentObject(codexStore)

        let hc = NSHostingController(rootView: AnyView(content))
        hostingController = hc

        let w = NSWindow(contentViewController: hc)
        w.title = "mcpbolt"
        w.setContentSize(NSSize(width: 1200, height: 800))
        w.minSize = NSSize(width: 720, height: 540)
        w.styleMask = [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView]
        w.titlebarAppearsTransparent = false
        w.isReleasedWhenClosed = false
        w.center()
        w.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        window = w
    }

    var isOpen: Bool { window?.isVisible ?? false }
}

// MARK: - Dashboard root view (wider layout, same tabs)

struct DashboardRootView: View {
    @EnvironmentObject var store: ServerStore
    @EnvironmentObject var projects: ProjectStore
    @EnvironmentObject var settings: SettingsStore
    @EnvironmentObject var codex: CodexSettingsStore
    @StateObject private var overlay = OverlayPresenter()

    @State private var tab: Int = 0

    var body: some View {
        HSplitView {
            // Left sidebar: tab navigator
            sidebar
                .frame(minWidth: 180, idealWidth: 200, maxWidth: 240)

            // Right main content
            VStack(spacing: 0) {
                dashboardToolbar
                Divider()
                dashboardContent
            }
            .frame(minWidth: 480)
        }
        .frame(minWidth: 720, minHeight: 540)
        .environmentObject(overlay)
        // Overlay sheets (same as popover)
        .sheet(isPresented: Binding(
            get: { overlay.overlay == .importSheet },
            set: { if !$0 { overlay.dismiss() } }
        )) {
            ImportSheet(onClose: { overlay.dismiss() })
                .environmentObject(store)
                .environmentObject(overlay)
                .frame(minWidth: 500, minHeight: 400)
        }
    }

    // MARK: Sidebar

    private var sidebar: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.12))
                        .frame(width: 28, height: 28)
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.yellow)
                }
                Text("mcpbolt")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity)
            .background(ContentView.headerGrad)

            Divider()

            // Stats
            VStack(spacing: 2) {
                sidebarStat(value: "\(store.serverCount)", label: "servers", icon: "server.rack")
                sidebarStat(value: "\(store.detectedTools.count)", label: "apps", icon: "app.badge.checkmark")
            }
            .padding(.horizontal, 10)
            .padding(.top, 12)
            .padding(.bottom, 8)

            Divider().padding(.horizontal, 10)

            // Nav items
            VStack(spacing: 2) {
                sidebarRow(title: "By App",   icon: "app.badge.checkmark", tag: 0)
                sidebarRow(title: "Coverage", icon: "tablecells.fill",     tag: 1)
                sidebarRow(title: "Projects", icon: "folder.fill",         tag: 2)
                sidebarRow(title: "Settings", icon: "gearshape.fill",      tag: 3)
            }
            .padding(.horizontal, 8)
            .padding(.top, 8)

            Spacer()

            // Bottom actions
            VStack(spacing: 4) {
                Divider()
                Button(action: { store.refresh() }) {
                    Label("Refresh", systemImage: "arrow.clockwise")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
            }
        }
        .background(Color(NSColor.windowBackgroundColor))
    }

    private func sidebarStat(value: String, label: String, icon: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.secondary)
            Text("\(value) \(label)")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
            Spacer()
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 3)
    }

    private func sidebarRow(title: String, icon: String, tag: Int) -> some View {
        let active = self.tab == tag
        return Button(action: {
            withAnimation(.spring(response: 0.22, dampingFraction: 0.8)) { self.tab = tag }
        }) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .semibold))
                    .frame(width: 20)
                    .foregroundColor(active ? .accentColor : .secondary)
                Text(title)
                    .font(.system(size: 13, weight: active ? .semibold : .regular))
                    .foregroundColor(active ? .primary : .secondary)
                Spacer()
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(active
                ? Color.accentColor.opacity(0.12)
                : Color.clear
            )
            .clipShape(RoundedRectangle(cornerRadius: 7))
        }
        .buttonStyle(.plain)
    }

    // MARK: Toolbar

    private var dashboardToolbar: some View {
        HStack(spacing: 10) {
            HStack(spacing: 6) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                TextField("Search servers…", text: $store.searchText)
                    .textFieldStyle(.plain)
                    .font(.system(size: 13))
                if !store.searchText.isEmpty {
                    Button(action: { store.searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }.buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(Color(NSColor.controlBackgroundColor))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8)
                .stroke(Color(NSColor.separatorColor).opacity(0.5), lineWidth: 0.5))

            Spacer()

            Button(action: {
                withAnimation { overlay.show(.importSheet) }
            }) {
                HStack(spacing: 5) {
                    Image(systemName: "plus.circle.fill")
                    Text("Import server")
                }
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(ContentView.headerGrad)
                .clipShape(RoundedRectangle(cornerRadius: 7))
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    // MARK: Content

    @ViewBuilder
    private var dashboardContent: some View {
        switch tab {
        case 3:
            SettingsEditorView()
                .environmentObject(settings)
                .environmentObject(projects)
                .environmentObject(codex)
        case 2:
            ProjectsView()
                .environmentObject(projects)
        case 1:
            CoverageView()
        default:
            if store.detectedTools.isEmpty && !store.isLoading {
                emptyState
            } else {
                ByToolView()
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 14) {
            Image(systemName: "tray.fill")
                .font(.system(size: 36))
                .foregroundColor(.secondary)
            Text("No MCP servers yet")
                .font(.system(size: 16, weight: .semibold))
            Text("Click Import to add your first one.")
                .foregroundColor(.secondary)
            Button(action: { overlay.show(.importSheet) }) {
                Label("Import a server", systemImage: "plus.circle.fill")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 9)
                    .background(ContentView.headerGrad)
                    .clipShape(Capsule())
            }.buttonStyle(.plain)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
