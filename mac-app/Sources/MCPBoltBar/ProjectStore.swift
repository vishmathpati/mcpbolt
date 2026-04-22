import Foundation
import AppKit

// MARK: - Project model

/// A project folder the user has added to the Projects tab. Project-scope MCP
/// configs live under this folder at well-known paths:
///   - .cursor/mcp.json
///   - .vscode/mcp.json
///   - .roo/mcp.json
///   - .mcp.json (claude-code)
struct Project: Codable, Identifiable, Equatable {
    let id: UUID
    var path: String
    var displayName: String
    var addedAt: Date
    var lastOpenedAt: Date

    /// Canonicalises a raw path (resolves symlinks, strips trailing slash).
    /// Used for upsert-by-path so the same folder isn't added twice.
    static func canonicalize(_ raw: String) -> String {
        let expanded = (raw as NSString).expandingTildeInPath
        let url = URL(fileURLWithPath: expanded).standardizedFileURL.resolvingSymlinksInPath()
        return url.path
    }

    static func folderName(at path: String) -> String {
        (path as NSString).lastPathComponent
    }

    /// Is the folder still on disk? UI greys out "missing" projects.
    var exists: Bool {
        var isDir: ObjCBool = false
        return FileManager.default.fileExists(atPath: path, isDirectory: &isDir) && isDir.boolValue
    }
}

// MARK: - Store

@MainActor
final class ProjectStore: ObservableObject {
    @Published private(set) var projects: [Project] = []

    private let defaultsKey = "mcpbolt.projects.v1"

    init() { load() }

    // MARK: - Public API

    /// Adds a folder to the recents list, or bumps its lastOpenedAt if it's
    /// already there. Returns the resulting Project.
    @discardableResult
    func add(path rawPath: String, displayName: String? = nil) -> Project {
        let path = Project.canonicalize(rawPath)
        if let idx = projects.firstIndex(where: { $0.path == path }) {
            projects[idx].lastOpenedAt = Date()
            if let name = displayName { projects[idx].displayName = name }
            sortAndPersist()
            return projects[idx]
        }
        let now = Date()
        let project = Project(
            id: UUID(),
            path: path,
            displayName: displayName ?? Project.folderName(at: path),
            addedAt: now,
            lastOpenedAt: now
        )
        projects.append(project)
        sortAndPersist()
        return project
    }

    func remove(id: UUID) {
        projects.removeAll { $0.id == id }
        persist()
    }

    func rename(id: UUID, to name: String) {
        guard let idx = projects.firstIndex(where: { $0.id == id }) else { return }
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        projects[idx].displayName = trimmed.isEmpty ? Project.folderName(at: projects[idx].path) : trimmed
        persist()
    }

    func touch(id: UUID) {
        guard let idx = projects.firstIndex(where: { $0.id == id }) else { return }
        projects[idx].lastOpenedAt = Date()
        sortAndPersist()
    }

    /// Pops a folder picker. Returns the chosen path (canonical) or nil.
    func pickFolder() -> String? {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.title = "Add project folder"
        panel.prompt = "Add"
        guard panel.runModal() == .OK, let url = panel.url else { return nil }
        return Project.canonicalize(url.path)
    }

    // MARK: - Counts (for the landing list)

    struct ServerCount {
        let toolID: String
        let count: Int
    }

    /// For each project-scoped tool, returns how many servers its config lists
    /// in this project. Tools with no config file present are omitted.
    func counts(for project: Project) -> [ServerCount] {
        var out: [ServerCount] = []
        for toolID in ToolSpecs.projectScopedTools.sorted() {
            let servers = ConfigWriter.readAllServers(
                toolID: toolID,
                scope: .project,
                projectRoot: project.path
            )
            if !servers.isEmpty {
                out.append(ServerCount(toolID: toolID, count: servers.count))
            }
        }
        return out
    }

    /// Total servers across every project-scoped tool. Used for the "N" pill
    /// on the right side of each project row.
    func totalServerCount(for project: Project) -> Int {
        counts(for: project).reduce(0) { $0 + $1.count }
    }

    // MARK: - Persistence

    private func sortAndPersist() {
        projects.sort { $0.lastOpenedAt > $1.lastOpenedAt }
        persist()
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(projects) else { return }
        UserDefaults.standard.set(data, forKey: defaultsKey)
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: defaultsKey) else { return }
        if let decoded = try? JSONDecoder().decode([Project].self, from: data) {
            projects = decoded.sorted { $0.lastOpenedAt > $1.lastOpenedAt }
        }
    }
}
