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

### 2. Determine Project Structure

Scan the project for existing folders that look like design documents, lore, or UI mockups.

**If nothing found:**
Propose default structure. Ask user to confirm or customize the root folder name (default: `GDD`).

**If existing structure found:**
Show what was found. Propose adapting it or reorganizing into the default. Explain why the structure matters (agents need to know where to write). Let the user decide.

**If user wants custom paths:**
Accept them. Map to required categories.

Default structure:
```
GDD/
  Design/     ← game design documents
  Lore/       ← lore documents
  UI/         ← UI Design System (mockups, components, screens)
```

### 3. Create Directories

Create all directories that don't exist:
```bash
mkdir -p {root}/Design {root}/Lore {root}/UI
mkdir -p .claude/drafts
```

The UI internal structure (Components/, Screens/, etc.) is managed by the ui-designer agent — do NOT create subdirectories here.

### 4. Save Project Structure Config

Write `.claude/project-structure.json`:
```json
{
  "root": "GDD",
  "design": "GDD/Design",
  "lore": "GDD/Lore",
  "ui": "GDD/UI"
}
```

### 5. Copy UI Infrastructure

Find the plugin's `ui-template/` directory. It's in the same plugin as this skill — look for it relative to the skill's own path. Use Glob to find `**/ui-template/server.js` if needed.

Copy these files to `{ui_path}/`:
* `index.html`
* `system.css`
* `inspector.js`
* `scenario-player.js`
* `server.js`

Method: Read each file from the plugin template, Write it to the project.

**NEVER overwrite `common.css`** if it already exists — it contains the project's visual theme. All other infrastructure files are safe to overwrite on reinit.

### 6. Create common.css

If `{ui_path}/common.css` doesn't exist, ask the user:
* "What platform is your game?" (PC / Mobile / Console)
* "What visual style? Pick a reference or describe briefly." (e.g., "dark sci-fi", "cozy pixel art", "clean minimalist")

Then launch the `ui-designer` agent with a task to create `common.css` with:
* CSS variables for the palette
* Font imports matching the style
* Base component styles

If the user doesn't want to configure style yet — create a minimal `common.css` with neutral dark theme defaults. It can be customized later.

### 7. Check Node.js

```bash
node --version
```

If not available — warn that the UI Design System dev server requires Node.js. The rest of the plugin works without it.

### 8. Start UI Server

If Node.js is available:
```bash
cd {ui_path} && node server.js &
```

Tell the user the server is running at `http://localhost:8080`.

If Node.js is not available — skip and warn.

### 9. Summary

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
* **NEVER** expose internal details. Say "Setting up the project..." not "Copying ui-template/inspector.js to GDD/UI/"
* If anything fails, explain what went wrong and suggest a fix.
