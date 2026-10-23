// token-coverage: Figma↔code token drift. tableCoverage reads the whole variable table (D1 option B);
// one clean case, then one case per classification it exists to make.
import { test } from "node:test"
import assert from "node:assert/strict"
import { tableCoverage } from "../lib/token-coverage.mjs"

const CSS = `:root {
  --atlas-spacing-2: 8px;
  --atlas-font-sans: "Nunito Sans";
  --atlas-columns: 4;
  --atlas-columns-mobile: 4;
  --atlas-columns-desktop: 12;
}`
const collections = [{ name: "Atlas/Primitives", modes: ["Default"], count: 3 }, { name: "Atlas/Layout", modes: ["Mobile", "Desktop"], count: 1 }]
const v = (name, web, collection = "Atlas/Primitives", type = "FLOAT") => ({ name, collection, type, web })
const clean = () => [
  v("spacing/2", "var(--atlas-spacing-2)"),
  v("font-family/sans", "var(--atlas-font-sans)", "Atlas/Primitives", "STRING"),
  v("columns", "var(--atlas-columns)", "Atlas/Layout"),
]

test("a table that names every CSS token passes, with mode expansions and convention exceptions listed", () => {
  const r = tableCoverage({ collections, entries: clean() }, CSS)
  assert.deepEqual(r.drift, { nameDrift: [], missingInCode: [], missingInFigma: [] })
  assert.deepEqual(r.coverage, { figmaVariables: 3, published: 3, codeTokens: 5, covered: 5, summary: "0 name drift · 0 missing in code · 0 missing in Figma · 5/5 code tokens covered" })
  assert.deepEqual(r.modeExpansions.map((m) => m.css), ["--atlas-columns-mobile", "--atlas-columns-desktop"])
  assert.deepEqual(r.conventionExceptions, [{ figma: "font-family/sans", css: "--atlas-font-sans" }])
})

test("a CSS token no variable names is missing in Figma", () => {
  const r = tableCoverage({ collections, entries: clean() }, CSS.replace("}", "  --atlas-shadow-sm: 0 1px 2px;\n}"))
  assert.deepEqual(r.drift.missingInFigma, ["--atlas-shadow-sm"])
})

test("a variable whose WEB names an undeclared token is missing in code", () => {
  const r = tableCoverage({ collections, entries: [...clean(), v("card/radius", "var(--atlas-card-radius)", "Atlas/Component")] }, CSS)
  assert.deepEqual(r.drift.missingInCode, [{ figma: "card/radius", css: "--atlas-card-radius" }])
})

test("name drift: WEB absent while the slash-to-dash name is declared, or WEB not a var() reference", () => {
  const entries = [v("spacing/2", null), v("font-family/sans", "Nunito Sans", "Atlas/Primitives", "STRING"), v("columns", "var(--atlas-columns)", "Atlas/Layout")]
  const r = tableCoverage({ collections, entries }, CSS)
  assert.deepEqual(r.drift.nameDrift, [
    { figma: "font-family/sans", web: "Nunito Sans", expected: null },
    { figma: "spacing/2", web: null, expected: "--atlas-spacing-2" },
  ])
  // the two tokens those variables should have named are now unnamed on the Figma side too
  assert.deepEqual(r.drift.missingInFigma, ["--atlas-font-sans", "--atlas-spacing-2"])
})

test("a variable with no WEB and no CSS token is unpublished, never drift", () => {
  const r = tableCoverage({ collections, entries: [...clean(), v("color/coral/500", null, "Atlas/Primitives", "COLOR")] }, CSS)
  assert.deepEqual(r.unpublished, ["color/coral/500"])
  assert.deepEqual(r.drift, { nameDrift: [], missingInCode: [], missingInFigma: [] })
  assert.equal(r.coverage.published, 3)
})

test("a mode suffix only counts for a mode the variable's collection has", () => {
  // --atlas-columns-tablet is not a mode of Atlas/Layout here, so it is a real gap
  const r = tableCoverage({ collections, entries: clean() }, CSS.replace("}", "  --atlas-columns-tablet: 8;\n}"))
  assert.deepEqual(r.drift.missingInFigma, ["--atlas-columns-tablet"])
})
