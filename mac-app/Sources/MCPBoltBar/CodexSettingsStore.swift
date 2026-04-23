import Foundation
import SwiftUI

// MARK: - Codex settings — reads and writes ~/.codex/config.toml

@MainActor
final class CodexSettingsStore: ObservableObject {

    // MARK: Feature flags ([features] table)
    @Published var memoriesEnabled: Bool = false    { didSet { if !isLoading { save() } } }
    @Published var codexHooksEnabled: Bool = false  { didSet { if !isLoading { save() } } }

    // MARK: Top-level booleans
    @Published var hideAgentReasoning: Bool = false  { didSet { if !isLoading { save() } } }
    @Published var showRawReasoning: Bool = false    { didSet { if !isLoading { save() } } }

    // MARK: Sub-table booleans (cards are "Disable X" — flag=true means feature disabled)
    @Published var analyticsDisabled: Bool = false   { didSet { if !isLoading { save() } } }
    @Published var feedbackDisabled: Bool = false    { didSet { if !isLoading { save() } } }
    @Published var animationsDisabled: Bool = false  { didSet { if !isLoading { save() } } }

    // MARK: Enum settings
    @Published var webSearch: WebSearch = .unset         { didSet { if !isLoading { save() } } }
    @Published var reasoningEffort: ReasoningEffort = .unset { didSet { if !isLoading { save() } } }
    @Published var personality: Personality = .unset     { didSet { if !isLoading { save() } } }

    @Published var lastError: String? = nil

    // MARK: - Enum types

    enum WebSearch: String, CaseIterable, Hashable {
        case unset = "", cached = "cached", live = "live", disabled = "disabled"
        var label: String {
            switch self {
            case .unset:    return "Default (cached)"
            case .cached:   return "Cached"
            case .live:     return "Live"
            case .disabled: return "Disabled"
            }
        }
    }

    enum ReasoningEffort: String, CaseIterable, Hashable {
        case unset = "", minimal = "minimal", low = "low", medium = "medium", high = "high", xhigh = "xhigh"
        var label: String {
            switch self {
            case .unset:   return "Default"
            case .minimal: return "Minimal"
            case .low:     return "Low"
            case .medium:  return "Medium"
            case .high:    return "High"
            case .xhigh:   return "Max (xhigh)"
            }
        }
    }

    enum Personality: String, CaseIterable, Hashable {
        case unset = "", none = "none", friendly = "friendly", pragmatic = "pragmatic"
        var label: String {
            switch self {
            case .unset:     return "Default"
            case .none:      return "None"
            case .friendly:  return "Friendly"
            case .pragmatic: return "Pragmatic"
            }
        }
    }

    // MARK: - Path

    let configPath: String = NSHomeDirectory() + "/.codex/config.toml"

    private var isLoading = false

    // MARK: - Load

    func load() {
        isLoading = true
        defer { isLoading = false }

        let text = (try? String(contentsOfFile: configPath, encoding: .utf8)) ?? ""

        memoriesEnabled    = readBool(section: "features",  key: "memories",               from: text) == true
        codexHooksEnabled  = readBool(section: "features",  key: "codex_hooks",             from: text) == true
        hideAgentReasoning = readBool(section: nil,         key: "hide_agent_reasoning",    from: text) == true
        showRawReasoning   = readBool(section: nil,         key: "show_raw_agent_reasoning",from: text) == true
        analyticsDisabled  = readBool(section: "analytics", key: "enabled",                 from: text) == false
        feedbackDisabled   = readBool(section: "feedback",  key: "enabled",                 from: text) == false
        animationsDisabled = readBool(section: "tui",       key: "animations",              from: text) == false

        webSearch       = WebSearch(rawValue:       readString(section: nil, key: "web_search",              from: text) ?? "") ?? .unset
        reasoningEffort = ReasoningEffort(rawValue: readString(section: nil, key: "model_reasoning_effort",  from: text) ?? "") ?? .unset
        personality     = Personality(rawValue:     readString(section: nil, key: "personality",             from: text) ?? "") ?? .unset
    }

    // MARK: - Save

    private func save() {
        var text = (try? String(contentsOfFile: configPath, encoding: .utf8)) ?? ""

        // Feature flags ([features])
        text = tomlSet(section: "features", key: "memories",    value: memoriesEnabled   ? "true" : nil, in: text)
        text = tomlSet(section: "features", key: "codex_hooks", value: codexHooksEnabled ? "true" : nil, in: text)

        // Top-level booleans
        text = tomlSet(section: nil, key: "hide_agent_reasoning",     value: hideAgentReasoning ? "true" : nil, in: text)
        text = tomlSet(section: nil, key: "show_raw_agent_reasoning",  value: showRawReasoning   ? "true" : nil, in: text)

        // Sub-table booleans (disabled=true → write enabled=false; disabled=false → remove key)
        text = tomlSet(section: "analytics", key: "enabled", value: analyticsDisabled  ? "false" : nil, in: text)
        text = tomlSet(section: "feedback",  key: "enabled", value: feedbackDisabled   ? "false" : nil, in: text)
        text = tomlSet(section: "tui",       key: "animations", value: animationsDisabled ? "false" : nil, in: text)

        // Enum settings (unset = remove key to restore Codex default)
        text = tomlSet(section: nil, key: "web_search",             value: webSearch       != .unset ? "\"\(webSearch.rawValue)\""       : nil, in: text)
        text = tomlSet(section: nil, key: "model_reasoning_effort", value: reasoningEffort != .unset ? "\"\(reasoningEffort.rawValue)\"" : nil, in: text)
        text = tomlSet(section: nil, key: "personality",            value: personality     != .unset ? "\"\(personality.rawValue)\""     : nil, in: text)

        do {
            let dir = URL(fileURLWithPath: configPath).deletingLastPathComponent().path
            try FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
            try text.write(toFile: configPath, atomically: true, encoding: .utf8)
            lastError = nil
        } catch {
            lastError = error.localizedDescription
        }
    }

    // MARK: - TOML read helpers

    private func readValue(section: String?, key: String, from text: String) -> String? {
        var currentSection: String? = nil
        for line in text.components(separatedBy: .newlines) {
            let t = line.trimmingCharacters(in: .whitespaces)
            if t.hasPrefix("[") && !t.hasPrefix("[[") {
                let inner = t.dropFirst()
                currentSection = String(inner.prefix(while: { $0 != "]" }))
                continue
            }
            let inTarget = (section == nil && currentSection == nil) ||
                           (section != nil && currentSection == section)
            if inTarget && !t.hasPrefix("#"), let eqIdx = t.range(of: "=") {
                let k = t[..<eqIdx.lowerBound].trimmingCharacters(in: .whitespaces)
                if k == key {
                    return t[t.index(after: eqIdx.lowerBound)...].trimmingCharacters(in: .whitespaces)
                }
            }
        }
        return nil
    }

    private func readBool(section: String?, key: String, from text: String) -> Bool? {
        guard let v = readValue(section: section, key: key, from: text) else { return nil }
        return v == "true"
    }

    private func readString(section: String?, key: String, from text: String) -> String? {
        guard let v = readValue(section: section, key: key, from: text) else { return nil }
        if v.hasPrefix("\"") && v.hasSuffix("\"") { return String(v.dropFirst().dropLast()) }
        return v
    }

    // MARK: - TOML write helper

    /// Set or remove a key in the given section (nil = top-level).
    private func tomlSet(section: String?, key: String, value: String?, in text: String) -> String {
        var lines = text.components(separatedBy: .newlines)

        var currentSection: String? = nil
        var sectionHeaderIdx: Int? = nil
        var keyLineIdx: Int? = nil
        var nextSectionIdx: Int? = nil
        var pastTarget = false

        for (i, line) in lines.enumerated() {
            let t = line.trimmingCharacters(in: .whitespaces)
            if t.hasPrefix("[") && !t.hasPrefix("[[") {
                let sName = String(t.dropFirst().prefix(while: { $0 != "]" }))
                if section != nil && sName == section! {
                    sectionHeaderIdx = i
                    currentSection = sName
                    pastTarget = false
                } else {
                    if sectionHeaderIdx != nil && !pastTarget {
                        nextSectionIdx = i
                        pastTarget = true
                    }
                    currentSection = sName
                }
                continue
            }
            if pastTarget { continue }
            let inTarget = (section == nil && currentSection == nil) ||
                           (section != nil && currentSection == section)
            if inTarget && !t.hasPrefix("#"), let eqIdx = t.range(of: "=") {
                let k = t[..<eqIdx.lowerBound].trimmingCharacters(in: .whitespaces)
                if k == key { keyLineIdx = i }
            }
        }

        if let idx = keyLineIdx {
            if let v = value { lines[idx] = "\(key) = \(v)" }
            else              { lines.remove(at: idx) }
        } else if let v = value {
            if let sec = section {
                if let headerIdx = sectionHeaderIdx {
                    let insertAt = nextSectionIdx ?? lines.count
                    _ = headerIdx  // we have the section; insert before next section or at end
                    lines.insert("\(key) = \(v)", at: insertAt)
                } else {
                    if lines.last.map({ !$0.isEmpty }) == true { lines.append("") }
                    lines.append("[\(sec)]")
                    lines.append("\(key) = \(v)")
                }
            } else {
                let firstSec = lines.firstIndex(where: {
                    let t = $0.trimmingCharacters(in: .whitespaces)
                    return t.hasPrefix("[") && !t.hasPrefix("[[")
                })
                if let idx = firstSec { lines.insert("\(key) = \(v)", at: idx) }
                else                  { lines.append("\(key) = \(v)") }
            }
        }

        return lines.joined(separator: "\n")
    }
}
