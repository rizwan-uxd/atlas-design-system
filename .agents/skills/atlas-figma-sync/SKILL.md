---
name: atlas-figma-sync
description: Refresh the generated atlas/ snapshot from the Atlas Figma file. Use when the snapshot is stale, syncedAt is null, Figma has changed, or a task found a Figma↔code mismatch that must be recorded. Pulls component sets through the Figma MCP, regenerates atlas/metadata, atlas/<Name>.md, atlas/tokens.* and atlas/state/discrepancies.json, and reports drift. Never writes to Figma and never touches packages/ui-web or app/.
---

# atlas-figma-sync

Figma is the authority; `atlas/` is its cache. This skill refreshes the cache and records where
Figma and code disagree. It **reads** Figma and **writes** `atlas/` — never the reverse.

## Scope
- Writes: `atlas/**` (via the generator) and `.atlas-pull/` (scratch, gitignored).
- Never writes: Figma, `packages/ui-web`, `app/`, `docs/`.
- Never resolves drift. It records it; fixing is a component task (`atlas-component`).

## Steps

1. **Read the node ids** — `packages/figma-sync/code-connect/<Name>.figma.tsx` holds one
   `node-id=<a>-<b>` per component. That is the pull list; do not guess ids or browse the file tree.

2. **Pull each component set** — `mcp__figma__get_metadata` with
   `fileKey: cKYhfaHLCoyMHi9nKr63Ig` and that node id. One call per component, no `get_design_context`
   (you are not implementing anything). Each child name is `Prop=value, Prop=value, …` — collect the
   **set of values per property**, nothing else.

3. **Pull descriptions only where they exist** — for components whose `atlas/state/status.json`
   entry has `figmaMetadata` other than `none`, one `mcp__figma__search_design_system` call
   (`entity: component`, the component name) and take the `description` of the result whose
   `libraryName` is `Atlas Design System v1` and whose `filePath` is not the Mobile-Native set.
   Skip every component with `figmaMetadata: "none"` — there is nothing to fetch.

4. **Write the pull file** — `.atlas-pull/pull.json` in the shape in `references/pull-file.md`.
   Record `figmaVersion` from the newest `updatedAt` seen in step 3 (or carry the previous value
   forward when no search ran) and `pulledAt` as the current ISO timestamp.

5. **Regenerate** — `node scripts/atlas-sync.mjs --pull .atlas-pull/pull.json`
   (add `--check` first if you want a no-write preview). The generator owns all of `atlas/`:
   field mapping, drift rules and the doc-preservation rule are in `references/field-mapping.md`.

6. **Verify, don't assume** —
   - `git diff --stat atlas/` shows only `atlas/**` touched;
   - `grep -L figma-synced atlas/metadata/*.json` returns nothing;
   - re-run step 5 — the second run must write 0 files (the generator is idempotent);
   - `npx tsc --noEmit` (the snapshot must not have broken anything; it should not, nothing outside
     `atlas/` changed).

7. **Report** — components pulled, `syncedAt`/`figmaVersion` stamped, files written, and the drift
   table: new discrepancies, discrepancies closed by this run, and the ones still open. Name the
   Figma-side fixes separately from the code-side ones; per `AGENTS.md` §1 the Figma side goes first.

## Rules
- **Never hand-edit `atlas/`.** If output is wrong, fix `scripts/atlas-sync.mjs` or the Figma file
  and re-run. An edit to `atlas/` is erased by the next sync.
- **Figma wins on design, code wins on API.** `metadata.variants`/`sizes` stay code-derived (they
  are what a caller can actually type); `metadata.figmaProperties` is what Figma draws; the gap
  between them is a discrepancy, never a silent merge.
- A Figma description replaces the repo-written `atlas/<Name>.md` **only when it reads as guidance**.
  A spec summary ("3 variants × 3 sizes") is a Figma content gap: the doc is kept and the gap filed.
- Tokens stay derived from `packages/tokens/atlas.tokens.css` — Figma MCP exposes variables per node,
  not a variable table, so a token sync is not available and is not faked.
- Don't hand-close discrepancies. A sync-detected entry closes itself once the drift is gone.
- `.atlas-pull/` is scratch. Never commit it, never read it from another task.

## References
- `references/pull-file.md` — pull file shape, one worked example, which MCP calls fill which field.
- `references/field-mapping.md` — Figma field → snapshot field, the drift rules, and what each
  generated file is regenerated from.
