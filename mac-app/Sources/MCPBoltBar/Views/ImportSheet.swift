import SwiftUI
import AppKit

// MARK: - Import flow: paste → preview → pick apps → done

struct ImportSheet: View {
    @EnvironmentObject var store: ServerStore
    let onClose: () -> Void

    enum Stage { case paste, preview, done }
    enum Source: String, CaseIterable { case paste = "Paste"; case url = "From URL" }

    @State private var stage: Stage = .paste
    @State private var source: Source = .paste
    @State private var rawText: String = ""
    @State private var remoteURL: String = ""
    @State private var fetchingURL = false
    @State private var servers: [ParsedServer] = []
    @State private var selectedTools: Set<String> = []
    @State private var parseError: String?
    @State private var importResults: [ImportResult] = []

    // Project scope
    @State private var useProjectScope: Bool = false
    @State private var projectRoot: String? = nil

    // Diff preview
    @State private var showingDiff: Bool = false

    struct ImportResult: Identifiable {
        let id = UUID()
        let serverName: String
        let toolID: String
        let toolLabel: String
        let success: Bool
        let message: String?
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()

            Group {
                switch stage {
                case .paste:   pasteView
                case .preview: previewView
                case .done:    doneView
                }
            }
        }
        .frame(width: 460)
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: 10) {
            Button(action: onClose) {
                Image(systemName: "xmark")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white.opacity(0.75))
                    .frame(width: 26, height: 26)
                    .background(Color.white.opacity(0.10))
                    .clipShape(Circle())
            }
            .buttonStyle(.plain)
            .help("Cancel")

            Text(stageTitle)
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)

            Spacer()

            Text(stageHint)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.60))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(ContentView.headerGrad)
    }

    private var stageTitle: String {
        switch stage {
        case .paste:   return "Import MCP Server"
        case .preview: return servers.count == 1 ? "Review & Install" : "Review \(servers.count) Servers"
        case .done:    return "Done"
        }
    }

    private var stageHint: String {
        switch stage {
        case .paste:   return "Step 1 of 3"
        case .preview: return "Step 2 of 3"
        case .done:    return "Step 3 of 3"
        }
    }

    // MARK: - Paste view

    private var pasteView: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Source segmented picker
            Picker("", selection: $source) {
                ForEach(Source.allCases, id: \.self) { s in
                    Text(s.rawValue).tag(s)
                }
            }
            .pickerStyle(.segmented)
            .labelsHidden()

            if source == .paste {
                Text("Paste a JSON config or an mcp-add CLI command")
                    .font(.system(size: 12, weight: .semibold))

                Text("JSON from a README, or a command like \"claude mcp add context7 --transport http https://…\".")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)

                ZStack(alignment: .topLeading) {
                    TextEditor(text: $rawText)
                        .font(.system(size: 11, design: .monospaced))
                        .padding(6)
                        .background(Color(NSColor.textBackgroundColor))
                        .clipShape(RoundedRectangle(cornerRadius: 7))
                        .overlay(
                            RoundedRectangle(cornerRadius: 7)
                                .stroke(Color(NSColor.separatorColor).opacity(0.6), lineWidth: 0.5)
                        )
                        .frame(height: 200)

                    if rawText.isEmpty {
                        Text(placeholderJSON)
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundColor(.secondary.opacity(0.5))
                            .padding(12)
                            .allowsHitTesting(false)
                    }
                }
            } else {
                Text("Paste a URL to an MCP JSON config")
                    .font(.system(size: 12, weight: .semibold))
                Text("Raw GitHub gist, pastebin, or any URL that returns JSON.")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)

                HStack(spacing: 8) {
                    TextField("https://gist.githubusercontent.com/\u{2026}/raw/mcp.json", text: $remoteURL)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(size: 11, design: .monospaced))
                    if fetchingURL {
                        ProgressView().scaleEffect(0.55)
                    }
                }

                if !rawText.isEmpty {
                    ScrollView {
                        Text(rawText)
                            .font(.system(size: 10, design: .monospaced))
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(8)
                    }
                    .frame(height: 140)
                    .background(Color(NSColor.textBackgroundColor))
                    .clipShape(RoundedRectangle(cornerRadius: 7))
                    .overlay(
                        RoundedRectangle(cornerRadius: 7)
                            .stroke(Color(NSColor.separatorColor).opacity(0.6), lineWidth: 0.5)
                    )
                }
            }

            if let err = parseError {
                HStack(spacing: 6) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                    Text(err)
                        .font(.system(size: 11))
                        .foregroundColor(.primary)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 6)
                .background(Color.orange.opacity(0.10))
                .clipShape(RoundedRectangle(cornerRadius: 6))
            }

            HStack {
                if source == .paste {
                    Button(action: pasteFromClipboard) {
                        HStack(spacing: 4) {
                            Image(systemName: "doc.on.clipboard")
                            Text("Paste from clipboard")
                        }
                        .font(.system(size: 11, weight: .medium))
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.accentColor)
                } else {
                    Button(action: fetchFromURL) {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.down.circle")
                            Text("Fetch")
                        }
                        .font(.system(size: 11, weight: .medium))
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.accentColor)
                    .disabled(remoteURL.trimmingCharacters(in: .whitespaces).isEmpty || fetchingURL)
                }

                Spacer()

                Button(action: parse) {
                    HStack(spacing: 4) {
                        Text("Next")
                            .font(.system(size: 12, weight: .semibold))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 7)
                    .background(ContentView.headerGrad)
                    .clipShape(RoundedRectangle(cornerRadius: 7))
                    .opacity(rawText.trimmingCharacters(in: .whitespaces).isEmpty ? 0.4 : 1)
                }
                .buttonStyle(.plain)
                .disabled(rawText.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        }
        .padding(14)
    }

    private func fetchFromURL() {
        let trimmed = remoteURL.trimmingCharacters(in: .whitespaces)
        guard let url = URL(string: trimmed), ["http", "https"].contains(url.scheme ?? "") else {
            parseError = "Enter a valid http(s) URL."
            return
        }
        parseError = nil
        fetchingURL = true
        Task {
            do {
                var req = URLRequest(url: url, timeoutInterval: 6.0)
                req.setValue("application/json", forHTTPHeaderField: "Accept")
                let (data, resp) = try await URLSession.shared.data(for: req)
                if let http = resp as? HTTPURLResponse, !(200...299).contains(http.statusCode) {
                    await MainActor.run {
                        parseError = "HTTP \(http.statusCode) — could not fetch config."
                        fetchingURL = false
                    }
                    return
                }
                let text = String(data: data, encoding: .utf8) ?? ""
                await MainActor.run {
                    rawText = text
                    fetchingURL = false
                }
            } catch {
                await MainActor.run {
                    parseError = "Fetch failed: \(error.localizedDescription)"
                    fetchingURL = false
                }
            }
        }
    }

    private let placeholderJSON = """
    {
      "mcpServers": {
        "supabase": {
          "command": "npx",
          "args": ["-y", "@supabase/mcp-server"]
        }
      }
    }
    """

    // MARK: - Preview view

    private var previewView: some View {
        VStack(alignment: .leading, spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    // Servers section
                    sectionLabel("Server\(servers.count == 1 ? "" : "s") to import")

                    VStack(spacing: 6) {
                        ForEach($servers) { $server in
                            ServerPreviewRow(server: $server)
                        }
                    }

                    Divider().padding(.vertical, 2)

                    // Scope picker — shown before the app list
                    sectionLabel("Install to")
                    HStack(spacing: 6) {
                        Button(action: { useProjectScope = false }) {
                            HStack(spacing: 5) {
                                Image(systemName: "person.fill")
                                    .font(.system(size: 11))
                                Text("Global")
                                    .font(.system(size: 12, weight: .medium))
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 7)
                            .foregroundColor(!useProjectScope ? .white : .primary)
                            .background(!useProjectScope ? Color.accentColor : Color(NSColor.controlBackgroundColor))
                            .clipShape(RoundedRectangle(cornerRadius: 7))
                        }
                        .buttonStyle(.plain)

                        Button(action: {
                            useProjectScope = true
                            if projectRoot == nil { pickProjectRoot() }
                        }) {
                            HStack(spacing: 5) {
                                Image(systemName: "folder.fill")
                                    .font(.system(size: 11))
                                Text(useProjectScope && projectRoot != nil
                                    ? URL(fileURLWithPath: projectRoot!).lastPathComponent
                                    : "Add to project")
                                    .font(.system(size: 12, weight: .medium))
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 7)
                            .foregroundColor(useProjectScope ? .white : .primary)
                            .background(useProjectScope ? Color.accentColor : Color(NSColor.controlBackgroundColor))
                            .clipShape(RoundedRectangle(cornerRadius: 7))
                        }
                        .buttonStyle(.plain)

                        Spacer()
                    }
                    .padding(3)
                    .background(Color(NSColor.windowBackgroundColor).opacity(0.4))
                    .clipShape(RoundedRectangle(cornerRadius: 9))

                    if useProjectScope {
                        VStack(alignment: .leading, spacing: 4) {
                            if let root = projectRoot {
                                HStack(spacing: 6) {
                                    Image(systemName: "folder")
                                        .foregroundColor(.secondary)
                                        .font(.system(size: 11))
                                    Text(root)
                                        .font(.system(size: 11, design: .monospaced))
                                        .foregroundColor(.secondary)
                                        .lineLimit(1)
                                        .truncationMode(.middle)
                                    Spacer()
                                    Button("Change…", action: pickProjectRoot)
                                        .buttonStyle(.plain)
                                        .font(.system(size: 11))
                                        .foregroundColor(.accentColor)
                                }
                            }
                            Text("Only Claude Code, Cursor, VS Code, and Roo support project configs.")
                                .font(.system(size: 10))
                                .foregroundColor(.secondary)
                        }
                    }

                    Divider().padding(.vertical, 2)

                    // Tool picker section
                    HStack {
                        sectionLabel("Install to which apps?")
                        Spacer()
                        Button(action: toggleSelectAll) {
                            Text(allSelected ? "Deselect all" : "Select all")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.accentColor)
                        }
                        .buttonStyle(.plain)
                    }

                    VStack(spacing: 4) {
                        ForEach(store.detectedTools) { tool in
                            ToolPickerRow(
                                tool: tool,
                                selected: selectedTools.contains(tool.toolID),
                                supported: ConfigWriter.supportsNativeWrite(toolID: tool.toolID),
                                onToggle: { toggle(tool.toolID) }
                            )
                        }
                    }

                    Divider().padding(.vertical, 2)

                    // Diff preview toggle
                    HStack {
                        sectionLabel("Preview")
                        Spacer()
                        Button(action: { showingDiff.toggle() }) {
                            HStack(spacing: 3) {
                                Image(systemName: showingDiff ? "eye.slash" : "eye")
                                Text(showingDiff ? "Hide diff" : "Show diff")
                            }
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.accentColor)
                        }
                        .buttonStyle(.plain)
                    }

                    if showingDiff {
                        DiffPreviewBlock(
                            servers: servers,
                            selectedTools: Array(selectedTools),
                            scope: useProjectScope ? .project : .user,
                            projectRoot: useProjectScope ? projectRoot : nil
                        )
                    }
                }
                .padding(14)
            }
            .frame(maxHeight: 400)

            Divider()

            // Footer
            HStack {
                Button(action: { stage = .paste }) {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.left")
                        Text("Back")
                    }
                    .font(.system(size: 12, weight: .medium))
                }
                .buttonStyle(.plain)
                .foregroundColor(.secondary)

                Spacer()

                Text("\(selectedTools.count) app\(selectedTools.count == 1 ? "" : "s") selected")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)

                Button(action: runImport) {
                    HStack(spacing: 5) {
                        Image(systemName: "square.and.arrow.down.fill")
                            .font(.system(size: 11))
                        Text("Import")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 7)
                    .background(ContentView.headerGrad)
                    .clipShape(RoundedRectangle(cornerRadius: 7))
                    .opacity(canImport ? 1 : 0.4)
                }
                .buttonStyle(.plain)
                .disabled(!canImport)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
        }
    }

    private var canImport: Bool {
        !selectedTools.isEmpty
        && servers.allSatisfy { !$0.name.trimmingCharacters(in: .whitespaces).isEmpty }
    }

    private var allSelected: Bool {
        let supported = store.detectedTools
            .filter { ConfigWriter.supportsNativeWrite(toolID: $0.toolID) }
            .map    { $0.toolID }
        return !supported.isEmpty && Set(supported).isSubset(of: selectedTools)
    }

    // MARK: - Done view

    private var doneView: some View {
        let wins    = importResults.filter { $0.success }
        let failures = importResults.filter { !$0.success }

        return ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                // Summary banner
                HStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(failures.isEmpty ? Color.green.opacity(0.18) : Color.orange.opacity(0.18))
                            .frame(width: 36, height: 36)
                        Image(systemName: failures.isEmpty ? "checkmark" : "exclamationmark")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(failures.isEmpty ? .green : .orange)
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text(failures.isEmpty ? "All set!" : "Imported with issues")
                            .font(.system(size: 13, weight: .semibold))
                        Text("\(wins.count) succeeded · \(failures.count) failed")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                }

                if !wins.isEmpty {
                    sectionLabel("Installed")
                    VStack(spacing: 3) {
                        ForEach(wins) { r in
                            resultRow(r, color: .green, icon: "checkmark.circle.fill")
                        }
                    }
                }

                if !failures.isEmpty {
                    sectionLabel("Failed")
                    VStack(spacing: 3) {
                        ForEach(failures) { r in
                            resultRow(r, color: .orange, icon: "exclamationmark.triangle.fill")
                        }
                    }
                }

                // Per-server "next steps" cards
                if !wins.isEmpty {
                    sectionLabel("Next steps")
                    VStack(spacing: 8) {
                        ForEach(uniqueServerNames(wins), id: \.self) { name in
                            NextStepsCard(
                                serverName: name,
                                installedTools: installedToolsForServer(name: name, wins: wins),
                                envHints: envHints(for: name),
                                refresh: { store.refresh() }
                            )
                        }
                    }
                }

                Text("Restart each app to pick up the new server.")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .padding(.top, 4)

                HStack {
                    Spacer()
                    Button(action: { store.refresh(); onClose() }) {
                        Text("Done")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 7)
                            .background(ContentView.headerGrad)
                            .clipShape(RoundedRectangle(cornerRadius: 7))
                    }
                    .buttonStyle(.plain)
                }
                .padding(.top, 6)
            }
            .padding(14)
        }
    }

    private func resultRow(_ r: ImportResult, color: Color, icon: String) -> some View {
        HStack(spacing: 7) {
            Image(systemName: icon)
                .foregroundColor(color)
                .font(.system(size: 11))
            Text(r.serverName)
                .font(.system(size: 12, weight: .medium))
            Text("→")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
            Text(r.toolLabel)
                .font(.system(size: 11))
                .foregroundColor(.secondary)
            if let msg = r.message, !r.success {
                Text("— \(msg)")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
            Spacer()
        }
    }

    // MARK: - Section label helper

    private func sectionLabel(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(.secondary)
            .tracking(0.4)
    }

    // MARK: - Actions

    private func pasteFromClipboard() {
        if let str = NSPasteboard.general.string(forType: .string) {
            rawText = str
        }
    }

    private func parse() {
        parseError = nil
        switch ImportParser.parse(rawText) {
        case .success(let parsed):
            if parsed.isEmpty {
                parseError = "No servers found in that JSON."
                return
            }
            // Apply name cleanup
            servers = parsed.map {
                var s = $0
                s.name = ImportParser.cleanName(s.name)
                if s.name.isEmpty { s.name = "server" }
                return s
            }
            selectedTools = []
            withAnimation(.spring(response: 0.3, dampingFraction: 0.78)) {
                stage = .preview
            }
        case .failure(let err):
            parseError = err.errorDescription
        }
    }

    private func toggle(_ id: String) {
        if selectedTools.contains(id) { selectedTools.remove(id) }
        else                          { selectedTools.insert(id) }
    }

    private func toggleSelectAll() {
        let supported = store.detectedTools
            .filter { ConfigWriter.supportsNativeWrite(toolID: $0.toolID) }
            .map    { $0.toolID }
        if allSelected {
            supported.forEach { selectedTools.remove($0) }
        } else {
            supported.forEach { selectedTools.insert($0) }
        }
    }

    private func runImport() {
        importResults = []
        let toolLookup = Dictionary(uniqueKeysWithValues:
            store.detectedTools.map { ($0.toolID, $0.label) })

        let wantsProject = useProjectScope && projectRoot != nil
        let scope: ConfigScope = wantsProject ? .project : .user

        for server in servers {
            for toolID in selectedTools {
                let label = toolLookup[toolID] ?? toolID

                // Project scope only applies to tools that support it.
                // For others, silently fall back to user scope.
                let effectiveScope: ConfigScope = (scope == .project
                    && ToolSpecs.projectScopedTools.contains(toolID))
                    ? .project : .user

                do {
                    try ConfigWriter.writeServer(
                        toolID: toolID,
                        scope: effectiveScope,
                        projectRoot: effectiveScope == .project ? projectRoot : nil,
                        name: server.name,
                        config: server.config
                    )
                    let suffix = effectiveScope == .project ? " (project)" : ""
                    importResults.append(.init(
                        serverName: server.name, toolID: toolID,
                        toolLabel: label + suffix, success: true, message: nil
                    ))
                } catch {
                    importResults.append(.init(
                        serverName: server.name, toolID: toolID,
                        toolLabel: label, success: false,
                        message: error.localizedDescription
                    ))
                }
            }
        }

        withAnimation(.spring(response: 0.3, dampingFraction: 0.78)) {
            stage = .done
        }
    }

    private func pickProjectRoot() {
        let panel = NSOpenPanel()
        panel.title = "Choose a project folder"
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        NSApp.activate(ignoringOtherApps: true)
        if panel.runModal() == .OK, let url = panel.url {
            projectRoot = url.path
        }
    }

    // MARK: - Helpers for the "Next steps" section

    private func uniqueServerNames(_ results: [ImportResult]) -> [String] {
        var seen = Set<String>()
        var ordered: [String] = []
        for r in results where seen.insert(r.serverName).inserted {
            ordered.append(r.serverName)
        }
        return ordered
    }

    private func installedToolsForServer(name: String, wins: [ImportResult]) -> [NextStepsCard.InstalledTool] {
        wins
            .filter { $0.serverName == name }
            .compactMap { r -> NextStepsCard.InstalledTool? in
                guard let spec = ToolSpecs.spec(for: r.toolID) else { return nil }
                return .init(id: r.toolID, toolID: r.toolID, toolLabel: r.toolLabel, path: spec.path)
            }
    }

    /// Env keys pulled from the imported config for this server (used to
    /// render inline "paste your key" fields).
    private func envHints(for name: String) -> [String] {
        guard let server = servers.first(where: { $0.name == name }),
              let env = server.config["env"] as? [String: Any] else {
            return []
        }
        return env.keys.sorted()
    }
}

// MARK: - Preview row (server with editable name)

private struct ServerPreviewRow: View {
    @Binding var server: ParsedServer

    var body: some View {
        HStack(spacing: 10) {
            // Kind chip
            VStack {
                Image(systemName: server.kindLabel == "Remote" ? "globe" : "desktopcomputer")
                    .font(.system(size: 13))
                    .foregroundColor(.accentColor)
            }
            .frame(width: 28, height: 28)
            .background(Color.accentColor.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 7))

            VStack(alignment: .leading, spacing: 2) {
                TextField("Server name", text: $server.name)
                    .textFieldStyle(.plain)
                    .font(.system(size: 13, weight: .semibold))

                Text(server.kindLabel)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(Color(NSColor.controlBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color(NSColor.separatorColor).opacity(0.55), lineWidth: 0.5)
        )
    }
}

// MARK: - Tool picker row

private struct ToolPickerRow: View {
    let tool: ToolSummary
    let selected: Bool
    let supported: Bool
    let onToggle: () -> Void

    var body: some View {
        let c = ToolPalette.color(for: tool.toolID)

        Button(action: { if supported { onToggle() } }) {
            HStack(spacing: 10) {
                // Icon tile — real app icon when installed, SF Symbol fallback
                Group {
                    if let appImg = ToolPalette.appImage(for: tool.toolID) {
                        Image(nsImage: appImg)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 26, height: 26)
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                    } else {
                        ZStack {
                            RoundedRectangle(cornerRadius: 6)
                                .fill(c.opacity(0.14))
                                .frame(width: 26, height: 26)
                            Image(systemName: ToolPalette.icon(for: tool.toolID))
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(c)
                        }
                    }
                }

                Text(tool.label)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(supported ? .primary : .secondary)

                if !supported {
                    Text("— use CLI")
                        .font(.system(size: 10))
                        .foregroundColor(.secondary.opacity(0.7))
                }

                Spacer()

                if supported {
                    Image(systemName: selected ? "checkmark.square.fill" : "square")
                        .font(.system(size: 14))
                        .foregroundColor(selected ? c : .secondary.opacity(0.5))
                } else {
                    Image(systemName: "minus.circle")
                        .foregroundColor(.secondary.opacity(0.4))
                }
            }
            .contentShape(Rectangle())
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(selected ? c.opacity(0.08) : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 7))
        }
        .buttonStyle(.plain)
        .disabled(!supported)
        .opacity(supported ? 1 : 0.6)
    }
}
