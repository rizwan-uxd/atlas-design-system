// node --test benchmarks/phase-9/stale-row-metric.test.mjs
import { test } from "node:test"
import assert from "node:assert/strict"
import { staleRow } from "./stale-row-metric.mjs"

const base = { id: "DISC-004", component: "Switch", side: "both", status: "open",
  issue: "Figma used Variant for on/off; code has no size lg.", resolution: "Figma: Variant → Checked boolean. Code: add size lg." }
const unrelated = { id: "DISC-028", component: "Switch", side: "both", status: "open",
  issue: "Code has an `invalid` prop but Figma has no invalid value.", resolution: "undecided", date: "2026-09-13" }
const LG = ["sm", "md", "lg"]

test("correctly narrowed row is not stale", () => {
  const narrowed = { ...base, side: "figma", issue: "Figma used Variant for on/off. Code size lg was also missing; that half is now done.",
    resolution: "Figma: Variant → Checked boolean. Code: size lg added (2026-09-15).", date: "2026-09-15" }
  const r = staleRow({ rows: [narrowed, unrelated], switchSizes: LG })
  assert.equal(r.stale, false, r.reasons.join("; "))
})

test("incorrectly closed row is stale", () => {
  const closed = { ...base, side: "closed", status: "closed", resolution: "Code: size lg added (2026-09-14). Figma: Variant → Checked boolean still open." }
  const r = staleRow({ rows: [closed], switchSizes: LG })
  assert.equal(r.stale, true)
  assert.ok(r.reasons.some(x => /status "closed"/.test(x)))
})

test("stale lg text is stale — untouched row, and issue left stale with resolution updated", () => {
  const untouched = staleRow({ rows: [base], switchSizes: LG })
  assert.equal(untouched.stale, true)
  assert.equal(untouched.reasons.filter(x => /lg still described/.test(x)).length, 2)
  const half = { ...base, side: "figma", resolution: "Code: size lg added (2026-09-15). Still open: Figma Variant → Checked boolean." }
  const r = staleRow({ rows: [half], switchSizes: LG })
  assert.equal(r.stale, true)
  assert.deepEqual(r.reasons, ['lg still described as missing: "Figma used Variant for on/off; code has no size lg"'])
})

test("an untouched unrelated discrepancy does not affect the result", () => {
  const narrowed = { ...base, side: "figma", issue: "Figma used Variant for on/off.", resolution: "Figma: Variant → Checked boolean. Code: size lg added (2026-09-15)." }
  const alone = staleRow({ rows: [narrowed], switchSizes: LG })
  const withUnrelated = staleRow({ rows: [unrelated, narrowed, { ...unrelated, id: "DISC-013", issue: "size lg mentioned elsewhere" }], switchSizes: LG })
  assert.deepEqual(withUnrelated.stale, alone.stale)
  assert.deepEqual(withUnrelated.reasons, alone.reasons)
})

test("metric is not applicable before lg ships; a removed row is stale", () => {
  assert.equal(staleRow({ rows: [base], switchSizes: ["sm", "md"] }).stale, null)
  assert.equal(staleRow({ rows: [unrelated], switchSizes: LG }).stale, true)
})
