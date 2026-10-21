#!/usr/bin/env node
// apply-fixture.mjs <workspace> <meta.json> — wave 2: remove a pattern from the throwaway workspace (T18 only).
// Deletes files, drops matching lines, and replaces text, as meta.fixtureRemove says. Never touches the repo.
import fs from "fs"; import path from "path"
const [ws, metaPath] = process.argv.slice(2)
const fx = JSON.parse(fs.readFileSync(metaPath, "utf8")).fixtureRemove
if (!fx) process.exit(0)
const at = p => path.join(ws, p)
for (const f of fx.files || []) fs.rmSync(at(f), { force: true })
for (const [f, needle] of Object.entries(fx.lines || {})) {
  const src = fs.readFileSync(at(f), "utf8")
  fs.writeFileSync(at(f), src.split("\n").filter(l => !l.includes(needle)).join("\n"))
}
// the machine-readable index (atlas/index.json) lists patterns as an array: drop the entry by slug
for (const [f, slug] of Object.entries(fx.patternsJson || {})) {
  const j = JSON.parse(fs.readFileSync(at(f), "utf8"))
  j.patterns = j.patterns.filter(p => p.slug !== slug)
  fs.writeFileSync(at(f), JSON.stringify(j, null, 2) + "\n")
}
for (const [f, [from, to]] of Object.entries(fx.replace || {})) {
  const src = fs.readFileSync(at(f), "utf8")
  if (!src.includes(from)) { console.error(`✗ fixture: "${from}" not found in ${f}`); process.exit(1) }
  fs.writeFileSync(at(f), src.split(from).join(to))
}
