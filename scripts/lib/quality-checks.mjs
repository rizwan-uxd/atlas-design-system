// Output-quality checks shared by benchmarks/analyze.mjs and scripts/atlas-verify.mjs.
// Change a pattern here and both the benchmark and the verifier move together — keep the
// benchmark's counts comparable with the phase 0 baseline when you do.
import { execSync } from "child_process"
import ts from "typescript"

// Run a command in cwd; never throws. Returns { ok, out } with stdout+stderr on failure.
export const sh = (cmd, cwd, timeout = 180000) => {
  try {
    return { ok: true, out: execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout }) }
  } catch (e) {
    return { ok: false, out: (e.stdout || "") + (e.stderr || "") }
  }
}

export const ATLAS_IMPORT = /import\s*\{([^}]+)\}\s*from\s*["'](@atlas\/ui-web[^"']*)["']/g
export const RAW_ELEMENT = /<(button|input|textarea|dialog|select)[\s>]/g
export const NUMERIC_STYLE_LITERAL = /:\s*["']?(?!0["',\s}])\d+(\.\d+)?(px|rem)?["']?\s*(?=[,}\n])/g
export const PRIMITIVE_TOKEN_REF = /--atlas-(blue|gray|grey|red|green|amber|yellow|neutral|slate)-\d+/g
// The one scoped colour exception (DEC-008): a prototype's own brand.ts. Mirrored in packages/governance/token-lint.mjs.
export const BRAND_FILE = /^app\/prototypes\/(?!_)[^/]+\/brand\.ts$/

// Names imported from @atlas/ui-web, deduplicated, aliases resolved to the exported name.
export const atlasImports = (src) =>
  [...new Set([...src.matchAll(ATLAS_IMPORT)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(" as ")[0])).filter(Boolean))]

// A component counts as covered if its root or any sub-part is imported (Tabs → TabsRoot/TabsList/TabsTrigger).
export const coverage = (expected, imported) =>
  `${expected.filter((c) => imported.some((i) => i === c || i.startsWith(c))).length}/${expected.length}`

export const rawElements = (src) => (src.match(RAW_ELEMENT) || []).length
// Benchmark metric only — kept as-is so results stay comparable with the phase 0 baseline.
export const numericStyleLiterals = (src) => (src.match(NUMERIC_STYLE_LITERAL) || []).length

// atlas-verify's check: a hardcoded length on a property that has spacing/size/radius/type tokens.
// Unitless properties (flex, opacity, zIndex, fontWeight, lineHeight, order) and data fields are not
// length properties, so `flex: 1` and `tipPercent: 15` never match. %, fr, vh/vw and calc() multipliers pass.
const LENGTH_PROP = /(?<![\w-])((?:padding|margin|inset|gap|rowGap|columnGap|row-gap|column-gap|width|height|min-?[wW]idth|max-?[wW]idth|min-?[hH]eight|max-?[hH]eight|top|right|bottom|left|fontSize|font-size|letterSpacing|letter-spacing|borderRadius|border-radius|borderWidth|border-width|outlineOffset|outline-offset)(?:[A-Z]\w*|-[\w-]+)?)\s*:\s*(["'`]?)([^;,}\n"'`]*)\2/g
const LENGTH_VALUE = /^-?[1-9]\d*(\.\d+)?$|^-?0?\.\d*[1-9]\d*$|(?<![\w.-])-?(?:\d*\.)?\d*[1-9]\d*(?:px|rem|em)\b/

export const lengthLiterals = (src) =>
  [...src.matchAll(LENGTH_PROP)]
    .filter((m) => LENGTH_VALUE.test(m[3].trim()))
    .map((m) => ({ index: m.index, prop: m[1], value: m[3].trim() }))
export const primitiveTokenRefs = (src) => (src.match(PRIMITIVE_TOKEN_REF) || []).length

// Lines of token-lint / tsc output that mention a path fragment.
export const tokenLintViolations = (out, fragment) => out.split("\n").filter((l) => l.includes(fragment)).length
export const tscErrors = (out, fragment) => out.split("\n").filter((l) => l.includes(fragment) && l.includes("error TS")).length

export const registered = (registrySrc, slug) => registrySrc.includes(`"${slug}"`)

// ─── JSX scanning (atlas-verify's variants-sizes, deprecated-usage and a11y checks) ───
//
// Built on the TypeScript parser, not a regex. Until M2 this was a character scanner with no tests, and
// its first tests showed what that cost: a tag inside a string or a comment was reported as a real use,
// a generic like useState<Button>() in a .ts file was a tag, and `variant={v}` read as "no variant" —
// so a check could neither be trusted to find a problem nor to know it had not looked.

export const lineOf = (src, index) => src.slice(0, index).split("\n").length

/** A prop whose value cannot be known statically: an expression, a boolean shorthand, or a later spread. */
export const UNKNOWN = Symbol("unknown")

const parsed = new Map()
const sourceFile = (src, file) => {
  const key = `${file}\0${src}`
  if (!parsed.has(key)) {
    if (parsed.size > 64) parsed.clear()
    const kind = /\.ts$/.test(file) ? ts.ScriptKind.TS : /\.jsx$/.test(file) ? ts.ScriptKind.JSX : ts.ScriptKind.TSX
    parsed.set(key, ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind))
  }
  return parsed.get(key)
}

const staticValue = (init) => {
  if (!init) return UNKNOWN // <Button variant /> is `true`, not a member name
  if (ts.isStringLiteral(init)) return init.text
  if (ts.isJsxExpression(init) && init.expression && (ts.isStringLiteral(init.expression) || ts.isNoSubstitutionTemplateLiteral(init.expression)))
    return init.expression.text
  return UNKNOWN
}

/**
 * Every opening or self-closing <local ...> element in src, in source order. Each tag carries its line,
 * its attribute text, and its own attributes only — a descendant inside a JSX-valued prop is a separate
 * element, never part of its parent. `file` picks the grammar: a .ts file has no JSX, so `<T>` there is
 * a generic or a cast.
 * @returns {Iterable<{ line: number, attrs: string, props: Map<string, string|symbol>, spreads: number[], has(name): boolean|symbol }>}
 */
export function* jsxTags(src, local, file = "file.tsx") {
  const sf = sourceFile(src, file)
  const found = []
  const visit = (node) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ts.isIdentifier(node.tagName) && node.tagName.text === local) {
      const props = new Map(), order = new Map(), spreads = []
      node.attributes.properties.forEach((a, i) => {
        if (ts.isJsxSpreadAttribute(a)) spreads.push(i)
        else { const name = a.name.getText(sf); props.set(name, staticValue(a.initializer)); order.set(name, i) }
      })
      const lastSpread = spreads.length ? spreads[spreads.length - 1] : -1
      // a spread after the attribute (or with no attribute at all) may supply or override it
      const overridden = (name) => lastSpread > (order.has(name) ? order.get(name) : -1)
      found.push({
        line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
        attrs: node.attributes.getText(sf),
        props, spreads,
        value: (name) => (overridden(name) ? UNKNOWN : props.get(name)),
        has: (name) => (props.has(name) ? true : overridden(name) ? UNKNOWN : false),
      })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  yield* found
}

/** The static value of `prop` on a tag from jsxTags: a string, UNKNOWN, or undefined when absent. */
export const literalProp = (tag, prop) => tag.value(prop)
