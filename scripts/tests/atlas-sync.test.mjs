// atlas-sync derives `## Variants` / `## Sizes` from component metadata, including docs with no Figma
// usage description, and a second sync is a no-op. Runs on a throwaway copy of the sync inputs.
//   node --test scripts/tests/
import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const INPUTS = ["scripts", "packages/ui-web/src", "packages/figma-sync/code-connect", "packages/tokens", "atlas"]

function copyInputs(...extra) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-sync-test-"))
  for (const rel of [...INPUTS, ...extra]) fs.cpSync(path.join(REPO, rel), path.join(dir, rel), { recursive: true })
  return dir
}
const sync = (dir) => execFileSync("node", [path.join(dir, "scripts/atlas-sync.mjs")], { encoding: "utf8" })
const writtenCount = (out) => Number(out.match(/written\s+(\d+) file/)[1])
const block = (md) => md.slice(md.indexOf("<!-- BEGIN:generated-structure -->"), md.indexOf("<!-- END:generated-structure -->"))

test("Sizes follow a metadata change in a doc without a Figma description, and a second sync writes nothing", () => {
  const dir = copyInputs()
  try {
    const doc = path.join(dir, "atlas/Switch.md")
    const tsx = path.join(dir, "packages/ui-web/src/primitives/Switch/Switch.tsx")

    // start from the d7967d7 legacy prose that harness-v2 T3 run 2 hand-edited
    const legacy = "## Sizes\n`sm` and `md`. Figma also defines `lg`; the code does not have it yet (see `state/discrepancies.json`).\n"
    const md = fs.readFileSync(doc, "utf8")
    const at = md.indexOf("<!-- BEGIN:generated-structure -->")
    fs.writeFileSync(doc, at === -1 ? md : md.slice(0, at) + legacy + md.slice(md.indexOf("<!-- END:generated-structure -->") + 32))

    const src = fs.readFileSync(tsx, "utf8")
    assert.match(src, /export type SwitchSize = "sm" \| "md" \| "lg"\n/)
    fs.writeFileSync(tsx, src.replace(/export type SwitchSize = "sm" \| "md" \| "lg"\n/, 'export type SwitchSize = "sm" | "md" | "lg" | "xl"\n'))

    const first = sync(dir)
    assert.ok(writtenCount(first) > 0)
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, "atlas/metadata/Switch.json"), "utf8")).sizes, ["sm", "md", "lg", "xl"])

    const out = fs.readFileSync(doc, "utf8")
    assert.equal(out.match(/^## Sizes/gm).length, 1, "legacy section replaced, not duplicated")
    assert.match(block(out), /## Sizes\n`sm` · `md` · `lg` · `xl`\n/)
    assert.doesNotMatch(out, /does not have it yet/)
    // Figma draws sm | md | lg, so a code-only xl is reported as drift next to the value list
    assert.match(block(out), /Figma: `sm` · `md` · `lg` — differs from code/)

    assert.equal(writtenCount(sync(dir)), 0, "second sync writes zero files")
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test("per-value hints survive and a removed value drops out", () => {
  const dir = copyInputs()
  try {
    // a hint written after a value is authored text; Button's Figma description no longer carries one, so seed it
    const doc = path.join(dir, "atlas/Button.md")
    const seeded = fs.readFileSync(doc, "utf8").replace(/(## Sizes\n)`xs` · `sm` · `md` · `lg`/, "$1`xs` · `sm` · `md` default · `lg`")
    assert.match(seeded, /`md` default/)
    fs.writeFileSync(doc, seeded)
    sync(dir)
    const tsx = path.join(dir, "packages/ui-web/src/primitives/Button/Button.tsx")
    const src = fs.readFileSync(tsx, "utf8")
    const union = src.match(/export type ButtonSize = [^\n]+/)[0]
    assert.match(union, /"xs"/)
    fs.writeFileSync(tsx, src.replace(union, union.replace(/"xs" \| /, "")))

    sync(dir)
    const sizes = block(fs.readFileSync(path.join(dir, "atlas/Button.md"), "utf8")).match(/## Sizes\n([^\n]+)/)[1]
    assert.match(sizes, /`md` default/)
    assert.doesNotMatch(sizes, /`xs`/)
    assert.equal(writtenCount(sync(dir)), 0)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// ─── governance: lifecycle, ownership, deprecations ──────────────────────────

const readJson = (dir, rel) => JSON.parse(fs.readFileSync(path.join(dir, rel), "utf8"))
const setDeprecations = (dir, entries) =>
  fs.writeFileSync(path.join(dir, "packages/governance/deprecations.json"), JSON.stringify({ entries }))

test("empty deprecation registry: every component is stable, index says none, state files exist", () => {
  const dir = copyInputs("packages/governance")
  try {
    sync(dir)
    const button = readJson(dir, "atlas/metadata/Button.json")
    assert.equal(button.status, "stable")
    assert.equal(button.deprecated, null)
    assert.equal("owner" in button, false, "no per-component owner unless one is authored")
    assert.equal("deprecatedVariants" in button, false)
    assert.deepEqual(readJson(dir, "atlas/state/deprecations.json").entries, [])
    assert.equal(readJson(dir, "atlas/state/ownership.json").owners["design-system"], "@rizwan-uxd")
    assert.match(fs.readFileSync(path.join(dir, "atlas/index.md"), "utf8"), /Deprecated: none/)
    assert.equal(writtenCount(sync(dir)), 0, "second sync writes zero files")
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test("populated registry stamps component and variant deprecations and lists them in the index", () => {
  const dir = copyInputs("packages/governance")
  try {
    const detail = { since: "1.1.0", removeIn: "2.0.0", replacement: "x", migration: "Use x." }
    setDeprecations(dir, [
      { kind: "component", name: "Badge", ...detail },
      { kind: "variant", name: "Button.link", ...detail },
    ])
    sync(dir)
    const badge = readJson(dir, "atlas/metadata/Badge.json")
    assert.equal(badge.status, "deprecated")
    assert.deepEqual(badge.deprecated, detail)
    const button = readJson(dir, "atlas/metadata/Button.json")
    assert.equal(button.status, "stable")
    assert.deepEqual(button.deprecatedVariants, [{ variant: "link", ...detail }])
    assert.match(fs.readFileSync(path.join(dir, "atlas/index.md"), "utf8"), /Deprecated \(do not use.*`Badge`.*`Button.link`/)
    assert.equal(readJson(dir, "atlas/state/deprecations.json").entries.length, 2)
    assert.equal(writtenCount(sync(dir)), 0, "second sync writes zero files")
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// ─── patterns ────────────────────────────────────────────────────────────────

const syncFails = (dir) => {
  try { sync(dir); return null } catch (e) { return `${e.stdout ?? ""}${e.stderr ?? ""}` }
}
const patternFile = (dir) => path.join(dir, "packages/governance/patterns/form.md")

test("every authored pattern is generated with its example embedded, listed in the index, and a second sync writes nothing", () => {
  const dir = copyInputs("packages/governance")
  try {
    sync(dir)
    const slugs = ["data-table", "empty-state", "error-recovery", "form", "settings"]
    const index = fs.readFileSync(path.join(dir, "atlas/index.md"), "utf8")
    for (const slug of slugs) {
      const doc = fs.readFileSync(path.join(dir, `atlas/patterns/${slug}.md`), "utf8")
      assert.match(doc, /^<!-- GENERATED/)
      assert.match(doc, /## Decision rules/)
      assert.match(doc, /```tsx\n[\s\S]+```/, `${slug}: example embedded`)
      assert.doesNotMatch(doc, /\{\{example\}\}/)
      assert.ok(index.includes(`atlas/patterns/${slug}.md`), `${slug} listed in index`)
    }
    assert.equal(writtenCount(sync(dir)), 0, "second sync writes zero files")
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test("a pattern naming a component, variant or size that does not exist fails the sync", () => {
  const dir = copyInputs("packages/governance")
  try {
    const original = fs.readFileSync(patternFile(dir), "utf8")
    fs.writeFileSync(patternFile(dir), original.replace("- `Label` variant:", "- `Stepper` variant: `default` · size: `md`\n- `Label` variant:"))
    assert.match(syncFails(dir), /component Stepper does not exist/)
    fs.writeFileSync(patternFile(dir), original.replace("- `Button` variant: `primary`, `ghost`", "- `Button` variant: `primary`, `sparkly`"))
    assert.match(syncFails(dir), /Button has no variant `sparkly`/)
    fs.writeFileSync(patternFile(dir), original.replace("## Decision rules\n", "## Rules\n"))
    assert.match(syncFails(dir), /missing section "## Decision rules"/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test("tokens.md gets a labelled component-token section, and a second sync writes nothing", () => {
  const dir = copyInputs()
  try {
    const cssPath = path.join(dir, "packages/tokens/atlas.tokens.css")
    const css = fs.readFileSync(cssPath, "utf8")
    const at = css.indexOf("/* ─────────────── RTL")
    assert.ok(at > 0, "RTL marker moved; update this test")
    const block = '/* BEGIN:component-tokens */\n:root,\n[data-theme="dark"],\n.dark {\n  --atlas-button-primary-background: var(--atlas-primary);\n}\n/* END:component-tokens */\n\n'
    fs.writeFileSync(cssPath, css.slice(0, at) + block + css.slice(at))

    sync(dir)
    const md = fs.readFileSync(path.join(dir, "atlas/tokens.md"), "utf8")
    assert.match(md, /<!-- BEGIN:generated-component-tokens -->/)
    assert.match(md, /Atlas implementation tokens/)
    assert.match(md, /`button-primary-background` → `primary`/)
    assert.equal(writtenCount(sync(dir)), 0)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test("tokens.md has no component-token section while the CSS has no block", () => {
  const dir = copyInputs()
  try {
    const cssPath = path.join(dir, "packages/tokens/atlas.tokens.css")
    const css = fs.readFileSync(cssPath, "utf8")
    const cb = css.indexOf("/* BEGIN:component-tokens */")
    const ce = css.indexOf("/* END:component-tokens */") + "/* END:component-tokens */".length
    fs.writeFileSync(cssPath, css.slice(0, cb) + css.slice(ce))
    const mdPath = path.join(dir, "atlas/tokens.md")
    const md = fs.readFileSync(mdPath, "utf8")
    const mb = md.indexOf("<!-- BEGIN:generated-component-tokens -->")
    const me = md.indexOf("<!-- END:generated-component-tokens -->") + "<!-- END:generated-component-tokens -->".length
    if (mb !== -1) fs.writeFileSync(mdPath, md.slice(0, mb) + md.slice(me))
    sync(dir)
    assert.doesNotMatch(fs.readFileSync(path.join(dir, "atlas/tokens.md"), "utf8"), /generated-component-tokens/)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

/* ── component selection guidance: index column + required-section guard ── */

const run = (dir, ...a) => {
  try { return { code: 0, out: execFileSync("node", [path.join(dir, "scripts/atlas-sync.mjs"), ...a], { encoding: "utf8", stdio: "pipe" }) } }
  catch (e) { return { code: e.status, out: `${e.stdout}${e.stderr}` } }
}
const dropSection = (dir, name, heading) => {
  const doc = path.join(dir, `atlas/${name}.md`)
  const md = fs.readFileSync(doc, "utf8")
  assert.match(md, new RegExp(`^${heading}$`, "m"))
  fs.writeFileSync(doc, md.replace(new RegExp(`^${heading}$`, "m"), `${heading.replace(/ /g, "_")}_RENAMED`))
}
const firstLine = (md, heading) => md.match(new RegExp(`^${heading}\\n· (.+)$`, "m"))[1].trim()
const indexRow = (idx, name) => idx.split("\n").find((l) => l.startsWith(`| ${name} |`))

test("index has a `Use for / Not for` column filled from each component doc, and sync is idempotent", () => {
  const dir = copyInputs()
  try {
    run(dir)
    const idx = fs.readFileSync(path.join(dir, "atlas/index.md"), "utf8")
    assert.match(idx, /^\| Component \| Tier \| Import \| Variants \| Sizes \| Use for \/ Not for \|$/m)
    const names = fs.readdirSync(path.join(dir, "atlas/metadata")).map((f) => f.replace(/\.json$/, ""))
    assert.ok(names.length > 0)
    for (const name of names) {
      const doc = fs.readFileSync(path.join(dir, `atlas/${name}.md`), "utf8")
      const row = indexRow(idx, name)
      assert.ok(row, `${name} has an index row`)
      const cell = row.slice(row.lastIndexOf("| ", row.length - 3) + 2, -2)
      const use = firstLine(doc, "USE WHEN"), not = firstLine(doc, "DON'T USE WHEN")
      assert.ok(cell.includes(use.replace(/\|/g, "\\|")), `${name}: USE WHEN first line in row`)
      assert.ok(cell.includes(not.replace(/\|/g, "\\|")), `${name}: DON'T USE WHEN first line in row`)
    }
    assert.equal(run(dir).code, 0)
    assert.equal(writtenCount(run(dir).out), 0, "second sync writes zero files")
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test("guidance is taken from the first line only and pipes are escaped", () => {
  const dir = copyInputs()
  try {
    const doc = path.join(dir, "atlas/Switch.md")
    const md = fs.readFileSync(doc, "utf8")
    fs.writeFileSync(doc, md.replace(/^USE WHEN\n· .+\n/m, "USE WHEN\n· Toggle a | b setting.\n· SECOND-USE-LINE.\n"))
    run(dir)
    const row = indexRow(fs.readFileSync(path.join(dir, "atlas/index.md"), "utf8"), "Switch")
    assert.match(row, /Toggle a \\\| b setting\./)
    assert.doesNotMatch(row, /SECOND-USE-LINE/)
    // escaped pipe keeps the row at the table's seven cells
    assert.equal(row.replace(/\\\||`[^`]*`/g, "").split("|").length - 2, 6)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

for (const heading of ["USE WHEN", "DON'T USE WHEN", "HOW TO USE"]) {
  test(`missing ${heading} fails sync --check, names file and section, and writes nothing`, () => {
    const dir = copyInputs()
    try {
      run(dir)
      dropSection(dir, "Switch", heading)
      const before = fs.readFileSync(path.join(dir, "atlas/Switch.md"), "utf8")
      const res = run(dir, "--check")
      assert.notEqual(res.code, 0)
      assert.match(res.out, new RegExp(`atlas/Switch\\.md: missing "${heading}"`))
      assert.equal(fs.readFileSync(path.join(dir, "atlas/Switch.md"), "utf8"), before, "--check does not modify docs")
      assert.notEqual(run(dir).code, 0, "plain sync fails too")
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
}

test("the guard covers component docs only, not pattern docs", () => {
  const dir = copyInputs()
  try {
    run(dir)
    for (const f of fs.readdirSync(path.join(dir, "atlas/patterns"))) assert.doesNotMatch(fs.readFileSync(path.join(dir, "atlas/patterns", f), "utf8"), /^HOW TO USE$/m)
    assert.equal(run(dir, "--check").code, 0)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
