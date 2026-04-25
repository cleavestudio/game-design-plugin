---
name: cleanup-drafts
description: This skill should be used when the user wants to "clean up drafts", "delete draft files", "manage drafts", "remove completed drafts", "see which drafts are done", or "clear out old drafts". Reviews draft files, identifies which have been written to the project, and offers to delete them.
argument-hint: "[no arguments]"
user-invocable: true
allowed-tools: Read, LS, Glob, Grep, Bash, AskUserQuestion
---

# Draft Cleanup

Scan the project's `drafts/` folder, compare each draft (file or directory) against existing project documents, and let the user decide what to delete.

## Workflow

1. **Read project structure:** Read `.claude/project-structure.json` to know where drafts and project documents live (`drafts`, `design`, `lore`, `ui` paths). If `drafts` is missing from the config, default to `{root}/Drafts/` (or `Drafts/` if root is empty).

2. **Scan drafts:** Glob `{drafts}/*.md` for single-file drafts and `{drafts}/*/` for design draft directories.
   * If nothing found — tell the user and exit.

3. **For each draft (file or directory):**
   * Read the first few lines / file list to understand the topic.
   * Search the project document directories (from project-structure.json) for a corresponding document — Grep for key terms from the draft's title/overview.
   * Classify:
     * **Written** — a matching project document exists with the same content.
     * **Outdated** — a matching project document exists but the draft differs (draft may be an older version).
     * **Orphaned** — no matching project document found (draft was never written to project, or was abandoned).

4. **Present summary to user:**
   ```
   Drafts found: N

   Written (safe to delete):
   - {drafts}/combat-system/ → design/combat-system.md
   - {drafts}/faction-varn.md → lore/factions/varn.md

   Outdated (project doc exists but differs):
   - {drafts}/inventory.md → design/inventory.md (draft is older)

   Orphaned (no matching project doc):
   - {drafts}/stealth-prototype.md
   ```

5. **Ask user what to delete** using `AskUserQuestion`:
   * Options: "Delete all written", "Delete written + outdated", "Delete all", "Let me pick individually", "Keep everything"
   * If "pick individually" — list each file and ask yes/no.

6. **Delete** selected files using Bash (`rm`).

7. **Report** what was deleted.

## Rules

* NEVER delete without user approval.
* NEVER delete project documents — only drafts.
* If classification is uncertain, mark as "Orphaned" and let the user decide.
* Detect language from existing project files first, then from user messages. Use it throughout.
