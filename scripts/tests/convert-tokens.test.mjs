// convert-tokens: every native export is derived from atlas.tokens.css (roadmap Phase 2d), so the
// tokens-build git-diff gate fails when the CSS changes and native is not regenerated. Runs the real
// script in a throwaway copy of the two files it touches.
import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "child_process"
import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const CSS = "packages/tokens/atlas.tokens.css"
const OUT = "packages/ui-native/tokens/atlas.tokens.ts"

function withRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "convert-tokens-"))
  try {
    fs.mkdirSync(path.join(dir, "scripts"))
    fs.cpSync(path.join(REPO, "scripts/convert-tokens.mjs"), path.join(dir, "scripts/convert-tokens.mjs"))
    fs.mkdirSync(path.join(dir, path.dirname(CSS)), { recursive: true })
    fs.cpSync(path.join(REPO, CSS), path.join(dir, CSS))
    return fn(dir)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}
const run = (dir) => execFileSync("node", [path.join(dir, "scripts/convert-tokens.mjs")], { cwd: dir, encoding: "utf8", stdio: "pipe" })
const out = (dir) => fs.readFileSync(path.join(dir, OUT), "utf8")
const editCss = (dir, from, to) => {
  const p = path.join(dir, CSS), s = fs.readFileSync(p, "utf8")
  assert.ok(s.includes(from), `fixture CSS has no "${from}"`)
  fs.writeFileSync(p, s.replace(from, to))
}

test("the committed native file is what the generator writes from the committed CSS", () => withRepo((dir) => {
  run(dir)
  assert.equal(out(dir), fs.readFileSync(path.join(REPO, OUT), "utf8"))
}))

test("changing --atlas-spacing-4 changes the native output (the tokens-build gate is real)", () => withRepo((dir) => {
  run(dir)
  assert.match(out(dir), /^ {2}4: 16,$/m)
  editCss(dir, "--atlas-spacing-4: 16px;", "--atlas-spacing-4: 18px;")
  run(dir)
  assert.match(out(dir), /^ {2}4: 18,$/m)
}))

test("every non-colour group follows the CSS: duration, easing, text roles, letter spacing", () => withRepo((dir) => {
  editCss(dir, "--atlas-duration-fast: 120ms;", "--atlas-duration-fast: 150ms;")
  editCss(dir, "--atlas-easing-standard: cubic-bezier(0.2, 0, 0, 1);", "--atlas-easing-standard: cubic-bezier(0.25, 0, 0, 1);")
  editCss(dir, "--atlas-font-size-base: 16px;", "--atlas-font-size-base: 17px;")
  editCss(dir, "--atlas-letter-spacing-wide: 0.02em;", "--atlas-letter-spacing-wide: 0.03em;")
  run(dir)
  const ts = out(dir)
  assert.match(ts, /^ {2}fast: 150,$/m)
  assert.match(ts, /^ {2}standard: \[0\.25, 0, 0, 1\],$/m)
  assert.match(ts, /^ {2}body: 17,$/m) // --atlas-text-body: var(--atlas-font-size-base) resolves through
  assert.match(ts, /^ {2}wide: 0\.48,$/m)
}))

test("a value in an unexpected unit fails loudly instead of being written as a string", () => withRepo((dir) => {
  editCss(dir, "--atlas-spacing-4: 16px;", "--atlas-spacing-4: 1rem;")
  assert.throws(() => run(dir), /expected px, got "1rem"/)
}))
