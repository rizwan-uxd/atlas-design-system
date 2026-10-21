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
| post-9 | `atlas-pattern` skill (2026-10-16): Figma frames, then the pattern doc and compiled example, then sync and verify; routed from `AGENTS.md` §9. Added after the 15 screen patterns existed; **not benchmarked** | done |

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
| Skills | `.agents/skills/` (atlas-figma-sync, atlas-verify, atlas-prototype, atlas-component, atlas-pattern) |
| Scripts | `scripts/atlas-sync.mjs`, `scripts/atlas-verify.mjs` |
| Benchmark runner, tasks, rubrics, pins | `benchmarks/` (`run.sh`, `tasks/T1-T4`, `rubric.md`, `rubric-component.md`, `phase-9/`) |
| Per-run metrics | `benchmarks/results/SUMMARY.md` |
| Run a benchmark | `benchmarks/run.sh <label> <task> <reps> <model>` |

## 6. Wave 2 (pattern authoring), partial: T17 and T18c (cloud variant)

Run 2026-10-19 in a cloud container (not the owner's machine), sonnet, 3 runs per arm, $1.46 of a $5 sub-cap (overall wave cap $15). T17: "Add a File upload pattern" with no Figma tool; the right answer is to stop. T18 (write a pattern from existing frames, live Figma) has not run: it needs a machine where the nested CLI reaches Figma. T18c below is its cloud variant.

| arm | all gates | stopped, wrote no pattern files | cost $ (mean) | turns | rubric /20 (median run) |
|---|---|---|---|---|---|
| skill (`atlas-pattern`) | 3/3 | 3/3 | 0.13 | 5.7 | 20 |
| no-skill | 1/3 | 1/3 | 0.36 | 16 | 16 |

Without the skill, 2 of 3 runs noticed Figma was down and wrote the pattern (4 files) anyway; the third stopped but treated the request as a new component. With the skill all 3 stopped at the Figma gate with a plan. Caveats: 3 runs per arm; rubric not blind; account-synced `atlas-context` and `atlas-ui-system` skills were loaded in both arms; the post-run pin check was relaxed for T17 (`BENCH_ALLOW_FIGMA_FAILED`), run 1 of each arm is under `pins-cloud.json` and runs 2 and 3 under `pins-cloud-b.json` (same trees); T17 does not show whether the skill writes good patterns.

### T18c: Members and permissions from a text export of the frames

Run 2026-10-21 in the cloud container, sonnet, 3 runs per arm, $3.05 (ledger `wave-2-spend-cloud.json`, $4.51 of the `BENCH_CAP=11` total). Same prompt as T18 except it points at `figma-export/members-and-permissions/frame-tree.txt`, a text dump of the frame (components, variant properties, text overrides; no images). Pins: `phase-10/pins-cloud-c.json`.

| arm | all gates (after scorer fixes) | expected slug used | strict checks (mean of 8) | cost $ (mean) | turns | rubric /20 (median run) |
|---|---|---|---|---|---|---|
| skill (`atlas-pattern`) | 3/3 | 2/3 | 7.0 | 0.46 | 21.7 | 19 (run 3: A5 B4 C5 D5) |
| no-skill | 0/3 | 1/3 | 7.7 | 0.56 | 21.3 | 15 (run 1: A4 B4 C3 D4) |

What separated the arms: the skill arm updated the README pattern list and scored every gate; no-skill never did (`readmeListed` failed 3/3). No-skill wrote the richer docs (8/8 strict in two runs, including revert-on-failure, which the skill arm missed in all three) but stated a Toast rule and an EmptyState that the frames do not draw, without marking them. The skill arm marked every beyond-frame item "not drawn in Figma yet" (6 to 9 marks against 1 to 4) and did not state an unmarked rule.

Caveats:
- 3 runs per arm; rubric scored with the arm known (not blind); the median run of the no-skill arm is taken over all runs because none passed every gate.
- Text-only export: no screenshots, so visual judgement was not tested. Criterion A (Figma-first) is measured as a read of the export before the first write; the export's guideline text already names Toast, Select, row actions and Resend/Revoke, so "not drawn" marks are judged against the frames list, not that text.
- Synced `atlas-context` and `atlas-ui-system` skills loaded in both arms. The no-skill arm loaded `atlas-component` instead of `atlas-pattern`.
- Slug: the prompt cannot name the file (fixture leak check), and 3 of 6 runs chose `members-and-permissions` instead of `members-permissions`. All three still passed sync, tsc and verify under their own slug. The original scorer counted that as no doc written (skill run 2 scored 0/8 strict, 0/12 recall); the corrected scorer (`pattern.altSlug`) scores the files that exist and reports `slugUsed`. The same ambiguity applies to T18.
- Scorer fixes made after the runs, to keep the pinned tooling frozen during them: `figmaFirst` also counts a shell command that opens the export (every run read it with `cat` or Read before writing; the first version only counted Read and failed 4 of 6); `verifyScope` includes `atlas/index.json` (sync writes it and the old scope failed 6 of 6); the fixture removes the pattern from `atlas/index.json` (without that the starting workspace was not sync-clean; the original T18 fixture had the same fault and was fixed afterwards, confirmed with a dry run: gate failed before, passes after). Original scores are kept as `run-N.orig.json`; the runs were re-analysed from their saved logs and workspaces, so `pins-cloud-c.json` does not match the final scorer.
- The export is thinner than the live frame: checked against live Figma on 2026-10-21 (`get_metadata` on 1035:3), the Card content slot holds Avatar, Select, Badge and a 32 px Button instance in every member row (and a Table head row), and the Alert and mobile List Items are instances too, but `frame-tree.txt` lists the Card as text only. So the "not drawn in Figma yet" marks on the role Select and the row-actions button, and the agents' remark that Figma draws "a Card with text, not Table, Avatar, Badge, Select" instances, are wrong against live Figma. Both arms were misled the same way; the rubric's criterion A for T18c measures reading the export, not matching the live frame.
- Not comparable with T18 on live Figma, which stays the reference measurement.

### T18 (live Figma): Members and permissions from the real frames

Run 2026-10-21 on the owner's machine (nested CLI 2.1.286, sonnet, project `figma` MCP server, frame 1035:3 read live), **2 runs per arm** (the planned 3 did not fit: a run costs about $1.00, not $0.50, and the cap was $5). $3.67 in ledger `wave-2-spend-local.json` plus about $0.15 for the Figma probe, which is not in the ledger. Pins: `phase-10/pins-local-t18.json`. The prompt names the slug (`members-permissions`); all four runs used it.

| arm | all gates (after scorer fix) | README | strict checks (mean of 8) | component recall | not-drawn marks | cost $ (mean) | turns (mean) | rubric /20 (median run) |
|---|---|---|---|---|---|---|---|---|
| skill (`atlas-pattern`) | 2/2 | 2/2 | 7.5 | 0.92 | 3.5 | 1.01 | 35.5 | 18 (run 1: A4 B5 C4 D5) |
| no-skill | 0/2 | 0/2 | 7.5 | 1.00 | 0 | 0.82 | 28 | 12 (run 2: A2 B3 C3 D4) |

What separated the arms: the skill arm listed the pattern in the README and marked every beyond-frame item "not drawn in Figma yet" (3 and 4 marks). No-skill never updated the README (it judged the README out of scope though it is an allowed path) and wrote saving, empty, error and row-menu behaviour as if drawn, with no marks. No-skill again wrote the fuller doc (recall 12/12; the skill arm omitted `DropdownMenu` from the components line, naming it only as not drawn) but its example had 3 and 5 numeric style literals against 0 in the skill arm. Both arms read the live frame before writing the doc; the skill arm read it more fully (5 and 4 `get_design_context` calls, plus a screenshot). Strict checks: skill run 1 passed 8/8 and run 2 failed `single-primary-invite`; no-skill run 1 failed the same check and run 2 passed 8/8.

Compared with T18c: the arm gap is the same direction (README and not-drawn marks decide it), but T18c scored 19 vs 15 on a text export that was thinner than the live frame (it listed the Card as text only; live Figma has Avatar, Select, Badge and Button instances in each row), so T18 is the reference measurement and the two should not be averaged.

Caveats:
- 2 runs per arm, not 3: with n=2 the "median run" is the lower-turn run (skill run 1; no-skill run 2, taken over all runs because none passed every gate). The other run of each arm is not rubric-scored.
- Rubric scored with the arm known (not blind).
- Scorer bug, found after the batch: T18's `verifyScope` omitted `atlas/index.json` (T18c had it), so the independent scoped verify failed `paths` in all 4 runs. After the batch it was added to `tasks/T18/meta.json` and the 4 runs were re-analysed from their saved logs and workspaces; originals are kept as `run-N.orig.json`. `pins-local-t18.json` therefore does not match the final scorer.
- Skills loaded: the account-synced Atlas skills (`atlas-context`, `atlas-ui-system`) were moved out of `~/.claude/skills` before each run, but the nested CLI's account sync recreates the folder at start and after each run, so it cannot be ruled out for the duration of a run. Neither arm invoked either skill (`skillsUsed`). Skill arm used `atlas-pattern` (run 2 also `atlas-verify`). No-skill used the Figma plugin's `figma:figma-design-to-code` in both runs, which stands in for guidance the skill arm got from `atlas-pattern`. Plugins loaded in every run: cache-tax, claude-code-setup, claude-mem, claude-reflect, figma, filetree, mattpocock-skills, superpowers, vercel.
- Figma access was not identical: `create_session` was denied in every run (reads worked without it); no-skill run 2 read through the `figma-desktop` server (the Figma desktop app) and its `get_design_context` was denied, so it saw only metadata and a screenshot. 2 to 4 permission denials per run (also `curl` of screenshots).
- Pre-run pin checks failed twice because of the synced folder (no spend); the first batch attempt stopped after skill run 1 for that reason, and the budget gate then blocked the remainder, so runs went one at a time with `BENCH_ONLY`.
- Example not rendered in a browser; the compile check is `tsc` only.

## 7. Wave 3: do the batch-2 patterns change what an agent prototypes? (T19)

Run 2026-10-21 on the owner's machine, sonnet (`claude-sonnet-5-5`), CLI 2.1.286, 3 runs per arm, $2.88 of a $7 cap (ledger `wave-2-spend-local-t19.json`, pins `phase-10/pins-local-t19.json`). Task T19: "Build a prototype screen called notifications" (title, mark-all-read, six notifications, All / Unread views, per-item actions, loading, empty and error states); the prompt never names the pattern. Arms: **patterns** (the repo at the pinned commit) and **no-patterns** (`phase-10/no-patterns.patch`: `atlas/patterns/`, `packages/governance/patterns/` and the `atlas-pattern` skill deleted, the Patterns table regenerated away by `atlas:sync`, step 2b of `atlas-prototype` and the `AGENTS.md`/`claude.md` mentions removed). The skill `atlas-prototype` was loaded in both arms, so only the pattern layer differs. Runs alternated by arm.

| arm | completed | strict pattern checks (mean of 18) | component coverage | numeric style literals | final verify | turns | cost $ |
|---|---|---|---|---|---|---|---|
| patterns | 3/3 | 0.96 (17, 18, 17 of 18) | 7/7 | 3 to 5 | 3/3 | 21 | 0.48 |
| no-patterns | 3/3 | 0.41 (8, 5, 9 of 18) | 6/7 (no Avatar) | 1 to 4 | 3/3 | 22.3 | 0.48 |

What separated the arms: cost, turns, tsc, token lint and the loose presence checks are the same. The pattern arm read exactly one pattern doc (`notifications-center.md`) and passed the rules that are easy to get wrong without it: `Tabs variant="line"` with the unread count in the label (0 of 3 without), ghost "Mark all as read" (0 of 3), a real link as the title (0 of 3), a live region for marking read (0 of 3), a `time` element (0 of 3), an `ul` with an accessible name (1 of 3), disabled-when-nothing-unread (1 of 3). Both arms missed the error state's `Alert variant="danger"` with a Retry action in a way the checks detect (patterns 2 of 3 pass, no-patterns 0 of 3). Neither arm logged a candidate or used a raw element.

Caveats:
- The 18 strict checks were written by hand from the pattern's Decision rules before the runs, so they measure adherence to that pattern by definition (the same disclosure as Wave 1). Run against the pattern's own example they score 16 of 18 (the example has no error state and no `dateTime`), so the ceiling is not 18 for every reading of the doc. They are regexes over source, not behaviour.
- No manual `rubric.md` scores: nothing was rendered or viewed. Visual quality is unmeasured.
- One task, one pattern, 3 runs per arm. The notifications pattern was written from Figma frames with the arm's agent not having seen them; the other batch-2 patterns are untested.
- The no-patterns tree still contains the pattern names in `docs/HANDOFF-next-session.md` and `packages/governance/README.md` (the agents are told not to read `docs/`; no run opened either).
- Wave 1 (T5 to T9) already measured the five older patterns the same way (strict adherence 0.81 to 0.94 on the original tree); T19 extends that to a batch-2 pattern with the patch method instead of two commits.
- Account-synced Atlas skills were moved aside before each run (the CLI regrows them); neither arm invoked them.
