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
        Button(action: {
            withAnimation(.spring(response: 0.28, dampingFraction: 0.75)) {
                expanded.toggle()
            }
        }) {
            HStack(spacing: 11) {
                // Colored icon tile
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(accent.opacity(0.16))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(accent)
                }

                // App name + preview
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

                // Count badge
                if filteredServers.count > 0 {
                    Text("\(filteredServers.count)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(accent)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(accent.opacity(0.14))
                        .clipShape(Capsule())
                }

                // Chevron
                Image(systemName: "chevron.down")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.secondary)
                    .rotationEffect(.degrees(expanded ? 0 : -90))
                    .animation(.spring(response: 0.28, dampingFraction: 0.75), value: expanded)
            }
            .contentShape(Rectangle())
            .padding(.horizontal, 12)
            .padding(.vertical, 11)
        }
        .buttonStyle(.plain)
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
                     : "No matches for “\(store.searchText)”")
                    .font(.system(size: 11))
            }
            .foregroundColor(.secondary)
            .padding(.leading, 60)
            .padding(.bottom, 12)
        } else {
            VStack(alignment: .leading, spacing: 0) {
                Divider().padding(.leading, 60)
                ForEach(filteredServers) { server in
                    ServerRow(server: server, accent: accent)
                    if server.id != filteredServers.last?.id {
                        Divider().padding(.leading, 60).opacity(0.4)
                    }
                }
            }
            .padding(.bottom, 6)
        }
    }
}

// MARK: - Server row (friendly, no terminal text)

struct ServerRow: View {
    let server: ServerEntry
    let accent: Color

    @State private var hovering = false
    @State private var confirming = false

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

    var body: some View {
        HStack(spacing: 9) {
            // Dot
            Circle()
                .fill(accent.opacity(0.75))
                .frame(width: 6, height: 6)

            // Name
            Text(server.name)
                .font(.system(size: 12.5, weight: .medium))
                .foregroundColor(.primary)
                .lineLimit(1)

            // Kind chip (Local / Remote)
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

            Spacer(minLength: 0)

            // Delete button (always visible, subtle)
            Button(action: { confirming = true }) {
                Image(systemName: "trash")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(hovering ? .red : .secondary)
                    .padding(4)
            }
            .buttonStyle(.plain)
            .onHover { hovering = $0 }
            .help("Remove \(server.name)")
            .confirmationDialog(
                "Remove “\(server.name)”?",
                isPresented: $confirming,
                titleVisibility: .visible
            ) {
                Button("Remove…", role: .destructive) {
                    ActionRunner.remove(serverName: server.name)
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Opens Terminal so you can pick which apps to remove it from.")
            }
        }
        .padding(.leading, 60)
        .padding(.trailing, 10)
        .padding(.vertical, 6)
        .contentShape(Rectangle())
        .background(hovering ? accent.opacity(0.05) : Color.clear)
        .onHover { hovering = $0 }
    }
}
