---
name: setup
description: This skill should be used when the user wants to "set up the project", "initialize game design", "run setup", "create the project structure", "reinitialize", or "start the UI server". Initializes directory structure, copies UI Design System infrastructure, and starts the dev server.
argument-hint: "[no arguments]"
user-invocable: true
allowed-tools: Read, LS, Glob, Grep, Write, Edit, Bash, Agent, AskUserQuestion
---

# Plugin Setup

Initialize the game design plugin for this project. Handle everything — the user does nothing manually.

## Workflow

### 1. Detect Current State

Check if `.claude/project-structure.json` exists.
* If yes — project is already initialized. Ask: "The project is already set up. Want to reinitialize? (This won't touch your existing design/lore/UI content files.)"
* If no — fresh project. Proceed.

### 2. Scan the Project (MANDATORY)

Before asking the user ANYTHING, scan the project thoroughly:

**2a. Find existing documents:**
* Glob for `**/*.md` (excluding node_modules, .git, .claude)
* Look for folders that contain game design documents, lore, world-building, UI mockups
* Identify the root folder where design documents live (might be `GDD/`, `Design/`, `docs/`, or documents might be in the root of a folder without subfolders)

**2b. Read key documents:**
* Search for Synopsis, Design Pillars, Visuals, or any document that describes the game
* Read them to understand: game genre, platform, visual style, setting
* This information is used later — do NOT ask the user about things that are already documented

**2c. Assess the structure:**
* Does the project have separate folders for design, lore, UI? Or is everything flat in one folder?
* Are there already markdown documents with game mechanics?
* Is there any lore/narrative content?
* Is there any UI work?

### 3. Determine Project Structure

**(MANDATORY — do NOT skip)** Present the situation to the user using `AskUserQuestion`. Do NOT proceed until the user responds.

**If documents exist but structure is flat (e.g., all .md files in GDD/ without subfolders):**
Show what you found and propose organizing:
* "I found N design documents in GDD/. Currently they're all in one folder. I'd like to organize them into subfolders for better navigation. Proposed structure:
  * GDD/Design/ — game design documents (I'll move existing .md files here)
  * GDD/Lore/ — lore and world-building (I'll move lore-related files here)
  * GDD/UI/ — UI Design System (new)"
* Options: "Reorganize as proposed", "Keep current structure, just add UI/", "Custom"

**If structure already has subfolders:**
Map what exists to the required categories (design, lore, ui). Show the mapping, ask to confirm.

**If nothing found:**
Propose default structure. Ask user to confirm or customize the root folder name (default: `GDD`).

**If user wants custom paths:**
Accept them. Map to required categories.

**CRITICAL: Always ask before moving or reorganizing files. NEVER move files without explicit approval.**

### 4. Create/Organize Directories

Based on user's choice:
* Create directories that don't exist
* Move files if user approved reorganization
* Create the `Drafts/` folder inside the project (visible to the user, NOT inside `.claude/`) — drafts are work-in-progress documents the user should be able to read and edit directly

```bash
mkdir -p {root}/Design {root}/Lore {root}/UI {root}/Drafts
```

If `{root}` is empty (project root has no wrapping folder), create the folders directly at the workspace root: `mkdir -p Design Lore UI Drafts`.

Create the `References/` directory inside the UI path — it holds the design tokens reference page:
```bash
mkdir -p {ui_path}/References
```

The rest of the UI internal structure (Components/, Screens/, etc.) is managed by the ui-designer agent — do NOT create those subdirectories here.

### 5. Save Project Structure Config

Write `.claude/project-structure.json` with the resolved paths:
```json
{
  "root": "GDD",
  "design": "GDD/Design",
  "lore": "GDD/Lore",
  "ui": "GDD/UI",
  "drafts": "GDD/Drafts"
}
```

If `root` is empty, the paths are just the folder names (e.g. `"drafts": "Drafts"`).

**Migration note:** if `project-structure.json` already exists but has no `drafts` field (old setup), add it on reinit. Default to `{root}/Drafts` (or `Drafts` if root is empty). If a `Drafts/` folder already exists in the project, use it; if not, create it.

### 6. Copy UI Infrastructure

Copy all infrastructure files from the plugin's `ui-template/` directory to `{ui_path}/` using Bash:
```bash
cp ${CLAUDE_PLUGIN_ROOT}/ui-template/index.html ${CLAUDE_PLUGIN_ROOT}/ui-template/system.css ${CLAUDE_PLUGIN_ROOT}/ui-template/inspector.js ${CLAUDE_PLUGIN_ROOT}/ui-template/scenario-player.js ${CLAUDE_PLUGIN_ROOT}/ui-template/server.js ${CLAUDE_PLUGIN_ROOT}/ui-template/utils.js {ui_path}/
```

**NEVER overwrite `common.css`** if it already exists — it contains the game's visual tokens. **NEVER overwrite `system.css`** if user has customized the tool theme (check if `--sys-*` values differ from defaults). All other infrastructure files are safe to overwrite on reinit.

### 7. Tool Theme (system.css)

**(MANDATORY — do NOT skip)** The design system tool's appearance is controlled by `--sys-*` CSS variables at the top of `system.css`. Use `AskUserQuestion` to ask the user how they want the tool to look. Do NOT proceed until the user responds.

* Options: "Describe my style" (e.g., "warm dark with orange accent", "light minimalist", "green terminal"), "Keep default (dark purple)", "Skip"

**Based on choice:**
* **Keep default / Skip** — do nothing.
* **Describe my style** — edit the `--sys-*` variables in `{ui_path}/system.css` using the Edit tool to match the user's description. The variables: `--sys-bg`, `--sys-surface`, `--sys-surface-hover`, `--sys-border`, `--sys-border-hover`, `--sys-text`, `--sys-text-dim`, `--sys-text-bright`, `--sys-accent`, `--sys-accent-dim`, `--sys-danger`, `--sys-radius`.

### 7b. Game Tokens (common.css)

`common.css` defines the game's visual identity — colors, fonts, spacing used by UI mockups. It is separate from the tool theme.

**If `common.css` already exists:** skip. It will be created/updated by the ui-designer agent when the user runs `/game-design:design-ui`.

**If `common.css` doesn't exist (MANDATORY — do NOT skip):** ask the user using `AskUserQuestion`. Do NOT create common.css without asking:
* Options: "Create from project style" (only if project has Visuals/style docs), "Describe game style", "Skip for now"

**Based on choice:**
* **Create from project style** — Launch `ui-designer` agent in **Mode C** with the task: "Mode C: Create {ui_path}/common.css". Pass the full text of Visuals/Synopsis documents and a concrete style summary (genre, platform, setting, visual direction).
* **Describe game style** — ask the user for platform and style description. Launch `ui-designer` in **Mode C** with: "Mode C: Create {ui_path}/common.css. Platform: {platform}. Style: {description}."
* **Skip** — do nothing. common.css will be created later when the user first runs `/game-design:design-ui`.

### 8. Check Node.js

```bash
node --version
```

If not available — warn that the UI Design System dev server requires Node.js. The rest of the plugin works without it.

### 9. Start UI Server

If Node.js is available:
```bash
cd {ui_path} && node server.js &
```

Tell the user the server is running at `http://localhost:8080`.

If Node.js is not available — skip and warn.

### 10. Summary

Report everything that was done:
```
Setup Complete
==============
Project structure: {root}/
  Design/  — game design documents
  Lore/    — lore documents
  UI/      — UI Design System
  Drafts/  — work-in-progress drafts (you can read/edit these too)

UI Server: http://localhost:8080

Next steps:
  Start designing — just describe what you want to design
  /game-design:design-ui     — create a UI component or screen
  /game-design:cleanup-drafts — manage draft files
```

## On Reinitialize

When the project is already set up and user wants to reinit:
* Update infrastructure files (index.html, system.css, utils.js, etc.) — safe to overwrite
* Do NOT touch: common.css, anything in Components/, Screens/, Flows/, Animations/, Design/, Lore/
* system.css: safe to overwrite UNLESS user customized the tool theme — in that case, preserve the `--sys-*` variable values
* Do NOT touch: .claude/project-structure.json (unless user wants to change paths)
* Restart the server

## Rules

* Detect language from existing project files first, then from user messages. Use it throughout.
* **Read first, ask second.** Never ask the user about information that's already in the project documents.
* **NEVER** move or reorganize files without explicit user approval.
* **NEVER** expose internal details. Say "Setting up the project..." not "Copying ui-template/inspector.js to GDD/UI/"
* If anything fails, explain what went wrong and suggest a fix.
