# Scratchpad — the working memory of a design topic

A long design session fills the context with material that is only partly relevant — board dumps, adjacent documents, discarded branches — and the things that matter most (goals, the frame, what has been decided, what the user explicitly told you) drift out of attention. The scratchpad is the fix: one small file per topic that holds exactly those things, and nothing else. It is re-read before every reply and updated after every turn, so the state of the topic is always the freshest thing in context.

The plugin's `UserPromptSubmit` hook injects the **active** scratchpad into every prompt automatically, together with the design checklist. If you see that block in the prompt, you already have it — don't re-read the file. If you don't see it (hook not running, Node.js absent), read the file yourself before answering.

## Location and lifecycle

- Path: `.claude/scratchpads/<topic-slug>.md` inside the user's project. One file per topic. Applies in **every storage mode** — in `miro` and `both` the board holds the design, the scratchpad still holds the state of *working on it*.
- Create it when a topic starts: after the request is understood, together with the frame and goals. A one-line question that will be answered in one turn does not need one.
- Frontmatter:

  ```
  ---
  topic: <human-readable topic name>
  status: active | paused | done
  updated: <YYYY-MM-DD>
  ---
  ```

- **At most one `active` scratchpad at a time** — that is the topic in focus and the one the hook injects. When the user switches topics, set the current one to `paused` and the new one to `active` (create it if new). When a topic is finalized or the user says it's done, set `done`. `cleanup-drafts` offers to delete `done` scratchpads.
- Never mention the file, its path, or the word "scratchpad" to the user. If you must refer to it, it is "my notes on this topic".

## Structure

Keep every section short. This is a compass, not a draft — the design itself lives in the draft directory or on the board. A scratchpad growing past ~150 lines is holding content that belongs elsewhere.

```
## Frame
What existing material is for this topic: fixed / reference / being rethought.
Which areas, which documents or board frames. The user's own words when they set it.

## Goals
Topic goals (see design-foundations.md §2). Pillars quoted only where they bite here.

## Project constraints
Platform, input devices, camera/perspective, engine, single/multiplayer, team scope, genre.
Filled once from the project foundations; corrected when the user says otherwise.

## Fixed decisions
What the user has decided or approved for this topic, one line each, newest last.

## Rejected
Ideas the user rejected, or that were dropped after being shown — with the reason.
So they are not proposed again, and so the reason keeps shaping what comes next.

## Open questions
Undecided things the design depends on. Removed when they move to Fixed decisions.

## User directives
Explicit instructions about how to work on this topic ("don't touch X", "treat the board
as context only", "no numbers yet", "keep it abstract for now"). Verbatim where possible.

## Context digest
A few lines summarizing the relevant existing material that was loaded, so it need not be
reloaded. Facts only; no proposals.
```

Sections that are empty are omitted. Sections are added as they get content.

## Inclusion rules

- **Fixed decisions** contain only what the user stated or approved explicitly. "Maybe", "I'm not sure", "what do you think?" go to **Open questions**, not to decisions.
- **Rejected** contains what was shown and turned down, and what you dropped after showing it. Ideas filtered in your own reasoning before being shown do not go here — that would be noise.
- **User directives** are copied as close to verbatim as the language allows. They are the highest-priority lines in the file: they override the process defaults and your own preferences for as long as the topic is active.
- **Goals** and **Frame** change only through an explicit exchange with the user. If you believe one should change, propose it; write it after the user agrees.
- Nothing is inferred into the file. If it isn't from the user or from confirmed project material, it doesn't go in.

## Rhythm

1. **Before answering:** the scratchpad is in context (injected or read). Hold every proposal against Frame, Goals, Directives, Rejected.
2. **After a turn in which something changed** — a decision, a rejection, a new question, a directive, a frame or goal change — update the file. Small edits, not rewrites. Bump `updated`.
3. **On topic switch:** pause/activate as above.
4. **On finish:** set `done`. The user's decisions are in the draft or on the board; the scratchpad is no longer needed.

## Language

Same as the project and the conversation. Frontmatter keys stay in English.
