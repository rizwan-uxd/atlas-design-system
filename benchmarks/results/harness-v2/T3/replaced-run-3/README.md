# harness-v2 T3 run 3 — original (infrastructure stop), replaced

- **Stop:** `API/spend error: You've hit your monthly spend limit` after $0.55 / 24 turns (ledger entry 3, `infra: true`).
- **Classification:** infrastructure. The agent was mid-task (no files changed yet); no agent-behaviour stop rule fired.
- **Rule:** proposal §7 rule 3 — infrastructure stops may use one of the 2 replacement runs. This is replacement 1/2.
- **Replacement:** same frozen source `d7967d7`, same pins/evaluator (`phase-9-bench-freeze`), run with `BENCH_ONLY=3`; its output is `../run-3.*`.
- **Files here:** the original `run-3.jsonl` / `.json` / `.err` / `.fixtures.json`, copied before the replacement overwrote them; sha256 in `trace.sha256`.
- The original's $0.55 stays in the spend ledger.
