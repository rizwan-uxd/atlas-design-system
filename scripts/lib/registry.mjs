/**
 * registry — the generated half of packages/registry and the invariant that binds the authored half
 * to it (M3, roadmap §2c).
 *
 * WHY THE COMPILER API. atlas/metadata's `props` come from a regex over a component's own interface
 * members, so `onClick` and `disabled` (inherited from React's DOM types) do not exist there and
 * `events` had no source at all. `getPropertiesOfType` returns the real resolved props, inherited DOM
 * props and every handler included, which is what lets the invariant say "this event has a handler".
 *
 * THE INVARIANT. The authored registry is always a SUBSET of the generated facts, never a superset.
 * Every authored claim that code cannot back FAILs on the authored side; code having more than the
 * registry exposes is legitimate (the agent surface is smaller than the component surface), except
 * that own props must be accounted for, which is WARN until `registryComplete: true` makes it FAIL.
 */
import path from "node:path"
import ts from "typescript"

/* ── formatting ─────────────────────────────────────────────────────────── */

const scalar = (v) => v === null || typeof v !== "object"

/**
 * JSON with 2-space indent, but arrays of scalars and small flat objects on one line, so a 300-prop
 * facts file stays a reviewable diff.
 */
export function formatJson(value) {
  const out = (v, pad) => {
    if (scalar(v)) return JSON.stringify(v)
    if (!Array.isArray(v) && Object.values(v).every(scalar) && JSON.stringify(v).length <= 120)
      return `{ ${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${JSON.stringify(x)}`).join(", ")} }`.replace("{  }", "{}")
    if (Array.isArray(v)) {
      if (v.length === 0) return "[]"
      if (v.every(scalar)) return `[${v.map((x) => JSON.stringify(x)).join(", ")}]`
      return `[\n${v.map((x) => pad + "  " + out(x, pad + "  ")).join(",\n")}\n${pad}]`
    }
    const keys = Object.keys(v)
    if (keys.length === 0) return "{}"
    return `{\n${keys.map((k) => `${pad}  ${JSON.stringify(k)}: ${out(v[k], pad + "  ")}`).join(",\n")}\n${pad}}`
  }
  return out(value, "") + "\n"
}

/* ── facts from the TypeScript program ──────────────────────────────────── */

/** The repo's compiler options, from tsconfig.json, so `@atlas/ui-web/*` paths resolve as in `tsc`. */
export function compilerOptions(root) {
  const host = { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n")) } }
  const cfg = ts.getParsedCommandLineOfConfigFile(path.join(root, "tsconfig.json"), {}, host)
  if (!cfg) throw new Error("registry: cannot read tsconfig.json")
  return { ...cfg.options, incremental: false, noEmit: true, plugins: [] }
}

/** The interface or type a property is declared in, used to group inherited props. */
function declaringName(decl) {
  const p = decl.parent
  if (p && (ts.isInterfaceDeclaration(p) || ts.isClassDeclaration(p)) && p.name) return p.name.text
  if (p && ts.isTypeLiteralNode(p) && ts.isTypeAliasDeclaration(p.parent)) return p.parent.name.text
  return "(anonymous)"
}

/**
 * Facts for one component from a program that contains `file`.
 * Throws when `<name>Props` is not exported: a component the registry cannot read is a failure,
 * never an empty fact sheet.
 * @returns {{ props: {name,type,optional}[], inherited: Record<string,string[]>, events: {name,type}[], unions: Record<string,string[]> }}
 */
export function extractFacts(program, file, name) {
  const checker = program.getTypeChecker()
  const sf = program.getSourceFile(file)
  if (!sf) throw new Error(`registry: ${file} is not in the program`)
  const mod = checker.getSymbolAtLocation(sf)
  const propsSym = mod && checker.getExportsOfModule(mod).find((s) => s.name === `${name}Props`)
  if (!propsSym) throw new Error(`registry: ${path.basename(file)} does not export ${name}Props`)
  const type = checker.getDeclaredTypeOfSymbol(propsSym)

  const props = [], inherited = {}, events = [], unions = {}
  for (const p of checker.getPropertiesOfType(type)) {
    const decls = p.declarations ?? []
    const t = checker.getNonNullableType(checker.getTypeOfSymbol(p))
    const typeText = checker.typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation)
    const ownDecl = decls.find((d) => d.getSourceFile() === sf)
    // an own prop keeps its annotation as written (`React.ReactNode`, `ButtonVariant`): stripping
    // undefined from ReactNode would otherwise expand the alias into its nine members
    if (ownDecl) props.push({ name: p.name, type: ownDecl.type ? ownDecl.type.getText(sf) : typeText, optional: (p.flags & ts.SymbolFlags.Optional) !== 0 })
    else {
      const group = decls.length ? declaringName(decls[0]) : "(anonymous)"
      ;(inherited[group] ??= []).push(p.name)
    }
    if (/^on[A-Z]/.test(p.name)) events.push({ name: p.name, type: typeText })
    if (t.isUnion() && t.types.every((m) => m.isStringLiteral())) unions[p.name] = t.types.map((m) => m.value).sort()
  }
  const byName = (a, b) => a.name.localeCompare(b.name)
  props.sort(byName); events.sort(byName)
  for (const g of Object.keys(inherited)) inherited[g].sort()
  return { props, inherited: sortKeys(inherited), events, unions: sortKeys(unions) }
}

const sortKeys = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]))

/* ── facts from Code Connect ────────────────────────────────────────────── */

const isFigmaCall = (n, method) =>
  ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) &&
  ts.isIdentifier(n.expression.expression) && n.expression.expression.text === "figma" &&
  n.expression.name.text === method

const stringArg = (call, i) => {
  const a = call.arguments[i]
  return a && ts.isStringLiteralLike(a) ? a.text : undefined
}

const keyText = (name) => (ts.isIdentifier(name) || ts.isStringLiteralLike(name) ? name.text : undefined)

/**
 * What a Code Connect file says about slots and states, read from its `props` mapping:
 * `instances` prop → Figma instance-swap layer (`figma.instance("Leading icon slot")`),
 * `stateProps` Figma `State` member → prop (`loading: figma.enum("State", { loading: true })`),
 * `enums` prop → Figma axis.
 */
export function codeConnectFacts(src, fileName = "x.figma.tsx") {
  const sf = ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const instances = {}, stateProps = {}, enums = {}
  const visitMapping = (key, node) => {
    const walk = (n) => {
      if (isFigmaCall(n, "instance")) { const layer = stringArg(n, 0); if (layer) instances[key] = layer }
      if (isFigmaCall(n, "enum")) {
        const axis = stringArg(n, 0)
        if (axis) enums[key] = axis
        const map = n.arguments[1]
        if (axis === "State" && map && ts.isObjectLiteralExpression(map))
          for (const m of map.properties)
            if (ts.isPropertyAssignment(m) && m.initializer.kind === ts.SyntaxKind.TrueKeyword) {
              const member = keyText(m.name)
              if (member) stateProps[member] = key
            }
      }
      ts.forEachChild(n, walk)
    }
    walk(node)
  }
  const visit = (n) => {
    if (isFigmaCall(n, "connect")) {
      const opts = n.arguments.find((a) => ts.isObjectLiteralExpression(a))
      const propsProp = opts?.properties.find((p) => ts.isPropertyAssignment(p) && keyText(p.name) === "props")
      if (propsProp && ts.isObjectLiteralExpression(propsProp.initializer))
        for (const m of propsProp.initializer.properties) {
          const key = ts.isPropertyAssignment(m) ? keyText(m.name) : undefined
          if (key) visitMapping(key, m.initializer)
        }
    }
    ts.forEachChild(n, visit)
  }
  visit(sf)
  return { instances: sortKeys(instances), stateProps: sortKeys(stateProps), enums: sortKeys(enums) }
}

/* ── the invariant ──────────────────────────────────────────────────────── */

const NODE_TYPE = /ReactNode|ReactElement|Element|=>/

/**
 * Check the authored registry against the generated facts.
 * @param {object} a
 * @param {Record<string, object>} a.entries  type → authored entry
 * @param {Record<string, string>} a.aliases  north-star name → component | "structural"
 * @param {Record<string, object>} a.facts    component → generated facts
 * @param {Set<string>} a.components          every component name in atlas/metadata
 * @param {Set<string>} a.cssTokens           every --atlas-* declared in atlas.tokens.css
 * @returns {{ fail: string[], warn: string[], inspected: number, rules: number }}
 */
export function checkRegistry({ entries, aliases, facts, components, cssTokens }) {
  const fail = [], warn = []
  let rules = 0
  const F = (type, msg) => fail.push(`${type}: ${msg}`)

  for (const [alias, target] of Object.entries(aliases)) {
    rules++
    if (components.has(alias)) fail.push(`aliases.json: "${alias}" is already a component name; an alias may not shadow one`)
    if (target !== "structural" && !components.has(target)) fail.push(`aliases.json: "${alias}" → "${target}", which is not a component in atlas/metadata`)
  }

  for (const [type, e] of Object.entries(entries)) {
    if (e.kind === "structural") {
      rules++
      if (aliases[type] !== "structural") F(type, `a structural type must be declared "structural" in aliases.json`)
      for (const c of e.composedOf) if (!components.has(c)) F(type, `composedOf "${c}" is not a component in atlas/metadata`)
    } else {
      rules++
      if (!components.has(e.aliasOf)) { F(type, `aliasOf "${e.aliasOf}" is not a component in atlas/metadata`); continue }
      if (type !== e.aliasOf && aliases[type] !== e.aliasOf)
        F(type, `renders ${e.aliasOf} but aliases.json maps "${type}" to ${JSON.stringify(aliases[type] ?? null)}`)
      if (type === e.aliasOf && type in aliases) F(type, `aliases.json maps "${type}" to "${aliases[type]}", but the entry renders ${type}`)
    }

    if (e.fallback !== undefined) {
      rules++
      const t = e.fallback.type
      if (!(t in entries)) F(type, `fallback "${t}" is not a registered type`)
    }
    if (e.kind === "structural") continue

    const f = facts[e.aliasOf]
    if (!f) { F(type, `no generated facts for ${e.aliasOf} — run npm run registry:build`); continue }
    const own = new Map(f.props.map((p) => [p.name, p]))
    const all = new Set([...own.keys(), ...Object.values(f.inherited).flat()])
    const handlers = new Set(f.events.map((x) => x.name))

    for (const [prop, spec] of Object.entries(e.protocolProps ?? {})) {
      rules++
      if (!all.has(prop)) { F(type, `protocolProps "${prop}" is not a prop of ${e.aliasOf}`); continue }
      const union = f.unions[prop]
      if (spec.values === undefined) {
        if (union) F(type, `protocolProps "${prop}" is the union ${union.join("|")}; declare its values`)
        continue
      }
      if (!union) { F(type, `protocolProps "${prop}" declares values, but ${e.aliasOf}.${prop} is not a string-literal union`); continue }
      for (const v of spec.values) if (!union.includes(v)) F(type, `protocolProps "${prop}" value "${v}" is not in the code union ${union.join("|")}`)
      const missing = union.filter((v) => !spec.values.includes(v))
      if (missing.length && spec.narrowed === undefined)
        F(type, `protocolProps "${prop}" omits ${missing.join(", ")} from the code union; add "narrowed" with a reason`)
    }

    for (const [event, { handler }] of Object.entries(e.events ?? {})) {
      rules++
      if (!handlers.has(handler)) F(type, `event "${event}" names handler ${handler}, which ${e.aliasOf} does not have`)
    }

    for (const slot of e.slots ?? []) {
      rules++
      const p = own.get(slot)
      if (!(p && NODE_TYPE.test(p.type)) && !(slot in f.codeConnect.instances))
        F(type, `slot "${slot}" is neither a ReactNode or render prop of ${e.aliasOf} nor a Code Connect figma.instance`)
    }

    for (const [role, token] of Object.entries(e.tokenRoles ?? {})) {
      rules++
      if (!cssTokens.has(token)) F(type, `tokenRoles "${role}" → ${token}, which atlas.tokens.css does not declare`)
      else if (!f.tokensUsed.includes(token)) F(type, `tokenRoles "${role}" → ${token}, which ${e.aliasOf} does not use`)
    }

    rules++
    const figmaStates = f.figma.axes.State
    if (figmaStates === undefined) {
      if (e.states !== undefined) F(type, `declares states, but Figma ${e.aliasOf} has no State axis`)
    } else if (e.states === undefined) {
      F(type, `Figma ${e.aliasOf} has a State axis (${figmaStates.join(", ")}); classify every member in states`)
    } else {
      const declared = Object.keys(e.states)
      for (const s of figmaStates) if (!declared.includes(s)) F(type, `Figma State "${s}" is not classified in states`)
      for (const s of declared) if (!figmaStates.includes(s)) F(type, `states "${s}" is not a Figma State member of ${e.aliasOf}`)
    }
    const stateProps = e.stateProps ?? {}
    for (const [s, kind] of Object.entries(e.states ?? {}))
      if (kind === "prop" && !(s in stateProps)) F(type, `state "${s}" is prop-driven but has no stateProps entry`)
    for (const [s, prop] of Object.entries(stateProps)) {
      rules++
      if ((e.states ?? {})[s] !== "prop") F(type, `stateProps "${s}" is not a prop-driven state`)
      if (!all.has(prop)) F(type, `stateProps "${s}" → "${prop}", which is not a prop of ${e.aliasOf}`)
      const cc = f.codeConnect.stateProps[s]
      if (cc !== undefined && cc !== prop) F(type, `stateProps "${s}" → "${prop}", but Code Connect maps State "${s}" to "${cc}"`)
    }

    const hidden = e.hiddenProps ?? {}
    for (const h of Object.keys(hidden)) { rules++; if (!own.has(h)) F(type, `hiddenProps "${h}" is not an own prop of ${e.aliasOf}`) }
    const accounted = new Set([...Object.keys(e.protocolProps ?? {}), ...(e.slots ?? []), ...Object.keys(hidden),
      ...Object.values(e.events ?? {}).map((x) => x.handler)])
    const unaccounted = [...own.keys()].filter((p) => !accounted.has(p))
    if (unaccounted.length) {
      const msg = `own props not in protocolProps, slots, events or hiddenProps: ${unaccounted.join(", ")}`
      if (e.registryComplete) F(type, msg)
      else warn.push(`${type}: ${msg}`)
    }
  }
  return { fail, warn, inspected: Object.keys(entries).length, rules }
}
