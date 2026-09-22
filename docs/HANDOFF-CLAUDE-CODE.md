# Atlas AI upgrade — Claude Code handoff

A fresh Claude Code session knows nothing about the decisions behind this work. Each phase below gives it exactly what it needs: paste the prompt, nothing else. Plan: `docs/ATLAS-AI-UPGRADE-PLAN.md`. Audit: `docs/audits/FIGMA-CODE-PARITY.md`.

## Setup (once)

1. **Figma MCP** — `.mcp.json` is committed with Figma's remote server (`https://mcp.figma.com/mcp`). On first launch Claude Code asks to approve the project server, then Figma asks you to sign in.
   *Alternative:* run the Figma desktop app with the Dev Mode MCP server enabled and point the config at its local URL instead. Use whichever your Figma plan and setup allow — only phases 2F/3/5 need it.
   Verify with: `claude mcp list`, or ask a session "list the pages in the Atlas Figma file".
2. **Run the Phase 0 baseline before anything else.** Once the repo changes, a clean "before" number is gone.
3. Pick one model for the benchmark and keep it for the "after" runs.

## Phase order
`0 → 1 → 2F (here, Figma) → 2C → 3 (here, Figma) → 4 → 5 → 6 → 7 → 8 → 9 (closed)`
"here" = the Cowork session with Figma access. Everything else runs in Claude Code.

---

## Phase 0 — Baseline
Terminal, not a prompt:
```bash
benchmarks/run.sh baseline T1 3 <model>
benchmarks/run.sh baseline T2 3 <model>
```
Then score one run per task with `benchmarks/rubric.md` → `benchmarks/results/baseline/<task>/manual.json`.
**Done when** `benchmarks/results/SUMMARY.md` has both baseline rows.

---

## Phase 1 — Harness rules
```
Read docs/ATLAS-AI-UPGRADE-PLAN.md, then rewrite AGENTS.md as the Atlas harness rules file.

It must define, in under 120 lines: source of truth (Figma leads, atlas/ snapshot is a cache, escalate to Figma only when the snapshot is missing a field or stale); context priority order; the tool-selection rule (understand → identify context → minimum tools → execute → verify); task boundaries (no working ahead, no unrelated refactors, no new components or tokens); the execution loop (parse, scope, retrieve, plan, execute, verify, correct, report); the uncertainty rule (never invent a design-system rule — resolve via state, references, code, then Figma; otherwise stop and name the missing decision); token rules; and a routing table of task type → skill.

Keep the existing Next.js rules block at the top. Then shrink claude.md to current project state only, with no rules, and make CLAUDE.md a pointer to AGENTS.md.

Do not create skills or the atlas/ folder in this phase.
```
**Done when** AGENTS.md covers all eight areas, no rule is duplicated in claude.md, and nothing else changed.

---

## Phase 2C — Parity: the code half
Run only after the Figma side of a component is done. One component per session.
```
Read the resolution table in docs/audits/FIGMA-CODE-PARITY.md, then align the <Component> code to Figma.

Update: packages/ui-web/src/**/<Component>.tsx (exported types + CVA), packages/figma-sync/code-connect/<Component>.figma.tsx, packages/governance/contracts/<Component>.contract.ts if present, tests, and every call site under app/.

Constraints: Figma's names win. Do not rename anything not in the table, do not add variants, do not refactor neighbouring components.

Finish with: npm run token-lint, npx tsc --noEmit, npm test — and a list of every file you changed.
```
**Done when** the three checks pass and the diff touches only that component plus its call sites.

---

## Phase 4 — Snapshot + state layer
```
Read docs/ATLAS-AI-UPGRADE-PLAN.md (phase 4), then create the generated-context layer under atlas/.

Structure: atlas/index.md (one line per component: purpose, import path, variants), atlas/metadata/<Name>.json (variants, sizes, props, tokens used, figma node id, syncedAt, figmaVersion), atlas/<Name>.md (when to use, when not to, do/don't), atlas/tokens.json + atlas/tokens.md (semantic tokens only), atlas/state/{status,discrepancies,decisions,candidates}.json.

For now, populate from the repo — the exported types, the Code Connect files and the audit doc — and mark every file syncedAt: null, source: "repo-derived", so phase 5 can replace it from Figma. Seed state/discrepancies.json from the audit's resolution table and state/status.json with per-component parity, metadata, code and verified-at fields.

Every generated file starts with a "GENERATED — do not hand-edit" line. Add atlas/README.md explaining the layer in under 20 lines. Keep each component file under 2.5 KB.
```
**Done when** the tree exists, files are within budget, and nothing outside `atlas/` changed.

---

## Phase 5 — Sync skill
```
Create the atlas-figma-sync skill at .agents/skills/atlas-figma-sync/ (SKILL.md + references/), and symlink .claude/skills → .agents/skills.

It pulls the Atlas Figma file (key cKYhfaHLCoyMHi9nKr63Ig) through the Figma MCP, regenerates atlas/metadata/*.json, atlas/<Name>.md and atlas/tokens.*, stamps syncedAt and the Figma file version, diffs Figma against the exported types in packages/ui-web/src, and writes any drift to atlas/state/discrepancies.json. It never writes to Figma.

The SKILL.md body stays under 100 lines; put the field mapping and the JSON shape in references/.
```
**Done when** a run regenerates `atlas/` with real `syncedAt` values and reports drift.

---

## Phase 6 — Verify skill + script
```
Create scripts/atlas-verify.mjs and the atlas-verify skill.

Three groups of checks. Design: variants, sizes and tokens used in the changed files against atlas/metadata/<Name>.json, flagging stale snapshots. Code: token-lint, tsc, tests, Atlas component usage, no raw HTML controls, basic a11y attributes. Scope: git diff touches only intended paths, no new tokens or components.

Reuse the check logic already in benchmarks/analyze.mjs rather than rewriting it. Output a pass/fail line per check plus the mismatches, and exit non-zero on failure.
```
**Done when** it passes on a clean tree and fails on a deliberately broken prototype.

---

## Phase 7 — Task skills
```
Create two skills under .agents/skills/: atlas-prototype and atlas-component.

atlas-prototype builds a flow in app/prototypes/<slug> using FlowShell and Atlas components. Disclosure order: atlas/index.md → only the atlas/<Name>.md files for the components used → atlas/tokens.md only if custom layout is needed. It never reads docs/ and never calls Figma. Gaps are composed locally from primitives and logged in atlas/state/candidates.json. It ends with atlas-verify.

atlas-component changes a component: Figma first, then docs, then code, Code Connect and state, ending with atlas-verify.

Descriptions must be specific enough to trigger on their own task and not on each other. Bodies under 100 lines; details go in references/.
```
**Done when** both trigger correctly and a prototype build reads only the files listed above.

---

## Phase 8 — Diet and re-benchmark
```
Archive stale planning docs into docs/_archive (keep the plan, the audits and this handoff). Remove the packages/ai-workflows/atlas-ui-skill and atlas-context.skill leftovers now that repo skills exist. Do not touch packages/ui-web, app/ or atlas/.
```
Then re-run: `benchmarks/run.sh after T1 3 <model>` and `after T2`, score the rubric, and compare in `SUMMARY.md`.
**Success:** fewer tokens, tool calls, reads, turns and rework edits, with quality equal or better. If quality dropped, the phase failed regardless of the token numbers.

---

## Phase 9 — Component workflow benchmark — ✅ CLOSED (2026-09-22) · handoff to Phase 10
There is no prompt here: Phase 9 is finished and shipped. This section is what a Phase 10 session needs to know
before choosing what to do next. Canonical record: `docs/ATLAS-AI-UPGRADE-PLAN.md`. Evidence: `docs/PHASE-9-RESULTS.md`.
Method to reuse: `docs/PHASE-9-PROPOSAL.md` (§5B hypotheses, §7 budget/stop rules, §8.1 gates, §8.2 rubric, §8.3 acceptance).

### Objective and hypothesis
**Objective (§1).** Bring the `atlas-component` workflow (Figma → sync → code → companions → state → verify) up to the
evidence standard of `atlas-prototype` — a 3-run benchmark, correctness first — then remove only the waste the benchmark
shows is caused by the harness, without weakening Figma-first behaviour.
**Hypothesis (§2).** The component workflow carries the same avoidable exploration Phases 6–8 removed from prototypes.
Each suspected cause maps to one change, H1–H5, each with one source signal and one primary metric, accepted only on its
own evidence: reproduce ≥2/3 in v2 → improve in v3 → no correctness regression.

### H3 — ACCEPTED and shipped
Proposal definition: "Sync runs once after the Figma decision and once after companions, never between code edits."
Signal: `atlas:sync` count > 2 (T3) or > 1 (T4). Metric: sync runs. Kind: skill text.

What shipped is the **revised** H3 (`56170dc`); the original (`4e968cd`) is superseded:
- `atlas-component/SKILL.md` step 6 — sync once after the last code/companion edit and read its full output
  (`written N file(s)`); a later hand edit to `atlas/state/*.json` needs **no** re-sync, because step 7's
  `design.snapshot-current` already proves the snapshot current.
- `atlas-component/references/companions.md` line 63 — the old "after editing state, sync once more and confirm it
  writes 0 files" was the direct contradiction that made the original H3 fail. Rewritten to match step 6.

Evidence chain:

| Stage | Arm | Result |
|---|---|---|
| Reproduce | `harness-v2-t3f2` T3 ×3 | signal 3/3 (syncs 3/3/3) — bar ≥2/3 met |
| First attempt | `harness-v3-t3f2` | redundant sync 1/3; inconclusive under the then-open rubric D question |
| Combined with H6 | `harness-v4-t3f2` (`1fd95aa`) | **H3 fails** — redundant sync 3/3, mean syncs 2.33 (limit ≤2) |
| Revised | `harness-v6-t3f2` (`56170dc`) | **`H3_syncRuns` 1/1/1, signal 0/3, gates 3/3, mean syncs 2.33 → 1.00**, verify 3/3 |
| Rubric | v6 median r1 | **A5 B5 C5 D5 = 20/20** vs `harness-v2-t3f2` r1 20/20 — no criterion lower (§8.3 step 3) |
| Regression | `harness-v7` (`44eacba`) | T4 gates 3/3 · T1 7/7 ×3 · T2 6/6, 5/6, 5/6 · tsc/token-lint/raw/primitive-refs 0 across 9 runs |

**Dependency:** `f10119c` / `8a5189b` (sync derives `## Variants` / `## Sizes`) ships with H3 — H3 was only ever measured
on top of it. Both are on `main`.
**Live caveat:** T3 was never re-run on the H3-only source `44eacba`. A residual evidence gap, **not a failure** — H3's
criterion held 3/3 on T3 under `56170dc` and 3/3 on T4 under `44eacba`.

### H6 — FAILED / DEFERRED
Not in the original proposal; added during v4 from the stale-row metric (`8d1a481`), so it has no §5B row. Bar: **0/3**
stale rows. Change (`1fd95aa`): narrow a partly-resolved hand-written discrepancy instead of leaving it stale.

**Exact failure.** `harness-v6-t3f2` T3 **run 3** shipped Switch `lg` and left `DISC-004` open and stale —
`benchmarks/results/harness-v6-t3f2/T3/stale-row/run-3/stale-row.json`: `"lgShipped": true, "stale": true`, the row still
`side: "both"`, `issue: "Figma used Variant for on/off; code has no size lg."`, `resolution: "… Code: add size lg."`, no
`date`. Runs 1 and 2 narrowed it correctly. 1/3 against a 0/3 bar. Deferred by user instruction: no retry, no revision,
no recombination. Its text was never shown defective — what failed is compliance in 1 run of 3.

**Before H6 can be reconsidered, all of these must hold:**
1. Measured **alone**, on top of shipped H3, never combined.
2. A T3 fixture whose `DISC-004` still has a narrowable remainder after `lg` ships.
3. A fresh v2-equivalent baseline for the stale-row metric on post-H3 `main` — the old 2/3 and 0/3 numbers were taken
   against pre-H3 sources.
4. Its own approved budget. Phase 9's is closed.

### H3/H6 interaction and the no-overlap constraint
§5B assumed signals don't overlap, so each metric attributes to one change. H3 and H6 broke that — in **both** directions:

| Arm | Source | H3 | H6 |
|---|---|---|---|
| `harness-v4-t3f2` | `1fd95aa` (H3 + H6) | **fails** 3/3 | holds 0/3 |
| `harness-v6-t3f2` | `56170dc` (H3 revised + H6) | holds 0/3 | **fails** 1/3 |

Mechanism: H6 makes a post-sync state edit happen in *every* run — exactly the path H3's rule governs. Under the
no-overlap rule a combined arm accepts neither, so H3 shipped alone on `44eacba`. **Standing rule from here on: a change
that alters when state is edited cannot share an arm with a change that alters when sync runs.**

### H5, H1, H2, H4 — as recorded
- **H5 — rejected.** Source signal never reproduced in fixture-2 v2 (template opens 0/3); the fixture-1 3/3 reproduction
  did not hold once Switch geometry matched Figma. Per §8.3 a rejected skill-text change needs no re-run; commit dropped.
- **H1 — deferred, never implemented.** Overlaps H3, and its T3 criterion was unreachable while T3 needed a `DISC-004`
  hand edit. It touches generator output, so it makes a T1/T2 regression **mandatory**; rejecting it would require
  checking that `atlas:sync` reproduces the baseline `atlas/` byte-for-byte.
- **H2 — not reproduced.** Opening another component's `*.test.tsx` never hit ≥2/3.
- **H4 — not reproduced.** Invalid discrepancy writes never hit ≥2/3.

### Open observation — T1 fixture-1 6/7
`harness-v3` (fixture 1) T1 run 2 returned coverage **6/7**, composing sections from `div`s instead of `Card` after
reading `Card.md`. Only `f10119c` changes T1 inputs. `harness-v7` returned **7/7 ×3**.
Recorded as **not explained, only not observed again** — never attributed to variance, and one non-reproduction does not
settle it. Treat as an open question about generated-doc changes affecting prototype composition, not as resolved.

### Inherited, not Phase 9 — Badge / DISC-006
`DISC-006`'s recorded resolution says `default→primary, secondary→neutral`; `Badge.figma.tsx` and rubric criterion C map
`neutral→default, primary→secondary`. A Badge source-of-truth inconsistency surfaced by T4 but caused by no Phase 9
change, and explicitly not penalised in T4 scoring. It belongs to the **Phase 2 Badge** pass. No Phase 9 verdict
depends on it — but it is a prerequisite if T4 is ever reused, the way Switch parity was for T3.

### Spend
**$37.32 of the $42 cap · $4.68 remaining, intentionally preserved and unspent.** $36.67 across 51 metered runs +
$0.65 interactive (two haiku spend-limit probes; the v4 T3 run-2 operator stop estimated conservatively at $0.60).
Cap history: $40 from 2026-09-13 → $42 on 2026-09-15 by user approval as the **stated maximum**. Ledger:
`benchmarks/results/phase-9-spend.json`; the replacement counter reads 2/2 (exhausted).

### Runtime deviations that matter for future experiments
1. **Account-synced skills contaminate arms.** `~/.claude/skills/synced/` carrying `atlas-context` and
   `atlas-ui-system` — the two skills Phase 8 retired — regenerated **four times** during the v7 chain, twice mid-batch.
   They supply Atlas tokens, specs and variant rules directly and would void the `no-skill` comparison. Each occurrence
   was caught by `pins.mjs check` before the affected run; bucket removed, run re-issued with `BENCH_ONLY`; all 12 runs
   verified clean (128 skills per init snapshot). **Check before every run — it recurs on its own.**
2. **The CLI auto-updates mid-chain** (2.1.270 → .271 → .274 across the phase). Pin it and run with `DISABLE_AUTOUPDATER=1`.
3. **The MCP set drifts and may be unremovable.** The `claude.ai Claude Docs` connector was added account-level and could
   not be disconnected; absorbed into the v6 runtime pin as a documented confound (one extra server *name*, no extra
   tools). Re-baselining the four fixture-2 arms would have cost ~$10.
4. **Spend limits stop a chain mid-run** (v5 T3 run 1 died at $0.13). Policy: no replacements or retries; an API/spend
   stop puts the phase on HOLD.
5. **Fixtures can be defective.** Fixture 1 assumed Switch `lg` could be added without touching `sm`/`md` while code and
   Figma disagreed, and scored a correct stop as a failure — invalidating the whole fixture-1 T3 set. **Validate a
   fixture's premise against live Figma before spending on it.**

### Repository state at closure
- **Shipped:** `4d90522 feat(atlas): integrate Phase 9 H3 sync improvements` — 23 files, +497/−43.
- **`origin/main` = local `main` = `4d90522`**, in sync, working tree clean.
- **Tags:** `phase-9-bench-freeze`, `phase-9-v3-freeze`, `phase-9-v4-freeze`, `phase-9-v5-freeze`, `phase-9-v6-freeze`.
  **No tag for `harness-v7`** — pinned by label only (tree `d456c6b32f`). Tag it if that arm will be re-run.
- **Evidence branches — retain, never merge:** `bench/phase-9-h3only` (`44eacba`), `bench/phase-9-v3` (`e2bb0e7`),
  `bench/phase-9-t3f2-v2` / `-v3` / `-v4` / `-v5` (`56170dc`).
- **Local git config added for the push:** `http.postBuffer = 524288000` (repo-local, not pushed). The push failed twice
  with `RPC failed; HTTP 400 … unexpected disconnect while reading sideband packet` — 713 objects including several
  ~0.8 MB benchmark `.jsonl` traces overran git's 1 MB default. Undo with `git config --unset http.postBuffer`.

### Do not carry forward
- **"Changes with disjoint signals can share an arm."** H3/H6 disproved it; a combined arm accepts neither.
- **"Skill-text changes are independent of each other."** H3's original failure was a contradiction *between two skill
  files*. Changing one instruction without auditing every file that restates it measures as a broken change.
- **"A source signal that reproduces once will reproduce again."** H5 reproduced 3/3 on fixture 1, 0/3 on fixture 2.
  Signals are fixture-dependent; re-verify reproduction after any fixture change.
- **"A fixture encodes a correct premise."** Fixture 1 penalised the correct stop.
- **"Cheaper and shorter means better."** v6 beat v4 on both — recorded as a side effect. Effort is reported and never
  decides acceptance (§8.3).
- **"A failing rubric criterion can be cleared by rescoring."** Rejected in favour of D-3: the score stays and you
  evaluate the arm being accepted. The v3 D 4 remains in the record against its rejected source.
- **"A new run is how you answer a closure question."** A–D for v6 were scored from preserved artifacts at zero spend.
  Check the artifacts first.
- **"The benchmark environment is stable between batches."** It drifted four ways in one phase.
- **"A branch can be merged to ship its accepted change."** `bench/phase-9-h3only` predates the evidence: merging would
  revert ~32,000 lines, un-archive `docs/_archive` and resurrect `packages/ai-workflows/atlas-ui-skill/`. Cherry-pick.

### Candidate inputs for Phase 10 — unranked, nothing chosen
- **H6, measured alone** on top of shipped H3, with the four preconditions above.
- **H1** (sync writes per-component discrepancy rows into `atlas/metadata/<Name>.json`) — never implemented; it overlapped
  H3, which has now shipped and changed, so the overlap may no longer hold. Triggers a mandatory T1/T2 regression.
- **H2 and H4** — never reproduced at ≥2/3. Retire them, or re-test their source signals against the post-H3 harness.
- **The T1 6/7 observation** — whether generated-doc changes alter prototype composition behaviour.
- **A post-H3 baseline.** Every Phase 9 comparison predates `4d90522`; any new hypothesis needs a v2-equivalent baseline
  on current `main`.
- **Benchmark-environment hardening** — automate the synced-skills check, the CLI pin and the MCP-set capture instead of
  catching drift per run.
- **Fixture-premise validation** as a gate before spend.
- **Phase 2 Badge / DISC-006 reconciliation** — a prerequisite if T4 is reused.
- **A budget for Phase 10.** Phase 9's cap is closed at its approved maximum.

---

## Rules for every session
- One phase per session. Don't work ahead.
- Read the plan and the audit; don't re-derive decisions.
- Figma and code disagree → Figma wins, flag it, fix Figma first.
- Finish by listing what changed, what was verified, and anything unresolved.
