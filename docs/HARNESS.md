# Atlas harness: what was built and what it measured

Single record of the harness work (phases 0 to 9, 2026-09-12 to 2026-09-22). Rules live in `AGENTS.md`; project state in `CLAUDE.md`; per-run numbers in `benchmarks/results/SUMMARY.md`. Full per-run traces are in `benchmarks/results/` and git history (tags `phase-9-*-freeze`, branches `bench/phase-9-*`).

**Goal:** maximum useful output per token, tool call, file read and agent turn, without losing quality.
**Principle:** Figma is the design-system authority. The generated `atlas/` snapshot is the agent's optimised read layer, a cache and never a replacement.

```
Figma -> sync -> atlas/metadata + atlas/state -> progressive disclosure -> agent -> verify -> report
```

## 1. What was built

| Phase | Deliverable | Status |
|---|---|---|
| 0 | Benchmark kit `benchmarks/` (T1 send-money flow, T2 settings screen with a gap component), 3 runs each on an isolated copy. Records cost, tokens, turns, reads by category, tool calls, verify runs, rework, plus automated quality (token-lint, tsc, Atlas usage, raw elements) and a manual /20 rubric | done |
| 1 | `AGENTS.md` harness rules: source of truth and Figma escalation rule, context priority order, tool selection, task boundaries, execution loop (parse, scope, retrieve, plan, execute, verify, correct, report), uncertainty rule, token rules, routing table. `CLAUDE.md` holds state only | done |
| 2 | Figma parity and structure per component (file restructure; Checkbox pilot) | Checkbox done, rest tracked in `docs/audits/FIGMA-CODE-PARITY.md` |
| 3 | Figma metadata: descriptions, documentation links, variable code syntax `var(--atlas-...)` | per component, with phase 2 |
| 4 | Generated `atlas/` snapshot: `index.md`, `metadata/<Name>.json`, `<Name>.md`, `tokens.*`, `state/` (status, discrepancies, decisions, candidates). Every file carries `syncedAt` and the Figma version | done |
| 5 | `atlas-figma-sync` skill and `scripts/atlas-sync.mjs`: pull via MCP, regenerate, stamp, diff against code, write drift to `discrepancies.json`. Never writes to Figma | done |
| 6 | `atlas-verify` skill and `scripts/atlas-verify.mjs`: design checks against metadata, token-lint, tsc, tests, Atlas usage, a11y, git-diff scope | done |
| 7 | `atlas-prototype` and `atlas-component` task skills (progressive disclosure: description, SKILL.md, references) | done |
| 8 | Context diet: stale plans archived, `atlas-context` and `atlas-ui-system` retired, re-benchmark | done |
| 9 | Benchmark and tighten the component workflow (`atlas-component`) | closed |

Architecture decisions: `atlas/` is generated only, skills are authored in `.agents/skills/` (symlinked as `.claude/skills`); the snapshot is JSON facts plus Markdown guidance; no repo restructure; agents call Figma MCP only when the snapshot lacks a field, is stale, or verification finds a mismatch, and must say so. Figma plan is Professional (no Code Connect in Dev Mode); `.figma.tsx` files are the prop-mapping source the sync reads.

## 2. Results, phases 0 to 8 (prototype tasks, sonnet, 3 runs each, means)

Correctness first: a label only wins if coverage, lint, tsc, raw elements and final verify are equal or better.

| task | label | cost $ | turns | cache read | coverage | final verify | manual /20 |
|---|---|---|---|---|---|---|---|
| T1 send-money | baseline (phase 0) | 0.95 | 39.7 | 2.18M | 7/7 x3 | 2/3 | 15 |
| T1 send-money | harness-v2 (phase 8) | 0.78 | 32.3 | 1.50M | 7/7 x3 | 3/3 | 16 |
| T2 settings | baseline (phase 0) | 0.70 | 27.7 | 1.59M | 3/6, 5/6, 5/6 | 3/3 | 14 |
| T2 settings | harness-v2 (phase 8) | 0.51 | 24.3 | 0.88M | 5/6 x3 | 3/3 | 16 |

Phase 8 outcome: correctness equal or better, effort lower (T1 cost -18%, cache read -31%; T2 cost -27%, cache read -45%). All six harness-v2 runs read 0 off-task files; final verify 3/3 on both tasks (baseline T1 was 2/3). The first "harness" label (before v2) was cheaper still on T1 ($0.55) but that is an earlier iteration with lower T2 coverage (4/6).

## 3. Phase 9: component workflow benchmark

**Question.** Does the `atlas-component` workflow (Figma -> sync -> code -> companions -> state -> verify) waste effort the harness causes, and can it be tightened without weakening Figma-first behaviour?

**Setup.** Component tasks T3 (add `lg` size to Switch; closes DISC-014, narrows DISC-004) and T4 (Badge: a stop-and-report task where the right answer is to not change code). Arms: `no-skill` (harness-v2 tree minus the `atlas-component` skill and its routing row) and `harness-v2` as baselines, then successive harness versions. Everything pinned by `benchmarks/phase-9/pins.json` (CLI 2.1.271, sonnet, skills list, tree hash); the runner refuses to spend on a mismatch. Fixture gate validates against live Figma before every run. Task rubric `benchmarks/rubric-component.md` (A Figma-first judgement, B code quality and states, C companions, D state and reporting accuracy; 5 each, /20). Acceptance was causal: a change ships only if its source signal reproduced in at least 2/3 baseline runs, its metric improved, and correctness did not regress.

**Hypotheses and verdicts**

| ID | Change | Verdict |
|---|---|---|
| H1 | Sync writes each component's open discrepancies and decision ids into its metadata so step 1 needn't read whole state files | deferred (overlaps H3) |
| H2 | Minimal test skeleton in `companions.md`; drop the pointer to another component's test file | not reproduced |
| **H3** | **Sync once after the last code and companion edit; no re-sync after a state-only edit** | **ACCEPTED (revised)** |
| H4 | Entry format for opening a new discrepancy row | not reproduced |
| H5 | Compare against `figmaProperties` only, not another component's implementation | rejected (source signal 0/3 in fixture 2) |
| H6 | Narrow a stale discrepancy row when the fix ships | FAILED, deferred (run 3 left DISC-004 stale, bar was 0/3) |

H3 and H6 interact and cannot ship together: with both, H3 failed 3/3 (v4) or H6 failed 1/3 (v6). H3 ships alone. It depends on the sync change that derives `## Variants` / `## Sizes` (`f10119c` / `8a5189b`), so they ship together.

**Evidence, T3 (Switch lg), mean of 3 runs**

| arm | all gates | H3 sync runs | cost $ | turns | rubric |
|---|---|---|---|---|---|
| no-skill-t3f2 | 0/3 | 1 | 0.76 | 30 | not scored |
| harness-v2-t3f2 (baseline) | 2/3 | 3 | 0.87 | 42.3 | 20 |
| harness-v3-t3f2 | 3/3 | 1.33 | 0.81 | 40 | 19 (D 4: stale DISC-004) |
| harness-v4-t3f2 | 3/3 | 2.33 | 0.86 | 39.7 | 20 |
| **harness-v6-t3f2 (H3 revised + H6)** | **3/3** | **1.00** | **0.78** | **34.7** | **20 (A5 B5 C5 D5)** |

The `no-skill` arm never passed all gates (0/3 on both fixtures), which is the case for the skill: correctness, not cost, is what the workflow buys. v5 hit the monthly spend limit on run 1 and was superseded by the byte-identical v6 re-pin.

**Evidence, H3-only regression (`harness-v7`, source `44eacba`, mean of 3)**

| task | gates / coverage | cost $ | turns | verify |
|---|---|---|---|---|
| T4 Badge (stop) | gates 3/3, `H3_syncRuns` 0 x3 | 0.39 | 15.7 | 3/3 |
| T1 send-money | 7/7 x3 | 0.80 | 35.3 | 3/3 |
| T2 settings | 6/6, 5/6, 5/6 | 0.51 | 25.3 | 3/3 |

tsc, token-lint, raw elements and primitive token refs were 0 in all nine runs. For contrast, T4 `no-skill` failed all gates 0/3 at $1.31 and 53 turns, versus $0.33 to $0.39 and 14 to 16 turns with the harness.

**Spend:** $37.32 of the $42 cap ($36.67 across 51 metered runs plus $0.65 interactive). $4.68 intentionally unspent. Benchmarking stopped.

**Status:** Phase 9 closed 2026-09-22. H3 integrated on `main` (`4d90522`) by cherry-pick, not by merging `bench/phase-9-h3only`. That branch predates the evidence and would revert about 32,000 lines and resurrect the retired `atlas-ui-skill`.

## 4. Caveats and open items

1. T3 was never re-run on the final H3-only source `44eacba`; accepting T3 runs used `56170dc` (H3 + H6). Not an H3 failure: H3's criterion held 3/3 on T3 under `56170dc` and 3/3 on T4 under `44eacba`. Closing it would cost about $2.30.
2. Known confound: v6/v7 carry one extra MCP server name (`claude.ai Claude Docs`, account-level) versus the fixture-2 baselines; no extra tools offered. Re-baselining would have cost about $10.
3. Rubric scores are not blind (scored by the session that ran the batches). A rubric D score was kept against its rejected source rather than rescored (`harness-v3-t3f2` D 4).
4. Fixture-1 T1 6/7 signal never explained, only unreproduced. T1/T2 manual scores were not re-taken for `harness-v7`.
5. Badge fixture conflict (DISC-006 resolution versus `Badge.figma.tsx` and rubric criterion C) is unreconciled; belongs to the Badge refinement pass.
6. H6 itself is unresolved.

## 5. Lessons to reuse

- **Account-synced skills contaminate benchmark arms.** `~/.claude/skills/synced/` regenerated `atlas-context` and `atlas-ui-system` four times during v7, twice mid-batch. `pins.mjs check` caught every one before a run started. Check this before any benchmark run.
- Pin runtime, skills and tree; refuse to spend on a mismatch. Disable CLI auto-update (`DISABLE_AUTOUPDATER=1`).
- Answer closure questions from preserved artifacts at zero spend before ordering a new run.
- Never reverse a score to clear a gate; record the choice instead.

## 6. Where things are

| What | Where |
|---|---|
| Rules | `AGENTS.md` |
| Skills | `.agents/skills/` (atlas-figma-sync, atlas-verify, atlas-prototype, atlas-component) |
| Scripts | `scripts/atlas-sync.mjs`, `scripts/atlas-verify.mjs` |
| Benchmark runner, tasks, rubrics, pins | `benchmarks/` (`run.sh`, `tasks/T1-T4`, `rubric.md`, `rubric-component.md`, `phase-9/`) |
| Per-run metrics | `benchmarks/results/SUMMARY.md` |
| Run a benchmark | `benchmarks/run.sh <label> <task> <reps> <model>` |
