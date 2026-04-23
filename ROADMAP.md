# mcpbolt — Roadmap

> The plan to ship mcpbolt as a **$29 lifetime indie Mac app** + free OSS CLI,
> launch on Product Hunt, and compound from there.
> Last updated: 2026-04-23

---

## 1. Positioning (the north star)

**Old framing:** "MCP server manager."
**New framing:** "**Visual settings editor for AI coding tools.**"

mcpbolt is the menubar app that edits every config file Claude Code, Cursor,
VS Code, Codex and the rest hide behind scary JSON. MCP servers, Claude Code
settings, Skills, Hooks, Sub-agents, secrets — all in one place, no JSON
syntax errors, no hand-editing.

**One-liner:**
> Every AI coding tool hides its real power in a JSON file. mcpbolt puts
> those files behind a menubar icon.

**Who it's for:** developers (especially vibe coders) using 2+ AI coding tools
who are tired of hand-editing JSON across scattered config files — and who
don't know half the settings even exist.

**The three sentences we repeat everywhere:**
1. One menubar icon. Every AI coding tool. Every hidden setting.
2. 12 editors supported — twice as many as the next tool.
3. Local-only, atomic writes, timestamped backups, no cloud.

**The $29 pitch:** Pay once, own forever. No subscription, no cloud, no account.
CLI stays free and open source; Mac app is polished, notarized, and paid.

**Out of scope (on purpose):**
- Enterprise / SSO / SAML / audit log / compliance
- Team sharing / cloud sync / accounts
- Becoming an IDE or a chat app
- Generic Raycast-style launcher territory

---

## 2. Business model — locked

| Surface | License | Price | Distribution |
| --- | --- | --- | --- |
| `mcpbolt` npm CLI | MIT, open source | Free | `npm i -g mcpbolt` |
| MCPBoltBar Mac app | **Closed source** | **$29 lifetime** | Direct download, license key |
| Landing page | Public | Free | `mcpbolt.com` (or similar) |
| MCP + Skills directory | Public website | Free (ad / sponsor potential) | `mcpbolt.app/servers`, `/skills` |

**Payment processor (to pick):** Lemon Squeezy or Paddle. Both handle EU VAT,
license keys, receipts. Not Stripe (VAT handling is a nightmare solo).

**Refund policy:** 30 days, no questions asked. Non-negotiable for Product
Hunt launch survival.

**Support channel:** single email, target 48-hour response.

**Deeplink moat:** register `mcpbolt://install?config=<base64>` and
`mcpbolt://install-skill?...` URL schemes. Every MCP creator, every blog post,
every directory can ship an "Install in mcpbolt" button. This is our
distribution travelling for free.

---

## 3. Decisions pending (blockers — resolve this week)

- [ ] **Closed source for the Mac app, open for the CLI — confirmed direction.** (Recommended, locked.)
- [ ] **Payment processor: Lemon Squeezy vs Paddle?**
- [ ] **Domain: mcpbolt.com available / already owned?**
- [ ] **Free Homebrew cask stays or goes?** (Keep as a trial build, or paid-only?)
- [ ] **Apple Developer account — enrolled yet?** ($99/yr, 1-3 day Apple review)
- [ ] **Product Hunt hunter identified?**
- [ ] **Launch target date locked?** (Proposed: 6-8 weeks out, Tuesday/Wednesday)

---

## 4. Shipped

### v0.1.0 — v0.2.1 (prior work)
- [x] Menubar app (SwiftUI, NSStatusItem, NSPopover)
- [x] 12-editor support (claude-desktop, claude-code, cursor, vscode, codex,
      windsurf, zed, continue, gemini, roo, opencode, cline)
- [x] Per-editor detection + server listing
- [x] Import sheet (JSON paste + `claude mcp add` CLI command parse)
- [x] Edit server (form-based, atomic writes)
- [x] Copy server between editors
- [x] Coverage grid view
- [x] Export all configs (zip)
- [x] Undo last change (backup rotation, 3 per file)
- [x] Launch at login toggle
- [x] `mcpbolt` npm CLI — MIT, on npmjs.com
- [x] Homebrew cask: `brew install --cask vishmathpati/mcpbolt/mcpboltbar`
- [x] Silent update check on launch
- [x] Landing page at mcpbolt domain

### v0.3.0 — Projects tab (just shipped)
- [x] Projects tab (third tab)
- [x] ProjectStore — UserDefaults persistence of recent folders
- [x] Landing list with per-tool server count chips + total pill
- [x] Drill-in detail view per project
- [x] Scope-aware `ConfigWriter` (`.cursor/mcp.json`, `.vscode/mcp.json`,
      `.roo/mcp.json`, `.mcp.json`)
- [x] `EditServerSheet` accepts optional `projectRoot`
- [x] Remove server from project scope (with backup)
- [x] Popover height bumped 600 → 720
- [x] `/release` skill (mac + npm + homebrew pipeline)

---

## 5. Pre-launch infrastructure (must do before charging money)

### Apple & signing
- [ ] Enroll in Apple Developer Program ($99/yr)
- [ ] Create Developer ID Application certificate
- [ ] Update `build-app.sh` to sign with Developer ID (not ad-hoc)
- [ ] Set up `notarytool` pipeline — submit, wait, staple
- [ ] Test download-from-web install with zero Gatekeeper warnings
- [ ] Automate notarization in `/release` skill

### Payment & licensing
- [ ] Create Lemon Squeezy or Paddle account
- [ ] Product page on chosen processor
- [ ] Test EU VAT handling end-to-end
- [ ] License key generation on purchase
- [ ] License validation in the Mac app (local check, no server calls ideal)
- [ ] Receipt email flow verified
- [ ] Refund flow documented
- [ ] Terms of Service + Privacy Policy + Refund Policy on landing page

### Distribution split
- [ ] Move `mac-app/` to a private repo (going closed source)
- [ ] Decide: keep the free Homebrew cask as a trial, or sunset it?
- [ ] Update landing: "Free CLI — `npm i -g mcpbolt`" + "Mac app — $29 lifetime"
- [ ] Update auto-updater (Sparkle framework) to handle paid vs trial builds

### Support
- [ ] Support email (e.g. `support@mcpbolt.com`) with autoresponder
- [ ] Simple FAQ page on landing
- [ ] Troubleshooting doc: Gatekeeper, permissions, uninstall, license issues

---

## 6. Launch features (v0.4 – v1.0, 6-8 weeks)

Reordered after research. Priority = "what pain is loudest + hardest to hand-edit."

### v0.4 — Claude Code settings editor + URL scheme (week 1) ⭐ NEXT
**Why:** People don't know half of Claude Code's settings exist because
`settings.json` is hidden and scary. Visual editor = unlocks features users
already paid for but can't reach. Same menubar shape as MCP tab.

- [ ] New tab: "Settings" (for `~/.claude/settings.json` + per-project `.claude/settings.json`)
- [ ] Form fields for known keys (default model, permission rules,
      allowed commands, env, hooks list pointer, MCP list pointer)
- [ ] Per-project vs user scope toggle
- [ ] "Explain this setting" tooltip on every field
- [ ] Atomic writes + `.bak` rotation (reuse existing infra)
- [ ] Register `mcpbolt://` URL scheme (handles `install`, `install-skill`,
      `open-project`)
- [ ] Handler opens the app, pre-fills Add Server sheet
- [ ] "Copy install button markdown" — gives creators a README snippet

### v0.5 — Health checks + MCP testing (week 2)
**Why:** Biggest trust + demo win. Tyler has it. "Paste any MCP config, see if it works."
- [ ] Menubar icon turns red if any server is broken
- [ ] Per-server status dot (green = OK, yellow = unknown, red = failing)
- [ ] Spawn stdio servers, capture stderr, surface first 3 lines of error
- [ ] "Why broken?" popover per failing server
- [ ] "Test" button on every server row — runs `tools/list`, shows tool names + count
- [ ] Tool-count warning for context bloat (flag >30 tools)
- [ ] Background refresh on popover open (rate-limited, 60s cache)

### v0.6 — Profiles + enable/disable toggle (week 3)
**Why:** Perplexity flagged this gap. Token-burn story. Users shouldn't have to
delete servers to mute them.
- [ ] Toggle per server (enabled / disabled) — disabled servers stored in
      parallel `.mcpbolt-disabled.json`
- [ ] Save current enabled-servers state as a named profile
- [ ] "Work" / "Personal" preset examples
- [ ] One-click apply profile (disables others, enables chosen set)
- [ ] Per-project auto-profile — `cd` into folder → profile activates
- [ ] Profiles stored in UserDefaults
- [ ] Export/import profiles as JSON

### v0.7 — Skills manager + full dashboard window (week 4-5)
**Why:** Anthropic gates skill sharing behind Team/Enterprise. Indies have no
help organizing them. Dashboard window gives us room for things that don't fit
a popover.
- [ ] New tab: "Skills"
- [ ] List skills from `~/.claude/skills/` + per-project `.claude/skills/`
- [ ] Enable / disable / edit SKILL.md frontmatter
- [ ] "New skill" template
- [ ] ⌘↵ "Open Dashboard" opens a full `NSWindow` (1200×800)
- [ ] Dashboard = expanded version of current tabs + YAML editor + logs
- [ ] Simple-mode / Advanced-mode toggle in preferences (hide all raw JSON
      for beginners; power users flip it back)

### v0.8 — Config Doctor + MCP install error handler (week 5-6)
**Why:** Bridges technical and non-technical. Every "just run this command"
tutorial becomes a button.
- [ ] One-click "Config Doctor" run: checks every tool config for
      duplicate servers, broken paths, expired keys, JSON syntax errors, missing env vars
- [ ] Report in plain English ("You have 3 issues. Click to fix.")
- [ ] MCP install error handler: when npx/uvx fails, parse error, show
      plain-English fix button (wrong Node version → install Node 20,
      EACCES → fix permissions, missing package → suggest alternative)
- [ ] "Fix it for me" button that runs the right command

### v0.9 — Usage dashboard + MCP/Skills directory site (week 6-7)
**Why:** Reads existing caches (zero risk). Directory = organic traffic funnel
into the app.
- [ ] Read Claude Code stats cache (`~/.claude/stats-cache.json`)
- [ ] Per-day usage chart + per-model breakdown + estimated cost
- [ ] Menubar quick-peek (today's tokens / cost)
- [ ] Directory website — Next.js static, scrapes GitHub awesome-lists only
- [ ] Routes: `/servers`, `/servers/[name]`, `/skills`, `/skills/[name]`
- [ ] Every page has an "Install in mcpbolt" button (uses v0.4 URL scheme)
- [ ] Credit original sources (GitHub authors) on every detail page
- [ ] Nightly cron to refresh

### v1.0 — Secrets vault + Hooks + Sub-agents + Session explorer (week 7-8)
**Why:** Polish pass. Everything else that paid users expect to exist.
- [ ] Keychain-backed secrets vault (replaces plaintext env in configs)
- [ ] Hooks manager (Claude Code `settings.json` hooks — visual editor)
- [ ] Sub-agents manager (`~/.claude/agents/`)
- [ ] Session explorer (browse Claude Code history, resume, export)
- [ ] mcpbolt-as-MCP (bundled server so Claude can drive mcpbolt itself —
      tools: `list_servers`, `add_server`, `enable`, `apply_profile`, etc.)
- [ ] Final QA pass, all tests green, notarization pipeline smoke test

**Then:** Product Hunt launch.

---

## 7. Post-launch (v1.1+ — only if users ask)

Don't build for launch. Only if demand appears after Product Hunt.

- [ ] Cursor settings editor (same pattern as Claude Code settings, different schema)
- [ ] Codex / Windsurf / Zed settings editors (same pattern, schema per tool)
- [ ] MCP server registry with ratings / install counts
- [ ] Server groups / tags
- [ ] Restart host-app integration (kill+relaunch Cursor/VS Code after config change)
- [ ] Global hotkey (⌘⇧M) to pop mcpbolt from anywhere
- [ ] ⌘K quick search across servers / skills / projects
- [ ] Featured listings / sponsored slots in directory

### Never building (explicit scope-cuts)
- Status line builder (niche)
- Spinner verbs (niche)
- Insights viewer (too vague — usage dashboard is the concrete version)
- Team features / SSO / enterprise (out of scope permanently)
- Cloud sync / account system (out of scope permanently)
- Chat interface / AI-in-the-app (not what we are)

---

## 8. Landing page rewrite

### Hero block
- Headline: **"Every AI coding tool. Every hidden setting. One menubar."**
- Sub: **"Stop hand-editing JSON. mcpbolt is the visual settings editor for
   Claude Code, Cursor, and 10 more — MCP servers, Skills, Hooks, secrets.
   Free CLI. $29 Mac app. Local-only."**
- Primary CTA: **Buy Mac app — $29 lifetime**
- Secondary CTA: **`npm i -g mcpbolt`** (free CLI)

### Sections to add
- [ ] Comparison table vs tylergraydev/claude-code-tool-manager and hand-editing
- [ ] Supported editors grid (logos × 12)
- [ ] Feature GIFs (settings editor, health checks, MCP testing, profiles)
- [ ] FAQ — especially **"why pay when CCTM is free?"**
- [ ] Trust block: local-only, atomic writes, backups, notarized, open source CLI
- [ ] Link to MCP/Skills directory (`/servers`, `/skills`)
- [ ] Refund policy link in the footer

### FAQ must-answers
- Why $29 if the CLI is free?
- Why buy when tylergraydev/claude-code-tool-manager is free?
- Does mcpbolt send anything to your servers? (No. Nothing.)
- What happens when macOS 16 ships — do I pay again? (No. Lifetime.)
- Can I get a refund? (Yes. 30 days, no questions.)
- What if you stop maintaining it? (CLI stays open source. The app keeps working.)

---

## 9. Product Hunt launch checklist

### 2 weeks out
- [ ] Hunter identified + briefed
- [ ] GIF / MP4 demos recorded (each <15 sec, <3MB)
- [ ] Gallery screenshots (5-8, high-res, dark + light mode)
- [ ] Maker comment pre-written (why I built this, what it solves, $29 reasoning)
- [ ] Landing page live + checkout tested end-to-end
- [ ] PH product listing drafted (title, tagline, description, topics)

### 1 week out
- [ ] Soft launch to r/ClaudeAI, r/LocalLLaMA, Hacker News "Show HN"
- [ ] Collect 10-20 early testimonials
- [ ] Fix every bug reported in beta
- [ ] Email list of 50+ people who want to know when you launch

### Launch day (Tuesday or Wednesday, 12:01 AM PST)
- [ ] Publish on PH
- [ ] Maker comment posted within 10 min of going live
- [ ] Share to Twitter/X, LinkedIn, Indie Hackers, relevant Discords
- [ ] Reply to every PH comment within 15 min for first 6 hours
- [ ] Monitor sales in Lemon Squeezy / Paddle dashboard
- [ ] Keep a bug tracker open — triage in real-time

### Week after launch
- [ ] Thank-you email to every buyer
- [ ] Post-launch blog/Twitter recap (numbers, lessons)
- [ ] Ship v1.0.1 patch for any launch-day bugs
- [ ] Start planning v1.1 based on buyer feedback

---

## 10. Revenue targets (realistic)

| Milestone | Sales | Gross ($29 × N, minus ~10% processor) |
| --- | --- | --- |
| Break-even on time invested (~200 hrs @ $50/hr = $10K) | 380 sales | $10K |
| PH launch day (top 3 finish) | 50-200 sales | $1.5K–6K |
| PH launch month | 200-800 sales | $6K–24K |
| Year 1 if product compounds | 1K-5K sales | $29K–145K |

**If Year 1 hits 1K+ sales, evaluate:** expanding into adjacent menubar-for-
vibe-coders products (see `ROADMAP.private.md`). Decision at Month 12,
not sooner.

---

## 11. Weekly cadence

- **Monday:** Review this roadmap, pick week's focus (1 version max)
- **Tuesday–Thursday:** Build + test
- **Friday:** Ship (via `/release`), write changelog, post to Twitter/X

Update this file whenever scope shifts or decisions land.

---

## Version history

| Version | Date | Changes |
| --- | --- | --- |
| v0.1 | 2026-04-23 | Initial roadmap. $29 lifetime Mac app + free OSS CLI. Launch target 6-8 weeks. Tyler-inspired cherry-pick. |
| v0.2 | 2026-04-23 | Repositioned: "visual settings editor for AI coding tools," not just MCP. Added Claude Code settings editor, URL scheme + install deeplinks, Config Doctor, MCP install error handler, Simple/Advanced toggle, full dashboard window, Skills manager promoted to launch features, MCP + Skills directory track, Keychain secrets vault. Reordered v0.4-v1.0. Separate-app ideas moved to `ROADMAP.private.md`. |
