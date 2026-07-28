# Game Design Studio

Claude Code plugin for game design — from mechanics and lore to UI mockups, audio specs, visual asset definitions, and balance. Works with projects that live in markdown files, on a Miro board, or both.

## What it does

When you talk about game design, Claude becomes your **single-voice design partner** — a senior game designer you work with block by block. Specialist domains are skills it loads into the same conversation; only two silent one-shot agents run behind the scenes.

| Skill | Domain |
|-------|--------|
| **game-design** | Core partner: mechanics, systems, brainstorming, the design process itself |
| **lore** | World-building, factions, characters, world rules |
| **design-ui** | Interactive HTML mockups with spec tooltips (UI Design System) |
| **sound-design** | Sound events, music states, ambient layers |
| **visual-design** | Asset lists, animations, VFX specifications |
| **balance** | Concrete numbers, formulas, curves for the design's named knobs |

| Agent | Role |
|-------|------|
| **reviewer** | Silent quality audit of a finished draft (one-shot) |
| **writer** | Converts approved drafts into project documents (one-shot) |

The discussion format is fixed: the assistant is a **consultant, not a co-author of decisions** — it lays out context and arguments, gives its own opinion separately, and the user decides.

## Where the project lives

Set during `/game-design:setup` and stored in `.claude/project-structure.json`:

- **Files** — everything in markdown: drafts, design docs, lore.
- **Miro** — design thinking and decisions live on a board as a **dependency graph** (nodes = decisions/mechanics/pillars, edges = dependencies, color = confidence: green axiom / yellow hypothesis / red in question). Only the UI Design System stays in files.
- **Both** — Miro for thinking, files for final documents.

Shared method files live in `shared/`: the iterative process (`iterative-method.md`), storage semantics (`storage-modes.md`), and the Miro graph method (`miro-method.md`) — every skill reads them instead of duplicating the rules.

## How it works

1. Describe what you want to design — the design partner picks up automatically
2. Work goes one block at a time: discussion → your decision → capture (draft file or board node)
3. When the design is done, it's enriched where genuinely needed (lore, UI, audio, visual, balance)
4. For file-based projects: a silent review pass, then the final document is written to your project

All output is structured, parameterized, and implementation-ready — no fluff, no vague descriptions.

## Setup

```
/game-design:setup
```

Asks where the project lives (files / Miro / both), initializes the structure, copies the UI Design System infrastructure, and starts the dev server. Requires Node.js for the UI server (the rest works without it).

## Commands

| Command | Description |
|---------|-------------|
| `/game-design:setup` | Initialize storage mode, project structure, and UI server |
| `/game-design:design-ui` | Design a UI screen, component, or HUD element |
| `/game-design:lore` | Standalone lore work |
| `/game-design:sound-design` | Standalone audio spec work |
| `/game-design:visual-design` | Standalone visual/asset spec work |
| `/game-design:balance` | Standalone balance work |
| `/game-design:cleanup-drafts` | Review and delete completed draft files |

To design game mechanics or any game system — just describe what you need. No command required.

## UI Design System

The plugin includes an interactive UI Design System for creating game interface mockups as Web Components. It always lives in files, even for Miro-based projects.

- Every element is a reusable Web Component
- Every visible element has specification tooltips (Alt+hover)
- Screens, Flows, and Animations are `.js` modules
- A local dev server at `http://localhost:8080` shows all components in a catalog

Two CSS layers: `system.css` — tool appearance; `common.css` — game visual tokens.

## Project structure

After setup (files / both):

```
{root}/
  Design/  — game design documents
  Lore/    — lore and world-building
  UI/      — UI Design System (components, screens, flows)
  Drafts/  — work-in-progress drafts

.claude/
  project-structure.json — storage mode + path configuration
```

Miro-only projects get just `{root}/UI/` plus the board link in the config.

## Requirements

- Claude Code
- Node.js (optional, for the UI Design System dev server)
- For Miro-based projects: two MCP servers — `miro` (official, https://mcp.miro.com — creates/edits board content) and `miro-connector` (studio server — token-cheap board reading via `board_graph`, item search, connector stroke styling)

## Author

CleaveStudio
