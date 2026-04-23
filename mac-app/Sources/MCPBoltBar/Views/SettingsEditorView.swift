import SwiftUI
import AppKit

// MARK: - Settings tab — unlock hidden Claude Code features

struct SettingsEditorView: View {
    @EnvironmentObject var settings: SettingsStore
    @EnvironmentObject var projects: ProjectStore

    var body: some View {
        VStack(spacing: 0) {
            scopeBar
            Divider()
            if settings.isLoading {
                loadingState
            } else {
                featureList
            }
        }
        .onAppear { settings.load() }
    }

    // MARK: - Scope bar

    private var scopeBar: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                scopeButton(label: "User",    scope: .user)
                scopeButton(label: "Local",   scope: .local)
                scopeButton(label: "Project", scope: .project)

                if settings.scope == .local || settings.scope == .project {
                    projectPicker
                }

                Spacer()

                if settings.savedRecently {
                    HStack(spacing: 3) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 10))
                            .foregroundColor(.green)
                        Text("Saved")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.green)
                    }
                    .transition(.opacity)
                }

                if settings.hasUndo {
                    Button(action: { settings.undo() }) {
                        Image(systemName: "arrow.uturn.backward")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                    .buttonStyle(.plain)
                    .help("Restore previous settings from backup")
                }
            }
            .padding(.horizontal, 12)
            .padding(.top, 8)
            .padding(.bottom, 4)
            .animation(.easeInOut(duration: 0.2), value: settings.savedRecently)

            HStack(spacing: 4) {
                Image(systemName: "doc.text")
                    .font(.system(size: 9))
                    .foregroundColor(.secondary.opacity(0.5))
                Text(shortSettingsPath)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(.secondary.opacity(0.5))
                    .lineLimit(1)
                    .truncationMode(.middle)
                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 6)
        }
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
            Text("No projects — add in Projects tab")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
        } else {
            Menu {
                ForEach(projects.projects) { proj in
                    Button(proj.displayName) { settings.projectPath = proj.path }
                }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "folder").font(.system(size: 10, weight: .medium))
                    Text(selectedProjectName).font(.system(size: 11, weight: .medium)).lineLimit(1)
                    Image(systemName: "chevron.down").font(.system(size: 9, weight: .medium))
                }
                .foregroundColor(.primary)
                .padding(.horizontal, 8).padding(.vertical, 4)
                .background(Color(NSColor.controlBackgroundColor))
                .clipShape(RoundedRectangle(cornerRadius: 5))
                .overlay(RoundedRectangle(cornerRadius: 5).stroke(Color(NSColor.separatorColor).opacity(0.6), lineWidth: 0.5))
            }
            .menuStyle(.borderlessButton).menuIndicator(.hidden).fixedSize()
        }
    }

    private var selectedProjectName: String {
        guard let path = settings.projectPath,
              let proj = projects.projects.first(where: { $0.path == path })
        else { return "Pick project…" }
        return proj.displayName
    }

    private var shortSettingsPath: String {
        let path = settings.settingsPath
        let home = NSHomeDirectory()
        return path.hasPrefix(home) ? "~" + path.dropFirst(home.count) : path
    }

    // MARK: - Loading state

    private var loadingState: some View {
        VStack(spacing: 10) {
            ProgressView()
            Text("Loading settings…").font(.system(size: 12)).foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity).padding(40)
    }

    // MARK: - Feature list

    private var featureList: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Section header
                HStack(spacing: 5) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.yellow)
                    Text("Hidden Features")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.primary)
                    Text("— one toggle instead of editing JSON")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                    Spacer()
                }
                .padding(.horizontal, 12)
                .padding(.top, 12)
                .padding(.bottom, 8)

                VStack(spacing: 6) {

                    // MARK: Performance
                    groupHeader("Performance")

                    FeatureCard(
                        icon: "arrow.up.to.line.circle.fill",
                        iconColor: Color(red: 0.2, green: 0.5, blue: 0.95),
                        title: "Extended Output Limit",
                        impact: "Claude sees full build logs — no more 30K char cutoff",
                        jsonHint: "env.CLAUDE_CODE_TERMINAL_OUTPUT_LIMIT=150000",
                        isOn: settings.extendedOutputLimit,
                        onToggle: { settings.toggle(.extendedOutputLimit) }
                    )

                    FeatureCard(
                        icon: "doc.text.fill",
                        iconColor: Color(red: 0.2, green: 0.5, blue: 0.95),
                        title: "Large File Reading",
                        impact: "Handle files >2K lines without truncation",
                        jsonHint: "env.CLAUDE_CODE_MAX_READ_LINES=5000",
                        isOn: settings.largeFileReading,
                        onToggle: { settings.toggle(.largeFileReading) }
                    )

                    FeatureCard(
                        icon: "text.justify.leading",
                        iconColor: Color(red: 0.2, green: 0.5, blue: 0.95),
                        title: "High Output Limit",
                        impact: "Allow up to 64K tokens per reply for long responses",
                        jsonHint: "env.MAX_OUTPUT_TOKENS=64000",
                        isOn: settings.highOutputLimit,
                        onToggle: { settings.toggle(.highOutputLimit) }
                    )

                    // MARK: Interface
                    groupHeader("Interface")

                    FeatureCard(
                        icon: "rectangle.expand.vertical",
                        iconColor: Color(red: 0.45, green: 0.3, blue: 0.9),
                        title: "Fullscreen Terminal",
                        impact: "Flicker-free alt-screen renderer with smooth scrollback",
                        jsonHint: "tui: \"fullscreen\"",
                        isOn: settings.fullscreenTerminal,
                        onToggle: { settings.toggle(.fullscreenTerminal) }
                    )

                    FeatureCard(
                        icon: "keyboard.fill",
                        iconColor: Color(red: 0.45, green: 0.3, blue: 0.9),
                        title: "Vim Keys",
                        impact: "j/k navigation in the Claude Code terminal UI",
                        jsonHint: "~/.claude.json: editorMode: \"vim\"",
                        isOn: settings.vimKeys,
                        onToggle: { settings.toggle(.vimKeys) }
                    )

                    FeatureCard(
                        icon: "shield.checkered",
                        iconColor: Color(red: 0.45, green: 0.3, blue: 0.9),
                        title: "Stable Updates",
                        impact: "Follow the stable channel (~1 week old, skips regressions)",
                        jsonHint: "autoUpdatesChannel: \"stable\"",
                        isOn: settings.stableUpdates,
                        onToggle: { settings.toggle(.stableUpdates) }
                    )

                    FeatureCard(
                        icon: "accessibility",
                        iconColor: Color(red: 0.45, green: 0.3, blue: 0.9),
                        title: "Reduced Motion",
                        impact: "Kill spinners, shimmer, and flash effects",
                        jsonHint: "prefersReducedMotion: true",
                        isOn: settings.reducedMotion,
                        onToggle: { settings.toggle(.reducedMotion) }
                    )

                    FeatureCard(
                        icon: "minus.circle.fill",
                        iconColor: Color(red: 0.45, green: 0.3, blue: 0.9),
                        title: "Hide Spinner Tips",
                        impact: "Cleaner spinner — no tips shown while Claude thinks",
                        jsonHint: "spinnerTipsEnabled: false",
                        isOn: settings.hideSpinnerTips,
                        onToggle: { settings.toggle(.hideSpinnerTips) }
                    )

                    // MARK: History & Privacy
                    groupHeader("History & Privacy")

                    FeatureCard(
                        icon: "calendar.badge.clock",
                        iconColor: Color(red: 0.95, green: 0.55, blue: 0.1),
                        title: "Keep Sessions 1 Year",
                        impact: "Don't lose debugging history after 30 days",
                        jsonHint: "cleanupPeriodDays: 365",
                        isOn: settings.keepSessions1Year,
                        onToggle: { settings.toggle(.keepSessions1Year) }
                    )

                    FeatureCard(
                        icon: "checkmark.seal.fill",
                        iconColor: Color(red: 0.15, green: 0.7, blue: 0.4),
                        title: "Clean Commits",
                        impact: "Remove \"🤖 Generated with Claude\" watermark from git history",
                        jsonHint: "attribution: {commit: \"\", pr: \"\"}",
                        isOn: settings.cleanCommits,
                        onToggle: { settings.toggle(.cleanCommits) }
                    )

                    FeatureCard(
                        icon: "eye.slash.fill",
                        iconColor: Color(red: 0.15, green: 0.7, blue: 0.4),
                        title: "Disable Telemetry",
                        impact: "Stop usage data from being sent to Anthropic",
                        jsonHint: "env.CLAUDE_CODE_DISABLE_TELEMETRY=1",
                        isOn: settings.disableTelemetry,
                        onToggle: { settings.toggle(.disableTelemetry) }
                    )

                    FeatureCard(
                        icon: "memories.badge.minus",
                        iconColor: Color(red: 0.15, green: 0.7, blue: 0.4),
                        title: "Disable Auto Memory",
                        impact: "Stop Claude from auto-saving memories across sessions",
                        jsonHint: "autoMemoryEnabled: false",
                        isOn: settings.disableAutoMemory,
                        onToggle: { settings.toggle(.disableAutoMemory) }
                    )

                    FeatureCard(
                        icon: "timer.square",
                        iconColor: Color(red: 0.15, green: 0.7, blue: 0.4),
                        title: "Disable Session Recap",
                        impact: "No one-line summary when you return to the terminal",
                        jsonHint: "awaySummaryEnabled: false",
                        isOn: settings.disableSessionRecap,
                        onToggle: { settings.toggle(.disableSessionRecap) }
                    )

                    // MARK: Workflow
                    groupHeader("Workflow")

                    FeatureCard(
                        icon: "checkmark.shield.fill",
                        iconColor: Color(red: 0.0, green: 0.65, blue: 0.75),
                        title: "Auto-Trust Project MCPs",
                        impact: "No repeated trust prompts for .mcp.json servers",
                        jsonHint: "enableAllProjectMcpServers: true",
                        isOn: settings.autoTrustProjectMCPs,
                        onToggle: { settings.toggle(.autoTrustProjectMCPs) }
                    )

                    FeatureCard(
                        icon: "arrow.triangle.branch",
                        iconColor: Color(red: 0.0, green: 0.65, blue: 0.75),
                        title: "Worktree Symlinks",
                        impact: "Reuse node_modules across git worktrees — no reinstalls",
                        jsonHint: "worktree.symlinkDirectories: [\"node_modules\"]",
                        isOn: settings.worktreeSymlinks,
                        onToggle: { settings.toggle(.worktreeSymlinks) }
                    )

                    FeatureCard(
                        icon: "eye.fill",
                        iconColor: Color(red: 0.0, green: 0.65, blue: 0.75),
                        title: "File Picker Shows All Files",
                        impact: "@ autocomplete includes gitignored files — useful in monorepos",
                        jsonHint: "respectGitignore: false",
                        isOn: settings.filePickerShowAll,
                        onToggle: { settings.toggle(.filePickerShowAll) }
                    )

                    // MARK: Thinking & Effort
                    groupHeader("Thinking & Effort")

                    FeatureCard(
                        icon: "bolt.circle.fill",
                        iconColor: Color(red: 0.95, green: 0.75, blue: 0.0),
                        title: "Max Effort Mode",
                        impact: "Claude puts maximum effort into every response — no shortcuts",
                        jsonHint: "effortLevel: \"xhigh\"",
                        isOn: settings.maxEffortMode,
                        onToggle: { settings.toggle(.maxEffortMode) }
                    )

                    FeatureCard(
                        icon: "brain.filled.head.profile",
                        iconColor: Color(red: 0.6, green: 0.25, blue: 0.9),
                        title: "Always-On Thinking",
                        impact: "Extended thinking enabled by default — shows reasoning summaries",
                        jsonHint: "alwaysThinkingEnabled: true + showThinkingSummaries: true",
                        isOn: settings.extendedThinking,
                        onToggle: { settings.toggle(.extendedThinking) }
                    )

                    // MARK: Global Preferences (~/.claude.json)
                    globalConfigHeader

                    FeatureCard(
                        icon: "link",
                        iconColor: Color(red: 0.4, green: 0.4, blue: 0.5),
                        title: "Auto-Connect to IDE",
                        impact: "Automatically connects when Claude Code starts from an external terminal",
                        jsonHint: "~/.claude.json: autoConnectIde: true",
                        isOn: settings.autoConnectIde,
                        onToggle: { settings.toggle(.autoConnectIde) }
                    )

                    FeatureCard(
                        icon: "doc.badge.arrow.up",
                        iconColor: Color(red: 0.4, green: 0.4, blue: 0.5),
                        title: "Response in External Editor",
                        impact: "Prepend Claude's last reply when you open the editor (Ctrl+G)",
                        jsonHint: "~/.claude.json: externalEditorContext: true",
                        isOn: settings.responseInEditor,
                        onToggle: { settings.toggle(.responseInEditor) }
                    )

                    FeatureCard(
                        icon: "clock.badge.xmark",
                        iconColor: Color(red: 0.4, green: 0.4, blue: 0.5),
                        title: "Hide Turn Duration",
                        impact: "Remove \"Cooked for 1m 6s\" messages after responses",
                        jsonHint: "~/.claude.json: showTurnDuration: false",
                        isOn: settings.hideTurnDuration,
                        onToggle: { settings.toggle(.hideTurnDuration) }
                    )

                    FeatureCard(
                        icon: "progress.indicator",
                        iconColor: Color(red: 0.4, green: 0.4, blue: 0.5),
                        title: "Disable Progress Bar",
                        impact: "Hide the terminal progress bar (Ghostty/iTerm2/ConEmu)",
                        jsonHint: "~/.claude.json: terminalProgressBarEnabled: false",
                        isOn: settings.disableProgressBar,
                        onToggle: { settings.toggle(.disableProgressBar) }
                    )
                }
                .padding(.horizontal, 12)

                // Hooks footer
                hooksCard
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
                    .padding(.bottom, 12)

                if let err = settings.lastError {
                    HStack(spacing: 6) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 11)).foregroundColor(.red)
                        Text(err).font(.system(size: 11)).foregroundColor(.red).lineLimit(2)
                        Spacer()
                    }
                    .padding(.horizontal, 12).padding(.bottom, 8)
                }
            }
        }
    }

    // MARK: - Group headers

    private func groupHeader(_ title: String) -> some View {
        HStack {
            Text(title.uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.secondary.opacity(0.7))
                .kerning(0.8)
            Spacer()
        }
        .padding(.top, 8)
        .padding(.bottom, 2)
    }

    private var globalConfigHeader: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text("GLOBAL PREFERENCES")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.secondary.opacity(0.7))
                    .kerning(0.8)
                Spacer()
            }
            Text("These go to ~/.claude.json — not affected by the scope above")
                .font(.system(size: 10))
                .foregroundColor(.secondary.opacity(0.55))
        }
        .padding(.top, 8)
        .padding(.bottom, 2)
    }

    // MARK: - Hooks card

    private var hooksCard: some View {
        Button(action: openSettingsInEditor) {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color(NSColor.windowBackgroundColor))
                        .frame(width: 32, height: 32)
                    Image(systemName: "terminal.fill")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.secondary)
                }
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Text("Hooks")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.primary)
                        Text("ADVANCED")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.secondary)
                            .padding(.horizontal, 4).padding(.vertical, 2)
                            .background(Color.secondary.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 3))
                            .kerning(0.5)
                    }
                    Text("Auto-lint, auto-test — run shell commands after every AI response")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                Image(systemName: "arrow.up.right.square")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary.opacity(0.7))
            }
            .padding(12)
            .background(Color(NSColor.controlBackgroundColor))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color(NSColor.separatorColor).opacity(0.5), lineWidth: 0.5))
        }
        .buttonStyle(.plain)
        .help("Opens settings.json in your default editor — add hooks manually")
    }

    private func openSettingsInEditor() {
        let path = settings.settingsPath
        if !FileManager.default.fileExists(atPath: path) {
            let dir = URL(fileURLWithPath: path).deletingLastPathComponent().path
            try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
            try? "{}".write(toFile: path, atomically: true, encoding: .utf8)
        }
        NSWorkspace.shared.open(URL(fileURLWithPath: path))
    }
}

// MARK: - Feature card

private struct FeatureCard: View {
    let icon:      String
    let iconColor: Color
    let title:     String
    let impact:    String
    let jsonHint:  String
    let isOn:      Bool
    let onToggle:  () -> Void

    var body: some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(iconColor.opacity(isOn ? 0.16 : 0.10))
                    .frame(width: 34, height: 34)
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(isOn ? iconColor : iconColor.opacity(0.55))
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.primary)
                Text(impact)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                Text(jsonHint)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(isOn ? iconColor.opacity(0.75) : Color.secondary.opacity(0.45))
                    .lineLimit(1)
                    .truncationMode(.middle)
            }

            Spacer()

            Toggle("", isOn: Binding(get: { isOn }, set: { _ in onToggle() }))
                .toggleStyle(.switch)
                .scaleEffect(0.78)
                .frame(width: 42)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(isOn ? iconColor.opacity(0.06) : Color(NSColor.controlBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(
                    isOn ? iconColor.opacity(0.35) : Color(NSColor.separatorColor).opacity(0.5),
                    lineWidth: isOn ? 1.0 : 0.5
                )
        )
        .animation(.spring(response: 0.22, dampingFraction: 0.82), value: isOn)
    }
}
