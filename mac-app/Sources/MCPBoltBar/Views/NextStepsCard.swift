import SwiftUI
import AppKit

// MARK: - "Next Steps" card shown after a successful import
// Three options, no auto-detection of auth type:
//   1. Open config file — user edits themselves (max trust)
//   2. Show steps      — copy-pasteable instructions
//   3. Paste here      — masked inputs written to all installed configs
//
// We don't try to guess which MCP needs what — we just offer all three
// and let the user choose based on the server's docs.

struct NextStepsCard: View {
    let serverName: String
    let installedTools: [InstalledTool]   // (toolID, toolLabel, configPath)
    let envHints: [String]                // env keys pulled from the imported config
    let refresh: () -> Void

    struct InstalledTool: Identifiable, Hashable {
        let id: String
        let toolID: String
        let toolLabel: String
        let path: String
    }

    enum Mode { case collapsed, openFile, showSteps, pasteKey }

    @State private var mode: Mode = .collapsed
    @State private var selectedTool: String = ""   // for Open File submenu
    @State private var envValues: [String: String] = [:]
    @State private var showValues: Bool = false
    @State private var saveStatus: SaveStatus = .idle
    @EnvironmentObject private var store: ServerStore

    enum SaveStatus: Equatable {
        case idle
        case saving
        case saved(count: Int)
        case failed(String)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            cardHeader

            if mode != .collapsed {
                Divider()
                switch mode {
                case .openFile:  openFileView
                case .showSteps: showStepsView
                case .pasteKey:  pasteKeyView
                case .collapsed: EmptyView()
                }
            }
        }
        .padding(12)
        .background(Color(NSColor.controlBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color(NSColor.separatorColor).opacity(0.55), lineWidth: 0.5)
        )
    }

    // MARK: - Header

    private var cardHeader: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: "sparkles")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.accentColor)
                Text(serverName)
                    .font(.system(size: 13, weight: .semibold))
                Spacer()
                if installedTools.count > 0 {
                    Text("in \(installedTools.count) app\(installedTools.count == 1 ? "" : "s")")
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                }
            }

            Text("If this server needs an API key or login, pick one:")
                .font(.system(size: 11))
                .foregroundColor(.secondary)

            // Three option buttons
            HStack(spacing: 6) {
                optionButton(
                    title: "Open config",
                    icon: "square.and.pencil",
                    target: .openFile
                )
                optionButton(
                    title: "Show steps",
                    icon: "list.bullet.rectangle",
                    target: .showSteps
                )
                optionButton(
                    title: envHints.isEmpty ? "Add key" : "Add key\(envHints.count > 1 ? "s" : "")",
                    icon: "key.fill",
                    target: .pasteKey
                )
            }
        }
    }

    private func optionButton(title: String, icon: String, target: Mode) -> some View {
        let active = mode == target
        return Button(action: {
            withAnimation(.spring(response: 0.22, dampingFraction: 0.78)) {
                if mode == target {
                    mode = .collapsed
                } else {
                    mode = target
                    // Initialise state on open
                    if target == .openFile, selectedTool.isEmpty {
                        selectedTool = installedTools.first?.toolID ?? ""
                    }
                    if target == .pasteKey, envValues.isEmpty {
                        for k in envHints { envValues[k] = "" }
                    }
                    saveStatus = .idle
                }
            }
        }) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 10, weight: .semibold))
                Text(title)
                    .font(.system(size: 11, weight: .semibold))
                    .lineLimit(1)
                    .fixedSize()
            }
            .foregroundColor(active ? .white : .primary)
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(
                Group {
                    if active { ContentView.headerGrad }
                    else { Color(NSColor.textBackgroundColor) }
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: 7))
            .overlay(
                RoundedRectangle(cornerRadius: 7)
                    .stroke(active ? Color.clear : Color(NSColor.separatorColor).opacity(0.6), lineWidth: 0.5)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Option 1: Open file

    private var openFileView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Which app's config?")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.secondary)

            VStack(spacing: 4) {
                ForEach(installedTools) { tool in
                    Button(action: { selectedTool = tool.toolID }) {
                        HStack(spacing: 9) {
                            let accent = ToolPalette.color(for: tool.toolID)
                            Image(systemName: ToolPalette.icon(for: tool.toolID))
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(accent)
                                .frame(width: 22, height: 22)
                                .background(accent.opacity(0.14))
                                .clipShape(RoundedRectangle(cornerRadius: 5))

                            VStack(alignment: .leading, spacing: 1) {
                                Text(tool.toolLabel)
                                    .font(.system(size: 12, weight: .medium))
                                Text(prettyPath(tool.path))
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                                    .truncationMode(.head)
                            }

                            Spacer(minLength: 0)

                            Image(systemName: selectedTool == tool.toolID ? "largecircle.fill.circle" : "circle")
                                .foregroundColor(selectedTool == tool.toolID ? accent : .secondary.opacity(0.5))
                                .font(.system(size: 13))
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 6)
                        .background(selectedTool == tool.toolID
                                    ? ToolPalette.color(for: tool.toolID).opacity(0.08)
                                    : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 7))
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                }
            }

            HStack {
                Spacer()
                Button(action: openSelectedFile) {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.up.right.square")
                            .font(.system(size: 10, weight: .semibold))
                        Text("Open in default editor")
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 11)
                    .padding(.vertical, 6)
                    .background(ContentView.headerGrad)
                    .clipShape(RoundedRectangle(cornerRadius: 7))
                }
                .buttonStyle(.plain)
                .disabled(selectedTool.isEmpty)
            }
        }
    }

    private func openSelectedFile() {
        guard let tool = installedTools.first(where: { $0.toolID == selectedTool }) else { return }
        NSWorkspace.shared.open(URL(fileURLWithPath: tool.path))
    }

    // MARK: - Option 2: Show steps

    private var showStepsView: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("How to add an API key or token")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.secondary)

            stepRow(n: 1, text: "Quit the app you're adding the key to.")
            stepRow(n: 2, text: "Open the config file (pick one above, or use \"Open config\").")
            stepRow(n: 3, text: "Find the \"\(serverName)\" block.")
            stepRow(n: 4, text: envHints.isEmpty
                    ? "Add or edit the \"env\" section with your key(s)."
                    : "Fill in \"env\" values: \(envHints.joined(separator: ", ")).")
            stepRow(n: 5, text: "Save the file, then relaunch the app.")

            Text("Tip: if the server uses OAuth (Supabase, Linear, etc.) you don't need a key — the app will open a login page on first use.")
                .font(.system(size: 10))
                .foregroundColor(.secondary)
                .padding(.top, 4)
                .padding(.horizontal, 4)
        }
    }

    private func stepRow(n: Int, text: String) -> some View {
        HStack(alignment: .top, spacing: 7) {
            Text("\(n).")
                .font(.system(size: 11, weight: .bold, design: .rounded))
                .foregroundColor(.accentColor)
                .frame(width: 14, alignment: .trailing)
            Text(text)
                .font(.system(size: 11))
                .foregroundColor(.primary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    // MARK: - Option 3: Paste key inline

    private var pasteKeyView: some View {
        VStack(alignment: .leading, spacing: 8) {
            if envHints.isEmpty {
                // No env hints from the imported config
                HStack(spacing: 6) {
                    Image(systemName: "info.circle")
                        .foregroundColor(.secondary)
                    Text("No env variables in this server. If you need to add one, use \"Open config\".")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 4)
            } else {
                HStack {
                    Text("Paste your key\(envHints.count > 1 ? "s" : "")")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.secondary)
                    Spacer()
                    Button(action: { showValues.toggle() }) {
                        HStack(spacing: 3) {
                            Image(systemName: showValues ? "eye.slash" : "eye")
                            Text(showValues ? "Hide" : "Show")
                        }
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                    }
                    .buttonStyle(.plain)
                }

                ForEach(envHints, id: \.self) { key in
                    envField(for: key)
                }

                // Trust disclosure
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 4) {
                        Image(systemName: "lock.shield")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary)
                        Text("Saved to \(installedTools.count) file\(installedTools.count == 1 ? "" : "s") on this Mac. Never sent over the network.")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary)
                    }
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.up.right.square")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary.opacity(0.7))
                        Button(action: openSource) {
                            Text("View source on GitHub")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.accentColor)
                                .underline()
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.top, 2)

                // Save bar
                HStack {
                    statusLabel
                    Spacer()
                    Button(action: saveKeys) {
                        HStack(spacing: 4) {
                            if case .saving = saveStatus {
                                ProgressView().scaleEffect(0.5).frame(width: 10, height: 10)
                            } else {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 11))
                            }
                            Text("Save to all apps")
                                .font(.system(size: 11, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 11)
                        .padding(.vertical, 6)
                        .background(ContentView.headerGrad)
                        .clipShape(RoundedRectangle(cornerRadius: 7))
                    }
                    .buttonStyle(.plain)
                    .disabled(saveStatus == .saving || !anyValueEntered)
                    .opacity(anyValueEntered ? 1 : 0.5)
                }
            }
        }
    }

    private var anyValueEntered: Bool {
        envValues.values.contains { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
    }

    private func envField(for key: String) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(key)
                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                .foregroundColor(.secondary)

            Group {
                if showValues {
                    TextField("", text: Binding(
                        get: { envValues[key] ?? "" },
                        set: { envValues[key] = $0 }
                    ))
                    .textFieldStyle(.plain)
                } else {
                    SecureField("", text: Binding(
                        get: { envValues[key] ?? "" },
                        set: { envValues[key] = $0 }
                    ))
                    .textFieldStyle(.plain)
                }
            }
            .font(.system(size: 11, design: .monospaced))
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
            .background(Color(NSColor.textBackgroundColor))
            .clipShape(RoundedRectangle(cornerRadius: 6))
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(Color(NSColor.separatorColor).opacity(0.55), lineWidth: 0.5)
            )
        }
    }

    private var statusLabel: some View {
        Group {
            switch saveStatus {
            case .idle:            EmptyView()
            case .saving:
                Text("Saving…")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            case .saved(let c):
                HStack(spacing: 3) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Saved to \(c) app\(c == 1 ? "" : "s")")
                }
                .font(.system(size: 10))
            case .failed(let m):
                HStack(spacing: 3) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                    Text(m).lineLimit(1)
                }
                .font(.system(size: 10))
            }
        }
    }

    private func saveKeys() {
        saveStatus = .saving
        // Strip empty / whitespace-only values — those mean "don't set"
        let toWrite = envValues.reduce(into: [String: String]()) { acc, kv in
            let trimmed = kv.value.trimmingCharacters(in: .whitespaces)
            if !trimmed.isEmpty { acc[kv.key] = trimmed }
        }

        Task { @MainActor in
            let result = store.updateServerEnv(
                name: serverName,
                env: toWrite,
                across: installedTools.map { $0.toolID }
            )
            if result.failures.isEmpty {
                saveStatus = .saved(count: result.successes.count)
            } else if result.successes.isEmpty {
                saveStatus = .failed(result.failures.first?.message ?? "Save failed")
            } else {
                saveStatus = .failed("Saved \(result.successes.count), \(result.failures.count) failed")
            }
            refresh()
        }
    }

    // MARK: - Helpers

    private func prettyPath(_ path: String) -> String {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        if path.hasPrefix(home) {
            return "~" + path.dropFirst(home.count)
        }
        return path
    }

    private func openSource() {
        let url = URL(string: "https://github.com/vishmathpati/mcpbolt/blob/main/mac-app/Sources/MCPBoltBar/ConfigWriter.swift")!
        NSWorkspace.shared.open(url)
    }
}
