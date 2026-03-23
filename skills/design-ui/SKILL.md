---
name: design-ui
description: Design a game UI screen or component — creates an interactive HTML mockup with specification tooltips. Can be used standalone or as part of /game-design.
argument-hint: "[screen or component description, e.g. 'inventory screen', 'health bar', 'skill tree']"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Agent, AskUserQuestion
---

# UI Screen/Component Designer

Creates interactive HTML mockups for game UI — screens, components, HUD elements. The mockup is both a visual layout AND a specification document (every element has tooltip specs on hover).

## Workflow

### 1. Project Structure Check

Read `.claude/project-structure.json`.
* If it exists — use the `ui` path.
* If not — tell the user the project needs setup and suggest running `/setup`. Do NOT proceed without it.

### 2. Parse Request

The user provides a screen or component description. Examples:
* `/design-ui inventory screen`
* `/design-ui monster card component`
* `/design-ui main HUD`
* `/design-ui skill tree`

If no argument provided, ask: "What UI element do you want to design?"

### 3. Launch UI Designer

Launch `ui-designer` agent (Mode B) with:
* The user's request
* The UI path from project structure
* Any existing project context (Synopsis, Design Pillars, existing UI components)

### 4. Iterate

* The ui-designer will return questions or a mockup summary. Present to the user naturally.
* When the user responds, **resume** the ui-designer with their response.
* Repeat until STATUS: READY.

### 5. Present Result

When done:
* Tell the user what was created
* Remind them to open `http://localhost:8080` to see it in the UI Design System (or suggest running `/setup` if the server isn't started)
* Ask if they want to design another element or make changes

## Rules

* Detect the user's language and use it throughout.
* **NEVER** expose internal names — agent names, STATUS markers, file paths in technical format.
  * Wrong: "I'll launch the ui-designer agent" / "STATUS: READY"
  * Right: "Let me design this..." / "The mockup is ready!"
