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
import { p95, reduction } from "./stats"

const OUT = process.env.BENCH_OUT ?? "benchmarks/results/local/P1"
const REPS = Number(process.env.BENCH_REPS ?? 5)
const MODEL = process.env.BENCH_MODEL ?? "claude-sonnet-5-5"
const BAD = new Set(["malformed", "unknown-type", "out-of-catalog", "missing-required"])

type Rep = { task: string; rep: number; firstValidMs: number | null; markup: number; rejected: number; excluded: boolean; record: StreamRecord | null }

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

  const reps: Rep[] = []
  let costUsd = 0
  for (const t of evalSet.tasks) for (let i = 1; i <= REPS; i++) {
    const s = openSession({ task: t.task, capabilities: t.capabilities })
    let record: StreamRecord | null = null
    let firstValidMs: number | null = null, markup = 0
    const t0 = performance.now()
    const agent = createModelAgent(s.request, claudeCliTextStream(MODEL, (r) => { record = r }, t0))
    agent.subscribe((op) => {
      if (op.op !== "render" && op.op !== "patch") return
      const { issues } = validateTree(op.op === "render" ? op.root : op.node, s.registry)
      markup += issues.filter((x) => x.code === "markup").length
      if (firstValidMs === null && op.op === "render" && !issues.some((x) => BAD.has(x.code))) firstValidMs = performance.now() - t0
    })
    agent.start(); await agent.done
    if (agent.error) throw agent.error
    const r = record as StreamRecord | null
    if (r) costUsd += r.costUsd
    reps.push({ task: t.id, rep: i, firstValidMs, markup, rejected: agent.rejected.length, excluded: !r || r.fallback || r.stopReason === "refusal", record: r })
  }

  const kept = reps.filter((r) => !r.excluded)
  const latencies = kept.map((r) => r.firstValidMs).filter((x): x is number => typeof x === "number")
  const reductions = Object.values(perTask).map((x) => x.reduction)
  const bench = {
    "protocol.promptReduction": { overheadTokens: overhead, pass: Math.min(...reductions) >= 0.5, min: Math.min(...reductions), mean: reductions.reduce((a, b) => a + b, 0) / reductions.length, perTask },
    "protocol.firstOpP95": { pass: kept.length > 0 && latencies.length === kept.length && p95(latencies) < 250, p95Ms: latencies.length ? p95(latencies) : null, n: kept.length, noValidOp: kept.length - latencies.length, excluded: reps.length - kept.length },
    "protocol.agentCompliance": { pass: kept.length > 0 && kept.every((r) => r.markup === 0 && r.rejected === 0), markupReps: kept.filter((r) => r.markup > 0 || r.rejected > 0).length, n: kept.length },
  }
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, "run.json"), JSON.stringify({ model: MODEL, reps: REPS, costUsd, date: new Date().toISOString(), runs: reps }, null, 2) + "\n")
  fs.writeFileSync(path.join(OUT, "bench.json"), JSON.stringify(bench, null, 2) + "\n")
  expect(reps.length).toBe(evalSet.tasks.length * REPS)
})
