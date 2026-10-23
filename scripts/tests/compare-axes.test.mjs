/**
 * compare-axes tests (M1; the registry leg, M3 session 4).
 *
 * Two properties matter more than any individual comparison, and most of these cases exist to pin
 * them down:
 *
 *   1. It FAILS CLOSED. An unclassified axis, a missing mapping or an absent value list produces a
 *      FINDING, never an empty finding list, and inspection counts keep "nothing wrong" apart from
 *      "nothing inspected". Malformed Figma data is rejected earlier, by the metadata schema (M2).
 *   2. Member ORDER is not drift, but member SETS are.
 *
 * The Code Connect parser is tested against the real shapes in the repo — enums fanned out across
 * sub-components, quoted numeric keys, and JSX-valued entries whose angle brackets and braces would
 * wreck a naive scan.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { compareAxes, codeConnectEnums } from "../lib/compare-axes.mjs"

const MAP = {
  axes: {
    Variant: { disposition: "code-union", metadataField: "variants" },
    Size: { disposition: "code-union", metadataField: "sizes" },
    Tone: { disposition: "code-connect" },
    State: { disposition: "state" },
    Viewport: { disposition: "unmapped", reason: "Figma-only presentation axis" },
    "Icon only": { disposition: "boolean" },
    Placeholder: { disposition: "code-connect" },
  },
}

const component = (over = {}) => ({
  name: "Widget", variants: ["primary"], sizes: ["md"],
  figmaProperties: { Variant: ["primary"] }, ...over,
})

const run = (components, cc = new Map(), axisMap = MAP) =>
  compareAxes({ components, codeConnect: cc, axisMap })

const details = (r) => r.findings.map((f) => f.detail).join("\n")

/* ── fail closed ────────────────────────────────────────── */

// The figmaProperties shape cases (absent, null, empty, malformed) moved to schemas.test.mjs with the
// guard they tested; a malformed component not suppressing a healthy one is in atlas-verify.test.mjs.

test("a metadata entry with no name throws rather than being silently skipped", () => {
  assert.throws(() => run([component({ name: "" })]), /no name/)
})

test("an absent metadata value list is a finding, not an empty comparison", () => {
  const r = run([component({ variants: undefined })])
  assert.match(details(r), /metadata\.variants is absent/)
})

/* ── set comparison, both directions ───────────────────── */

test("a member Figma has and code lacks fails on the code side", () => {
  const r = run([component({ figmaProperties: { Variant: ["primary", "tertiary"] } })])
  assert.equal(r.findings.length, 1)
  assert.equal(r.findings[0].side, "code")
  assert.match(r.findings[0].detail, /has "tertiary" and the code union does not/)
})

test("a member code has and Figma lacks also fails on the code side, pointing at Figma first", () => {
  const r = run([component({ variants: ["primary", "tertiary"] })])
  assert.equal(r.findings.length, 1)
  assert.equal(r.findings[0].side, "code")
  assert.match(r.findings[0].detail, /add it in Figma first/)
})

test("member order is not drift", () => {
  const r = run([component({ variants: ["b", "a"], figmaProperties: { Variant: ["a", "b"] } })])
  assert.equal(r.findings.length, 0)
})

test("duplicate members are not drift", () => {
  const r = run([component({ variants: ["a", "a"], figmaProperties: { Variant: ["a"] } })])
  assert.equal(r.findings.length, 0)
})

/* ── axis map totality ─────────────────────────────────── */

test("an unclassified axis fails — a new Figma axis cannot slip in", () => {
  const r = run([component({ figmaProperties: { Variant: ["primary"], Flavour: ["sweet"] } })])
  assert.equal(r.unclassifiedAxes.length, 1)
  assert.match(details(r), /axis "Flavour" is not classified/)
})

test("state axes are deferred, not compared", () => {
  const r = run([component({ figmaProperties: { State: ["default", "hover", "disabled"] } })])
  assert.equal(r.findings.length, 0)
  assert.deepEqual(r.deferredAxes, ["Widget.State"])
})

test("unmapped axes are reported, never silently dropped", () => {
  const r = run([component({ figmaProperties: { Viewport: ["mobile"] } })])
  assert.equal(r.findings.length, 0)
  assert.deepEqual(r.unmappedAxes, ["Widget.Viewport"])
})

test("a per-component override beats the axis-level rule", () => {
  const axisMap = { axes: { Tone: { disposition: "code-connect", components: { Widget: { disposition: "unmapped", reason: "no tone prop" } } } } }
  const r = compareAxes({ components: [component({ figmaProperties: { Tone: ["soft"] } })], codeConnect: new Map(), axisMap })
  assert.equal(r.findings.length, 0)
  assert.deepEqual(r.unmappedAxes, ["Widget.Tone"])
})

test("a code-union axis with no metadataField throws rather than comparing nothing", () => {
  const axisMap = { axes: { Variant: { disposition: "code-union" } } }
  assert.throws(() => compareAxes({ components: [component()], codeConnect: new Map(), axisMap }), /names no metadataField/)
})

test("a missing axisMap throws", () => {
  assert.throws(() => compareAxes({ components: [], codeConnect: new Map(), axisMap: null }), /axisMap is required/)
  assert.throws(() => compareAxes({ components: [], codeConnect: new Map(), axisMap: {} }), /axisMap\.axes is missing/)
})

/* ── Code Connect ──────────────────────────────────────── */

const cc = (body) => new Map([["Widget", body]])

test("a code-connect axis compares against figma.enum keys, both directions", () => {
  const src = `figma.connect(W, "u", { props: { tone: figma.enum("Tone", { soft: "soft" }) } })`
  const r = run([component({ figmaProperties: { Tone: ["soft", "loud"] } })], cc(src))
  assert.match(details(r), /has "loud" and Code Connect figma\.enum\("Tone"\) does not map it/)

  const r2 = run([component({ figmaProperties: { Tone: ["soft"] } })],
    cc(`figma.enum("Tone", { soft: "soft", loud: "loud" })`))
  assert.match(details(r2), /maps Tone="loud" and Figma .* has no such member/)
})

test("a code-connect axis with no mapping at all is a finding", () => {
  const r = run([component({ figmaProperties: { Tone: ["soft"] } })], cc(`figma.connect(W, "u", {})`))
  assert.match(details(r), /has no figma\.enum\("Tone", …\)/)
})

test("a missing Code Connect file is a finding, not a skip", () => {
  const r = run([component({ figmaProperties: { Tone: ["soft"] } })], new Map())
  assert.match(details(r), /no packages\/figma-sync\/code-connect\/Widget\.figma\.tsx/)
})

test("a true|false axis may be mapped with figma.boolean instead of an enum", () => {
  const src = `figma.boolean("Placeholder", { true: false, false: true })`
  const r = run([component({ figmaProperties: { Placeholder: ["true", "false"] } })], cc(src))
  assert.equal(r.findings.length, 0, "Select maps this axis as an enum and DatePicker as a boolean; both are correct")
})

test("figma.boolean does not excuse a non-boolean axis", () => {
  const r = run([component({ figmaProperties: { Tone: ["soft", "loud", "flat"] } })], cc(`figma.boolean("Tone")`))
  assert.match(details(r), /has no figma\.enum\("Tone", …\)/)
})

test("a boolean-disposition axis requires its figma.boolean mapping", () => {
  const ok = run([component({ figmaProperties: { "Icon only": ["true", "false"] } })], cc(`figma.boolean("Icon only")`))
  assert.equal(ok.findings.length, 0)
  const bad = run([component({ figmaProperties: { "Icon only": ["true", "false"] } })], cc(`figma.connect(W, "u", {})`))
  assert.match(details(bad), /no figma\.boolean\("Icon only"\) mapping/)
})

/* ── the Code Connect parser, against real shapes ──────── */

test("keys are unioned when one axis is mapped more than once", () => {
  // Button fans Figma's single State axis into two independent React props
  const keys = codeConnectEnums(`
    loading:  figma.enum("State", { loading: true }),
    disabled: figma.enum("State", { disabled: true }),
  `).get("State")
  assert.deepEqual(keys, ["loading", "disabled"])
})

test("quoted numeric keys survive", () => {
  assert.deepEqual(codeConnectEnums(`figma.enum("Steps", { "3": A, "4": B, "5": C })`).get("Steps"), ["3", "4", "5"])
})

test("JSX-valued entries do not confuse the scan", () => {
  const keys = codeConnectEnums(`
    content: figma.enum("Slot", {
      true:  <DrawerBody>Content placeholder</DrawerBody>,
      false: undefined,
    }),
  `).get("Slot")
  assert.deepEqual(keys, ["true", "false"])
})

test("nested objects and calls in values do not leak keys", () => {
  const keys = codeConnectEnums(`figma.enum("A", { x: figma.instance("Slot"), y: { nested: 1 }, z: f({ q: 2 }) })`).get("A")
  assert.deepEqual(keys, ["x", "y", "z"])
})

test("a brace or colon inside a string value is not structure", () => {
  const keys = codeConnectEnums(`figma.enum("A", { x: "a{b}c:d", y: 'e,f' })`).get("A")
  assert.deepEqual(keys, ["x", "y"])
})

test("two different axes in one file stay separate", () => {
  const e = codeConnectEnums(`figma.enum("A", { a: 1 }) figma.enum("B", { b: 2 })`)
  assert.deepEqual(e.get("A"), ["a"])
  assert.deepEqual(e.get("B"), ["b"])
})

test("a file with no enums yields an empty map rather than throwing", () => {
  assert.equal(codeConnectEnums("const x = 1").size, 0)
})

/* ── inspection counting ───────────────────────────────── */

test("inspection counts are reported so a vacuous pass is visible", () => {
  const r = run([component(), component({ name: "Other" })], cc(""))
  assert.equal(r.inspected.components, 2)
  assert.equal(r.inspected.total, 2)
  assert.ok(r.inspected.axes >= 1)
})

test("an empty component list reports zero inspected", () => {
  const r = run([])
  assert.deepEqual(r.inspected, { components: 0, axes: 0, total: 0 })
  assert.equal(r.findings.length, 0, "the caller turns 0 inspected into a FAIL; the comparator just reports")
})

test("with no registry passed the comparison is two-way and reports registry: null", () => {
  assert.equal(run([component()]).registry, null)
})

/* ── the registry leg (M3): every disagreement fails on the registry side ── */

const widget = component({ variants: ["primary", "ghost"], figmaProperties: { Variant: ["primary", "ghost"], State: ["default", "hover", "disabled"] } })
const facts = (over = {}) => ({
  Widget: { unions: { variant: ["ghost", "primary"] }, codeConnect: { file: "Widget.figma.tsx", enums: { variant: "Variant" }, figmaContent: ["children", "icon"] }, ...over },
})
const entry = (over = {}) => ({
  type: "Widget", aliasOf: "Widget", kind: "component",
  protocolProps: { variant: { values: ["primary", "ghost"] } },
  states: { default: "interaction", hover: "interaction", disabled: "prop" },
  slots: ["children", "icon"], ...over,
})
const withRegistry = (e, f = facts(), components = [widget]) =>
  compareAxes({ components, codeConnect: cc('figma.enum("Variant", { primary: "primary", ghost: "ghost" })'), axisMap: MAP, registry: { entries: { [e.type]: e }, facts: f } })
const registryFindings = (r) => r.findings.filter((x) => x.side === "registry")

test("PASS: a registry entry that agrees with Figma and code", () => {
  const r = withRegistry(entry())
  assert.deepEqual(registryFindings(r), [])
  assert.deepEqual(r.registry, { entries: 1, axes: 2, states: 1, enums: 1, slots: 2 })
  assert.deepEqual(r.deferredAxes, [], "a registered component's State is compared, not deferred")
})

test("a registry enum member Figma does not have fails on the registry side", () => {
  const r = withRegistry(entry({ protocolProps: { variant: { values: ["primary", "ghost", "sparkly"] } } }), facts({ unions: { variant: ["ghost", "primary", "sparkly"] } }))
  assert.match(registryFindings(r).map((x) => x.detail).join("\n"), /registry variant="sparkly" and Figma Widget\/Variant has no such member/)
})

test("a registry enum narrower than Figma fails unless it declares narrowed", () => {
  const narrow = entry({ protocolProps: { variant: { values: ["primary"] } } })
  assert.match(registryFindings(withRegistry(narrow)).map((x) => x.detail).join("\n"), /has "ghost" and registry variant does not/)
  assert.deepEqual(registryFindings(withRegistry(entry({ protocolProps: { variant: { values: ["primary"], narrowed: "agent surface" } } }))), [])
})

test("a registry enum member absent from the code union fails on the registry side", () => {
  const r = withRegistry(entry(), facts({ unions: { variant: ["primary"] } }))
  assert.match(registryFindings(r).map((x) => x.detail).join("\n"), /registry variant="ghost" is not in the code union/)
})

test("an unclassified Figma State member fails on the registry side", () => {
  const r = withRegistry(entry({ states: { default: "interaction", hover: "interaction" } }))
  const f = registryFindings(r)
  assert.equal(f.length, 1)
  assert.equal(f[0].axis, "State")
  assert.match(f[0].detail, /Figma State "disabled" is not classified/)
})

test("a registry slot with no Figma counterpart fails on the registry side and names the type", () => {
  const r = withRegistry(entry({ slots: ["children", "icon", "footer"] }))
  assert.match(registryFindings(r).map((x) => x.detail).join("\n"), /^Widget: slot "footer" has no Figma counterpart/m)
})

test("the registry leg fails closed on an entry whose facts or metadata are missing", () => {
  assert.match(registryFindings(withRegistry(entry(), {})).map((x) => x.detail).join("\n"), /no generated facts for Widget/)
  assert.match(registryFindings(withRegistry(entry(), facts(), [])).map((x) => x.detail).join("\n"), /no valid atlas\/metadata entry/)
  assert.throws(() => compareAxes({ components: [], codeConnect: new Map(), axisMap: MAP, registry: {} }), /registry needs entries and facts/)
})

test("structural entries have no Figma side and are not compared", () => {
  const r = withRegistry({ type: "Form", aliasOf: null, kind: "structural", composedOf: ["Widget"] })
  assert.deepEqual(registryFindings(r), [])
  assert.equal(r.registry.entries, 0)
})
