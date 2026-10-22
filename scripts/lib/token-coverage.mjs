/**
 * token-coverage — Figma↔code token drift over the BOUND SUBSET only (roadmap D1, option C).
 *
 * The Figma MCP exposes variables per node, so the pull harvests `codeSyntax.WEB` from every variable
 * bound inside the component sets. That is a Figma-name→CSS-name map for the variables the components
 * actually use — not the variable table. The result is therefore a FRACTION of the code tokens
 * (`0 drift over 193/432 covered`), never a coverage claim. A variable that no component binds is
 * invisible here, so "missing Figma tokens" (a CSS token with no Figma variable) cannot be measured.
 *
 * Shared by scripts/atlas-sync.mjs (writes atlas/tokens.json `figmaBound`) and
 * scripts/metrics-report.mjs (reads it).
 */

/** `--atlas-*` names declared in atlas.tokens.css — the same parse as atlas-sync's tokens(). */
export function declaredTokens(cssText) {
  return new Set([...cssText.matchAll(/(--atlas-[\w-]+):\s*([^;]+);/g)].map((m) => m[1]))
}

/** `var(--atlas-x)` → `--atlas-x`; anything else (absent, a literal, another prefix) → null. */
export const cssNameOf = (web) => (typeof web === "string" ? web.trim().match(/^var\((--atlas-[\w-]+)\)$/)?.[1] ?? null : null)

/** The slash→dash convention: `icon/size/sm` → `--atlas-icon-size-sm`. */
export const conventionName = (figmaName) => `--atlas-${figmaName.replaceAll("/", "-")}`

/**
 * entries: [{ name, collection, type, web }] — one per bound Figma variable, `web` = codeSyntax.WEB.
 *
 * Classification, per entry:
 *   nameDrift      codeSyntax.WEB is absent or not a `var(--atlas-*)` reference, or names a token the
 *                  CSS does not declare while the slash→dash name IS declared — both sides have the
 *                  token, they disagree on its name.
 *   missingInCode  WEB is well formed, and neither it nor the slash→dash name is declared in the CSS.
 *   covered        WEB names a declared CSS token.
 * conventionExceptions lists covered entries whose WEB differs from the slash→dash name
 * (`font-family/sans` → `--atlas-font-sans`): codeSyntax is the declared mapping, so these are not
 * drift, but they are listed so the convention check the roadmap asks for can see them.
 */
export function tokenCoverage(entries, cssText) {
  const declared = declaredTokens(cssText)
  const nameDrift = [], missingInCode = [], conventionExceptions = []
  const covered = new Set()
  const variables = {}
  for (const e of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
    const css = cssNameOf(e.web)
    const conv = conventionName(e.name)
    variables[e.name] = { css, collection: e.collection ?? null, type: e.type ?? null, ...(css ? {} : { web: e.web ?? null }) }
    if (css && declared.has(css)) {
      covered.add(css)
      if (css !== conv) conventionExceptions.push({ figma: e.name, css })
    } else if (!css || declared.has(conv)) {
      nameDrift.push({ figma: e.name, web: e.web ?? null, expected: declared.has(conv) ? conv : null })
    } else {
      missingInCode.push({ figma: e.name, css })
    }
  }
  const driftCount = nameDrift.length + missingInCode.length
  return {
    coverage: {
      boundVariables: entries.length,
      codeTokens: declared.size,
      covered: covered.size,
      summary: `${driftCount} drift over ${covered.size}/${declared.size} covered`,
    },
    drift: { nameDrift, missingInCode },
    conventionExceptions,
    variables,
  }
}
