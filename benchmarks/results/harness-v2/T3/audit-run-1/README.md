# harness-v2 T3 run 1 — evaluator repair audit

**The benchmark was restarted with the repaired evaluator, and run 1 was kept by re-evaluating it.**

- **Agent inputs:** `d7967d7` (harness-v2 workspace tree `ab5a4ad740`). Unchanged throughout.
- **Evaluator/runner freeze:** tag `phase-9-bench-freeze` → `fcc19fa`.
  - `32de856` repairs the evaluator.
  - `fcc19fa` re-records the tooling pins and pins the MCP server set from run 1.
- **Run 1 trace:** `../run-1.jsonl`, sha256 in `trace-run-1.sha256`. Its workspace was never re-run.

## Timeline
1. The first chain ran run 1 with the evaluator at `2a13b18`/`23dd7ec` (component-metrics `e54ae52`).
   - The agent run finished normally: $1.17, 44 turns.
   - The chain then stopped on a false infrastructure failure from `pins.mjs post`: `figma MCP pending`.
   - Log: `chain-1-log-false-stop.txt`.
2. That evaluator also failed two correctness gates on run 1: `discFormat` and `snapshotCurrent`.
   - `run-1.json` was overwritten by the re-evaluation.
   - The overwritten original file itself is lost. It was regenerated from the same evaluator source (`git show 23dd7ec:…`), with the same trace and the same untouched workspace. Its failing gates match what was observed at the time.
   - File: `eval-original-23dd7ec.json` (`gatesPass: false`).
3. The fixes were committed (`32de856`), the pins re-recorded (`fcc19fa`), and run 1 re-evaluated.
   - File: `eval-repaired-fcc19fa.json` (`gatesPass: true`). It is byte-identical to `../run-1.json`.
4. The chain restarted at run 2 with the frozen evaluator. The pre-run pin check compares evaluator blob hashes, so every later run is refused unless it uses the same revision.

## Fixes and rationale (evaluator only — nothing agent-visible changed)

| Defect | Evidence | Fix (`32de856`) |
|---|---|---|
| `snapshotCurrent` false fail | `atlas-sync --check` exits 1 whenever any drift is open (26 rows repo-wide), even when it writes nothing. `sync-check-raw.txt` line 6: `would write    0 file(s)` | Read the would-write count from the `--check` output instead of its exit code |
| `discFormat` false fail | The agent narrowed the hand row DISC-004, which predates the `date` field; every field it had was still present (`state-diff.txt`) | An edited hand row must keep the fields it already had. The full DISC-028 schema applies only to new rows. |
| False infrastructure stop | At init the project's http `figma` server was `pending`, and its tools were deferred. The agent loaded them through ToolSearch and made 2 successful reads (`get_metadata`, `get_design_context` on node 95:114). | Fail only when the figma server is failed or absent. Pin the MCP server-name set instead of an init tool list. |

## Evaluator revision per artifact

| Artifact | analyze.mjs | component-metrics.mjs |
|---|---|---|
| `eval-original-23dd7ec.json` | `73ea836a8d` | `e54ae52346` (defective) |
| `eval-repaired-fcc19fa.json` = `../run-1.json` | `73ea836a8d` | `c8138a919a` (frozen) |
| runs 2–12 | `73ea836a8d` | `c8138a919a`, enforced by the pins check |
