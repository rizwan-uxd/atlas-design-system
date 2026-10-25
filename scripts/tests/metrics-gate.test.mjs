import { test } from "node:test"
import assert from "node:assert/strict"
import { baselineFrom, evaluate } from "../lib/metrics-gate.mjs"

const row = (check, status, gate) => ({ check, status, gate })
const bench = (over = {}) => ({
  "protocol.promptReduction": { min: 0.7 },
  "protocol.firstOpP95": { p95Ms: 1000 },
  "protocol.agentCompliance": { markupReps: 0, n: 20 },
  ...over,
})
const base = baselineFrom(bench())

test("a hard row that is failing or not measurable blocks", () => {
  const r = evaluate({ rows: [row("a", "failing", "hard"), row("b", "not measurable", "hard"), row("c", "passing", "hard")], bench: bench(), baseline: base })
  assert.deepEqual(r.failures.map((f) => f.split(":")[0]), ["a", "b"])
})

test("report and trend rows never block; a passing report row is flagged for promotion", () => {
  const r = evaluate({ rows: [row("a", "failing", "report"), row("b", "failing", "trend"), row("c", "passing", "report")], bench: bench(), baseline: base })
  assert.equal(r.failures.length, 0)
  assert.equal(r.notes.length, 1)
})

test("a row with no gate blocks: a new metric must declare how it is gated", () => {
  assert.equal(evaluate({ rows: [row("a", "passing", undefined)], bench: bench(), baseline: base }).failures.length, 1)
})

test("trend: over 20% worse regresses, within 20% or better is ok, in both directions", () => {
  const t = (b) => Object.fromEntries(evaluate({ rows: [], bench: b, baseline: base }).trend.map((x) => [x.id, x.status]))
  assert.deepEqual(t(bench({ "protocol.firstOpP95": { p95Ms: 1199 } })), { "protocol.promptReduction": "ok", "protocol.firstOpP95": "ok", "protocol.agentCompliance": "ok" })
  assert.equal(t(bench({ "protocol.firstOpP95": { p95Ms: 1201 } }))["protocol.firstOpP95"], "regressed")
  assert.equal(t(bench({ "protocol.promptReduction": { min: 0.55 } }))["protocol.promptReduction"], "regressed")
  assert.equal(t(bench({ "protocol.promptReduction": { min: 0.9 } }))["protocol.promptReduction"], "ok")
})

test("trend: a zero compliance baseline regresses on any markup rep", () => {
  const r = evaluate({ rows: [], bench: bench({ "protocol.agentCompliance": { markupReps: 1, n: 20 } }), baseline: base })
  assert.equal(r.trend.find((x) => x.id === "protocol.agentCompliance").status, "regressed")
})

test("trend: a missing bench or baseline reads not measurable, never ok", () => {
  assert.ok(evaluate({ rows: [], bench: null, baseline: base }).trend.every((x) => x.status === "not measurable"))
  assert.ok(evaluate({ rows: [], bench: bench(), baseline: null }).trend.every((x) => x.status === "not measurable"))
})
