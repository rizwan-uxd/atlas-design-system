# P1 — protocol bench (Phase 6)

There is no hand-written prompt. For each task in `packages/registry/tests/eval-tasks.json` the bench opens a session
(`openSession`) and sends `agentSystemPrompt(session.request)` as the system prompt and the task text as the user
message, so the model only ever sees that task's filtered catalog. See `benchmarks/protocol/protocol.bench.ts`.
