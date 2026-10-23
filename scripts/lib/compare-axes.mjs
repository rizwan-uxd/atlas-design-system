/**
 * compare-axes — the independent Figma→registry→code comparison (M1, made three-way in M3).
 *
 * Figma's variant axes are compared against code (M1), and, when `registry` is passed, against the
 * authored registry entries too (M3 session 4; the check is design/figma-registry-code). The registry
 * is derived, never a third opinion: every registry disagreement fails on the REGISTRY side.
 *
 * WHY THIS EXISTS. atlas-verify's `variants-sizes` check validates JSX against atlas/metadata/*.json,
 * whose `variants` and `sizes` are scraped from the code's own type unions — so it is code-vs-code and
 * can only catch a typo'd literal. The independent ground truth has been sitting in the same file all
 * along: `figmaProperties`, written straight from the Figma pull. Nothing read it. This does.
 *
 * TWO RULES THIS MODULE WILL NOT BEND:
 *
 * 1. It FAILS CLOSED. Missing, null, empty or malformed Figma data is a FAILURE, never "zero drift".
 *    A component whose Figma side is unreadable is unverifiable, and unverifiable must never render as
 *    "agrees". This is the whole point of M1 preceding the registry. Since M2 the shape is enforced by
 *    the metadata schema before this module runs; what remains here are the comparison's own failures.
 *
 * 2. NO OPTIONAL CHAINING on the data under test. `m.figmaProperties?.Variant ?? []` is the exact
 *    idiom that turns a renamed field into a vacuous PASS — the failure mode endemic to this repo's
 *    checks. Fields are read explicitly and absence throws; the caller turns the throw into a FAIL
 *    that names the component.
 *
 * Figma is the authority (DEC-001), so every disagreement about a member set fails on the CODE side:
 * the remedy is to change Figma first when Figma is wrong, then code — never to edit the snapshot.
 *
 * SCOPE, STATED HONESTLY: this proves AXIS agreement, not VISUAL agreement. Figma having a green
 * `primary` where code is blue passes here and is caught only by the human four-gates review.
 */

/* ── input shape ────────────────────────────────────────── */

// The structural guard that lived here in M1 (guardFigmaProperties) was deleted in M2, in the same
// commit that added packages/governance/schemas/metadata.schema.json. Callers pass only metadata that
// validated (scripts/lib/schemas.mjs); atlas-verify's design/schemas reports the rest, and
// design/figma-registry-code fails closed on them, so a malformed component is still a failure, never a skip.

/* ── set comparison ─────────────────────────────────────── */

const uniq = (xs) => [...new Set(xs)]
/** Member ORDER is not drift: Figma lists Button sizes sm,md,lg,xs where code has xs,sm,md,lg. */
const missingFrom = (a, b) => uniq(a).filter((x) => !b.includes(x)).sort()

/* ── Code Connect enum extraction ───────────────────────── */

/**
 * Pulls `figma.enum("Axis", { key: value, ... })` keys out of a Code Connect source.
 *
 * Keys only. The VALUES are already proven: they flow into the typechecked `example` closure, so
 * `tsc` enforces that they are assignable to the component's real prop type. Figma -> these keys
 * (here) plus these values -> props (tsc) is a complete chain, which is why an axis whose value list
 * metadata does not carry is still genuinely checked.
 *
 * One Figma axis may be mapped more than once in a file — Button fans State out into `loading` and
 * `disabled`, and Table maps Align on both TableHead and TableCell — so keys are unioned per axis.
 */
export function codeConnectEnums(src) {
  const byAxis = new Map()
  const re = /figma\.enum\(\s*"([^"]+)"\s*,\s*\{/g
  let m
  while ((m = re.exec(src)) !== null) {
    const keys = topLevelKeys(balancedBody(src, re.lastIndex))
    const prev = byAxis.get(m[1])
    byAxis.set(m[1], prev === undefined ? keys : uniq([...prev, ...keys]))
  }
  return byAxis
}

/** Text of the object literal that opened just before `from`, found by brace depth. */
function balancedBody(src, from) {
  let depth = 1
  let quote = null
  let i = from
  for (; i < src.length && depth > 0; i++) {
    const ch = src[i]
    if (quote !== null) {
      if (ch === "\\") i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch
    else if (ch === "{") depth++
    else if (ch === "}") depth--
  }
  return src.slice(from, i - 1)
}

/**
 * Keys of an object literal's own entries. Values are skipped wholesale, which matters because they
 * can be JSX (`figma.instance(...)`, `<DrawerBody>…</DrawerBody>`), nested objects or calls — all of
 * which carry delimiters that would otherwise be mistaken for structure.
 */
function topLevelKeys(body) {
  const keys = []
  let depth = 0
  let quote = null
  let token = ""
  let expectKey = true

  for (let i = 0; i < body.length; i++) {
    const ch = body[i]

    if (quote !== null) {
      if (ch === "\\") i++
      else if (ch === quote) quote = null
      else if (expectKey && depth === 0) token += ch
      continue
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue }
    if (ch === "{" || ch === "(" || ch === "[" || ch === "<") { depth++; continue }
    if (ch === "}" || ch === ")" || ch === "]" || ch === ">") { depth--; continue }
    if (depth !== 0) continue

    if (ch === ",") { expectKey = true; token = ""; continue }
    if (ch === ":" && expectKey) {
      if (token.trim() !== "") keys.push(token.trim())
      expectKey = false
      token = ""
      continue
    }
    if (expectKey) token += ch
  }
  return uniq(keys)
}

/**
 * An axis's rule, with a per-component override taking precedence over the axis-level one.
 *
 * Needed because the same Figma axis can legitimately be treated differently per component: Figma
 * draws Pagination/Position but Pagination has no position prop, while other components map a
 * Position enum normally. An axis-level disposition alone would either flag the mapped ones or
 * silently excuse the unmapped one.
 */
function resolveRule(declared, axis, component) {
  if (!Object.prototype.hasOwnProperty.call(declared, axis)) return undefined
  const rule = declared[axis]
  if (rule !== null && typeof rule === "object" && Object.prototype.hasOwnProperty.call(rule, "components")) {
    const per = rule.components
    if (per !== null && typeof per === "object" && Object.prototype.hasOwnProperty.call(per, component)) {
      return { ...rule, ...per[component] }
    }
  }
  return rule
}

/** Exactly the two members true and false — semantically a boolean, however Figma spells the axis. */
function isBooleanAxis(members) {
  const set = new Set(members)
  return set.size === 2 && set.has("true") && set.has("false")
}

/* ── the comparison ─────────────────────────────────────── */

/**
 * @param {object} input
 * @param {Array<{name, figmaProperties, variants, sizes}>} input.components  from atlas/metadata
 * @param {Map<string,string>} input.codeConnect   component name -> Code Connect source
 * @param {object} input.axisMap                   packages/registry/figma-axis-map.json
 * @param {null|{entries: Record<string, object>, facts: Record<string, object>}} input.registry
 *   the authored entries (packages/registry/src) and the generated facts; null compares Figma↔code only
 *
 * @returns {{ findings, inspected, unclassifiedAxes, unmappedAxes, deferredAxes, registry }}
 * `findings` entries carry { component, axis, side, detail }. `side` is who must change: "code" for a
 * Figma↔code member-set disagreement (Figma is the authority), "registry" for any registry
 * disagreement (the registry is derived from both).
 */
export function compareAxes({ components, codeConnect, axisMap, registry = null }) {
  if (!axisMap || typeof axisMap !== "object") throw new Error("compare-axes: axisMap is required")
  const declared = axisMap.axes
  if (!declared || typeof declared !== "object") throw new Error("compare-axes: axisMap.axes is missing")

  const findings = []
  const unclassifiedAxes = []
  const unmappedAxes = []
  const deferredAxes = []
  let componentsInspected = 0
  let axesCompared = 0
  // with a registry, a component it renders has its state-like axes compared there instead of deferred
  if (registry !== null && (!own(registry, "entries") || !own(registry, "facts"))) throw new Error("compare-axes: registry needs entries and facts")
  const rendered = new Set(registry === null ? [] : Object.values(registry.entries).filter((e) => e.kind === "component").map((e) => e.aliasOf))

  for (const m of components) {
    const name = m.name
    if (typeof name !== "string" || name === "") throw new Error("compare-axes: a metadata entry has no name")

    componentsInspected++
    const figmaProperties = m.figmaProperties
    const ccSource = codeConnect.get(name)
    const ccEnums = ccSource === undefined ? new Map() : codeConnectEnums(ccSource)

    for (const axis of Object.keys(figmaProperties)) {
      const figmaMembers = figmaProperties[axis]
      const rule = resolveRule(declared, axis, name)

      if (rule === undefined) {
        unclassifiedAxes.push(`${name}.${axis}`)
        findings.push({
          component: name, axis, side: "axis-map",
          detail: `axis "${axis}" is not classified in packages/registry/figma-axis-map.json — classify it (code-union | code-connect | boolean | state | unmapped) with a reason`,
        })
        continue
      }

      const disposition = rule.disposition

      if (disposition === "state") { if (!rendered.has(name)) deferredAxes.push(`${name}.${axis}`); continue }
      if (disposition === "unmapped") { unmappedAxes.push(`${name}.${axis}`); continue }
      if (disposition === "boolean") {
        axesCompared++
        // nothing to compare member-wise; assert the mapping exists at all
        if (ccSource !== undefined && !ccSource.includes(`figma.boolean("${axis}"`)) {
          findings.push({
            component: name, axis, side: "code",
            detail: `Figma draws a boolean axis "${axis}" but ${name}.figma.tsx has no figma.boolean("${axis}") mapping`,
          })
        }
        continue
      }

      if (disposition === "code-union") {
        const field = rule.metadataField
        if (typeof field !== "string") throw new Error(`compare-axes: axis "${axis}" is code-union but names no metadataField`)
        const codeMembers = m[field]
        if (!Array.isArray(codeMembers)) {
          findings.push({
            component: name, axis, side: "figma-data",
            detail: `metadata.${field} is ${codeMembers === undefined ? "absent" : typeof codeMembers}, expected an array — cannot compare axis "${axis}"`,
          })
          continue
        }
        axesCompared++

        for (const member of missingFrom(figmaMembers, codeMembers)) {
          findings.push({
            component: name, axis, side: "code",
            detail: `Figma ${name}/${axis} has "${member}" and the code union does not — implement it`,
          })
        }
        for (const member of missingFrom(codeMembers, figmaMembers)) {
          findings.push({
            component: name, axis, side: "code",
            detail: `code has ${axis}="${member}" and Figma ${name}/${axis} does not — add it in Figma first, re-sync, then code (Figma is the authority, DEC-001)`,
          })
        }
      }

      if (disposition === "code-connect" || (disposition === "code-union" && rule.alsoCodeConnect === true)) {
        if (ccSource === undefined) {
          findings.push({
            component: name, axis, side: "code",
            detail: `no packages/figma-sync/code-connect/${name}.figma.tsx, so axis "${axis}" cannot be checked against Code Connect`,
          })
          continue
        }
        if (!ccEnums.has(axis)) {
          // A Figma axis whose members are exactly true|false is semantically a boolean, and Code
          // Connect may legitimately map it with figma.boolean instead of figma.enum — Select maps
          // Placeholder as an enum while DatePicker maps the same axis as a boolean. Both are correct,
          // so accept either rather than forcing one spelling.
          if (isBooleanAxis(figmaMembers) && ccSource.includes(`figma.boolean("${axis}"`)) continue
          // code-union axes are already compared against metadata, so a missing CC enum is only a gap
          // for axes that have no other source of truth.
          if (disposition === "code-connect") {
            findings.push({
              component: name, axis, side: "code",
              detail: `Figma ${name}/${axis} exists and ${name}.figma.tsx has no figma.enum("${axis}", …) — map it, or reclassify the axis in figma-axis-map.json with a reason`,
            })
          }
          continue
        }
        axesCompared++
        const ccKeys = ccEnums.get(axis)
        for (const member of missingFrom(figmaMembers, ccKeys)) {
          findings.push({
            component: name, axis, side: "code",
            detail: `Figma ${name}/${axis} has "${member}" and Code Connect figma.enum("${axis}") does not map it`,
          })
        }
        for (const member of missingFrom(ccKeys, figmaMembers)) {
          findings.push({
            component: name, axis, side: "code",
            detail: `Code Connect maps ${axis}="${member}" and Figma ${name}/${axis} has no such member — the Figma property was probably renamed; fix Figma first, re-sync, then Code Connect`,
          })
        }
      }
    }
  }

  const reg = registry === null ? null : compareRegistry({ components, registry, findings })
  if (reg !== null) axesCompared += reg.axes

  return {
    findings,
    inspected: { components: componentsInspected, axes: axesCompared, total: components.length },
    unclassifiedAxes: uniq(unclassifiedAxes).sort(),
    unmappedAxes: uniq(unmappedAxes).sort(),
    deferredAxes: uniq(deferredAxes).sort(),
    registry: reg, // null when no registry was passed: the comparison is then two-way
  }
}

/* ── the third leg: registry ↔ Figma and registry ↔ code (M3) ───────────── */

const own = (o, k) => o !== null && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, k)
/** `variant` → `Variant`, the axis name a protocol prop maps to when Code Connect does not say. */
const axisName = (prop) => prop.charAt(0).toUpperCase() + prop.slice(1)

/**
 * Every registry entry that renders a component, against that component's Figma axes and facts.
 * Fails on the REGISTRY side: an enum that differs from its Figma axis (narrower only with
 * `narrowed`), an enum member absent from the code union, a Figma `State` member the entry does not
 * classify (or a classified member Figma does not have), and a slot Figma supplies no content for.
 * Structural entries render nothing and have no Figma side. Absent facts or metadata FAIL closed.
 */
function compareRegistry({ components, registry, findings }) {
  const byName = new Map(components.map((m) => [m.name, m]))
  const out = { entries: 0, axes: 0, states: 0, enums: 0, slots: 0 }
  // a finding with no axis is printed bare, so its detail names the type
  const fail = (type, axis, detail) => findings.push({ component: type, axis, side: "registry", detail: axis === null ? `${type}: ${detail}` : detail })

  for (const e of Object.values(registry.entries)) {
    if (e.kind !== "component") continue
    const type = e.type
    out.entries++
    const m = byName.get(e.aliasOf)
    const f = registry.facts[e.aliasOf]
    if (m === undefined) { fail(type, null, `renders ${e.aliasOf}, which has no valid atlas/metadata entry — not compared`); continue }
    if (f === undefined) { fail(type, null, `no generated facts for ${e.aliasOf} — run npm run registry:build`); continue }
    const axes = m.figmaProperties
    const ccEnums = f.codeConnect.enums

    const protocolProps = own(e, "protocolProps") ? e.protocolProps : {}
    for (const [prop, spec] of Object.entries(protocolProps)) {
      if (!own(spec, "values")) continue
      const axis = own(ccEnums, prop) ? ccEnums[prop] : axisName(prop)
      if (own(f.unions, prop)) {
        for (const v of spec.values) if (!f.unions[prop].includes(v))
          fail(type, axis, `registry ${prop}="${v}" is not in the code union of ${e.aliasOf} (${f.unions[prop].join("|")}) — the registry is a subset of code`)
      }
      if (axis === "State" || !own(axes, axis)) continue
      out.axes++; out.enums++
      for (const v of missingFrom(spec.values, axes[axis]))
        fail(type, axis, `registry ${prop}="${v}" and Figma ${e.aliasOf}/${axis} has no such member — the registry derives from Figma; remove it`)
      const missing = missingFrom(axes[axis], spec.values)
      if (missing.length && !own(spec, "narrowed"))
        fail(type, axis, `Figma ${e.aliasOf}/${axis} has ${missing.map((x) => `"${x}"`).join(", ")} and registry ${prop} does not — add it, or declare "narrowed" with a reason`)
    }

    const states = own(e, "states") ? e.states : undefined
    if (own(axes, "State")) {
      out.axes++; out.states++
      if (states === undefined) fail(type, "State", `Figma ${e.aliasOf} has a State axis (${axes.State.join(", ")}) and the entry classifies none of it`)
      else {
        for (const s of axes.State) if (!own(states, s)) fail(type, "State", `Figma State "${s}" is not classified in the registry (interaction | prop)`)
        for (const s of Object.keys(states)) if (!axes.State.includes(s)) fail(type, "State", `registry classifies State "${s}" and Figma ${e.aliasOf} has no such member`)
      }
    } else if (states !== undefined) {
      fail(type, "State", `registry declares states and Figma ${e.aliasOf} has no State axis`)
    }

    const content = f.codeConnect.figmaContent
    for (const slot of own(e, "slots") ? e.slots : []) {
      out.slots++
      if (!content.includes(slot))
        fail(type, null, `slot "${slot}" has no Figma counterpart: no instance swap, figma.instance, figma.string or drawn content for it in ${f.codeConnect.file} — move it to hiddenProps with a reason, or draw it in Figma first`)
    }
  }
  return out
}
