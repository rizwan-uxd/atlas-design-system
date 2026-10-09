// Pure helpers for the component-token layer in packages/tokens/atlas.tokens.css (no I/O).
// Rule: a component token aliases a semantic token. The single exception is CARD_EXCEPTION.

export const COMPONENTS = ["button", "input", "card"]
export const BEGIN = "/* BEGIN:component-tokens */"
export const END = "/* END:component-tokens */"
export const SECTION_BEGIN = "<!-- BEGIN:generated-component-tokens -->"
export const SECTION_END = "<!-- END:generated-component-tokens -->"

// Card interactive filled hover preserves the existing computed value until a proper semantic
// token is approved (spec: docs/superpowers/specs/2026-10-09-component-tokens-design.md).
export const CARD_EXCEPTION = {
  name: "--atlas-card-filled-background-hover",
  value: "color-mix(in oklch, var(--atlas-background-muted) 80%, oklch(1 0 0))",
}

const PRIMITIVE = /^--atlas-(color-|(blue|gray|grey|red|green|amber|yellow|neutral|slate)-\d+)/
const COMPONENT_NAME = new RegExp(`^--atlas-(${COMPONENTS.join("|")})-[a-z0-9]+(-[a-z0-9]+)*$`)
const COMPONENT_PREFIX = new RegExp(`^--atlas-(${COMPONENTS.join("|")})-`)
const ALIAS = /^var\((--atlas-[\w-]+)\)$/
const lineAt = (css, index) => css.slice(0, index).split("\n").length
const squash = (s) => s.replace(/\s+/g, " ").trim()
// blank out comments but keep newlines so line numbers stay right
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))

export function extractComponentBlock(css) {
  const b = css.indexOf(BEGIN), e = css.indexOf(END)
  if (b === -1 || e === -1 || e < b) return null
  const inner = css.slice(b + BEGIN.length, e)
  const open = inner.indexOf("{"), close = inner.lastIndexOf("}")
  if (open === -1 || close === -1) return null
  return { selector: inner.slice(0, open).trim(), body: inner.slice(open + 1, close), bodyOffset: b + BEGIN.length + open + 1 }
}

export function parseComponentTokens(css) {
  const block = extractComponentBlock(css)
  if (!block) return []
  const body = stripComments(block.body)
  return [...body.matchAll(/(--atlas-[\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/g)].map((m) => ({
    name: m[1],
    value: squash(m[2]),
    line: lineAt(css, block.bodyOffset + m.index),
  }))
}

export function lintComponentTokens(css) {
  const block = extractComponentBlock(css)
  if (!block) return ["no component-token block (expected /* BEGIN:component-tokens */ … /* END:component-tokens */)"]
  const out = []
  const sel = squash(block.selector)
  for (const need of [":root", '[data-theme="dark"]', ".dark"]) {
    if (!sel.includes(need)) out.push(`selector "${sel}" must include ${need} so every theme scope re-resolves the aliases`)
  }
  const seen = new Set()
  for (const t of parseComponentTokens(css)) {
    const at = `line ${t.line} ${t.name}`
    if (seen.has(t.name)) out.push(`${at}: duplicate`)
    seen.add(t.name)
    if (!COMPONENT_NAME.test(t.name)) { out.push(`${at}: name must be --atlas-(${COMPONENTS.join("|")})-<…>`); continue }
    if (t.name === CARD_EXCEPTION.name) {
      if (t.value !== CARD_EXCEPTION.value) out.push(`${at}: the approved exception must keep exactly ${CARD_EXCEPTION.value}`)
      continue
    }
    const alias = t.value.match(ALIAS)
    if (!alias) { out.push(`${at}: must be var(--atlas-<semantic>), got "${t.value}"`); continue }
    if (PRIMITIVE.test(alias[1])) out.push(`${at}: aliases a primitive (${alias[1]}) — use a semantic token`)
    else if (COMPONENT_PREFIX.test(alias[1])) out.push(`${at}: aliases another component token (${alias[1]}) — alias a semantic token`)
  }
  // no component token may be defined anywhere else in the file
  const outside = css.slice(0, css.indexOf(BEGIN)) + css.slice(css.indexOf(END) + END.length)
  for (const m of stripComments(outside).matchAll(new RegExp(`(--atlas-(?:${COMPONENTS.join("|")})-[\\w-]+)\\s*:`, "g"))) {
    out.push(`${m[1]} is defined outside the component-token block`)
  }
  return out
}

const title = (c) => c[0].toUpperCase() + c.slice(1)

export function renderComponentSection(css) {
  const tokens = parseComponentTokens(css)
  if (!tokens.length) return ""
  const lines = [
    SECTION_BEGIN,
    "",
    "## Component tokens (Atlas implementation tokens)",
    "",
    "These name the visual decisions inside Atlas components. They exist for implementing and documenting Atlas components, and every one aliases a semantic token above. Product code and prototypes use the semantic tokens; reach for a component token only when styling or wrapping an Atlas component.",
  ]
  for (const c of COMPONENTS) {
    const mine = tokens.filter((t) => t.name.startsWith(`--atlas-${c}-`))
    if (!mine.length) continue
    lines.push("", `### ${title(c)}`, mine.map((t) => {
      const alias = t.value.match(ALIAS)
      return `\`${t.name.slice(8)}\` → ${alias ? `\`${alias[1].slice(8)}\`` : `\`${t.value}\``}`
    }).join(" · "))
  }
  lines.push(SECTION_END)
  return lines.join("\n")
}
