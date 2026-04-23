import SwiftUI
import AppKit

// MARK: - Projects landing view
//
// Shows the list of recently-used project folders. Each row displays the
// folder name, full path, per-tool server counts, and a ⋯ menu for rename
// / remove / reveal. Tapping a row opens ProjectDetailView inside the same
// tab (local NavigationStack-style state, no system navigation).

struct ProjectsView: View {
    @EnvironmentObject var projects: ProjectStore
    @State private var selection: Project? = nil
    @State private var renamingID: UUID? = nil
    @State private var draftName: String = ""

    var body: some View {
        if let project = selection {
            ProjectDetailView(
                project: project,
                onBack: { withAnimation { selection = nil } }
            )
        } else {
            landing
        }
    }

    // MARK: Landing

    private var landing: some View {
        VStack(spacing: 0) {
            addBar
            Divider()
            let hasAny = !projects.projects.isEmpty || !projects.discovered.isEmpty
            if !hasAny && projects.isScanning {
                scanningState
            } else if !hasAny {
                emptyState
            } else {
                list
            }
        }
    }

    private var addBar: some View {
        HStack(spacing: 6) {
            if projects.isScanning {
                HStack(spacing: 5) {
                    ProgressView().scaleEffect(0.55)
                    Text("Scanning…")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                }
            } else {
                Text("\(projects.projects.count) project\(projects.projects.count == 1 ? "" : "s")")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            Spacer()
            Button(action: { projects.scan() }) {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .buttonStyle(.plain)
            .disabled(projects.isScanning)
            .help("Re-scan this Mac for project folders")
            Button(action: addFolder) {
                HStack(spacing: 4) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 12, weight: .bold))
                    Text("Add folder")
                        .font(.system(size: 12, weight: .semibold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 11)
                .padding(.vertical, 6)
                .background(ContentView.headerGrad)
                .clipShape(RoundedRectangle(cornerRadius: 7))
            }
            .buttonStyle(.plain)
            .help("Add a project folder to manage its MCP configs")
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
    }

    private var list: some View {
        ScrollView {
            VStack(spacing: 6) {
                ForEach(projects.projects) { project in
                    row(for: project)
                }

                if !projects.discovered.isEmpty {
                    discoveredSectionHeader
                    ForEach(projects.discovered) { disc in
                        discoveredRow(for: disc)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
        }
    }

    // MARK: Discovered section

    private var discoveredSectionHeader: some View {
        HStack(spacing: 5) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(.secondary)
            Text("DISCOVERED ON THIS MAC")
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.secondary.opacity(0.7))
                .kerning(0.7)
            Text("\(projects.discovered.count)")
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 5)
                .padding(.vertical, 1)
                .background(Color.secondary.opacity(0.45))
                .clipShape(Capsule())
            Spacer()
        }
        .padding(.top, 10)
        .padding(.bottom, 2)
    }

    private func discoveredRow(for disc: DiscoveredProject) -> some View {
        HStack(alignment: .center, spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.secondary.opacity(0.10))
                    .frame(width: 34, height: 34)
                Image(systemName: "folder")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.secondary)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(disc.displayName)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.primary)
                    .lineLimit(1)
                Text(shortPath(disc.path))
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                    .truncationMode(.middle)
                HStack(spacing: 4) {
                    if disc.hasGit {
                        gitBadge
                    }
                    ForEach(disc.detectedTools, id: \.self) { toolID in
                        toolBadge(toolID: toolID)
                    }
                }
                .padding(.top, 2)
            }

            Spacer()

            Button(action: { projects.addDiscovered(disc) }) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 18))
                    .foregroundColor(.accentColor)
            }
            .buttonStyle(.plain)
            .help("Add to my projects")
        }
        .padding(10)
        .background(Color(NSColor.controlBackgroundColor).opacity(0.6))
        .clipShape(RoundedRectangle(cornerRadius: 9))
        .overlay(
            RoundedRectangle(cornerRadius: 9)
                .stroke(Color(NSColor.separatorColor).opacity(0.3), lineWidth: 0.5)
        )
    }

    private var gitBadge: some View {
        HStack(spacing: 3) {
            Image(systemName: "arrow.triangle.branch")
                .font(.system(size: 8, weight: .semibold))
            Text("git")
                .font(.system(size: 9, weight: .semibold))
        }
        .foregroundColor(.secondary)
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(Color.secondary.opacity(0.10))
        .clipShape(Capsule())
    }

    private func toolBadge(toolID: String) -> some View {
        HStack(spacing: 3) {
            Image(systemName: ToolPalette.icon(for: toolID))
                .font(.system(size: 8, weight: .semibold))
            Text(toolLabel(toolID))
                .font(.system(size: 9, weight: .semibold))
        }
        .foregroundColor(ToolPalette.color(for: toolID))
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(ToolPalette.color(for: toolID).opacity(0.12))
        .clipShape(Capsule())
    }

    // MARK: Row

    private func row(for project: Project) -> some View {
        let counts = projects.counts(for: project)
        let total = counts.reduce(0) { $0 + $1.count }
        let missing = !project.exists
        let isRenaming = renamingID == project.id

        return Button(action: { open(project) }) {
            HStack(alignment: .center, spacing: 10) {
                // Folder icon
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(missing ? Color.secondary.opacity(0.18) : Color.accentColor.opacity(0.14))
                        .frame(width: 34, height: 34)
                    Image(systemName: missing ? "folder.badge.questionmark" : "folder.fill")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(missing ? .secondary : .accentColor)
                }

                VStack(alignment: .leading, spacing: 2) {
                    if isRenaming {
                        TextField("Name", text: $draftName, onCommit: { commitRename(project) })
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 12, weight: .semibold))
                    } else {
                        Text(project.displayName)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(missing ? .secondary : .primary)
                            .lineLimit(1)
                    }
                    Text(shortPath(project.path))
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                    if !counts.isEmpty {
                        HStack(spacing: 4) {
                            ForEach(counts, id: \.toolID) { c in
                                perToolChip(toolID: c.toolID, count: c.count)
                            }
                        }
                        .padding(.top, 2)
                    }
                }

                Spacer()

                if total > 0 {
                    Text("\(total)")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Color.accentColor))
                }

                Menu {
                    Button("Open in Finder") { revealInFinder(project) }
                    Button("Rename\u{2026}") { beginRename(project) }
                    Divider()
                    Button(role: .destructive) { projects.remove(id: project.id) } label: {
                        Text("Remove from list")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 4)
                        .contentShape(Rectangle())
                }
                .menuStyle(.borderlessButton)
                .menuIndicator(.hidden)
                .fixedSize()
            }
            .padding(10)
            .background(
                RoundedRectangle(cornerRadius: 9)
                    .fill(Color(NSColor.controlBackgroundColor))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 9)
                    .stroke(Color(NSColor.separatorColor).opacity(0.4), lineWidth: 0.5)
            )
            .opacity(missing ? 0.75 : 1)
        }
        .buttonStyle(.plain)
        .disabled(isRenaming)
    }

    private func perToolChip(toolID: String, count: Int) -> some View {
        HStack(spacing: 3) {
            Image(systemName: ToolPalette.icon(for: toolID))
                .font(.system(size: 8, weight: .semibold))
            Text("\(toolLabel(toolID)) \(count)")
                .font(.system(size: 9, weight: .semibold))
        }
        .foregroundColor(ToolPalette.color(for: toolID))
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(ToolPalette.color(for: toolID).opacity(0.12))
        .clipShape(Capsule())
    }

    // MARK: Scanning + empty states

    private var scanningState: some View {
        VStack(spacing: 10) {
            ProgressView()
            Text("Scanning for projects on this Mac…")
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(30)
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.accentColor.opacity(0.14), Color.accentColor.opacity(0.06)],
                            startPoint: .topLeading,
                            endPoint:   .bottomTrailing
                        )
                    )
                    .frame(width: 64, height: 64)
                Image(systemName: "folder.fill.badge.plus")
                    .font(.system(size: 26))
                    .foregroundColor(.accentColor)
            }
            Text("No projects yet")
                .font(.system(size: 14, weight: .semibold))
            Text("Add a folder to manage its `.cursor/mcp.json`, `.vscode/mcp.json`, `.roo/mcp.json`, and `.mcp.json` configs.")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            Button(action: addFolder) {
                HStack(spacing: 5) {
                    Image(systemName: "plus.circle.fill")
                    Text("Add your first project")
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
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(30)
    }

    // MARK: Actions

    private func open(_ project: Project) {
        projects.touch(id: project.id)
        withAnimation(.spring(response: 0.28, dampingFraction: 0.8)) {
            selection = project
        }
    }

    private func addFolder() {
        guard let path = projects.pickFolder() else { return }
        projects.add(path: path)
    }

    private func revealInFinder(_ project: Project) {
        NSWorkspace.shared.activateFileViewerSelecting([URL(fileURLWithPath: project.path)])
    }

    private func beginRename(_ project: Project) {
        draftName = project.displayName
        renamingID = project.id
    }

    private func commitRename(_ project: Project) {
        projects.rename(id: project.id, to: draftName)
        renamingID = nil
        draftName = ""
    }

    private func toolLabel(_ toolID: String) -> String {
        ALL_TOOL_META.first(where: { $0.id == toolID })?.label ?? toolID
    }

    private func shortPath(_ path: String) -> String {
        let home = NSHomeDirectory()
        if path.hasPrefix(home) {
            return "~" + path.dropFirst(home.count)
        }
        return path
    }
}
