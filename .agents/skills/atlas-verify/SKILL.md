---
name: atlas-verify
description: Check Atlas work before reporting it done. Use at the end of any task that changed app/prototypes, packages/ui-web, or tokens — after building a prototype, changing a component, or fixing a bug — and whenever you are about to say "done", "fixed" or "passing". Runs scripts/atlas-verify.mjs (design checks against atlas/metadata, token-lint, tsc, tests, Atlas component usage, basic a11y, and git-diff scope) and turns its failures into fixes. Does not refresh the snapshot (that is atlas-figma-sync) and never edits atlas/.
---

# atlas-verify

"It compiles" is not done. This skill runs one script that judges the work on what it touched, fixes
what it finds, and re-runs until it passes — then reports the actual output.

## Steps

1. **Name the scope** — before running anything, write down the paths the task was allowed to touch.
   Prototype: `app/prototypes/<slug>/**,app/prototypes/_shared/flowRegistry.ts`.
   Component: `packages/ui-web/src/<tier>/<Name>/**,packages/figma-sync/code-connect/<Name>.figma.tsx,packages/governance/contracts/<Name>.contract.ts,packages/ui-web/tests/<Name>.test.tsx`
   plus any call sites under `app/` the task named.

2. **Run it** —
   ```bash
   node scripts/atlas-verify.mjs --scope "<globs from step 1>"
   ```
   Add `--base <ref>` when the work spans commits (default `HEAD` = uncommitted changes).
   Add `--allow-new-component` / `--allow-new-token` **only** when the user asked for that addition.
   While iterating, `--skip tests,tsc` is fine; the final run skips nothing.

3. **Read the result** — one line per check, `PASS | WARN | FAIL | SKIP`, mismatches indented under it,
   exit 1 on any FAIL. What each check means and how to fix it: `references/checks.md`.

4. **Correct** — fix every FAIL in the files the task owns. Rules for the fix:
   - A variant/size FAIL means the code is wrong, not the snapshot. Use a value the metadata lists.
     If the design genuinely needs a missing value, stop and name it — that is a Figma decision.
   - A primitive or unknown token FAIL is fixed with an existing semantic token. Never add one.
   - A new-component FAIL is fixed by composing locally and logging the gap in
     `atlas/state/candidates.json` (per `AGENTS.md` §4; the sync keeps its entries and only restamps it).
   - A `scope.paths` FAIL on a file you changed: revert it. On a file you did **not** change
     (pre-existing untracked files), leave it and say so in the report.
   - `design.snapshot-current` FAIL (atlas/ behind the code): run `npm run atlas:sync`, don't hand-edit.

5. **Re-run** step 2 until it exits 0. Two fix cycles with the same FAIL → stop and report it.

6. **Handle WARNs** — they don't block, but each goes in the report:
   - stale snapshot for a touched component → per `AGENTS.md` §1 you may escalate to Figma MCP for the
     fields you relied on; say that you did.
   - numeric style literals → replace with tokens where one fits; leave layout one-offs.
   - no `--scope` → re-run with one. A WARN here means scope was never checked.

7. **Report** — paste the final summary line (`OK — N pass · N warn · 0 fail · N skip`), list each
   WARN with what you did about it, and anything you could not fix.

## Rules
- Run the script; never report a check as passing from reading the code.
- Never edit `atlas/`, `packages/governance/token-lint.mjs` or the verifier to make a check pass.
  A check that is wrong is a separate task — report it.
- Don't widen `--scope` after the fact to swallow a file you shouldn't have touched.
- `--json` gives the same result as machine-readable output (used by benchmarks and other skills).

## References
- `references/checks.md` — every check: what it inspects, pass/fail rule, typical fix, known limits.
