/**
 * CI workflow sanity.
 *
 * Added after a real near-miss: merging two branches that had each appended a job to ci.yml produced a
 * DUPLICATE `metrics:` key. Git auto-merged it without a conflict, and nothing in this repo validates
 * YAML, so a workflow with a silently-overridden job would have shipped. Two branches appending a job
 * at the end of the same file is the normal case here, not an unusual one, so this will recur.
 *
 * Deliberately dependency-free: pyyaml/js-yaml are not available and a real parser is overkill for the
 * one property that matters — top-level job keys are unique, and every job a branch adds is intact.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const WORKFLOWS = path.join(ROOT, ".github/workflows")

const files = fs.existsSync(WORKFLOWS)
  ? fs.readdirSync(WORKFLOWS).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
  : []

/** Keys at exactly two-space indent inside the `jobs:` block. */
function jobKeys(src) {
  const lines = src.split("\n")
  const start = lines.findIndex((l) => /^jobs:\s*$/.test(l))
  if (start === -1) return []
  const keys = []
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i]
    if (l.trim() === "" || l.trimStart().startsWith("#")) continue
    if (!l.startsWith(" ")) break // left the jobs block
    const m = l.match(/^ {2}([A-Za-z_][\w-]*):\s*$/)
    if (m) keys.push({ key: m[1], line: i + 1 })
  }
  return keys
}

test("there is at least one workflow to check", () => {
  assert.ok(files.length > 0, "no workflow files found")
})

for (const file of files) {
  const src = fs.readFileSync(path.join(WORKFLOWS, file), "utf8")

  test(`${file}: top-level job keys are unique`, () => {
    const keys = jobKeys(src)
    const seen = new Map()
    const dupes = []
    for (const { key, line } of keys) {
      if (seen.has(key)) dupes.push(`${key} (lines ${seen.get(key)} and ${line})`)
      else seen.set(key, line)
    }
    assert.deepEqual(dupes, [], `duplicate job key(s) — a merge probably appended a second copy: ${dupes.join(", ")}`)
  })

  test(`${file}: no leftover merge conflict markers`, () => {
    const bad = src.split("\n")
      .map((l, i) => ({ l, n: i + 1 }))
      .filter(({ l }) => /^(<{7}|={7}|>{7})(\s|$)/.test(l))
    assert.deepEqual(bad.map(({ n }) => n), [], "conflict markers left in a workflow")
  })

  test(`${file}: every job has a runner and steps`, () => {
    // catches a half-removed job: the key survives a bad edit but its body does not
    const keys = jobKeys(src)
    const lines = src.split("\n")
    for (const { key, line } of keys) {
      let body = ""
      for (let i = line; i < lines.length; i++) {
        if (/^ {2}[A-Za-z_][\w-]*:\s*$/.test(lines[i]) || !/^(\s|$)/.test(lines[i])) break
        body += `${lines[i]}\n`
      }
      assert.match(body, /runs-on:/, `job "${key}" has no runs-on`)
      assert.match(body, /steps:/, `job "${key}" has no steps`)
    }
  })
}

test("ci.yml still runs the checks the roadmap depends on", () => {
  const src = fs.readFileSync(path.join(WORKFLOWS, "ci.yml"), "utf8")
  // these are load-bearing for docs/ATLAS-DELIVERY-ROADMAP.md: losing one to a bad merge would make
  // a phase's exit criteria unenforced while CI still looked green
  for (const needle of [
    "npm run test:scripts",      // the parser and comparator tests
    "atlas:verify",              // design/figma-code lives here
    "--max-figma-age",           // M1's staleness gate
    "metrics-report.mjs",        // the metric manifest totality gate
    "token-lint",
  ]) {
    assert.ok(src.includes(needle), `ci.yml no longer runs ${needle}`)
  }
})
