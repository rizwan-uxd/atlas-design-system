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
