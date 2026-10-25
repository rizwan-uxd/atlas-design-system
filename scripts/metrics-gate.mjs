#!/usr/bin/env node
/**
 * metrics-gate — Phase 7. Turns atlas-report.json into a release gate.
 *
 *   node scripts/metrics-gate.mjs                 gate the report (exit 1 when a hard row is not passing)
 *   node scripts/metrics-gate.mjs --accept-trend  rewrite the Tier 3 baseline from the committed bench batch
 *
 * Hard gates block; trend gates (>20% regression against benchmarks/results/protocol-baseline.json) write
 * `trend-report.md` and warn, never blocking. See scripts/lib/metrics-gate.mjs and the manifest `gate` field.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { baselineFrom, evaluate, trendReport } from "./lib/metrics-gate.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
const arg = (name, dflt) => { const i = args.indexOf(name); return i === -1 ? dflt : args[i + 1] }
const readJson = (p) => JSON.parse(fs.readFileSync(path.resolve(ROOT, p), "utf8"))

const REPORT = arg("--report", "atlas-report.json")
const BENCH = arg("--bench", "benchmarks/results/protocol-latest/bench.json")
const BASELINE = arg("--baseline", "benchmarks/results/protocol-baseline.json")
const TREND_OUT = arg("--trend-out", "trend-report.md")

const bench = fs.existsSync(path.resolve(ROOT, BENCH)) ? readJson(BENCH) : null

if (args.includes("--accept-trend")) {
  if (bench === null) { console.error(`metrics-gate: no ${BENCH} to accept`); process.exit(1) }
  fs.writeFileSync(path.resolve(ROOT, BASELINE), `${JSON.stringify(baselineFrom(bench), null, 2)}\n`)
  console.log(`metrics-gate: baseline written to ${BASELINE}`)
  process.exit(0)
}

const manifest = readJson("metrics.manifest.json")
const report = readJson(REPORT)
const gates = new Map(manifest.metrics.map((m) => [`${m.source}:${m.check}`, m.gate]))
const rows = report.metrics.map((r) => ({ ...r, gate: gates.get(`${r.source}:${r.check}`) }))
const baseline = fs.existsSync(path.resolve(ROOT, BASELINE)) ? readJson(BASELINE) : null
const { failures, notes, trend } = evaluate({ rows, bench, baseline })

const md = trendReport(trend)
fs.writeFileSync(path.resolve(ROOT, TREND_OUT), `${md}\n`)
console.log(md)
for (const n of notes) console.log(`  ◯ ${n}`)
for (const t of trend.filter((x) => x.status === "regressed")) console.log(`::warning::Tier 3 trend: ${t.id} regressed over 20% (baseline ${t.base}, now ${t.current})`)
if (failures.length) {
  for (const f of failures) console.error(`  ✗ ${f}`)
  console.error(`metrics-gate: ${failures.length} hard gate(s) not passing`)
  process.exit(1)
}
console.log(`metrics-gate: all ${rows.filter((r) => r.gate === "hard").length} hard gates passing`)
