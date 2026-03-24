---
name: design-ui
description: This skill should be used when the user wants to "design a UI screen", "create a UI component", "make a mockup", "design the HUD", "design an inventory screen", "create a health bar", "design a skill tree", or any other game UI element. Creates visual HTML mockups with specification tooltips using the UI Design System.
argument-hint: "[screen or component description, e.g. 'inventory screen', 'health bar', 'skill tree']"
user-invocable: true
allowed-tools: Read, LS, Glob, Grep, Write, Edit, Bash, Agent, AskUserQuestion
---

# UI Screen/Component Designer

Design visual HTML mockups for game UI — screens, components, HUD elements. Components and Screens are static visual mockups. Flows add simple navigation between screens (show/hide). Every mockup is both a visual layout and a specification document (every element has tooltip specs on Alt+hover).

## Workflow

### 1. Project Structure Check

Read `.claude/project-structure.json`.
* If it exists — use the `ui` path.
* If not — tell the user the project needs setup and suggest running `/game-design:setup`. Do NOT proceed without it.

### 2. Parse Request

The user provides a screen or component description. Examples:
* `/game-design:design-ui inventory screen`
* `/game-design:design-ui monster card component`
* `/game-design:design-ui main HUD`
* `/game-design:design-ui skill tree`

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
* Remind them to open `http://localhost:8080` to see it in the UI Design System (or suggest running `/game-design:setup` if the server isn't started)
* Ask if they want to design another element or make changes

## Rules

* Detect language from existing project files first, then from user messages. Use it throughout.
* **NEVER** expose internal names — agent names, STATUS markers, file paths in technical format.
  * Wrong: "I'll launch the ui-designer agent" / "STATUS: READY"
  * Right: "Let me design this..." / "The mockup is ready!"
* **You are a coordinator, not a designer.** Your job is to relay the user's request to the ui-designer agent and present the result. The agent is the expert — trust its output. Do NOT review, modify, or "fix" the agent's code. If the user reports a problem — pass it to the agent.
