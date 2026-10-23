#!/usr/bin/env node
/**
 * metrics-report — the north-star metric table, generated from CI results.
 *
 *   node scripts/metrics-report.mjs            write atlas-report.json + upsert the roadmap region
 *   node scripts/metrics-report.mjs --check    fail if the committed region is stale
 *   node scripts/metrics-report.mjs --json     print the report, write nothing
 *
 * Why this exists: a hand-maintained status table drifts from reality and, worse, drifts optimistically.
 * The rule here is that a metric has exactly three states and the generator cannot be talked out of them:
 *
 *   passing         a declared check ran and passed
 *   failing         a declared check ran and failed
 *   not measurable  no result for the declared check — reported as n/a, NEVER as 0 or as passing
 *
 * Absence of a signal is not a pass. That is the failure mode this whole roadmap phase exists to remove
 * (see docs/ATLAS-DELIVERY-ROADMAP.md R6), so it must not be reintroduced by the thing that reports on it.
 *
 * Inputs are declared per metric in metrics.manifest.json. Each source is optional: a source that has not
 * been produced yet simply leaves its metrics not measurable, which is the correct reading in early phases.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const MANIFEST = path.join(ROOT, "metrics.manifest.json")
const ROADMAP = path.join(ROOT, "docs/ATLAS-DELIVERY-ROADMAP.md")
const SPEC = path.join(ROOT, "docs/architecture/ATLAS-TARGET-ARCHITECTURE.md")
const REPORT = path.join(ROOT, "atlas-report.json")

const BEGIN = "<!-- BEGIN:generated-metrics -->"
const END = "<!-- END:generated-metrics -->"

const args = process.argv.slice(2)
const CHECK = args.includes("--check")
const JSON_ONLY = args.includes("--json")
const arg = (name) => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1] }

const read = (p) => fs.readFileSync(p, "utf8")
const readJson = (p) => JSON.parse(read(p))
const exists = (p) => fs.existsSync(p)
// the registry source needs ajv and the schemas; loaded only in a repo that has a registry
// the token-lint source shares atlas-verify's rule grouping, whose module needs typescript; loaded only
// in a repo that has token-lint
const tokenRules = exists(path.join(ROOT, "packages/governance/token-lint.mjs")) ? await import("./lib/token-rules.mjs") : null
const registryLib = exists(path.join(ROOT, "packages/registry/src"))
  ? { ...(await import("./lib/schemas.mjs")), ...(await import("./lib/registry-metrics.mjs")) }
  : null

/* ── status resolution ──────────────────────────────────── */

const NOT_MEASURABLE = "not measurable"

/**
 * Results from every available source, keyed `<source>:<check>` → true (pass) | false (fail).
 * A source file that does not exist contributes nothing, so its metrics stay not measurable.
 */
function collectResults(manifest) {
  const results = new Map()
  const coverage = new Map()
  manifest._coverage = coverage
  const found = []
  manifest._sourcesFound = found
  const dir = arg("--results") ? path.resolve(ROOT, arg("--results")) : path.join(ROOT, ".metrics")

  // atlas-verify --json: { results: [{ group, id, status }] }
  const verify = path.join(dir, "atlas-verify.json")
  if (exists(verify)) {
    found.push("atlas-verify")
    for (const r of readJson(verify).results ?? []) {
      if (r.status === "skip") continue // skipped is not a result; leave the metric not measurable
      results.set(`atlas-verify:${r.group}.${r.id}`, r.status === "pass")
      results.set(`atlas-verify:${r.id}`, r.status === "pass")
    }
  }

  // vitest / playwright --reporter=json: { testResults: [{ assertionResults: [{ fullName, status }] }] }
  for (const [source, file] of [["vitest", "vitest.json"], ["playwright", "playwright.json"]]) {
    const p = path.join(dir, file)
    if (!exists(p)) continue
    found.push(source)
    const data = readJson(p)
    for (const suite of data.testResults ?? data.suites ?? []) {
      for (const t of suite.assertionResults ?? suite.specs ?? []) {
        const name = t.fullName ?? t.title ?? ""
        if (!name) continue
        const ok = (t.status ?? t.ok) === "passed" || t.ok === true
        results.set(`${source}:${name}`, ok)
      }
    }
  }

  // atlas-sync: the committed atlas/tokens.json `figmaBound` block (roadmap D1, option C). It is generated
  // state, not a CI artifact, so it is read from the repo, not from the results dir. It measures drift
  // only over the code tokens some Figma component binds, so every result carries its coverage and the
  // row renders the fraction — a partial measurement must never read as full coverage.
  const tokens = path.join(ROOT, "atlas/tokens.json")
  const tokensJson = exists(tokens) ? readJson(tokens) : null
  const bound = tokensJson?.figmaBound ?? null
  // D1 option B: the whole variable table. Full coverage, so its rows carry no fraction.
  const table = tokensJson?.figmaTable ?? null
  if (table?.coverage?.figmaVariables > 0) {
    if (!found.includes("atlas-sync")) found.push("atlas-sync")
    for (const [id, list] of [["tokens.name-drift", table.drift?.nameDrift], ["tokens.missing-in-code", table.drift?.missingInCode], ["tokens.missing-in-figma", table.drift?.missingInFigma]]) {
      if (!Array.isArray(list)) continue // a renamed field is not a pass
      results.set(`atlas-sync:${id}`, list.length === 0)
      if (list.length) coverage.set(`atlas-sync:${id}`, { text: `${list.length} over all ${table.coverage.figmaVariables} Figma variables and ${table.coverage.codeTokens} code tokens`, full: true })
    }
  }
  if (bound?.coverage?.covered > 0) {
    if (!found.includes("atlas-sync")) found.push("atlas-sync")
    const { covered, codeTokens } = bound.coverage
    const partial = covered < codeTokens ? { covered, total: codeTokens } : null
    for (const [id, list] of [["tokens.bound-name-drift", bound.drift?.nameDrift], ["tokens.bound-missing-in-code", bound.drift?.missingInCode]]) {
      if (!Array.isArray(list)) continue // a renamed field is not a pass
      results.set(`atlas-sync:${id}`, list.length === 0)
      if (partial) coverage.set(`atlas-sync:${id}`, { text: `${list.length} drift over ${partial.covered}/${partial.total} covered (bound subset only)` })
    }
  }

  // registry: the committed registry (M3), measured by the same function atlas-verify's
  // design/registry-* checks run (scripts/lib/registry-metrics.mjs), over schema-valid inputs only. Like
  // atlas-sync it is committed state, so the region is reproducible with no CI run. Its population is
  // the registered types, so every row carries its coverage of the components.
  const inputs = registryLib === null ? { files: [] } : registryLib.loadInputs(ROOT)
  const valid = inputs.files.filter((f) => f.ok)
  const registryInvalid = inputs.files.some((f) => !f.ok && (f.file.startsWith("packages/registry/") || f.file.startsWith("atlas/metadata/")))
  const entries = Object.fromEntries(valid.filter((f) => /^packages\/registry\/src\/[^/]+\.registry\.json$/.test(f.file)).map((f) => [f.data.type, f.data]))
  if (Object.keys(entries).length > 0) {
    found.push("registry")
    const facts = Object.fromEntries(valid.filter((f) => /^packages\/registry\/generated\/[^/]+\.facts\.json$/.test(f.file)).map((f) => [f.data.name, f.data]))
    const el = valid.find((f) => f.file === "packages/registry/generated/elements.json")
    const components = valid.filter((f) => f.file.startsWith("atlas/metadata/")).map((f) => f.data.name)
    const m = registryLib.registryMetrics({ entries, facts, elements: el === undefined ? {} : el.data.elements, components })
    for (const [id, key] of [["design.registry-events", "events"], ["design.registry-fallback", "fallback"], ["design.registry-states", "states"]]) {
      const r = m[key]
      if (r.scope === 0) continue // nothing in scope is no result, never a pass
      // an invalid registry or metadata file is unreadable state: the metric fails rather than measuring around it
      results.set(`registry:${id}`, !registryInvalid && r.fails.length === 0)
      coverage.set(`registry:${id}`, { text: registryLib.coverageText(r) })
    }
  }

  // token-lint: the committed tree, measured by the same rules atlas-verify's code.raw-design-values and
  // code.reduced-motion-required report (METRIC_RULES, roadmap Phase 2d). Like registry it is committed
  // state, so the region is reproducible with no CI run. Output that is not token-lint's JSON is a
  // broken run: both rows fail rather than read as measured.
  const lintScript = path.join(ROOT, "packages/governance/token-lint.mjs")
  if (tokenRules !== null) {
    found.push("token-lint")
    let lint = null
    try { lint = JSON.parse(execFileSync("node", [lintScript, "--json"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })) }
    catch (e) { try { lint = JSON.parse(e.stdout) } catch { lint = null } } // token-lint exits 1 on violations
    for (const [id, rules] of Object.entries(tokenRules.METRIC_RULES)) {
      const ok = lint !== null && Array.isArray(lint.violations) && lint.scanned > 0
      results.set(`token-lint:${id}`, ok && !lint.violations.some((v) => rules.includes(v.rule)))
    }
  }

  // bench: a flat { metric: { pass: boolean } } analysis file
  const bench = path.join(dir, "bench.json")
  if (exists(bench)) {
    found.push("bench")
    for (const [k, v] of Object.entries(readJson(bench))) {
      results.set(`bench:${k}`, typeof v === "object" ? !!v.pass : !!v)
    }
  }

  return results
}

/**
 * A check matches when its declared name is a result key, or names a SUITE that result keys sit
 * inside. Any failing match makes the metric failing.
 *
 * The prefix must end at a delimiter. Without that boundary, `code.token-lint` would also match a
 * result called `code.token-lint-v2`, so renaming a check would silently keep its metric green —
 * the precise "a check stopped running but still reports PASS" failure this report exists to kill.
 * A renamed or removed check must read `not measurable`, never `passing`.
 */
const BOUNDARY = /[^A-Za-z0-9_-]/

function resolve(metric, results) {
  const key = `${metric.source}:${metric.check}`
  if (results.has(key)) return results.get(key) ? "passing" : "failing"

  const prefix = `${metric.source}:`
  const matches = [...results.entries()].filter(([k]) => {
    if (!k.startsWith(prefix)) return false
    const name = k.slice(prefix.length)
    if (!name.startsWith(metric.check)) return false
    const rest = name.slice(metric.check.length)
    return rest === "" || BOUNDARY.test(rest[0])
  })
  if (!matches.length) return NOT_MEASURABLE
  return matches.every(([, ok]) => ok) ? "passing" : "failing"
}

/* ── totality against the spec ──────────────────────────── */

/**
 * Every metric the spec names must appear in the manifest. Without this a metric can be quietly
 * dropped the moment it goes red, which is the same dishonesty as a hand-maintained table.
 */
function totality(manifest) {
  if (!exists(SPEC)) return [`spec not found at ${path.relative(ROOT, SPEC)}`]
  const declared = new Set(manifest.metrics.map((m) => m.metric.trim().toLowerCase()))
  const missing = []
  for (const line of read(SPEC).split("\n")) {
    // metric rows in the enforcement table: | Principle | Required metric | Target |
    const m = line.match(/^\|\s*(?!Principle\b)(?!-)([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/)
    if (!m) continue
    const name = m[2].trim()
    if (!name || /^-+$/.test(name) || name.toLowerCase() === "required metric") continue
    if (!declared.has(name.toLowerCase())) missing.push(name)
  }
  return missing.map((n) => `spec metric absent from manifest: "${n}"`)
}

/* ── render ─────────────────────────────────────────────── */

const esc = (s) => String(s).replace(/\|/g, "\\|")

function render(rows, manifest) {
  const counts = { passing: 0, failing: 0, [NOT_MEASURABLE]: 0 }
  for (const r of rows) counts[r.status]++
  const partial = rows.filter((r) => r.coverage && !r.coverage.full && r.status !== NOT_MEASURABLE).length

  const groups = []
  for (const r of rows) {
    const g = groups.find((x) => x.name === r.principle) ?? (groups.push({ name: r.principle, rows: [] }), groups.at(-1))
    g.rows.push(r)
  }

  const out = [
    BEGIN,
    "",
    `Generated by \`scripts/metrics-report.mjs\` from CI results. **Do not hand-edit** — \`metrics-report --check\``,
    "fails when this region is stale. Statuses are exactly three: **passing** (a declared check ran and passed),",
    "**failing** (ran and failed), **not measurable** (no result for the declared check — reported as `n/a`,",
    "never `0`). A metric with no check is *not measurable*, never passing: absence of a signal is not a pass.",
    "",
    `**${counts.passing} passing · ${counts.failing} failing · ${counts[NOT_MEASURABLE]} not measurable** of ${rows.length}.`
      + (partial ? ` ${partial} of the measured rows cover only part of their population; the row says how much.` : ""),
    "",
    manifest._sourcesFound?.length
      ? `Result sources read: ${manifest._sourcesFound.map((s) => `\`${s}\``).join(", ")}. Sources not present`
        + " leave their metrics not measurable."
      : "**No result sources were present**, so every metric reads not measurable. This is the committed"
        + " baseline: it is reproducible anywhere, with no CI run required. Collect results into `.metrics/`"
        + " (see the generator contract below) and regenerate to see real statuses; CI will commit"
        + " result-derived regions once it collects those files as artifacts (roadmap Phase 4).",
    "",
  ]

  for (const g of groups) {
    out.push(`### ${g.name}`, "", "| Metric | Target | Status | Check | Measurable at |", "|---|---:|---|---|---|")
    for (const r of g.rows) {
      const status = r.status === NOT_MEASURABLE ? "not measurable"
        : r.coverage ? `**${r.status}** — ${r.coverage.text}`
        : `**${r.status}**`
      out.push(`| ${esc(r.metric)} | ${esc(r.target)} | ${status} | \`${esc(r.check)}\` | ${esc(r.milestone)} |`)
    }
    out.push("")
  }

  out.push(
    "**How to read this.** A row is only as good as its check. `not measurable` is the honest state for",
    "most of this table today and it is what the roadmap's early phases exist to reduce — each phase is",
    "judged by how many rows it moves out of that column, not by how many are green.",
    "",
    END,
  )
  return out.join("\n")
}

/* ── main ───────────────────────────────────────────────── */

const manifest = readJson(MANIFEST)
const problems = totality(manifest)
const results = collectResults(manifest)

const rows = manifest.metrics.map((m) => ({
  principle: m.principle,
  metric: m.metric,
  target: m.target,
  source: m.source,
  check: m.check,
  milestone: m.milestone,
  status: resolve(m, results),
  coverage: manifest._coverage.get(`${m.source}:${m.check}`) ?? null,
}))

const report = {
  _generated: "GENERATED — do not hand-edit. Produced by scripts/metrics-report.mjs.",
  generatedAt: new Date().toISOString(),
  spec: path.relative(ROOT, SPEC),
  roadmap: path.relative(ROOT, ROADMAP),
  totals: {
    passing: rows.filter((r) => r.status === "passing").length,
    failing: rows.filter((r) => r.status === "failing").length,
    notMeasurable: rows.filter((r) => r.status === NOT_MEASURABLE).length,
    total: rows.length,
  },
  problems,
  metrics: rows,
}

if (JSON_ONLY) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(problems.length ? 1 : 0)
}

const section = render(rows, manifest)
const body = read(ROADMAP)
const at = body.indexOf(BEGIN)
if (at === -1) {
  console.error(`metrics-report: no ${BEGIN} marker in ${path.relative(ROOT, ROADMAP)}`)
  process.exit(1)
}
const next = `${body.slice(0, at)}${section}${body.slice(body.indexOf(END) + END.length)}`

if (CHECK) {
  const stale = next !== body
  for (const p of problems) console.error(`  ✗ ${p}`)
  if (stale) console.error("  ✗ docs/ATLAS-DELIVERY-ROADMAP.md metric region is stale — run: node scripts/metrics-report.mjs")
  if (!stale && !problems.length) {
    console.log(`✅ metrics-report: region current — ${report.totals.passing} passing · ${report.totals.failing} failing · ${report.totals.notMeasurable} not measurable`)
    process.exit(0)
  }
  process.exit(1)
}

fs.writeFileSync(ROADMAP, next)
fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`)
for (const p of problems) console.error(`  ✗ ${p}`)
console.log(`metrics-report → docs/ATLAS-DELIVERY-ROADMAP.md, atlas-report.json`)
console.log(`  ${report.totals.passing} passing · ${report.totals.failing} failing · ${report.totals.notMeasurable} not measurable of ${report.totals.total}`)
process.exit(problems.length ? 1 : 0)
