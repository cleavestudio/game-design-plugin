# Game Design Studio

Claude Code plugin for game design — from mechanics and lore to UI mockups, audio specs, and visual asset definitions.

## What it does

When you talk about game design, Claude automatically becomes a coordinator that routes your requests to 7 specialized agents:

| Agent | Role |
|-------|------|
| **Designer** | Game mechanics, systems, formulas, balance |
| **Lorekeeper** | World-building, factions, characters, history |
| **UI Designer** | Interactive HTML mockups with spec tooltips |
| **Sound Designer** | Sound events, music states, ambient layers |
| **Visual Designer** | Asset lists, animations, VFX specifications |
| **Reviewer** | Quality validation against 13 criteria |
| **Writer** | Converts approved drafts into project documents |

## How it works

1. Describe what you want to design — Claude enters coordinator mode automatically
2. The coordinator launches the right agent for the task
3. Agents write drafts, signal each other for cross-domain enrichment (lore, UI, audio, visual)
4. The reviewer validates the design against quality standards
5. The writer creates the final document in your project

All output is structured, parameterized, and implementation-ready — no fluff, no vague descriptions.

## Setup

```
/game-design:setup
```

This initializes the project structure, copies the UI Design System infrastructure, and starts the dev server. Requires Node.js for the UI server (the rest works without it).

## Commands

| Command | Description |
|---------|-------------|
| `/game-design:setup` | Initialize project structure and UI server |
| `/game-design:design-ui` | Design a UI screen, component, or HUD element |
| `/game-design:cleanup-drafts` | Review and delete completed draft files |

To design game mechanics, lore, or any game system — just describe what you need. No command required.

## UI Design System

The plugin includes an interactive UI Design System for creating game interface mockups as Web Components.

- Every element is a reusable Web Component
- Every visible element has specification tooltips (Alt+hover)
- Screens, Flows, and Animations are `.js` modules
- A local dev server at `http://localhost:8080` shows all components in a catalog

The UI Design System uses two CSS layers:
- `system.css` — tool appearance (sidebar, inspector)
- `common.css` — game visual tokens (colors, fonts, spacing)

## Project structure

After setup, your project will have:

```
{root}/
  Design/  — game design documents
  Lore/    — lore and world-building
  UI/      — UI Design System (components, screens, flows)

.claude/
  drafts/              — work-in-progress drafts
  project-structure.json — path configuration
```

## Requirements

- Claude Code
- Node.js (optional, for the UI Design System dev server)

## Author

CleaveStudio
