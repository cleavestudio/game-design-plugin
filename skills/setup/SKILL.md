---
name: setup
description: This skill should be used when the user wants to "set up the project", "initialize game design", "run setup", "create the project structure", "reinitialize", "connect a Miro board", or "start the UI server". Initializes storage mode (files / Miro / both), directory structure, copies UI Design System infrastructure, and starts the dev server.
argument-hint: "[no arguments]"
user-invocable: true
allowed-tools: Read, LS, Glob, Grep, Write, Edit, Bash, AskUserQuestion, ToolSearch
---

# Plugin Setup

Initialize the game design plugin for this project. Handle everything — the user does nothing manually.

Storage-mode semantics are defined in `${CLAUDE_PLUGIN_ROOT}/shared/storage-modes.md` (the plugin root's `shared/` folder, two levels above this skill's base directory) — read it first.

## Workflow

### 1. Detect Current State

Check if `.claude/project-structure.json` exists.
* If yes — project is already initialized. Ask: "The project is already set up. Want to reinitialize? (This won't touch your existing design/lore/UI content files.)"
* If no — fresh project. Proceed.

### 2. Scan the Project (MANDATORY)

Before asking the user ANYTHING, scan the project thoroughly:

**2a. Find existing documents:**
* Glob for `**/*.md` (excluding node_modules, .git, .claude)
* Look for folders containing game design documents, lore, world-building, UI mockups
* Identify the root folder where design documents live (`GDD/`, `Design/`, `docs/`, or flat)

**2b. Read key documents:**
* Search for Synopsis, Design Pillars, Visuals, or any document describing the game
* Read them to understand genre, platform, visual style, setting — do NOT ask the user about things already documented

**2c. Assess the structure:**
* Separate folders for design/lore/UI, or flat? Existing mechanics docs? Lore? UI work?

### 3. Storage Mode (MANDATORY — do NOT skip)

Ask with `AskUserQuestion` where the game design work lives:
* **Files** — everything in markdown files in this repo (classic).
* **Miro** — design thinking and documents live on a Miro board; only the UI Design System lives in files.
* **Both** — Miro for thinking (brainstorm, dependency graph), files for final documents.

If Miro is involved, ask for the board URL (the user can paste it as free text). Verify via `ToolSearch` that **both** Miro MCP servers are available: `miro` (official, for creating/editing board content) and `miro-connector` (studio server, for cheap board reading and connector styling — see `shared/miro-method.md` → Tooling). If either is missing, warn what will be degraded, but continue setup.

### 4. Determine Directory Structure

**Files / Both** (MANDATORY — do NOT skip): present the situation using `AskUserQuestion`. Do NOT proceed until the user responds.

* **Documents exist but flat:** show what you found, propose organizing into `{root}/Design`, `{root}/Lore`, `{root}/UI` (options: "Reorganize as proposed", "Keep current structure, just add UI/", "Custom").
* **Structure already has subfolders:** map to the categories (design, lore, ui), show the mapping, confirm.
* **Nothing found:** propose the default structure; confirm root folder name (default `GDD`).
* **Custom paths:** accept and map.

**CRITICAL: Always ask before moving or reorganizing files. NEVER move files without explicit approval.**

**Miro only:** no Design/Lore/Drafts folders. Only the UI path is needed (default `{root}/UI` or `UI/`) — the UI Design System always lives in files. Confirm the UI location with the user.

### 5. Create/Organize Directories

Based on the user's choice:
* Create directories that don't exist; move files only if the user approved.
* **Files / Both:** create `{root}/Design {root}/Lore {root}/UI {root}/Drafts` (drafts are visible work-in-progress documents, NOT inside `.claude/`). If `{root}` is empty, create the folders at the workspace root.
* **Miro only:** create only the UI path.
* Always create `{ui_path}/References/` (holds the design tokens reference page). The rest of the UI internal structure (Components/, Screens/, etc.) is managed by the design-ui skill — do NOT create those here.

### 6. Save Project Structure Config

Write `.claude/project-structure.json` with the storage mode and resolved paths:

```json
{
  "storage": "both",
  "miro": { "board": "https://miro.com/app/board/uXjV.../" },
  "root": "GDD",
  "design": "GDD/Design",
  "lore": "GDD/Lore",
  "ui": "GDD/UI",
  "drafts": "GDD/Drafts"
}
```

* `miro` only when storage is `miro` or `both`.
* `miro` mode: omit `design`, `lore`, `drafts` — keep `root` and `ui`.
* If `root` is empty, paths are just folder names (e.g. `"drafts": "Drafts"`).

**Migration:** if an existing config has no `storage` field (old setup), it's a files project — on reinit, ask whether the user wants to connect Miro; add `"storage"` accordingly. If it has no `drafts` field (files/both), add it — default `{root}/Drafts`, reuse an existing `Drafts/` folder if present.

### 7. Copy UI Infrastructure

Copy all infrastructure files from the plugin's `ui-template/` directory to `{ui_path}/` using Bash, then make the shell launcher executable:
```bash
cp ${CLAUDE_PLUGIN_ROOT}/ui-template/index.html ${CLAUDE_PLUGIN_ROOT}/ui-template/system.css ${CLAUDE_PLUGIN_ROOT}/ui-template/inspector.js ${CLAUDE_PLUGIN_ROOT}/ui-template/scenario-player.js ${CLAUDE_PLUGIN_ROOT}/ui-template/server.js ${CLAUDE_PLUGIN_ROOT}/ui-template/utils.js ${CLAUDE_PLUGIN_ROOT}/ui-template/start.js ${CLAUDE_PLUGIN_ROOT}/ui-template/start.sh ${CLAUDE_PLUGIN_ROOT}/ui-template/start.bat {ui_path}/
chmod +x {ui_path}/start.sh {ui_path}/start.js
```

**NEVER overwrite `common.css`** if it exists — it contains the game's visual tokens. **NEVER overwrite `system.css`** if the user customized the tool theme (check if `--sys-*` values differ from defaults). All other infrastructure files are safe to overwrite on reinit.

### 8. Tool Theme (system.css)

**(MANDATORY — do NOT skip)** The design system tool's appearance is controlled by `--sys-*` CSS variables at the top of `system.css`. Ask with `AskUserQuestion` how the user wants the tool to look:

* Options: "Describe my style" (e.g., "warm dark with orange accent", "light minimalist", "green terminal"), "Keep default (dark purple)", "Skip"
* **Describe my style** — edit the `--sys-*` variables in `{ui_path}/system.css` to match. Variables: `--sys-bg`, `--sys-surface`, `--sys-surface-hover`, `--sys-border`, `--sys-border-hover`, `--sys-text`, `--sys-text-dim`, `--sys-text-bright`, `--sys-accent`, `--sys-accent-dim`, `--sys-danger`, `--sys-radius`.

### 8b. Game Tokens (common.css)

`common.css` defines the game's visual identity — separate from the tool theme.

**If it exists:** skip. **If not (MANDATORY — ask, never create silently):** `AskUserQuestion` with options: "Create from project style" (only if the project has Visuals/style docs), "Describe game style", "Skip for now".

* **Create from project style / Describe game style** — load the `game-design:design-ui` skill and run its **Tokens** mode with the gathered style context (genre, platform, setting, visual direction — from docs or from the user's description).
* **Skip** — common.css will be created on the first UI task.

### 9. Check Node.js

```bash
node --version
```

If not available — warn that the UI Design System dev server requires Node.js. The rest of the plugin works without it.

### 10. Start UI Server

If Node.js is available, launch the server in the background via the cross-platform launcher:
```bash
cd {ui_path} && sh start.sh
```

Tell the user: server at `http://localhost:8080`; logs in `{ui_path}/server.log`; stop/restart/status via `sh start.sh stop` (`start.bat stop` on Windows). If Node.js is missing — skip and warn.

### 11. Summary

Report what was done — structure created (per storage mode), Miro board connected (if any), UI server status, and next steps:
* Start designing — just describe what you want to design (or brainstorm on the board)
* `/game-design:design-ui` — create a UI component or screen
* `/game-design:cleanup-drafts` — manage draft files (files/both projects)

## On Reinitialize

* Update infrastructure files (index.html, utils.js, inspector.js, scenario-player.js, server.js, start.js, start.sh, start.bat) — safe to overwrite. Re-apply `chmod +x`.
* Do NOT touch: common.css, anything in Components/, Screens/, Flows/, Animations/, Design/, Lore/, Drafts/
* system.css: safe to overwrite UNLESS the user customized the theme — then preserve `--sys-*` values.
* `.claude/project-structure.json`: only change if the user wants different paths or a different storage mode.
* Restart the server: `cd {ui_path} && sh start.sh restart`

## Rules

* Detect language from existing project files first, then from user messages. Use it throughout.
* **Read first, ask second.** Never ask about information already in the project documents.
* **NEVER** move or reorganize files without explicit user approval.
* **NEVER** expose internal details. Say "Setting up the project..." not "Copying ui-template/inspector.js to GDD/UI/"
* If anything fails, explain what went wrong and suggest a fix.
