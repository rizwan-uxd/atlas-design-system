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
 * Facts for one exported component part, read from the first parameter of its call signature: the
 * props React itself type-checks against (`React.ComponentProps<typeof Part>`), so a function
 * component, a `forwardRef` and a re-exported Radix part are read the same way.
 * Throws when the part is not exported or not callable: a component the registry cannot read is a
 * failure, never an empty fact sheet.
 * @returns {{ propsType: string, props: {name,type,optional}[], inherited: Record<string,string[]>, events: {name,type}[], unions: Record<string,string[]> }}
 */
export function extractFacts(program, file, part) {
  const checker = program.getTypeChecker()
  const sf = program.getSourceFile(file)
  if (!sf) throw new Error(`registry: ${file} is not in the program`)
  const mod = checker.getSymbolAtLocation(sf)
  let sym = mod && checker.getExportsOfModule(mod).find((s) => s.name === part)
  if (!sym) throw new Error(`registry: ${path.basename(file)} does not export ${part}`)
  if (sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym)
  const [sig] = checker.getTypeOfSymbol(sym).getCallSignatures()
  const param = sig?.getParameters()[0]
  if (!param) throw new Error(`registry: ${part} in ${path.basename(file)} is not a component that takes props`)
  const type = checker.getTypeOfSymbol(param)

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
  const propsType = checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation)
  return { propsType, props, inherited: sortKeys(inherited), events, unions: sortKeys(unions) }
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

/** The JSX tag name of an element: `Button`, or `Dialog.Content` for a property access. */
const tagName = (n) => n.tagName.getText()

/**
 * What a Code Connect file says about the Figma component at `nodeId`, read from the one
 * `figma.connect(Bound, "…node-id=<nodeId>", { props, example })` call that binds it:
 * `bound` the export it is connected to; `part` the element in `example` that the mapped props
 * drive (`<DrawerContent side={side}>` while `Drawer` is bound), which is whose props the facts read;
 * `instances` prop → Figma instance-swap layer (`figma.instance("Leading icon slot")`);
 * `stateProps` Figma `State` member → prop (`loading: figma.enum("State", { loading: true })`);
 * `enums` prop → Figma axis.
 * Throws when no connect call binds `nodeId`: the facts would otherwise describe another component.
 */
export function codeConnectFacts(src, nodeId, fileName = "x.figma.tsx") {
  const sf = ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const connects = []
  const find = (n) => { if (isFigmaCall(n, "connect")) connects.push(n); ts.forEachChild(n, find) }
  find(sf)
  const node = (call) => /node-id=(\d+)-(\d+)/.exec(stringArg(call, 1) ?? "")?.slice(1).join(":")
  const call = connects.find((c) => node(c) === nodeId)
  if (!call) throw new Error(`registry: ${fileName} has no figma.connect for node ${nodeId} (found ${connects.map(node).join(", ") || "none"})`)

  const bound = call.arguments[0].getText(sf)
  const instances = {}, stateProps = {}, enums = {}
  const opts = call.arguments.find((a) => ts.isObjectLiteralExpression(a))
  const member = (name) => opts?.properties.find((p) => (ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p)) && keyText(p.name) === name)
  const propsProp = member("props")
  if (propsProp && ts.isObjectLiteralExpression(propsProp.initializer))
    for (const m of propsProp.initializer.properties) {
      const key = ts.isPropertyAssignment(m) ? keyText(m.name) : undefined
      if (!key) continue
      const walk = (n) => {
        if (isFigmaCall(n, "instance")) { const layer = stringArg(n, 0); if (layer) instances[key] = layer }
        if (isFigmaCall(n, "enum")) {
          const axis = stringArg(n, 0)
          if (axis) enums[key] = axis
          const map = n.arguments[1]
          if (axis === "State" && map && ts.isObjectLiteralExpression(map))
            for (const e of map.properties)
              if (ts.isPropertyAssignment(e) && e.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                const state = keyText(e.name)
                if (state) stateProps[state] = key
              }
        }
        ts.forEachChild(n, walk)
      }
      walk(m.initializer)
    }

  // the element receiving the most `{mappedProp}` attributes; ties go to the bound export, then source order
  const mapped = new Set([...Object.keys(enums), ...Object.keys(instances), ...(propsProp && ts.isObjectLiteralExpression(propsProp.initializer) ? propsProp.initializer.properties.map((m) => keyText(m.name)).filter(Boolean) : [])])
  const counts = new Map()
  const example = member("example")
  const scan = (n) => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const hits = n.attributes.properties.filter((a) => ts.isJsxAttribute(a) && a.initializer && ts.isJsxExpression(a.initializer) &&
        a.initializer.expression && ts.isIdentifier(a.initializer.expression) && mapped.has(a.initializer.expression.text)).length
      const tag = tagName(n)
      if (!counts.has(tag)) counts.set(tag, 0)
      counts.set(tag, counts.get(tag) + hits)
    }
    ts.forEachChild(n, scan)
  }
  if (example) scan(example)
  let part = bound, best = counts.get(bound) ?? 0
  for (const [tag, hits] of counts) if (hits > best) { part = tag; best = hits }

  return { bound, part, instances: sortKeys(instances), stateProps: sortKeys(stateProps), enums: sortKeys(enums) }
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

/* ── generated contracts ───────────────────────────────────────────────── */

export const ASSERT_SOURCE = `// GENERATED — do not hand-edit. registry-build; run npm run registry:build.
// Helpers for the generated contracts. Tuple form ([A] extends [B]) stops a union from distributing,
// so Exact catches a member REMOVED as well as one added — the hole in the hand-written contracts.
export type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
/** Per-prop existence: cannot collapse the way Pick<P, keyof A & keyof P> did when a prop was deleted. */
export type Has<P, K extends PropertyKey> = K extends keyof P ? true : false
export type IsOptional<P, K extends PropertyKey> = K extends keyof P ? ({} extends Pick<P, K> ? true : false) : false
/** A false assertion is a type error on the line that names it (\`type Own_iconOnly = Assert<…>\`). */
export type Assert<T extends true> = T
`

/**
 * The contract for one component: a one-way tripwire derived from the facts (own props, their
 * optionality, string unions) and from any registry entry rendering it (protocolProps, event handlers).
 * Authoritative over neither; never hand-edited.
 */
export function contractSource(f, entries) {
  const root = f.part.split(".")[0]
  const q = JSON.stringify
  const id = (n) => n.replace(/[^A-Za-z0-9]/g, "_")
  const lines = []
  lines.push(`// own props of ${f.part}: deleting one, or flipping its optionality, fails here`)
  for (const p of f.props) {
    lines.push(`type Own_${id(p.name)} = Assert<Has<P, ${q(p.name)}>>`)
    lines.push(`type Optional_${id(p.name)} = Assert<Exact<IsOptional<P, ${q(p.name)}>, ${p.optional}>>`)
  }
  const unions = Object.entries(f.unions).filter(([k]) => f.props.some((p) => p.name === k))
  if (unions.length) lines.push("", `// string unions: exactly these members, so removing one fails as well as adding one`)
  for (const [k, members] of unions) lines.push(`type Union_${id(k)} = Assert<Exact<NonNullable<P[${q(k)}]>, ${members.map(q).join(" | ")}>>`)
  for (const e of entries) {
    const names = [...Object.keys(e.protocolProps ?? {}), ...Object.values(e.events ?? {}).map((x) => x.handler)]
    if (!names.length) continue
    lines.push("", `// registry ${e.type}: its protocolProps and event handlers exist`)
    for (const n of names) lines.push(`type Registry_${e.type}_${id(n)} = Assert<Has<P, ${q(n)}>>`)
  }
  return `// GENERATED — do not hand-edit. registry-build from packages/registry/generated/${f.name}.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { ${root} } from "${f.import}"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof ${f.part}>

${lines.join("\n")}
`
}
