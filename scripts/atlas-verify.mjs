#!/usr/bin/env node
/**
 * atlas-verify — check work before reporting it done.
 *
 * Three groups, each a pass/fail line plus its mismatches:
 *   design  snapshot current · variants/sizes used vs atlas/metadata · tokens exist and are semantic
 *   code    token-lint · tsc · tests · Atlas components over raw controls · basic a11y · prototype registered
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
 *   node scripts/atlas-verify.mjs --scope "…" --stamp                  # on a full pass, stamp verifiedAt
 *
 * Exit: 0 when no check fails (warnings allowed), 1 when any check fails.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { sh, ATLAS_IMPORT, RAW_ELEMENT, NUMERIC_STYLE_LITERAL, PRIMITIVE_TOKEN_REF, BRAND_FILE } from "./lib/quality-checks.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
const flag = (n) => args.includes(n)
const opt = (n) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : undefined }
const list = (v) => (v || "").split(",").map((s) => s.trim()).filter(Boolean)

const BASE = opt("--base") || "HEAD"
const SCOPE = list(opt("--scope"))
const SKIP = new Set(list(opt("--skip")))
const JSON_OUT = flag("--json")
const ALLOW_COMPONENT = flag("--allow-new-component")
const ALLOW_TOKEN = flag("--allow-new-token")
const STAMP = flag("--stamp")

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8")
const exists = (rel) => fs.existsSync(path.join(ROOT, rel))
const git = (cmd) => sh(`git ${cmd}`, ROOT).out.split("\n").filter(Boolean)
const lineOf = (src, index) => src.slice(0, index).split("\n").length

// ─── Changed files ───────────────────────────────────────────────────────────

const deleted = new Set(git(`diff --name-only --diff-filter=D ${BASE}`))
const changed = [...new Set([...git(`diff --name-only ${BASE}`), ...git("ls-files --others --exclude-standard")])]
  .filter((f) => !deleted.has(f)).sort()
const isSource = (f) => /\.(tsx?|css)$/.test(f) && /^(app|packages\/ui-web\/src)\//.test(f)
const sources = changed.filter((f) => isSource(f) && exists(f)).map((f) => ({ file: f, src: read(f) }))
const appSources = sources.filter((s) => s.file.startsWith("app/"))

// ─── Result collection ───────────────────────────────────────────────────────

const results = []
const check = (group, id, fn) => {
  if (SKIP.has(id) || SKIP.has(`${group}.${id}`)) return results.push({ group, id, status: "skip", mismatches: [] })
  const { status, mismatches = [], note } = fn()
  results.push({ group, id, status, mismatches, note })
}
const verdict = (fails, warns = []) =>
  fails.length ? { status: "fail", mismatches: [...fails, ...warns] } : { status: warns.length ? "warn" : "pass", mismatches: warns }

// ─── Snapshot facts ──────────────────────────────────────────────────────────

const metadata = {}
if (exists("atlas/metadata")) for (const f of fs.readdirSync(path.join(ROOT, "atlas/metadata"))) {
  if (f.endsWith(".json")) { const m = JSON.parse(read(`atlas/metadata/${f}`)); metadata[m.name] = m }
}
const TOKEN_CSS = "packages/tokens/atlas.tokens.css"
const definedTokens = (css) => new Set([...css.matchAll(/(--atlas-[\w-]+)\s*:/g)].map((m) => m[1]))
const tokens = exists(TOKEN_CSS) ? definedTokens(read(TOKEN_CSS)) : new Set()

// Atlas components used by a file: import path @atlas/ui-web/<tier>/<Name>/<Name> → local names.
const atlasUsage = (src) => {
  const used = []
  for (const m of src.matchAll(ATLAS_IMPORT)) {
    const name = m[2].split("/").pop()
    for (const part of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
      const [exported, local = exported] = part.split(/\s+as\s+/)
      used.push({ component: name, exported, local })
    }
  }
  return used
}

// Opening tags <Local ...> with their attribute text; braces and quotes are skipped so `=>` doesn't end a tag.
function* jsxTags(src, local) {
  const re = new RegExp(`<${local}(?=[\\s/>])`, "g")
  for (const m of src.matchAll(re)) {
    let depth = 0, quote = null, i = m.index + m[0].length
    for (; i < src.length; i++) {
      const c = src[i]
      if (quote) { if (c === quote) quote = null; continue }
      if (c === '"' || c === "'" || c === "`") quote = c
      else if (c === "{") depth++
      else if (c === "}") depth--
      else if (c === ">" && depth === 0) break
    }
    yield { attrs: src.slice(m.index + m[0].length, i), line: lineOf(src, m.index) }
  }
}
const literalProp = (attrs, prop) => {
  const m = attrs.match(new RegExp(`(?:^|\\s)${prop}=(?:"([^"]*)"|'([^']*)'|\\{\\s*["'\`]([^"'\`]*)["'\`]\\s*\\})`))
  return m ? m[1] ?? m[2] ?? m[3] : undefined
}

// ─── design ──────────────────────────────────────────────────────────────────

const libChanged = new Set() // components whose library folder changed — the only ones --stamp marks verified
const touched = new Set()
for (const { file, src } of sources) {
  for (const u of atlasUsage(src)) touched.add(u.component)
  const lib = file.match(/^packages\/ui-web\/src\/\w+\/(\w+)\//)
  if (lib) { touched.add(lib[1]); libChanged.add(lib[1]) }
}

check("design", "snapshot-current", () => {
  const fails = [], warns = []
  const sync = sh("node scripts/atlas-sync.mjs --check", ROOT).out
  const pending = Number((sync.match(/would write\s+(\d+)/) || [])[1] || 0)
  if (!/would write/.test(sync)) fails.push("atlas-sync --check did not run: " + sync.trim().split("\n").pop())
  else if (pending) fails.push(`atlas/ is behind the code: atlas-sync would write ${pending} file(s) — run npm run atlas:sync`)
  for (const name of [...touched].sort()) {
    const m = metadata[name]
    if (!m) fails.push(`${name}: no atlas/metadata/${name}.json`)
    else if (!m.syncedAt || m.source !== "figma-synced") warns.push(`${name}: snapshot is ${m.source ?? "unsourced"}, syncedAt ${m.syncedAt} — stale, escalate to Figma for design facts`)
  }
  return verdict(fails, warns)
})

check("design", "variants-sizes", () => {
  const fails = []
  for (const { file, src } of sources) for (const u of atlasUsage(src)) {
    const m = metadata[u.component]
    if (!m || !(u.exported === u.component || u.exported === `${u.component}Root`)) continue
    for (const tag of jsxTags(src, u.local)) for (const [prop, allowed] of [["variant", m.variants], ["size", m.sizes]]) {
      const value = literalProp(tag.attrs, prop)
      if (value !== undefined && allowed?.length && !allowed.includes(value))
        fails.push(`${file}:${tag.line} <${u.local} ${prop}="${value}"> — ${u.component} ${prop}s are ${allowed.join(" | ")}`)
    }
  }
  return verdict(fails)
})

check("design", "tokens", () => {
  const fails = []
  for (const { file, src } of sources) {
    const brand = BRAND_FILE.test(file) // DEC-008: brand colours may reference the palette here
    for (const m of src.matchAll(/--atlas-[\w-]+/g)) {
      const name = m[0], line = lineOf(src, m.index)
      if (/^\s*:/.test(src.slice(m.index + name.length, m.index + name.length + 8))) continue // a definition, not a use
      if (brand) { if (!tokens.has(name)) fails.push(`${file}:${line} ${name} is not defined in ${TOKEN_CSS}`) }
      else if (/^--atlas-color-/.test(name) || new RegExp(`^${PRIMITIVE_TOKEN_REF.source}$`).test(name))
        fails.push(`${file}:${line} ${name} is a primitive — use a semantic token`)
      else if (!tokens.has(name)) fails.push(`${file}:${line} ${name} is not defined in ${TOKEN_CSS}`)
    }
  }
  return verdict(fails)
})

// ─── code ────────────────────────────────────────────────────────────────────

const changedOnTop = (out, pick) => {
  const lines = out.split("\n").filter(pick)
  return [...lines.filter((l) => changed.some((f) => l.includes(f))), ...lines.filter((l) => !changed.some((f) => l.includes(f)))].slice(0, 20)
}

check("code", "token-lint", () => {
  const r = sh("node packages/governance/token-lint.mjs", ROOT)
  return r.ok ? { status: "pass" } : { status: "fail", mismatches: changedOnTop(r.out, (l) => /^\s+\[/.test(l) || /^\s{2}\S/.test(l)) }
})

check("code", "tsc", () => {
  const r = sh("npx tsc --noEmit -p tsconfig.json", ROOT, 300000)
  return r.ok ? { status: "pass" } : { status: "fail", mismatches: changedOnTop(r.out, (l) => l.includes("error TS")) }
})

check("code", "tests", () => {
  const r = sh("npx vitest run", ROOT, 300000)
  return r.ok ? { status: "pass" } : { status: "fail", mismatches: r.out.split("\n").filter((l) => /FAIL|✗|×|Error/.test(l)).slice(0, 20) }
})

check("code", "atlas-components", () => {
  const fails = [], warns = []
  for (const { file, src } of appSources) {
    for (const m of src.matchAll(RAW_ELEMENT)) fails.push(`${file}:${lineOf(src, m.index)} raw <${m[1]}> — use the Atlas component`)
    const literals = [...src.matchAll(NUMERIC_STYLE_LITERAL)].map((m) => lineOf(src, m.index))
    if (literals.length) warns.push(`${file}: ${literals.length} numeric style literal(s), lines ${[...new Set(literals)].slice(0, 8).join(", ")} — prefer spacing/size tokens`)
  }
  return verdict(fails, warns)
})

check("code", "a11y", () => {
  const fails = []
  for (const { file, src } of sources.filter((s) => s.file.endsWith(".tsx"))) {
    for (const tag of jsxTags(src, "img")) if (!/\balt=/.test(tag.attrs)) fails.push(`${file}:${tag.line} <img> without alt`)
    for (const el of ["div", "span", "li", "p"]) for (const tag of jsxTags(src, el)) {
      if (/\bonClick=/.test(tag.attrs) && !(/\brole=/.test(tag.attrs) && /\btabIndex=/.test(tag.attrs)))
        fails.push(`${file}:${tag.line} <${el} onClick> without role + tabIndex — use Button, or make it keyboard-reachable`)
    }
    for (const m of src.matchAll(/tabIndex=\{?\s*["']?([1-9]\d*)/g)) fails.push(`${file}:${lineOf(src, m.index)} positive tabIndex=${m[1]} breaks focus order`)
    src.split("\n").forEach((l, i) => {
      if (/\boutline:\s*["']?none|\boutline-none\b/.test(l) && !/focus/.test(l))
        fails.push(`${file}:${i + 1} outline removed with no focus style on the same line`)
    })
  }
  return verdict(fails)
})

check("code", "prototype-registered", () => {
  const fails = []
  const REGISTRY = "app/prototypes/_shared/flowRegistry.ts"
  const registry = exists(REGISTRY) ? read(REGISTRY) : ""
  const slugs = new Set(changed.map((f) => (f.match(/^app\/prototypes\/([^_/][^/]*)\//) || [])[1]).filter(Boolean))
  for (const slug of slugs) if (exists(`app/prototypes/${slug}/page.tsx`) && !registry.includes(`"${slug}"`))
    fails.push(`app/prototypes/${slug} is not registered in ${REGISTRY}`)
  return verdict(fails)
})

// ─── scope ───────────────────────────────────────────────────────────────────

const globToRe = (g) => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*\/?/g, "\0").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]").replace(/\0/g, ".*") + "$")

check("scope", "paths", () => {
  if (!SCOPE.length) return { status: changed.length ? "warn" : "pass", mismatches: changed.length ? [`no --scope given; ${changed.length} changed file(s) not checked: ${changed.slice(0, 10).join(", ")}${changed.length > 10 ? " …" : ""}`] : [] }
  const res = SCOPE.map(globToRe)
  return verdict(changed.filter((f) => !res.some((re) => re.test(f))).map((f) => `${f} is outside --scope`))
})

check("scope", "no-new-tokens", () => {
  if (ALLOW_TOKEN) return { status: "pass", note: "--allow-new-token" }
  const before = sh(`git show ${BASE}:${TOKEN_CSS}`, ROOT)
  const added = before.ok ? [...tokens].filter((t) => !definedTokens(before.out).has(t)) : []
  return verdict(added.map((t) => `${t} added to ${TOKEN_CSS} — tokens are added in Figma first, never on a task's initiative`))
})

check("scope", "no-new-components", () => {
  if (ALLOW_COMPONENT) return { status: "pass", note: "--allow-new-component" }
  const COMPONENT_DIR = /^(packages\/ui-web\/src\/(primitives|compositions|patterns|layouts)|packages\/ui-native\/components)\/([^/]+)\//
  const dirs = new Set(changed.map((f) => (f.match(COMPONENT_DIR) || [])[0]).filter(Boolean))
  const fails = [...dirs].filter((d) => !sh(`git cat-file -e ${BASE}:${d.replace(/\/$/, "")}`, ROOT).ok)
    .map((d) => `${d} is a new component — compose it from primitives in the task and log it in atlas/state/candidates.json`)
  return verdict(fails)
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
  else if (!libChanged.size) stampNote.push("not stamped: no library component changed")
  else {
    const rel = "atlas/state/status.json"
    const at = new Date().toISOString()
    let body = read(rel)
    for (const name of [...libChanged].sort()) {
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
process.exit(failed.length ? 1 : 0)
