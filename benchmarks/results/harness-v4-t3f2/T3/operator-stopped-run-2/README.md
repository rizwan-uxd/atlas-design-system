# harness-v4-t3f2 T3 run 2 — operator-stopped, diagnostic only

- **Stopped by:** the user's instruction (2026-09-15) to halt v4 and confirm the CLI pin, after 19 tool calls. The chain, then the headless `claude -p` process (pid 20766), were killed.
- **Not an agent result and not an infrastructure/API stop:** it isn't scored and doesn't use a replacement.
- **Cost:** no `result` event, so no `total_cost_usd`. Logged as an interactive $0.60 upper estimate from usage (cache read 0.95M vs run 1's 2.17M at $0.89).
- **CLI:** 2.1.271 (init event), same as every fixture-2 label.
- **Resumed:** per the user's rule (all fixture-2 comparison labels used 2.1.271), run 2 re-runs unchanged from the same freeze (`BENCH_ONLY`, source `1fd95aa`, pins `2fa88a8`); its output is `../run-2.*`.
