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
 *   node packages/governance/token-lint.mjs --fix   (future — not yet implemented)
 *
 * Exit codes:
 *   0  — no violations
 *   1  — violations found
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { BEGIN, lintComponentTokens } from "../../scripts/lib/component-tokens.mjs"

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

for (const dir of SCAN_DIRS) {
  for (const filePath of walkFiles(dir)) {
    const rel = path.relative(ROOT, filePath)
    if (BRAND_FILE.test(rel.split(path.sep).join("/"))) {
      brandFiles.push(rel)
      continue
    }
    const lines = fs.readFileSync(filePath, "utf8").split("\n")

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

// ─── Report ──────────────────────────────────────────────────────────────────

if (brandFiles.length) console.log(`Brand colour exceptions (DEC-008): ${brandFiles.join(", ")}`)

if (violations.length === 0) {
  console.log("✅ Token lint: 0 violations")
  process.exit(0)
} else {
  console.error(`❌ Token lint: ${violations.length} violation${violations.length === 1 ? "" : "s"} found\n`)
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
