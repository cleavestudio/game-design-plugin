# Miro Method — the dependency graph

How design thinking is captured on a Miro board. Applies whenever the project's storage mode is `miro` or `both` (see `storage-modes.md`).

## Model

The game concept under construction is a **graph**.

- **Nodes** — mechanics, decisions, pillars, desired player feelings and experiences, constraints.
- **Edges** — dependencies: node B builds on node A. Changing a node cascades to all its descendants.

Node color = confidence:

| Color | Status | What's allowed |
|---|---|---|
| Green | Axiom | Fixed, not changed. Safe to build on |
| Yellow | Hypothesis | Working assumption; change carefully (check descendants) |
| Red | In question | Change freely |

## Rules

1. **Build outward from axioms.** A new node is created only when all its dependencies already exist in the graph — ideally as axioms. A node resting on unstated assumptions is wasted work: the assumptions aren't pinned as nodes, may turn out false, and the whole subtree collapses.
2. **Change leaf-layer nodes.** They have the fewest outgoing dependencies, so rework doesn't cascade. Deep nodes are touched last.
3. **A non-axiom changes together with its subtree.** Marking a node for rework means re-thinking all its descendants too.
4. **A node's shakiness = its dependencies in the graph, not the vagueness of its topic.** A branch with no dependencies yet isn't "shaky" — it's open ground: it can be started at any moment from its own foundation, from whatever is clearest at this stage.
5. **Branches are equal.** Different branches develop in any order. The criterion for the next step: the hypothesis you want to build must have all its dependencies closed.
6. **Forks are allowed.** Alternative development paths may diverge from one node. Forks can grow in parallel as separate subtrees, then be compared and the best one chosen.
7. **Definite statements are fixed immediately.** Anything the user states definitively goes into the graph at once (usually as an axiom). Strong nodes discovered along the way get promoted to axioms too.
8. **The finish line** is a fully thought-through graph: a coherent concept where every decision's grounds are visible.

This method combines with the shared iterative method: one node (or one small cluster around one decision) per turn, discuss before creating, sync after. The consultant stance applies at every node — context and arguments, then your opinion, then the user decides what gets fixed.

## Board styling

**Existing board style wins.** Before creating elements, read the style of neighboring nodes on the board (via the Miro layout/read tools) and match it exactly. Use the defaults below only on an empty board or where the board has no precedent.

Default style (studio standard):

**Nodes** — SHAPE `rectangle` (NOT round_rectangle):
- Sizes: standard ~455×257; large ~530×287; small comment-node ~440×151.
- Fill by status, **always `fill_opacity=0.3`**:
  - green `#adf0c7` (axiom / pillar / "pro" argument)
  - yellow `#fff6b6` (hypothesis)
  - red `#ffc6c6` (in question)
  - orange `#f8d3af` — the root node of the game concept.
- Border: color = fill color, `border_width=4`, `border_opacity=1`. Border style: `normal` for content nodes of the graph; `dotted` for meta-nodes (pillars, comment-questions, fork arguments).
- Text: font `roboto_slab`, size 24, color `#1a1a1a`, `align=center`, `valign=middle`. Node title bold, then an empty line, then body text.

**Fork arguments:** a variant's "pro" — a green dotted-border node next to that variant; phrased as an argument, not as a decision.

**Forks:** variants placed side by side with a TEXT element "**VS**" between them (noto_sans, bold, size 64).

**Connectors:** `elbowed`, color `#333333`, width 4, style `normal`, `start_cap=none`, `end_cap=rounded_stealth` (arrow from parent to child).

**Headings:** separate TEXT elements, `noto_sans`, bold, `align=left`: board title — 144, section headings — 64.

Watch spacing: nodes and labels must not overlap each other. Before creating new elements, check the style and positions of neighbors.

## Tooling

Board work expects **two MCP servers** connected to the session. If their schemas are deferred, load them via `ToolSearch` first. The board URL comes from `project-structure.json` → `miro.board`.

1. **`miro`** — the official Miro MCP (https://mcp.miro.com). Use it for **writing**: creating and editing shapes, text, frames, and connectors.
2. **`miro-connector`** — the studio's own server. Use it for **reading and connector styling**; prefer it over the official equivalents:
   - `board_graph` — compact dump of the board as a graph (frames → items → edges with colors/styles/captions). Use this **instead of the official `layout_read`** for any analysis — same information at a fraction of the tokens. Scope to one frame via the `frame` param.
   - `item_search` — find items by text substring; the cheap way to locate a node without dumping the board.
   - `connector_list` / `connector_get` — connectors with endpoint node *texts*, full style including stroke width.
   - `connector_update_style` — change connector stroke width, color, dash, caps (bulk-capable). **The official Miro MCP cannot change stroke width — always use this tool for that.**

If only one server is available, warn the user which one is missing and what will be degraded (no `miro` → cannot create/edit board content; no `miro-connector` → board reading becomes token-expensive and connector widths can't be set).
