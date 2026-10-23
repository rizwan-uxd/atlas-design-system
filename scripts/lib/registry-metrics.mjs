/**
 * registry-metrics — the three M3 metric checks over the registry (roadmap §2c, metrics.manifest.json):
 *
 *   design/registry-events    every interactive registered type declares typed events
 *   design/registry-fallback  every registered type declares a fallback that terminates
 *   design/registry-states    every interactive registered type classifies the states Figma draws
 *
 * One pure function, called by atlas-verify (a check per metric) and by metrics-report (the committed
 * metric region), so the two can never disagree. It reads only committed, schema-valid state: the
 * authored entries, the generated facts and the generated element facts.
 *
 * POPULATION, STATED HONESTLY. The metrics are about components; these checks can only see the types
 * that have a registry entry. Every result carries `covered`/`total` (components rendered by an entry
 * over all components in atlas/metadata), and the metric row prints it, so a pass over 5 registered
 * types never reads as a pass over 47 components.
 *
 * "Interactive" is decided from generated facts, not from the entry, so an entry cannot opt out by
 * omission: an own `on*` handler, an interaction member on Figma's State axis, or a declared capability.
 */

const own = (o, k) => o !== null && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, k)
const INTERACTION = new Set(["hover", "focus", "focus-visible", "active", "pressed"])

/**
 * @param {object} a
 * @param {Record<string, object>} a.entries   type → authored entry (schema-valid)
 * @param {Record<string, object>} a.facts     component → generated facts (schema-valid)
 * @param {Record<string, {events: string[]}>} a.elements  intrinsic element → its handler props (generated)
 * @param {string[]} a.components              every component name in atlas/metadata
 * @returns {Record<"events"|"fallback"|"states", { fails: string[], inspected: number, scope: number, covered: number, total: number, unit: string }>}
 */
export function registryMetrics({ entries, facts, elements, components }) {
  const list = Object.values(entries)
  const covered = new Set(list.filter((e) => e.kind === "component").map((e) => e.aliasOf)).size
  const base = (unit) => ({ fails: [], inspected: 0, scope: 0, covered, total: components.length, unit })
  const out = { events: base("interactive registered types"), fallback: base("registered types"), states: base("interactive registered components") }

  const factsOf = (e) => (e.kind === "component" && own(facts, e.aliasOf) ? facts[e.aliasOf] : undefined)
  const handlersOf = (e) => {
    if (e.kind === "component") { const f = factsOf(e); return f === undefined ? undefined : new Set(f.events.map((x) => x.name)) }
    return own(e, "element") && own(elements, e.element) ? new Set(elements[e.element].events) : undefined
  }
  const interactive = (e) => {
    if (own(e, "capabilities") && e.capabilities.length > 0) return true
    const f = factsOf(e)
    if (f === undefined) return false
    if (f.props.some((p) => /^on[A-Z]/.test(p.name))) return true
    return own(f.figma.axes, "State") && f.figma.axes.State.some((s) => INTERACTION.has(s))
  }

  for (const e of list) {
    const type = e.type
    if (e.kind === "component" && factsOf(e) === undefined) {
      // fail closed: a type whose facts are missing cannot be judged interactive or not
      for (const k of ["events", "states"]) { out[k].scope++; out[k].fails.push(`${type}: no generated facts for ${e.aliasOf} — run npm run registry:build`) }
      continue
    }
    if (!interactive(e)) continue

    // events: declared, non-empty, and every handler is a real (typed) handler of what renders it
    const ev = out.events
    ev.scope++; ev.inspected++
    const handlers = handlersOf(e)
    const events = own(e, "events") ? Object.entries(e.events) : []
    if (events.length === 0) ev.fails.push(`${type}: interactive, but declares no events`)
    else if (handlers === undefined) ev.fails.push(`${type}: structural with no generated element facts (declare "element" and run npm run registry:build)`)
    else for (const [name, { handler }] of events)
      if (!handlers.has(handler)) ev.fails.push(`${type}: event "${name}" → ${handler}, which ${e.kind === "component" ? e.aliasOf : `<${e.element}>`} does not have`)

    // states: only a rendered component has a Figma side to classify
    if (e.kind !== "component") continue
    const st = out.states
    st.scope++; st.inspected++
    const f = factsOf(e)
    const drawn = own(f.figma.axes, "State") ? f.figma.axes.State : []
    const states = own(e, "states") ? e.states : {}
    const stateProps = own(e, "stateProps") ? e.stateProps : {}
    const props = new Set([...f.props.map((p) => p.name), ...Object.values(f.inherited).flat()])
    for (const s of drawn) if (!own(states, s)) st.fails.push(`${type}: Figma draws State "${s}" and the entry does not classify it`)
    for (const [s, kind] of Object.entries(states)) {
      if (!drawn.includes(s)) st.fails.push(`${type}: classifies State "${s}", which Figma ${e.aliasOf} does not draw`)
      if (kind === "prop" && !(own(stateProps, s) && props.has(stateProps[s]))) st.fails.push(`${type}: State "${s}" is prop-driven but stateProps names no prop of ${e.aliasOf} for it`)
    }
  }

  // fallback: every registered type, and every chain ends at the one terminal (a self-fallback)
  const fb = out.fallback
  const terminals = list.filter((e) => own(e, "fallback") && e.fallback.type === e.type).map((e) => e.type)
  if (terminals.length > 1) fb.fails.push(`more than one terminal fallback (a type falling back to itself): ${terminals.join(", ")} — exactly one type may be terminal`)
  for (const e of list) {
    fb.scope++
    if (!own(e, "fallback")) { fb.fails.push(`${e.type}: declares no fallback`); continue }
    fb.inspected++
    const seen = [e.type]
    let cur = e
    while (own(cur, "fallback") && cur.fallback.type !== cur.type) {
      const next = cur.fallback.type
      if (!own(entries, next)) { fb.fails.push(`${e.type}: fallback chain reaches "${next}", which is not a registered type`); break }
      if (seen.includes(next)) { fb.fails.push(`${e.type}: fallback chain loops (${[...seen, next].join(" → ")})`); break }
      seen.push(next); cur = entries[next]
    }
    if (own(entries, cur.type) && !own(cur, "fallback") && cur !== e) fb.fails.push(`${e.type}: fallback chain ends at ${cur.type}, which declares no fallback`)
    const target = own(entries, e.fallback.type) ? entries[e.fallback.type] : undefined
    const allowed = target !== undefined && own(target, "protocolProps") ? target.protocolProps : {}
    for (const [k, v] of Object.entries(own(e.fallback, "props") ? e.fallback.props : {})) {
      if (!own(allowed, k)) fb.fails.push(`${e.type}: fallback prop "${k}" is not a protocolProp of ${e.fallback.type}`)
      else if (own(allowed[k], "values") && !allowed[k].values.includes(v)) fb.fails.push(`${e.type}: fallback ${k}=${JSON.stringify(v)} is not one of ${e.fallback.type}'s values`)
    }
  }
  return out
}

/** The metric row's coverage text, e.g. "0 failing of 5 registered types (4/47 components registered)". */
export const coverageText = (r) => `${r.fails.length} failing of ${r.scope} ${r.unit} (${r.covered}/${r.total} components registered)`
