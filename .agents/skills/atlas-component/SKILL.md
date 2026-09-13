---
name: atlas-component
description: Create or change an Atlas library component in packages/ui-web/src/<tier>/<Name> — add or rename a variant or size, fix a spec gap (focus ring, states, a11y), close a Figma↔code discrepancy, run a component refinement pass, or promote an approved candidate. Works Figma first, then the atlas/ docs via sync, then code, Code Connect, contract, tests and state, and ends with atlas-verify. Not for building a prototype screen in app/prototypes (that is atlas-prototype) and not for a snapshot-only refresh (that is atlas-figma-sync).
---

# atlas-component

Figma is the authority, so a component change runs in one direction:
**Figma → atlas/ (sync) → code → Code Connect + contract + tests → state → verify.**
Skipping ahead to code is the mistake this skill exists to prevent.

## Scope — one component per task
- Writes: `packages/ui-web/src/<tier>/<Name>/**`, `packages/figma-sync/code-connect/<Name>.figma.tsx`,
  `packages/governance/contracts/<Name>.contract.ts`, `packages/ui-web/tests/<Name>.test.tsx`,
  `atlas/` **only through** `npm run atlas:sync`, repo-state rows in `atlas/state/*.json`, and the
  Figma component set (only after the user approves the Figma change).
- Also touches call sites under `app/` **only** when an API change breaks them (name them up front).
- Never: a second component, a new token, `app/prototypes` redesigns, `docs/` rewrites.

## Steps
1. **Parse and look up** — name the component, tier and the exact change. Read
   `atlas/state/decisions.json` and the component's open rows in `atlas/state/discrepancies.json`,
   then `atlas/metadata/<Name>.json` and `atlas/<Name>.md`. A decision that already answers the
   question is followed, not re-argued. A new component needs an explicit user request
   (`--allow-new-component` later) and a Figma design — otherwise stop.
2. **Figma first** — **Read `references/figma-first.md` now (required, every task, including
   code-only ones)**; its table decides whether Figma changes. Compare the change with
   `metadata.figmaProperties`. If Figma must change (new variant value, renamed property, usage
   description, a state or prop whose visuals Figma does not draw):
   state the exact Figma edit, **get approval**, apply it, and confirm with a metadata read. If the
   snapshot is stale or `syncedAt` is null, escalate to Figma MCP for those fields and say so.
   Code-only changes (a11y, focus ring, a bug) that alter no property skip the edit, not the check.
   **A new visual state or prop Figma does not draw is never code-only** — even when the user asked for
   it and even when another component already has it: propose the Figma edit and wait.
3. **Docs via sync** — `npm run atlas:sync` (or the `atlas-figma-sync` skill after a Figma edit) so
   `atlas/metadata/<Name>.json` and `atlas/<Name>.md` reflect Figma. Never edit them by hand; a doc
   that needs new guidance gets it as the Figma description.
4. **Code** — **read `references/code-rules.md` before the first edit (required)**, then edit
   `<Name>.tsx` / `<Name>.module.css` in place:
   exported `<Name>Variant`/`<Name>Size` unions match Figma values exactly (DEC-002), value props
   stay props (DEC-003), semantic tokens only, every state, logical properties, reduced motion.
5. **Code Connect, contract, tests** — **read `references/companions.md` before touching them
   (required)**; it has the patterns, so don't open another component's companion files. Update all three: `figma.enum` maps list every Figma value; the contract asserts the
   new unions and prop shape; the test covers the variant × size matrix, states and axe.
6. **Re-sync and state** — `npm run atlas:sync` again: code-derived `variants`/`sizes` update and
   sync-detected discrepancies close themselves. Then update repo state by hand, per
   `references/companions.md`: the `status.json` row, a repo-carried discrepancy closed with a dated
   resolution, a promoted candidate removed from `candidates.json`, and a new `decisions.json` entry
   only if the user made a decision in this task.
7. **Verify** — the `atlas-verify` skill with scope
   `packages/ui-web/src/<tier>/<Name>/**,packages/figma-sync/code-connect/<Name>.figma.tsx,packages/governance/contracts/<Name>.contract.ts,packages/ui-web/tests/<Name>.test.tsx,atlas/**`
   plus any named call sites. `design.snapshot-current` must pass — that proves step 6 ran.
   The final, unskipped run adds `--stamp`, which records `verifiedAt` in `status.json`.
8. **Report** — the Figma change (or "none, code-only" and why), files changed, discrepancies
   closed/opened, state rows updated, Figma MCP escalations, and the verify summary line.

## Rules
- Figma and code disagree → Figma wins. Never "fix" drift by changing only code to match your guess.
- An ambiguous design rule stops the task: name the missing decision (AGENTS.md §6).
- Don't rename or restyle beyond the asked change; the component status table's "Remaining focus" is
  a refinement pass only when the user asked for one.
- Figma writes are outward-facing: describe them and wait for a yes before calling `use_figma`.

## References — required reads, at the step that names them
- `references/figma-first.md` — when Figma must change, the approval step, MCP calls, confirming it.
- `references/code-rules.md` — file layout, type exports, states, tokens, a11y bar per tier.
- `references/companions.md` — Code Connect, contract, test and state file formats with examples.
