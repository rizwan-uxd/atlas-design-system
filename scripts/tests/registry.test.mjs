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
import { ASSERT_SOURCE, checkRegistry, codeConnectFacts, compilerOptions, contractSource, extractFacts, formatJson } from "../lib/registry.mjs"

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

const GEN_DIR = path.join(REPO, "packages/governance/contracts/generated")
const buttonFacts = () => JSON.parse(fs.readFileSync(path.join(REPO, "packages/registry/generated/Button.facts.json"), "utf8"))
const buttonContracts = (buttonSource) => {
  const files = {
    [path.join(GEN_DIR, "_assert.ts")]: ASSERT_SOURCE,
    [path.join(GEN_DIR, "Button.contract.ts")]: contractSource(buttonFacts(), []),
    [path.join(REPO, "packages/governance/contracts/Button.contract.ts")]: fs.readFileSync(path.join(REPO, "packages/governance/contracts/Button.contract.ts"), "utf8"),
  }
  if (buttonSource) files[BUTTON] = buttonSource
  return files
}
const hand = path.join(REPO, "packages/governance/contracts/Button.contract.ts")
const generated = path.join(GEN_DIR, "Button.contract.ts")

test("the generated contract compiles cleanly against the real Button", () => {
  assert.deepEqual(typecheck(buttonContracts(), [generated, hand]), [])
})

test("deleting a variant fails the generated contract; the hand-written one lets it through", () => {
  const src = fs.readFileSync(BUTTON, "utf8").replace('  | "destructive"\n  | "link"', '  | "destructive"')
  const files = buttonContracts(src)
  assert.match(typecheck(files, [generated]).join("\n"), /'false' does not satisfy the constraint 'true'/)
  assert.deepEqual(typecheck(files, [hand]), [], "the hand-written Button contract only catches widening")
})

test("deleting a prop fails the generated contract; the hand-written one lets it through", () => {
  const src = fs.readFileSync(BUTTON, "utf8").replace("  iconOnly?: boolean\n", "")
  const files = buttonContracts(src)
  assert.notDeepEqual(typecheck(files, [generated]), [])
  assert.deepEqual(typecheck(files, [hand]), [], "Pick<P, keyof A & keyof P> collapses when the prop is gone")
})

test("making an optional prop required fails the generated contract", () => {
  const src = fs.readFileSync(BUTTON, "utf8").replace("  iconOnly?: boolean\n", "  iconOnly: boolean\n")
  assert.notDeepEqual(typecheck(buttonContracts(src), [generated]), [])
})

test("a registry entry's protocolProps and handlers become existence assertions", () => {
  const text = contractSource(buttonFacts(), [{ type: "Button", protocolProps: { disabled: {} }, events: { click: { handler: "onClick" } } }])
  assert.match(text, /type Registry_Button_disabled = Assert<Has<P, "disabled">>/)
  assert.match(text, /type Registry_Button_onClick = Assert<Has<P, "onClick">>/)
  assert.match(text, /type Union_variant = Assert<Exact<NonNullable<P\["variant"\]>, "destructive" \| "ghost" \| "link" \| "outline" \| "primary" \| "secondary">>/)
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
  assert.match(r.out, /PASS \(\d+ entries, 47 facts, 47 contracts, \d+ rules checked/)
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
  assert.match(cli(dir, "--check").out, /Ghost.facts.json belongs to no component in atlas\/metadata/)
})

test("--check fails on a missing generated contract — all 47 must have one", () => {
  const dir = fixture()
  fs.rmSync(path.join(dir, "packages/governance/contracts/generated/ListItem.contract.ts"))
  const r = cli(dir, "--check")
  assert.equal(r.code, 1)
  assert.match(r.out, /ListItem.contract.ts is stale or missing/)
})

test("a hand-edited generated contract is stale", () => {
  const dir = fixture()
  const f = path.join(dir, "packages/governance/contracts/generated/Button.contract.ts")
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
