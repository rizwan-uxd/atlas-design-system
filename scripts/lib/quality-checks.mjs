// Output-quality checks shared by benchmarks/analyze.mjs and scripts/atlas-verify.mjs.
// Change a pattern here and both the benchmark and the verifier move together — keep the
// benchmark's counts comparable with the phase 0 baseline when you do.
import { execSync } from "child_process"

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
export const numericStyleLiterals = (src) => (src.match(NUMERIC_STYLE_LITERAL) || []).length
export const primitiveTokenRefs = (src) => (src.match(PRIMITIVE_TOKEN_REF) || []).length

// Lines of token-lint / tsc output that mention a path fragment.
export const tokenLintViolations = (out, fragment) => out.split("\n").filter((l) => l.includes(fragment)).length
export const tscErrors = (out, fragment) => out.split("\n").filter((l) => l.includes(fragment) && l.includes("error TS")).length

export const registered = (registrySrc, slug) => registrySrc.includes(`"${slug}"`)
