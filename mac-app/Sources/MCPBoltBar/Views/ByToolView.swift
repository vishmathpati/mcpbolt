import SwiftUI
import AppKit

// MARK: - "By App" tab — friendly server cards, no terminal text

struct ByToolView: View {
    @EnvironmentObject var store: ServerStore

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 10) {
                ForEach(store.detectedTools) { tool in
                    ToolCard(tool: tool)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 12)
        }
        .frame(maxHeight: 460)
    }
}

// MARK: - Per-app card

struct ToolCard: View {
    let tool: ToolSummary
    @EnvironmentObject var store: ServerStore
    @State private var expanded = true

    private var accent: Color { ToolPalette.color(for: tool.toolID) }
    private var icon:   String { ToolPalette.icon(for: tool.toolID)  }

    private var filteredServers: [ServerEntry] {
        tool.servers.filter { store.matches($0.name) }
    }

    // Hide whole card if user searched and nothing matched
    private var shouldShow: Bool {
        store.searchText.trimmingCharacters(in: .whitespaces).isEmpty ||
        !filteredServers.isEmpty
    }

    var body: some View {
        if shouldShow {
            VStack(alignment: .leading, spacing: 0) {
                cardHeader
                if expanded { cardBody }
            }
            .background(Color(NSColor.controlBackgroundColor))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        expanded ? accent.opacity(0.28) : Color(NSColor.separatorColor).opacity(0.55),
                        lineWidth: 1
                    )
            )
            .shadow(color: Color.black.opacity(0.04), radius: 2, x: 0, y: 1)
        }
    }

    // MARK: Card header

    private var cardHeader: some View {
        HStack(spacing: 11) {
            Button(action: {
                withAnimation(.spring(response: 0.28, dampingFraction: 0.75)) {
                    expanded.toggle()
                }
            }) {
                HStack(spacing: 11) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(accent.opacity(0.16))
                            .frame(width: 36, height: 36)
                        Image(systemName: icon)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(accent)
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text(tool.label)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.primary)

                        if expanded {
                            Text(countLabel)
                                .font(.system(size: 11))
                                .foregroundColor(.secondary)
                        } else if !filteredServers.isEmpty {
                            let preview = filteredServers.prefix(3).map { $0.name }.joined(separator: " · ")
                            let extra   = filteredServers.count > 3 ? " +\(filteredServers.count - 3)" : ""
                            Text(preview + extra)
                                .font(.system(size: 11))
                                .foregroundColor(.secondary)
                                .lineLimit(1)
                        }
                    }
                    Spacer()
                    if filteredServers.count > 0 {
                        Text("\(filteredServers.count)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(accent)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(accent.opacity(0.14))
                            .clipShape(Capsule())
                    }
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            // Tool-level menu: Restart / Undo
            ToolCardMenu(toolID: tool.toolID, toolLabel: tool.label)

            // Chevron
            Image(systemName: "chevron.down")
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.secondary)
                .rotationEffect(.degrees(expanded ? 0 : -90))
                .animation(.spring(response: 0.28, dampingFraction: 0.75), value: expanded)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 11)
    }

    private var countLabel: String {
        let n = filteredServers.count
        if n == 0 { return "No servers installed" }
        return "\(n) server\(n == 1 ? "" : "s") installed"
    }

    // MARK: Card body

    @ViewBuilder
    private var cardBody: some View {
        if filteredServers.isEmpty {
            HStack(spacing: 6) {
                Image(systemName: "tray")
                    .font(.system(size: 11))
                Text(store.searchText.isEmpty
                     ? "Nothing installed yet"
                     : "No matches for \u{201C}\(store.searchText)\u{201D}")
                    .font(.system(size: 11))
            }
            .foregroundColor(.secondary)
            .padding(.leading, 60)
            .padding(.bottom, 12)
        } else {
            VStack(alignment: .leading, spacing: 0) {
                Divider().padding(.leading, 60)
                ForEach(filteredServers) { server in
                    ServerRow(server: server, accent: accent, toolID: tool.toolID, toolLabel: tool.label)
                    if server.id != filteredServers.last?.id {
                        Divider().padding(.leading, 60).opacity(0.4)
                    }
                }
            }
            .padding(.bottom, 6)
        }
    }
}

// MARK: - Tool-level menu (Restart host app, Undo last change)

struct ToolCardMenu: View {
    let toolID: String
    let toolLabel: String
    @EnvironmentObject var store: ServerStore

    @State private var isRestarting = false
    @State private var resultAlert: String? = nil

    var body: some View {
        Menu {
            let hostBundleID = AppRestart.bundleID(for: toolID)
            if hostBundleID != nil {
                Button {
                    Task { await restart() }
                } label: {
                    Label(
                        AppRestart.isRunning(toolID: toolID)
                            ? "Restart \(AppRestart.displayName(for: toolID))"
                            : "Launch \(AppRestart.displayName(for: toolID))",
                        systemImage: "arrow.clockwise.circle"
                    )
                }
            } else {
                Text(AppRestart.manualHint(for: toolID))
                    .foregroundColor(.secondary)
            }

            Divider()

            if store.hasUndoableChange(toolID: toolID) {
                Button {
                    let r = store.undoLastChange(toolID: toolID)
                    if !r.ok { resultAlert = r.error ?? "Couldn't undo." }
                } label: {
                    Label("Undo last change", systemImage: "arrow.uturn.backward")
                }
            } else {
                Text("No recent changes to undo")
                    .foregroundColor(.secondary)
            }
        } label: {
            Image(systemName: isRestarting ? "arrow.triangle.2.circlepath" : "ellipsis")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.secondary)
                .padding(5)
                .contentShape(Rectangle())
        }
        .menuStyle(.borderlessButton)
        .menuIndicator(.hidden)
        .fixedSize()
        .alert("Note", isPresented: Binding(
            get: { resultAlert != nil },
            set: { if !$0 { resultAlert = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(resultAlert ?? "")
        }
    }

    private func restart() async {
        isRestarting = true
        let r = await AppRestart.restart(toolID: toolID)
        isRestarting = false
        switch r {
        case .restarted:        break
        case .notRunning:       break
        case .notRestartable(let hint): resultAlert = hint
        case .failed(let msg):          resultAlert = msg
        }
    }
}

// MARK: - Server row (name + kind chip + health dot + ⋯ menu)

struct ServerRow: View {
    let server: ServerEntry
    let accent: Color
    let toolID: String
    let toolLabel: String

    @EnvironmentObject var store: ServerStore
    @EnvironmentObject var overlay: OverlayPresenter
    @State private var hovering = false
    @State private var confirming = false
    @State private var errorMessage: String? = nil
    @State private var showingError = false
    @State private var removing = false

    // Delete-everywhere confirm
    @State private var confirmingEverywhere = false

    // Health
    @State private var health: HealthStatus = .unknown
    @State private var checkingHealth = false

    private var kindLabel: String {
        switch server.transport {
        case "http", "sse": return "Remote"
        default:            return "Local"
        }
    }

    private var kindIcon: String {
        switch server.transport {
        case "http", "sse": return "globe"
        default:            return "desktopcomputer"
        }
    }

    private var kindColor: Color {
        server.transport == "stdio" ? Color.secondary : accent
    }

    private var nativeSupported: Bool {
        ConfigWriter.supportsNativeWrite(toolID: toolID)
    }

    private var hostCount: Int {
        store.toolsHosting(name: server.name).count
    }

    var body: some View {
        HStack(spacing: 9) {
            Circle()
                .fill(accent.opacity(0.75))
                .frame(width: 6, height: 6)

            Text(server.name)
                .font(.system(size: 12.5, weight: .medium))
                .foregroundColor(.primary)
                .lineLimit(1)

            HStack(spacing: 3) {
                Image(systemName: kindIcon)
                    .font(.system(size: 9, weight: .semibold))
                Text(kindLabel)
                    .font(.system(size: 10, weight: .semibold))
            }
            .foregroundColor(kindColor)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(kindColor.opacity(0.12))
            .clipShape(Capsule())

            healthDot

            Spacer(minLength: 0)

            // Action menu
            Menu {
                Button {
                    overlay.show(.editServer(toolID: toolID, toolLabel: toolLabel, serverName: server.name))
                } label: {
                    Label("Edit\u{2026}", systemImage: "pencil")
                }
                .disabled(!nativeSupported)

                Button {
                    overlay.show(.copyToApps(toolID: toolID, toolLabel: toolLabel, serverName: server.name))
                } label: {
                    Label("Copy to other apps\u{2026}", systemImage: "square.on.square")
                }

                Button {
                    Task { await runHealthCheck() }
                } label: {
                    Label("Check health", systemImage: "heart.text.square")
                }

                Button {
                    copyInstallLink()
                } label: {
                    Label("Copy install link", systemImage: "link.badge.plus")
                }

                Divider()

                Button(role: .destructive) {
                    confirming = true
                } label: {
                    Label("Remove from \(toolLabel)", systemImage: "trash")
                }
                .disabled(!nativeSupported)

                if hostCount > 1 {
                    Button(role: .destructive) {
                        confirmingEverywhere = true
                    } label: {
                        Label("Remove from all (\(hostCount)) apps", systemImage: "trash.slash")
                    }
                }
            } label: {
                if removing {
                    ProgressView().scaleEffect(0.45).frame(width: 14, height: 14)
                } else {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(hovering ? .primary : .secondary)
                        .padding(4)
                        .contentShape(Rectangle())
                }
            }
            .menuStyle(.borderlessButton)
            .menuIndicator(.hidden)
            .fixedSize()
        }
        .padding(.leading, 60)
        .padding(.trailing, 10)
        .padding(.vertical, 6)
        .contentShape(Rectangle())
        .background(hovering ? accent.opacity(0.05) : Color.clear)
        .onHover { hovering = $0 }
        .confirmationDialog(
            "Remove \u{201C}\(server.name)\u{201D} from \(toolLabel)?",
            isPresented: $confirming,
            titleVisibility: .visible
        ) {
            Button("Remove", role: .destructive) { performRemove() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text(nativeSupported
                 ? "A backup of the config file is saved before removing."
                 : "\(toolLabel) uses a config format we can't edit yet. Remove it manually.")
        }
        .confirmationDialog(
            "Remove \u{201C}\(server.name)\u{201D} from all \(hostCount) apps?",
            isPresented: $confirmingEverywhere,
            titleVisibility: .visible
        ) {
            Button("Remove everywhere", role: .destructive) { performRemoveEverywhere() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This deletes \(server.name) from every detected app that has it. Each file is backed up first.")
        }
        .alert("Couldn't remove server", isPresented: $showingError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "Unknown error.")
        }
    }

    // MARK: Health indicator

    @ViewBuilder
    private var healthDot: some View {
        let color: Color = {
            switch health {
            case .ok:       return .green
            case .warn:     return .orange
            case .fail:     return .red
            case .unknown:  return .clear
            }
        }()
        if checkingHealth {
            ProgressView().scaleEffect(0.35).frame(width: 10, height: 10)
        } else if case .unknown = health {
            EmptyView()
        } else {
            Circle()
                .fill(color)
                .frame(width: 7, height: 7)
                .help(healthTooltip)
        }
    }

    private var healthTooltip: String {
        switch health {
        case .ok(let d):   return "OK — \(d)"
        case .warn(let d): return "Warning — \(d)"
        case .fail(let d): return "Failed — \(d)"
        case .unknown:     return ""
        }
    }

    // MARK: Actions

    private func performRemove() {
        removing = true
        Task { @MainActor in
            let outcome = store.removeServer(toolID: toolID, name: server.name)
            removing = false
            if !outcome.ok {
                errorMessage = outcome.error
                showingError = true
            }
        }
    }

    private func performRemoveEverywhere() {
        removing = true
        Task { @MainActor in
            let outcome = store.removeServerEverywhere(name: server.name)
            removing = false
            if !outcome.failures.isEmpty && outcome.successes.isEmpty {
                errorMessage = outcome.failures.first?.message ?? "Unknown error"
                showingError = true
            }
        }
    }

    private func runHealthCheck() async {
        checkingHealth = true
        health = await HealthCheck.check(server)
        checkingHealth = false
    }

    // MARK: Copy install link

    private func copyInstallLink() {
        // Build { mcpServers: { name: config } } from the live server config
        guard let config = ConfigWriter.readServer(toolID: toolID, name: server.name) else {
            // Fallback: build from the server entry we already have
            let config = buildFallbackConfig()
            writeInstallLink(name: server.name, config: config)
            return
        }
        writeInstallLink(name: server.name, config: config)
    }

    private func buildFallbackConfig() -> [String: Any] {
        var c: [String: Any] = ["command": server.command ?? "", "args": server.args]
        if let url = server.url { c = ["url": url] }
        return c
    }

    private func writeInstallLink(name: String, config: [String: Any]) {
        let payload: [String: Any] = ["mcpServers": [name: config]]
        guard let data   = try? JSONSerialization.data(withJSONObject: payload),
              let b64    = data.base64EncodedString().addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)
        else { return }

        let deepLink = "mcpbolt://install?config=\(b64)"
        let markdown = "[![Install in mcpbolt](https://img.shields.io/badge/Install%20in-mcpbolt-F4C01E?logo=lightning)](\(deepLink))"
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(markdown, forType: .string)
    }
}
