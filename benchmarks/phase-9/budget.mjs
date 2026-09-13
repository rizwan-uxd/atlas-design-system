#!/usr/bin/env node
// budget.mjs — phase 9 spend cap and batch-stop rules (proposal §7). Ledger: benchmarks/results/phase-9-spend.json
//   budget.mjs pre  <task> <reps>                       exit 1 if spent + reps × ceiling > cap
//   budget.mjs post <label> <task> <i> <run.json>       append to the ledger; exit 2 when a stop rule fires
//   budget.mjs interactive <usd> <what>                 log interactive spend (live fixture gate, pin capture)
//   budget.mjs status
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const FILE = path.join(ROOT, "benchmarks/results/phase-9-spend.json")
const CAP = 40, FLOOR = 1.5, RUN_MAX = 2.5, REPLACEMENTS = 2
const L = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : { cap: CAP, runs: [], interactive: [] }
const spent = () => [...L.runs, ...L.interactive].reduce((a, e) => a + (e.costUsd || 0), 0)
const save = () => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(L, null, 2) + "\n") }
const $ = x => `$${x.toFixed(2)}`
const [cmd, ...a] = process.argv.slice(2)

if (cmd === "pre") {
  const [task, reps] = [a[0], Number(a[1] || 3)]
  if (L.runs.filter(x => x.infra).length > REPLACEMENTS) { console.error(`✗ budget: more than ${REPLACEMENTS} infrastructure failures — stop and report`); process.exit(1) }
  const ceiling = Math.max(FLOOR, ...L.runs.filter(r => r.task === task).map(r => r.costUsd || 0))
  const projected = spent() + reps * ceiling
  if (projected > CAP) { console.error(`✗ budget: spent ${$(spent())} + ${reps} × ${$(ceiling)} = ${$(projected)} > cap ${$(CAP)} — batch not started`); process.exit(1) }
  console.log(`  ✓ budget: spent ${$(spent())}, batch worst case ${$(reps * ceiling)}, cap ${$(CAP)}`)
} else if (cmd === "post") {
  const [label, task, i, runJson] = a
  const r = JSON.parse(fs.readFileSync(runJson, "utf8"))
  const reasons = []
  if ((r.costUsd || 0) > RUN_MAX) reasons.push(`run cost ${$(r.costUsd)} > ${$(RUN_MAX)}`)
  if (r.error) reasons.push(`API/spend error: ${r.error}`)
  if (r.subtype === "error_max_turns") reasons.push("max-turns exit")
  if ((r.component?.useFigmaAttempts || 0) >= 3) reasons.push(`${r.component.useFigmaAttempts} use_figma attempts (approval loop)`)
  const infra = !!r.error
  L.runs.push({ label, task, run: Number(i), costUsd: r.costUsd || 0, date: new Date().toISOString(), stop: reasons, infra })
  save()
  if (spent() >= CAP) reasons.push(`cap reached: spent ${$(spent())}`)
  console.log(`  $ run ${$(r.costUsd || 0)} · phase 9 total ${$(spent())} / ${$(CAP)}`)
  if (reasons.length) {
    const kind = infra ? `infrastructure — replaceable (${L.runs.filter(x => x.infra).length}/${REPLACEMENTS} replacements used)` : "agent behaviour — kept as a failed result, never re-run"
    console.error(`✗ stop: ${reasons.join("; ")} [${kind}]`); process.exit(2)
  }
} else if (cmd === "interactive") {
  L.interactive.push({ what: a.slice(1).join(" "), costUsd: Number(a[0]), date: new Date().toISOString() }); save()
  console.log(`  $ logged ${$(Number(a[0]))} · phase 9 total ${$(spent())} / ${$(CAP)}`)
} else if (cmd === "status") {
  console.log(`phase 9 spend ${$(spent())} / ${$(CAP)} · ${L.runs.length} runs · ${L.runs.filter(x => x.infra).length}/${REPLACEMENTS} infrastructure failures`)
} else { console.error("usage: budget.mjs pre|post|interactive|status …"); process.exit(1) }
