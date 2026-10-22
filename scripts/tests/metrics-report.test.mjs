/**
 * metrics-report tests.
 *
 * The property under test is honesty, not formatting: a metric may only read `passing` when a declared
 * check actually ran and passed. Everything else — no result, a skipped check, a renamed field, a
 * missing source file — must read `not measurable`, never `passing` and never `0`.
 *
 * Each case builds a throwaway repo (manifest + spec + roadmap + fake CI results) and runs the real
 * script against it, so the tests exercise the script rather than a copy of its logic.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const REAL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const SCRIPT = path.join(REAL_ROOT, "scripts/metrics-report.mjs")

const BEGIN = "<!-- BEGIN:generated-metrics -->"
const END = "<!-- END:generated-metrics -->"

/** A minimal repo: one spec metric, one manifest row, an empty generated region. */
function scaffold({ metrics, spec, results }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "metrics-report-"))
  fs.mkdirSync(path.join(dir, "scripts"), { recursive: true })
  fs.mkdirSync(path.join(dir, "docs/architecture"), { recursive: true })
  fs.copyFileSync(SCRIPT, path.join(dir, "scripts/metrics-report.mjs"))

  fs.writeFileSync(path.join(dir, "metrics.manifest.json"), JSON.stringify({ metrics }, null, 2))

  const rows = (spec ?? metrics.map((m) => [m.principle, m.metric, m.target]))
    .map(([p, m, t]) => `| ${p} | ${m} | ${t} |`).join("\n")
  fs.writeFileSync(path.join(dir, "docs/architecture/ATLAS-TARGET-ARCHITECTURE.md"),
    `# spec\n\n| Principle | Required metric | Passing target |\n|---|---|---:|\n${rows}\n`)

  fs.writeFileSync(path.join(dir, "docs/ATLAS-DELIVERY-ROADMAP.md"), `# roadmap\n\n${BEGIN}\n${END}\n`)

  if (results) {
    fs.mkdirSync(path.join(dir, ".metrics"), { recursive: true })
    for (const [file, body] of Object.entries(results)) {
      fs.writeFileSync(path.join(dir, ".metrics", file), JSON.stringify(body, null, 2))
    }
  }
  return dir
}

function run(dir, args = []) {
  try {
    const out = execFileSync(process.execPath, [path.join(dir, "scripts/metrics-report.mjs"), ...args],
      { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
    return { code: 0, out }
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` }
  }
}

const region = (dir) => {
  const s = fs.readFileSync(path.join(dir, "docs/ATLAS-DELIVERY-ROADMAP.md"), "utf8")
  return s.slice(s.indexOf(BEGIN), s.indexOf(END))
}

/**
 * Only the table's data rows. The region's preamble explains the three statuses and so contains the
 * words "passing" and "failing" verbatim; asserting against the whole region would match the prose.
 */
const rows = (dir) => region(dir)
  .split("\n")
  .filter((l) => l.startsWith("|") && !l.startsWith("|---") && !l.startsWith("| Metric"))
  .join("\n")

const ONE = [{
  principle: "Fallback", metric: "Unhandled render exceptions", target: "0",
  source: "vitest", check: "runtime/fuzz", milestone: "M4",
}]

const verifyRow = (status) => ({ results: [{ group: "code", id: "token-lint", status }] })
const vitestRow = (fullName, status) => ({ testResults: [{ assertionResults: [{ fullName, status }] }] })

/* ── the three states ───────────────────────────────────── */

test("no results at all → not measurable, never passing", () => {
  const dir = scaffold({ metrics: ONE })
  assert.equal(run(dir).code, 0)
  assert.match(rows(dir), /not measurable/)
  assert.doesNotMatch(rows(dir), /\*\*passing\*\*/)
  assert.match(region(dir), /0 passing · 0 failing · 1 not measurable/)
})

test("a declared check that ran and passed → passing", () => {
  const dir = scaffold({ metrics: ONE, results: { "vitest.json": vitestRow("runtime/fuzz > no payload throws", "passed") } })
  run(dir)
  assert.match(rows(dir), /\*\*passing\*\*/)
  assert.match(region(dir), /1 passing · 0 failing · 0 not measurable/)
})

test("a declared check that ran and failed → failing", () => {
  const dir = scaffold({ metrics: ONE, results: { "vitest.json": vitestRow("runtime/fuzz > no payload throws", "failed") } })
  run(dir)
  assert.match(rows(dir), /\*\*failing\*\*/)
  assert.match(region(dir), /0 passing · 1 failing · 0 not measurable/)
})

test("one failing match among passing ones makes the metric failing", () => {
  const dir = scaffold({
    metrics: ONE,
    results: { "vitest.json": { testResults: [{ assertionResults: [
      { fullName: "runtime/fuzz > case a", status: "passed" },
      { fullName: "runtime/fuzz > case b", status: "failed" },
    ] }] } },
  })
  run(dir)
  assert.match(rows(dir), /\*\*failing\*\*/)
})

/* ── the ways a check can silently stop running ─────────── */

test("a SKIPPED atlas-verify check is not a result → not measurable", () => {
  const metrics = [{ ...ONE[0], source: "atlas-verify", check: "code.token-lint" }]
  const dir = scaffold({ metrics, results: { "atlas-verify.json": verifyRow("skip") } })
  run(dir)
  assert.match(rows(dir), /not measurable/)
  assert.doesNotMatch(rows(dir), /\*\*passing\*\*/)
})

test("a renamed check no longer matches → not measurable, not a stale pass", () => {
  const metrics = [{ ...ONE[0], source: "atlas-verify", check: "code.token-lint" }]
  const pass = scaffold({ metrics, results: { "atlas-verify.json": verifyRow("pass") } })
  run(pass)
  assert.match(rows(pass), /\*\*passing\*\*/)

  const renamed = scaffold({
    metrics,
    results: { "atlas-verify.json": { results: [{ group: "code", id: "token-lint-v2", status: "pass" }] } },
  })
  run(renamed)
  assert.match(rows(renamed), /not measurable/)
})

test("a missing source file leaves its metrics not measurable rather than erroring", () => {
  const dir = scaffold({ metrics: [{ ...ONE[0], source: "playwright", check: "runtime-demo > ack p95" }] })
  assert.equal(run(dir).code, 0)
  assert.match(rows(dir), /not measurable/)
})

test("the word 0 is never used to report an unmeasured metric", () => {
  const dir = scaffold({ metrics: ONE })
  run(dir)
  const row = rows(dir).split("\n").find((l) => l.includes("Unhandled render exceptions"))
  assert.match(row, /not measurable/)
  // the target column legitimately holds 0; the status column must not claim it
  assert.doesNotMatch(row.split("|").slice(3).join("|"), /\b0\b/)
})

/* ── totality against the spec ──────────────────────────── */

test("a spec metric absent from the manifest fails the run", () => {
  const dir = scaffold({
    metrics: ONE,
    spec: [["Fallback", "Unhandled render exceptions", "0"], ["Fallback", "Fallback render latency", "Under 100 ms p95"]],
  })
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /Fallback render latency/)
})

test("a manifest covering every spec metric passes totality", () => {
  const metrics = [
    ONE[0],
    { principle: "Fallback", metric: "Fallback render latency", target: "Under 100 ms p95", source: "playwright", check: "runtime-demo > fallback p95", milestone: "M4" },
  ]
  assert.equal(run(scaffold({ metrics })).code, 0)
})

/* ── --check ────────────────────────────────────────────── */

test("--check passes on a freshly generated region and is stable across runs", () => {
  const dir = scaffold({ metrics: ONE })
  run(dir)
  assert.equal(run(dir, ["--check"]).code, 0)
  run(dir)
  assert.equal(run(dir, ["--check"]).code, 0, "a second generate must not change the region")
})

test("--check fails on a hand-edited status", () => {
  const dir = scaffold({ metrics: ONE })
  run(dir)
  const p = path.join(dir, "docs/ATLAS-DELIVERY-ROADMAP.md")
  fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace("not measurable", "**passing**"))
  const { code, out } = run(dir, ["--check"])
  assert.equal(code, 1)
  assert.match(out, /stale/)
})

test("--check fails when results changed but the region was not regenerated", () => {
  const dir = scaffold({ metrics: ONE })
  run(dir)
  assert.equal(run(dir, ["--check"]).code, 0)
  fs.mkdirSync(path.join(dir, ".metrics"), { recursive: true })
  fs.writeFileSync(path.join(dir, ".metrics/vitest.json"),
    JSON.stringify(vitestRow("runtime/fuzz > no payload throws", "passed")))
  assert.equal(run(dir, ["--check"]).code, 1)
})

test("--check does not write the roadmap", () => {
  const dir = scaffold({ metrics: ONE })
  run(dir)
  const before = fs.readFileSync(path.join(dir, "docs/ATLAS-DELIVERY-ROADMAP.md"), "utf8")
  fs.mkdirSync(path.join(dir, ".metrics"), { recursive: true })
  fs.writeFileSync(path.join(dir, ".metrics/vitest.json"),
    JSON.stringify(vitestRow("runtime/fuzz > no payload throws", "passed")))
  run(dir, ["--check"]) // results changed, so --check must report staleness without fixing it
  assert.equal(fs.readFileSync(path.join(dir, "docs/ATLAS-DELIVERY-ROADMAP.md"), "utf8"), before)
})

test("a missing region marker fails rather than appending silently", () => {
  const dir = scaffold({ metrics: ONE })
  fs.writeFileSync(path.join(dir, "docs/ATLAS-DELIVERY-ROADMAP.md"), "# roadmap\n\nno markers here\n")
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /marker/)
})
