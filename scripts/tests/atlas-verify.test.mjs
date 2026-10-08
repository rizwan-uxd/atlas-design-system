// atlas-verify `deprecated-usage`: fails a changed file that ADDS a use of a deprecated asset, passes when
// the registry is empty or the use already existed at --base. Runs in a throwaway git repo.
import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync, execSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const INPUTS = ["scripts", "packages/ui-web/src", "packages/figma-sync/code-connect", "packages/tokens", "packages/governance", "atlas"]
const FIXTURE = "app/prototypes/dep-fixture/page.tsx"
const detail = { since: "1.1.0", removeIn: "2.0.0", replacement: "Badge", migration: "Swap Alert for Badge." }

function repo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-verify-test-"))
  for (const rel of INPUTS) fs.cpSync(path.join(REPO, rel), path.join(dir, rel), { recursive: true })
  fs.mkdirSync(path.join(dir, "app/prototypes/dep-fixture"), { recursive: true })
  const git = (c) => execSync(`git ${c}`, { cwd: dir, stdio: "ignore" })
  git("init -q"); git("config user.email t@t"); git("config user.name t")
  git("add -A"); git("commit -q -m base")
  return { dir, git }
}
const deprecate = (dir, entries) =>
  fs.writeFileSync(path.join(dir, "packages/governance/deprecations.json"), JSON.stringify({ entries }))
const run = (dir) => {
  const args = [path.join(dir, "scripts/atlas-verify.mjs"), "--json", "--skip", "tsc,tests,token-lint,snapshot-current"]
  let out
  try { out = execFileSync("node", args, { cwd: dir, encoding: "utf8" }) } catch (e) { out = e.stdout }
  return JSON.parse(out).results.find((r) => r.id === "deprecated-usage")
}
const alertUse = `import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"\nexport default function P() { return <Alert variant="info" /> }\n`
const buttonLink = `import { Button } from "@atlas/ui-web/primitives/Button/Button"\nexport default function P() { return <Button variant="link">x</Button> }\n`
const cleanup = (dir) => fs.rmSync(dir, { recursive: true, force: true })

test("empty registry passes", () => {
  const { dir } = repo()
  try {
    fs.writeFileSync(path.join(dir, FIXTURE), alertUse)
    assert.equal(run(dir).status, "pass")
  } finally { cleanup(dir) }
})

test("a new import of a deprecated component fails, with the replacement in the message", () => {
  const { dir } = repo()
  try {
    deprecate(dir, [{ kind: "component", name: "Alert", ...detail }])
    fs.writeFileSync(path.join(dir, FIXTURE), alertUse)
    const r = run(dir)
    assert.equal(r.status, "fail")
    assert.match(r.mismatches.join("\n"), /imports Alert.*use Badge/)
  } finally { cleanup(dir) }
})

test("a new deprecated variant fails; a different variant passes", () => {
  const { dir } = repo()
  try {
    deprecate(dir, [{ kind: "variant", name: "Button.link", ...detail }])
    fs.writeFileSync(path.join(dir, FIXTURE), buttonLink)
    assert.equal(run(dir).status, "fail")
    fs.writeFileSync(path.join(dir, FIXTURE), buttonLink.replace('"link"', '"primary"'))
    assert.equal(run(dir).status, "pass")
  } finally { cleanup(dir) }
})

test("a use already present at --base is historical and does not fail", () => {
  const { dir, git } = repo()
  try {
    fs.writeFileSync(path.join(dir, FIXTURE), alertUse)
    git("add -A"); git("commit -q -m prior-use")
    deprecate(dir, [{ kind: "component", name: "Alert", ...detail }])
    fs.writeFileSync(path.join(dir, FIXTURE), alertUse + "// touched\n")
    assert.equal(run(dir).status, "pass")
  } finally { cleanup(dir) }
})
