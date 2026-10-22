// The JSX scanner behind three atlas-verify checks (variants-sizes, deprecated-usage, a11y). Before M2
// it had no tests, so a parser bug silently turned those checks into no-ops that still printed PASS.
// Each case is a shape that exists in, or could plausibly enter, app/ and packages/ui-web/src.
import { test } from "node:test"
import assert from "node:assert/strict"
import * as qc from "../lib/quality-checks.mjs"

const { jsxTags, literalProp, UNKNOWN } = qc

/** The value of `prop` on every <local> tag in src, in source order. */
const values = (src, local, prop = "variant") => [...jsxTags(src, local)].map((t) => literalProp(t, prop))
const lines = (src, local) => [...jsxTags(src, local)].map((t) => t.line)

test("UNKNOWN is a distinct sentinel, never undefined or a string", () => {
  assert.equal(typeof UNKNOWN, "symbol")
})

// ─── literal forms ──────────────────────────────────────────────────────────

test("variant=\"x\", variant='x', variant={\"x\"} and variant={`x`} are all the literal x", () => {
  const src = `<>
    <Button variant="a" />
    <Button variant='b' />
    <Button variant={"c"} />
    <Button variant={ 'd' } />
    <Button variant={\`e\`} />
  </>`
  assert.deepEqual(values(src, "Button"), ["a", "b", "c", "d", "e"])
})

test("an absent prop is undefined, not UNKNOWN", () => {
  assert.deepEqual(values(`<Button size="sm">x</Button>`, "Button"), [undefined])
})

test("an expression is UNKNOWN, not absent — the check cannot see it, and must say so", () => {
  const src = `<>
    <Button variant={v} />
    <Button variant={on ? "primary" : "ghost"} />
    <Button variant={\`\${tone}-x\`} />
    <Button variant />
  </>`
  assert.deepEqual(values(src, "Button"), [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN])
})

test("a spread after the prop may override it, so the value is UNKNOWN", () => {
  assert.deepEqual(values(`<Button variant="primary" {...rest} />`, "Button"), [UNKNOWN])
})

test("a spread with no explicit prop is UNKNOWN", () => {
  assert.deepEqual(values(`<Button {...props}>x</Button>`, "Button"), [UNKNOWN])
})

test("an explicit prop after the spread wins, so it is the literal", () => {
  assert.deepEqual(values(`<Button {...rest} variant="ghost" />`, "Button"), ["ghost"])
})

test("data-variant and aria-variant are not variant", () => {
  assert.deepEqual(values(`<Button data-variant="x" aria-variant="y" />`, "Button"), [undefined])
})

// ─── tag shapes ─────────────────────────────────────────────────────────────

test("self-closing and open/close tags are both found, with their lines", () => {
  const src = `const a = <Button variant="a" />\nconst b = <Button variant="b">x</Button>\n`
  assert.deepEqual(values(src, "Button"), ["a", "b"])
  assert.deepEqual(lines(src, "Button"), [1, 2])
})

test("multi-line attributes are read, and the line is the opening tag's", () => {
  const src = `\n<Button\n  size="sm"\n  variant="outline"\n  onClick={() => go(1 > 0)}\n>\n  Go\n</Button>`
  assert.deepEqual(values(src, "Button"), ["outline"])
  assert.deepEqual(lines(src, "Button"), [2])
})

test("nested tags of the same component are each found once with their own props", () => {
  const src = `<Button variant="outer"><span><Button variant="inner" /></span></Button>`
  assert.deepEqual(values(src, "Button"), ["outer", "inner"])
})

test("a descendant inside a JSX-valued prop is not attributed to the parent", () => {
  const src = `<Alert actions={<Button variant="outline">Undo</Button>} variant="info" />`
  assert.deepEqual(values(src, "Alert"), ["info"])
  assert.deepEqual(values(src, "Button"), ["outline"])
})

test("a JSX-valued prop with no own variant leaves the parent's undefined", () => {
  assert.deepEqual(values(`<Card footer={<Button variant="ghost" />} />`, "Card"), [undefined])
})

test("tags inside fragments are found", () => {
  assert.deepEqual(values(`<><Button variant="a" /><React.Fragment><Button variant="b" /></React.Fragment></>`, "Button"), ["a", "b"])
})

test("a longer component name is not the shorter one", () => {
  assert.deepEqual(values(`<ButtonGroup variant="x"><Button variant="y" /></ButtonGroup>`, "Button"), ["y"])
})

test("a member tag like <Tabs.List> is not <Tabs>", () => {
  assert.deepEqual(values(`<Tabs.List variant="x" />`, "Tabs"), [])
})

// ─── text that only looks like JSX ──────────────────────────────────────────

test("a JS string containing a tag is not a tag", () => {
  const src = `const s = '<Button variant="bad">'\nconst t = "<Button variant='bad' />"\nconst u = <Button variant="good" />`
  assert.deepEqual(values(src, "Button"), ["good"])
})

test("a comment containing a tag is not a tag", () => {
  const src = `// <Button variant="bad" />\n/* <Button variant="bad2"> */\nconst u = <Button variant="good" />`
  assert.deepEqual(values(src, "Button"), ["good"])
})

test("a comment inside the attributes does not supply or hide a prop", () => {
  const src = `<Button /* variant="ghost" > */ variant="primary" />\n<Button {/* variant="x" */ ...{}} />`
  assert.deepEqual(values(src, "Button").slice(0, 1), ["primary"])
})

test("a string attribute containing > or { does not end the tag early", () => {
  const src = `<Button title="a > b {c}" variant="primary" />`
  assert.deepEqual(values(src, "Button"), ["primary"])
})

test("an arrow function in an attribute does not end the tag", () => {
  const src = `<Button onClick={() => (a > b ? 1 : 2)} variant="primary" />`
  assert.deepEqual(values(src, "Button"), ["primary"])
})

test("JSX text with an apostrophe does not hide the tags after it", () => {
  const src = `<p>Don't stop</p>\n<Button variant="primary" />`
  assert.deepEqual(values(src, "Button"), ["primary"])
})

test("a generic in a .ts file is not a tag", () => {
  const src = `const x = useState<Button>(null)\nfunction f<Button>(a: Button) { return a }`
  assert.deepEqual([...jsxTags(src, "Button", "x.ts")].length, 0)
})

// ─── what a11y needs ────────────────────────────────────────────────────────

test("a tag reports which attributes it has, including boolean shorthand", () => {
  const [tag] = jsxTags(`<img src="a.png" hidden />`, "img")
  assert.equal(tag.has("src"), true)
  assert.equal(tag.has("hidden"), true)
  assert.equal(tag.has("alt"), false)
})

test("an attribute of a nested element is not an attribute of its parent", () => {
  const [tag] = jsxTags(`<div icon={<img alt="x" />} onClick={go} />`, "div")
  assert.equal(tag.has("alt"), false)
  assert.equal(tag.has("onClick"), true)
})

test("a spread may supply any attribute, so has() is UNKNOWN-aware", () => {
  const [tag] = jsxTags(`<img {...imgProps} />`, "img")
  assert.equal(tag.has("alt"), UNKNOWN)
})
