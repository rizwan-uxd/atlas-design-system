// scripts/lib/registry.mjs + scripts/registry-build.mjs (M3): facts come from the real TypeScript
// types and Code Connect, and every authored claim code cannot back FAILs on the authored side.
import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import Ajv2020 from "ajv/dist/2020.js"
import { ASSERT_SOURCE, checkRegistry, codeConnectFacts, compilerOptions, componentMapSource, contractSource, elementsSource, extractElementEvents, extractFacts, formatJson, jsonTypeOf, protocolSchema, runtimeRegistrySource } from "../lib/registry.mjs"

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const BUTTON = path.join(REPO, "packages/ui-web/src/primitives/Button/Button.tsx")
const INPUT = path.join(REPO, "packages/ui-web/src/primitives/Input/Input.tsx")

// ─── formatting ─────────────────────────────────────────────────────────────

test("formatJson keeps scalar arrays and small flat objects on one line", () => {
  const text = formatJson({ a: ["x", "y"], b: { c: 1 }, d: [{ e: "f" }], g: {} })
  assert.equal(text, '{\n  "a": ["x", "y"],\n  "b": { "c": 1 },\n  "d": [\n    { "e": "f" }\n  ],\n  "g": {}\n}\n')
  assert.deepEqual(JSON.parse(text), { a: ["x", "y"], b: { c: 1 }, d: [{ e: "f" }], g: {} })
})

// ─── facts from the program ─────────────────────────────────────────────────

let program
const prog = () => (program ??= ts.createProgram([BUTTON, INPUT], compilerOptions(REPO)))

test("inherited DOM props and handlers are facts — the regex metadata never had onClick or disabled", () => {
  const f = extractFacts(prog(), BUTTON, "Button")
  assert.ok(f.events.some((e) => e.name === "onClick" && e.type === "MouseEventHandler<HTMLButtonElement>"))
  assert.ok(f.inherited.ButtonHTMLAttributes.includes("disabled"))
  assert.deepEqual(f.props.map((p) => p.name), ["asChild", "children", "iconOnly", "leadingIcon", "loading", "size", "trailingIcon", "variant"])
  assert.equal(f.props.find((p) => p.name === "leadingIcon").type, "React.ReactNode")
  assert.deepEqual(f.unions.variant, ["destructive", "ghost", "link", "outline", "primary", "secondary"])
})

test("an Omit<> base still reports its declaring interface, and the omitted props are gone", () => {
  const f = extractFacts(prog(), INPUT, "Input")
  assert.ok(f.inherited.InputHTMLAttributes.includes("onChange"))
  assert.ok(!f.inherited.InputHTMLAttributes.includes("size"), "size is omitted from the DOM base and redeclared")
  assert.deepEqual(f.unions.size, ["lg", "md", "sm"])
})

test("a part that is not exported throws instead of yielding empty facts", () => {
  assert.throws(() => extractFacts(prog(), BUTTON, "Nope"), /does not export Nope/)
})

test("props come from the call signature, so the props type name does not matter", () => {
  assert.equal(extractFacts(prog(), BUTTON, "Button").propsType, "ButtonProps")
})

// ─── facts from Code Connect ────────────────────────────────────────────────

test("Code Connect yields instance slots, State → prop mappings and enum axes", () => {
  const src = fs.readFileSync(path.join(REPO, "packages/figma-sync/code-connect/Button.figma.tsx"), "utf8")
  const cc = codeConnectFacts(src, "19:2")
  assert.equal(cc.bound, "Button")
  assert.equal(cc.part, "Button")
  assert.deepEqual(cc.instances, { leadingIcon: "Leading icon slot", trailingIcon: "Trailing icon slot" })
  assert.deepEqual(cc.stateProps, { disabled: "disabled", loading: "loading" })
  assert.equal(cc.enums.variant, "Variant")
})

const cc = (name) => fs.readFileSync(path.join(REPO, `packages/figma-sync/code-connect/${name}.figma.tsx`), "utf8")

test("the part is the element the mapped props drive, not always the bound export", () => {
  const drawer = codeConnectFacts(cc("Drawer"), "577:24")
  assert.equal(drawer.bound, "Drawer")
  assert.equal(drawer.part, "DrawerContent", "<DrawerContent side={side}> receives the Figma Side axis")
})

test("only the connect call bound to the component's node is read", () => {
  const head = codeConnectFacts(cc("Table"), "674:68")
  assert.equal(head.part, "TableHead")
  assert.equal(codeConnectFacts(cc("Table"), "674:137").part, "TableRow")
  assert.ok(!("selected" in head.enums), "TableRow's mappings are not merged into TableHead's")
})

test("figmaContent lists the part props Figma supplies content for, and nothing else", () => {
  // Button: two figma.instance slots, plus literal text children ("Button label")
  assert.deepEqual(codeConnectFacts(cc("Button"), "19:2").figmaContent, ["children", "leadingIcon", "trailingIcon"])
  // Input: figma.string inside figma.boolean branches, and a literal placeholder attribute
  assert.deepEqual(codeConnectFacts(cc("Input"), "43:111").figmaContent, ["leadingIcon", "placeholder", "prefix", "suffix", "trailingIcon"])
  // Alert: a JSX branch (actions) and literal strings; dismissible is a bare boolean and icon is not drawn
  assert.deepEqual(codeConnectFacts(cc("Alert"), "127:24").figmaContent, ["actions", "description", "title"])
  // Field: a render-prop child that returns an element counts as children
  assert.ok(codeConnectFacts(cc("Field"), "863:254").figmaContent.includes("children"))
})

test("a Code Connect file with no connect for the node throws", () => {
  assert.throws(() => codeConnectFacts(cc("Button"), "1:1", "Button.figma.tsx"), /no figma.connect for node 1:1 \(found 19:2\)/)
})

// ─── generated contracts ────────────────────────────────────────────────────

/** Semantic diagnostics for `files` (path → source), overlaying the real tree, as tsc would report them. */
function typecheck(files, check) {
  const opts = compilerOptions(REPO)
  const host = ts.createCompilerHost(opts)
  const read = host.readFile.bind(host), exists = host.fileExists.bind(host), get = host.getSourceFile.bind(host)
  host.readFile = (f) => files[f] ?? read(f)
  host.fileExists = (f) => f in files || exists(f)
  host.getSourceFile = (f, lang, ...rest) => (f in files ? ts.createSourceFile(f, files[f], lang, true) : get(f, lang, ...rest))
  const program = ts.createProgram(Object.keys(files).filter((f) => f.endsWith(".ts")), opts, host)
  return check.flatMap((f) => program.getSemanticDiagnostics(program.getSourceFile(f))).map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"))
}

const CONTRACT_PROPS = JSON.parse(fs.readFileSync(path.join(REPO, "packages/registry/contract-props.json"), "utf8")).components
const GEN_DIR = path.join(REPO, "packages/governance/contracts")
const buttonFacts = () => JSON.parse(fs.readFileSync(path.join(REPO, "packages/registry/generated/Button.facts.json"), "utf8"))
// The shape of the 44 hand-written contracts deleted in M3 session 4, kept as a fixture so the two
// holes the generated contracts close stay demonstrated: a subset check that only catches widening,
// and a Pick that collapses when the prop is gone.
const HAND_PATTERN = `import type { ButtonProps, ButtonVariant } from "@atlas/ui-web/primitives/Button/Button"
type AssertButtonVariant = ButtonVariant extends "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link" ? true : false
const _v: AssertButtonVariant = true; void _v
type AssertButtonShape = { variant?: ButtonVariant; iconOnly?: boolean; loading?: boolean }
type _CheckButtonProps = AssertButtonShape extends Pick<ButtonProps, keyof AssertButtonShape & keyof ButtonProps> ? true : never
const _p: _CheckButtonProps = true; void _p
`
const hand = path.join(REPO, "packages/governance/contracts/__hand_pattern__.ts")
const generated = path.join(GEN_DIR, "Button.contract.ts")
const buttonContracts = (buttonSource) => {
  const files = {
    [path.join(GEN_DIR, "_assert.ts")]: ASSERT_SOURCE,
    [generated]: contractSource(buttonFacts(), [], CONTRACT_PROPS.Button),
    [hand]: HAND_PATTERN,
  }
  if (buttonSource) files[BUTTON] = buttonSource
  return files
}

test("the generated contract compiles cleanly against the real Button", () => {
  assert.deepEqual(typecheck(buttonContracts(), [generated, hand]), [])
})

test("deleting a variant fails the generated contract; the old hand-written pattern lets it through", () => {
  const src = fs.readFileSync(BUTTON, "utf8").replace('  | "destructive"\n  | "link"', '  | "destructive"')
  const files = buttonContracts(src)
  assert.match(typecheck(files, [generated]).join("\n"), /'false' does not satisfy the constraint 'true'/)
  assert.deepEqual(typecheck(files, [hand]), [], "the hand-written pattern only catches widening")
})

test("deleting a prop fails the generated contract; the old hand-written pattern lets it through", () => {
  const src = fs.readFileSync(BUTTON, "utf8").replace("  iconOnly?: boolean\n", "")
  const files = buttonContracts(src)
  assert.notDeepEqual(typecheck(files, [generated]), [])
  assert.deepEqual(typecheck(files, [hand]), [], "Pick<P, keyof A & keyof P> collapses when the prop is gone")
})

test("making an optional prop required fails the generated contract", () => {
  const src = fs.readFileSync(BUTTON, "utf8").replace("  iconOnly?: boolean\n", "  iconOnly: boolean\n")
  assert.notDeepEqual(typecheck(buttonContracts(src), [generated]), [])
})

// sub-parts, branches, exported types and contract-props.json (M3 session 4): each kind of assertion
// fails on a real regression, typechecked against an edited copy of the component source
const contractCheck = (name, edit) => {
  const f = JSON.parse(fs.readFileSync(path.join(REPO, `packages/registry/generated/${name}.facts.json`), "utf8"))
  const src = path.join(REPO, f.source)
  const files = {
    [path.join(GEN_DIR, "_assert.ts")]: ASSERT_SOURCE,
    [path.join(GEN_DIR, `${name}.contract.ts`)]: contractSource(f, [], CONTRACT_PROPS[name] ?? {}),
  }
  if (edit) {
    const before = fs.readFileSync(src, "utf8"), after = edit(before)
    assert.notEqual(after, before, `the edit did not apply to ${f.source}`)
    files[src] = after
  }
  return typecheck(files, [path.join(GEN_DIR, `${name}.contract.ts`)]).join("\n")
}

test("generated contracts for sub-parts, branches and exported types compile against the real code", () => {
  for (const name of ["Select", "DatePicker", "Stepper", "Input"]) assert.equal(contractCheck(name), "", name)
})

test("changing a sub-part prop's type fails (SelectItem value: string → number)", () => {
  assert.match(contractCheck("Select", (s) => s.replace("  value: string\n  disabled?: boolean\n}", "  value: number\n  disabled?: boolean\n}")), /does not satisfy the constraint 'true'/)
})

test("changing a discriminated branch fails (DatePicker range onValueChange)", () => {
  assert.match(contractCheck("DatePicker", (s) => s.replace("onValueChange?: (range: DatePickerRange) => void", "onValueChange?: (range: Date) => void")), /does not satisfy the constraint 'true'/)
})

test("adding a member to a closed exported object type fails (StepperStep)", () => {
  assert.match(contractCheck("Stepper", (s) => s.replace("  description?: React.ReactNode\n}", "  description?: React.ReactNode\n  hint?: string\n}")), /does not satisfy the constraint 'true'/)
})

test("adding a prop that contract-props.json marks absent fails (Stepper viewport)", () => {
  assert.match(contractCheck("Stepper", (s) => s.replace("  steps: StepperStep[]", "  steps: StepperStep[]\n  viewport?: string")), /does not satisfy the constraint 'true'/)
})

test("dropping an inherited prop that contract-props.json keeps fails (Input placeholder)", () => {
  assert.match(contractCheck("Input", (s) => s.replace('"size" | "prefix">', '"size" | "prefix" | "placeholder">')), /does not satisfy the constraint 'true'/)
})

test("contract-props.json naming a part the module does not export throws", () => {
  const f = JSON.parse(fs.readFileSync(path.join(REPO, "packages/registry/generated/Input.facts.json"), "utf8"))
  assert.throws(() => contractSource(f, [], { InputGhost: { absent: { x: "y" } } }), /names Input.InputGhost, which is not an exported part/)
})

test("a registry entry's protocolProps and handlers become existence assertions", () => {
  const text = contractSource(buttonFacts(), [{ type: "Button", protocolProps: { disabled: {} }, events: { click: { handler: "onClick" } } }])
  assert.match(text, /type Registry_Button_disabled = Assert<Has<P, "disabled">>/)
  assert.match(text, /type Registry_Button_onClick = Assert<Has<P, "onClick">>/)
  assert.match(text, /type Union_variant = Assert<Exact<NonNullable<P\["variant"\]>, "destructive" \| "ghost" \| "link" \| "outline" \| "primary" \| "secondary">>/)
})

// ─── protocol schemas and the component map ────────────────────────────────

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(REPO, rel), "utf8"))
const node = (rel) => new Ajv2020({ strict: true, allErrors: true }).compile(readJson(rel))

test("a generated protocol schema accepts a valid node and rejects unknown props, slots and enum values", () => {
  const v = node("packages/registry/generated/schemas/Button.schema.json")
  assert.ok(v({ type: "Button", props: { variant: "primary", disabled: true }, slots: { children: [] } }), JSON.stringify(v.errors))
  assert.ok(!v({ type: "Button", props: { variant: "tertiary" } }), "an enum value outside protocolProps")
  assert.ok(!v({ type: "Button", props: { asChild: true } }), "a hidden prop is not on the protocol surface")
  assert.ok(!v({ type: "Button", props: { style: "color: red" } }), "no raw styling through the protocol")
  assert.ok(!v({ type: "Button", slots: { footer: [] } }), "an undeclared slot")
  assert.ok(!v({ type: "TextField" }), "the type is fixed")
})

test("inherited protocolProps are typed from the code", () => {
  const props = readJson("packages/registry/generated/schemas/TextField.schema.json").properties.props.properties
  assert.deepEqual(props.name, { type: "string" })
  assert.deepEqual(props.value, { anyOf: [{ type: "string" }, { type: "number" }] }, "readonly string[] is dropped, not coerced")
  assert.deepEqual(props.disabled, { type: "boolean" })
})

test("a protocolProp no JSON message can carry fails the build instead of being skipped", () => {
  assert.throws(() => jsonTypeOf("ReactNode", "Button.icon"), /Button.icon is ReactNode, which a JSON protocol message cannot carry/)
  assert.throws(() => protocolSchema({ type: "X", protocolProps: { onClick: {} } }, { onClick: "MouseEventHandler<HTMLButtonElement>" }), /cannot carry/)
})

test("required protocolProps are required in the schema", () => {
  const schema = protocolSchema({ type: "X", protocolProps: { name: { required: true } } }, { name: "string" })
  assert.deepEqual(schema.properties.props.required, ["name"])
  const v = new Ajv2020({ strict: true }).compile(schema)
  assert.ok(!v({ type: "X", props: {} }))
})

test("componentMap maps aliases to their component and lists structural types", () => {
  const text = componentMapSource({
    TextField: { type: "TextField", aliasOf: "Input", kind: "component" },
    Button: { type: "Button", aliasOf: "Button", kind: "component" },
    Form: { type: "Form", aliasOf: null, kind: "structural" },
  }, { Input: { import: "@atlas/ui-web/primitives/Input/Input" }, Button: { import: "@atlas/ui-web/primitives/Button/Button" } })
  assert.match(text, /import \{ Input \} from "@atlas\/ui-web\/primitives\/Input\/Input"/)
  assert.match(text, /^  Button,$/m)
  assert.match(text, /^  TextField: Input,$/m)
  assert.match(text, /structuralTypes = \["Form"\]/)
})

// ─── the invariant ──────────────────────────────────────────────────────────

const facts = () => ({
  Widget: {
    props: [
      { name: "variant", type: "WidgetVariant", optional: true },
      { name: "icon", type: "React.ReactNode", optional: true },
      { name: "busy", type: "boolean", optional: true },
      { name: "asChild", type: "boolean", optional: true },
    ],
    inherited: { ButtonHTMLAttributes: ["disabled", "onClick"] },
    events: [{ name: "onClick", type: "MouseEventHandler<HTMLButtonElement>" }],
    unions: { variant: ["a", "b"] },
    codeConnect: { file: "x", instances: { badge: "Badge slot" }, stateProps: { loading: "busy" }, enums: {} },
    figma: { nodeId: "1:1", axes: { Variant: ["a", "b"], State: ["default", "loading"] } },
    tokensUsed: ["--atlas-widget-bg"],
  },
})
const entry = () => ({
  type: "Widget", aliasOf: "Widget", kind: "component", platforms: ["web"], registryComplete: false,
  protocolProps: { variant: { values: ["a", "b"] }, disabled: {}, busy: {} },
  hiddenProps: { asChild: "web only" },
  events: { click: { handler: "onClick" } },
  slots: ["icon"],
  states: { default: "interaction", loading: "prop" },
  stateProps: { loading: "busy" },
  tokenRoles: { background: "--atlas-widget-bg" },
})
const run = (mutate = () => {}) => {
  const s = {
    entries: { Widget: entry(), Form: { type: "Form", aliasOf: null, kind: "structural", platforms: ["web"], registryComplete: false, composedOf: ["Widget"] } },
    aliases: { Form: "structural" },
    facts: facts(),
    components: new Set(["Widget", "Dialog"]),
    cssTokens: new Set(["--atlas-widget-bg", "--atlas-other"]),
  }
  mutate(s, s.entries.Widget)
  return checkRegistry(s)
}

test("a consistent registry passes and reports what it inspected", () => {
  const r = run()
  assert.deepEqual(r.fail, [])
  assert.deepEqual(r.warn, [])
  assert.equal(r.inspected, 2)
  assert.ok(r.rules > 10)
})

const cases = [
  ["protocolProps names a prop the component lacks", (s, e) => { e.protocolProps.tone = {} }, /protocolProps "tone" is not a prop/],
  ["an enum member absent from the code union (roadmap negative test 6)", (s, e) => { e.protocolProps.variant.values.push("c") }, /value "c" is not in the code union a\|b/],
  ["a narrower enum without a reason", (s, e) => { e.protocolProps.variant.values = ["a"] }, /omits b from the code union; add "narrowed"/],
  ["a union prop with no declared values", (s, e) => { delete e.protocolProps.variant.values }, /is the union a\|b; declare its values/],
  ["values on a prop that is not a union", (s, e) => { e.protocolProps.disabled = { values: ["x"] } }, /is not a string-literal union/],
  ["an event whose handler does not exist", (s, e) => { e.events.hover = { handler: "onHover" } }, /handler onHover, which Widget does not have/],
  ["a slot that is neither a node prop nor a Code Connect instance", (s, e) => { e.slots.push("busy") }, /slot "busy" is neither/],
  ["a fallback that is not registered", (s, e) => { e.fallback = { type: "Card" } }, /fallback "Card" is not a registered type/],
  ["a tokenRole missing from the CSS", (s, e) => { e.tokenRoles.x = "--atlas-nope" }, /atlas.tokens.css does not declare/],
  ["a tokenRole the component does not use", (s, e) => { e.tokenRoles.x = "--atlas-other" }, /which Widget does not use/],
  ["a Figma State member left unclassified", (s, e) => { delete e.states.loading; delete e.stateProps.loading }, /Figma State "loading" is not classified/],
  ["a state that Figma does not draw", (s, e) => { e.states.pressed = "interaction" }, /states "pressed" is not a Figma State member/],
  ["states on a component with no Figma State axis", (s) => { delete s.facts.Widget.figma.axes.State; s.facts.Widget.codeConnect.stateProps = {} }, /has no State axis/],
  ["a prop-driven state with no stateProps", (s, e) => { delete e.stateProps.loading }, /"loading" is prop-driven but has no stateProps/],
  ["stateProps naming a missing prop", (s, e) => { e.stateProps.loading = "pending" }, /"pending", which is not a prop/],
  ["stateProps disagreeing with Code Connect", (s, e) => { e.stateProps.loading = "disabled" }, /Code Connect maps State "loading" to "busy"/],
  ["hiddenProps naming something that is not an own prop", (s, e) => { e.hiddenProps.disabled = "x" }, /hiddenProps "disabled" is not an own prop/],
  ["an alias target that is not a component", (s) => { s.aliases.Modal = "Popup" }, /"Modal" → "Popup", which is not a component/],
  ["an alias shadowing a component name", (s) => { s.aliases.Dialog = "Widget" }, /"Dialog" is already a component name/],
  ["an entry renamed without an alias", (s) => { s.entries.Gadget = { ...entry(), type: "Gadget" } }, /Gadget: renders Widget but aliases.json maps "Gadget" to null/],
  ["a structural type missing from aliases.json", (s) => { delete s.aliases.Form }, /Form: a structural type must be declared/],
  ["composedOf naming a non-component", (s) => { s.entries.Form.composedOf.push("Ghost") }, /composedOf "Ghost" is not a component/],
  ["aliasOf naming a non-component", (s, e) => { e.aliasOf = "Ghost" }, /aliasOf "Ghost" is not a component/],
  ["facts missing for the rendered component", (s) => { delete s.facts.Widget }, /no generated facts for Widget/],
  ["nesting naming an unregistered type", (s, e) => { e.nesting = { parents: ["Card"] } }, /nesting.parents "Card" is not a registered type/],
  ["a structural event with no element", (s) => { s.entries.Form.events = { submit: { handler: "onSubmit" } } }, /needs "element"/],
  ["a structural event the element does not have", (s) => { Object.assign(s.entries.Form, { element: "form", events: { tap: { handler: "onTap" } } }); s.elements = { form: { events: ["onSubmit"] } } }, /handler onTap, which <form> does not have/],
  ["a structural element with no generated element facts", (s) => { s.entries.Form.element = "form" }, /element <form> has no generated element facts/],
  ["element on a component entry", (s, e) => { e.element = "div" }, /"element" is for structural types/],
]
for (const [name, mutate, re] of cases)
  test(`FAIL: ${name}`, () => assert.match(run(mutate).fail.join("\n"), re))

test("an unaccounted own prop WARNs, and FAILs once registryComplete is true", () => {
  const warned = run((s, e) => { delete e.hiddenProps.asChild })
  assert.deepEqual(warned.fail, [])
  assert.match(warned.warn.join("\n"), /own props not in protocolProps, slots, events or hiddenProps: asChild/)
  const failed = run((s, e) => { delete e.hiddenProps.asChild; e.registryComplete = true })
  assert.match(failed.fail.join("\n"), /asChild/)
})

test("a structural event backed by its element's handlers passes", () => {
  assert.deepEqual(run((s) => { Object.assign(s.entries.Form, { element: "form", events: { submit: { handler: "onSubmit" } } }); s.elements = { form: { events: ["onSubmit"] } } }).fail, [])
})

test("element facts resolve through React's JSX types and reject a non-element", () => {
  const opts = compilerOptions(REPO)
  const file = path.join(REPO, "packages/registry/__elements_test__.tsx")
  const build = (els) => {
    const host = ts.createCompilerHost(opts)
    const src = elementsSource(els)
    const { getSourceFile, fileExists } = host
    host.getSourceFile = (f, ...a) => (path.resolve(f) === file ? ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX) : getSourceFile.call(host, f, ...a))
    host.fileExists = (f) => path.resolve(f) === file || fileExists.call(host, f)
    return ts.createProgram([file], opts, host)
  }
  const ok = extractElementEvents(build(["form"]), file)
  assert.ok(ok.form.events.includes("onSubmit"))
  assert.ok(ok.form.events.includes("onReset"))
  assert.throws(() => extractElementEvents(build(["notanelement"]), file), /resolved to no handler props/)
})

test("an authored enum narrower than the code union passes with a reason", () => {
  assert.deepEqual(run((s, e) => { e.protocolProps.variant = { values: ["a"], narrowed: "b is internal" } }).fail, [])
})

// ─── the CLI, on a copy of the repo ─────────────────────────────────────────

const COPY = ["scripts", "atlas", "packages/registry", "packages/governance", "packages/ui-web/src", "packages/figma-sync/code-connect", "packages/tokens", "tsconfig.json", "tsconfig.base.json"]
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "registry-"))
  for (const rel of COPY) fs.cpSync(path.join(REPO, rel), path.join(dir, rel), { recursive: true })
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(dir, "node_modules"))
  return dir
}
const cli = (dir, ...args) => {
  try { return { code: 0, out: execFileSync("node", [path.join(dir, "scripts/registry-build.mjs"), ...args], { encoding: "utf8", stdio: "pipe" }) } }
  catch (e) { return { code: e.status, out: `${e.stdout}${e.stderr}` } }
}
const editJson = (file, fn) => { const d = JSON.parse(fs.readFileSync(file, "utf8")); fn(d); fs.writeFileSync(file, JSON.stringify(d, null, 2)) }

test("--check passes on the committed repo", () => {
  const r = cli(REPO, "--check")
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /PASS \(\d+ entries, 48 facts, 48 contracts, \d+ schemas, \d+ rules checked/)
})

test("--check fails on stale facts, and a build fixes them", () => {
  const dir = fixture()
  fs.appendFileSync(path.join(dir, "packages/registry/generated/Button.facts.json"), " ")
  const stale = cli(dir, "--check")
  assert.equal(stale.code, 1)
  assert.match(stale.out, /Button.facts.json is stale or missing/)
  assert.equal(cli(dir).code, 0)
  assert.equal(cli(dir, "--check").code, 0)
})

test("--check fails on an orphaned facts file", () => {
  const dir = fixture()
  fs.copyFileSync(path.join(dir, "packages/registry/generated/Alert.facts.json"), path.join(dir, "packages/registry/generated/Ghost.facts.json"))
  editJson(path.join(dir, "packages/registry/generated/Ghost.facts.json"), (d) => { d.name = "Ghost" })
  assert.match(cli(dir, "--check").out, /Ghost.facts.json belongs to no component or registry entry/)
})

test("--check fails on a missing generated contract — all 47 must have one", () => {
  const dir = fixture()
  fs.rmSync(path.join(dir, "packages/governance/contracts/ListItem.contract.ts"))
  const r = cli(dir, "--check")
  assert.equal(r.code, 1)
  assert.match(r.out, /ListItem.contract.ts is stale or missing/)
})

test("--check fails on an orphaned protocol schema, and on a stale componentMap", () => {
  const dir = fixture()
  fs.copyFileSync(path.join(dir, "packages/registry/generated/schemas/Alert.schema.json"), path.join(dir, "packages/registry/generated/schemas/Ghost.schema.json"))
  fs.appendFileSync(path.join(dir, "packages/registry/generated/componentMap.ts"), "\n")
  const out = cli(dir, "--check").out
  assert.match(out, /schemas\/Ghost.schema.json belongs to no component or registry entry/)
  assert.match(out, /componentMap.ts is stale or missing/)
})

test("a hand-edited generated contract is stale", () => {
  const dir = fixture()
  const f = path.join(dir, "packages/governance/contracts/Button.contract.ts")
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/^type Union_variant.*$/m, ""))
  assert.match(cli(dir, "--check").out, /Button.contract.ts is stale or missing/)
})

test("roadmap negative test 6: an authored enum member absent from the code union FAILs the build check", () => {
  const dir = fixture()
  editJson(path.join(dir, "packages/registry/src/Button.registry.json"), (d) => { d.protocolProps.variant.values.push("tertiary") })
  const r = cli(dir, "--check")
  assert.equal(r.code, 1)
  assert.match(r.out, /Button: protocolProps "variant" value "tertiary" is not in the code union/)
})

test("a schema-invalid entry stops the build before any fact is read", () => {
  const dir = fixture()
  editJson(path.join(dir, "packages/registry/src/Form.registry.json"), (d) => { d.aliasOf = "Field" })
  const r = cli(dir, "--check")
  assert.equal(r.code, 1)
  assert.match(r.out, /Form.registry.json: \/aliasOf must be null/)
})

test("zero entries is a failure, not a clean run", () => {
  const dir = fixture()
  fs.rmSync(path.join(dir, "packages/registry/src"), { recursive: true })
  fs.mkdirSync(path.join(dir, "packages/registry/src"))
  const r = cli(dir, "--check")
  assert.equal(r.code, 1)
  assert.match(r.out, /src\/\*\.registry\.json matched 0 file/)
})

test("runtimeRegistry bundles every entry with its schema, sorted, the alias table and the component names", () => {
  const text = runtimeRegistrySource({ TextField: {}, Alert: {}, Form: {} }, ["Input", "Alert", "Dialog"])
  assert.match(text, /^\/\/ GENERATED — do not hand-edit\./)
  assert.ok(text.indexOf('import AlertEntry from "../src/Alert.registry.json"') < text.indexOf("import FormEntry"))
  assert.match(text, /import TextFieldSchema from "\.\/schemas\/TextField\.schema\.json"/)
  assert.match(text, /export const entries = \{\n  Alert: AlertEntry,\n  Form: FormEntry,\n  TextField: TextFieldEntry,\n\}/)
  assert.match(text, /export const aliasTable: Record<string, string> = aliases\.aliases/)
  assert.match(text, /export const components: string\[\] = \["Alert","Dialog","Input"\]/)
})
