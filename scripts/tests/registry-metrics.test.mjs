// registry-metrics: the three M3 metric checks (design/registry-events, -fallback, -states), shared by
// atlas-verify and metrics-report. One PASS case, then one FAIL case per rule, on a small fixture.
import { test } from "node:test"
import assert from "node:assert/strict"
import { registryMetrics, coverageText } from "../lib/registry-metrics.mjs"

const FB = { type: "Notice", props: { tone: "plain" }, message: "This content is unavailable" }
const state = () => ({
  entries: {
    Widget: {
      type: "Widget", aliasOf: "Widget", kind: "component",
      events: { press: { handler: "onClick" } },
      states: { default: "interaction", hover: "interaction", disabled: "prop" },
      stateProps: { disabled: "disabled" },
      capabilities: ["press"], fallback: FB,
    },
    Notice: { type: "Notice", aliasOf: "Notice", kind: "component", protocolProps: { tone: { values: ["plain", "loud"] } }, events: {}, capabilities: [], fallback: { type: "Notice" } },
    Shape: { type: "Shape", aliasOf: null, kind: "structural", element: "form", events: { submit: { handler: "onSubmit" } }, capabilities: ["submit"], fallback: FB },
  },
  facts: {
    Widget: { props: [{ name: "variant" }], inherited: { ButtonHTMLAttributes: ["disabled", "onClick"] }, events: [{ name: "onClick" }], figma: { axes: { State: ["default", "hover", "disabled"] } } },
    Notice: { props: [{ name: "tone" }], inherited: {}, events: [], figma: { axes: {} } },
  },
  elements: { form: { events: ["onReset", "onSubmit"] } },
  components: ["Widget", "Notice", "Other"],
})
const run = (mutate = () => {}) => { const s = state(); mutate(s); return registryMetrics(s) }
const text = (r) => r.fails.join("\n")

test("PASS: a consistent registry, with counts and coverage", () => {
  const r = run()
  for (const k of ["events", "fallback", "states"]) assert.deepEqual(r[k].fails, [], k)
  assert.deepEqual([r.events.scope, r.events.inspected], [2, 2], "Widget and Shape are interactive; Notice is not")
  assert.deepEqual([r.fallback.scope, r.fallback.inspected], [3, 3])
  assert.deepEqual([r.states.scope, r.states.inspected], [1, 1], "only a rendered interactive component has Figma states")
  assert.equal(coverageText(r.fallback), "0 failing of 3 registered types (2/3 components registered)")
})

test("interactive is decided from facts, so an entry cannot opt out by omission", () => {
  const r = run((s) => { delete s.entries.Widget.capabilities; delete s.entries.Widget.events })
  assert.match(text(r.events), /Widget: interactive, but declares no events/)
  const own = run((s) => { s.facts.Notice.props.push({ name: "onClose" }) })
  assert.match(text(own.events), /Notice: interactive, but declares no events/)
})

test("a display-only capability is not interactive, but a handler prop or another capability still is", () => {
  const display = run((s) => { s.entries.Notice.capabilities = ["display"] })
  assert.deepEqual([display.events.scope, display.events.inspected], [2, 2], "Notice with display only stays out")
  assert.deepEqual(display.events.fails, [])
  const handler = run((s) => { s.entries.Notice.capabilities = ["display"]; s.facts.Notice.props.push({ name: "onClose" }) })
  assert.match(text(handler.events), /Notice: interactive, but declares no events/)
  const mixed = run((s) => { s.entries.Notice.capabilities = ["display", "dismiss"] })
  assert.match(text(mixed.events), /Notice: interactive, but declares no events/)
})

test("FAIL events: a handler the component does not have", () => {
  assert.match(text(run((s) => { s.entries.Widget.events.press.handler = "onPress" }).events), /event "press" → onPress, which Widget does not have/)
})

test("FAIL events: a structural handler its element does not have, or no element facts", () => {
  assert.match(text(run((s) => { s.entries.Shape.events.submit.handler = "onSend" }).events), /onSend, which <form> does not have/)
  assert.match(text(run((s) => { s.elements = {} }).events), /Shape: structural with no generated element facts/)
})

test("FAIL events and states: missing facts fail closed", () => {
  const r = run((s) => { delete s.facts.Widget })
  assert.match(text(r.events), /Widget: no generated facts/)
  assert.match(text(r.states), /Widget: no generated facts/)
})

test("FAIL fallback: absent", () => {
  assert.match(text(run((s) => { delete s.entries.Widget.fallback }).fallback), /Widget: declares no fallback/)
})

test("FAIL fallback: a second terminal", () => {
  assert.match(text(run((s) => { s.entries.Widget.fallback = { type: "Widget" } }).fallback), /more than one terminal fallback .*Notice, Widget|more than one terminal fallback .*Widget, Notice/)
})

test("FAIL fallback: a chain that loops or leaves the registry", () => {
  const loop = run((s) => { s.entries.Notice.fallback = { type: "Widget" } })
  assert.match(text(loop.fallback), /fallback chain loops \(Widget → Notice → Widget\)/)
  assert.match(text(run((s) => { s.entries.Widget.fallback = { type: "Card" } }).fallback), /chain reaches "Card", which is not a registered type/)
})

test("FAIL fallback: props that are not the target's protocolProps or values", () => {
  assert.match(text(run((s) => { s.entries.Widget.fallback = { type: "Notice", props: { size: "lg" } } }).fallback), /fallback prop "size" is not a protocolProp of Notice/)
  assert.match(text(run((s) => { s.entries.Widget.fallback = { type: "Notice", props: { tone: "shout" } } }).fallback), /fallback tone="shout" is not one of Notice's values/)
})

test("FAIL states: an unclassified Figma state, an undrawn one, and a prop state with no prop", () => {
  assert.match(text(run((s) => { delete s.entries.Widget.states.hover }).states), /Figma draws State "hover" and the entry does not classify it/)
  assert.match(text(run((s) => { s.entries.Widget.states.pressed = "interaction" }).states), /classifies State "pressed", which Figma Widget does not draw/)
  assert.match(text(run((s) => { s.entries.Widget.stateProps.disabled = "inert" }).states), /State "disabled" is prop-driven but stateProps names no prop/)
})
