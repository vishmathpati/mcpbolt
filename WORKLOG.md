# Worklog — cleared after each session.

[18:08] fixed: ImportParser now handles bare `npx`/`bunx` commands (Path 1c) — ImportParser.swift. Derives server name from package identifier, preserves all args. Wizard commands (npx pkg mcp add) still caught by isWizardCommand before reaching this path.
[18:35] fixed: parseCliAdd now handles flags in any order (before/after name) — ImportParser.swift. Fixes `claude mcp add --scope project --transport http`, `gemini mcp add -t http`, `codex mcp add --url` all parsing correctly. Added `opencode` to tool prefixes. Added `authCommand` error for `mcp auth`/`mcp login`/`mcp logout` commands with helpful runtime message.
[15:30] fixed: Claude Code global MCPs now reads all 3 files (~/.claude.json + ~/.claude/settings.json + ~/.claude/mcp.json) instead of 1 — src/targets/claude-code.ts + ConfigReader.swift
[15:30] fixed: Claude Desktop DXT extensions (Control Chrome, Filesystem, Control your Mac, PDF Tools) now detected — src/targets/claude-desktop.ts + ConfigReader.swift
[15:30] fixed: Codex plugin-bundled MCPs now detected (github, vercel, computer-use etc) — src/targets/codex.ts + ConfigReader.swift  
[15:30] fixed: Claude Code plugin MCPs now detected (vercel, chrome-devtools, dodopayments etc) — ConfigReader.swift
[15:30] added: auth detection for all servers (env cred keys, OAuth note, auth headers) — needsAuth + oauthNote fields
[15:30] added: source field (manual/extension/plugin) + readonly flag for DXT/plugin entries — Models.swift + ServerEntry in reader.ts
[15:30] added: key icon next to server name when needsAuth=true, Extension/Plugin chip for non-manual sources — ByToolView.swift
[18:50] found_bug: cask URL had \#{version} instead of #{version} — all casks since 0.5.21 had broken brew URL — fixed live tap + release.sh — P1
[18:50] fixed: release.sh \#{version} and \#{appdir} → #{version} and #{appdir}
[18:50] fixed: direct download relaunch — replaced child proc.run() with nohup double-fork in sh wrapper — mac-v0.5.23
[18:50] decided: replaced brew upgrade path with direct GitHub download in performDirectUpdate — brew HOMEBREW_NO_AUTO_UPDATE=1 caused stale cask, no-op upgrades
