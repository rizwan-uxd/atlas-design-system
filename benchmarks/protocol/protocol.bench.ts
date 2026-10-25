// Session 28: the CLI transport's cold start is measured on its own (COLD_REPS runs of a one-character reply: process
// spawn, CLI init and the first token of a minimal prompt) and subtracted from each rep's first valid op, so
// firstOpP95 reads the protocol's own warm latency and `coldStartMs` reports the transport. The agent runs with its
// registry, so a response that draws validator issues is repaired at most once (maxRepairs 1) and `repairLoop` reports it.
// Phase 6 protocol bench, over `claude -p` on the subscription (DEC-093). Arm 1: input tokens the CLI reports for each
// eval task's filtered prompt vs the full-catalog prompt, minus the CLI's fixed overhead (measured with a trivial
// prompt) → promptReduction. Arm 2: BENCH_REPS streamed runs per task → first valid op latency (includes CLI startup)
// and agent markup. A rep served by a fallback model is excluded; a stream error fails the batch (infrastructure, not a
// reading). Writes run.json (every rep) and bench.json (the metrics).
import fs from "node:fs"
import path from "node:path"
import { expect, it } from "vitest"
import evalSet from "@/packages/registry/tests/eval-tasks.json"
import { agentSystemPrompt } from "@atlas/runtime/agent-prompt"
import { createModelAgent } from "@atlas/runtime/model-agent"
import { openSession } from "@atlas/runtime/session"
import { validateTree } from "@atlas/runtime/validate"
import { claudeCliTextStream, cliInputTokens, type StreamRecord } from "./claude-cli-stream"
import { fullCatalogPrompt } from "./full-catalog"
import { median, p95, reduction } from "./stats"

const OUT = process.env.BENCH_OUT ?? "benchmarks/results/local/P1"
const REPS = Number(process.env.BENCH_REPS ?? 5)
const MODEL = process.env.BENCH_MODEL ?? "claude-sonnet-5-5"
const COLD_REPS = Number(process.env.BENCH_COLD_REPS ?? 5)
const BAD = new Set(["malformed", "unknown-type", "out-of-catalog", "missing-required"])

type Rep = { task: string; rep: number; firstValidMs: number | null; markup: number; rejected: number; attempts: number; excluded: boolean; record: StreamRecord | null }

it("protocol bench", async () => {
  const full = fullCatalogPrompt()
  const overhead = await cliInputTokens(MODEL, "x", "x") // the CLI's own fixed prompt, identical in both arms
  const count = async (system: string, task: string) => (await cliInputTokens(MODEL, system, task)) - overhead
  const perTask: Record<string, { filtered: number; full: number; reduction: number }> = {}
  for (const t of evalSet.tasks) {
    const { request } = openSession({ task: t.task, capabilities: t.capabilities })
    const filtered = await count(agentSystemPrompt(request), t.task)
    const whole = await count(agentSystemPrompt({ ...request, catalog: { ...request.catalog, prompt: full } }), t.task)
    perTask[t.id] = { filtered, full: whole, reduction: reduction(filtered, whole) }
  }

  const cold: number[] = []
  let costUsd = 0
  for (let i = 0; i < COLD_REPS; i++) {
    let r: StreamRecord | null = null
    const t0 = performance.now()
    for await (const _ of claudeCliTextStream(MODEL, (x) => { r = x }, t0)("Reply with the single character x.", "x")) void _
    const rec = r as StreamRecord | null
    if (rec) { costUsd += rec.costUsd; if (rec.firstTokenMs !== null) cold.push(rec.firstTokenMs) }
  }
  const coldStartMs = median(cold)

  const reps: Rep[] = []
  for (const t of evalSet.tasks) for (let i = 1; i <= REPS; i++) {
    const s = openSession({ task: t.task, capabilities: t.capabilities })
    let record: StreamRecord | null = null
    let firstValidMs: number | null = null, markup = 0
    const t0 = performance.now()
    const agent = createModelAgent(s.request, claudeCliTextStream(MODEL, (r) => { record = r; costUsd += r.costUsd }, t0), { registry: s.registry })
    agent.subscribe((op) => {
      if (op.op !== "render" && op.op !== "patch") return
      const { issues } = validateTree(op.op === "render" ? op.root : op.node, s.registry)
      markup += issues.filter((x) => x.code === "markup").length
      if (firstValidMs === null && op.op === "render" && !issues.some((x) => BAD.has(x.code))) firstValidMs = performance.now() - t0
    })
    agent.start(); await agent.done
    if (agent.error) throw agent.error
    const r = record as StreamRecord | null
    reps.push({ task: t.id, rep: i, firstValidMs, markup, rejected: agent.rejected.length, attempts: agent.diagnostics.length, excluded: !r || r.fallback || r.stopReason === "refusal", record: r })
  }

  const kept = reps.filter((r) => !r.excluded)
  const latencies = kept.map((r) => r.firstValidMs).filter((x): x is number => typeof x === "number")
  const warm = latencies.map((x) => Math.max(0, x - coldStartMs))
  const reductions = Object.values(perTask).map((x) => x.reduction)
  const bench = {
    "protocol.promptReduction": { overheadTokens: overhead, pass: Math.min(...reductions) >= 0.5, min: Math.min(...reductions), mean: reductions.reduce((a, b) => a + b, 0) / reductions.length, perTask },
    "protocol.firstOpP95": { pass: kept.length > 0 && latencies.length === kept.length && p95(warm) < 250, warmP95Ms: warm.length ? p95(warm) : null, coldStartMs, p95Ms: latencies.length ? p95(latencies) : null, n: kept.length, noValidOp: kept.length - latencies.length, excluded: reps.length - kept.length },
    "protocol.agentCompliance": { pass: kept.length > 0 && kept.every((r) => r.markup === 0), markupReps: kept.filter((r) => r.markup > 0).length, nonOpReps: kept.filter((r) => r.rejected > 0).length, n: kept.length },
    "protocol.repairLoop": { pass: kept.every((r) => r.attempts <= 2), repaired: kept.filter((r) => r.attempts > 1).length, maxAttempts: Math.max(...kept.map((r) => r.attempts)), n: kept.length },
  }
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, "run.json"), JSON.stringify({ model: MODEL, reps: REPS, coldReps: COLD_REPS, cold, costUsd, date: new Date().toISOString(), runs: reps }, null, 2) + "\n")
  fs.writeFileSync(path.join(OUT, "bench.json"), JSON.stringify(bench, null, 2) + "\n")
  expect(reps.length).toBe(evalSet.tasks.length * REPS)
})
