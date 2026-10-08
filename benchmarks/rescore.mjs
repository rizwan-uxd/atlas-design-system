#!/usr/bin/env node
// rescore.mjs <label> <task>... — add w1.patternStrict to existing run-N.json files, from the saved workspaces
// under $TMPDIR/atlas-bench/<label>-<task>-<n>. Used to score the baseline arm with checks written after it ran.
import fs from "fs"; import path from "path"; import os from "os"; import { fileURLToPath } from "url"
import { scoreStrict } from "./lib/strict.mjs"
const [label, ...tasks] = process.argv.slice(2)
const here = path.dirname(fileURLToPath(import.meta.url))
const tmp = process.env.TMPDIR || os.tmpdir()
for (const task of tasks) {
  const meta = JSON.parse(fs.readFileSync(path.join(here, "tasks", task, "meta.json"), "utf8"))
  const dir = path.join(here, "results", label, task)
  for (const f of fs.readdirSync(dir).filter(x => /^run-\d+\.json$/.test(x))) {
    const n = f.match(/\d+/)[0]
    const out = path.join(tmp, "atlas-bench", `${label}-${task}-${n}`, "app/prototypes", meta.slug)
    const files = []
    const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => e.isDirectory() ? walk(path.join(d, e.name)) : /\.tsx?$/.test(e.name) && files.push(path.join(d, e.name)))
    if (!fs.existsSync(out)) { console.error(`✗ no saved workspace for ${label} ${task} run ${n}: ${out}`); process.exit(1) }
    walk(out)
    const src = files.map(x => fs.readFileSync(x, "utf8")).join("\n")
    const run = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))
    run.w1.patternStrict = { ...scoreStrict(src, meta.w1.strictChecks), rescored: true }
    fs.writeFileSync(path.join(dir, f), JSON.stringify(run, null, 2))
    console.log(`${label} ${task} run ${n}: ${run.w1.patternStrict.passed}/${run.w1.patternStrict.total}  fails: ${run.w1.patternStrict.results.filter(r => !r.pass).map(r => r.id).join(", ") || "-"}`)
  }
}
