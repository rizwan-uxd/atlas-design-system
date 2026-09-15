# Phase 9 — v3 change proposals (H1, H3, H5)

Status: **approved 2026-09-14 (`f10119c` + H3 + H5; H1 deferred); measured; Phase 9 on HOLD. See `PHASE-9-RESULTS.md`.** Originally: Written 2026-09-14 from frozen harness-v2 evidence (`d7967d7`, commits `2b7e5bc`, `b00c6b8`).

Required v3 change, already committed on `bench/phase-9-v3`: **`f10119c`** — `atlas-sync` derives `## Variants` / `## Sizes`
(correctness fix for the harness-v2 T3 run 2 hand edit of `atlas/Switch.md`). Its primary metric is generated-file hand edits.

Not reproduced, recorded and not implemented: **H2** (T3 1/3, T4 0/3), **H4** (0/3, 0/3).

Trace references are `benchmarks/results/harness-v2/<task>/run-<n>.jsonl` line numbers. Signal counts come from the frozen
evaluator (`component-metrics.mjs` `c8138a919a`).

## Summary and recommendation

| | Reproduced (v2) | Change kind | Files | T1/T2 regression needed by itself | Overlap | Recommendation |
|---|---|---|---|---|---|---|
| H1 | T3 3/3 · T4 3/3 | generator + metadata + skill step 1 | `scripts/atlas-sync.mjs`, `atlas/metadata/*.json`, `atlas-component/SKILL.md`, sync `field-mapping.md` | **yes** | **material with H3**; can't meet its own T3 criterion by construction | **defer** |
| H3 | T3 2/3 · T4 0/3 | skill text | `atlas-component/SKILL.md` body, step 6 | no | none material | **include** |
| H5 | T3 3/3 · T4 1/3 | skill text | `atlas-component/references/code-rules.md` | no | minor with `f10119c` (1 of 6 T3 opens) | **include** |

T1/T2 regression is required anyway, because `f10119c` changes generated `atlas/` output.

---

## H1 — whole-state-file reads

**Evidence (signal: any read of `atlas/state/discrepancies.json` or `decisions.json`)**

| Run | Reads | Where |
|---|---|---|
| T3 r1 | 3 | l17 Read `decisions.json` · l24 Read `discrepancies.json` (13,773 chars returned) · l188 Read `discrepancies.json` before editing DISC-004 |
| T3 r2 | 2 | l17 `decisions.json` · l19 `discrepancies.json` |
| T3 r3 | 2 | l21 `decisions.json` · l23 `discrepancies.json`; l137 Edits DISC-004 using that read |
| T4 r1 | 2 | l19, l21 |
| T4 r2 | 5 | l19 `cat decisions.json` · l21 `cat … \| python3` · l25 Grep · l34 python · l37 Read |
| T4 r3 | 2 | l20, l22 |

Reproduced: T3 3/3 · T4 3/3. Mean T3 2.33, T4 3.0.

**Cause.** The reads are instructed. Skill step 1 says: "Read `atlas/state/decisions.json` and the component's open rows in
`atlas/state/discrepancies.json`." The agent can only get "open rows for one component" by reading the whole file.

**Smallest change.**
- `atlas-sync` writes `openDiscrepancies: [{id, side, issue}]` and `decisions: [{id, title}]` into each component's metadata file.
  Decisions are linked by component name.
- Step 1 then reads `atlas/metadata/<Name>.json` only.
- Step 6 (hand-closing a repo-carried row) is unchanged.
- Files: `scripts/atlas-sync.mjs`, `atlas/metadata/*.json` (12, regenerated), `atlas-component/SKILL.md` step 1, and
  `atlas-figma-sync/references/field-mapping.md`.

**Agent-visible change.** The step 1 lookup gets rows and decision titles from metadata. The state files are opened only to
edit a row.

**Primary metric.** `H1_stateFileReads`.

**Risks.**
- **Acceptance can't be met on T3 by construction.** T3 has to hand-close DISC-004, a repo-carried `side: both` row. r1 and r3
  did this. `Edit` requires a prior `Read`, so the signal would still appear in ≥ 2/3 T3 runs, which fails "≤ 1 of 3".
  Only T4 could pass.
- **Stale metadata rows.** After a hand edit of a row, metadata stays stale until the next sync. That creates a new reason to
  re-run sync (see Overlap).
- **Larger metadata.** Every component's metadata grows, and prototypes read metadata under AGENTS.md §2 step 4. T1/T2
  regression is **required**.
- **Same file as `f10119c`.** It regenerates `atlas/` again, and rejecting it needs the §8.3 byte-for-byte `atlas:sync` check.

**Independence.**
- **From `f10119c`:** the metrics are independent (reads of state files vs Edit/Write on generated paths). The source files
  overlap, though.
- **From H3: not independent.** In T3 r1, sync call l206 ("re-sync once more to confirm") came straight after a hand state edit
  (l194, l204). If metadata mirrors state rows, every state edit adds a real reason to re-sync, which pushes H3's metric up.
  A combined result couldn't tell H1's effect from H3's.
- **From H5:** independent.

**Recommendation: defer H1** to a later phase. It overlaps H3, and its own T3 criterion is unreachable while T3 needs a
DISC-004 hand edit. If you want it anyway, the alternatives are H1 instead of H3, or H1 with acceptance judged on T4 only.
The T4-only option changes §8.3 and needs your explicit approval.

---

## H3 — extra `atlas:sync` runs

**Evidence (signal: sync runs > 2 on T3, > 1 on T4)**

| Run | Syncs | Sequence |
|---|---|---|
| T3 r1 | **3** | l185 `atlas:sync \| tail -50` after companions · l206 `\| tail -20` "re-sync once more to confirm it writes 0 files" (after status.json edit) · l208 `\| grep -E "written\|closed"`, because l207's tail cut off the `written` line (the output is the 26-row drift list) |
| T3 r2 | 1 | l144 |
| T3 r3 | **3** | l134 `\| tail -50` · l148 `\| tail -20` after status.json edit · l150 `\| head -10`, because l149 again showed only drift rows |
| T4 r1–r3 | 0 | (stop task) |

Reproduced: T3 2/3. Both extra syncs follow the same pattern:
1. A confirmation re-sync after a state-only edit. It writes 0 files, because state rows don't feed generated output.
2. A second re-run, because the first was piped through `tail` and cut off the `written N file(s)` line.

**Smallest change.** Two sentences added to `atlas-component/SKILL.md` step 6, body only:
> "Run it once, after companions, without `| tail`/`| head` — the `written N file(s)` line near the top is the result. Hand
> edits to `atlas/state/*.json` don't need another sync; step 7's `design.snapshot-current` proves the snapshot is current."

Files: `.agents/skills/atlas-component/SKILL.md` body. No frontmatter change, and no generator change.

**Agent-visible change.** One sync after companions, whose output is read in full. No confirmation re-syncs.

**Primary metric.** `H3_syncRuns`: T3 mean 2.33 in v2, target below that, and present in ≤ 1/3.

**Risks.**
- **Stale snapshot.** An agent that skips a needed re-sync after a later code edit would leave the snapshot stale. The
  `snapshotCurrent` and `finalVerify` gates catch that, and they must hold 3/3.
- **Longer output in context.** Unpiped sync output is about 3.6k chars. That's a small context increase, reported but not
  used for acceptance.

T1/T2 regression is not required by H3 itself: it's a SKILL.md body change under §7.

**Independence.**
- **From `f10119c`:** the extra syncs in v2 were confirmation and truncation re-runs, not reactions to a stale doc. r2, the run
  with the stale doc, synced once. Independent.
- **From H5:** file-open metric vs Bash sync count, at different workflow steps. Independent.
- **From H1:** overlaps (see H1), which is why H1 is deferred if H3 is included.

---

## H5 — opening another component's files

**Evidence (signal: any open of another component's `.tsx`/`.css`/metadata/`.md`)**

| Run | Opens | Where |
|---|---|---|
| T3 r1 | 2 | l46 Read `Checkbox/Checkbox.module.css` (9,694 chars) · l48 Read `atlas/metadata/Checkbox.json`, right after reading its own `Switch.module.css` (l37) and before any code edit |
| T3 r2 | 3 | l51 `Checkbox.module.css` · l53 `metadata/Checkbox.json` · l177 `atlas/Checkbox.md`, the "precedent" behind the hand edit |
| T3 r3 | 1 | l49 `Checkbox.module.css` |
| T4 r1 | 2 | l52, l60 Grep `Badge` in `patterns/Tabs/Tabs.tsx`, a call-site search for Badge usage |
| T4 r2, r3 | 0 | |

Reproduced: T3 3/3. T4 is 1/3 and not reproduced, and its hit is a call-site grep that the skill allows.

**Cause.** Every T3 run opened `Checkbox.module.css`, the one primitive that already has `lg`, as a template for the new size
styles. That happens at the code step, before any edit.
- The Checkbox rule in `figma-first.md` ("Precedent is not approval") is about Figma approval, not styling.
- `code-rules.md` doesn't say where the dimensions and tokens for a new size come from.

**Smallest change.** One bullet under `## Styling` in `atlas-component/references/code-rules.md`:
> "A new size or variant takes its dimensions from the Figma variant (`get_design_context` on its node) and its tokens from
> `atlas/tokens.md`. Don't open another component's `.tsx`/`.css`/metadata/doc as a template; call-site greps are fine."

Files: `.agents/skills/atlas-component/references/code-rules.md`.

**Agent-visible change.**
- The new `lg` styles come from Figma dimensions (44×24 track in live Figma) plus `tokens.md`, not a copy of Checkbox.
- Every v2 T3 run already made `get_design_context` on node 95:114.

**Primary metric.** `H5_otherComponentOpens`: T3 mean 2.0 in v2, target below that, and present in ≤ 1/3.

**Risks.**
- **Worse token choices.** Without a worked example the agent may pick different or worse tokens, or reach for px literals.
  The token-lint, tsc and verify gates plus rubric criterion B (code quality) cover this.
- **More token lookups.** It may read `tokens.md` or grep token names more often (reported effort).

T1/T2 regression is not required by H5 itself: it changes a `references/**` file under §7.

**Independence.**
- **From `f10119c`:** minor overlap. T3 r2's `atlas/Checkbox.md` open (l177) was triggered by the stale `Switch.md`, which
  `f10119c` removes. That's 1 of 6 T3 opens, so `f10119c` alone could lower H5's mean slightly. It can't remove the
  `Checkbox.module.css` reads that make up the 3/3 reproduction, because they happen at the code step before any sync.
- **Attribution:** judged on the reproduction criterion (≤ 1/3 runs with any open). The mean is reported both with and
  without post-sync `.md` opens.
- **From H3:** independent. **From H1:** independent.

---

## Proposed v3 set if approved
`f10119c` + H3 + H5, one commit each on `bench/phase-9-v3`.
- **Runs:** re-run the live fixture gate, then v3 T3/T4 × 3, then T1/T2 × 3. T1/T2 is required by `f10119c`.
- **Acceptance:** per change, under §8.3 plus the `f10119c` conditions (0 generated-file hand edits, correct derived
  Sizes/Variants, second sync writes 0, T1/T2 no regression).
- **Budget:** spent $11.10; expected about $10 more; cap $40.
