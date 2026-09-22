# Phase 9 results — CLOSED (2026-09-22)

**Status: CLOSED.** H3 revised is ACCEPTED, H6 is FAILED/DEFERRED. Nothing is merged or pushed. The **closure record**
is the last section of this file. Everything between here and it is the chronological evidence trail, preserved
unchanged — including HOLD states and scores that were true when written.

## Original HOLD entry (2026-09-15) — superseded by the closure record
**Status at the time: HOLD.** The v3 evidence is **inconclusive** and is not a valid PASS or FAIL result for Phase 9.

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
  - **RESOLVED 2026-09-22 (choice D-3).** The D 4 stands unchanged as a diagnostic score against `53f31f3`
    (`f10119c` + pre-revision H3 + H5) — a **rejected** source. §8.3 step 3 is evaluated on the arm that accepts the
    change, `harness-v6-t3f2` (`56170dc`), which scores **A5 B5 C5 D5** against `harness-v2-t3f2` r1's A5 B5 C5 D5:
    equal on every criterion, so the rubric clause is satisfied. No score was revised and the rubric text is unchanged.
    See the closure record.

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

## harness-v6-t3f2 (2026-09-22) — v5 restarted under a re-pinned runtime
The v5 restart could not run as frozen: between the v5 freeze and the restart, the account runtime changed in two ways
that the pins caught before any spend.

- **Source: unchanged.** `56170dc`, exactly as v5. The `harness-v6-t3f2` label pin is byte-identical to
  `harness-v5-t3f2` (tree `6c28995fc2`), so v6 is a runtime re-pin, not a new source. Tag `phase-9-v6-freeze`.
- **Drift 1 — CLI.** The auto-updater moved the CLI to 2.1.274. Restored to the pinned 2.1.271; every v6 batch runs
  with `DISABLE_AUTOUPDATER=1` so the pin holds for the chain.
- **Drift 2 — MCP set.** A `claude.ai Claude Docs` connector was added to the account and could not be disconnected
  (three attempts over 2026-09-17..22; the CLI cannot remove an account-level connector). It is therefore absorbed into
  the v6 runtime pin. `pins.runtime.component` / `.prototype` were cleared so the first v6 run of each type re-records
  the current set. The pinned value up to v5 was:
  `claude.ai Firecrawl | claude.ai Gmail | claude.ai Google Calendar | claude.ai Google Drive | figma | figma-desktop | graft | plugin:vercel:vercel`
- **Drift 3 — user skills (caught, removed, not absorbed).** An account-synced `~/.claude/skills/synced/` bucket appeared
  on 2026-09-22 carrying `atlas-context` and `atlas-ui-system` — skills that supply Atlas tokens, specs and variant rules
  directly. Left in place they would have contaminated every arm and voided the `no-skill` comparison. The bucket was
  moved out before any run and `pins.common.user.skills` matches the pre-drift value unchanged.
- **Comparability.** v6 differs from the fixture-2 baselines (`no-skill-t3f2`, `harness-v2-t3f2`, `harness-v3-t3f2`,
  `harness-v4-t3f2`) by one extra MCP server *name* in the init list — no extra tools were offered to the agent. Re-running
  those four arms to re-baseline would cost ~$10 of the $12.10 remaining under the $42 cap, so the delta is recorded here
  as a known confound instead. Cross-version T3 comparisons carry this footnote.
- **Ledger.** The v5 T3 run-1 spend-limit stop (3 turns, $0.13, no agent work produced) is reclassified `infra: false`,
  `nonRun: true` with its reason, under user authorisation on 2026-09-22 — a non-run interruption, not a benchmark
  replacement. Its trace and sha256 are preserved unchanged at `benchmarks/results/harness-v5-t3f2/T3/`. The replacement
  counter reads 2/2; `budget.mjs` is untouched.

### harness-v6-t3f2 T3 x3 (2026-09-22) — H3 revised accepted, H6 fails 1/3 → stop
| metric | harness-v4-t3f2 | harness-v6-t3f2 |
|---|---|---|
| cost (mean) | $0.86 | $0.78 |
| turns | 41 / 41 / 37 | 35 / 36 / 33 |
| `H3_syncRuns` | 2 / 3 / 2 | **1 / 1 / 1** |
| H3 present (redundant sync) | 3/3 fail | **0/3 — accepted** |
| gates | 3/3 pass | 3/3 pass |
| stale `DISC-004` (H6) | 0/3 | **1/3 — run 3 stale** |
| rubric, median run | 20/20 (A5 B5 C5 D5), r1 | **20/20 (A5 B5 C5 D5), r1** |

Rubric scores for `harness-v6-t3f2` were added on 2026-09-22 from the preserved artifacts — the run-1 workspace diff,
`run-1.jsonl` tool order and final `result` event, and `T3/stale-row/run-1/stale-row.json`. No re-run, no spend.
Median by turns 35/36/33 → r1 (no tie). Recorded in `benchmarks/results/harness-v6-t3f2/T3/manual.json`. Against
`harness-v2-t3f2` r1 (A5 B5 C5 D5) no criterion is lower, satisfying §8.3 step 3 on the accepting arm.

- **H3 revised: accepted.** The `companions.md` line 63 conflict is gone. Every run syncs exactly once; no run re-syncs
  "to confirm it writes 0 files". Cheaper and shorter than v4 as a side effect, not a target.
- **H6: not accepted.** Run 3 closed `DISC-014` but never narrowed `DISC-004`, leaving two sentences that still describe
  `lg` as missing after `lg` shipped: "Figma used Variant for on/off; code has no size lg" and "Code: add size lg".
  Runs 1 and 2 narrowed it correctly. H6's criterion is 0/3, so 1/3 fails.
- **The two changes interact in both directions.** v4: H3 fails, H6 holds 0/3. v6: H3 holds 0/3, H6 fails 1/3. Under the
  no-overlap rule neither combined result accepts both, so the pair still cannot ship together.
- **Stopped** before T4/T1/T2 per the standing instruction that a real agent correctness failure stops the chain.
  Spend $32.24 / $42.

## harness-v7 (2026-09-22) — H3-only regression: T4, T1, T2 x3 → H3 survives
**Source `44eacba` = `56170dc` with H6 (`1fd95aa`) reverted.** H3 revised only; the H6 partial-resolution row is gone
from `companions.md` and SKILL.md step 6 reads "closed with a dated resolution" again. Branch `bench/phase-9-h3only`,
label pin `harness-v7` (tree `d456c6b32f`). No re-baseline: every comparison below is against the existing `harness-v3`
arm on the unchanged rubric and fixtures.

| task | arm | cost (mean) | turns | coverage | tsc | token-lint | raw elements | primitive refs |
|---|---|---|---|---|---|---|---|---|
| T4 | harness-v3 | $0.50 | 22 / 16 / 25 | gates 3/3 | 0 | 0 | — | — |
| T4 | **harness-v7** | **$0.40** | **23 / 13 / 11** | **gates 3/3** | 0 | 0 | — | — |
| T1 | harness-v3 | $0.79 | 28 / 36 / 39 | 7/7, **6/7**, 7/7 | 0 | 0 | 0 | 0 |
| T1 | **harness-v7** | $0.80 | 31 / 37 / 38 | **7/7 x3** | 0 | 0 | 0 | 0 |
| T2 | harness-v3 | $0.47 | 22 / 24 / 25 | 5/6 x3 | 0 | 0 | 0 | 0 |
| T2 | **harness-v7** | $0.51 | 24 / 26 / 26 | **6/6**, 5/6, 5/6 | 0 | 0 | 0 | 0 |

- **T4 (component, H3's own path):** `H3_syncRuns` 0 in all three runs, H3 never present, gates 3/3, no out-of-scope
  writes. Cheapest and shortest T4 arm recorded.
- **T1 (prototype):** 7/7 coverage in all three runs; the `harness-v3` 6/7 run did not reproduce. H3 does not touch the
  prototype path, so this is most likely run-to-run variance rather than a fix — the 6/7 signal is **not** explained,
  only not observed again. Run 2 ran `atlas-verify` twice; no rework followed.
- **T2 (prototype):** one run reached 6/6, the other two match `harness-v3` at 5/6. No degradation.
- **H3 survives regression.** No errors, no max-turns exits, no permission denials, zero `tsc`/token-lint violations,
  no raw elements and no primitive token refs in any of the nine runs.

### Phase 9 verdicts
- **H3 (revised): ACCEPTED.** T3 x3 on `harness-v6-t3f2` (one sync per run, zero redundant confirmation syncs, gates 3/3)
  plus this T4/T1/T2 regression. Caveat on the evidence: the accepting T3 runs were measured on `56170dc`, which still
  contained H6. The H3-only source `44eacba` has been regression-tested on T4/T1/T2 but **not** re-measured on T3.
- **H6: FAILED / UNRESOLVED, deferred.** Evidence: `harness-v6-t3f2` T3 run 3 left `DISC-004` open and stale after `lg`
  shipped, with the text still reading "Figma used Variant for on/off; code has no size lg" and "Code: add size lg"
  (`benchmarks/results/harness-v6-t3f2/T3/stale-row/run-3/stale-row.json`). Runs 1 and 2 narrowed it correctly; H6's bar
  is 0/3. Not revised, retried or combined with H3, per user instruction.
- **`f10119c` / `8a5189b` (sync derives Variants/Sizes):** carried in every accepted source since v3; no separate verdict.

### Runtime deviations during this chain
- `~/.claude/skills/synced/` regenerated **four times** (17:22, 17:32, ~17:5x, 18:12), twice mid-batch. Every occurrence
  was caught by `pins.mjs check` before the affected run started; the bucket was removed and the run re-issued with
  `BENCH_ONLY`. All 12 runs verified clean: 128 skills in each init snapshot, no `atlas-context` or `atlas-ui-system`.
- `claude.ai Claude Docs` remains in the MCP set (absorbed into the v6 runtime pin; see the v6 section).
- CLI held at 2.1.271 throughout via `DISABLE_AUTOUPDATER=1`.

---

# Phase 9 closure record (2026-09-22)

Approved by the user on 2026-09-22. No further benchmark runs. Nothing merged, nothing pushed.

## Verdicts

**H3 (revised) — ACCEPTED.**
Accepting evidence: `56170dc` (= `3016033` + `f10119c` + H3 revised + H6), label `harness-v6-t3f2`, tag `phase-9-v6-freeze`.
- T3 x3: `H3_syncRuns` **1 / 1 / 1**; the redundant confirmation sync appears in **0/3** runs (bar: <= 1/3); mean syncs
  2.33 (v4) -> **1.00**; all §8.1 gates **3/3**; `snapshotCurrent` and final verify 3/3.
- Rubric, median r1: **A5 B5 C5 D5 = 20/20**, equal to `harness-v2-t3f2` r1 on every criterion (§8.3 step 3 satisfied).
- Cheaper and shorter than v4 (mean $0.86 -> $0.78; turns 41/41/37 -> 35/36/33) — a side effect, not a target.
- Regression on the H3-only source `44eacba`, label `harness-v7`: T4 gates 3/3 ($0.40 mean, `H3_syncRuns` 0 x3, no
  out-of-scope writes); T1 coverage 7/7 x3; T2 6/6, 5/6, 5/6; `tsc` 0, token-lint 0, raw elements 0, primitive token
  refs 0 in all nine runs; no errors, no max-turns exits, no permission denials.

**H6 — FAILED / UNRESOLVED, DEFERRED.**
`harness-v6-t3f2` T3 **run 3** shipped Switch `lg` and left `DISC-004` open and stale:
`benchmarks/results/harness-v6-t3f2/T3/stale-row/run-3/stale-row.json` records `"lgShipped": true, "stale": true`,
the row still reading `side: "both"`, `issue: "Figma used Variant for on/off; code has no size lg."`,
`resolution: "Figma: Variant -> Checked boolean. Code: add size lg."`, with no `date`. Runs 1 and 2 narrowed it
correctly. H6's bar is 0/3, so 1/3 fails. Not revised, not retried, not recombined with H3.

**Interaction finding.** v4 (`1fd95aa`, H3 + H6): H3 fails 3/3, H6 holds 0/3. v6 (`56170dc`, H3 revised + H6): H3 holds
0/3, H6 fails 1/3. Under the no-overlap rule no combined result accepts both; H3 ships alone on `44eacba`.

**`f10119c` / `8a5189b`** (sync derives `## Variants` / `## Sizes`): carried in every accepted source since v3, no
separate verdict. It must ship with H3 — H3 has only ever been measured on top of it.

**H5 — rejected** (source signal did not reproduce in fixture-2 v2: template opens 0/3). **H1** deferred.
**H2 / H4** not reproduced.

## Rubric scores — `harness-v6-t3f2` T3, median run 1

Scored 2026-09-22 from preserved artifacts only (workspace diff, `run-1.jsonl`, `stale-row.json`). No re-run, no spend.
Not blind: scored by the session that ran the batches.

| Criterion | Score | Evidence |
|---|---|---|
| **A** Figma-first judgement | **5** | Figma read (call 50, `get_metadata` 95:114) before the first edit (call 68); report states Size `lg` already existed as a Figma property (DISC-014) so no Figma edit was needed; 44x24 / thumb 20 / translate 20 taken from Figma, none invented; no Figma write |
| **B** Code quality and states | **5** | `lg` uses the existing per-size class mechanism; semantic spacing tokens only, no hardcoded lengths; hover/focus-visible/active/disabled are shared track selectors so they hold at `lg`; RTL negation added alongside sm/md; reduced-motion untouched; DISC-028 untouched; no drive-by edits |
| **C** Companions | **5** | Code Connect `figma.enum` Size maps `lg`; contract `AssertSwitchSize` extended; test `SIZES` matrix extended; `atlas-verify` OK — 12 pass · 0 warn · 0 fail · 0 skip. Note: the `lg` test assertion is presence-only, matching the file's existing sm/md pattern rather than adding geometry assertions |
| **D** State and reporting accuracy | **5** | DISC-004 narrowed in schema (side both->figma, text reduced to the remaining Variant->Checked part, dated); DISC-014 closed by sync with `closedAt`/`closedBy`; every report claim checks out against the diff; unresolved DISC-004/013/028 named; no hand edit to generated `atlas/` |

**Total 20/20**, equal to `harness-v2-t3f2` r1 (20/20, A5 B5 C5 D5).

**Rubric D decision (choice D-3).** The `harness-v3-t3f2` **D 4 is preserved unchanged** as a diagnostic score against
`53f31f3` (`f10119c` + pre-revision H3 + H5), a rejected source; its stale-`DISC-004` finding stands. §8.3 step 3 is
evaluated on the accepting arm instead. No score was revised and `benchmarks/rubric-component.md` is unchanged.

## Task evidence and acceptance bars

| Task | Arm | Bar | Result |
|---|---|---|---|
| T3 | `harness-v6-t3f2` x3 | all §8.1 gates 3/3; H3 signal <= 1/3; mean syncs lower than v2; no rubric criterion below v2 | gates 3/3 · signal 0/3 · 2.33 -> 1.00 · 20/20 = 20/20 — **met** |
| T4 | `harness-v7` x3 | gates 3/3, correct stop, no variant code change | 3/3, `H3_syncRuns` 0 x3 — **met** |
| T1 | `harness-v7` x3 | coverage >= v2 minimum, lint/tsc/raw 0, final verify 3/3 | 7/7 x3, all 0, 3/3 — **met** |
| T2 | `harness-v7` x3 | same | 6/6 · 5/6 · 5/6, all 0, 3/3 — **met** |

T1/T2 manual scores were not re-taken for `harness-v7`; the §8.3 "manual >= 16" clause rests on the Phase 8
`harness-v2` scores (T1 16, T2 16) with automated parity demonstrated above. The fixture-1 T1 6/7 signal did not
reproduce; it is **not explained**, only not observed again.

## Runtime deviations and impact

| Deviation | Handling | Impact |
|---|---|---|
| CLI auto-updated 2.1.271 -> 2.1.274 before v6 | Restored to the pinned 2.1.271; every v6/v7 batch run with `DISABLE_AUTOUPDATER=1` | none — all comparison runs on 2.1.271 |
| `claude.ai Claude Docs` connector added account-level, not removable | Absorbed into the v6 runtime pin | v6/v7 differ from the four fixture-2 baselines by one extra MCP server **name** in the init list; no extra tools offered. Re-baselining would cost ~$10 of the remaining budget, so it is recorded as a **known confound** footnoted on cross-version T3 comparisons |
| `~/.claude/skills/synced/` (`atlas-context`, `atlas-ui-system`) regenerated 4x during the v7 chain, twice mid-batch | Caught by `pins.mjs check` before each affected run; bucket removed, run re-issued with `BENCH_ONLY` | none — all 12 runs verified clean, 128 skills per init snapshot, neither skill present |
| v4 T3 run 2 operator-stopped for the CLI check | Trace preserved, not scored, re-run from the same freeze | none on results; $0.60 charged to the interactive ledger |
| v5 T3 run 1 hit the monthly spend limit at $0.13 | Reclassified `infra: false`, `nonRun: true` under user authorisation 2026-09-22; trace + sha256 preserved; replacement counter stays 2/2; `budget.mjs` untouched | none on results; v5 superseded by the v6 re-pin (byte-identical source, tree `6c28995fc2`) |

## Spend

**$37.32 of the $42 cap. Unused: $4.68.** = $36.67 across 51 metered runs + $0.65 interactive (two haiku spend-limit
probes at $0.0276 and $0.0242, and the v4 T3 run-2 operator stop estimated conservatively at $0.60). Cap history: $40
from 2026-09-13, raised to $42 on 2026-09-15 by user approval as the stated maximum. The remaining $4.68 is **not**
spent on closure.

## Remaining caveats

1. **T3 was not re-run on the final H3-only source `44eacba`.** The T3 runs that accepted H3 revised were measured on
   `56170dc`, which still contained H6. `44eacba` is `56170dc` with H6 reverted; it was regression-tested on T4, T1 and
   T2 (nine runs, all passing) but never measured on T3.
   **This is a residual evidence caveat, not an H3 failure.** H3's own criterion — one sync per run, zero redundant
   confirmation syncs — was met 3/3 on T3 under `56170dc` and again 3/3 on T4 under `44eacba`, which is H3's own code
   path. The revert removes a rule that only *adds* a state-edit step; it does not touch the sync rule H3 changes. What
   is unverified is the narrow proposition that removing H6 leaves T3's H3 behaviour unchanged — plausible on the T4
   evidence, not directly measured. Closing it would cost roughly $2.30 of the $4.68 remaining. Not run, per instruction.
2. **One-MCP-name confound** between v6/v7 and the four fixture-2 baselines (see runtime deviations).
3. **Rubric scores are not blind** — every `manual.json` in Phase 9 records this, including v6's.
4. **T1 6/7 (fixture 1) is unexplained**, only unreproduced.
5. **Badge fixture conflict (T4)** — DISC-006's recorded resolution (`default->primary, secondary->neutral`) still
   contradicts `Badge.figma.tsx` and rubric criterion C (`neutral->default, primary->secondary`). Unreconciled; belongs
   to Phase 2 (Badge), not Phase 9.
6. **H6 remains unresolved**, deferred with its failure evidence intact.

## Source, tag and commit state at closure

- `main` @ `21101c9` — all Phase 9 benchmark evidence and docs. Nothing pushed.
- `bench/phase-9-h3only` @ **`44eacba`** — the accepted source. Chain: `3016033` (Switch parity) · `8a5189b` (sync
  derives Variants/Sizes) · `4e968cd` (H3 original) · `1fd95aa` (H6) · `56170dc` (H3 revised) · `44eacba` (revert H6).
- Tags: `phase-9-bench-freeze`, `phase-9-v3-freeze`, `phase-9-v4-freeze`, `phase-9-v5-freeze`, `phase-9-v6-freeze`.
  **No tag exists for `harness-v7`** — it is pinned by label only (tree `d456c6b32f`).
- Evidence branches retained: `bench/phase-9-v3` (`e2bb0e7`), `bench/phase-9-t3f2-v2` / `-v3` / `-v4` / `-v5`.

## Shipping recommendation — H3

**Cherry-pick, not a merge.** `bench/phase-9-h3only` branched before the entire benchmark-evidence run; merging it into
`main` would revert ~32,000 lines (all Phase 9 results, `docs/PHASE-9-*`, the `benchmarks/phase-9/` tooling, the
`docs/_archive` reorganisation). Switch parity is already on `main` as `d0df523`.

Shipping H3 means bringing four source changes onto `main`:

1. `.agents/skills/atlas-component/SKILL.md` — step 6 rewrite (sync once after the last code/companion edit; a later
   `atlas/state/*.json` hand edit needs no re-sync).
2. `.agents/skills/atlas-component/references/companions.md` — line 63 replaced so it no longer contradicts step 6.
3. `scripts/atlas-sync.mjs` + `.agents/skills/atlas-figma-sync/references/field-mapping.md` — `f10119c` / `8a5189b`,
   which H3's evidence sits on top of.
4. The regenerated `atlas/*.md` derived sections — produced by running `npm run atlas:sync`, never hand-edited.

**Correction (2026-09-22, integration prep).** `8a5189b` carries **two further files** that this four-item list omitted:
`scripts/tests/atlas-sync.test.mjs` (the test for the derived `## Variants` / `## Sizes` blocks) and the `test:scripts`
script in `package.json` that runs it. They are part of the same commit, not separate work. Shipping the sync change
without them would land untested generator code. **Pending user decision; not applied.** Nothing else on
`bench/phase-9-h3only` is in scope — in particular the branch also carries the phase-8 `docs/_archive` un-archiving and
a restored `packages/ai-workflows/atlas-ui-skill/`, which must **not** reach `main`.

Not applied, not committed, not pushed.
