// Strict pattern-adherence checks (Wave 1). Each check encodes one Decision rule or Anti-pattern from
// packages/governance/patterns/<pattern>.md, as a regex over the prototype's source.
//
// Disclosure: these were written AFTER the baseline-w1 runs (the loose `patternChecks` were at ceiling),
// and they are derived from the pattern docs, so they measure adherence to the patterns by definition.
// The same scorer is applied to both arms; baseline outputs were re-scored with it (benchmarks/rescore.mjs).
// type: "match" passes when the pattern occurs, "absent" when it does not.
export const scoreStrict = (src, checks) => {
  const results = checks.map((c) => {
    const hits = (src.match(new RegExp(c.pattern, `${c.flags || ""}g`)) || []).length
    return { id: c.id, rule: c.rule, pass: c.type === "absent" ? hits === 0 : hits > 0 }
  })
  const passed = results.filter((r) => r.pass).length
  return { passed, total: results.length, fraction: results.length ? +(passed / results.length).toFixed(3) : null, results }
}
