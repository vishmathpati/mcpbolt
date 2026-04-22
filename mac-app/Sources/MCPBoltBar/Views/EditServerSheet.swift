import SwiftUI
import AppKit

// MARK: - Edit a single server's config in-place.
// Replaces the previous value with whatever the form emits.

struct EditServerSheet: View {
    @EnvironmentObject var store: ServerStore
    let toolID: String
    let toolLabel: String
    let serverName: String
    /// When non-nil, edits land in the project-scope config under this folder
    /// (e.g. `<projectRoot>/.cursor/mcp.json`) instead of the user-scope file.
    let projectRoot: String?
    let onClose: () -> Void

    private var scope: ConfigScope { projectRoot == nil ? .user : .project }

    @State private var loaded = false
    @State private var errorMessage: String? = nil
    @State private var saving = false

    // Form state
    @State private var transport: String = "stdio" // "stdio" | "http"
    @State private var command: String   = ""
    @State private var argsText: String  = ""
    @State private var url: String       = ""
    @State private var envPairs: [EnvPair] = []

    struct EnvPair: Identifiable {
        let id = UUID()
        var key:   String
        var value: String
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            if !loaded {
                VStack { ProgressView().padding() }.frame(maxWidth: .infinity, minHeight: 200)
            } else {
                form
                footer
            }
        }
        .onAppear(perform: loadInitial)
    }

    // MARK: Header

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

            Text("Edit \(serverName)")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)

            Spacer()

            Text("in \(toolLabel)")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.60))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(ContentView.headerGrad)
    }

    // MARK: Form

    private var form: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {

                // Transport
                VStack(alignment: .leading, spacing: 6) {
                    label("Transport")
                    Picker("", selection: $transport) {
                        Text("Local (stdio)").tag("stdio")
                        Text("Remote (HTTP)").tag("http")
                    }
                    .pickerStyle(.segmented)
                    .labelsHidden()
                }

                if transport == "stdio" {
                    VStack(alignment: .leading, spacing: 6) {
                        label("Command")
                        TextField("npx", text: $command)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 12, design: .monospaced))
                    }
                    VStack(alignment: .leading, spacing: 6) {
                        label("Arguments (one per line)")
                        TextEditor(text: $argsText)
                            .font(.system(size: 11, design: .monospaced))
                            .frame(height: 90)
                            .padding(4)
                            .background(Color(NSColor.textBackgroundColor))
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                            .overlay(
                                RoundedRectangle(cornerRadius: 6)
                                    .stroke(Color(NSColor.separatorColor).opacity(0.6), lineWidth: 0.5)
                            )
                    }
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        label("URL")
                        TextField("https://example.com/mcp", text: $url)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 12, design: .monospaced))
                    }
                }

                // Env
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        label("Environment variables")
                        Spacer()
                        Button {
                            envPairs.append(EnvPair(key: "", value: ""))
                        } label: {
                            HStack(spacing: 3) {
                                Image(systemName: "plus.circle.fill")
                                Text("Add")
                            }
                            .font(.system(size: 11, weight: .medium))
                        }
                        .buttonStyle(.plain)
                        .foregroundColor(.accentColor)
                    }

                    if envPairs.isEmpty {
                        Text("None")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    } else {
                        VStack(spacing: 4) {
                            ForEach($envPairs) { $pair in
                                HStack(spacing: 6) {
                                    TextField("KEY", text: $pair.key)
                                        .textFieldStyle(.roundedBorder)
                                        .font(.system(size: 11, design: .monospaced))
                                        .frame(width: 140)
                                    SecureField("value", text: $pair.value)
                                        .textFieldStyle(.roundedBorder)
                                        .font(.system(size: 11, design: .monospaced))
                                    Button {
                                        envPairs.removeAll(where: { $0.id == pair.id })
                                    } label: {
                                        Image(systemName: "minus.circle")
                                            .foregroundColor(.secondary)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }

                if let err = errorMessage {
                    HStack(spacing: 6) {
                        Image(systemName: "exclamationmark.triangle.fill").foregroundColor(.orange)
                        Text(err).font(.system(size: 11))
                    }
                    .padding(8)
                    .background(Color.orange.opacity(0.10))
                    .clipShape(RoundedRectangle(cornerRadius: 6))
                }
            }
            .padding(14)
        }
        .frame(maxHeight: 420)
    }

    // MARK: Footer

    private var footer: some View {
        HStack {
            Button(action: onClose) {
                Text("Cancel")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .buttonStyle(.plain)
            Spacer()
            Button(action: save) {
                HStack(spacing: 5) {
                    if saving { ProgressView().scaleEffect(0.5).frame(width: 12, height: 12) }
                    Text("Save")
                        .font(.system(size: 12, weight: .semibold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 7)
                .background(ContentView.headerGrad)
                .clipShape(RoundedRectangle(cornerRadius: 7))
                .opacity(saving ? 0.6 : 1)
            }
            .buttonStyle(.plain)
            .disabled(saving)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }

    private func label(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(.secondary)
            .tracking(0.4)
    }

    // MARK: Actions

    private func loadInitial() {
        guard !loaded else { return }
        let config = ConfigWriter.readServer(
            toolID: toolID,
            scope: scope,
            projectRoot: projectRoot,
            name: serverName
        ) ?? [:]
        if let u = config["url"] as? String {
            transport = "http"
            url = u
        } else {
            transport = "stdio"
            command = (config["command"] as? String) ?? ""
            argsText = ((config["args"] as? [String]) ?? []).joined(separator: "\n")
        }
        if let env = config["env"] as? [String: Any] {
            envPairs = env
                .sorted(by: { $0.key < $1.key })
                .map { EnvPair(key: $0.key, value: "\($0.value)") }
        }
        loaded = true
    }

    private func save() {
        saving = true
        errorMessage = nil

        var config: [String: Any] = [:]
        if transport == "stdio" {
            let trimmedCmd = command.trimmingCharacters(in: .whitespaces)
            guard !trimmedCmd.isEmpty else {
                errorMessage = "Command is required."
                saving = false
                return
            }
            config["command"] = trimmedCmd
            let args = argsText
                .components(separatedBy: .newlines)
                .map { $0.trimmingCharacters(in: .whitespaces) }
                .filter { !$0.isEmpty }
            config["args"] = args
        } else {
            let trimmedURL = url.trimmingCharacters(in: .whitespaces)
            guard !trimmedURL.isEmpty else {
                errorMessage = "URL is required."
                saving = false
                return
            }
            config["url"] = trimmedURL
        }

        // Env
        var env: [String: String] = [:]
        for p in envPairs {
            let k = p.key.trimmingCharacters(in: .whitespaces)
            if k.isEmpty { continue }
            env[k] = p.value
        }
        if !env.isEmpty { config["env"] = env }

        let result = store.replaceServerConfig(
            toolID: toolID,
            scope: scope,
            projectRoot: projectRoot,
            name: serverName,
            config: config
        )
        saving = false
        if result.ok {
            onClose()
        } else {
            errorMessage = result.error ?? "Couldn't save."
        }
    }
}
