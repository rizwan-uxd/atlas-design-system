/**
 * registry-promotion — registered versus production-ready, and the gate between them (DEC-097).
 *
 * Two metrics over the committed registry, kept apart on purpose:
 *   registryRegistered      the six types the M3 exit names each have a complete authored entry.
 *   registryProductionReady how many registered entries are production-ready: not provisional, the
 *                           component is spec-complete, and it has a generated contract and a test with an
 *                           axe check. A provisional entry is registered and loadable for development and
 *                           benchmarks, but it is not ready, so this reads incomplete until its scaffolded
 *                           dependencies are finished.
 * And one gate, registry-promotion: a stable (non-provisional) entry must carry the evidence a promotion
 * needs (spec-complete component, contract, tests, accessibility coverage, visual coverage), and a
 * provisional entry's waitingOn must still be true. Known gaps live in
 * packages/governance/promotion-allow.json; an allowance whose gap is closed is STALE and fails.
 *
 * Pure module: parsed inputs in, result objects out. loadEvidence() is the only function that reads files.
 */
import fs from "node:fs"
import path from "node:path"

/** The six types the M3 exit names (roadmap §2c). */
export const M3_TYPES = ["Alert", "Button", "Field", "Form", "Text", "TextField"]

const own = (o, k) => Object.hasOwn(o, k)

/** registryRegistered: every M3 type has an authored, complete entry. */
export function registeredMetric({ entries }) {
  const fails = []
  let registered = 0
  for (const t of M3_TYPES) {
    if (!own(entries, t)) fails.push(`${t}: no entry in packages/registry/src`)
    else if (entries[t].registryComplete !== true) fails.push(`${t}: entry exists but registryComplete is not true`)
    else registered++
  }
  return { fails, registered, total: M3_TYPES.length }
}

const closure = (entries, type) => {
  // the components a type is built from: its own, plus everything it may nest, transitively
  const seen = new Set(), names = new Set()
  const walk = (t) => {
    if (seen.has(t) || !own(entries, t)) return
    seen.add(t)
    const e = entries[t]
    if (e.aliasOf) names.add(e.aliasOf)
    for (const c of e.composedOf ?? []) names.add(c)
    for (const c of e.nesting?.children ?? []) walk(c)
  }
  walk(type)
  return names
}

/** What stands between an entry and production, as readable gaps. Empty means production-ready. */
function gapsOf(entry, ev) {
  const gaps = []
  if (entry.provisional !== undefined) gaps.push(`provisional, waiting on ${entry.provisional.waitingOn.join(" and ")}`)
  if (entry.kind === "component") {
    const name = entry.aliasOf
    if (ev.status[name] !== "spec-complete") gaps.push(`${name} is ${ev.status[name] ?? "not in status.json"}, not spec-complete`)
    if (!ev.contracts.has(name)) gaps.push(`${name} has no generated contract`)
    if (!ev.tests[name]) gaps.push(`${name} has no test file`)
    else if (!ev.tests[name].axe) gaps.push(`${name} has no accessibility (axe) coverage in its tests`)
  } else {
    gaps.push(`${entry.type} is structural: it has no component, contract or test of its own to promote on`)
  }
  return gaps
}

/** registryProductionReady: counts only the entries with no gaps. */
export function productionReadyMetric({ entries, evidence }) {
  const fails = []
  let ready = 0
  for (const e of Object.values(entries).sort((a, b) => (a.type < b.type ? -1 : 1))) {
    const gaps = gapsOf(e, evidence)
    if (gaps.length === 0) ready++
    else fails.push(`${e.type}: ${gaps.join("; ")}`)
  }
  return { fails, ready, total: Object.keys(entries).length }
}

/**
 * The promotion gate. A stable entry needs every piece of evidence (or a recorded gap); a provisional entry
 * must wait on something real. `allow` is promotion-allow.json's entries.
 */
export function promotionCheck({ entries, evidence, allow = [] }) {
  const fails = []
  const used = new Set()
  const allowed = (type, gap) => {
    const i = allow.findIndex((a) => a.type === type && a.gap === gap)
    if (i >= 0) used.add(i)
    return i >= 0
  }
  for (const e of Object.values(entries)) {
    if (e.provisional !== undefined) {
      const reach = closure(entries, e.type)
      for (const dep of e.provisional.waitingOn) {
        if (!reach.has(dep)) fails.push(`${e.type}: waitingOn "${dep}" is not a component this type is built from`)
        else if (evidence.status[dep] === "spec-complete") fails.push(`${e.type}: waitingOn "${dep}", which is spec-complete now — drop it from provisional.waitingOn, and remove provisional once the list is empty and the evidence below exists`)
      }
      continue
    }
    // stable: the promotion evidence
    if (e.kind !== "component") { fails.push(`${e.type}: a structural entry cannot be stable; it has no component, contract or tests to promote on (keep it provisional)`); continue }
    const name = e.aliasOf
    const need = [
      ["component", evidence.status[name] === "spec-complete", `${name} is ${evidence.status[name] ?? "not in status.json"}, not spec-complete`],
      ["contract", evidence.contracts.has(name), `${name} has no generated contract (npm run registry:build)`],
      ["tests", !!evidence.tests[name], `${name} has no packages/ui-web/tests/${name}.test.tsx`],
      ["accessibility", !!evidence.tests[name]?.axe, `${name}'s tests do not run axe`],
      ["visual", evidence.sandbox.has(name), `${name} is not rendered in the sandbox (app/page.tsx), so no visual baseline covers it`],
    ]
    for (const [gap, ok, msg] of need) if (!ok && !allowed(e.type, gap)) fails.push(`${e.type}: cannot be stable — ${msg}; fix it, or keep the entry provisional with waitingOn`)
  }
  allow.forEach((a, i) => {
    if (!used.has(i)) fails.push(`${a.type}: the allowed ${a.gap} gap is closed (or the entry is provisional) — STALE, delete it from promotion-allow.json`)
  })
  return { fails, inspected: Object.keys(entries).length }
}

/** Reads the evidence from the working tree. ROOT is the repo root. */
export function loadEvidence(root) {
  const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8")
  const has = (rel) => fs.existsSync(path.join(root, rel))
  const status = Object.fromEntries(Object.entries(JSON.parse(read("atlas/state/status.json")).components).map(([k, v]) => [k, v.code]))
  const contractsDir = "packages/governance/contracts"
  const contracts = new Set(has(contractsDir) ? fs.readdirSync(path.join(root, contractsDir)).filter((f) => f.endsWith(".contract.ts")).map((f) => f.replace(".contract.ts", "")) : [])
  const tests = {}
  const testsDir = "packages/ui-web/tests"
  if (has(testsDir)) for (const f of fs.readdirSync(path.join(root, testsDir)).filter((f) => /^[A-Z]\w*\.test\.tsx$/.test(f)))
    tests[f.replace(".test.tsx", "")] = { axe: /\baxe\(/.test(read(`${testsDir}/${f}`)) }
  const sandbox = new Set()
  if (has("app/page.tsx")) for (const m of read("app/page.tsx").matchAll(/<([A-Z]\w*)[\s/>]/g)) sandbox.add(m[1])
  return { status, contracts, tests, sandbox }
}
