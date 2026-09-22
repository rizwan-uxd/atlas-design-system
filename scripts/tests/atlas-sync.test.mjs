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

function copyInputs() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-sync-test-"))
  for (const rel of INPUTS) fs.cpSync(path.join(REPO, rel), path.join(dir, rel), { recursive: true })
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
    assert.match(src, /export type SwitchSize = "sm" \| "md"\n/)
    fs.writeFileSync(tsx, src.replace(/export type SwitchSize = "sm" \| "md"\n/, 'export type SwitchSize = "sm" | "md" | "lg"\n'))

    const first = sync(dir)
    assert.ok(writtenCount(first) > 0)
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, "atlas/metadata/Switch.json"), "utf8")).sizes, ["sm", "md", "lg"])

    const out = fs.readFileSync(doc, "utf8")
    assert.equal(out.match(/^## Sizes/gm).length, 1, "legacy section replaced, not duplicated")
    assert.match(block(out), /## Sizes\n`sm` · `md` · `lg`\n/)
    assert.doesNotMatch(out, /does not have it yet/)
    assert.doesNotMatch(block(out), /Figma: .*differs/, "code and Figma sizes now agree")

    assert.equal(writtenCount(sync(dir)), 0, "second sync writes zero files")
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test("per-value hints survive and a removed value drops out", () => {
  const dir = copyInputs()
  try {
    sync(dir)
    const tsx = path.join(dir, "packages/ui-web/src/primitives/Button/Button.tsx")
    const src = fs.readFileSync(tsx, "utf8")
    const union = src.match(/export type ButtonSize = [^\n]+/)[0]
    assert.match(union, /"icon"/)
    fs.writeFileSync(tsx, src.replace(union, union.replace(/ \| "icon"|"icon" \| /, "")))

    sync(dir)
    const sizes = block(fs.readFileSync(path.join(dir, "atlas/Button.md"), "utf8")).match(/## Sizes\n([^\n]+)/)[1]
    assert.match(sizes, /`md` default/)
    assert.doesNotMatch(sizes, /`icon`/)
    assert.equal(writtenCount(sync(dir)), 0)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
