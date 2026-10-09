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
