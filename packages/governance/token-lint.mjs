#!/usr/bin/env node
/**
 * Atlas Design System — Token Governance Lint
 *
 * Walks packages/ui-web/src/ and app/ for hardcoded colour/spacing values
 * that should reference --atlas-* CSS custom properties instead.
 *
 * Rules:
 *   1. No hex colour literals (#abc, #aabbcc, #aabbccdd)
 *   2. No rgb() / rgba() calls (outside packages/tokens/)
 *   3. No oklch() calls (outside packages/tokens/)
 *   4. No hsl() / hsla() calls (outside packages/tokens/)
 *   5. Component tokens alias semantic tokens (the one exception is --atlas-card-filled-background-hover)
 *   6. Pattern examples (packages/governance/patterns/examples) set token typography on every
 *      heading (<h1>-<h6>) and paragraph (<p>): the tag carries a style whose font size is an
 *      --atlas-text-* or --atlas-font-size-* token, inline or through a style object in the same file
 *   Phase 2d (rules in scripts/lib/token-rules.mjs):
 *   7. no-private-var-escape — a --_ private var is one var(--atlas-<semantic>), or is listed with a
 *      reason in packages/governance/private-vars.allow.json
 *   8. no-raw-length — no hardcoded length in packages/ui-web/src (not @media, em, or visually-hidden 1px)
 *   9. breakpoint-literal-consistency — --atlas-breakpoint-*, @theme --breakpoint-* and @media widths agree
 *  10. reduced-motion-required — component CSS using --atlas-duration-* or a motion role has a prefers-reduced-motion block
 *  M5.1:
 *  11. semantic-radius — component CSS and component-token aliases use a radius role
 *      (item|control|surface|pill); a primitive step is listed with a reason and its exact count in
 *      packages/governance/token-primitives.allow.json
 *  M5.2:
 *  12. semantic-spacing — inside spacing properties (padding, margin, gap, inset, outline-offset, and
 *      custom properties named for spacing) component CSS and component-token aliases use a spacing
 *      role; a primitive step is listed with a reason and its exact count in the same allowlist.
 *      Width, height and other dimension uses are out of scope (DEC-087)
 *  M5.3:
 *  13. semantic-type — a component font-size names a type role, a component font-size token or a private
 *      var; a step of --atlas-font-size-* or --atlas-text-* is listed with a reason and exact count (DEC-088)
 *  M5.4:
 *  14. semantic-motion — component motion names a motion role; a primitive duration or easing is listed
 *      with a reason and exact count (DEC-089). --atlas-duration-instant (reduced-motion off switch) is exempt
 *  M5.5:
 *  15. semantic-shadow — a component shadow names a shadow role or a component token; a size step
 *      (--atlas-shadow-sm|md|lg|xl) is listed with a reason and exact count (DEC-090)
 *
 * Allow-list:
 *   - Lines containing "token-lint-disable-next-line" suppress the NEXT line only.
 *   - Files in packages/tokens/ are always skipped.
 *   - Test files (*.test.*) and governance scripts are skipped.
 *   - Storybook / example files are skipped.
 *   - app/prototypes/<slug>/brand.ts is the one scoped colour exception (DEC-008): a cloned
 *     prototype keeps its brand colours there and nowhere else. Brand files are listed in the
 *     report so the exception stays visible. _shared/ never qualifies.
 *
 * Usage:
 *   node packages/governance/token-lint.mjs
 *   node packages/governance/token-lint.mjs --json  (machine-readable: violations + per-rule inspected counts)
 *
 * Exit codes:
 *   0  — no violations
 *   1  — violations found
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { BEGIN, lintComponentTokens } from "../../scripts/lib/component-tokens.mjs"
import { privateVarViolations, rawLengths, breakpointViolations, reducedMotionMissing, semanticRadiusViolations, semanticSpacingViolations, semanticTypeViolations, semanticMotionViolations, semanticShadowViolations } from "../../scripts/lib/token-rules.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "../..")

// ─── Config ──────────────────────────────────────────────────────────────────

const SCAN_DIRS = [
  path.join(ROOT, "packages/ui-web/src"),
  path.join(ROOT, "app"),
]

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "packages/tokens",
  "packages/governance",
])

const SKIP_FILE_PATTERNS = [
  /\.test\.[tj]sx?$/,
  /\.spec\.[tj]sx?$/,
  /\.stories\.[tj]sx?$/,
  /vitest\.config/,
]

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".css"])

// Mirrors BRAND_FILE in scripts/lib/quality-checks.mjs
const BRAND_FILE = /^app\/prototypes\/(?!_)[^/]+\/brand\.ts$/

// ─── Rules ───────────────────────────────────────────────────────────────────

const RULES = [
  {
    id: "no-hex-color",
    description: "Hardcoded hex colour — use an --atlas-* token instead",
    // Matches #RGB, #RGBA, #RRGGBB, #RRGGBBAA after whitespace, : , ( = or an opening quote/backtick,
    // so CSS values, JS strings ("#fff") and JSX attributes (fill="#fff") are all caught.
    // Not matched: // line comments, and a hex-like run that continues into a word (#fade-in).
    pattern: /(?<![/]{2}[^\n]*)(?:^|[\s:,(="'`])(#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4}))(?![\w-])/,
    // Skip pure CSS selector lines (e.g. #app {) and block-comment lines
    skip: (line) => /^#[\w-]+\s*[{,]/.test(line.trim()) || /^(\/\*|\*)/.test(line.trim()),
  },
  {
    id: "no-rgb",
    description: "Hardcoded rgb()/rgba() — use an --atlas-* token instead",
    pattern: /\brgba?\s*\(/,
    skip: () => false,
  },
  {
    id: "no-oklch-raw",
    description: "Raw oklch() outside tokens package — use an --atlas-* token instead",
    pattern: /\boklch\s*\(/,
    // Allow oklch(1 0 0) / oklch(0 0 0) — achromatic white/black anchors used
    // legitimately inside color-mix() as neutral mix targets. Any chroma (C > 0)
    // would indicate a hardcoded brand colour that should become a token.
    skip: (line) => /\bcolor-mix\(in\s+oklch,/.test(line) &&
                    /oklch\(\s*[01]\.?\d*\s+0\s+0\s*\)/.test(line),
  },
  {
    id: "no-hsl",
    description: "Hardcoded hsl()/hsla() — use an --atlas-* token instead",
    pattern: /\bhsla?\s*\(/,
    skip: () => false,
  },
]

// ─── Walker ──────────────────────────────────────────────────────────────────

function* walkFiles(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const rel = path.relative(ROOT, fullPath)
      if ([...SKIP_DIRS].some((d) => rel.startsWith(d) || entry.name === d)) continue
      yield* walkFiles(fullPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (!SCAN_EXTENSIONS.has(ext)) continue
      if (SKIP_FILE_PATTERNS.some((p) => p.test(entry.name))) continue
      yield fullPath
    }
  }
}

// ─── Lint ────────────────────────────────────────────────────────────────────

const violations = []
const brandFiles = []
const sources = [] // { file (posix, repo-relative), src } for the Phase 2d rules
const JSON_OUT = process.argv.includes("--json")

let scanned = 0
for (const dir of SCAN_DIRS) {
  for (const filePath of walkFiles(dir)) {
    scanned++
    const rel = path.relative(ROOT, filePath)
    if (BRAND_FILE.test(rel.split(path.sep).join("/"))) {
      brandFiles.push(rel)
      continue
    }
    const text = fs.readFileSync(filePath, "utf8")
    sources.push({ file: rel.split(path.sep).join("/"), src: text })
    const lines = text.split("\n")

    let suppressNext = false
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNo = i + 1

      if (line.includes("token-lint-disable-next-line")) {
        suppressNext = true
        continue
      }

      if (suppressNext) {
        suppressNext = false
        continue
      }

      for (const rule of RULES) {
        if (rule.skip(line)) continue
        if (rule.pattern.test(line)) {
          violations.push({ file: rel, line: lineNo, rule: rule.id, text: line.trim() })
        }
      }
    }
  }
}

// ─── Pattern examples (typography rule) ──────────────────────────────────────

const EXAMPLES_DIR = path.join(ROOT, "packages/governance/patterns/examples")
const TYPE_TOKEN = /--atlas-(?:text|font-size)-[\w-]+/
const TEXT_TAG = /<(h[1-6]|p)(?=[\s>])([^>]*)>/g

// style objects in the file whose body sets a typography token, e.g. `const title = { fontSize: "var(--atlas-text-h1)" }`
function typedStyleNames(src) {
  const names = new Set()
  for (const m of src.matchAll(/(?:const|let)\s+(\w+)\s*(?::[^=]+)?=\s*\{([^}]*)\}/g)) {
    if (TYPE_TOKEN.test(m[2])) names.add(m[1])
  }
  return names
}

function hasTokenTypography(attrs, typed) {
  const style = attrs.match(/style=\{([\s\S]*)\}\s*$/)
  if (!style) return false
  const body = style[1]
  if (TYPE_TOKEN.test(body)) return true
  return [...typed].some((name) => new RegExp(`(?:^|[{\\s,.])(?:\\.\\.\\.)?${name}\\b`).test(body))
}

if (fs.existsSync(EXAMPLES_DIR)) {
  for (const name of fs.readdirSync(EXAMPLES_DIR)) {
    if (!/\.tsx?$/.test(name)) continue
    const filePath = path.join(EXAMPLES_DIR, name)
    const src = fs.readFileSync(filePath, "utf8")
    const typed = typedStyleNames(src)
    for (const m of src.matchAll(TEXT_TAG)) {
      if (hasTokenTypography(m[2], typed)) continue
      const line = src.slice(0, m.index).split("\n").length
      violations.push({
        file: path.relative(ROOT, filePath),
        line,
        rule: "pattern-example-typography",
        text: `<${m[1]}> has no token typography; set a font size from an --atlas-text-* or --atlas-font-size-* token`,
      })
    }
  }
}

// ─── Component tokens (alias-only rule) ─────────────────────────────────────

const TOKEN_CSS_PATH = path.join(ROOT, "packages/tokens/atlas.tokens.css")
if (fs.existsSync(TOKEN_CSS_PATH)) {
  const tokenCss = fs.readFileSync(TOKEN_CSS_PATH, "utf8")
  // the layer is optional until the block exists; once present it is always checked
  if (tokenCss.includes(BEGIN)) {
    for (const message of lintComponentTokens(tokenCss)) {
      violations.push({ file: "packages/tokens/atlas.tokens.css", line: 0, rule: "component-token-alias", text: message })
    }
  }
}

// ─── Phase 2d rules (scripts/lib/token-rules.mjs) ───────────────────────────

const UI_SRC = "packages/ui-web/src/"
const TOKEN_REL = "packages/tokens/atlas.tokens.css"
const ALLOW_REL = "packages/governance/private-vars.allow.json"
const css = sources.filter((s) => s.file.endsWith(".css"))
const componentCss = css.filter((s) => s.file.startsWith(UI_SRC))
const componentSrc = sources.filter((s) => s.file.startsWith(UI_SRC))
const inspected = {}
const add = (rule) => (v) => violations.push({ file: v.file, line: v.line, rule, text: v.text })

const allow = JSON.parse(fs.readFileSync(path.join(ROOT, ALLOW_REL), "utf8")).entries
const pv = privateVarViolations(css, allow)
pv.violations.forEach(add("no-private-var-escape"))
inspected["no-private-var-escape"] = pv.inspected

for (const { file, src } of componentSrc) {
  const lines = src.split("\n")
  for (const l of rawLengths(src)) {
    if (lines[l.line - 2]?.includes("token-lint-disable-next-line")) continue
    violations.push({ file, line: l.line, rule: "no-raw-length", text: `${l.prop}: ${l.value} — hardcoded length; use a spacing/size/radius/type token` })
  }
}
inspected["no-raw-length"] = componentSrc.length

const tokenCss = fs.readFileSync(TOKEN_CSS_PATH, "utf8")
const bp = breakpointViolations(tokenCss, [{ file: TOKEN_REL, src: tokenCss }, ...css])
bp.violations.forEach(add("breakpoint-literal-consistency"))
inspected["breakpoint-literal-consistency"] = bp.inspected

const animated = componentCss.filter((s) => /--atlas-(?:duration|motion)-/.test(s.src))
for (const { file, src } of animated) {
  if (reducedMotionMissing(src)) violations.push({ file, line: 0, rule: "reduced-motion-required", text: "uses --atlas-duration-* or a motion role with no @media (prefers-reduced-motion) block" })
}
inspected["reduced-motion-required"] = animated.length

// semantic-radius (M5.1): the token file contributes only its component-token radius declarations
// (--atlas-<component>-…radius…); the primitive steps and the roles themselves are declared there legally.
// Other lines are blanked, not dropped, so reported line numbers stay right.
const componentTokenRadius = tokenCss.split("\n").map((l) => (/^\s*--atlas-(?!radius-)[\w-]*radius[\w-]*\s*:/.test(l) ? l : "")).join("\n")
const primitivesAllow = JSON.parse(fs.readFileSync(path.join(ROOT, "packages/governance/token-primitives.allow.json"), "utf8")).entries
const sr = semanticRadiusViolations([...componentCss, { file: TOKEN_REL, src: componentTokenRadius }], primitivesAllow)
sr.violations.forEach(add("semantic-radius"))
inspected["semantic-radius"] = sr.inspected

// semantic-spacing (M5.2): the token file contributes only its component-token spacing declarations
// (--atlas-<component>-…padding|gap|margin|offset…); the steps, the roles and the layout gutter/margin tokens
// are declared there legally. Other lines are blanked, not dropped, so reported line numbers stay right.
const componentTokenSpacing = tokenCss.split("\n").map((l) => (/^\s*--atlas-(?!spacing-|gutter-|margin-)[\w-]*(?:padding|gap|margin|offset)[\w-]*\s*:/.test(l) ? l : "")).join("\n")
const ss = semanticSpacingViolations([...componentCss, { file: TOKEN_REL, src: componentTokenSpacing }], primitivesAllow)
ss.violations.forEach(add("semantic-spacing"))
inspected["semantic-spacing"] = ss.inspected

// semantic-type (M5.3): component CSS only; the token file declares the scales and roles legally.
const st = semanticTypeViolations(componentCss, primitivesAllow)
st.violations.forEach(add("semantic-type"))
inspected["semantic-type"] = st.inspected

// semantic-motion (M5.4): component CSS only.
const sm = semanticMotionViolations(componentCss, primitivesAllow)
sm.violations.forEach(add("semantic-motion"))
inspected["semantic-motion"] = sm.inspected

// semantic-shadow (M5.5): component CSS only.
const sh = semanticShadowViolations(componentCss, primitivesAllow)
sh.violations.forEach(add("semantic-shadow"))
inspected["semantic-shadow"] = sh.inspected

// ─── Report ──────────────────────────────────────────────────────────────────

violations.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1))

if (JSON_OUT) {
  console.log(JSON.stringify({ scanned, inspected, brandFiles, violations }, null, 2))
  process.exitCode = violations.length ? 1 : 0
} else report()

function report() {
  if (brandFiles.length) console.log(`Brand colour exceptions (DEC-008): ${brandFiles.join(", ")}`)

  if (violations.length === 0) {
    console.log(`✅ Token lint: 0 violations (scanned ${scanned} files)`)
    process.exit(0)
  }
  console.error(`❌ Token lint: ${violations.length} violation${violations.length === 1 ? "" : "s"} found (scanned ${scanned} files)\n`)
  let lastFile = null
  for (const v of violations) {
    if (v.file !== lastFile) {
      console.error(`  ${v.file}`)
      lastFile = v.file
    }
    console.error(`    [${v.rule}] line ${v.line}: ${v.text.slice(0, 120)}`)
  }
  console.error(`
To suppress a single line, add a comment on the preceding line:
  /* token-lint-disable-next-line */
`)
  process.exit(1)
}
