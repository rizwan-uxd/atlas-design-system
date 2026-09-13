#!/usr/bin/env node
// summarize.mjs <resultsDir> → writes SUMMARY.md: the locked phase 0 medians, then mean (min–max) per label × task
import fs from "fs"; import path from "path"
const dir = process.argv[2]
const nums = a => a.filter(x => typeof x === "number")
const fmt = x => Number.isInteger(x) ? String(x) : x >= 100 ? x.toFixed(0) : x.toFixed(2)
const big = x => x >= 1e6 ? (x / 1e6).toFixed(2) + "M" : x >= 1e4 ? (x / 1e3).toFixed(1) + "k" : fmt(x)
const mr = (a, f = fmt) => { const s = nums(a); if (!s.length) return "–"; const m = s.reduce((p, c) => p + c, 0) / s.length; const lo = Math.min(...s), hi = Math.max(...s); return lo === hi ? f(m) : `${f(m)} (${f(lo)}–${f(hi)})` }
const count = (runs, f) => `${runs.filter(f).length}/${runs.length}`

const rows = []
for (const label of fs.readdirSync(dir).filter(d => fs.statSync(path.join(dir, d)).isDirectory()))
  for (const task of fs.readdirSync(path.join(dir, label)).filter(d => fs.statSync(path.join(dir, label, d)).isDirectory())) {
    const tdir = path.join(dir, label, task)
    const runs = fs.readdirSync(tdir).filter(f => /^run-\d+\.json$/.test(f)).map(f => { try { return JSON.parse(fs.readFileSync(path.join(tdir, f), "utf8")) } catch { return null } }).filter(Boolean)
    if (!runs.length) continue
    let manual = null; try { manual = JSON.parse(fs.readFileSync(path.join(tdir, "manual.json"), "utf8")) } catch {}
    const p8 = runs.every(r => r.phase8)
    const P = f => p8 ? runs.map(f) : []
    rows.push({ label, task, cells: [
      runs.length,
      // correctness
      count(runs, r => r.quality.registered), runs.map(r => r.quality.expectedCoverage).join(" "),
      mr(runs.map(r => r.quality.tokenLintViolations)), mr(runs.map(r => r.quality.tscErrors)), mr(runs.map(r => r.quality.rawElements)),
      manual ? `${manual.total ?? "–"} (run ${manual.run})` : "–",
      p8 ? count(runs, r => r.phase8.verify.finalPass !== false) : "–",
      // effort
      mr(runs.map(r => r.turns)), mr(runs.map(r => r.costUsd)), mr(runs.map(r => r.tokens.cacheRead), big), mr(runs.map(r => r.tokens.totalContext), big),
      mr(runs.map(r => r.tokens.output), big), mr(runs.map(r => r.toolCalls)), mr(runs.map(r => r.durationS)),
      mr(P(r => r.phase8.readsAll.total)), mr(P(r => r.phase8.readsAll.viaBash)), mr(P(r => r.phase8.sourceOpenedCount)),
      mr(P(r => r.phase8.verify.failures)), p8 ? count(runs, r => r.phase8.verify.firstPass === true) : "–",
      mr(P(r => r.phase8.wasted.total)),
      p8 ? (runs.every(r => r.phase8.gaps.available) ? (runs[0].phase8.gaps.expected.length ? count(runs, r => r.phase8.gaps.recognised.length === r.phase8.gaps.expected.length) : count(runs, r => r.phase8.gaps.candidatesChanged.length > 0) + " logged any") : "n/a") : "–",
    ] })
  }
const H = ["runs", "registered", "coverage", "lint", "tsc", "raw els", "manual /20", "final verify ok",
  "turns", "cost $", "cache read", "context tok", "output tok", "tool calls", "time s",
  "files opened", "via Bash", "source/verifier opened", "verify failures", "first-pass verify", "wasted exploration", "gap recognised"]
const table = rs => `| task | label | ${H.join(" | ")} |\n|${["", "", ...H].map(() => "---").join("|")}|\n` +
  rs.sort((a, b) => a.task.localeCompare(b.task) || a.label.localeCompare(b.label)).map(r => `| ${r.task} | ${r.label} | ${r.cells.join(" | ")} |`).join("\n")

let phase0 = ""; try { phase0 = fs.readFileSync(path.join(dir, "baseline", "PHASE0-SUMMARY.md"), "utf8").trim() } catch {}
const md = `# Atlas benchmark summary

${phase0 ? phase0 + "\n\n" : ""}## Mean (min–max) across runs

Correctness first — a label only wins if these are equal or better. Lower is better for every effort column.
- **files opened**: Read, Grep on a file, and files named in Bash commands (cat/sed/grep/python…).
- **source/verifier opened**: unique files under packages/ui-web/src, packages/tokens, scripts/, packages/governance, app/prototypes/_shared (except flowRegistry.ts) and other prototypes.
- **wasted exploration**: duplicate opens + docs/source of components the output doesn't import + off-task reads + verifier internals + failed/denied tool calls.
- **gap recognised**: the expected gap (meta.gapComponents) was logged in candidates.json; n/a when the workspace had no candidates.json (phase 0).

${table(rows)}
`
fs.writeFileSync(path.join(dir, "SUMMARY.md"), md)
