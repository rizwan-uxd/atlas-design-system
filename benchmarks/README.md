# Atlas agent benchmark (Phase 0)

Measures what it costs an agent to build a prototype — and whether quality holds — **before** and **after** the AI upgrade.

## Run (on your Mac, from the repo root)
```bash
benchmarks/run.sh baseline T1 3 sonnet   # send-money flow, 3 runs
benchmarks/run.sh baseline T2 3 sonnet   # settings screen (includes a gap: Avatar)
```
Use the **same model and reps** for the "after" runs (`benchmarks/run.sh after T1 3 sonnet`).
Each run happens in an isolated copy under `$TMPDIR/atlas-bench/` — your working tree is never modified.

## What's measured (`results/<label>/<task>/run-N.json`)
- **Cost:** total context tokens (input + cache write + cache read), output tokens, $ cost, turns, wall time
- **Disclosure:** every file read, bucketed (components, tokens, skills, snapshot, planning-docs, other-platforms, framework-docs…); `offTask` = reads that shouldn't be needed to build a prototype; tool-result characters per tool
- **Quality (automated):** output exists, registered in flowRegistry, token-lint violations, tsc errors, Atlas components imported vs expected, raw HTML controls, numeric style literals, primitive-token refs
- **Quality (manual):** `rubric.md` → `manual.json`

`results/SUMMARY.md` compares labels side by side (medians).

## Success = all three
1. Fewer context tokens and files read
2. Fewer turns
3. Off-task reads ≈ 0 **with equal or better quality** (automated + manual)

## Wave 1 (AI readiness)
Tasks T5–T11 measure whether Atlas patterns and governance make agent output more compliant. Labels `baseline-w1` (before the pattern layer exists) and `patterns-w1` (after) use the same model, configuration, prompts and run count; only the repo state differs. `env.txt` records the git HEAD and any uncommitted paths: run from a clean tree.

| Task | Slug | What it tests | Extra metric |
|---|---|---|---|
| T5 | empty-state | first-use vs no-results empty states | pattern adherence |
| T6 | invoices-table | table, filters, bulk actions, destructive confirm | pattern adherence |
| T7 | dashboard-summary | KPI cards, chart, list, loading and error | pattern adherence |
| T8 | onboarding | multi-step form, validation, skip | pattern adherence |
| T9 | payment-error | error recovery, retry, alternate path, timeout | pattern adherence |
| T10 | drift-fixture | audit a seeded screen, no edits | recall, precision |
| T11 | legacy-fixture | migrate deprecated variants (benchmark-only registry) | migrated |

T10 and T11 ship a `fixture/` overlay that `run.sh` copies onto the throwaway workspace before the base commit (T11 also runs `atlas-sync` so the workspace snapshot shows its fixture deprecations). Nothing in a fixture reaches the repo.

Metrics come from `w1` in each `run-N.json` (`analyze.mjs`), computed from the output and the log. `patternChecks` in `meta.json` are regex checks fixed before the baseline; a score of 0 means none hold, 1 some, 2 all. `humanCorrections` is unavailable in a headless run. `manual.json` is scored by hand with `rubric.md`.

```bash
benchmarks/run.sh baseline-w1 T5 3 sonnet   # repeat for T6..T9 (T10, T11 optional)
```

### Strict pattern checks (added after `baseline-w1`)
The first `patternChecks` were presence checks and the baseline passed all of them, so they cannot show a gain. `strictChecks` in each task's `meta.json` encode individual Decision rules and Anti-patterns from `packages/governance/patterns/` (for example: after a card decline the primary action changes the card, not "Try again"). They were written after the baseline ran and are derived from the pattern docs, so they measure adherence to the patterns by definition. Both arms use the same scorer: `node benchmarks/rescore.mjs baseline-w1 T5 T6 T7 T8 T9` added `w1.patternStrict` to the saved baseline runs (it needs their workspaces under `$TMPDIR/atlas-bench/`). T7 has no dashboard pattern; its strict checks come from the error-recovery rules and it serves as a control for the dashboard layout.

### Run timeout
`run.sh` limits each attempt to `BENCH_RUN_TIMEOUT` seconds (default 900; healthy runs take 2–5 minutes) after two `patterns-w1` attempts stalled for hours in API retries. A timed-out attempt is discarded (its log is kept as `run-N.timeout-K.jsonl`, which `summarize.mjs` ignores), the workspace is reset to its base commit, and the run is retried up to `BENCH_TIMEOUT_RETRIES` times (default 1). Timeouts never count as results; if every attempt times out the script stops.

### Regex fix applied to both arms
After `patterns-w1` finished, two strict checks were found to under-count both arms: `[^>]*` stopped at the `=>` in `onClick={() => …}` (T9 `support-secondary`, `timeout-primary-retry`, and T8 `skip-ghost`). All strict patterns now use `(?:[^>]|=>)*` and both arms were re-scored from their saved workspaces. Strict adherence before and after the fix: baseline 0.796 to 0.812, patterns 0.944 to 0.981; T9 baseline 0.407 to 0.444, T9 patterns 0.815 to 1.000.

## Wave 2 (pattern authoring, `atlas-pattern` skill)
Tasks T17 and T18 measure whether the `atlas-pattern` skill changes what an agent does when asked to author a pattern. Arms: **skill** (the repo at `BENCH_COMMIT`) and **no-skill** (the same tree with `phase-10/no-pattern-skill.patch`: the skill and its `AGENTS.md` / `claude.md` mentions removed). Rubric: `rubric-pattern.md`. Spend cap **$15**, ledger `results/wave-2-spend.json` (`BENCH_CAP` overrides), pins `phase-10/pins.json` (recorded by your first dry run).

| Task | What it tests | Right answer |
|---|---|---|
| T17 | "Add a File upload pattern" with every Figma tool removed | Stop. No pattern doc or example, report names Figma as the reason, no Figma write |
| T18 | "Write the Members and permissions pattern from its Figma frames" (frames exist, doc deleted from the throwaway copy) | Read the frames first, write doc and example, sync, tsc and verify clean, README listed, in scope |

T18 deletes the pattern's doc, example, generated copy, index row and README mention from the throwaway workspace only (`phase-10/apply-fixture.mjs`); the original content is kept out of the workspace and its rules are the `strictChecks` in `tasks/T18/meta.json`. Gates are in `phase-10/pattern-metrics.mjs`. A rule that is not a gate (not-drawn marking, report accuracy) is scored by hand.

**Labels are per task** (pins are per tree, and T18's tree differs from T17's): `wave2-skill-t17`, `wave2-noskill-t17`, `wave2-skill-t18`, `wave2-noskill-t18`.

```bash
git pull; export DISABLE_AUTOUPDATER=1
export BENCH_COMMIT=$(git rev-parse HEAD) BENCH_PIN_MODEL=claude-sonnet-5-5   # the model id you pass below
M=claude-sonnet-5-5; PATCH=benchmarks/phase-10/no-pattern-skill.patch

# 1. $0: build the workspaces, run the fixture gate, record pins
BENCH_DRY=1 benchmarks/run.sh wave2-skill-t17 T17 1 $M
BENCH_DRY=1 BENCH_PATCH=$PATCH benchmarks/run.sh wave2-noskill-t17 T17 1 $M
BENCH_DRY=1 benchmarks/run.sh wave2-skill-t18 T18 1 $M
BENCH_DRY=1 BENCH_PATCH=$PATCH benchmarks/run.sh wave2-noskill-t18 T18 1 $M
# 2. paid, cheapest first (3 reps each, about $11 in total)
benchmarks/run.sh wave2-skill-t17 T17 3 $M
BENCH_PATCH=$PATCH benchmarks/run.sh wave2-noskill-t17 T17 3 $M
benchmarks/run.sh wave2-skill-t18 T18 3 $M
BENCH_PATCH=$PATCH benchmarks/run.sh wave2-noskill-t18 T18 3 $M
```
Before step 2, open the Figma page `Pattern / Members and permissions` (node `1035:2`, frame `1035:3`): the fixture gate does not check live Figma, and a run without frames would test the wrong thing. Check `ls ~/.claude/skills` has not regrown account-synced Atlas skills (they contaminated phase 9; `pins.mjs` catches a change between runs, not one before the first record). `budget.mjs status` with the same `BENCH_LEDGER` shows spend. A run over $2.50, a max-turns exit or three `use_figma` attempts stops the batch; an agent-behaviour stop is a failed result and is never re-run.
