import SwiftUI

// MARK: - Root content view

struct ContentView: View {
    @EnvironmentObject var store: ServerStore
    @State private var tab: Int = 0
    @State private var showingImport: Bool = false

    // Header gradient — refined graphite (no purple)
    static let headerGrad = LinearGradient(
        colors: [
            Color(red: 0.10, green: 0.12, blue: 0.15),
            Color(red: 0.19, green: 0.22, blue: 0.27),
        ],
        startPoint: .topLeading,
        endPoint:   .bottomTrailing
    )

    var body: some View {
        VStack(spacing: 0) {
            if showingImport {
                ImportSheet(onClose: {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.78)) {
                        showingImport = false
                    }
                })
            } else {
                header
                toolbar
                tabBar
                Divider()
                content
            }
        }
        .frame(width: 460)
    }

    // MARK: - Gradient header

    private var header: some View {
        HStack(spacing: 10) {
            // Bolt in glowing circle
            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.10))
                    .frame(width: 30, height: 30)
                Image(systemName: "bolt.fill")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.yellow)
            }

            Text("mcpbolt")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)

            Spacer()

            if store.isLoading {
                ProgressView()
                    .scaleEffect(0.6)
                    .frame(width: 18, height: 18)
                    .colorScheme(.dark)
            } else {
                statPill(
                    value: "\(store.serverCount)",
                    label: "server\(store.serverCount == 1 ? "" : "s")",
                    icon:  "server.rack"
                )
                statPill(
                    value: "\(store.detectedTools.count)",
                    label: "apps",
                    icon:  "app.badge.checkmark"
                )

                Button(action: { store.refresh() }) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                }
                .buttonStyle(.plain)
                .padding(.leading, 2)
                .help("Refresh")
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(ContentView.headerGrad)
    }

    private func statPill(value: String, label: String, icon: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 9, weight: .medium))
            Text("\(value) \(label)")
                .font(.system(size: 11, weight: .medium))
        }
        .foregroundColor(.white.opacity(0.88))
        .padding(.horizontal, 9)
        .padding(.vertical, 5)
        .background(Color.white.opacity(0.14))
        .clipShape(Capsule())
    }

    // MARK: - Search + Install toolbar

    private var toolbar: some View {
        HStack(spacing: 8) {
            // Search field
            HStack(spacing: 6) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
                TextField("Search servers…", text: $store.searchText)
                    .textFieldStyle(.plain)
                    .font(.system(size: 12))
                if !store.searchText.isEmpty {
                    Button(action: { store.searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(Color(NSColor.controlBackgroundColor))
            .clipShape(RoundedRectangle(cornerRadius: 7))
            .overlay(
                RoundedRectangle(cornerRadius: 7)
                    .stroke(Color(NSColor.separatorColor).opacity(0.6), lineWidth: 0.5)
            )

            // Install button
            Button(action: {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.78)) {
                    showingImport = true
                }
            }) {
                HStack(spacing: 4) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 12, weight: .bold))
                    Text("Import")
                        .font(.system(size: 12, weight: .semibold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 11)
                .padding(.vertical, 6)
                .background(ContentView.headerGrad)
                .clipShape(RoundedRectangle(cornerRadius: 7))
            }
            .buttonStyle(.plain)
            .help("Import an MCP server from JSON")
        }
        .padding(.horizontal, 12)
        .padding(.top, 10)
        .padding(.bottom, 8)
    }

    // MARK: - Tab bar (pill style)

    private var tabBar: some View {
        HStack(spacing: 6) {
            tabButton(title: "By App",   icon: "app.badge.checkmark", tag: 0)
            tabButton(title: "Coverage", icon: "tablecells.fill",     tag: 1)
        }
        .padding(.horizontal, 12)
        .padding(.bottom, 8)
    }

    private func tabButton(title: String, icon: String, tag: Int) -> some View {
        let active = tab == tag
        return Button(action: {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.78)) {
                self.tab = tag
            }
        }) {
            HStack(spacing: 5) {
                Image(systemName: icon)
                    .font(.system(size: 11, weight: .semibold))
                Text(title)
                    .font(.system(size: 12, weight: .semibold))
            }
            .foregroundColor(active ? .white : .secondary)
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .background(
                Group {
                    if active {
                        ContentView.headerGrad
                    } else {
                        Color(NSColor.controlBackgroundColor)
                    }
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(active ? Color.clear : Color(NSColor.separatorColor).opacity(0.6), lineWidth: 0.5)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Tab content

    @ViewBuilder
    private var content: some View {
        if store.detectedTools.isEmpty && !store.isLoading {
            emptyState
        } else if tab == 0 {
            ByToolView()
        } else {
            CoverageView()
        }
    }

    // MARK: - Empty state

    private var emptyState: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.purple.opacity(0.15), Color.indigo.opacity(0.08)],
                            startPoint: .topLeading,
                            endPoint:   .bottomTrailing
                        )
                    )
                    .frame(width: 68, height: 68)
                Image(systemName: "tray.fill")
                    .font(.system(size: 28))
                    .foregroundColor(.secondary)
            }
            Text("No MCP servers yet")
                .font(.system(size: 14, weight: .semibold))
            Text("Click Install to add your first one.")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button(action: {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.78)) {
                    showingImport = true
                }
            }) {
                HStack(spacing: 5) {
                    Image(systemName: "plus.circle.fill")
                    Text("Import a server")
                }
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(ContentView.headerGrad)
                .clipShape(Capsule())
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(40)
    }
}
