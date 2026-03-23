---
name: setup
description: Initialize the game design plugin — creates project structure, sets up the UI Design System, and starts the dev server. Run once per project, or to reinitialize.
argument-hint: "[no arguments]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Agent, AskUserQuestion
---

# Plugin Setup

Full initialization of the game design plugin for this project. Handles everything — the user does nothing manually.

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

Based on what you found in step 2, present the situation to the user using `AskUserQuestion`.

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
* Create `.claude/drafts/`

```bash
mkdir -p {root}/Design {root}/Lore {root}/UI
mkdir -p .claude/drafts
```

The UI internal structure (Components/, Screens/, etc.) is managed by the ui-designer agent — do NOT create subdirectories here.

### 5. Save Project Structure Config

Write `.claude/project-structure.json` with the resolved paths:
```json
{
  "root": "GDD",
  "design": "GDD/Design",
  "lore": "GDD/Lore",
  "ui": "GDD/UI"
}
```

### 6. Copy UI Infrastructure

Find the plugin's `ui-template/` directory. It's in the same plugin as this skill — look for it relative to the skill's own path. Use Glob to find `**/ui-template/server.js` if needed.

Copy these files to `{ui_path}/`:
* `index.html`
* `system.css`
* `inspector.js`
* `scenario-player.js`
* `server.js`

Method: Read each file from the plugin template, Write it to the project.

**NEVER overwrite `common.css`** if it already exists — it contains the project's visual theme. All other infrastructure files are safe to overwrite on reinit.

### 7. Create common.css

If `{ui_path}/common.css` doesn't exist:

**First, check if the project already describes the visual style/platform.** You read documents in step 2 — use that information. If the documents describe the game's genre, platform, or visual direction, use it directly instead of asking.

**Only ask what you don't already know:**
* Platform (PC / Mobile / Console) — if not found in documents
* Visual style reference — if not found in documents

Then launch the `ui-designer` agent with a task to create `common.css` with:
* CSS variables for the palette
* Font imports matching the style
* Base component styles

If the user doesn't want to configure style yet — create a minimal `common.css` with neutral dark theme defaults. It can be customized later.

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

UI Server: http://localhost:8080
Drafts:    .claude/drafts/

Next steps:
  /game-design — start designing game mechanics
  /design-ui   — create a UI component or screen
```

## On Reinitialize

When the project is already set up and user wants to reinit:
* Update infrastructure files (index.html, system.css, etc.) — safe to overwrite
* Do NOT touch: common.css, anything in Components/, Screens/, Flows/, Animations/, Design/, Lore/
* Do NOT touch: .claude/project-structure.json (unless user wants to change paths)
* Restart the server

## Rules

* Detect the user's language and use it throughout.
* **Read first, ask second.** Never ask the user about information that's already in the project documents.
* **NEVER** move or reorganize files without explicit user approval.
* **NEVER** expose internal details. Say "Setting up the project..." not "Copying ui-template/inspector.js to GDD/UI/"
* If anything fails, explain what went wrong and suggest a fix.
