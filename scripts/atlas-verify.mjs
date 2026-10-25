#!/usr/bin/env node
/**
 * atlas-verify — check work before reporting it done.
 *
 * Three groups, each a pass/fail line plus its mismatches:
 *   design  snapshot current · variants/sizes used vs atlas/metadata · no new use of a deprecated asset · tokens exist and are semantic
 *   code    token-lint (+ raw-design-values, reduced-motion-required) · tsc · tests · Atlas components over raw controls · basic a11y · prototype registered
 *   scope   diff stays inside --scope · no new tokens · no new components
 *
 * Design and code checks look only at files changed against --base (tracked diff + untracked), so a
 * clean tree passes and a task is judged on what it touched. token-lint, tsc and tests run repo-wide.
 *
 * Usage:
 *   node scripts/atlas-verify.mjs                                   # changes vs HEAD
 *   node scripts/atlas-verify.mjs --scope "app/prototypes/foo/**,app/prototypes/_shared/flowRegistry.ts"
 *   node scripts/atlas-verify.mjs --base main --allow-new-component --skip tests
 *   node scripts/atlas-verify.mjs --json
 *   node scripts/atlas-verify.mjs --only design.schemas,tokens            # just these checks; the rest SKIP
 *   node scripts/atlas-verify.mjs --scope "…" --stamp                  # on a full pass, stamp verifiedAt
 *   node scripts/atlas-verify.mjs --stamp-components Button,Input     # same, for named components with no library change
 *
 * Exit: 0 when no check fails (warnings allowed), 1 when any check fails.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { sh, ATLAS_IMPORT, RAW_ELEMENT, lengthLiterals, PRIMITIVE_TOKEN_REF, BRAND_FILE, lineOf, jsxTags, literalProp, UNKNOWN } from "./lib/quality-checks.mjs"
import { compareAxes } from "./lib/compare-axes.mjs"
import { registryMetrics, coverageText } from "./lib/registry-metrics.mjs"
import { loadInputs } from "./lib/schemas.mjs"
import { METRIC_RULES } from "./lib/token-rules.mjs"
import { contrastCheck } from "./lib/contrast.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
const flag = (n) => args.includes(n)
const opt = (n) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : undefined }
const list = (v) => (v || "").split(",").map((s) => s.trim()).filter(Boolean)

const BASE = opt("--base") || "HEAD"
const SCOPE = list(opt("--scope"))
const SKIP = new Set(list(opt("--skip")))
// --only a,b runs just those checks (by id or group.id) and reports the rest as skipped — so --stamp,
// which refuses any run with a skip, can never be satisfied by a partial run
const ONLY = new Set(list(opt("--only")))
const JSON_OUT = flag("--json")
const ALLOW_COMPONENT = flag("--allow-new-component")
const ALLOW_TOKEN = flag("--allow-new-token")
// --stamp-components A,B stamps named components on a full pass even when no library file changed (a verification-only task); implies --stamp
const STAMP_NAMED = new Set(list(opt("--stamp-components")))
const STAMP = flag("--stamp") || STAMP_NAMED.size > 0
// --max-figma-age <days> makes a stale Figma side a FAILURE rather than a warning. Off by default so
// a local run is not blocked by it; CI passes a value. Needed because atlas-sync's carriedForward()
// rewrites the snapshot from itself when no --pull is supplied, so "Figma wins" would otherwise mean
// "the last pull wins, forever, undetectably".
const MAX_FIGMA_AGE = opt("--max-figma-age") === undefined ? null : Number(opt("--max-figma-age"))

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8")
const exists = (rel) => fs.existsSync(path.join(ROOT, rel))
const git = (cmd) => sh(`git ${cmd}`, ROOT).out.split("\n").filter(Boolean)

// ─── Changed files ───────────────────────────────────────────────────────────

const deleted = new Set(git(`diff --name-only --diff-filter=D ${BASE}`))
const changed = [...new Set([...git(`diff --name-only ${BASE}`), ...git("ls-files --others --exclude-standard")])]
  .filter((f) => !deleted.has(f)).sort()
const isSource = (f) => /\.(tsx?|css)$/.test(f) && /^(app|packages\/ui-web\/src)\//.test(f)
const sources = changed.filter((f) => isSource(f) && exists(f)).map((f) => ({ file: f, src: read(f) }))
const appSources = sources.filter((s) => s.file.startsWith("app/"))

// ─── Result collection ───────────────────────────────────────────────────────

const results = []
// Every check returns `inspected` (how much it actually looked at) and `scope` (how much the run says it
// should have looked at). Enforced here rather than trusted per check (M2): a check that reports no
// count fails, and one that inspected nothing when its scope was non-empty fails — that is the shape
// of a parser or a renamed field silently turning a check into a PASS.
const check = (group, id, fn) => {
  const named = (set) => set.has(id) || set.has(`${group}.${id}`)
  if (named(SKIP) || (ONLY.size && !named(ONLY))) return results.push({ group, id, status: "skip", mismatches: [] })
  let { status, mismatches = [], note, inspected, scope = 0 } = fn()
  if (typeof inspected !== "number" || !Number.isFinite(inspected)) {
    status = "fail"; mismatches = [`${group}/${id} reported no inspection count — every check must say what it inspected`, ...mismatches]
  } else if (scope > 0 && inspected === 0) {
    status = "fail"; mismatches = [`0 inspected, ${scope} in scope — the check looked at nothing it should have`, ...mismatches]
  }
  results.push({ group, id, status, mismatches, note, inspected, scope })
}
const verdict = (fails, warns = []) =>
  fails.length ? { status: "fail", mismatches: [...fails, ...warns] } : { status: warns.length ? "warn" : "pass", mismatches: warns }

// ─── Snapshot facts ──────────────────────────────────────────────────────────

// Every JSON input is read here, once, through its schema (packages/governance/schemas). A check only
// ever sees data that validated: a renamed or retyped field is a design/schemas FAIL, never a check
// that silently stops inspecting anything. Checks that depend on an invalid file fail closed on it.
const inputs = loadInputs(ROOT)
const invalidInputs = (prefix) => inputs.files.filter((f) => !f.ok && f.file.startsWith(prefix)).map((f) => f.file)
const metadata = {}
for (const f of inputs.files) if (f.ok && f.file.startsWith("atlas/metadata/")) metadata[f.data.name] = f.data
const invalidMetadata = invalidInputs("atlas/metadata/")
// the registry (M3): authored entries, generated facts and element facts, each only if it validated
const registry = { entries: {}, facts: {}, elements: {} }
for (const f of inputs.files) {
  if (!f.ok) continue
  if (/^packages\/registry\/src\/[^/]+\.registry\.json$/.test(f.file)) registry.entries[f.data.type] = f.data
  if (/^packages\/registry\/generated\/[^/]+\.facts\.json$/.test(f.file)) registry.facts[f.data.name] = f.data
  if (f.file === "packages/registry/generated/elements.json") registry.elements = f.data.elements
}
const invalidRegistry = [...invalidInputs("packages/registry/src/"), ...invalidInputs("packages/registry/generated/")]
const TOKEN_CSS = "packages/tokens/atlas.tokens.css"
const definedTokens = (css) => new Set([...css.matchAll(/(--atlas-[\w-]+)\s*:/g)].map((m) => m[1]))
const tokens = exists(TOKEN_CSS) ? definedTokens(read(TOKEN_CSS)) : new Set()

// Library modules that are infrastructure, not Figma components. They need no atlas/metadata entry —
// unless one is added there, which registers it as a component again.
const NON_COMPONENT_MODULES = new Set(["motion", "animated-icons"])

// Atlas components used by a file: import path @atlas/ui-web/<tier>/<Name>/<Name> → local names.
const atlasUsage = (src) => {
  const used = []
  for (const m of src.matchAll(ATLAS_IMPORT)) {
    const name = m[2].split("/").pop()
    if (NON_COMPONENT_MODULES.has(m[2].split("/")[2]) && !metadata[name]) continue
    for (const part of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
      const [exported, local = exported] = part.split(/\s+as\s+/)
      used.push({ component: name, exported, local })
    }
  }
  return used
}

// ─── design ──────────────────────────────────────────────────────────────────

const libChanged = new Set() // components whose library folder changed — the only ones --stamp marks verified
const touched = new Set()
for (const { file, src } of sources) {
  for (const u of atlasUsage(src)) touched.add(u.component)
  const lib = file.match(/^packages\/ui-web\/src\/\w+\/(\w+)\//)
  if (lib) { touched.add(lib[1]); libChanged.add(lib[1]) }
}

// M2 — runs first. Reports every input that failed its schema and every JSON file no schema covers.
check("design", "schemas", () => {
  const fails = [...inputs.problems]
  for (const f of inputs.files) for (const e of f.errors) fails.push(`${f.file}: ${e}`)
  const schemas = new Set(inputs.files.map((f) => f.schema.split("#")[0])).size
  const ok = inputs.files.filter((f) => f.ok).length
  return { ...verdict(fails), inspected: inputs.files.length, scope: 1, note: `${ok}/${inputs.files.length} files valid · ${schemas} schemas` }
})

check("design", "snapshot-current", () => {
  const fails = [], warns = []
  const sync = sh("node scripts/atlas-sync.mjs --check", ROOT).out
  const pending = Number((sync.match(/would write\s+(\d+)/) || [])[1] || 0)
  const synced = Number((sync.match(/^\s*components\s+(\d+)/m) || [])[1] || 0)
  if (!/would write/.test(sync)) fails.push("atlas-sync --check did not run: " + sync.trim().split("\n").pop())
  else if (pending) fails.push(`atlas/ is behind the code: atlas-sync would write ${pending} file(s) — run npm run atlas:sync`)
  for (const name of [...touched].sort()) {
    const m = metadata[name]
    if (!m && invalidMetadata.includes(`atlas/metadata/${name}.json`)) fails.push(`${name}: atlas/metadata/${name}.json failed its schema (see design/schemas)`)
    else if (!m) fails.push(`${name}: no atlas/metadata/${name}.json`)
    else if (!m.syncedAt || m.source !== "figma-synced") warns.push(`${name}: snapshot is ${m.source ?? "unsourced"}, syncedAt ${m.syncedAt} — stale, escalate to Figma for design facts`)
  }
  return { ...verdict(fails, warns), inspected: synced, scope: 1, note: `${synced} components in the sync · ${touched.size} touched` }
})

// M1, made three-way in M3 — the independent Figma→registry→code comparison. Unlike variants-sizes
// (which validates JSX against metadata generated FROM the code, and so is code-vs-code), this compares
// code against metadata.figmaProperties, written straight from the Figma pull, and the authored
// registry entries against both (enums, State classification, slots), failing on the registry side.
// It runs repo-wide, not over the diff: Figma drift is a property of the whole snapshot, and a PR that
// happens to touch no component must not be able to hide it.
//
// It FAILS CLOSED. Missing, empty or malformed Figma data is a failure, never "zero drift" — a
// component whose Figma side is unreadable is unverifiable, and unverifiable must never read as
// "agrees". Zero inspections is likewise a failure, not a clean run.
check("design", "figma-registry-code", () => {
  const fails = [], warns = []
  const MAP = "packages/registry/figma-axis-map.json"
  if (!exists(MAP)) return { status: "fail", inspected: 0, mismatches: [`${MAP} is missing — the axis map is authored, not generated`] }
  const axisMap = inputs.valid(MAP)
  if (!axisMap) return { status: "fail", inspected: 0, mismatches: [`${MAP} failed its schema — see design/schemas; nothing compared`] }
  // a component whose metadata failed its schema is unverifiable: a failure here too, never left out quietly
  for (const f of invalidMetadata) fails.push(`${f} failed its schema — not compared (see design/schemas)`)

  const codeConnect = new Map()
  const CC_DIR = "packages/figma-sync/code-connect"
  if (exists(CC_DIR)) for (const f of fs.readdirSync(path.join(ROOT, CC_DIR))) {
    if (f.endsWith(".figma.tsx")) codeConnect.set(f.replace(".figma.tsx", ""), read(`${CC_DIR}/${f}`))
  }

  // the registry leg: entries and facts that failed their schema are failures here too, never skipped
  for (const f of invalidRegistry) fails.push(`${f} failed its schema — the registry leg cannot trust it (see design/schemas)`)
  if (Object.keys(registry.entries).length === 0) fails.push("0 registry entries in packages/registry/src — the registry leg compared nothing")

  let result
  try {
    result = compareAxes({ components: Object.values(metadata), codeConnect, axisMap, registry: { entries: registry.entries, facts: registry.facts } })
  } catch (e) {
    // the comparator throws rather than optional-chaining past an absent field; a throw is a FAIL
    // that names the cause, never a skip
    return { status: "fail", inspected: 0, mismatches: [`comparison could not run: ${e.message}`] }
  }

  // structural findings already name the component, so only prefix when an axis is involved
  for (const f of result.findings) {
    fails.push(f.axis === null ? `[${f.side}] ${f.detail}` : `[${f.side}] ${f.component}/${f.axis}: ${f.detail}`)
  }

  const { components: inspected, axes } = result.inspected
  const total = result.inspected.total + invalidMetadata.length
  if (total === 0) fails.push("no components in atlas/metadata — 0 inspected is a failure, not a pass")
  else if (inspected === 0) fails.push(`0 of ${total} components were comparable — every one had unreadable figmaProperties`)
  else if (axes === 0) fails.push(`${inspected} component(s) inspected but 0 axes compared — the axis map classifies everything away`)

  for (const a of result.unmappedAxes) {
    const dot = a.indexOf(".")
    warns.push(`${a.slice(0, dot)}/${a.slice(dot + 1)}: Figma draws this axis and code does not model it (see "${a.slice(dot + 1)}" in ${MAP} for the reason)`)
  }

  // Staleness. metadata.syncedAt already IS the Figma pull time: atlas-sync derives it from
  // pull.pulledAt, and carriedForward() reuses the value already in the snapshot, so it never
  // advances without a real --pull. What was missing is a gate, not another field.
  let ageNote = ""
  if (MAX_FIGMA_AGE !== null) {
    if (!Number.isFinite(MAX_FIGMA_AGE) || MAX_FIGMA_AGE < 0) {
      fails.push(`--max-figma-age expects a number of days, got ${JSON.stringify(opt("--max-figma-age"))}`)
    } else {
      const now = Date.now()
      let oldestDays = null
      for (const m of Object.values(metadata)) {
        const synced = Object.prototype.hasOwnProperty.call(m, "syncedAt") ? m.syncedAt : undefined
        if (synced === undefined || synced === null) {
          fails.push(`${m.name}: syncedAt is ${synced === undefined ? "absent" : "null"} — the Figma side has never been pulled, so it cannot be compared`)
          continue
        }
        const t = Date.parse(synced)
        if (Number.isNaN(t)) { fails.push(`${m.name}: syncedAt ${JSON.stringify(synced)} is not a date`); continue }
        const days = (now - t) / 86_400_000
        if (oldestDays === null || days > oldestDays) oldestDays = days
        if (days > MAX_FIGMA_AGE) {
          fails.push(`${m.name}: Figma facts are ${days.toFixed(0)} days old (limit ${MAX_FIGMA_AGE}) — re-run the atlas-figma-sync skill with --pull`)
        }
      }
      if (oldestDays !== null) ageNote = ` · oldest Figma pull ${oldestDays.toFixed(0)}d (limit ${MAX_FIGMA_AGE}d)`
    }
  }

  const r = result.registry
  const note = `${inspected}/${total} components · ${axes} axes compared · registry ${r.entries} entries (${r.enums} enums, ${r.states} State, ${r.slots} slots)`
    + ` · ${result.deferredAxes.length} state axes on unregistered components`
    + (result.unmappedAxes.length ? ` · ${result.unmappedAxes.length} unmapped` : "") + ageNote
  return { ...verdict(fails, warns), inspected: axes, scope: total, note }
})

// M3 — the three registry metrics (metrics.manifest.json). The logic is scripts/lib/registry-metrics.mjs,
// shared with metrics-report so the check and the metric row cannot disagree. Repo-wide like
// figma-registry-code. The population is registered types only; the note says how many of the
// components that is, so a pass is never read as covering all of them.
const metrics = registryMetrics({ ...registry, components: Object.keys(metadata) })
const registryCheck = (id, key, what) => check("design", id, () => {
  const r = metrics[key]
  const fails = [...invalidRegistry.map((f) => `${f} failed its schema — not measured (see design/schemas)`), ...r.fails]
  if (Object.keys(registry.entries).length === 0) fails.push("0 registry entries in packages/registry/src — nothing to measure")
  return { ...verdict(fails), inspected: r.inspected, scope: r.scope, note: `${what} · ${coverageText(r)}` }
})
registryCheck("registry-events", "events", "typed events")
registryCheck("registry-fallback", "fallback", "terminating fallback")
registryCheck("registry-states", "states", "Figma states classified")

// A literal variant/size is checked against metadata; an expression or spread is UNKNOWN — counted and
// reported in the note, never read as "no variant". Scope is every changed file that renders an Atlas
// component; finding none of its tags means the scanner failed, not that the file is clean.
check("design", "variants-sizes", () => {
  const fails = []
  const inScope = new Set(), scanned = new Set()
  let tags = 0, literal = 0, dynamic = 0
  for (const { file, src } of sources) for (const u of atlasUsage(src)) {
    const m = metadata[u.component]
    if (!m || !(u.exported === u.component || u.exported === `${u.component}Root`)) continue
    inScope.add(file)
    for (const tag of jsxTags(src, u.local, file)) {
      tags++; scanned.add(file)
      for (const [prop, allowed] of [["variant", m.variants], ["size", m.sizes]]) {
        const value = literalProp(tag, prop)
        if (value === UNKNOWN) { dynamic++; continue }
        if (value === undefined) continue
        literal++
        if (allowed.length && !allowed.includes(value))
          fails.push(`${file}:${tag.line} <${u.local} ${prop}="${value}"> — ${u.component} ${prop}s are ${allowed.join(" | ")}`)
      }
    }
  }
  return { ...verdict(fails), inspected: scanned.size, scope: inScope.size,
    note: `${scanned.size} files · ${tags} tags · ${literal} literal props · ${dynamic} dynamic` }
})

// Deprecated assets (packages/governance/deprecations.json). A changed file fails only for a use it adds:
// a use already present in the file at --base is historical and is migrated when its owner chooses.
const DEPRECATIONS_FILE = "packages/governance/deprecations.json"
// undefined when the file is absent or failed its schema; deprecated-usage then fails rather than
// treating "unreadable" as "nothing is deprecated"
const deprecations = inputs.valid(DEPRECATIONS_FILE)?.entries
const deprecatedUses = (src, file) => {
  const hits = []
  const add = (d, line, what) => hits.push({ key: `${d.name}|${what}`, line,
    msg: `${what} — ${d.kind} ${d.name} is deprecated since ${d.since}, removed in ${d.removeIn}; use ${d.replacement}. ${d.migration}` })
  for (const d of deprecations) {
    if (d.kind === "token") {
      for (const m of src.matchAll(new RegExp(`${d.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`, "g")))
        if (!/^\s*:/.test(src.slice(m.index + d.name.length, m.index + d.name.length + 8))) add(d, lineOf(src, m.index), `uses ${d.name}`)
    }
  }
  for (const u of atlasUsage(src)) {
    for (const d of deprecations) {
      if (d.kind === "component" && u.component === d.name && (u.exported === d.name || u.exported.startsWith(d.name)))
        add(d, lineOf(src, src.indexOf(u.exported)), `imports ${u.exported}`)
      if (d.kind === "variant" && d.name.startsWith(`${u.component}.`) && (u.exported === u.component || u.exported === `${u.component}Root`)) {
        const variant = d.name.slice(u.component.length + 1)
        for (const tag of jsxTags(src, u.local, file))
          if (literalProp(tag, "variant") === variant) add(d, tag.line, `<${u.local} variant="${variant}">`)
      }
    }
  }
  return hits
}

check("design", "deprecated-usage", () => {
  if (!deprecations) return { status: "fail", inspected: 0, mismatches: [`${DEPRECATIONS_FILE} is missing or failed its schema — cannot tell what is deprecated`] }
  const fails = []
  let scanned = 0
  for (const { file, src } of sources) {
    const old = sh(`git show ${BASE}:${file}`, ROOT)
    const before = new Set(old.ok ? deprecatedUses(old.out, file).map((h) => h.key) : [])
    for (const h of deprecatedUses(src, file)) if (!before.has(h.key)) fails.push(`${file}:${h.line} ${h.msg}`)
    scanned++
  }
  return { ...verdict(fails), inspected: scanned, scope: sources.length, note: `${scanned} files · ${deprecations.length} deprecations registered` }
})

// Phase 4 — the deprecation policy's expiry half, until now prose only ("remove no sooner than the next
// MAJOR"): a registered deprecation whose removeIn version has already shipped must be gone (or its
// removeIn moved). Unreleased CHANGELOG headings carry no version and never count as shipped.
check("design", "deprecation-expiry", () => {
  const CHANGELOG = "CHANGELOG.md"
  if (!exists(CHANGELOG)) return { status: "fail", inspected: 0, mismatches: [`${CHANGELOG} is missing — released versions cannot be determined`] }
  if (!deprecations) return { status: "fail", inspected: 0, mismatches: [`${DEPRECATIONS_FILE} is missing or failed its schema — cannot tell what is deprecated`] }
  // "## 1.0.0 (2026-05-11)" is the real heading shape; "Unreleased"/"Policy" never match
  const released = [...read(CHANGELOG).matchAll(/^##\s+v?(\d+)\.(\d+)\.(\d+)(?:\s|$)/gm)].map((m) => m.slice(1).map(Number))
  const latest = released.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]).at(-1)
  const ver = (s) => (String(s).match(/^(\d+)\.(\d+)\.(\d+)$/) || []).slice(1).map(Number)
  const fails = []
  for (const d of deprecations) {
    const r = ver(d.removeIn)
    if (r.length !== 3) { fails.push(`${d.name}: removeIn ${JSON.stringify(d.removeIn)} is not a X.Y.Z version`); continue }
    if (latest && (r[0] < latest[0] || (r[0] === latest[0] && (r[1] < latest[1] || (r[1] === latest[1] && r[2] <= latest[2])))))
      fails.push(`${d.name}: removeIn ${d.removeIn} has shipped (latest release ${latest.join(".")}) but the asset is still registered — remove it, or move removeIn`)
  }
  const note = latest ? `latest release ${latest.join(".")} · ${deprecations.length} deprecations registered` : `no released versions in ${CHANGELOG} · ${deprecations.length} deprecations registered`
  return { ...verdict(fails), inspected: deprecations.length, scope: deprecations.length, note }
})

check("design", "tokens", () => {
  const fails = []
  // an empty token set would make every use "not defined"; say why instead of listing hundreds of lines
  if (tokens.size === 0) return { status: "fail", inspected: 0, mismatches: [`${TOKEN_CSS} defines no --atlas-* tokens — nothing to check uses against`] }
  let refs = 0
  const scanned = new Set()
  for (const { file, src } of sources) {
    const brand = BRAND_FILE.test(file) // DEC-008: brand colours may reference the palette here
    for (const m of src.matchAll(/--atlas-[\w-]+/g)) {
      const name = m[0], line = lineOf(src, m.index)
      if (/^\s*:/.test(src.slice(m.index + name.length, m.index + name.length + 8))) continue // a definition, not a use
      refs++; scanned.add(file)
      if (brand) { if (!tokens.has(name)) fails.push(`${file}:${line} ${name} is not defined in ${TOKEN_CSS}`) }
      else if (/^--atlas-color-/.test(name) || new RegExp(`^${PRIMITIVE_TOKEN_REF.source}$`).test(name))
        fails.push(`${file}:${line} ${name} is a primitive — use a semantic token`)
      else if (!tokens.has(name)) fails.push(`${file}:${line} ${name} is not defined in ${TOKEN_CSS}`)
    }
  }
  // scope stays 0: a changed file that only DEFINES tokens (atlas.tokens.css) has no uses to inspect.
  // The silent-pass risk here is an empty token set, failed above.
  return { ...verdict(fails), inspected: scanned.size, scope: 0,
    note: `${refs} token refs in ${scanned.size} files · ${tokens.size} tokens defined` }
})

// ─── code ────────────────────────────────────────────────────────────────────

const changedOnTop = (out, pick) => {
  const lines = out.split("\n").filter(pick)
  return [...lines.filter((l) => changed.some((f) => l.includes(f))), ...lines.filter((l) => !changed.some((f) => l.includes(f)))].slice(0, 20)
}
// these three run repo-wide, so their scope is always 1: a run that reports no files is a broken run
const countFrom = (out, re) => Number((out.replace(/\x1b\[[0-9;]*m/g, "").match(re) || [])[1] ?? 0)

// One token-lint run feeds three checks: the whole lint, and the two Phase 2d metric rows. A run whose
// JSON cannot be read fails all three rather than passing them on silence.
let lintRun // run on first use, so a run that skips all three never spawns token-lint
const runTokenLint = () => {
  if (lintRun) return lintRun
  const r = sh("node packages/governance/token-lint.mjs --json", ROOT)
  try { lintRun = JSON.parse(r.out) } catch { lintRun = { error: r.out.split("\n").slice(0, 5) } }
  return lintRun
}
const lintCheck = (id, rules, inspectedOf, what) => check("code", id, () => {
  const tokenLint = runTokenLint()
  if (tokenLint.error) return { status: "fail", inspected: 0, scope: 1, mismatches: ["token-lint --json did not return JSON:", ...tokenLint.error] }
  const hits = tokenLint.violations.filter((v) => !rules || rules.includes(v.rule))
  const inspected = inspectedOf(tokenLint)
  const mismatches = hits.map((v) => `${v.file}:${v.line} [${v.rule}] ${v.text.slice(0, 160)}`)
  const ordered = [...mismatches.filter((m) => changed.some((f) => m.startsWith(f))), ...mismatches.filter((m) => !changed.some((f) => m.startsWith(f)))]
  return { status: hits.length ? "fail" : "pass", inspected, scope: 1, note: what(inspected), mismatches: ordered.slice(0, 20) }
})

lintCheck("token-lint", null, (t) => t.scanned, (n) => `${n} files`)
// The two Phase 2d metric rows; their rule lists live in scripts/lib/token-rules.mjs (METRIC_RULES).
lintCheck("raw-design-values", METRIC_RULES["code.raw-design-values"],
  (t) => t.inspected["no-raw-length"], (n) => `${n} component files · colour, length and private-var rules`)
lintCheck("reduced-motion-required", METRIC_RULES["code.reduced-motion-required"],
  (t) => t.inspected["reduced-motion-required"], (n) => `${n} component CSS files use --atlas-duration-*`)

// Phase 4 — metric `code.contrast` (manifest row "Contrast meets WCAG AA"): every text/background
// token pairing measured statically in both themes (scripts/lib/contrast.mjs). Repo-wide, not over
// the diff: the token file declares the pairings for every page that will ever render them. Fail-closed
// on unresolvable values; known findings live in contrast-allow.json and go stale the moment they are
// fixed, exactly like private-vars.allow.
const CONTRAST_ALLOW = "packages/governance/contrast-allow.json"
check("code", "contrast", () => {
  const allow = inputs.valid(CONTRAST_ALLOW)
  if (!tokens.size) return { status: "fail", inspected: 0, mismatches: [`${TOKEN_CSS} defines no --atlas-* tokens`] }
  if (!allow) return { status: "fail", inspected: 0, mismatches: [`${CONTRAST_ALLOW} is missing or failed its schema — allowances cannot be checked`] }
  const r = contrastCheck(read(TOKEN_CSS), allow.entries)
  const fails = []
  if (r.tokenCount < 50) fails.push(`parser saw only ${r.tokenCount} tokens in ${TOKEN_CSS} — a parsing regression, not a clean run`)
  for (const v of r.violations)
    fails.push(v.worseThanAllowed === undefined
      ? `${v.theme}: ${v.fg} on ${v.bg} = ${v.ratio.toFixed(2)}:1 (AA needs 4.5) — fix the value Figma-first, or record the decision in ${CONTRAST_ALLOW}`
      : `${v.theme}: ${v.fg} on ${v.bg} = ${v.ratio.toFixed(2)}:1, worse than the allowed ${v.worseThanAllowed.toFixed(2)}:1 — a NEW finding; record it or fix the value`)
  for (const u of r.unresolved)
    fails.push(`${u.theme}: ${u.fg} on ${u.bg} — ${u.unresolvable}; an unmeasurable pair is a failure, not a pass`)
  for (const s of r.stale)
    fails.push(`${s.entry.theme}: ${s.entry.fg} on ${s.entry.bg} — ${s.why}`)
  // light and dark, plus <brand>-light and <brand>-dark per [data-brand] block, which measure only
  // the pairs the brand changes (M5.6)
  const pairs = new Set(r.pairs.map((p) => `${p.fg}|${p.bg}`)).size
  const perTheme = {}
  for (const p of r.pairs) perTheme[p.theme] = (perTheme[p.theme] ?? 0) + 1
  return { ...verdict(fails), inspected: r.pairs.length, scope: 1,
    note: `${pairs} pairs · ${r.pairs.length} measurements (${Object.entries(perTheme).map(([t, n]) => `${t} ${n}`).join(" + ")}) · ${r.allowed.length} allowed · ${r.violations.length} failing` }
})

check("code", "tsc", () => {
  const r = sh("npx tsc --noEmit -p tsconfig.json --extendedDiagnostics", ROOT, 300000)
  const files = countFrom(r.out, /^Files:\s+(\d+)/m)
  const base = { inspected: files, scope: 1, note: `${files} files in the program` }
  return r.ok ? { status: "pass", ...base } : { status: "fail", ...base, mismatches: changedOnTop(r.out, (l) => l.includes("error TS")) }
})

check("code", "tests", () => {
  const r = sh("npx vitest run", ROOT, 300000)
  const files = countFrom(r.out, /Test Files\s+[^\n]*\((\d+)\)/)
  const tests = countFrom(r.out, /Tests\s+[^\n]*\((\d+)\)/)
  const base = { inspected: files, scope: 1, note: `${files} test files · ${tests} tests` }
  return r.ok ? { status: "pass", ...base } : { status: "fail", ...base, mismatches: r.out.split("\n").filter((l) => /FAIL|✗|×|Error/.test(l)).slice(0, 20) }
})

check("code", "atlas-components", () => {
  const fails = [], warns = []
  for (const { file, src } of appSources) {
    for (const m of src.matchAll(RAW_ELEMENT)) fails.push(`${file}:${lineOf(src, m.index)} raw <${m[1]}> — use the Atlas component`)
    for (const l of lengthLiterals(src))
      warns.push(`${file}:${lineOf(src, l.index)} ${l.prop}: ${l.value} — hardcoded length; use a spacing/size/radius/type token from atlas/tokens.md`)
  }
  return { ...verdict(fails, warns), inspected: appSources.length, scope: appSources.length, note: `${appSources.length} app files` }
})

check("code", "a11y", () => {
  const fails = []
  const tsx = sources.filter((s) => s.file.endsWith(".tsx"))
  let tags = 0
  for (const { file, src } of tsx) {
    // has() is UNKNOWN when a spread may supply the attribute: only a definite absence fails
    for (const tag of jsxTags(src, "img", file)) { tags++; if (tag.has("alt") === false) fails.push(`${file}:${tag.line} <img> without alt`) }
    for (const el of ["div", "span", "li", "p"]) for (const tag of jsxTags(src, el, file)) {
      tags++
      if (tag.has("onClick") === true && (tag.has("role") === false || tag.has("tabIndex") === false))
        fails.push(`${file}:${tag.line} <${el} onClick> without role + tabIndex — use Button, or make it keyboard-reachable`)
    }
    // composite widgets promise arrow-key navigation; a file that declares one and handles no keys breaks it
    for (const m of src.matchAll(/role=\{?\s*["'](radiogroup|tablist|listbox|menu|menubar|grid|tree)["']/g))
      if (!/\bonKeyDown=/.test(src))
        fails.push(`${file}:${lineOf(src, m.index)} role="${m[1]}" with no onKeyDown in the file — add arrow-key navigation, or use Buttons with aria-pressed`)
    for (const m of src.matchAll(/tabIndex=\{?\s*["']?([1-9]\d*)/g)) fails.push(`${file}:${lineOf(src, m.index)} positive tabIndex=${m[1]} breaks focus order`)
    src.split("\n").forEach((l, i) => {
      if (/\boutline:\s*["']?none|\boutline-none\b/.test(l) && !/focus/.test(l))
        fails.push(`${file}:${i + 1} outline removed with no focus style on the same line`)
    })
  }
  return { ...verdict(fails), inspected: tsx.length, scope: tsx.length, note: `${tsx.length} .tsx files · ${tags} tags` }
})

check("code", "prototype-registered", () => {
  const fails = []
  const REGISTRY = "app/prototypes/_shared/flowRegistry.ts"
  const slugs = new Set(changed.map((f) => (f.match(/^app\/prototypes\/([^_/][^/]*)\//) || [])[1]).filter(Boolean))
  const flows = [...slugs].filter((slug) => exists(`app/prototypes/${slug}/page.tsx`))
  if (flows.length && !exists(REGISTRY)) return { status: "fail", inspected: 0, scope: flows.length, mismatches: [`${REGISTRY} is missing — ${flows.length} changed flow(s) cannot be checked`] }
  const registry = flows.length ? read(REGISTRY) : ""
  for (const slug of flows) if (!registry.includes(`"${slug}"`)) fails.push(`app/prototypes/${slug} is not registered in ${REGISTRY}`)
  return { ...verdict(fails), inspected: flows.length, scope: flows.length, note: `${flows.length} changed flows` }
})

// ─── scope ───────────────────────────────────────────────────────────────────

const globToRe = (g) => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*\/?/g, "\0").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]").replace(/\0/g, ".*") + "$")

check("scope", "paths", () => {
  if (!SCOPE.length) return { status: changed.length ? "warn" : "pass", inspected: 0, mismatches: changed.length ? [`no --scope given; ${changed.length} changed file(s) not checked: ${changed.slice(0, 10).join(", ")}${changed.length > 10 ? " …" : ""}`] : [] }
  const res = SCOPE.map(globToRe)
  return { ...verdict(changed.filter((f) => !res.some((re) => re.test(f))).map((f) => `${f} is outside --scope`)),
    inspected: changed.length, scope: changed.length, note: `${changed.length} changed files · ${SCOPE.length} globs` }
})

check("scope", "no-new-tokens", () => {
  if (ALLOW_TOKEN) return { status: "pass", inspected: 0, note: "--allow-new-token" }
  const before = sh(`git show ${BASE}:${TOKEN_CSS}`, ROOT)
  // unreadable at --base used to mean "nothing added" — a silent pass. It is a failure, unless the file
  // is new in this diff (then every token in it is new, and is reported as such).
  const isNew = !before.ok && changed.includes(TOKEN_CSS) && !sh(`git cat-file -e ${BASE}:${TOKEN_CSS}`, ROOT).ok
  if (!before.ok && !isNew) return { status: "fail", inspected: 0, mismatches: [`could not read ${TOKEN_CSS} at ${BASE} — cannot tell which tokens are new`] }
  const old = isNew ? new Set() : definedTokens(before.out)
  const added = [...tokens].filter((t) => !old.has(t))
  return { ...verdict(added.map((t) => `${t} added to ${TOKEN_CSS} — tokens are added in Figma first, never on a task's initiative`)),
    inspected: tokens.size, scope: 1, note: `${tokens.size} tokens compared with ${BASE}` }
})

check("scope", "no-new-components", () => {
  if (ALLOW_COMPONENT) return { status: "pass", inspected: 0, note: "--allow-new-component" }
  const COMPONENT_DIR = /^(packages\/ui-web\/src\/(primitives|compositions|patterns|layouts)|packages\/ui-native\/components)\/([^/]+)\//
  const dirs = new Set(changed.map((f) => (f.match(COMPONENT_DIR) || [])[0]).filter(Boolean))
  const fails = [...dirs].filter((d) => !sh(`git cat-file -e ${BASE}:${d.replace(/\/$/, "")}`, ROOT).ok)
    .map((d) => `${d} is a new component — compose it from primitives in the task and log it in atlas/state/candidates.json`)
  // M3: a new registry entry is a new agent-visible type. It passes only when it renders a real
  // component (directly, or through an aliases.json name) or is structural; anything else needs the
  // atlas-approved-new label, which CI turns into --allow-new-component (handled above)
  const ENTRY = /^packages\/registry\/src\/[^/]+\.registry\.json$/
  const entries = changed.filter((f) => ENTRY.test(f) && fs.existsSync(path.join(ROOT, f)) && !sh(`git cat-file -e ${BASE}:${f}`, ROOT).ok)
  const aliases = inputs.valid("packages/registry/aliases.json")?.aliases
  for (const f of entries) {
    const e = inputs.valid(f)
    if (!e || !aliases) { fails.push(`${f} is a new registry entry that is not schema-valid (or aliases.json is not) — it cannot be checked`); continue }
    if (e.kind === "structural") continue
    const resolves = metadata[e.aliasOf] && (e.type === e.aliasOf || aliases[e.type] === e.aliasOf)
    if (!resolves) fails.push(`${f} registers "${e.type}", which does not resolve to an Atlas component through aliases.json — a new type needs the atlas-approved-new label`)
  }
  return { ...verdict(fails), inspected: dirs.size + entries.length, scope: dirs.size + entries.length,
    note: `${dirs.size} component dirs changed · ${entries.length} registry entries added` }
})

// Phase 4 — the registryComplete ratchet: the authored-entry count under packages/registry/src may only
// increase. An entry is an agent-visible type; removing one is a breaking change to what the agent may
// emit and goes through an owner decision (atlas/state/decisions.json) first, which is why v1 has no
// allowance flag: no legitimate removal path exists yet.
check("scope", "registry-complete", () => {
  const ENTRY_RE = /^packages\/registry\/src\/[^/]+\.registry\.json$/
  const now = exists("packages/registry/src")
    ? fs.readdirSync(path.join(ROOT, "packages/registry/src"))
      .filter((f) => ENTRY_RE.test(`packages/registry/src/${f}`))
      .map((f) => `packages/registry/src/${f}`) : []
  const before = sh(`git ls-tree -r --name-only ${BASE} -- packages/registry/src/`, ROOT)
  if (!before.ok) return { status: "fail", inspected: 0, mismatches: [`could not list packages/registry/src at ${BASE} — cannot tell whether the registry shrank`] }
  const old = before.out.split("\n").filter(Boolean).filter((f) => ENTRY_RE.test(f))
  const removed = old.filter((f) => !now.includes(f))
  const fails = removed.map((f) =>
    `registry shrank (${old.length} → ${now.length}): ${f} is gone — an entry leaves only through an owner decision; record it first`)
  return { ...verdict(fails), inspected: now.length, scope: 1, note: `${now.length} authored entries (was ${old.length} at ${BASE})` }
})

// Phase 4 — the breaking-change policy, until now prose only ("MAJOR for a breaking change to a
// component API, variant or size value, or a token name or meaning; listed under ### Breaking"):
// removed tokens (atlas.tokens.css), removed variants/sizes (atlas/metadata) or a deleted component
// fail unless the same diff also adds a `### Breaking` CHANGELOG heading. Registry enum removals are
// already caught by design/figma-registry-code against the code union.
check("scope", "breaking-change", () => {
  const fails = []
  const removals = []
  const before = sh(`git show ${BASE}:${TOKEN_CSS}`, ROOT)
  if (!before.ok && !changed.includes(TOKEN_CSS)) return { status: "fail", inspected: 0, mismatches: [`could not read ${TOKEN_CSS} at ${BASE} — cannot tell which tokens were removed`] }
  const oldTokens = before.ok ? definedTokens(before.out) : new Set()
  const removedTokens = [...oldTokens].filter((t) => !tokens.has(t))
  for (const t of removedTokens) removals.push(`token ${t} removed from ${TOKEN_CSS}`)

  let compared = 0
  const metaBefore = sh(`git ls-tree -r --name-only ${BASE} -- atlas/metadata/`, ROOT)
  if (!metaBefore.ok) return { status: "fail", inspected: 0, mismatches: [`could not list atlas/metadata at ${BASE} — cannot tell which variants or sizes were removed`] }
  for (const f of metaBefore.out.split("\n").filter(Boolean)) {
    compared++
    const now = inputs.files.find((x) => x.file === f)
    if (!now) { removals.push(`component ${f.replace(/^atlas\/metadata\/|\.json$/g, "")} removed (atlas/metadata deleted)`); continue }
    if (!now.ok) return { status: "fail", inspected: 0, mismatches: [`${f} failed its schema — cannot compare variants or sizes (see design/schemas)`] }
    const oldRaw = sh(`git show ${BASE}:${f}`, ROOT)
    let old
    try { old = JSON.parse(oldRaw.out) } catch { return { status: "fail", inspected: 0, mismatches: [`${f} at ${BASE} is not JSON — cannot compare variants or sizes`] } }
    for (const [key, what] of [["variants", "variant"], ["sizes", "size"]])
      for (const v of old[key] ?? []) if (!(now.data[key] ?? []).includes(v)) removals.push(`${now.data.name} ${what} "${v}" removed`)
  }

  if (!removals.length) return { status: "pass", inspected: oldTokens.size + compared, scope: 1, note: `${oldTokens.size} tokens · ${compared} metadata files compared with ${BASE}` }
  const changelog = changed.includes("CHANGELOG.md")
    ? sh(`git diff ${BASE} -- CHANGELOG.md`, ROOT) : { ok: true, out: "" }
  const hasBreaking = /^\+.*###\s+Breaking\b/m.test(changelog.out)
  if (!(changelog.ok && hasBreaking))
    fails.push(...removals.map((r) => `${r} — a breaking change needs a MAJOR entry under "### Breaking" in CHANGELOG.md in the same diff`))
  return { ...verdict(fails), inspected: oldTokens.size + compared, scope: 1,
    note: `${removals.length} removal(s) · CHANGELOG ${hasBreaking ? "carries a ### Breaking entry" : "untouched"}` }
})

// ─── Report ──────────────────────────────────────────────────────────────────

const failed = results.filter((r) => r.status === "fail")

// --stamp: record the pass in atlas/state/status.json (repo state; the sync keeps its body). Only a full
// run qualifies — no FAIL and nothing skipped — and only for components whose library code changed.
// The row is edited in place so the generator's compact formatting survives.
const stamped = []
const stampNote = []
if (STAMP) {
  const skipped = results.filter((r) => r.status === "skip").map((r) => r.id)
  if (failed.length) stampNote.push("not stamped: a check failed")
  else if (skipped.length) stampNote.push(`not stamped: skipped ${skipped.join(", ")}`)
  else if (!libChanged.size && !STAMP_NAMED.size) stampNote.push("not stamped: no library component changed")
  else {
    const rel = "atlas/state/status.json"
    const at = new Date().toISOString()
    let body = read(rel)
    for (const name of [...new Set([...libChanged, ...STAMP_NAMED])].sort()) {
      if (STAMP_NAMED.has(name) && !metadata[name]) { stampNote.push(`not stamped: ${name} has no atlas/metadata/${name}.json`); continue }
      const row = new RegExp(`("${name}": \\{[^}]*"verifiedAt": )(null|"[^"]*")`)
      if (row.test(body)) { body = body.replace(row, `$1"${at}"`); stamped.push(name) }
      else stampNote.push(`not stamped: ${name} has no row in ${rel}`)
    }
    if (stamped.length) fs.writeFileSync(path.join(ROOT, rel), body)
  }
}
if (JSON_OUT) {
  console.log(JSON.stringify({ base: BASE, changed, touchedComponents: [...touched].sort(), ok: !failed.length, stamped, stampNote, results }, null, 2))
} else {
  const icon = { pass: "PASS", fail: "FAIL", warn: "WARN", skip: "SKIP" }
  console.log(`atlas-verify — ${changed.length} changed file(s) vs ${BASE}${touched.size ? `; components: ${[...touched].sort().join(", ")}` : ""}\n`)
  let group
  for (const r of results) {
    if (r.group !== group) { group = r.group; console.log(group) }
    console.log(`  ${icon[r.status]}  ${r.id}${r.note ? `  (${r.note})` : ""}${r.mismatches.length > 1 ? `  — ${r.mismatches.length}` : ""}`)
    for (const m of r.mismatches.slice(0, 25)) console.log(`        ${m}`)
    if (r.mismatches.length > 25) console.log(`        … ${r.mismatches.length - 25} more`)
  }
  const count = (s) => results.filter((r) => r.status === s).length
  console.log(`\n${failed.length ? "FAILED" : "OK"} — ${count("pass")} pass · ${count("warn")} warn · ${count("fail")} fail · ${count("skip")} skip`)
  if (stamped.length) console.log(`verifiedAt stamped: ${stamped.join(", ")} (atlas/state/status.json)`)
  for (const n of stampNote) console.log(n)
}
// exitCode, not process.exit(): exit() can cut off a large --json report written to a pipe (it did at 64 KB)
process.exitCode = failed.length ? 1 : 0
