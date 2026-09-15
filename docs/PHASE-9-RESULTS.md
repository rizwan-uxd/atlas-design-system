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

## T3 fixture 2 restart (2026-09-15) — still HOLD

**Setup.**
- **Fixture 2:** `3089cfe`. The gate checks Switch `sm`/`md` code geometry against live Figma. Frozen in `6caa423`.
- **Switch parity:** `d0df523` (DISC-029).
- **Sources:**
  - no-skill: `3016033` + `no-skill.patch`
  - harness-v2: `3016033` (`d7967d7` + Switch parity)
  - harness-v3: `53f31f3` (`3016033` + `f10119c` + H3 + H5)
- **Run conditions:** Claude CLI 2.1.271 for all three labels, 3 runs each, no stop-rule events, spend $26.60 / $40.
- **Scope:** fixture-1 results above are not compared with these.

| Label | All gates | Failures | Manual /20 (median) |
|---|---|---|---|
| no-skill-t3f2 | 0/3 | companions ×3 · stamped (r2) | not scored (no run passed every gate) |
| harness-v2-t3f2 | 2/3 | r2 `noGeneratedHandEdits` — hand-edited `atlas/Switch.md` again | 20 (r1) |
| harness-v3-t3f2 | **3/3** | — | 19 (r1): D 4, DISC-004 issue text left stale |

Source signals, fixture 2 (runs where present):

| Label | H1 | H2 | H3 | H4 | H5 |
|---|---|---|---|---|---|
| no-skill-t3f2 | 3/3 | 0/3 | 0/3 | 0/3 | 1/3 |
| harness-v2-t3f2 | 3/3 | 0/3 | **3/3** | 0/3 | **0/3** |
| harness-v3-t3f2 | 3/3 | 0/3 | 0/3 | 0/3 | 0/3 |

**Per change, T3 (fixture 2).**

`f10119c`: **T3 criteria met.**
- Correctness 3/3.
- Generated-file hand edits v2 1/3 → v3 0/3.
- Derived Sizes/Variants correct in all 12 docs ×3.
- Second sync writes 0 files ×3.

H3: **T3 criteria met.**
- Reproduced in v2 3/3 (syncs 3/3/3).
- v3 redundant state-edit sync 1/3 (r3).
- Mean syncs 3.00 → 1.33.
- `snapshotCurrent` 3/3, final verify 3/3.

H5: **not accepted.**
- The source signal did not reproduce in fixture-2 v2 (template opens 0/3).
- The fixture-1 reproduction (3/3 Checkbox template opens) does not hold once Switch geometry matches Figma.
- A rejected skill-text change needs no re-run (§8.3), so its commit would be dropped from any merge.

**Still open before Phase 9 can close.**
- **T4 and T1/T2 on the fixture-2 v3 source (`53f31f3`)** — not yet run.
  - T1/T2 regression is mandatory because `f10119c` changes generated `atlas/` output.
  - The T1 6/7 signal from fixture 1 stays open until then.
- **Rubric D, §8.3 step 3.** The v3 median scored D 4 against v2's 5, which strictly fails "no criterion lower".
  - Scores are not blind.
  - It needs a decision.

## CLI version check (2026-09-15)
Phase 9 was first pinned to Claude CLI 2.1.270. The CLI auto-updated to 2.1.271 before any fixture-2 run, and fixture 2 was pinned
to 2.1.271 (`6caa423`). Evidence, from the `init` event in each run's `run-N.jsonl`:

| Label | Runs | CLI |
|---|---|---|
| no-skill-t3f2 | 3 | 2.1.271 ×3 |
| harness-v2-t3f2 | 3 | 2.1.271 ×3 |
| harness-v3-t3f2 | 3 | 2.1.271 ×3 |
| harness-v4-t3f2 | 2 started | 2.1.271 ×2 |
| fixture 1: harness-v2, harness-v3, no-skill (T3) | 9 | 2.1.270 (`env.txt`, `pins-t3-fixture1.json`) — diagnostic only, not compared |

- **Result:** every fixture-2 comparison label used 2.1.271, so v4 resumes unchanged.
- **Interrupted run:** v4 T3 run 2 was operator-stopped for this check. Its trace is kept in
  `benchmarks/results/harness-v4-t3f2/T3/operator-stopped-run-2/`, it isn't scored, and it re-runs from the same freeze.

## harness-v4-t3f2 T3 (2026-09-15) — continuation gate FAILED on H3; T4 and T1/T2 not run
- **Source:** `1fd95aa` = `3016033` + `f10119c` + H3 + H6 (H5 dropped). Freeze `2fa88a8`.
- **Runs:** 3, CLI 2.1.271. Run 2 re-ran after the operator stop.

| Condition | Result | Pass |
|---|---|---|
| All gates | 3/3 | ✓ |
| Stale-row metric (H6) | 0/3 (v2 2/3, v3 2/3) | ✓ |
| `f10119c` | hand edits 0/3 · derived docs 3/3 · second sync 0 ×3 | ✓ |
| H3 | runs with a redundant state-edit sync **3/3** (limit 1/3) · mean syncs **2.33** (limit ≤ 2) · `snapshotCurrent` and verify 3/3 | **✗** |
| Rubric, median r1 | 20/20 (A5 B5 C5 **D5**) vs v2 median 20 (D5) | ✓ |

**Cause of the H3 failure: H3 and H6 interact.** Every v4 run followed H6 and narrowed DISC-004 after the post-code sync. Every
run then re-synced "to confirm it writes 0 files".
- That re-sync is what `companions.md` line 63 still says: "After editing state, `npm run atlas:sync` once more and confirm it
  writes 0 files on a second run".
- H3 changed only SKILL.md step 6, so it conflicts with that line.
- In harness-v3-t3f2, only 1 run in 3 edited state after the sync, so the conflict rarely triggered.
- H6 makes the state edit happen in every run, which exposes the conflict.
- Under the no-overlap rule, a combined result can't be used to accept either change.

**Status:** Phase 9 stays HOLD. `f10119c`, H3 and H6 are not accepted, and nothing is merged.

## harness-v5-t3f2 T3 (2026-09-15) — API/spend stop on run 1 → HOLD
- **Source:** `56170dc` = `3016033` + `f10119c` + H3 revised (`companions.md` sync rule) + H6. Freeze `2447f3e`. Cap $42.
- **Runtime:** CLI 2.1.271, `claude-sonnet-5`, same MCP set and statuses as the fixture-2 baselines.
- **Stop:** run 1 hit "You've hit your monthly spend limit" after $0.13. `budget.mjs` recorded it as an infrastructure stop
  (3/2 replacements used) and the chain stopped. Runs 2 and 3 never started.
- **Policy (user, 2026-09-15):** no replacements or retries, and any API/spend stop leaves Phase 9 on HOLD. Run 1 is kept
  as-is and not scored. The trace sha256 is in `benchmarks/results/harness-v5-t3f2/T3/trace-run-1.sha256`.
- **Nothing accepted or merged.** Spend: $29.90 / $42.
