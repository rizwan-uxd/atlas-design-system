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
 * Pass `ctx` (from `moduleContext`) to also mark each own prop whose annotation the contract can
 * assert exactly (`exact: true`, imports collected in `ctx.imports`).
 * @returns {{ propsType: string, props: {name,type,optional,exact?}[], inherited: Record<string,string[]>, events: {name,type}[], unions: Record<string,string[]> }}
 */
export function extractFacts(program, file, part, ctx = null) {
  const checker = program.getTypeChecker()
  const sf = program.getSourceFile(file)
  if (!sf) throw new Error(`registry: ${file} is not in the program`)
  const type = propsTypeOf(checker, sf, part, file)

  const props = [], inherited = {}, events = [], unions = {}
  for (const p of checker.getPropertiesOfType(type)) {
    const decls = p.declarations ?? []
    const t = checker.getNonNullableType(checker.getTypeOfSymbol(p))
    const typeText = checker.typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation)
    const ownDecl = decls.find((d) => d.getSourceFile() === sf)
    // an own prop keeps its annotation as written (`React.ReactNode`, `ButtonVariant`): stripping
    // undefined from ReactNode would otherwise expand the alias into its nine members
    if (ownDecl) props.push(ownProp(checker, p, ownDecl, sf, typeText, ctx))
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

/** The props type of an exported callable: its first parameter's type. */
function propsTypeOf(checker, sf, part, file) {
  const mod = checker.getSymbolAtLocation(sf)
  let sym = mod && checker.getExportsOfModule(mod).find((s) => s.name === part)
  if (!sym) throw new Error(`registry: ${path.basename(file)} does not export ${part}`)
  if (sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym)
  const [sig] = checker.getTypeOfSymbol(sym).getCallSignatures()
  const param = sig?.getParameters()[0]
  if (!param) throw new Error(`registry: ${part} in ${path.basename(file)} is not a component that takes props`)
  return checker.getTypeOfSymbol(param)
}

function ownProp(checker, p, decl, sf, typeText, ctx) {
  const out = { name: p.name, type: decl.type ? decl.type.getText(sf) : typeText, optional: (p.flags & ts.SymbolFlags.Optional) !== 0 }
  if (ctx && ts.isPropertySignature(decl) && decl.type && exactAnnotation(checker, decl.type, checker.getTypeOfSymbol(p), ctx)) out.exact = true
  return out
}

/* ── which annotations a contract can assert exactly ───────────────────── */

const RESERVED = new Set(["P", "Assert", "Exact", "Has", "IsOptional"])

/**
 * Context for reading every export of one component module: the imports that contract-scope type
 * annotations need accumulate in `imports`.
 */
export function moduleContext(program, file, moduleImport, root) {
  const checker = program.getTypeChecker()
  const sf = program.getSourceFile(file)
  const exportNames = new Set(checker.getExportsOfModule(checker.getSymbolAtLocation(sf)).map((s) => s.name))
  return { program, sf, moduleImport, exportNames, uiRoot: path.join(root, "packages/ui-web/src"), imports: new Map() }
}

/**
 * True when `node` (a type annotation in the component file) names only things a contract can import
 * — globals, exports of this module, React, other `@atlas/ui-web` modules and packages — and equals
 * `actual` (the prop's real type) both ways, so `Exact<NonNullable<P["x"]>, NonNullable<annotation>>`
 * holds today and fails when either side changes. The imports it needs are added to `ctx.imports`
 * only when it qualifies.
 */
function exactAnnotation(checker, node, actual, ctx) {
  const needed = []
  let ok = true
  const leftmost = (n) => (ts.isQualifiedName(n) ? leftmost(n.left) : ts.isPropertyAccessExpression(n) ? leftmost(n.expression) : n)
  const visit = (n) => {
    if (!ok) return
    if (ts.isImportTypeNode(n)) { ok = false; return }
    let id
    if (ts.isTypeReferenceNode(n)) id = leftmost(n.typeName)
    else if (ts.isTypeQueryNode(n)) id = leftmost(n.exprName)
    else if (ts.isExpressionWithTypeArguments(n)) id = leftmost(n.expression)
    if (id && ts.isIdentifier(id)) {
      const need = importFor(checker, id, node, ctx)
      if (need === null) { ok = false; return }
      if (need !== undefined) needed.push(need)
    }
    ts.forEachChild(n, visit)
  }
  visit(node)
  if (!ok) return false
  const a = checker.getNonNullableType(checker.getTypeFromTypeNode(node))
  const b = checker.getNonNullableType(actual)
  if (!(checker.isTypeAssignableTo(a, b) && checker.isTypeAssignableTo(b, a))) return false
  for (const n of needed) ctx.imports.set(`${n.kind}:${n.from}:${n.name}`, n)
  return true
}

/** The import a contract needs for identifier `id`: undefined for none (a global), null when impossible. */
function importFor(checker, id, root, ctx) {
  const sym = checker.getSymbolAtLocation(id)
  const decl = sym?.declarations?.[0]
  if (!decl) return null
  if (sym.flags & ts.SymbolFlags.TypeParameter) return decl.pos >= root.pos && decl.end <= root.end ? undefined : null
  const local = id.text
  const spec = (d) => d.moduleSpecifier.text
  let from, kind, name = local
  if (ts.isImportSpecifier(decl)) { from = spec(decl.parent.parent.parent); kind = "named"; name = (decl.propertyName ?? decl.name).text }
  else if (ts.isImportClause(decl)) { from = spec(decl.parent); kind = "default" }
  else if (ts.isNamespaceImport(decl)) { from = spec(decl.parent.parent); kind = "namespace" }
  else {
    const dsf = decl.getSourceFile()
    if (ctx.program.isSourceFileDefaultLibrary(dsf)) return undefined
    if (dsf === ctx.sf && ctx.exportNames.has(local)) { from = ctx.moduleImport; kind = "named" }
    else return null
  }
  if (from === "react" && local === "React") return undefined // the contract imports React itself
  if (from.startsWith(".")) {
    const abs = path.resolve(path.dirname(ctx.sf.fileName), from)
    const rel = path.relative(ctx.uiRoot, abs)
    if (rel.startsWith("..")) return null
    from = `@atlas/ui-web/${rel.split(path.sep).join("/")}`
  }
  if (RESERVED.has(local) || name !== local) return null // a contract cannot rename what it imports
  return { from, name: local, kind }
}

/* ── every other export of a component module ──────────────────────────── */

/**
 * Facts for the exports of a component module other than `mainPart`: every PascalCase callable that
 * takes props (a component part), split into branches when its props type is a discriminated union,
 * and every exported type alias or interface that is not a part's props type: string unions, object
 * types (own members) and aliases whose text is portable. Returns `{ imports, parts, types }`.
 */
export function extractModule(program, file, mainPart, ctx) {
  const checker = program.getTypeChecker()
  const sf = ctx.sf
  const exportsList = checker.getExportsOfModule(checker.getSymbolAtLocation(sf)).sort((a, b) => a.name.localeCompare(b.name))
  const parts = {}, types = {}, propsTypeNames = new Set()

  for (const ex of exportsList) {
    const sym = ex.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(ex) : ex
    if (!(sym.flags & ts.SymbolFlags.Value) || !/^[A-Z]/.test(ex.name)) continue
    const sig = checker.getTypeOfSymbol(sym).getCallSignatures()[0]
    const param = sig?.getParameters()[0]
    if (!param) continue
    const pdecl = param.declarations?.[0]
    if (pdecl && ts.isParameter(pdecl) && pdecl.type && ts.isTypeReferenceNode(pdecl.type)) propsTypeNames.add(pdecl.type.typeName.getText(sf))
    if (ex.name === mainPart) continue
    const type = checker.getTypeOfSymbol(param)
    const { propsType, props, unions } = extractFacts(program, sf.fileName, ex.name, ctx)
    const part = { propsType, props, unions }
    const branches = discriminated(checker, sf, type, ctx)
    if (branches) part.branches = branches
    parts[ex.name] = part
  }
  // the main part's props type is covered by the top-level facts
  for (const ex of exportsList) {
    const sym = ex.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(ex) : ex
    const decl = sym.declarations?.[0]
    if (!decl || decl.getSourceFile() !== sf || propsTypeNames.has(ex.name)) continue
    if (ts.isTypeAliasDeclaration(decl) && !decl.typeParameters) {
      const t = checker.getDeclaredTypeOfSymbol(sym)
      if (t.isUnion() && t.types.every((m) => m.isStringLiteral())) { types[ex.name] = { kind: "union", members: t.types.map((m) => m.value).sort() }; continue }
      if (ts.isTypeLiteralNode(decl.type)) { types[ex.name] = objectFacts(checker, sf, t, ctx); continue }
      if (exactAnnotation(checker, decl.type, t, ctx)) types[ex.name] = { kind: "alias", text: decl.type.getText(sf) }
    } else if (ts.isInterfaceDeclaration(decl) && !decl.typeParameters) {
      types[ex.name] = objectFacts(checker, sf, checker.getDeclaredTypeOfSymbol(sym), ctx)
    }
  }
  return { parts, types }
}

/** An exported object type: its own members, and `closed` when it has no others (so its key set is asserted). */
function objectFacts(checker, sf, type, ctx) {
  const props = memberProps(checker, sf, type, ctx)
  return { kind: "object", props, ...(props.length === checker.getPropertiesOfType(type).length ? { closed: true } : {}) }
}

/** Own members (declared in this file) of an object type, as facts props. */
function memberProps(checker, sf, type, ctx) {
  const out = []
  for (const p of checker.getPropertiesOfType(type)) {
    const decl = (p.declarations ?? []).find((d) => d.getSourceFile() === sf)
    if (!decl) continue
    out.push(ownProp(checker, p, decl, sf, checker.typeToString(checker.getNonNullableType(checker.getTypeOfSymbol(p)), undefined, ts.TypeFormatFlags.NoTruncation), ctx))
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Split a union props type by its discriminant: the one property that every member declares with a
 * single, distinct string literal (`mode?: "single"` | `mode: "range"`). Returns null for a non-union
 * or a union with no such property.
 */
function discriminated(checker, sf, type, ctx) {
  if (!type.isUnion() || !type.types.every((m) => m.getFlags() & ts.TypeFlags.Object || m.isIntersection())) return null
  const literal = (m, key) => {
    const p = checker.getPropertyOfType(m, key)
    if (!p) return undefined
    const t = checker.getNonNullableType(checker.getTypeOfSymbol(p))
    return t.isStringLiteral() ? t.value : undefined
  }
  const first = type.types[0]
  for (const p of checker.getPropertiesOfType(first)) {
    const values = type.types.map((m) => literal(m, p.name))
    if (values.some((v) => v === undefined) || new Set(values).size !== values.length) continue
    const members = {}
    type.types.forEach((m, i) => {
      const props = [], unions = {}
      for (const q of checker.getPropertiesOfType(m)) {
        const decl = (q.declarations ?? []).find((d) => d.getSourceFile() === sf)
        if (!decl) continue
        const t = checker.getNonNullableType(checker.getTypeOfSymbol(q))
        props.push(ownProp(checker, q, decl, sf, checker.typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation), ctx))
        if (t.isUnion() && t.types.every((x) => x.isStringLiteral())) unions[q.name] = t.types.map((x) => x.value).sort()
      }
      members[values[i]] = { props: props.sort((a, b) => a.name.localeCompare(b.name)), unions: sortKeys(unions) }
    })
    return { key: p.name, members: sortKeys(members) }
  }
  return null
}

const sortKeys = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]))

/* ── facts for intrinsic elements (structural entries' `element`) ──────── */

/** A virtual module naming each element's props, so the program resolves them through React's JSX types. */
export const elementsSource = (elements) =>
  `import type React from "react"\n${elements.map((el) => `export type El_${el} = React.ComponentProps<${JSON.stringify(el)}>`).join("\n")}\n`

/**
 * The handler props of every element in the virtual module: `{ form: { events: ["onSubmit", …] } }`.
 * Throws when an element does not resolve, so a misspelt `element` is a failure, not an empty list.
 */
export function extractElementEvents(program, file) {
  const checker = program.getTypeChecker()
  const sf = program.getSourceFile(file)
  if (!sf) throw new Error(`registry: ${file} is not in the program`)
  const out = {}
  for (const sym of checker.getExportsOfModule(checker.getSymbolAtLocation(sf)).sort((a, b) => a.name.localeCompare(b.name))) {
    const el = sym.name.replace(/^El_/, "")
    const events = checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(sym)).map((p) => p.name).filter((n) => /^on[A-Z]/.test(n)).sort()
    if (!events.length) throw new Error(`registry: <${el}> resolved to no handler props — is "${el}" an HTML element?`)
    out[el] = { events }
  }
  return out
}

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

  return { bound, part, instances: sortKeys(instances), stateProps: sortKeys(stateProps), enums: sortKeys(enums),
    figmaContent: figmaContentOf(propsProp, example, part) }
}

const CONTENT_CALLS = new Set(["instance", "string", "children", "textContent", "nestedProps"])

/**
 * Props of `part` that Figma supplies content for — the Figma side of a registry slot. A Code Connect
 * prop counts when it maps to content (`figma.instance`, `figma.string`, `figma.children`, or a
 * `figma.boolean`/`figma.enum` branch holding JSX); an attribute of the part in `example` counts when
 * it receives such a prop or literal content (a string, an element), and `children` counts when the
 * part element has content between its tags. Literal content is what Figma draws as a text or
 * instance layer that Code Connect does not parameterise ("Button label").
 */
function figmaContentOf(propsProp, example, part) {
  const content = new Set()
  if (propsProp && ts.isObjectLiteralExpression(propsProp.initializer))
    for (const m of propsProp.initializer.properties) {
      const key = ts.isPropertyAssignment(m) ? keyText(m.name) : undefined
      if (!key) continue
      let drawn = false
      const walk = (n) => {
        if (CONTENT_CALLS.has(n.expression?.name?.text) && isFigmaCall(n, n.expression.name.text)) drawn = true
        if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) drawn = true
        ts.forEachChild(n, walk)
      }
      walk(m.initializer)
      if (drawn) content.add(key)
    }
  const drawnKeys = new Set(content)
  content.clear()
  const isContent = (e) => e && (ts.isStringLiteralLike(e) || ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e) || ts.isJsxFragment(e) ||
    (ts.isIdentifier(e) && drawnKeys.has(e.text)) || ((ts.isArrowFunction(e) || ts.isFunctionExpression(e)) && hasJsx(e.body)))
  const hasJsx = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n) || (ts.forEachChild(n, (c) => hasJsx(c) || undefined) ?? false)
  let el
  const find = (n) => { if (!el && (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && tagName(n) === part) el = n; else ts.forEachChild(n, find) }
  if (example) find(example)
  if (!el) return []
  for (const a of el.attributes.properties) {
    if (!ts.isJsxAttribute(a) || !a.initializer) continue
    const name = a.name.getText()
    const init = a.initializer
    if (ts.isStringLiteralLike(init) || (ts.isJsxExpression(init) && isContent(init.expression))) content.add(name)
  }
  if (ts.isJsxOpeningElement(el)) {
    const kids = el.parent.children.filter((c) => !(ts.isJsxText(c) && c.containsOnlyTriviaWhiteSpaces))
    if (kids.some((c) => ts.isJsxText(c) || ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c) || ts.isJsxFragment(c) ||
      (ts.isJsxExpression(c) && isContent(c.expression)))) content.add("children")
  }
  return [...content].sort()
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
 * @param {Record<string, {events: string[]}>} [a.elements]  intrinsic element → handler props (generated)
 * @returns {{ fail: string[], warn: string[], inspected: number, rules: number }}
 */
export function checkRegistry({ entries, aliases, facts, components, cssTokens, elements = {} }) {
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
    for (const rel of ["children", "parents"]) for (const t of (e.nesting ?? {})[rel] ?? []) {
      rules++
      if (!(t in entries)) F(type, `nesting.${rel} "${t}" is not a registered type`)
    }
    if (e.kind === "structural") {
      if (e.element !== undefined && !(e.element in elements)) F(type, `element <${e.element}> has no generated element facts — run npm run registry:build`)
      for (const [event, { handler }] of Object.entries(e.events ?? {})) {
        rules++
        if (e.element === undefined) F(type, `event "${event}" needs "element": a structural type's handlers are those of the element it renders as`)
        else if (e.element in elements && !elements[e.element].events.includes(handler)) F(type, `event "${event}" names handler ${handler}, which <${e.element}> does not have`)
      }
      continue
    }
    if (e.element !== undefined) F(type, `"element" is for structural types; ${type} renders ${e.aliasOf}`)

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
 * optionality and exact types, string unions — for the part Code Connect drives and for every other
 * exported part, branch and type of the module), from any registry entry rendering it (protocolProps,
 * event handlers), and from packages/registry/contract-props.json (props a part must not have, and
 * inherited props it must keep).
 * Authoritative over none of them; never hand-edited.
 */
export function contractSource(f, entries, authored = {}) {
  const root = f.part.split(".")[0]
  const q = JSON.stringify
  const id = (n) => n.replace(/[^A-Za-z0-9]/g, "_")
  const mod = f.module
  const lines = []
  /** Own/Optional/Type/Union assertions for one props type `alias`, names prefixed with `pre`. */
  const propLines = (alias, pre, props, unions) => {
    for (const p of props) {
      lines.push(`type ${pre}Own_${id(p.name)} = Assert<Has<${alias}, ${q(p.name)}>>`)
      lines.push(`type ${pre}Optional_${id(p.name)} = Assert<Exact<IsOptional<${alias}, ${q(p.name)}>, ${p.optional}>>`)
      if (p.exact) lines.push(`type ${pre}Type_${id(p.name)} = Assert<Exact<NonNullable<${alias}[${q(p.name)}]>, NonNullable<${p.type}>>>`)
    }
    for (const [k, members] of Object.entries(unions).filter(([k]) => props.some((p) => p.name === k)))
      lines.push(`type ${pre}Union_${id(k)} = Assert<Exact<NonNullable<${alias}[${q(k)}]>, ${members.map(q).join(" | ")}>>`)
  }

  lines.push(`// own props of ${f.part}: deleting one, flipping its optionality or changing its type fails here`)
  propLines("P", "", f.props, f.unions)

  const aliasOf = (part) => (part === f.part ? "P" : `P_${id(part)}`)
  const partNames = Object.keys(mod.parts)
  for (const name of partNames) {
    const part = mod.parts[name]
    lines.push("", `// ${name}: another exported part of the module`, `type P_${id(name)} = React.ComponentProps<typeof ${name}>`)
    propLines(`P_${id(name)}`, `${id(name)}_`, part.props, part.unions)
    if (part.branches) for (const [value, b] of Object.entries(part.branches.members)) {
      const alias = `P_${id(name)}_${id(value)}`
      lines.push("", `// ${name} with ${part.branches.key} "${value}"`, `type ${alias} = Extract<P_${id(name)}, { ${part.branches.key}?: ${q(value)} }>`)
      propLines(alias, `${id(name)}_${id(value)}_`, b.props, b.unions)
    }
  }

  const typeNames = Object.keys(mod.types)
  if (typeNames.length) lines.push("", "// exported types of the module")
  for (const name of typeNames) {
    const t = mod.types[name]
    if (t.kind === "union") lines.push(`type Type_${id(name)} = Assert<Exact<${name}, ${t.members.map(q).join(" | ")}>>`)
    else if (t.kind === "alias") lines.push(`type Type_${id(name)} = Assert<Exact<${name}, ${t.text}>>`)
    else {
      propLines(name, `${id(name)}_`, t.props, {})
      if (t.closed) lines.push(`type ${id(name)}_Keys = Assert<Exact<keyof ${name}, ${t.props.length ? t.props.map((p) => q(p.name)).join(" | ") : "never"}>>`)
    }
  }

  for (const [part, spec] of Object.entries(authored)) {
    if (part !== f.part && !(part in mod.parts)) throw new Error(`registry: contract-props.json names ${f.name}.${part}, which is not an exported part of ${f.source}`)
    const alias = aliasOf(part)
    if (spec.absent) {
      lines.push("", `// ${part}: absent by design (packages/registry/contract-props.json)`)
      for (const [prop, reason] of Object.entries(spec.absent)) lines.push(`/** ${reason} */`, `type ${id(part)}_Absent_${id(prop)} = Assert<Exact<Has<${alias}, ${q(prop)}>, false>>`)
    }
    if (spec.present) {
      lines.push("", `// ${part}: inherited props it must keep (packages/registry/contract-props.json)`)
      for (const [prop, { type }] of Object.entries(spec.present)) {
        lines.push(`type ${id(part)}_Kept_${id(prop)} = Assert<Has<${alias}, ${q(prop)}>>`)
        lines.push(`type ${id(part)}_KeptType_${id(prop)} = Assert<Exact<NonNullable<${alias}[${q(prop)}]>, NonNullable<${type}>>>`)
      }
    }
  }

  for (const e of entries) {
    const names = [...Object.keys(e.protocolProps ?? {}), ...Object.values(e.events ?? {}).map((x) => x.handler)]
    if (!names.length) continue
    lines.push("", `// registry ${e.type}: its protocolProps and event handlers exist`)
    for (const n of names) lines.push(`type Registry_${e.type}_${id(n)} = Assert<Has<P, ${q(n)}>>`)
  }

  const fromModule = [root, ...partNames, ...typeNames, ...mod.imports.filter((i) => i.from === f.import).map((i) => i.name)]
  const imports = [`import type { ${[...new Set(fromModule)].sort().join(", ")} } from "${f.import}"`]
  for (const i of mod.imports.filter((i) => i.from !== f.import))
    imports.push(i.kind === "named" ? `import type { ${i.name} } from "${i.from}"` : i.kind === "default" ? `import type ${i.name} from "${i.from}"` : `import type * as ${i.name} from "${i.from}"`)
  return `// GENERATED — do not hand-edit. registry-build from packages/registry/generated/${f.name}.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
${imports.join("\n")}
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof ${f.part}>

${lines.join("\n")}
`
}

/* ── generated protocol schemas and the component map (M3 session 3) ───── */

/**
 * The non-nullable type text of named props of an exported part, read from the program — used for
 * protocolProps that are inherited (`name`, `value`), which the facts list by name only.
 */
export function propTypes(program, file, part, names) {
  const checker = program.getTypeChecker()
  const sf = program.getSourceFile(file)
  let sym = checker.getExportsOfModule(checker.getSymbolAtLocation(sf)).find((s) => s.name === part)
  if (sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym)
  const type = checker.getTypeOfSymbol(checker.getTypeOfSymbol(sym).getCallSignatures()[0].getParameters()[0])
  const out = {}
  for (const n of names) {
    const p = checker.getPropertyOfType(type, n)
    if (p) out[n] = checker.typeToString(checker.getNonNullableType(checker.getTypeOfSymbol(p)), undefined, ts.TypeFormatFlags.NoTruncation)
  }
  return out
}

/** JSON Schema for a TypeScript type's JSON-representable members; throws when it has none. */
export function jsonTypeOf(typeText, where) {
  const members = typeText.split(" | ").map((m) => m.trim())
  const out = []
  for (const m of members) {
    if (m === "string" || m === "number") out.push({ type: m })
    else if (m === "boolean" || m === "true" || m === "false") out.push({ type: "boolean" })
    else if (/^"[^"]*"$/.test(m)) out.push({ const: JSON.parse(m) })
  }
  const seen = new Set(), unique = out.filter((s) => { const k = JSON.stringify(s); return !seen.has(k) && seen.add(k) })
  if (!unique.length) throw new Error(`registry: ${where} is ${typeText}, which a JSON protocol message cannot carry`)
  return unique.length === 1 ? unique[0] : { anyOf: unique }
}

/**
 * The protocol-node schema for one registered type: `{ type, props, slots }`, closed at every level,
 * so an unknown prop or slot is invalid. Consumed by the M4 runtime validator; the props it allows are
 * exactly the entry's protocolProps, typed from the code.
 */
export function protocolSchema(entry, types) {
  const props = {}, required = []
  for (const [name, spec] of Object.entries(entry.protocolProps ?? {})) {
    props[name] = spec.values ? { enum: spec.values } : jsonTypeOf(types[name] ?? "", `${entry.type}.${name}`)
    if (spec.required) required.push(name)
  }
  const properties = {
    type: { const: entry.type },
    props: { type: "object", additionalProperties: false, properties: props, ...(required.length ? { required } : {}) },
  }
  const slots = entry.slots ?? []
  if (slots.length) properties.slots = { type: "object", additionalProperties: false, properties: Object.fromEntries(slots.map((s) => [s, { type: "array" }])) }
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://atlas.design-system/schemas/registry/${entry.type}.schema.json`,
    $comment: `GENERATED — do not hand-edit. registry-build from packages/registry/src/${entry.type}.registry.json${entry.aliasOf ? ` and the ${entry.aliasOf} facts` : ""}; run npm run registry:build.`,
    title: `${entry.type} protocol node`,
    type: "object",
    additionalProperties: false,
    required: ["type"],
    properties,
  }
}

/** `componentMap.ts`: registered type → the component that renders it, through deep imports (no barrel). */
export function componentMapSource(entries, metadata) {
  const rendered = Object.values(entries).filter((e) => e.kind === "component").sort((a, b) => a.type.localeCompare(b.type))
  const imports = [...new Set(rendered.map((e) => e.aliasOf))].sort()
    .map((c) => `import { ${c} } from "${metadata[c].import}"`)
  const structural = Object.values(entries).filter((e) => e.kind === "structural").map((e) => JSON.stringify(e.type)).sort()
  return `// GENERATED — do not hand-edit. registry-build from packages/registry/src and aliases.json; run npm run registry:build.
// Registered type → the Atlas component that renders it, through deep imports: there is no barrel,
// and this map is provably complete because it is generated from the registry (roadmap M4).
${imports.join("\n")}

export const componentMap = {
${rendered.map((e) => `  ${e.type === e.aliasOf ? e.type : `${e.type}: ${e.aliasOf}`},`).join("\n")}
} as const

/** Structural types are composed by the runtime from registered components, not rendered by one. */
export const structuralTypes = [${structural.join(", ")}] as const

export type RegisteredType = keyof typeof componentMap | (typeof structuralTypes)[number]
`
}

/** `runtimeRegistry.ts`: every authored entry and its protocol schema as JSON imports, for the M4 runtime (no fs at runtime). */
export function runtimeRegistrySource(entries, components) {
  const types = Object.keys(entries).sort()
  return `// GENERATED — do not hand-edit. registry-build from packages/registry/src, generated/schemas and aliases.json; run npm run registry:build.
// Every registered entry and its protocol schema, bundled so the runtime reads the registry without fs (roadmap M4).
import aliases from "../aliases.json"
${types.map((t) => `import ${t}Entry from "../src/${t}.registry.json"\nimport ${t}Schema from "./schemas/${t}.schema.json"`).join("\n")}

export const entries = {
${types.map((t) => `  ${t}: ${t}Entry,`).join("\n")}
}

export const schemas = {
${types.map((t) => `  ${t}: ${t}Schema,`).join("\n")}
}

export const aliasTable: Record<string, string> = aliases.aliases

/** Every Atlas component with generated facts, registered or not: the agent-visible universe (Phase 6, D-A). */
export const components: string[] = ${JSON.stringify([...components].sort())}
`
}
