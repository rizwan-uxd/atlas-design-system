# Phase 9 proposal — benchmark and tighten the component workflow

Status: **approved** · revision 2 · 2026-09-13
All 7 review conditions (§R) are covered, and the four §12 decisions were approved on 2026-09-13.
Frozen harness: `d7967d7` · Phase 8 evidence: `816ff1c` (runs), `235ef87` (manual scores)

---

## R. Review conditions → where each is handled

| # | Condition | Resolution | Section |
|---|---|---|---|
| 1 | Is `cd029d2^` a fair baseline? | **No** (checked, see §4.1). The baseline is `d7967d7` with `atlas-component` removed (`no-skill`). | §4.1 |
| 2 | Pin everything alongside `d7967d7` | `benchmarks/phase-9/pins.json`. The runner refuses to spend if any pin mismatches. | §5A.2 |
| 3 | Fixture-validation gate | `validate-fixtures.mjs` runs once live against Figma, then before every run. Prompts are leak-checked. | §5A.3 |
| 4 | Task-aware rubric with a full-credit stop path | Anchored rubric in §8.2. T4 scores a correct stop on its own anchors. The "≥ harness-v2" criterion is removed. | §8.2 |
| 5 | Causal acceptance | Each of H1–H5 has one source signal and one primary metric. It is accepted only if the source reproduces in ≥2/3 v2 runs, the metric improves, and correctness does not regress. | §5B, §8.3 |
| 6 | Budget, hard cap, batch-stop | 18 core runs + 6 conditional regression runs + 2 replacement runs. **Hard cap $40.** | §7 |
| 7 | Keep the Phase 8 close-out separate | Separate commit on `main`. Benchmark sources are pinned worktrees, so main's close-out can't reach them. A path check proves it. | §5D |

---

## 1. Objective
Bring the `atlas-component` workflow (Figma → sync → code → companions → state → verify) up to the
evidence standard of `atlas-prototype`: a 3-run benchmark where correctness comes first. Then remove only the
waste that the benchmark shows is caused by the harness, without weakening Figma-first behaviour.

## 2. Problem and hypothesis
**Problem.** Phase 8 benchmarked the harness on prototype tasks only (T1, T2). The component workflow
has only two single-sample #7 runs (Switch `invalid`):
- Quality improved between the two runs.
- Effort stayed flat: 38 → 38 turns, $0.83 → $0.78.

Waste seen once in #7 run 2 (one sample, so not evidence yet):
- `atlas:sync` ran 3 times and verify ran twice.
- The agent opened Checkbox source/metadata and `Button.test.tsx`. `companions.md` both forbids this and
  points to `Button.test.tsx` as the pattern.
- Whole state files were read with `cat`.
- There is no written format for *adding* a discrepancy.

**Hypothesis.** The component workflow has the same kind of avoidable exploration that Phases 6–8 removed from
prototypes. Each suspected cause maps to one change, H1–H5 (§5B).

## 3. Why this is the next step
Unchanged from revision 1. The component workflow is unbenchmarked and it is where a wrong guess ships
into the library. Prototype efficiency is at diminishing returns: T1/T2 wasted exploration is 0 / 1.

## 4. Scope
1. Benchmark infrastructure: a component task type, pins, a fixture gate, runner guards and a component rubric.
2. Two component tasks, T3 and T4.
3. Runs: `no-skill` and `harness-v2` on T3/T4. Then `harness-v3` on T3/T4, plus T1/T2 only when §7 makes them mandatory.
4. Harness changes H1–H5, each accepted or rejected on its own evidence (§8.3).
5. Phase 8 close-out, in a separate non-functional commit (§5D).

### 4.1 Baseline validation (condition 1) — done, read-only
I compared `cd029d2^` with `d7967d7` for every input a T3/T4 run would see.

| Input | `cd029d2^` vs `d7967d7` | Affects T3/T4? |
|---|---|---|
| T3 fixture: Switch `figmaProperties.Size` = sm, md, lg; code `sizes` = sm, md | identical | — |
| T4 fixture: Badge Figma `Variant` has no `outline`; code has `outline` | identical | — |
| `scripts/atlas-verify.mjs` | 46 lines changed | **yes**: verify result and scope check |
| `.agents/skills/atlas-verify/` (SKILL + checks.md) | changed | **yes**: evaluator behaviour |
| `scripts/atlas-sync.mjs` | 95 lines changed | **yes**: T3 expects sync to close DISC-014 |
| `atlas/state/discrepancies.json` | DISC-028 absent | **yes**: Switch state differs |
| `atlas/state/decisions.json` | DEC-008 absent | minor |
| `Switch.tsx`, `atlas/metadata/Switch.json` | `invalid` prop absent | **yes**: T3 edits this file |
| `.agents/skills/atlas-prototype/` | absent | yes: skill listing, and context size |
| `benchmarks/analyze.mjs`, `run.sh` | older (no git base, no component metrics) | tooling; replaced either way |

**Verdict: `cd029d2^` is not a fair baseline.** The verifier, the sync generator and the Switch library state
all differ, so a gap would mix up "no skill" with "older verifier, older sync, different Switch".

**Replacement: `no-skill`.** This is the `d7967d7` tree with exactly one controlled difference, stored as
`benchmarks/phase-9/no-skill.patch` (hash pinned):
- `.agents/skills/atlas-component/` is deleted.
- The `atlas-component` row is removed from the AGENTS.md routing table, and its mention in the CLAUDE.md
  file map is removed. Without this, the agent would be routed to a skill that doesn't exist, and that
  measures a broken pointer, not the absence of a skill.
- All other rules stay: AGENTS.md Figma-first, `decisions.json`, `atlas-verify`, `atlas-figma-sync`. So
  `no-skill` measures what `atlas-component` adds on top of today's harness.

Before any run, `grep -r atlas-component` on the patched tree must return 0 hits.

`d7967d7` vs `main` (`235ef87`) outside `benchmarks/`: **0 files differ**, so `d7967d7` is also the current tree.

## 5. Proposed changes

### A. Benchmark infrastructure (`benchmarks/`)

#### A.1 Component task type
- `meta.json` gets `"type": "component"`, `component`, `tier`, `expectFigmaEdit`, `expectStop`,
  `allowedPaths`, `expectedCompanions`, `expectedStateChange`.
- Analyzer correctness metrics (the prototype metrics are unchanged):
  - component tests pass; `tsc` clean
  - final verify result; `verifiedAt` stamped or correctly not stamped
  - every changed file is inside `allowedPaths`
  - `use_figma` attempts; Figma edit proposed (manual check)
  - stopped before any variant/visual code change when `expectStop`
  - expected discrepancy closed or opened; no hand edit of generated `atlas/` files, detected by
    `atlas/` diff ≠ a sync re-run's output
- Analyzer effort and source metrics: the Phase 8 set, plus one column per H signal (§5B).
- Runner:
  - `--source <worktree>` builds the workspace from a pinned checkout, not `$ROOT`'s working tree (§5D).
  - `--disallowedTools mcp__figma__use_figma`.
  - Figma MCP reads are added to `--allowedTools` identically for every label.
  - `--max-turns 60`, for component tasks only. The highest observed was 41.
  - The existing stop-on-API-error guard stays, and the spend guard from §7 is added.

#### A.2 Pins (condition 2) — `benchmarks/phase-9/pins.json`
Written once, after the infra commit and before the first paid run.
`run.sh` checks every pin before each run and exits non-zero on any mismatch, without calling `claude`.

| Pin | Value recorded | Check |
|---|---|---|
| Harness commit | `d7967d7` + its tree hash | `git rev-parse <source>^{tree}` |
| `no-skill` patch | sha256 of `no-skill.patch` | patched tree hash |
| `harness-v3` | branch `bench/phase-9-v3` head + tree hash, set when v3 is frozen | tree hash |
| Component skill | tree hash of `.agents/skills/atlas-component` at `d7967d7` (v2); v3 hash when frozen | `git rev-parse` |
| Verifier | blob hashes: `scripts/atlas-verify.mjs`, `packages/governance/token-lint.mjs`; tree hash `.agents/skills/atlas-verify` | same in every label |
| Sync generator | blob `scripts/atlas-sync.mjs` (changes only if H1 is accepted, v3 only) | per label |
| Figma snapshot | blob hashes: `atlas/metadata/{Switch,Badge}.json`, `atlas/{Switch,Badge}.md`, `atlas/state/*.json`; `figmaVersion` `lib:Atlas Design System v1@2026-07-06T03:42:12Z` | per run |
| Live Figma | Switch and Badge component-set `figmaProperties`, read once through the MCP by the fixture gate, stored as JSON | re-read before the v3 batches; any change voids the phase |
| Library fixtures | tree hashes: `packages/ui-web/src/primitives/{Switch,Badge}`; blobs: `packages/figma-sync/code-connect/{Switch,Badge}.figma.tsx` and contracts | per run |
| Task fixtures | blob hashes: `benchmarks/tasks/{T3,T4}/{prompt.md,meta.json}`, `benchmarks/rubric-component.md` | per run |
| Tooling | blob hashes: `run.sh`, `analyze.mjs`, `summarize.mjs`, `validate-fixtures.mjs` | per run |
| Model | full model id (not the `sonnet` alias), taken from the first run's stream-json `init` | every run's `init.model` must match |
| CLI | `claude --version` = `2.1.270` | per run |
| Figma MCP | server name + sorted tool-name list hash, from `init` | per run |
| User context | sha256 of `~/.claude/CLAUDE.md`, sorted `~/.claude/skills` list, enabled plugins list | per run; these load into every session |

#### A.3 Fixture-validation gate (condition 3) — `benchmarks/phase-9/validate-fixtures.mjs`
**Live pass.** Runs once before the first batch and again before the v3 batches. It uses Figma MCP reads
outside any agent run and records the result in `pins.json`.

**Pre-run pass.** Runs on every workspace after `git commit "bench base"` and before `claude`. Any failure
exits without spending.

| Gate | T3 — Switch `lg` | T4 — Badge `outline` |
|---|---|---|
| Live Figma | Switch set has `Size=lg` variants | Badge `Variant` values exclude `outline`, and no other Badge property carries an outline/appearance value |
| Approved in Figma | `atlas/metadata/Switch.json` `source` = `figma-synced`, `syncedAt` non-null; `figmaProperties.Size` includes `lg`; no provisional decision names Switch | Badge `figmaProperties.Variant` excludes `outline`; no decision approves `outline` |
| Missing in code | metadata `sizes` excludes `lg`; `SwitchSize` union in `Switch.tsx` excludes `'lg'`; Code Connect and contract have no `lg` | `BadgeVariant` includes `'outline'`; ≥1 call site uses it (count recorded) |
| State | DISC-014 exists and is `open` | DISC-006 and DISC-016 exist and are `open`; DEC-002 text unchanged |
| Isolation | DISC-028 untouched by the fixture; the `no-skill` tree has 0 `atlas-component` hits | same |

**Prompt leak check**, on both prompts, for every label:
- The prompt text must not contain any of: `outline`, `neutral`, `primary`, `already`, `missing`,
  `stop`, `ask`, `approve`, `DISC-`, `DEC-`, `metadata`, `atlas/`, `packages/`, `.figma.tsx`, `Code Connect`.
- The prompt must not contain any expected-outcome words.
- `validate-fixtures.mjs` greps for these; the list is part of the pinned file.

**Revised prompts.** The revision 1 wording leaked the fixture: "…so it matches Figma" says Figma already
has it. The proposed prompts are below; their wording needs your approval (§12).
- **T3:** "Add an lg size to the Switch component."
- **T4:** "Bring Badge's variants in line with the design system."

#### A.4 Component rubric
The rubric is `benchmarks/rubric-component.md`, as defined in §8.2. The prototype rubric is untouched.

### B. Harness hypotheses — each with a source signal and a primary metric

| # | Change | Source signal (per run) | Primary metric | Kind | Files |
|---|---|---|---|---|---|
| H1 | Sync writes each component's open discrepancy rows and linked decision ids into `atlas/metadata/<Name>.json`; step 1 reads that instead of whole state files | Any read (Read or Bash) of `atlas/state/discrepancies.json` or `decisions.json` | Number of whole-state-file reads | Generator | `scripts/atlas-sync.mjs`, `atlas/metadata/*.json`, skill step 1 |
| H2 | `companions.md` carries a minimal test skeleton; the `Button.test.tsx` pointer is removed | Any open of a `*.test.tsx` outside the target component | Other components' test files opened | Skill text | `atlas-component/references/companions.md` |
| H3 | Sync runs once after the Figma decision and once after companions, never between code edits | `atlas:sync` count > 2 (T3) or > 1 (T4) | Sync runs | Skill text | `atlas-component/SKILL.md` body |
| H4 | An "open a new discrepancy" row with the entry format | A new/edited discrepancy row missing a required field (schema = existing DISC-028 fields), or a hand edit of a generated field | Invalid discrepancy writes | Skill text | `companions.md` |
| H5 | Comparing with another component's implementation is out of scope; compare against `figmaProperties` only | Any open of another component's `.tsx`/`.css`/metadata/`.md` (tests excluded, counted by H2) | Other components' non-test files opened | Skill text | `figma-first.md` |

- The signals don't overlap, so each metric can be attributed to one change even though v3 carries all accepted changes together.
- A hypothesis whose source doesn't reproduce is not implemented.
- If no source reproduces, there is no v3. The phase then closes with the infrastructure and baselines.

### C. Tasks (fixture facts checked 2026-09-13; re-checked by the gate)
- **T3 — Switch `lg`.** Figma `Size` = sm, md, lg; code = sm, md; DISC-014 open.
  - Expected: no Figma edit; code, Code Connect, contract, tests; sync closes DISC-014; verify stamped.
  - Out of bounds: DISC-028 `invalid`. DISC-004 may stay open because it also covers the on/off Variant.
- **T4 — Badge variants.** Figma `Variant` = neutral, primary, success, warning, danger, info. Code adds
  `outline` and uses `default`/`secondary`, which Code Connect already maps to neutral/primary. DISC-006, 015 and 016 are open.
  - `outline` has no Figma home. DEC-002 says to add it to Figma, but *how* is itself an open decision:
    a `Variant` value, or a separate property (DISC-006 calls it "a style folded into variant"; see DEC-003).
  - **Expected: stop before any Badge variant code change.** Name the outline decision and propose the
    exact Figma edit(s). List the follow-up renames (default→neutral, secondary→primary, justified by DEC-002 + Code
    Connect) with their call sites. Make no Figma write.
  - Why renaming first is not the expected path: the `BadgeVariant` union would be changed twice, and call sites
    migrated before the outline shape is known. This expectation is a benchmark decision for you to approve (§12).

### D. Phase 8 close-out (condition 7)
**Commit:** `chore(phase-8): close-out — archive stale docs, retire ai-workflows skill, update claude.md and plan`
- on `main`, before the infra commit, with no functional change
- the proposal file is committed with it or separately — it must not stay untracked

**What it may touch:** `docs/**` (archive moves, plan's Phase 8 entry, this proposal), `CLAUDE.md`,
`packages/ai-workflows/**`, `benchmarks/results/SUMMARY.md` (narrative section only). Removing the leftover
`harness-test-proto4` worktree is a git worktree operation, not a file in the commit.

**Why it can't change benchmark inputs:**
1. Every run's source is a pinned worktree: `d7967d7` (v2), `d7967d7` + `no-skill.patch` (no-skill),
   and `bench/phase-9-v3` = `d7967d7` + accepted H commits only, cherry-picked (v3).
   - No label is built from `main`'s working tree.
   - This also stops untracked files, such as this proposal today, being copied into workspaces, which the
     current `run.sh` rsync does.
2. Path check, recorded in the close-out report:
   `git diff --name-only <close-out>^ <close-out>` ∩ {`AGENTS.md`, `.agents/**`, `.claude/**`, `atlas/**`,
   `scripts/**`, `packages/ui-web/**`, `packages/figma-sync/**`, `packages/governance/**`, `packages/tokens/**`,
   `app/**`, `benchmarks/tasks/**`, `benchmarks/*.mjs`, `benchmarks/run.sh`} = ∅.
3. Tree check: `git diff --name-only d7967d7 bench/phase-9-v3` ⊆ the union of accepted-H paths from §5B.
   The v3 tree therefore contains no close-out change. Its CLAUDE.md stays at the `d7967d7` text on purpose,
   the same in every label.
4. `pins.json` tree hashes for v2 and no-skill are computed from `d7967d7`. If the close-out leaked,
   they would not match.

## 6. What stays unchanged
- `atlas-prototype`, `atlas-verify`, `atlas-figma-sync` skill text; the prototype rubric; T1/T2 prompts and `meta.json`
- The verifier (pinned, §5A.2); Phase 8 analyzer metric definitions
- Library, tokens and Figma: no writes outside benchmark workspaces; nothing from workspaces is merged
- Method: 3 runs, mean (min–max), correctness before effort; manual rubric on the median run
  (Phase 8 definition); freeze before benchmarking; no fixes during a benchmark

## 7. Runs, budget and spend control (condition 6)

| Order | Batch | Source | Runs | Required |
|---|---|---|---|---|
| 0 | Fixture gate (live) | — | 0 agent runs | yes |
| 1 | `harness-v2` T3 | `d7967d7` | 3 | core |
| 2 | `harness-v2` T4 | `d7967d7` | 3 | core |
| 3 | `no-skill` T3 | `d7967d7` + patch | 3 | core |
| 4 | `no-skill` T4 | `d7967d7` + patch | 3 | core |
| — | *Freeze v3: implement accepted H's, re-run the live fixture gate* | | | |
| 5 | `harness-v3` T3 | `bench/phase-9-v3` | 3 | core (skipped if no H reproduces) |
| 6 | `harness-v3` T4 | `bench/phase-9-v3` | 3 | core (skipped if no H reproduces) |
| 7 | `harness-v3` T1 | `bench/phase-9-v3` | 3 | **mandatory if** any accepted change touches a path outside `.agents/skills/atlas-component/references/**` or the SKILL.md *body*. That includes H1 and any SKILL.md frontmatter/description change, because descriptions load into every session. |
| 8 | `harness-v3` T2 | `bench/phase-9-v3` | 3 | same rule |

v2 runs first because v2 decides which H's reproduce. If v2 fails a correctness gate (e.g. T4 doesn't stop),
H work stops and I report back: a correctness failure outranks effort.

**Cost basis.**
- Component runs: #7 cost $0.83 / $0.78, plus a margin for Figma MCP reads. That gives $1.00 expected and $1.50 worst.
- T1 and T2 use their Phase 8 harness-v2 max ($0.97 / $0.58) × 1.3.

| Line | Runs | Expected | Worst case |
|---|---|---|---|
| Core T3/T4 (v2, no-skill, v3) | 18 | $18.00 | $27.00 |
| Mandatory T1/T2 regression | 6 | $3.87 | $6.03 |
| Replacement runs (infrastructure failures only) | ≤ 2 | $0 | $3.00 |
| Live fixture gate + pin capture (MCP reads, interactive session) | — | ~$1 | $2.00 |
| **Total** | **≤ 26** | **~$23** | **$38.03** |

**Hard cap: $40.00.** This is the total of `total_cost_usd` over all Phase 9 run jsonl files, plus logged
interactive gate cost. `run.sh` reads the running total from `benchmarks/results/phase-9-spend.json`, which is appended
after every run.

**Batch-stop rules:**
1. **Before a batch:** start only if `spent + 3 × ceiling ≤ $40`, where `ceiling` = max($1.50, the highest observed
   single-run cost for that task). Otherwise stop and report; don't start a partial batch.
2. **During a batch, stop immediately if:**
   - a run costs more than $2.50
   - an API or spend-limit error occurs (existing guard)
   - a pin or fixture-gate mismatch is found
   - there is a max-turns exit
   - a run makes ≥ 3 denied `use_figma` attempts (an approval loop)
3. **After a stop:**
   - Agent-behaviour stops (max-turns, approval loop) keep the run as a failed result and are never re-run.
     I report before continuing.
   - Only infrastructure stops (API error, spend limit, pin mismatch caused by tooling) may use the 2
     replacement runs. A batch with a replaced run is flagged in `SUMMARY.md`.
4. **Priority if the cap binds:** batches 3–4 (`no-skill`) are dropped first; they are descriptive, not used
   for acceptance. v2 and v3 T3/T4, and any mandatory regression, are never dropped in favour of them.
5. The cap is never raised mid-phase without your approval.

## 8. Success metrics and acceptance

### 8.1 Correctness gates (per run; must hold 3/3 in the label being accepted)

| Gate | T3 — Switch `lg` | T4 — Badge variants |
|---|---|---|
| Figma writes | 0 `use_figma` attempts | 0 `use_figma` attempts |
| Figma decision | States that no Figma edit is needed; doesn't stop | Stops before any change to `BadgeVariant`, Badge source, call sites or companions; names the outline decision |
| Tests / tsc | Switch tests pass (including a new `lg` test) / 0 errors | Unchanged from base: pass / 0 |
| Final verify | pass + `verifiedAt` stamped | not stamped; verify not failing on files the run touched |
| Scope | changes ⊆ `allowedPaths` (Switch dir, its Code Connect, contract, sync output, state rows); DISC-028 untouched | changes ⊆ state rows only; `outline` present |
| State | DISC-014 closed by sync (not a hand edit); `status.json` Switch row consistent | discrepancy added/updated in valid format, or existing DISC-006/016 annotated; no hand edit of generated `atlas/` |

### 8.2 Component rubric (condition 4) — 4 criteria × 1–5 = /20
- The anchors are fixed below. A score of 2 or 4 means "between anchors" and needs a one-line note.
- The scorer scores criteria B–D from the workspace diff and final report with the label hidden. Criterion A needs
  the transcript order, so it can't be blind.

**A. Figma-first judgement**

| Score | T3 | T4 |
|---|---|---|
| 5 | Checks Figma `Size` before editing code; states `lg` is already approved so no Figma edit; takes `lg` dimensions from Figma/tokens, invents none | Stops before any variant code change; says `outline` has no Figma value; proposes the exact Figma edit(s) and names the shape decision (Variant value vs separate property) instead of silently picking one |
| 3 | Right decision, but only checked Figma after starting code; or suggests an unnecessary Figma edit without stopping | Stops, but the proposal is vague (no property/values), or picks the outline shape without naming it as a decision |
| 1 | Stops for a Figma decision that isn't needed, attempts a Figma write, or invents `lg` values | Doesn't stop, renames or deletes `outline`, or attempts a Figma write |

**B. Code quality and states** (T3) / **Restraint** (T4 stop path)

| Score | T3 | T4 |
|---|---|---|
| 5 | `lg` uses the existing size mechanism; semantic tokens only; hover, focus-visible, active and disabled correct at `lg`; logical properties; reduced motion intact; no drive-by edits | Zero edits to Badge source, call sites, companions or Figma; only permitted state writes |
| 3 | Works, with one hardcoded length, one state missing at `lg`, or one drive-by edit | A harmless non-variant edit (e.g. a comment), or an exploratory edit fully reverted before the end |
| 1 | tsc/test failures, several hardcoded values, or DISC-028 touched | Any variant code change |

**C. Companions** (T3) / **Change plan** (T4 stop path)

| Score | T3 | T4 |
|---|---|---|
| 5 | Code Connect maps `lg`; contract updated; an `lg` test written to the skill's pattern; all pass | Lists the follow-up work once approved: renames with the call-site files, outline handling for both decision options, Code Connect, contract, tests, and which of DISC-006/015/016 each closes |
| 3 | One companion missing or the test is superficial | Follow-up listed, but call sites or companions are missing |
| 1 | Two or more companions missing | No follow-up plan |

**D. State and reporting accuracy** (both tasks)

| Score | Anchor |
|---|---|
| 5 | State changes follow the skill format; every claim in the final report can be checked in the workspace; unresolved items (e.g. DISC-004/028, outline decision) are named |
| 3 | One inaccurate claim or one unresolved item omitted |
| 1 | Claims done/passing when it isn't, or hand-edits generated `atlas/` |

A correct T4 stop can score 20/20: every T4 anchor at 5 describes the stop path, and nothing rewards
writing code.

### 8.3 Causal acceptance (condition 5) — replaces the "three effort targets" rule
Each H1–H5 is decided on its own:
1. **Reproduce.** The source signal (§5B) appears in ≥ 2 of 3 `harness-v2` runs of T3, or in ≥ 2 of 3 of T4.
   Otherwise the change is not implemented.
2. **Improve.** In `harness-v3`, on the task(s) where it reproduced:
   - the primary metric's mean is lower than in v2, and
   - the source signal appears in ≤ 1 of 3 runs.
3. **No correctness regression.** All of the following must hold:
   - every §8.1 gate holds 3/3 on both T3 and T4 in v3, including gates the change isn't aimed at
   - no rubric criterion on the v3 median run scores lower than on the v2 median run for the same task
   - if the §7 regression is mandatory: T1/T2 v3 keep Phase 8 harness-v2 correctness (completed 3/3,
     coverage per run ≥ v2's minimum, lint/tsc/raw elements 0, final verify ok 3/3) and T1/T2 manual scores ≥ 16

**Outcomes:**
- **Accepted:** the change stays on the branch and is merged as its own commit.
- **Rejected:** the commit is dropped from the merge, and the phase report says v3 was measured with it included.
  - Rejecting a skill-text change needs no re-run, because the other signals are disjoint.
  - Rejecting H1 needs a check that `atlas:sync` on the final tree reproduces `d7967d7`'s `atlas/`
    byte-for-byte.
- **Any regression in step 3 that can't be attributed to one change** rejects every change it touches.

Turns, cost, cache read and context tokens are reported (mean, min–max) but **do not decide acceptance**.

## 9. Risks
- **Weaker stops.** Fewer turns could come from skipping Figma-first. The T4 stop gate (3/3) and rubric A catch this.
- **H1 changes prototype inputs**, so a T1/T2 regression becomes mandatory under §7. Idempotency: a second sync writes 0 files.
- **No-skill may not finish.** It is a descriptive baseline and is not used for acceptance, so this doesn't block the phase.
- **Headless approval loop.** `use_figma` is denied. The batch stops at ≥ 3 denied attempts (§7).
- **Figma drift mid-phase.** The live gate re-runs before v3; any change voids the v2/v3 comparison.
- **Variance.** A single outlier can't pass "≤ 1 of 3 runs" and a lower mean together on its own. Ranges are reported.
- **Model alias drift.** The full model id is pinned, and a mismatch stops the run.

## 10. Out of scope
Unchanged from revision 1:
- T1 invalid state / T2 hardcoded avatar
- verifier template-literal and Dialog-placement gaps
- Avatar/ListRow promotion
- DISC-028, Tabs `enclosed`→`segmented`, Checkbox `invalid`
- Dialog overlay; Switch contrast
- React Native, new tokens and components, any Figma edit, pushing
- prototype rubric and T1/T2 `meta.json`

## 11. Commits
1. `chore(phase-8): close-out …`: non-functional, path check in the message body (§5D)
2. `bench(phase-9): component task type, pins, fixture gate, runner source/guards, spend cap, component rubric`
3. `bench(phase-9): T3 switch-lg and T4 badge-variants tasks + no-skill patch`
4. `bench(phase-9): pins.json + live fixture gate result`
5. `bench(phase-9): harness-v2 and no-skill T3/T4 × 3 + manual scores + reproduction table`
6. One commit per implemented H on `bench/phase-9-v3`
7. `bench(phase-9): harness-v3 T3/T4 × 3 (+ T1/T2 × 3 if mandatory) + manual scores + acceptance table`
8. Merge the accepted H commits only; `docs(phase-9): results in SUMMARY.md, plan and claude.md`

## 12. Decisions needed from you before implementation
1. Approve `no-skill` (`d7967d7` − `atlas-component` skill, routing row and file-map line) as the baseline.
2. Approve the revised prompts: T3 "Add an lg size to the Switch component."; T4 "Bring Badge's variants in
   line with the design system."
3. Approve the T4 expectation: stop before *any* variant code change, renames included (§5C).
4. Approve the rubric anchors in §8.2 and the $40 hard cap with the §7 stop rules.
