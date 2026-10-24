/**
 * token-coverage — Figma↔code token drift over the BOUND SUBSET only (roadmap D1, option C).
 *
 * The Figma MCP exposes variables per node, so the pull harvests `codeSyntax.WEB` from every variable
 * bound inside the component sets. That is a Figma-name→CSS-name map for the variables the components
 * actually use — not the variable table. The result is therefore a FRACTION of the code tokens
 * (`0 drift over 193/432 covered`), never a coverage claim. A variable that no component binds is
 * invisible here, so "missing Figma tokens" (a CSS token with no Figma variable) cannot be measured.
 *
 * Shared by scripts/atlas-sync.mjs (writes atlas/tokens.json `figmaBound` and `figmaTable`) and
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

/**
 * tableCoverage — Figma↔code token drift over the FULL variable table (roadmap D1, option B: the
 * Plugin API's getLocalVariablesAsync through use_figma). Every metric here is over the whole table and
 * the whole CSS, so no result is a fraction.
 *
 * table: { collections: [{ name, modes: [..] }], entries: [{ name, collection, type, web }], effectStyles?: [name] }
 *
 * Classification, per Figma variable:
 *   unpublished    no codeSyntax.WEB and the slash→dash name is not declared: a Figma-only variable
 *                  (the primitive colour ramps no code uses). WEB is the declared code mapping, so its
 *                  absence is intent, not drift — listed, never counted.
 *   nameDrift      WEB absent while the slash→dash name IS declared, or WEB not a `var(--atlas-*)`
 *                  reference, or WEB names an undeclared token while the slash→dash name is declared.
 *   missingInCode  WEB is well formed, and neither it nor the slash→dash name is declared.
 *   covered        WEB names a declared CSS token.
 * Per CSS token:
 *   modeExpansion  `<covered>-<mode>` for a mode of the variable's collection (Figma `columns` with
 *                  Mobile|Tablet|Desktop modes ↔ CSS `--atlas-columns-mobile|tablet|desktop`): the CSS
 *                  spells out the modes the Figma variable holds. Covered.
 *   missingInFigma declared in the CSS, and neither covered nor a mode expansion.
 * Per Figma effect style (M5.5, DEC-090 — Figma has no shadow variable):
 *   styleCoverage  `--atlas-` + the style name lowercased with / → - is declared (`shadow/md` ↔
 *                  `--atlas-shadow-md`). Covered. A style whose name maps to no token is missingInCode.
 */
export function tableCoverage(table, cssText) {
  const declared = declaredTokens(cssText)
  const modesOf = new Map(table.collections.map((c) => [c.name, c.modes]))
  const nameDrift = [], missingInCode = [], unpublished = [], conventionExceptions = [], modeExpansions = []
  const covered = new Set()
  const variables = {}
  for (const e of [...table.entries].sort((a, b) => a.name.localeCompare(b.name) || a.collection.localeCompare(b.collection))) {
    const css = cssNameOf(e.web)
    const conv = conventionName(e.name)
    variables[e.name] = { css, collection: e.collection, type: e.type, ...(css || e.web === null ? {} : { web: e.web }) }
    if (css && declared.has(css)) {
      covered.add(css)
      if (css !== conv) conventionExceptions.push({ figma: e.name, css })
      const modes = modesOf.get(e.collection) ?? []
      if (modes.length > 1) {
        for (const m of modes) {
          const expanded = `${css}-${m.toLowerCase()}`
          if (declared.has(expanded)) { covered.add(expanded); modeExpansions.push({ figma: e.name, mode: m, css: expanded }) }
        }
      }
    } else if (e.web === null && !declared.has(conv)) {
      unpublished.push(e.name)
    } else if (!css || declared.has(conv)) {
      nameDrift.push({ figma: e.name, web: e.web, expected: declared.has(conv) ? conv : null })
    } else {
      missingInCode.push({ figma: e.name, css })
    }
  }
  // M5.5 (DEC-090): Figma has no shadow variable; an effect style covers the token its name spells.
  const styleCoverage = []
  for (const style of [...(table.effectStyles ?? [])].sort()) {
    const css = `--atlas-${style.toLowerCase().replaceAll("/", "-")}`
    if (declared.has(css)) { covered.add(css); styleCoverage.push({ style, css }) }
    else missingInCode.push({ figma: style, css })
  }
  const missingInFigma = [...declared].filter((t) => !covered.has(t)).sort()
  const published = table.entries.length - unpublished.length
  return {
    coverage: {
      figmaVariables: table.entries.length,
      published,
      codeTokens: declared.size,
      covered: covered.size,
      summary: `${nameDrift.length} name drift · ${missingInCode.length} missing in code · ${missingInFigma.length} missing in Figma · ${covered.size}/${declared.size} code tokens covered`,
    },
    drift: { nameDrift, missingInCode, missingInFigma },
    modeExpansions,
    conventionExceptions,
    unpublished,
    styleCoverage,
    variables,
  }
}
