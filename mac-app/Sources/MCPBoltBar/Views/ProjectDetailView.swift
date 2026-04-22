import SwiftUI
import AppKit

// MARK: - Project detail view
//
// Drill-in from ProjectsView. For each project-scoped tool (cursor, vscode,
// roo, claude-code) reads the project-scope config file and shows the list
// of MCP servers in it. Supports edit + remove per server via project-scope
// ConfigWriter calls. "Edit" opens EditServerSheet in project-scope mode
// (via OverlayPresenter).

struct ProjectDetailView: View {
    let project: Project
    let onBack: () -> Void

    @EnvironmentObject var store: ServerStore
    @EnvironmentObject var overlay: OverlayPresenter

    // Reload tick — bumped after any project-scope mutation so we re-read
    // from disk and refresh the list. Project scope lives outside of
    // ServerStore's cache so we manage freshness locally.
    @State private var reloadTick: Int = 0

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            content
        }
        .onChange(of: overlay.overlay) { _, newValue in
            // When the overlay closes (e.g. EditServerSheet dismissed) refresh
            // the project view so edits land immediately.
            if newValue == .none { reloadTick &+= 1 }
        }
    }

    // MARK: Header

    private var header: some View {
        HStack(spacing: 10) {
            Button(action: onBack) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.secondary)
                    .frame(width: 26, height: 26)
                    .background(Color(NSColor.controlBackgroundColor))
                    .clipShape(Circle())
                    .overlay(
                        Circle().stroke(Color(NSColor.separatorColor).opacity(0.5), lineWidth: 0.5)
                    )
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 1) {
                Text(project.displayName)
                    .font(.system(size: 14, weight: .bold))
                    .lineLimit(1)
                Text(shortPath(project.path))
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                    .truncationMode(.middle)
            }

            Spacer()

            Button {
                NSWorkspace.shared.activateFileViewerSelecting([URL(fileURLWithPath: project.path)])
            } label: {
                Image(systemName: "arrow.up.right.square")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .buttonStyle(.plain)
            .help("Open in Finder")

            Button { reloadTick &+= 1 } label: {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .buttonStyle(.plain)
            .help("Refresh")
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
    }

    // MARK: Content

    @ViewBuilder
    private var content: some View {
        let sections = makeSections()
        if sections.allSatisfy({ $0.servers.isEmpty }) {
            emptyState
        } else {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 10) {
                    ForEach(sections, id: \.toolID) { section in
                        ProjectToolSection(
                            project: project,
                            toolID: section.toolID,
                            label: section.label,
                            servers: section.servers,
                            onMutated: { reloadTick &+= 1 }
                        )
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 12)
            }
            .frame(maxHeight: .infinity)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "tray")
                .font(.system(size: 26))
                .foregroundColor(.secondary)
            Text("No project MCP configs yet")
                .font(.system(size: 13, weight: .semibold))
            Text("Add a server to this folder using your tool's normal workflow (e.g. `claude mcp add --scope project …`). mcpbolt will detect and surface it here.")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(30)
    }

    // MARK: Section assembly

    private struct Section {
        let toolID: String
        let label: String
        let servers: [(name: String, config: [String: Any])]
    }

    private func makeSections() -> [Section] {
        _ = reloadTick  // ensure re-eval
        var out: [Section] = []
        for toolID in ToolSpecs.projectScopedTools.sorted() {
            let dict = ConfigWriter.readAllServers(
                toolID: toolID,
                scope: .project,
                projectRoot: project.path
            )
            let servers = dict.keys.sorted().map { key in
                (name: key, config: dict[key] ?? [:])
            }
            out.append(Section(
                toolID: toolID,
                label: toolLabel(toolID),
                servers: servers
            ))
        }
        // Show sections with servers first; hide empty unless none exist
        let nonEmpty = out.filter { !$0.servers.isEmpty }
        return nonEmpty.isEmpty ? out : nonEmpty
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

// MARK: - One section (per tool, per project)

private struct ProjectToolSection: View {
    let project: Project
    let toolID: String
    let label: String
    let servers: [(name: String, config: [String: Any])]
    let onMutated: () -> Void

    @EnvironmentObject var overlay: OverlayPresenter

    private var accent: Color { ToolPalette.color(for: toolID) }
    private var icon: String { ToolPalette.icon(for: toolID) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 7)
                        .fill(accent.opacity(0.16))
                        .frame(width: 30, height: 30)
                    Image(systemName: icon)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(accent)
                }
                VStack(alignment: .leading, spacing: 1) {
                    Text(label)
                        .font(.system(size: 13, weight: .semibold))
                    Text(relativeConfigPath())
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.secondary)
                }
                Spacer()
                if !servers.isEmpty {
                    Text("\(servers.count)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(accent)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 2)
                        .background(accent.opacity(0.14))
                        .clipShape(Capsule())
                }
            }
            .padding(10)

            if servers.isEmpty {
                HStack {
                    Text("No servers in this config.")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                    Spacer()
                }
                .padding(.horizontal, 12)
                .padding(.bottom, 10)
            } else {
                Divider().opacity(0.5)
                VStack(spacing: 1) {
                    ForEach(servers, id: \.name) { s in
                        ProjectServerRow(
                            project: project,
                            toolID: toolID,
                            toolLabel: label,
                            name: s.name,
                            config: s.config,
                            onMutated: onMutated
                        )
                    }
                }
            }
        }
        .background(Color(NSColor.controlBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 11))
        .overlay(
            RoundedRectangle(cornerRadius: 11)
                .stroke(accent.opacity(0.22), lineWidth: 1)
        )
    }

    private func relativeConfigPath() -> String {
        switch toolID {
        case "cursor":       return ".cursor/mcp.json"
        case "vscode":       return ".vscode/mcp.json"
        case "roo":          return ".roo/mcp.json"
        case "claude-code":  return ".mcp.json"
        default:             return ""
        }
    }
}

// MARK: - One server row

private struct ProjectServerRow: View {
    let project: Project
    let toolID: String
    let toolLabel: String
    let name: String
    let config: [String: Any]
    let onMutated: () -> Void

    @EnvironmentObject var overlay: OverlayPresenter
    @State private var confirmingDelete = false
    @State private var errorText: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 8) {
                Circle()
                    .fill(ToolPalette.color(for: toolID).opacity(0.7))
                    .frame(width: 6, height: 6)

                VStack(alignment: .leading, spacing: 2) {
                    Text(name)
                        .font(.system(size: 12, weight: .semibold))
                    Text(detail)
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                }

                Spacer()

                Button {
                    overlay.show(.editServerInProject(
                        projectRoot: project.path,
                        toolID: toolID,
                        toolLabel: toolLabel,
                        serverName: name
                    ))
                } label: {
                    Text("Edit")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.accentColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.accentColor.opacity(0.10))
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
                .buttonStyle(.plain)

                Button {
                    confirmingDelete = true
                } label: {
                    Image(systemName: "trash")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 4)
                }
                .buttonStyle(.plain)
                .help("Remove from this project")
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)

            if let err = errorText {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                    Text(err)
                        .font(.system(size: 10))
                        .foregroundColor(.orange)
                }
                .padding(.horizontal, 10)
                .padding(.bottom, 6)
            }
        }
        .contentShape(Rectangle())
        .alert("Remove \(name) from this project?", isPresented: $confirmingDelete) {
            Button("Cancel", role: .cancel) { }
            Button("Remove", role: .destructive) { remove() }
        } message: {
            Text("This edits \(relativeConfigPath()) in the project folder. A timestamped backup is kept.")
        }
    }

    private var detail: String {
        if let url = config["url"] as? String { return url }
        let cmd = (config["command"] as? String) ?? ""
        let args = (config["args"] as? [String]) ?? []
        return ([cmd] + args).filter { !$0.isEmpty }.joined(separator: " ")
    }

    private func remove() {
        errorText = nil
        do {
            try ConfigWriter.removeServer(
                toolID: toolID,
                scope: .project,
                projectRoot: project.path,
                name: name
            )
            onMutated()
        } catch {
            errorText = error.localizedDescription
        }
    }

    private func relativeConfigPath() -> String {
        switch toolID {
        case "cursor":       return ".cursor/mcp.json"
        case "vscode":       return ".vscode/mcp.json"
        case "roo":          return ".roo/mcp.json"
        case "claude-code":  return ".mcp.json"
        default:             return ""
        }
    }
}
