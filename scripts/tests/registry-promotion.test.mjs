// registry-promotion: registryRegistered, registryProductionReady and the promotion gate (DEC-097).
import { test } from "node:test"
import assert from "node:assert/strict"
import { M3_TYPES, productionReadyMetric, promotionCheck, registeredMetric } from "../lib/registry-promotion.mjs"

const entry = (type, extra = {}) => ({ type, aliasOf: type, kind: "component", registryComplete: true, ...extra })
const state = () => ({
  entries: {
    Button: entry("Button"),
    Alert: entry("Alert", { provisional: { waitingOn: ["Alert"], reason: "scaffolded" } }),
    Form: { type: "Form", aliasOf: null, kind: "structural", registryComplete: true, nesting: { children: ["Alert", "Button"] }, provisional: { waitingOn: ["Alert"], reason: "composes Alert" } },
  },
  evidence: {
    status: { Button: "spec-complete", Alert: "scaffolded" },
    contracts: new Set(["Button", "Alert"]),
    tests: { Button: { axe: true }, Alert: { axe: true } },
    sandbox: new Set(["Button", "Alert"]),
  },
})
const run = (mutate = () => {}) => { const s = state(); mutate(s); return s }

test("registryRegistered: 6/6 passes, a missing or incomplete M3 type fails", () => {
  const all = Object.fromEntries(M3_TYPES.map((t) => [t, entry(t)]))
  assert.deepEqual(registeredMetric({ entries: all }), { fails: [], registered: 6, total: 6 })
  const { Text, ...five } = all
  assert.match(registeredMetric({ entries: five }).fails.join(), /Text: no entry/)
  assert.match(registeredMetric({ entries: { ...all, Text: entry("Text", { registryComplete: false }) } }).fails.join(), /Text: entry exists but registryComplete/)
})

test("a provisional entry is registered but not production-ready", () => {
  const s = state()
  const r = productionReadyMetric(s)
  assert.equal(r.ready, 1, "only Button")
  assert.equal(r.total, 3)
  assert.match(r.fails.join("\n"), /Alert: provisional, waiting on Alert; Alert is scaffolded/)
  assert.match(r.fails.join("\n"), /Form: provisional, waiting on Alert; Form is structural/)
})

test("production-ready needs a spec-complete component, a contract, a test and axe", () => {
  for (const [what, mutate, re] of [
    ["spec-complete", (s) => { s.evidence.status.Button = "scaffolded" }, /Button is scaffolded, not spec-complete/],
    ["contract", (s) => { s.evidence.contracts.delete("Button") }, /Button has no generated contract/],
    ["test", (s) => { delete s.evidence.tests.Button }, /Button has no test file/],
    ["axe", (s) => { s.evidence.tests.Button.axe = false }, /Button has no accessibility \(axe\) coverage/],
  ]) assert.match(productionReadyMetric(run(mutate)).fails.join("\n"), re, what)
})

test("promotion passes on the committed shape: Button stable with full evidence, the rest provisional", () => {
  assert.deepEqual(promotionCheck(state()).fails, [])
})

test("promotion: dropping provisional from a scaffolded entry is blocked", () => {
  const r = promotionCheck(run((s) => { delete s.entries.Alert.provisional }))
  assert.match(r.fails.join("\n"), /Alert: cannot be stable — Alert is scaffolded, not spec-complete/)
})

test("promotion: a stable entry needs contract, tests, accessibility and visual coverage", () => {
  for (const [what, mutate, re] of [
    ["contract", (s) => { s.evidence.contracts.delete("Button") }, /Button: cannot be stable — Button has no generated contract/],
    ["tests", (s) => { delete s.evidence.tests.Button }, /Button: cannot be stable — Button has no packages\/ui-web\/tests\/Button\.test\.tsx/],
    ["accessibility", (s) => { s.evidence.tests.Button.axe = false }, /Button: cannot be stable — Button's tests do not run axe/],
    ["visual", (s) => { s.evidence.sandbox.delete("Button") }, /Button: cannot be stable — Button is not rendered in the sandbox/],
  ]) assert.match(promotionCheck(run(mutate)).fails.join("\n"), re, what)
})

test("promotion: a recorded gap is allowed, and goes stale once closed", () => {
  const gap = (s) => { s.evidence.sandbox.delete("Button") }
  const allow = [{ type: "Button", gap: "visual", reason: "not in the sandbox yet" }]
  assert.deepEqual(promotionCheck({ ...run(gap), allow }).fails, [])
  assert.match(promotionCheck({ ...state(), allow }).fails.join("\n"), /Button: the allowed visual gap is closed .* STALE/)
})

test("promotion: a structural entry cannot be stable", () => {
  assert.match(promotionCheck(run((s) => { delete s.entries.Form.provisional })).fails.join("\n"), /Form: a structural entry cannot be stable/)
})

test("promotion: an empty waitingOn is allowed for a structural entry only", () => {
  assert.equal(promotionCheck(run((s) => { s.entries.Form.provisional.waitingOn = [] })).fails.filter((f) => f.startsWith("Form:")).length, 0)
  assert.match(promotionCheck(run((s) => { s.entries.Alert.provisional.waitingOn = [] })).fails.join("\n"), /Alert: provisional with nothing to wait on/)
})

test("promotion: waitingOn must be real and still unfinished", () => {
  assert.match(promotionCheck(run((s) => { s.entries.Alert.provisional.waitingOn = ["Dialog"] })).fails.join("\n"), /Alert: waitingOn "Dialog" is not a component this type is built from/)
  assert.match(promotionCheck(run((s) => { s.evidence.status.Alert = "spec-complete" })).fails.join("\n"), /Alert: waitingOn "Alert", which is spec-complete now/)
})
