/**
 * compare-axes — the independent Figma→code comparison (M1).
 *
 * A TWO-WAY comparator, registry-ready: it compares Figma's variant axes against code, and its result
 * shape already carries a `registry` slot that stays null until M3 fills it. It is named for what it
 * is, so nothing in this repo claims a three-way check before one exists.
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
 *    "agrees". This is the whole point of M1 preceding the registry.
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

/* ── structural guard ───────────────────────────────────── */

/**
 * M1 runs BEFORE the ajv schema layer (M2), so it carries its own narrow guard rather than trusting
 * the shape. M2 generalises this to every JSON input and deletes this function in the same commit
 * that adds the schema — a deliberate temporary duplication, recorded here so it is not mistaken for
 * an oversight.
 *
 * An axis must be a non-empty array of non-empty strings. Anything else — an object, a number, an
 * empty array, an array holding a non-string — is MALFORMED and fails. Nothing is coerced and nothing
 * is skipped, because both of those turn bad data into a silent pass.
 */
export function guardFigmaProperties(name, figmaProperties) {
  const problems = []
  if (figmaProperties === undefined) return [`${name}: figmaProperties is absent — re-pull from Figma`]
  if (figmaProperties === null) return [`${name}: figmaProperties is null — re-pull from Figma`]
  if (typeof figmaProperties !== "object" || Array.isArray(figmaProperties)) {
    return [`${name}: figmaProperties is ${Array.isArray(figmaProperties) ? "an array" : typeof figmaProperties}, expected an object`]
  }
  const axes = Object.keys(figmaProperties)
  if (axes.length === 0) return [`${name}: figmaProperties is empty — a component with no Figma axes is unverifiable, re-pull from Figma`]

  for (const axis of axes) {
    const members = figmaProperties[axis]
    if (!Array.isArray(members)) {
      problems.push(`${name}.${axis}: expected an array of members, got ${members === null ? "null" : typeof members}`)
      continue
    }
    if (members.length === 0) {
      problems.push(`${name}.${axis}: member list is empty`)
      continue
    }
    for (const member of members) {
      if (typeof member !== "string") {
        problems.push(`${name}.${axis}: member ${JSON.stringify(member)} is ${typeof member}, expected a string`)
      } else if (member.trim() === "") {
        problems.push(`${name}.${axis}: a member is an empty string`)
      }
    }
  }
  return problems
}

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
 * @param {null|object} input.registry             M3 fills this; null keeps the check two-way
 *
 * @returns {{ findings, inspected, unclassifiedAxes, unmappedAxes, deferredAxes, registry }}
 * `findings` entries carry { component, axis, side, detail }. `side` is who must change, and for a
 * member-set disagreement it is always "code", because Figma is the authority.
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

  for (const m of components) {
    const name = m.name
    if (typeof name !== "string" || name === "") throw new Error("compare-axes: a metadata entry has no name")

    // fail closed: structural problems are findings, not reasons to skip
    const problems = guardFigmaProperties(name, m.figmaProperties)
    if (problems.length) {
      for (const detail of problems) findings.push({ component: name, axis: null, side: "figma-data", detail })
      continue
    }

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

      if (disposition === "state") { deferredAxes.push(`${name}.${axis}`); continue }
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

  return {
    findings,
    inspected: { components: componentsInspected, axes: axesCompared, total: components.length },
    unclassifiedAxes: uniq(unclassifiedAxes).sort(),
    unmappedAxes: uniq(unmappedAxes).sort(),
    deferredAxes: uniq(deferredAxes).sort(),
    registry, // M3 fills this; null keeps the comparison two-way
  }
}
