# Phase 9 results — HOLD (2026-09-15)

**Status: HOLD.** The v3 evidence is **inconclusive** and is not a valid PASS or FAIL result for Phase 9.

- Nothing from `bench/phase-9-v3` is merged: `f10119c`, H3 `c22e675` and H5 `e2bb0e7` stay on the branch.
- Raw results stay under `benchmarks/results/` exactly as recorded.

## Why HOLD
- **The T3 fixture is defective.** It assumes Switch `lg` can be added without touching `sm` and `md`. But the code's `sm` and `md`
  dimensions don't match Figma:

  | Size | Figma (node 95:114) | Code in `d7967d7` |
  |---|---|---|
  | sm | 28×16 | 32×18 |
  | md | 36×20 | 40×24 |
  | lg | 44×24 | — |

- **What happened in v3 T3 run 2.** The agent took `lg` from Figma, saw that it would be the same height as the code's `md`, named
  the geometry conflict and stopped. Per AGENTS.md §6 that is the correct response. The fixture scores it as a failure.
  - **Decision (user, 2026-09-15):** this is a fixture defect, not an agent failure.
- **Consequence.** No T3 label measured against this fixture is a valid basis for acceptance (v2, no-skill or v3). The v2 runs met the
  same conflict silently: v2 run 3 shipped `lg` at 44×24 next to a 40×24 `md`.

## What was measured (diagnostic only)
Sources:
- **v2:** `d7967d7`.
- **no-skill:** `d7967d7` + `no-skill.patch`.
- **v3:** `e2bb0e7` = `f10119c` + H3 + H5.

All labels ran on claude-sonnet-5, 3 runs each. Spend was $19.30 of $40, and both infrastructure replacements were used:
harness-v2 T3 run 3 and harness-v3 T3 run 2. The originals are kept in `replaced-run-*/`.

| Task | Label | All gates | Notes |
|---|---|---|---|
| T3 | harness-v2 | 2/3 | run 2 hand-edited generated `atlas/Switch.md` |
| T3 | no-skill | 0/3 | companions, verify, stamp, scope |
| T3 | harness-v3 | 2/3 | run 2 stopped on the geometry conflict (fixture defect) |
| T4 | harness-v2 | 3/3 | |
| T4 | no-skill | 0/3 | didn't stop; changed the variant union; out of scope |
| T4 | harness-v3 | 3/3 | |
| T1 | harness-v3 | coverage 7/7 · **6/7** · 7/7 | run 2 composed sections from `div`s instead of Card (it read `Card.md`); lint/tsc/raw 0; final verify 3/3 |
| T2 | harness-v3 | coverage 5/6 ×3 | same as v2; final verify 3/3 |

### Per change (direct metrics — not accepted)
| Change | Direct metric, v2 → v3 (T3) | Other conditions | Status |
|---|---|---|---|
| `f10119c` derived Sizes/Variants | generated-file hand edits 1/3 → 0/3 runs; derived docs correct in all 12 files in every v3 workspace; second sync writes 0 in every workspace | T3 correctness 2/3; T1 coverage regression signal | not accepted |
| H3 single post-code sync | runs with a redundant sync 2/3 → 1/3; mean syncs 2.33 → 1.00; `snapshotCurrent` 3/3 | final verify 2/3 (run 2) | **improved its direct metric, not accepted** because T3 correctness was 2/3 |
| H5 no template opens | runs with template opens 3/3 → 1/3; raw mean 2.00 → 0.33; excluding the stale-doc `Checkbox.md` open 1.67 → 0.33 | T3 correctness 2/3 | **improved its direct metric, not accepted** because T3 correctness was 2/3 |

Not implemented:
- **H1** (state-file reads): deferred. It overlaps H3, and its T3 criterion is unreachable while T3 needs a DISC-004 hand edit.
- **H2 and H4:** not reproduced.

### Open signals
- **T1 coverage 6/7 in harness-v3 run 2 is an unresolved regression signal.** Only `f10119c` changes T1 inputs, because the H3 and H5
  text isn't loaded by prototype tasks. It is not attributed to variance, and one re-run won't settle it. It stays open until
  T1 is re-measured as part of a full v3 regression batch.
- **Badge fixture conflict (T4).** DISC-006's recorded resolution says `default→primary, secondary→neutral`. `Badge.figma.tsx` and
  rubric criterion C map `neutral→default, primary→secondary`. This isn't reconciled yet (Phase 2, Badge).

## Restart plan
1. **Phase 2 prerequisite:** reconcile Switch `sm` and `md` code dimensions to Figma. Switch only.
2. **New T3 fixture** built on the reconciled Switch.
3. **Restart T3** from a clean baseline: no-skill, frozen v2, v3. Each label uses the reconciled Switch source.
4. **Runs before the fixture change** are diagnostic evidence only and are never compared directly with runs after it.
