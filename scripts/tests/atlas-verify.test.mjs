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
// packages/registry carries the authored figma-axis-map.json that design/figma-registry-code needs. It is in
// this list because that check fails closed: a throwaway repo without the map is one whose Figma side
// cannot be verified, and it says so rather than passing. packages/runtime carries the protocol fixtures that
// design/schemas requires (min 1), for the same reason.
const INPUTS = ["scripts", "packages/ui-web/src", "packages/figma-sync/code-connect", "packages/tokens", "packages/governance", "packages/registry", "packages/runtime", "atlas"]
const FIXTURE = "app/prototypes/dep-fixture/page.tsx"
const detail = { since: "1.1.0", removeIn: "2.0.0", replacement: "Badge", migration: "Swap Alert for Badge." }

function repo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-verify-test-"))
  for (const rel of INPUTS) fs.cpSync(path.join(REPO, rel), path.join(dir, rel), { recursive: true })
  fs.mkdirSync(path.join(dir, "app/prototypes/dep-fixture"), { recursive: true })
  // since M2 atlas-verify imports ajv (schemas) and typescript (the JSX scanner), so every fixture needs them
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(dir, "node_modules"))
  const git = (c) => execSync(`git ${c}`, { cwd: dir, stdio: "ignore" })
  git("init -q"); git("config user.email t@t"); git("config user.name t")
  fs.writeFileSync(path.join(dir, ".git/info/exclude"), "/node_modules\n")
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
// Removing the throwaway repo is best-effort: on CI the removal intermittently fails with ENOTEMPTY while
// something is still writing into .git. The assertions have already run by then and a leftover directory in
// the OS temp dir is harmless, so a failed removal must not fail the test.
const cleanup = (dir) => {
  try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch { /* best effort */ }
}

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

// ─── --stamp-components ──────────────────────────────────────────────────────

const stampRepo = () => {
  const { dir, git } = repo()
  for (const rel of ["tsconfig.json", "tsconfig.base.json", "vitest.config.ts", "package.json", "next-env.d.ts", "app", "packages/ui-web/tests"])
    if (fs.existsSync(path.join(REPO, rel))) fs.cpSync(path.join(REPO, rel), path.join(dir, rel), { recursive: true })
  git("add -A"); git("commit -q -m full")
  return { dir, git }
}
const runStamp = (dir, args) => {
  let out
  try { out = execFileSync("node", [path.join(dir, "scripts/atlas-verify.mjs"), "--json", ...args], { cwd: dir, encoding: "utf8", timeout: 240000 }) } catch (e) { out = e.stdout }
  return JSON.parse(out)
}
const verifiedAt = (dir, name) => JSON.parse(fs.readFileSync(path.join(dir, "atlas/state/status.json"), "utf8")).components[name].verifiedAt

test("--stamp-components stamps a named component on a full pass with no library change, and never an unnamed one", () => {
  const { dir } = stampRepo()
  try {
    const before = verifiedAt(dir, "Button")
    const r = runStamp(dir, ["--stamp-components", "Button"])
    assert.equal(r.ok, true, JSON.stringify(r.results.filter((x) => x.status === "fail")))
    assert.deepEqual(r.stamped, ["Button"])
    assert.notEqual(verifiedAt(dir, "Button"), before)
    assert.match(verifiedAt(dir, "Button"), /^\d{4}-\d\d-\d\dT/)
    assert.equal(verifiedAt(dir, "Input"), JSON.parse(fs.readFileSync(path.join(REPO, "atlas/state/status.json"), "utf8")).components.Input.verifiedAt)
  } finally { cleanup(dir) }
})

test("--stamp-components does not stamp when a check is skipped or fails, or when the name is unknown", () => {
  const { dir } = stampRepo()
  try {
    const before = verifiedAt(dir, "Button")
    const skipped = runStamp(dir, ["--stamp-components", "Button", "--skip", "tests"])
    assert.deepEqual(skipped.stamped, [])
    assert.match(skipped.stampNote.join(" "), /skipped tests/)
    deprecate(dir, [{ kind: "component", name: "Alert", ...detail }])
    fs.mkdirSync(path.join(dir, "app/prototypes/dep-fixture"), { recursive: true })
    fs.writeFileSync(path.join(dir, FIXTURE), alertUse)
    const failed = runStamp(dir, ["--stamp-components", "Button", "--skip", "tsc,tests,token-lint,snapshot-current"])
    assert.deepEqual(failed.stamped, [])
    assert.equal(verifiedAt(dir, "Button"), before)
    fs.rmSync(path.join(dir, FIXTURE)); deprecate(dir, [])
    const unknown = runStamp(dir, ["--stamp-components", "NoSuchThing"])
    assert.deepEqual(unknown.stamped, [])
    assert.match(unknown.stampNote.join(" "), /NoSuchThing has no atlas\/metadata/)
  } finally { cleanup(dir) }
})

// ─── one test per check (M2) ─────────────────────────────────────────────────
// Each check gets a PASS path and a FAIL path in a throwaway repo, run with --only so a test exercises
// exactly one check. Together with the tests above, every check atlas-verify runs has a test.

const verify = (dir, only, extra = []) => {
  let out, code = 0
  try { out = execFileSync("node", [path.join(dir, "scripts/atlas-verify.mjs"), "--json", "--only", only, ...extra], { cwd: dir, encoding: "utf8", timeout: 240000 }) }
  catch (e) { out = e.stdout; code = e.status }
  const json = JSON.parse(out)
  const id = only.split(".").pop()
  return { ...json.results.find((r) => r.id === id), code, json }
}
const write = (dir, rel, body) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), body) }
const edit = (dir, rel, fn) => write(dir, rel, fn(fs.readFileSync(path.join(dir, rel), "utf8")))
const withRepo = (fn) => { const r = repo(); try { fn(r) } finally { cleanup(r.dir) } }
const PAGE = "app/prototypes/fixture/page.tsx"
const button = (attrs) => `import { Button } from "@atlas/ui-web/primitives/Button/Button"\nexport default function P() { return <Button ${attrs}>x</Button> }\n`

test("every check reports an inspection count", () => withRepo(({ dir }) => {
  const r = verify(dir, "design.schemas")
  for (const x of r.json.results.filter((x) => x.status !== "skip")) assert.equal(typeof x.inspected, "number", x.id)
}))

// design/schemas — the M2 exit criterion
test("design/schemas passes on the committed snapshot and counts what it validated", () => withRepo(({ dir }) => {
  const r = verify(dir, "design.schemas")
  assert.equal(r.status, "pass")
  assert.ok(r.inspected >= 57)
}))

test("M2 exit: corrupting one field of atlas/metadata/Button.json turns PASS into FAIL and exit 1", () => withRepo(({ dir }) => {
  edit(dir, "atlas/metadata/Button.json", (s) => s.replace('"variants":', '"variant":'))
  const r = verify(dir, "design.schemas")
  assert.equal(r.status, "fail")
  assert.equal(r.code, 1)
  assert.match(r.mismatches.join("\n"), /atlas\/metadata\/Button\.json: \/ must have required property 'variants'/)
}))

test("design/schemas fails on a JSON input no schema covers", () => withRepo(({ dir }) => {
  write(dir, "atlas/state/extra.json", "{}")
  assert.match(verify(dir, "design.schemas").mismatches.join("\n"), /extra\.json has no schema/)
}))

// design/snapshot-current
test("design/snapshot-current passes when atlas/ matches the generator, fails when it is behind", () => withRepo(({ dir }) => {
  const ok = verify(dir, "snapshot-current")
  assert.equal(ok.status, "pass", ok.mismatches?.join("\n"))
  assert.ok(ok.inspected > 0)
  edit(dir, "atlas/index.json", (s) => s.replace('"note": "', '"note": "hand-edited. '))
  const behind = verify(dir, "snapshot-current")
  assert.equal(behind.status, "fail")
  assert.match(behind.mismatches.join("\n"), /atlas-sync would write/)
}))

// design/figma-registry-code
test("design/figma-registry-code fails a member Figma has and code lacks", () => withRepo(({ dir }) => {
  edit(dir, "atlas/metadata/Badge.json", (s) => s.replace(/"Variant": \[/, '"Variant": ["sparkly", '))
  const r = verify(dir, "figma-registry-code")
  assert.equal(r.status, "fail")
  assert.match(r.mismatches.join("\n"), /Badge\/Variant: Figma Badge\/Variant has "sparkly"/)
}))

test("design/figma-registry-code fails a registry slot Figma does not draw, on the registry side", () => withRepo(({ dir }) => {
  const ok = verify(dir, "figma-registry-code")
  assert.notEqual(ok.status, "fail", ok.mismatches.join("\n"))
  assert.match(ok.note, /registry \d+ entries/)
  edit(dir, "packages/registry/src/Alert.registry.json", (s) => s.replace('"slots": ["actions", "description", "title"]', '"slots": ["actions", "description", "icon", "title"]'))
  const r = verify(dir, "figma-registry-code")
  assert.equal(r.status, "fail")
  assert.match(r.mismatches.join("\n"), /\[registry\] Alert: slot "icon" has no Figma counterpart/)
}))

test("design/figma-registry-code fails closed on a schema-invalid component and still compares the rest", () => withRepo(({ dir }) => {
  edit(dir, "atlas/metadata/Button.json", (s) => s.replace(/"figmaProperties": \{[^}]*\}/, '"figmaProperties": null'))
  const r = verify(dir, "figma-registry-code")
  assert.equal(r.status, "fail")
  assert.match(r.mismatches.join("\n"), /atlas\/metadata\/Button\.json failed its schema — not compared/)
  assert.match(r.note, /^46\/47 components/)
}))

// design/registry-events, design/registry-fallback, design/registry-states (M3): PASS on the repo,
// FAIL on one edit each. The rules themselves are unit-tested in registry-metrics.test.mjs.
const registryEdit = (id, file, from, to, re) => test(`design/${id} passes the repo and fails ${re}`, () => withRepo(({ dir }) => {
  const ok = verify(dir, id)
  assert.equal(ok.status, "pass", ok.mismatches.join("\n"))
  assert.ok(ok.inspected > 0)
  assert.match(ok.note, /\/47 components registered/)
  edit(dir, file, (s) => { assert.ok(s.includes(from), `${file} no longer contains ${from}`); return s.replace(from, to) })
  const bad = verify(dir, id)
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), re)
}))
registryEdit("registry-events", "packages/registry/src/Button.registry.json", '"handler": "onClick"', '"handler": "onPress"', /Button: event "click" → onPress, which Button does not have/)
registryEdit("registry-fallback", "packages/registry/src/Field.registry.json", '"fallback": { "type": "Alert"', '"fallback": { "type": "Field"', /more than one terminal fallback/)
registryEdit("registry-states", "packages/registry/src/TextField.registry.json", '"stateProps": { "disabled": "disabled", "error": "invalid" }', '"stateProps": { "disabled": "disabled", "error": "broken" }', /TextField: State "error" is prop-driven but stateProps names no prop/)

// design/variants-sizes
test("design/variants-sizes fails an unknown literal variant and passes a real one", () => withRepo(({ dir }) => {
  write(dir, PAGE, button('variant="sparkly"'))
  const bad = verify(dir, "variants-sizes")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /<Button variant="sparkly">/)
  write(dir, PAGE, button('variant="ghost" size="sm"'))
  const good = verify(dir, "variants-sizes")
  assert.equal(good.status, "pass")
  assert.match(good.note, /1 files · 1 tags · 2 literal props · 0 dynamic/)
}))

test("design/variants-sizes counts an expression as dynamic and never reads it as absent", () => withRepo(({ dir }) => {
  write(dir, PAGE, button("variant={v} {...rest}"))
  const r = verify(dir, "variants-sizes")
  assert.equal(r.status, "pass")
  assert.match(r.note, /0 literal props · 2 dynamic/)
}))

test("design/variants-sizes fails when a file renders an Atlas component it could not find a tag for", () => withRepo(({ dir }) => {
  write(dir, PAGE, `import { Button } from "@atlas/ui-web/primitives/Button/Button"\nexport const B = Button\n`)
  const r = verify(dir, "variants-sizes")
  assert.equal(r.status, "fail")
  assert.match(r.mismatches[0], /0 inspected, 1 in scope/)
}))

test("design/variants-sizes does not report a tag that only appears inside a string", () => withRepo(({ dir }) => {
  write(dir, PAGE, button('variant="ghost"') + `export const doc = '<Button variant="sparkly">'\n`)
  assert.equal(verify(dir, "variants-sizes").status, "pass")
}))

// design/tokens
test("design/tokens fails an undefined token and a primitive, passes a semantic one", () => withRepo(({ dir }) => {
  write(dir, "app/prototypes/fixture/x.css", ".a { color: var(--atlas-not-a-token); background: var(--atlas-blue-500); }\n")
  const bad = verify(dir, "design.tokens")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /--atlas-not-a-token is not defined/)
  assert.match(bad.mismatches.join("\n"), /--atlas-blue-500 is a primitive/)
  write(dir, "app/prototypes/fixture/x.css", ".a { color: var(--atlas-foreground); }\n")
  const good = verify(dir, "design.tokens")
  assert.equal(good.status, "pass")
  assert.match(good.note, /^1 token refs in 1 files/)
}))

test("design/tokens fails when the token CSS defines nothing", () => withRepo(({ dir }) => {
  write(dir, "packages/tokens/atlas.tokens.css", "/* emptied */\n")
  assert.match(verify(dir, "design.tokens").mismatches.join("\n"), /defines no --atlas-\* tokens/)
}))

// code/token-lint
test("code/token-lint passes clean, fails a hardcoded colour, and reports files scanned", () => withRepo(({ dir }) => {
  const ok = verify(dir, "token-lint")
  assert.equal(ok.status, "pass")
  assert.ok(ok.inspected > 0)
  edit(dir, "packages/ui-web/src/primitives/Badge/Badge.module.css", (s) => s + "\n.x { color: #ff0000; }\n")
  assert.equal(verify(dir, "token-lint").status, "fail")
}))

// code/raw-design-values and code/reduced-motion-required (Phase 2d): the two metric rows read off token-lint
test("code/raw-design-values passes clean and fails a raw length and an unlisted private var", () => withRepo(({ dir }) => {
  const ok = verify(dir, "raw-design-values")
  assert.equal(ok.status, "pass", ok.mismatches?.join("\n"))
  assert.ok(ok.inspected > 0)
  edit(dir, "packages/ui-web/src/primitives/Badge/Badge.module.css", (s) => s + "\n.x { max-height: 200px; --_pad: 16px; }\n")
  const bad = verify(dir, "raw-design-values")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /\[no-raw-length\] max-height: 200px/)
  assert.match(bad.mismatches.join("\n"), /\[no-private-var-escape\] --_pad: 16px/)
}))

test("code/reduced-motion-required fails a --atlas-duration-* transition with no reduced-motion block", () => withRepo(({ dir }) => {
  const ok = verify(dir, "reduced-motion-required")
  assert.equal(ok.status, "pass", ok.mismatches?.join("\n"))
  assert.ok(ok.inspected > 0)
  write(dir, "packages/ui-web/src/primitives/Badge/Fade.module.css", ".fade { transition: opacity var(--atlas-duration-fast) var(--atlas-easing-standard); }\n")
  const bad = verify(dir, "reduced-motion-required")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /Fade\.module\.css:0 \[reduced-motion-required\]/)
}))

// code/tsc and code/tests: a one-file program and a one-file suite keep these fast and real
test("code/tsc passes a clean program, fails a type error, and counts its files", () => withRepo(({ dir }) => {
  write(dir, "tsconfig.json", JSON.stringify({ compilerOptions: { strict: true, noEmit: true, skipLibCheck: true, types: [] }, files: ["x.ts"] }))
  write(dir, "x.ts", "export const a: number = 1\n")
  const ok = verify(dir, "tsc")
  assert.equal(ok.status, "pass", ok.mismatches?.join("\n"))
  assert.ok(ok.inspected >= 1)
  write(dir, "x.ts", 'export const a: number = "one"\n')
  const bad = verify(dir, "tsc")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /error TS2322/)
}))

test("code/tests passes a passing suite, fails a failing one, and counts test files", () => withRepo(({ dir }) => {
  write(dir, "vitest.config.mjs", 'export default { test: { include: ["t/**/*.test.mjs"] } }\n')
  write(dir, "t/a.test.mjs", 'import { test, expect } from "vitest"\ntest("a", () => expect(1).toBe(1))\n')
  const ok = verify(dir, "code.tests")
  assert.equal(ok.status, "pass", ok.mismatches?.join("\n"))
  assert.equal(ok.inspected, 1)
  write(dir, "t/a.test.mjs", 'import { test, expect } from "vitest"\ntest("a", () => expect(1).toBe(2))\n')
  assert.equal(verify(dir, "code.tests").status, "fail")
}))

// code/atlas-components
test("code/atlas-components fails a raw control in app code and passes the Atlas component", () => withRepo(({ dir }) => {
  write(dir, PAGE, "export default function P() { return <button>x</button> }\n")
  const bad = verify(dir, "atlas-components")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /raw <button>/)
  write(dir, PAGE, button('variant="ghost"'))
  assert.equal(verify(dir, "atlas-components").status, "pass")
}))

// code/a11y
test("code/a11y fails an img without alt and a clickable div, passes with alt or a spread", () => withRepo(({ dir }) => {
  write(dir, PAGE, 'export default function P() { return <><img src="a.png" /><div onClick={go}>x</div></> }\n')
  const bad = verify(dir, "a11y")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /<img> without alt/)
  assert.match(bad.mismatches.join("\n"), /<div onClick> without role \+ tabIndex/)
  write(dir, PAGE, 'export default function P(p) { return <><img src="a.png" alt="" /><img {...p} /></> }\n')
  assert.equal(verify(dir, "a11y").status, "pass")
}))

// code/prototype-registered
test("code/prototype-registered fails an unregistered flow and passes once it is registered", () => withRepo(({ dir }) => {
  write(dir, "app/prototypes/_shared/flowRegistry.ts", 'export const flows = ["other"]\n')
  write(dir, PAGE, "export default function P() { return null }\n")
  const bad = verify(dir, "prototype-registered")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /app\/prototypes\/fixture is not registered/)
  write(dir, "app/prototypes/_shared/flowRegistry.ts", 'export const flows = ["other", "fixture"]\n')
  assert.equal(verify(dir, "prototype-registered").status, "pass")
}))

test("code/prototype-registered fails when the registry itself is missing", () => withRepo(({ dir }) => {
  write(dir, PAGE, "export default function P() { return null }\n")
  assert.match(verify(dir, "prototype-registered").mismatches.join("\n"), /flowRegistry\.ts is missing/)
}))

// scope/paths
test("scope/paths fails a change outside --scope and passes inside it", () => withRepo(({ dir }) => {
  write(dir, PAGE, "export default function P() { return null }\n")
  assert.equal(verify(dir, "paths", ["--scope", "packages/**"]).status, "fail")
  const ok = verify(dir, "paths", ["--scope", "app/prototypes/fixture/**"])
  assert.equal(ok.status, "pass")
  assert.equal(ok.inspected, 1)
}))

// scope/no-new-tokens
test("scope/no-new-tokens fails an added token unless --allow-new-token", () => withRepo(({ dir }) => {
  edit(dir, "packages/tokens/atlas.tokens.css", (s) => s.replace(":root {", ":root {\n  --atlas-brand-new: 1px;"))
  const bad = verify(dir, "no-new-tokens")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /--atlas-brand-new added/)
  assert.equal(verify(dir, "no-new-tokens", ["--allow-new-token"]).status, "pass")
}))

test("scope/no-new-tokens fails when --base cannot be read instead of passing silently", () => withRepo(({ dir }) => {
  assert.match(verify(dir, "no-new-tokens", ["--base", "no-such-ref"]).mismatches.join("\n"), /could not read .* at no-such-ref/)
}))

// scope/no-new-components
test("scope/no-new-components fails a new component directory unless --allow-new-component", () => withRepo(({ dir }) => {
  write(dir, "packages/ui-web/src/primitives/Zork/Zork.tsx", "export const Zork = () => null\n")
  const bad = verify(dir, "no-new-components")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /primitives\/Zork\/ is a new component/)
  assert.equal(verify(dir, "no-new-components", ["--allow-new-component"]).status, "pass")
}))

const entry = (type, aliasOf, kind = "component") => JSON.stringify({ type, aliasOf, kind, platforms: ["web"], registryComplete: false, ...(kind === "structural" ? { composedOf: ["Button"] } : {}) })

test("scope/no-new-components fails a new registry type that resolves to no component", () => withRepo(({ dir }) => {
  write(dir, "packages/registry/src/Gizmo.registry.json", entry("Gizmo", "Button"))
  const bad = verify(dir, "no-new-components")
  assert.equal(bad.status, "fail")
  assert.match(bad.mismatches.join("\n"), /registers "Gizmo", which does not resolve to an Atlas component/)
  assert.equal(verify(dir, "no-new-components", ["--allow-new-component"]).status, "pass")
}))

test("scope/no-new-components passes a new registry entry for a real component, or a structural one", () => withRepo(({ dir }) => {
  write(dir, "packages/registry/src/Badge.registry.json", entry("Badge", "Badge"))
  write(dir, "packages/registry/src/Wizard.registry.json", entry("Wizard", null, "structural"))
  const r = verify(dir, "no-new-components")
  assert.equal(r.status, "pass", r.mismatches?.join("\n"))
  assert.match(r.note, /2 registry entries added/)
}))
