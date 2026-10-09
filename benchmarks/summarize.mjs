#!/usr/bin/env node
// summarize.mjs <resultsDir> → writes SUMMARY.md: the locked phase 0 medians, then mean (min–max) per label × task
import fs from "fs"; import path from "path"
const dir = process.argv[2]
const nums = a => a.filter(x => typeof x === "number")
const fmt = x => Number.isInteger(x) ? String(x) : x >= 100 ? x.toFixed(0) : x.toFixed(2)
const big = x => x >= 1e6 ? (x / 1e6).toFixed(2) + "M" : x >= 1e4 ? (x / 1e3).toFixed(1) + "k" : fmt(x)
const mr = (a, f = fmt) => { const s = nums(a); if (!s.length) return "–"; const m = s.reduce((p, c) => p + c, 0) / s.length; const lo = Math.min(...s), hi = Math.max(...s); return lo === hi ? f(m) : `${f(m)} (${f(lo)}–${f(hi)})` }
const count = (runs, f) => `${runs.filter(f).length}/${runs.length}`

const rows = [], compRows = [], w1Rows = []
for (const label of fs.readdirSync(dir).filter(d => fs.statSync(path.join(dir, d)).isDirectory()))
  for (const task of fs.readdirSync(path.join(dir, label)).filter(d => fs.statSync(path.join(dir, label, d)).isDirectory())) {
    const tdir = path.join(dir, label, task)
    const runs = fs.readdirSync(tdir).filter(f => /^run-\d+\.json$/.test(f)).map(f => { try { return JSON.parse(fs.readFileSync(path.join(tdir, f), "utf8")) } catch { return null } }).filter(Boolean)
    if (!runs.length) continue
    let manual = null; try { manual = JSON.parse(fs.readFileSync(path.join(tdir, "manual.json"), "utf8")) } catch {}
    const p8 = runs.every(r => r.phase8)
    const P = f => p8 ? runs.map(f) : []
    if (runs.every(r => r.w1)) {
      const W = f => runs.map(r => f(r.w1))
      const share = (name, f) => { const hits = W(f).filter(v => v !== null && v !== undefined); return hits.length ? count(runs, r => f(r.w1) === true) : "–" }
      w1Rows.push({ label, task, cells: [
        runs.length, count(runs, r => r.ok),
        mr(W(w => w.tokenAccuracy?.value)), mr(W(w => w.componentAccuracy?.value)),
        W(w => w.patternAdherence?.score).some(v => v !== undefined) ? mr(W(w => w.patternAdherence?.score)) : "–",
        W(w => w.patternStrict?.fraction).some(v => v !== undefined && v !== null) ? mr(W(w => w.patternStrict?.fraction)) : "–",
        mr(runs.map(r => r.quality.rawElements)), share("a11y", w => w.a11yPass), mr(W(w => w.deprecatedUsage)),
        W(w => w.audit?.recall).some(v => v !== undefined) ? `${mr(W(w => w.audit?.recall))} / prec ${mr(W(w => w.audit?.precision))}` : "–",
        W(w => w.migration?.migrated).some(v => v !== undefined) ? count(runs, r => r.w1.migration?.migrated === true) : "–",
        mr(runs.map(r => r.turns)), mr(runs.map(r => r.costUsd)),
        manual ? `${manual.total ?? "–"} (run ${manual.run})` : "–", "unavailable",
      ] })
    }
    if (runs.every(r => r.component)) {
      const C = f => runs.map(r => f(r.component))
      const sig = k => `${mr(C(c => c.signals[k]))} [${C(c => c.present[k.slice(0, 2)]).filter(Boolean).length}/${runs.length}]`
      compRows.push({ label, task, cells: [
        runs.length, count(runs, r => r.ok), count(runs, r => r.component.gatesPass),
        mr(C(c => c.useFigmaAttempts)), count(runs, r => r.component.gates.stopped ?? r.component.gates.notStopped),
        count(runs, r => r.component.gates.tests), mr(C(c => c.tscErrors)), count(runs, r => r.component.gates.finalVerify ?? r.component.gates.verifyNotFailing),
        count(runs, r => r.component.stamped), count(runs, r => r.component.gates.scope),
        manual ? `${manual.total ?? "–"} (run ${manual.run})` : "–",
        sig("H1_stateFileReads"), sig("H2_otherTestOpens"), sig("H3_syncRuns"), sig("H4_invalidDiscWrites"), sig("H5_otherComponentOpens"),
        mr(runs.map(r => r.turns)), mr(runs.map(r => r.costUsd)), mr(runs.map(r => r.tokens.cacheRead), big), mr(P(r => r.phase8.readsAll.total)),
        mr(C(c => c.figmaReads.length)), count(runs, r => r.component.maxTurnsExit),
      ] })
      continue
    }
    rows.push({ label, task, cells: [
      runs.length,
      count(runs, r => r.ok && r.quality.outputExists),
      // correctness
      count(runs, r => r.quality.registered), runs.map(r => r.quality.expectedCoverage).join(" "),
      mr(runs.map(r => r.quality.tokenLintViolations)), mr(runs.map(r => r.quality.tscErrors)), mr(runs.map(r => r.quality.rawElements)),
      manual ? `${manual.total ?? "–"} (run ${manual.run})` : "–",
      p8 ? count(runs, r => r.phase8.verify.finalPass === true) : "–",
      // effort
      mr(runs.map(r => r.turns)), mr(runs.map(r => r.costUsd)), mr(runs.map(r => r.tokens.cacheRead), big), mr(runs.map(r => r.tokens.totalContext), big),
      mr(runs.map(r => r.tokens.output), big), mr(runs.map(r => r.toolCalls)), mr(runs.map(r => r.durationS)),
      mr(P(r => r.phase8.readsAll.total)), mr(P(r => r.phase8.readsAll.viaBash)), mr(P(r => r.phase8.sourceOpenedCount)),
      mr(P(r => r.phase8.verify.failures)), p8 ? count(runs, r => r.phase8.verify.firstPass === true) : "–",
      mr(P(r => r.phase8.wasted.total)),
      p8 ? (runs.every(r => r.phase8.gaps.available) ? (runs[0].phase8.gaps.expected.length ? count(runs, r => r.phase8.gaps.recognised.length === r.phase8.gaps.expected.length) : count(runs, r => r.phase8.gaps.candidatesChanged.length > 0) + " logged any") : "n/a") : "–",
    ] })
  }
const H = ["runs", "completed", "registered", "coverage", "lint", "tsc", "raw els", "manual /20", "final verify ok",
  "turns", "cost $", "cache read", "context tok", "output tok", "tool calls", "time s",
  "files opened", "via Bash", "source/verifier opened", "verify failures", "first-pass verify", "wasted exploration", "gap recognised"]
const CH = ["runs", "completed", "all gates", "figma writes", "stop decision ok", "tests", "tsc", "verify ok", "stamped", "in scope", "manual /20",
  "H1 state-file reads [runs]", "H2 other tests [runs]", "H3 sync runs [runs over limit]", "H4 invalid DISC [runs]", "H5 other components [runs]",
  "turns", "cost $", "cache read", "files opened", "figma reads", "max-turns exits"]
const WH = ["runs", "completed", "token accuracy", "component accuracy", "pattern adherence 0–2 (loose)", "pattern adherence strict (fraction)", "raw els", "a11y pass", "deprecated usage",
  "audit recall / precision", "migrated", "turns", "cost $", "manual /20", "human corrections"]
const table = (rs, h = H) => `| task | label | ${h.join(" | ")} |\n|${["", "", ...h].map(() => "---").join("|")}|\n` +
  rs.sort((a, b) => a.task.localeCompare(b.task) || a.label.localeCompare(b.label)).map(r => `| ${r.task} | ${r.label} | ${r.cells.join(" | ")} |`).join("\n")


// Wave 1: baseline-w1 vs patterns-w1, same aggregation (mean over runs) for both arms
const cmpTasks = ["T5", "T6", "T7", "T8", "T9"]
const loadRuns = (label, task) => { const d = path.join(dir, label, task); return fs.existsSync(d) ? fs.readdirSync(d).filter(f => /^run-\d+\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(path.join(d, f), "utf8"))) : [] }
const CMP = [
  ["Pattern adherence, strict (fraction)", r => r.w1?.patternStrict?.fraction, 3],
  ["Pattern adherence, loose (0–2)", r => r.w1?.patternAdherence?.score, 2],
  ["Token accuracy", r => r.w1?.tokenAccuracy?.value, 3],
  ["Component accuracy", r => r.w1?.componentAccuracy?.value, 3],
  ["Raw elements", r => r.quality.rawElements, 2],
  ["A11y pass (share of runs)", r => (r.w1?.a11yPass ? 1 : 0), 2],
  ["Deprecated usage", r => r.w1?.deprecatedUsage, 2],
  ["tsc errors", r => r.quality.tscErrors, 2],
  ["Token-lint violations", r => r.quality.tokenLintViolations, 2],
  ["Turns", r => r.turns, 1],
  ["Cost $", r => r.costUsd, 3],
]
const meanOf = (runs, g) => { const v = runs.map(g).filter(x => typeof x === "number"); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }
const base = cmpTasks.flatMap(t => loadRuns("baseline-w1", t)), pat = cmpTasks.flatMap(t => loadRuns("patterns-w1", t))
let compare = ""
if (base.length && pat.length) {
  const cell = (m, d) => (m == null ? "–" : m.toFixed(d))
  const rows = CMP.map(([name, g, d]) => { const b = meanOf(base, g), p = meanOf(pat, g); return `| ${name} | ${cell(b, d)} | ${cell(p, d)} | ${b == null || p == null ? "–" : (p - b >= 0 ? "+" : "") + (p - b).toFixed(d)} |` })
  const strict = cmpTasks.map(t => { const b = meanOf(loadRuns("baseline-w1", t), CMP[0][1]), p = meanOf(loadRuns("patterns-w1", t), CMP[0][1]); return `| ${t} | ${cell(b, 3)} | ${cell(p, 3)} | ${b == null || p == null ? "–" : (p - b >= 0 ? "+" : "") + (p - b).toFixed(3)} |` })
  compare = `
## Wave 1 — baseline-w1 vs patterns-w1

Same model (claude-sonnet-5-5), prompts, run count (${base.length} vs ${pat.length} runs over T5–T9) and aggregation (mean over runs). The only repo difference is the pattern layer (\`atlas/patterns/\`, the Patterns table in \`atlas/index.md\`, and one added read step in the atlas-prototype skill).

| Metric | Baseline | Patterns | Delta |
|---|---:|---:|---:|
${rows.join("\n")}

Strict adherence by task:

| Task | Baseline | Patterns | Delta |
|---|---:|---:|---:|
${strict.join("\n")}

Strict checks were written after the baseline ran, derive from the pattern docs, and were applied identically to both arms (see benchmarks/README.md). Human corrections and manual /20 are unavailable (headless runs, not hand-scored).
`
}

let phase0 = ""; try { phase0 = fs.readFileSync(path.join(dir, "baseline", "PHASE0-SUMMARY.md"), "utf8").trim() } catch {}
const md = `# Atlas benchmark summary

${phase0 ? phase0 + "\n\n" : ""}## Mean (min–max) across runs

Correctness first — a label only wins if these are equal or better. Lower is better for every effort column.
- **files opened**: Read, Grep on a file, and files named in Bash commands (cat/sed/grep/python…).
- **source/verifier opened**: unique files under packages/ui-web/src, packages/tokens, scripts/, packages/governance, app/prototypes/_shared (except flowRegistry.ts) and other prototypes.
- **wasted exploration**: duplicate opens + docs/source of components the output doesn't import + off-task reads + verifier internals + failed/denied tool calls.
- **gap recognised**: the expected gap (meta.gapComponents) was logged in candidates.json; n/a when the workspace had no candidates.json (phase 0).

${table(rows)}
${compare}${compRows.length ? `
## Phase 9 — component tasks, mean (min–max) across runs

Gates first (proposal §8.1); a count is runs passing. H columns are the §5B source signals: mean (min–max), then [runs where the
signal is present] — a hypothesis reproduces at ≥2/3 in harness-v2. Effort columns are reported, not used for acceptance.

${table(compRows, CH)}
` : ""}${w1Rows.length ? `
## Wave 1 — AI-readiness metrics, mean (min–max) across runs

Computed by \`analyze.mjs\` from the output and the run log; nothing is estimated.
- **token accuracy**: semantic \`--atlas-*\` refs that exist, divided by those plus undefined refs, primitive refs and hardcoded colours or lengths.
- **component accuracy**: expected Atlas components imported, as a fraction (\`meta.expectedComponents\`).
- **pattern adherence**: per-task deterministic checks in \`meta.w1.patternChecks\`: 0 none hold, 1 some hold, 2 all hold.
- **a11y pass / deprecated usage**: atlas-verify's \`a11y\` and \`deprecated-usage\` checks on the run's changes (count of runs passing; mean violations).
- **audit recall / precision** (T10): seeded violations found; cited lines that are real. **migrated** (T11): all deprecated values replaced, content kept.
- **human corrections**: the harness is headless, so this is unavailable. \`reworkEdits\` (agent edits after its first verify) is the nearest signal and is in each run JSON.

${table(w1Rows, WH)}
` : ""}`
fs.writeFileSync(path.join(dir, "SUMMARY.md"), md)
