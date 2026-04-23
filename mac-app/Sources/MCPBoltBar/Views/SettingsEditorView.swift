import SwiftUI
import AppKit

// MARK: - Settings tab — visual editor for ~/.claude/settings.json

struct SettingsEditorView: View {
    @EnvironmentObject var settings: SettingsStore
    @EnvironmentObject var projects: ProjectStore

    // Local edit state for permissions + env (using indices directly causes issues)
    @State private var newAllowRule = ""
    @State private var newDenyRule  = ""
    @State private var newEnvKey    = ""
    @State private var newEnvValue  = ""
    @State private var showingAddAllow = false
    @State private var showingAddDeny  = false
    @State private var showingAddEnv   = false

    private let knownModels = [
        "claude-opus-4-5",
        "claude-sonnet-4-5",
        "claude-haiku-4-5",
        "claude-opus-4",
        "claude-sonnet-4",
        "claude-haiku-4",
    ]

    var body: some View {
        VStack(spacing: 0) {
            scopeBar
            Divider()
            if settings.isLoading {
                loadingState
            } else {
                form
            }
        }
        .onAppear { settings.load() }
    }

    // MARK: - Scope bar

    private var scopeBar: some View {
        HStack(spacing: 8) {
            scopeButton(label: "User",    scope: .user)
            scopeButton(label: "Project", scope: .project)

            if settings.scope == .project {
                projectPicker
            }

            Spacer()

            if settings.hasUndo {
                Button(action: { settings.undo() }) {
                    HStack(spacing: 3) {
                        Image(systemName: "arrow.uturn.backward")
                            .font(.system(size: 10, weight: .medium))
                        Text("Undo")
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
                .help("Restore previous settings from backup")
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }

    private func scopeButton(label: String, scope: SettingsStore.Scope) -> some View {
        let active = settings.scope == scope
        return Button(action: { settings.scope = scope }) {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(active ? .white : .secondary)
                .padding(.horizontal, 12)
                .padding(.vertical, 5)
                .background(Group {
                    if active { ContentView.headerGrad }
                    else      { LinearGradient(colors: [], startPoint: .top, endPoint: .bottom) }
                })
                .clipShape(RoundedRectangle(cornerRadius: 6))
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(active ? Color.clear : Color(NSColor.separatorColor).opacity(0.7), lineWidth: 0.5)
                )
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private var projectPicker: some View {
        if projects.projects.isEmpty {
            Text("No projects — add one in Projects tab")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
        } else {
            Menu {
                ForEach(projects.projects) { proj in
                    Button(proj.displayName) {
                        settings.projectPath = proj.path
                    }
                }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "folder")
                        .font(.system(size: 10, weight: .medium))
                    Text(selectedProjectName)
                        .font(.system(size: 11, weight: .medium))
                        .lineLimit(1)
                    Image(systemName: "chevron.down")
                        .font(.system(size: 9, weight: .medium))
                }
                .foregroundColor(.primary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color(NSColor.controlBackgroundColor))
                .clipShape(RoundedRectangle(cornerRadius: 5))
                .overlay(
                    RoundedRectangle(cornerRadius: 5)
                        .stroke(Color(NSColor.separatorColor).opacity(0.6), lineWidth: 0.5)
                )
            }
            .menuStyle(.borderlessButton)
            .menuIndicator(.hidden)
            .fixedSize()
        }
    }

    private var selectedProjectName: String {
        guard let path = settings.projectPath,
              let proj = projects.projects.first(where: { $0.path == path })
        else { return "Pick project…" }
        return proj.displayName
    }

    // MARK: - Loading state

    private var loadingState: some View {
        VStack(spacing: 10) {
            ProgressView()
            Text("Loading settings…")
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(40)
    }

    // MARK: - Main form

    private var form: some View {
        ScrollView {
            VStack(spacing: 0) {
                modelSection
                Divider().padding(.leading, 12)
                permissionsSection
                Divider().padding(.leading, 12)
                envSection
                Divider().padding(.leading, 12)
                advancedSection
                saveBar
            }
        }
        .frame(maxHeight: 540)
    }

    // MARK: - Model section

    private var modelSection: some View {
        SettingsSection(
            title: "Model",
            icon: "cpu",
            tooltip: "Default Claude model for all Claude Code sessions. Leave blank to use Claude Code's built-in default."
        ) {
            VStack(alignment: .leading, spacing: 6) {
                Picker("", selection: $settings.model) {
                    Text("Default (built-in)").tag("")
                    Divider()
                    ForEach(knownModels, id: \.self) { m in
                        Text(m).tag(m)
                    }
                    if !settings.model.isEmpty && !knownModels.contains(settings.model) {
                        Text(settings.model).tag(settings.model)
                    }
                }
                .pickerStyle(.menu)
                .fixedSize()
                .labelsHidden()

                if !settings.model.isEmpty {
                    TextField("Custom model ID…", text: $settings.model)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(size: 12, design: .monospaced))
                }
            }
        }
    }

    // MARK: - Permissions section

    private var permissionsSection: some View {
        SettingsSection(
            title: "Permissions",
            icon: "hand.raised",
            tooltip: "Allow or deny specific tool uses. Patterns like \"Bash(git log:*)\" let Claude run git log, while denying \"Bash(rm -rf *)\" blocks dangerous commands."
        ) {
            VStack(alignment: .leading, spacing: 10) {
                permList(
                    label: "Allow rules",
                    items: $settings.allowedTools,
                    accentColor: .green,
                    placeholder: "Bash(git log:*)",
                    isAdding: $showingAddAllow,
                    newText: $newAllowRule,
                    emptyNote: "No allow rules — all tools permitted by Claude Code defaults"
                )
                permList(
                    label: "Deny rules",
                    items: $settings.deniedTools,
                    accentColor: .red,
                    placeholder: "Bash(rm -rf *)",
                    isAdding: $showingAddDeny,
                    newText: $newDenyRule,
                    emptyNote: "No deny rules"
                )
            }
        }
    }

    private func permList(
        label: String,
        items: Binding<[String]>,
        accentColor: Color,
        placeholder: String,
        isAdding: Binding<Bool>,
        newText: Binding<String>,
        emptyNote: String
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(label)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)
                Spacer()
                Button(action: { isAdding.wrappedValue = true }) {
                    Image(systemName: "plus")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.accentColor)
                }
                .buttonStyle(.plain)
            }

            if items.wrappedValue.isEmpty && !isAdding.wrappedValue {
                Text(emptyNote)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary.opacity(0.7))
                    .italic()
            } else {
                FlowLayout(spacing: 4) {
                    ForEach(Array(items.wrappedValue.enumerated()), id: \.offset) { idx, rule in
                        HStack(spacing: 4) {
                            Text(rule)
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundColor(accentColor)
                            Button(action: { items.wrappedValue.remove(at: idx) }) {
                                Image(systemName: "xmark")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(accentColor.opacity(0.7))
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(accentColor.opacity(0.10))
                        .clipShape(RoundedRectangle(cornerRadius: 5))
                    }
                }
            }

            if isAdding.wrappedValue {
                HStack(spacing: 6) {
                    TextField(placeholder, text: newText)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(size: 11, design: .monospaced))
                        .onSubmit { commitNew(to: items, text: newText, isAdding: isAdding) }
                    Button("Add") {
                        commitNew(to: items, text: newText, isAdding: isAdding)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                    Button("Cancel") {
                        newText.wrappedValue = ""
                        isAdding.wrappedValue = false
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }
            }
        }
    }

    private func commitNew(
        to items: Binding<[String]>,
        text: Binding<String>,
        isAdding: Binding<Bool>
    ) {
        let v = text.wrappedValue.trimmingCharacters(in: .whitespaces)
        guard !v.isEmpty else { isAdding.wrappedValue = false; return }
        items.wrappedValue.append(v)
        text.wrappedValue     = ""
        isAdding.wrappedValue = false
    }

    // MARK: - Env vars section

    private var envSection: some View {
        SettingsSection(
            title: "Environment Variables",
            icon: "terminal",
            tooltip: "Key-value pairs injected into every Claude Code session. Useful for setting API keys or tool-specific vars."
        ) {
            VStack(alignment: .leading, spacing: 6) {
                if !settings.envVars.isEmpty {
                    VStack(spacing: 4) {
                        ForEach(Array(settings.envVars.enumerated()), id: \.offset) { idx, pair in
                            HStack(spacing: 6) {
                                TextField("KEY", text: Binding(
                                    get: { settings.envVars[idx].key },
                                    set: { settings.envVars[idx].key = $0 }
                                ))
                                .textFieldStyle(.roundedBorder)
                                .font(.system(size: 11, design: .monospaced))
                                .frame(maxWidth: 120)

                                Text("=")
                                    .font(.system(size: 11, design: .monospaced))
                                    .foregroundColor(.secondary)

                                TextField("value", text: Binding(
                                    get: { settings.envVars[idx].value },
                                    set: { settings.envVars[idx].value = $0 }
                                ))
                                .textFieldStyle(.roundedBorder)
                                .font(.system(size: 11, design: .monospaced))

                                Button(action: { settings.envVars.remove(at: idx) }) {
                                    Image(systemName: "minus.circle")
                                        .font(.system(size: 12))
                                        .foregroundColor(.red.opacity(0.7))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }

                if showingAddEnv {
                    HStack(spacing: 6) {
                        TextField("KEY", text: $newEnvKey)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 11, design: .monospaced))
                            .frame(maxWidth: 120)
                            .onSubmit { commitEnv() }

                        Text("=")
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundColor(.secondary)

                        TextField("value", text: $newEnvValue)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 11, design: .monospaced))
                            .onSubmit { commitEnv() }

                        Button("Add")    { commitEnv() }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.small)
                        Button("Cancel") { showingAddEnv = false; newEnvKey = ""; newEnvValue = "" }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                    }
                }

                Button(action: { showingAddEnv = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add variable")
                    }
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.accentColor)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func commitEnv() {
        let k = newEnvKey.trimmingCharacters(in: .whitespaces)
        guard !k.isEmpty else { showingAddEnv = false; return }
        settings.envVars.append((key: k, value: newEnvValue))
        newEnvKey     = ""
        newEnvValue   = ""
        showingAddEnv = false
    }

    // MARK: - Advanced section

    private var advancedSection: some View {
        SettingsSection(
            title: "Advanced",
            icon: "gearshape",
            tooltip: "Less commonly changed settings."
        ) {
            VStack(alignment: .leading, spacing: 10) {
                // API key helper
                VStack(alignment: .leading, spacing: 4) {
                    settingLabel(
                        "API Key Helper",
                        tip: "Path to a script that prints an Anthropic API key. Claude Code runs it instead of reading ANTHROPIC_API_KEY."
                    )
                    TextField("~/scripts/get-api-key.sh", text: $settings.apiKeyHelper)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(size: 12, design: .monospaced))
                }

                Divider().opacity(0.5)

                // Cleanup period
                VStack(alignment: .leading, spacing: 4) {
                    settingLabel(
                        "Cleanup after (days)",
                        tip: "How many days Claude Code keeps session data before auto-deleting. Default is 30."
                    )
                    TextField("30", text: $settings.cleanupPeriodDays)
                        .textFieldStyle(.roundedBorder)
                        .frame(maxWidth: 80)
                        .font(.system(size: 12))
                }

                Divider().opacity(0.5)

                // Include co-authored-by
                HStack(spacing: 8) {
                    Toggle("", isOn: $settings.includeCoAuthoredBy)
                        .toggleStyle(.switch)
                        .scaleEffect(0.8)
                        .frame(width: 36)
                    VStack(alignment: .leading, spacing: 1) {
                        settingLabel(
                            "Include co-authored-by in commits",
                            tip: "Appends \"Co-Authored-By: Claude\" to every git commit Claude Code makes."
                        )
                    }
                }
            }
        }
    }

    private func settingLabel(_ text: String, tip: String) -> some View {
        HStack(spacing: 4) {
            Text(text)
                .font(.system(size: 12, weight: .medium))
            Button(action: {}) {
                Image(systemName: "questionmark.circle")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary.opacity(0.7))
            }
            .buttonStyle(.plain)
            .help(tip)
        }
    }

    // MARK: - Save bar

    private var saveBar: some View {
        VStack(spacing: 0) {
            Divider()
            HStack(spacing: 10) {
                // File path hint
                HStack(spacing: 4) {
                    Image(systemName: "doc.text")
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                    Text(shortPath(settings.currentPath))
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                }

                Spacer()

                if let err = settings.lastError {
                    HStack(spacing: 4) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 11))
                            .foregroundColor(.red)
                        Text(err)
                            .font(.system(size: 11))
                            .foregroundColor(.red)
                            .lineLimit(1)
                    }
                }

                if settings.savedRecently {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Saved")
                    }
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.green)
                } else {
                    Button(action: { settings.save() }) {
                        HStack(spacing: 5) {
                            if settings.isSaving {
                                ProgressView().scaleEffect(0.6).frame(width: 12, height: 12)
                            } else {
                                Image(systemName: "square.and.arrow.down")
                                    .font(.system(size: 11, weight: .semibold))
                            }
                            Text("Save Changes")
                                .font(.system(size: 12, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(ContentView.headerGrad)
                        .clipShape(RoundedRectangle(cornerRadius: 7))
                    }
                    .buttonStyle(.plain)
                    .disabled(settings.isSaving)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
        }
    }

    private func shortPath(_ path: String) -> String {
        let home = NSHomeDirectory()
        return path.hasPrefix(home) ? "~" + path.dropFirst(home.count) : path
    }
}

// MARK: - Section wrapper

private struct SettingsSection<Content: View>: View {
    let title: String
    let icon: String
    let tooltip: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.accentColor)
                Text(title)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.primary)
                Button(action: {}) {
                    Image(systemName: "questionmark.circle")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary.opacity(0.6))
                }
                .buttonStyle(.plain)
                .help(tooltip)
            }
            content()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 12)
    }
}

// MARK: - Flow layout for chips

private struct FlowLayout: Layout {
    var spacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = computeRows(subviews: subviews, width: proposal.width ?? .infinity)
        let height = rows.reduce(0.0) { acc, row in
            let rowH = row.map { $0.sizeThatFits(.unspecified).height }.max() ?? 0
            return acc + rowH + spacing
        } - spacing
        return CGSize(width: proposal.width ?? 0, height: max(0, height))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let rows = computeRows(subviews: subviews, width: bounds.width)
        var y = bounds.minY
        for row in rows {
            var x = bounds.minX
            let rowH = row.map { $0.sizeThatFits(.unspecified).height }.max() ?? 0
            for view in row {
                let size = view.sizeThatFits(.unspecified)
                view.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
                x += size.width + spacing
            }
            y += rowH + spacing
        }
    }

    private func computeRows(subviews: Subviews, width: CGFloat) -> [[LayoutSubviews.Element]] {
        var rows: [[LayoutSubviews.Element]] = [[]]
        var rowWidth: CGFloat = 0
        for view in subviews {
            let w = view.sizeThatFits(.unspecified).width
            if rowWidth + w + spacing > width && rowWidth > 0 {
                rows.append([view])
                rowWidth = w + spacing
            } else {
                rows[rows.count - 1].append(view)
                rowWidth += w + spacing
            }
        }
        return rows
    }
}
