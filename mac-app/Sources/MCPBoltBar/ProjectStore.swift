import Foundation
import AppKit

// MARK: - Discovered project model

/// A project folder found by auto-scanning common dev directories on this Mac.
/// Not persisted — rebuilt from disk on each scan.
struct DiscoveredProject: Identifiable, Equatable {
    let id: UUID
    let path: String
    let displayName: String
    let hasGit: Bool
    let detectedTools: [String]  // tool IDs whose config file exists in this folder
}

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
    @Published private(set) var projects:   [Project] = []
    @Published private(set) var discovered: [DiscoveredProject] = []
    @Published private(set) var isScanning: Bool = false

    private let defaultsKey = "mcpbolt.projects.v1"

    init() {
        load()
        scan()
    }

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

    // MARK: - Auto-discovery

    /// Background scan of common dev directories. Safe to call multiple times — no-ops if already scanning.
    func scan() {
        guard !isScanning else { return }
        isScanning = true
        let existingPaths = Set(projects.map { $0.path })
        Task.detached(priority: .utility) { [weak self] in
            let found = ProjectStore.findProjects(excluding: existingPaths)
            await MainActor.run {
                self?.discovered = found
                self?.isScanning = false
            }
        }
    }

    /// Promotes a discovered project into the manually-tracked list and removes it from `discovered`.
    @discardableResult
    func addDiscovered(_ disc: DiscoveredProject) -> Project {
        let p = add(path: disc.path, displayName: disc.displayName)
        discovered.removeAll { $0.id == disc.id }
        return p
    }

    // MARK: - Background scan helpers (nonisolated — runs on Task.detached)

    nonisolated private static func findProjects(excluding existingPaths: Set<String>) -> [DiscoveredProject] {
        let fm   = FileManager.default
        let home = NSHomeDirectory()

        let rootNames = ["Projects", "Developer", "dev", "code", "src", "workspace", "Sites", "Documents"]
        let searchRoots = rootNames
            .map { (home as NSString).appendingPathComponent($0) }
            .filter { fm.fileExists(atPath: $0) }

        let skipDirs: Set<String> = [
            "node_modules", ".git", ".cache", "Library", ".Trash",
            "build", "dist", ".next", "vendor", ".npm", ".yarn",
            "DerivedData", ".gradle", "__pycache__", "Packages"
        ]

        var found: [DiscoveredProject] = []
        var seen  = existingPaths

        for root in searchRoots {
            guard let level1 = try? fm.contentsOfDirectory(atPath: root) else { continue }
            for name in level1.sorted() {
                guard !name.hasPrefix("."), !skipDirs.contains(name) else { continue }
                let path = (root as NSString).appendingPathComponent(name)
                var isDir: ObjCBool = false
                guard fm.fileExists(atPath: path, isDirectory: &isDir), isDir.boolValue else { continue }

                if let p = checkProject(at: path, excluding: seen) {
                    found.append(p)
                    seen.insert(p.path)
                } else {
                    // Level-2: org/company folders (e.g. ~/Developer/acme/repo)
                    guard let level2 = try? fm.contentsOfDirectory(atPath: path) else { continue }
                    for name2 in level2.prefix(20) {
                        guard !name2.hasPrefix("."), !skipDirs.contains(name2) else { continue }
                        let path2 = (path as NSString).appendingPathComponent(name2)
                        var isDir2: ObjCBool = false
                        guard fm.fileExists(atPath: path2, isDirectory: &isDir2), isDir2.boolValue else { continue }
                        if let p = checkProject(at: path2, excluding: seen) {
                            found.append(p)
                            seen.insert(p.path)
                        }
                        if found.count >= 80 { break }
                    }
                }
                if found.count >= 80 { break }
            }
            if found.count >= 80 { break }
        }

        return found.sorted {
            $0.displayName.localizedCaseInsensitiveCompare($1.displayName) == .orderedAscending
        }
    }

    nonisolated private static func checkProject(at path: String, excluding: Set<String>) -> DiscoveredProject? {
        let fm        = FileManager.default
        let canonical = Project.canonicalize(path)
        guard !excluding.contains(canonical) else { return nil }

        let hasGit = fm.fileExists(atPath: (canonical as NSString).appendingPathComponent(".git"))

        let toolChecks: [(String, String)] = [
            (".mcp.json",        "claude"),
            (".cursor/mcp.json", "cursor"),
            (".vscode/mcp.json", "vscode"),
            (".roo/mcp.json",    "roo"),
        ]
        var tools: [String] = []
        for (rel, toolID) in toolChecks {
            if fm.fileExists(atPath: (canonical as NSString).appendingPathComponent(rel)) {
                tools.append(toolID)
            }
        }

        guard hasGit || !tools.isEmpty else { return nil }

        return DiscoveredProject(
            id:             UUID(),
            path:           canonical,
            displayName:    Project.folderName(at: canonical),
            hasGit:         hasGit,
            detectedTools:  tools
        )
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
