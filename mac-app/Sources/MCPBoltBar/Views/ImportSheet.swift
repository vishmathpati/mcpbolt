import SwiftUI
import AppKit

// MARK: - Import flow: paste → preview → pick apps → done

struct ImportSheet: View {
    @EnvironmentObject var store: ServerStore
    let onClose: () -> Void

    enum Stage { case paste, preview, done }

    @State private var stage: Stage = .paste
    @State private var rawText: String = ""
    @State private var servers: [ParsedServer] = []
    @State private var selectedTools: Set<String> = []
    @State private var parseError: String?
    @State private var importResults: [ImportResult] = []

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
            Text("Paste the server config JSON")
                .font(.system(size: 12, weight: .semibold))

            Text("From GitHub README, mcpservers.org, or anywhere else.")
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
                Button(action: pasteFromClipboard) {
                    HStack(spacing: 4) {
                        Image(systemName: "doc.on.clipboard")
                        Text("Paste from clipboard")
                    }
                    .font(.system(size: 11, weight: .medium))
                }
                .buttonStyle(.plain)
                .foregroundColor(.accentColor)

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
            // Default: select all natively-supported tools
            selectedTools = Set(
                store.detectedTools
                    .filter { ConfigWriter.supportsNativeWrite(toolID: $0.toolID) }
                    .map    { $0.toolID }
            )
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

        for server in servers {
            for toolID in selectedTools {
                let label = toolLookup[toolID] ?? toolID
                do {
                    try ConfigWriter.writeServer(
                        toolID: toolID,
                        name: server.name,
                        config: server.config
                    )
                    importResults.append(.init(
                        serverName: server.name, toolID: toolID,
                        toolLabel: label, success: true, message: nil
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
                // Icon tile
                ZStack {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(c.opacity(0.14))
                        .frame(width: 26, height: 26)
                    Image(systemName: ToolPalette.icon(for: tool.toolID))
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(c)
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
