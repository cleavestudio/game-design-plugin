# Storage Modes — where the project lives

A game design project can live in **markdown files**, in **Miro**, or in **both**. All three are normal. Every skill must check the storage mode before producing anything.

## Config

`.claude/project-structure.json`:

```json
{
  "storage": "files" | "miro" | "both",
  "miro": { "board": "https://miro.com/app/board/..." },
  "root": "GDD",
  "design": "GDD/Design",
  "lore": "GDD/Lore",
  "ui": "GDD/UI",
  "drafts": "GDD/Drafts"
}
```

- `storage` missing (legacy config) → treat as `"files"`.
- `miro` present only when storage is `miro` or `both`.
- In `miro` mode the path fields may be absent except `ui` — the UI Design System **always lives in files** (HTML/JS mockups cannot live on a board).
- If the config file is missing entirely → the project needs setup; suggest `/game-design:setup` and do not proceed.
- `drafts` missing in a files/both config (old setup) → default to `{root}/Drafts/` (or `Drafts/` if root is empty), create the folder, add the field.

## What goes where

| Work | `files` | `miro` | `both` |
|---|---|---|---|
| Design thinking / brainstorm | draft directory, block by block | dependency graph on the board (see `miro-method.md`) | dependency graph on the board |
| Final feature docs / concept notes | project `design` folder (via writer) | stays on the board — the graph IS the artifact | project `design` folder (via writer) |
| Lore, audio specs, visual specs | drafts → project folders | nodes/frames on the board near the owning subtree | thinking on the board; final documents in files |
| Balance | `balance.md` in the draft dir → Balance section of the doc | balance nodes attached to the feature subtree | `balance.md` → doc |
| UI mockups | `ui` path | `ui` path (always files) | `ui` path |

**The principle for `both`: Miro is for thinking, files are for documents.** Exploration, dependency untangling, and decision-fixing happen on the board; when a topic matures and the user wants a document, the settled material is written to markdown (review + write phases). Don't mirror content in both media — each fact lives in one home.

## Mode-specific notes

- **`files`** — the classic flow: draft directory per topic, review agent, writer agent, cleanup-drafts.
- **`miro`** — no draft files, no writer phase. Fixed decisions are green (axiom) nodes; the review bar is the graph rules themselves. Only the UI Design System touches the filesystem.
- **`both`** — review/write run only when the user asks to turn settled board material into documents. The written doc should reference the board area it came from; the board subtree can then be marked as documented (per the user's preference).
