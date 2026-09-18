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

Shared method files live in `shared/` — every skill reads them instead of duplicating the rules:

- `design-foundations.md` — **what game design is**: state/rules/feedback, goal-oriented design, pillars and the abstraction test, the frame of a topic, the reality checks every idea passes before it is shown, MDA / SDT / Flow / degenerate-strategy frameworks, craft rules.
- `scratchpad.md` — per-topic working notes (frame, goals, decisions, rejected ideas, user directives) kept in `.claude/scratchpads/`.
- `design-checklist.md` — the short form of the foundations, injected on every turn.
- `iterative-method.md` — the consultant stance and the one-block-per-turn process.
- `storage-modes.md`, `miro-method.md` — storage semantics and the Miro graph method.

## How it works

1. Describe what you want to design — the design partner picks up automatically
2. A substantial topic starts with its **frame** (what existing material is fixed, reference, or being rethought) and its **goals** — the compass every later idea is checked against
3. Work goes one block at a time: discussion → your decision → capture (draft file or board node). Ideas are filtered in the partner's reasoning before they are shown: can it be played, is it software, does it serve a goal, is it feasible for this platform and engine, does it fit the project
4. When the design is done, it's enriched where genuinely needed (lore, UI, audio, visual, balance)
5. For file-based projects: a silent review pass, then the final document is written to your project

### Working notes and the hook

Each topic gets a small working-notes file in `.claude/scratchpads/` holding its frame, goals, fixed decisions, rejected ideas, open questions, and your explicit directives. A `UserPromptSubmit` hook (`hooks/inject-scratchpad.js`, Node.js) injects the active one plus the design checklist into every prompt, so the state of the topic and the design rules stay at the front of attention no matter how much board or document material was loaded earlier. Without Node.js the hook is silent and the partner reads the file itself.

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
  scratchpads/           — per-topic working notes (internal; all modes)
```

Miro-only projects get just `{root}/UI/` plus the board link in the config.

## Requirements

- Claude Code
- Node.js (optional: the UI Design System dev server and the working-notes hook)
- For Miro-based projects: two MCP servers — `miro` (official, https://mcp.miro.com — creates/edits board content) and `miro-connector` (studio server — token-cheap board reading via `board_graph`, item search, connector stroke styling)

## Author

CleaveStudio
