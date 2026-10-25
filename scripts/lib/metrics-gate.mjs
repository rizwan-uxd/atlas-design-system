/**
 * Phase 7 gate logic, pure. `evaluate` takes the report rows (each with its manifest `gate`), the Tier 3 bench
 * readings and the committed baseline, and returns what blocks and what only reports.
 *
 *   hard    must read passing; failing or not measurable blocks (absence of a signal is not a pass)
 *   report  shown, never blocks; a report row that reads passing is flagged so it can be promoted to hard
 *   trend   bench-only; a regression over TREND_LIMIT against the baseline is reported and never blocks
 */

export const TREND_LIMIT = 0.2

// how to read each Tier 3 reading out of bench.json; `better` says which direction is an improvement
export const TREND = {
  "protocol.promptReduction": { better: "higher", read: (b) => b?.min },
  "protocol.firstOpP95": { better: "lower", read: (b) => b?.warmP95Ms ?? b?.p95Ms },
  "protocol.agentCompliance": { better: "lower", read: (b) => (b && b.n > 0 ? b.markupReps / b.n : undefined) },
}

export function baselineFrom(bench) {
  const out = {}
  for (const [id, t] of Object.entries(TREND)) {
    const v = t.read(bench?.[id])
    if (typeof v === "number") out[id] = v
  }
  return out
}

function regression(id, current, base) {
  const { better } = TREND[id]
  if (better === "lower") return base === 0 ? current > 0 : current > base * (1 + TREND_LIMIT)
  return current < base * (1 - TREND_LIMIT)
}

export function evaluate({ rows, bench, baseline }) {
  const failures = []
  const notes = []
  for (const r of rows) {
    if (r.gate === undefined) { failures.push(`${r.check}: manifest row has no gate`); continue }
    if (r.gate === "hard" && r.status !== "passing") failures.push(`${r.check}: hard gate reads ${r.status}`)
    if (r.gate === "report" && r.status === "passing") notes.push(`${r.check}: report row reads passing — promote it to hard`)
  }
  const trend = []
  for (const id of Object.keys(TREND)) {
    const base = baseline?.[id]
    const current = TREND[id].read(bench?.[id])
    if (typeof base !== "number" || typeof current !== "number") { trend.push({ id, status: "not measurable", base, current }); continue }
    trend.push({ id, status: regression(id, current, base) ? "regressed" : "ok", base, current })
  }
  return { failures, notes, trend }
}

export function trendReport(trend) {
  const lines = ["| Tier 3 metric | Baseline | Current | Trend |", "|---|---:|---:|---|"]
  for (const t of trend) lines.push(`| \`${t.id}\` | ${t.base ?? "n/a"} | ${t.current ?? "n/a"} | ${t.status} |`)
  return lines.join("\n")
}
