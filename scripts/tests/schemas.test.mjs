// scripts/lib/schemas.mjs + packages/governance/schemas: every committed JSON input validates, and a
// targeted corruption of each family fails with a message that names the field. The figmaProperties
// cases are the ones M1's guardFigmaProperties enforced before the schema replaced it.
import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadInputs, validate, INPUTS } from "../lib/schemas.mjs"

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const read = (rel) => JSON.parse(fs.readFileSync(path.join(REPO, rel), "utf8"))
const clone = (v) => structuredClone(v)
const button = () => clone(read("atlas/metadata/Button.json"))

test("every committed JSON input validates, and every one is covered by a rule", () => {
  const r = loadInputs(REPO)
  assert.deepEqual(r.problems, [])
  const bad = r.files.filter((f) => !f.ok).map((f) => `${f.file}: ${f.errors.join("; ")}`)
  assert.deepEqual(bad, [])
  assert.ok(r.files.length >= 47 + 10, `expected the 47 metadata files and 10 other inputs, got ${r.files.length}`)
})

// ─── metadata: the M2 exit criterion lives here ─────────────────────────────

test("a renamed metadata field fails, naming both the missing and the unexpected key", () => {
  const m = button(); m.variant = m.variants; delete m.variants
  const errors = validate("metadata.schema.json", m).join("\n")
  assert.match(errors, /must have required property 'variants'/)
  assert.match(errors, /must NOT have additional properties \(variant\)/)
})

test("a wrong-typed metadata field fails with its JSON pointer", () => {
  const m = button(); m.sizes = "md"
  assert.match(validate("metadata.schema.json", m).join("\n"), /^\/sizes must be array/m)
})

test("absent figmaProperties fails, never reads as zero drift", () => {
  const m = button(); delete m.figmaProperties
  assert.match(validate("metadata.schema.json", m).join("\n"), /required property 'figmaProperties'/)
})

test("null, empty and array figmaProperties fail", () => {
  for (const v of [null, {}, ["Variant"]]) {
    const m = button(); m.figmaProperties = v
    assert.notDeepEqual(validate("metadata.schema.json", m), [], JSON.stringify(v))
  }
})

test("malformed axis members fail — nothing is coerced or skipped", () => {
  for (const axis of [[], "primary", [1], [""], ["  "], [null]]) {
    const m = button(); m.figmaProperties = { Variant: axis }
    assert.match(validate("metadata.schema.json", m).join("\n"), /^\/figmaProperties\/Variant/m, JSON.stringify(axis))
  }
})

test("every malformed axis is reported, not only the first", () => {
  const m = button(); m.figmaProperties = { A: [], B: "x", C: ["ok"] }
  const errors = validate("metadata.schema.json", m).join("\n")
  assert.match(errors, /\/figmaProperties\/A/)
  assert.match(errors, /\/figmaProperties\/B/)
  assert.doesNotMatch(errors, /\/figmaProperties\/C/)
})

test("status and deprecated must agree", () => {
  const m = button(); m.status = "deprecated"
  assert.notDeepEqual(validate("metadata.schema.json", m), [])
})

// ─── the other families ─────────────────────────────────────────────────────

test("a code-union axis with no metadataField fails (compare-axes would compare nothing)", () => {
  const map = clone(read("packages/registry/figma-axis-map.json")); delete map.axes.Variant.metadataField
  assert.match(validate("governance.schema.json#/$defs/figmaAxisMap", map).join("\n"), /\/axes\/Variant must have required property 'metadataField'/)
})

test("an unknown axis disposition fails", () => {
  const map = clone(read("packages/registry/figma-axis-map.json")); map.axes.State.disposition = "ignored"
  assert.notDeepEqual(validate("governance.schema.json#/$defs/figmaAxisMap", map), [])
})

test("a deprecation entry missing its migration fails", () => {
  const entry = { kind: "component", name: "Alert", since: "1.1.0", removeIn: "2.0.0", replacement: "Badge" }
  assert.match(validate("governance.schema.json#/$defs/deprecations", { _note: "x", entries: [entry] }).join("\n"), /migration/)
  assert.deepEqual(validate("governance.schema.json#/$defs/deprecations", { _note: "x", entries: [{ ...entry, migration: "Swap." }] }), [])
})

test("a deprecated variant name must be Component.variant", () => {
  const entry = { kind: "variant", name: "link", since: "1", removeIn: "2", replacement: "x", migration: "y" }
  assert.notDeepEqual(validate("governance.schema.json#/$defs/deprecations", { _note: "x", entries: [entry] }), [])
})

test("a status row with an unknown parity value fails", () => {
  const s = clone(read("atlas/state/status.json")); s.components.Button.parity = "matches"
  assert.match(validate("state.schema.json#/$defs/status", s).join("\n"), /\/components\/Button\/parity/)
})

test("a discrepancy id that is not DISC-NNN fails", () => {
  const d = clone(read("atlas/state/discrepancies.json")); d.discrepancies[0].id = "DISC-1"
  assert.notDeepEqual(validate("state.schema.json#/$defs/discrepancies", d), [])
})

test("tokens.json cannot claim figma-synced with a null syncedAt", () => {
  const t = clone(read("atlas/tokens.json")); t.source = "figma-synced"; t.syncedAt = null
  assert.notDeepEqual(validate("tokens.schema.json", t), [])
})

test("a token key that is not --atlas-* fails", () => {
  const t = clone(read("atlas/tokens.json")); t.semantic["--brand-primary"] = "x"
  assert.notDeepEqual(validate("tokens.schema.json", t), [])
})

test("an index entry pointing at a non-metadata path fails", () => {
  const ix = clone(read("atlas/index.json")); ix.components[0].metadata = "metadata/Button.json"
  assert.match(validate("index.schema.json", ix).join("\n"), /\/components\/0\/metadata/)
})

// ─── the Figma pull file ────────────────────────────────────────────────────

const pull = () => ({
  fileKey: "cKYhfaHLCoyMHi9nKr63Ig",
  figmaVersion: "lib:Atlas Design System v1@2026-07-06T03:44:45Z",
  pulledAt: "2026-10-21T12:25:27.000Z",
  components: {
    Button: { nodeId: "19:2", properties: { Variant: ["primary"] }, componentProperties: { "Leading icon#845:0": { type: "BOOLEAN", default: false } } },
  },
})

test("a well-formed pull file validates", () => {
  assert.deepEqual(validate("figma-pull.schema.json", pull()), [])
})

test("a pull for another Figma file, or with an empty axis, fails", () => {
  const other = pull(); other.fileKey = "abc"
  assert.notDeepEqual(validate("figma-pull.schema.json", other), [])
  const empty = pull(); empty.components.Button.properties.Variant = []
  assert.notDeepEqual(validate("figma-pull.schema.json", empty), [])
})

// ─── the loader ─────────────────────────────────────────────────────────────

const tmpRepo = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-schemas-test-"))
  for (const rel of ["atlas", "packages/governance", "packages/registry"]) fs.cpSync(path.join(REPO, rel), path.join(dir, rel), { recursive: true })
  return dir
}
const cleanup = (dir) => { try { fs.rmSync(dir, { recursive: true, force: true }) } catch { /* best effort */ } }

test("a JSON file with no schema rule is a problem — coverage is a ratchet", () => {
  const dir = tmpRepo()
  try {
    fs.writeFileSync(path.join(dir, "atlas/state/new-thing.json"), "{}")
    assert.match(loadInputs(dir).problems.join("\n"), /atlas\/state\/new-thing\.json has no schema/)
  } finally { cleanup(dir) }
})

test("a missing required input and an empty metadata directory are problems", () => {
  const dir = tmpRepo()
  try {
    fs.rmSync(path.join(dir, "atlas/tokens.json"))
    fs.rmSync(path.join(dir, "atlas/metadata"), { recursive: true })
    const problems = loadInputs(dir).problems.join("\n")
    assert.match(problems, /atlas\/tokens\.json is missing/)
    assert.match(problems, /atlas\/metadata\/\*\.json matched 0 file/)
  } finally { cleanup(dir) }
})

test("invalid JSON is a per-file error and valid() withholds its data", () => {
  const dir = tmpRepo()
  try {
    fs.writeFileSync(path.join(dir, "atlas/metadata/Button.json"), "{ nope")
    const r = loadInputs(dir)
    const f = r.files.find((x) => x.file === "atlas/metadata/Button.json")
    assert.equal(f.ok, false)
    assert.match(f.errors[0], /not valid JSON/)
    assert.equal(r.valid("atlas/metadata/Button.json"), undefined)
    assert.equal(r.valid("atlas/metadata/Input.json").name, "Input")
  } finally { cleanup(dir) }
})

test("a metadata file whose name does not match its filename fails", () => {
  const dir = tmpRepo()
  try {
    const m = button(); m.name = "Buttn"
    fs.writeFileSync(path.join(dir, "atlas/metadata/Button.json"), JSON.stringify(m))
    const f = loadInputs(dir).files.find((x) => x.file === "atlas/metadata/Button.json")
    assert.match(f.errors.join("\n"), /\/name is "Buttn" but the file is Button\.json/)
  } finally { cleanup(dir) }
})

test("every INPUTS rule points at a schema that compiles", () => {
  for (const i of INPUTS) assert.doesNotThrow(() => validate(i.schema, {}), i.schema)
})

// ─── D1 option C (built in parallel on its own branch; these keep the two branches mergeable) ───

const figmaBound = () => ({
  source: "figma-bound (codeSyntax.WEB of variables bound to pulled components)",
  syncedAt: "2026-10-22T10:00:00.000Z", figmaVersion: null, note: "A subset, never the full table.",
  coverage: { boundVariables: 193, codeTokens: 432, covered: 193, summary: "0 drift over 193/432 covered" },
  drift: { nameDrift: [], missingInCode: [] },
  conventionExceptions: [{ figma: "spacing/0.5", css: "--atlas-spacing-0_5" }],
  variables: { "color/primary": { css: "--atlas-primary", collection: "Semantic", type: "COLOR", web: "var(--atlas-primary)" } },
})

test("tokens.json may carry a figmaBound block (or null) without claiming figma-synced", () => {
  const t = clone(read("atlas/tokens.json"))
  assert.deepEqual(validate("tokens.schema.json", { ...t, figmaBound: figmaBound() }), [])
  assert.deepEqual(validate("tokens.schema.json", { ...t, figmaBound: null }), [])
})

test("a malformed figmaBound fails at its field", () => {
  const b = figmaBound(); b.coverage.covered = "193"
  assert.match(validate("tokens.schema.json", { ...clone(read("atlas/tokens.json")), figmaBound: b }).join("\n"), /\/figmaBound\/coverage\/covered must be integer/)
})

test("a pull may carry boundVariables, kept apart from `variables`", () => {
  const p = pull()
  p.boundVariables = { pulledAt: "2026-10-22", figmaVersion: null, entries: [{ name: "color/primary", collection: "Semantic", type: "COLOR", web: null }] }
  assert.deepEqual(validate("figma-pull.schema.json", p), [])
  delete p.boundVariables.entries[0].web
  assert.notDeepEqual(validate("figma-pull.schema.json", p), [])
})

// ─── registry (M3) ──────────────────────────────────────────────────────────

const formEntry = () => clone(read("packages/registry/src/Form.registry.json"))
const buttonEntry = () => clone(read("packages/registry/src/Button.registry.json"))

test("a structural registry entry may not render a component", () => {
  const e = formEntry(); e.aliasOf = "Field"
  assert.match(validate("registry.schema.json#/$defs/entry", e).join("\n"), /^\/aliasOf must be null/m)
})

test("a structural registry entry needs composedOf", () => {
  const e = formEntry(); delete e.composedOf
  assert.match(validate("registry.schema.json#/$defs/entry", e).join("\n"), /required property 'composedOf'/)
})

test("an unknown registry field fails, naming it", () => {
  const e = buttonEntry(); e.variants = []
  assert.match(validate("registry.schema.json#/$defs/entry", e).join("\n"), /additional properties \(variants\)/)
})

test("registryComplete: true requires every declarative field", () => {
  const e = buttonEntry(); e.registryComplete = true
  const errors = validate("registry.schema.json#/$defs/entry", e).join("\n")
  for (const f of ["fallback", "nesting", "a11y", "responsive", "capabilities"]) assert.match(errors, new RegExp(`required property '${f}'`))
})

test("a registry entry whose type differs from its file name fails", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "schemas-reg-"))
  for (const rel of ["atlas", "packages/governance", "packages/registry"]) fs.cpSync(path.join(REPO, rel), path.join(dir, rel), { recursive: true })
  fs.renameSync(path.join(dir, "packages/registry/src/Form.registry.json"), path.join(dir, "packages/registry/src/Forms.registry.json"))
  const r = loadInputs(dir)
  assert.match(r.files.find((f) => f.file.endsWith("Forms.registry.json")).errors.join("\n"), /\/type is "Form" but the file is Forms.registry.json/)
})
