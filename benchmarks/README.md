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
