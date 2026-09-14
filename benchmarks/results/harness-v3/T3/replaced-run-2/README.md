# harness-v3 T3 run 2 — original (infrastructure stop), replaced

- **Stop:** `API/spend error: You've hit your monthly spend limit` after $0.71 / 32 turns, mid-task (last call: Read `atlas/state/status.json`, before verify).
- **Gate failures in the original** (`finalVerify`, `stamped`) are artefacts of the cut-off: the run never reached step 7.
- **Classification:** infrastructure. No agent-behaviour stop rule fired.
- **Rule:** proposal §7 rule 3 — replacement 2/2 (the first was harness-v2 T3 run 3). No replacements remain: any further infrastructure stop puts Phase 9 on HOLD.
- **Replacement:** same frozen source `e2bb0e7` (tag `phase-9-v3-freeze`), same pins and evaluator, `BENCH_ONLY=2`; output is `../run-2.*`.
- The original's $0.71 stays in the spend ledger.
