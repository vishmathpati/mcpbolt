import SwiftUI

// MARK: - "Coverage" tab — dot-matrix grid with per-tool accent colors

struct CoverageView: View {
    @EnvironmentObject var store: ServerStore

    // Layout constants (fit 10 tools + name + cov column in 460px)
    private let nameW:   CGFloat = 128
    private let cellW:   CGFloat = 26
    private let covW:    CGFloat = 36
    private let dotSize: CGFloat = 10

    var body: some View {
        let detected   = store.detectedTools
        let allNames   = store.allServerNames.filter { store.matches($0) }
        let toolCount  = detected.count

        VStack(spacing: 0) {
            // ── Legend ────────────────────────────────────────────────
            legendSection(tools: detected)

            Divider()

            // ── Grid ──────────────────────────────────────────────────
            if allNames.isEmpty {
                emptyHit
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        headerRow(tools: detected, toolCount: toolCount)
                        Divider()

                        ForEach(Array(allNames.enumerated()), id: \.element) { idx, name in
                            dataRow(
                                name: name,
                                tools: detected,
                                toolCount: toolCount,
                                idx: idx
                            )
                        }
                    }
                }
                .frame(maxHeight: 360)
            }

            Divider()

            // ── Footer ────────────────────────────────────────────────
            HStack(spacing: 12) {
                HStack(spacing: 4) {
                    Circle().fill(Color.green).frame(width: 7, height: 7)
                    Text("installed").font(.system(size: 10)).foregroundColor(.secondary)
                }
                HStack(spacing: 4) {
                    Circle().fill(Color.secondary.opacity(0.22)).frame(width: 7, height: 7)
                    Text("not installed").font(.system(size: 10)).foregroundColor(.secondary)
                }
                Spacer()
                Text("cov = apps it's installed on")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary.opacity(0.6))
                    .fixedSize()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
    }

    // MARK: - Legend (3 per row, fixed-size pills so labels never wrap)

    private func legendSection(tools: [ToolSummary]) -> some View {
        let chunkSize = 3
        let chunks = stride(from: 0, to: tools.count, by: chunkSize).map {
            Array(tools[$0..<min($0 + chunkSize, tools.count)])
        }
        return VStack(alignment: .leading, spacing: 6) {
            ForEach(Array(chunks.enumerated()), id: \.offset) { _, chunk in
                HStack(spacing: 6) {
                    ForEach(chunk) { tool in
                        legendPill(tool: tool)
                    }
                    Spacer(minLength: 0)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }

    private func legendPill(tool: ToolSummary) -> some View {
        let c = ToolPalette.color(for: tool.toolID)
        return HStack(spacing: 5) {
            Circle()
                .fill(c)
                .frame(width: 7, height: 7)
            Text(tool.short)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(c)
                .fixedSize()
            Text(tool.label)
                .font(.system(size: 10))
                .foregroundColor(.secondary)
                .fixedSize()
                .lineLimit(1)
        }
        .fixedSize(horizontal: true, vertical: false)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(c.opacity(0.10))
        .clipShape(Capsule())
    }

    // MARK: - Column header row

    private func headerRow(tools: [ToolSummary], toolCount: Int) -> some View {
        HStack(spacing: 0) {
            Text("Server")
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.secondary)
                .frame(width: nameW, alignment: .leading)

            ForEach(tools) { tool in
                Text(tool.short)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(ToolPalette.color(for: tool.toolID))
                    .frame(width: cellW, alignment: .center)
                    .help(tool.label)
            }

            Text("cov")
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.secondary)
                .frame(width: covW, alignment: .trailing)

            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 7)
        .background(Color(NSColor.controlBackgroundColor))
    }

    // MARK: - Data row

    private func dataRow(
        name: String,
        tools: [ToolSummary],
        toolCount: Int,
        idx: Int
    ) -> some View {
        let covCount = tools.filter { $0.servers.contains { $0.name == name } }.count
        let fraction = toolCount > 0 ? Double(covCount) / Double(toolCount) : 0.0
        let covColor: Color = fraction >= 0.8 ? .green
                            : fraction >= 0.4 ? Color(red: 0.92, green: 0.66, blue: 0.12)
                            : .secondary

        return HStack(spacing: 0) {
            Text(name)
                .font(.system(size: 11, weight: .medium))
                .lineLimit(1)
                .truncationMode(.tail)
                .frame(width: nameW, alignment: .leading)

            ForEach(tools) { tool in
                let has = tool.servers.contains { $0.name == name }
                Circle()
                    .fill(has
                          ? ToolPalette.color(for: tool.toolID)
                          : Color.secondary.opacity(0.14))
                    .frame(width: dotSize, height: dotSize)
                    .frame(width: cellW)
            }

            Text("\(covCount)/\(toolCount)")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(covColor)
                .frame(width: covW, alignment: .trailing)

            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 5)
        .background(
            idx % 2 == 0
                ? Color.clear
                : Color(NSColor.controlBackgroundColor).opacity(0.4)
        )
    }

    // MARK: - Empty search state

    private var emptyHit: some View {
        VStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 22))
                .foregroundColor(.secondary)
            Text("No servers match “\(store.searchText)”")
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(40)
    }
}
