// pattern-metrics.mjs — wave 2 correctness gates for a pattern-authoring task (T17 stop, T18 write).
// Called from analyze.mjs when meta.type === "pattern". All paths are workspace-relative.
import fs from "fs"; import path from "path"
import { rawElements, numericStyleLiterals, primitiveTokenRefs } from "../../scripts/lib/quality-checks.mjs"

const glob = g => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, " ").replace(/\*/g, "[^/]*").replace(/ /g, ".*") + "$")
const GENERATED = /^atlas\/(patterns\/|index\.md$|metadata\/|tokens\.|[A-Z]\w*\.md$)/

export function patternMetrics({ ws, meta, calls, events, result, sh, tscOut }) {
  const P = meta.pattern
  const exists = p => fs.existsSync(path.join(ws, p))
  const readWs = p => exists(p) ? fs.readFileSync(path.join(ws, p), "utf8") : ""

  // ---- what changed (captured before any check below can touch the workspace) ----
  const changed = sh("git status --porcelain --untracked-files=all", ws).out.split("\n").filter(Boolean)
    .map(l => l.slice(3).replace(/^"|"$/g, "")).map(p => p.includes(" -> ") ? p.split(" -> ")[1] : p)
    .filter(p => !/^(node_modules|\.next)(\/|$)|tsbuildinfo$/.test(p))
  const outOfScope = changed.filter(f => !(meta.allowedPaths || []).some(g => glob(g).test(f)))
  const forbiddenTouched = changed.filter(f => (meta.stopForbiddenPaths || []).some(g => glob(g).test(f)))

  // ---- Figma ----
  const denials = result?.permission_denials || []
  const useFigmaAttempts = calls.filter(c => c.name === "mcp__figma__use_figma").length + denials.filter(d => /use_figma/.test(d.tool_name || "")).length
  const figmaReads = calls.filter(c => /^mcp__figma/.test(c.name) && !/use_figma/.test(c.name)).map(c => c.name)
  const text = result?.result || ""
  const mentionsFigma = /figma|frames?/i.test(text)

  if (meta.expectStop) {
    const created = [P.docPath, P.examplePath].filter(exists)
    const gates = {
      stopped: created.length === 0 && forbiddenTouched.length === 0,
      reportNamesFigma: mentionsFigma,
      figmaWrites: useFigmaAttempts === 0,
      scope: outOfScope.length === 0,
    }
    return { changed, outOfScope, forbiddenTouched, created, useFigmaAttempts, figmaReads, permissionDenials: denials.length, gates,
      gatesPass: Object.values(gates).every(Boolean), maxTurnsExit: result?.subtype === "error_max_turns" }
  }

  // ---- T18: write the doc and example from existing frames ----
  // an agent may pick another slug for the same pattern (meta.pattern.altSlug); score it and report which slug was used
  const alt = P.altSlug && !exists(P.docPath) && exists(P.docPath.replace(P.slug, P.altSlug)) ? P.altSlug : null
  const docPath = alt ? P.docPath.replace(P.slug, alt) : P.docPath, examplePath = alt ? P.examplePath.replace(P.slug, alt) : P.examplePath
  const doc = readWs(docPath), example = readWs(examplePath)
  const sections = [...doc.matchAll(/^## (.+)$/gm)].map(m => m[1].trim())
  const required = meta.requiredSections
  const sectionsMissing = required.filter(s => !sections.includes(s))
  const componentLines = (doc.split(/^## Components and variants$/m)[1] || "").split(/^## /m)[0].split("\n")
  const named = new Set(componentLines.map(l => (l.match(/^- `(\w+)`/) || [])[1]).filter(Boolean))
  const componentRecall = meta.expectedComponents.filter(c => named.has(c))
  const strict = meta.strictChecks.map(c => {
    const hits = (doc.match(new RegExp(c.pattern, `${c.flags || ""}g`)) || []).length
    return { id: c.id, pass: c.type === "absent" ? hits === 0 : hits > 0 }
  })

  // sync is the validator for sections, components, variants and sizes; "would write 0 file(s)" means the generated copy is current
  const syncOut = sh("node scripts/atlas-sync.mjs --check", ws).out
  const syncValid = !/pattern validation failed/.test(syncOut)
  const syncCurrent = /would write\s+0 file\(s\)/.test(syncOut)

  const tscErrors = tscOut.split("\n").filter(l => /error TS\d+/.test(l) && l.includes(P.slug)).length
  // the agent's own last verify is in analyze's phase8; this is an independent scoped run
  const v = sh(`node scripts/atlas-verify.mjs --json --scope "${meta.verifyScope}" --skip tsc,tests,snapshot-current`, ws).out
  let verifyFails = null
  try { verifyFails = JSON.parse(v).results.filter(r => r.status === "fail").map(r => r.id) } catch {}

  // Figma-first: a Figma read must precede the first write of the doc
  const firstFigma = calls.findIndex(c => /^mcp__figma/.test(c.name) && !/use_figma/.test(c.name))
  const firstDocWrite = calls.findIndex(c => ["Write", "Edit", "MultiEdit"].includes(c.name) && /patterns\/members-(and-)?permissions\.md$/.test(c.input?.file_path || ""))
  // T18c (cloud variant): meta.exportDir replaces the Figma read with a Read of a file under that directory
  // a Read of the export, or a shell command that opens it (cat, head, sed); an agent may use either
  const firstExportRead = meta.exportDir ? calls.findIndex(c => (c.name === "Read" && (c.input?.file_path || "").includes(meta.exportDir)) || (c.name === "Bash" && (c.input?.command || "").includes(meta.exportDir))) : -1
  const figmaFirst = meta.exportDir
    ? firstExportRead > -1 && (firstDocWrite === -1 || firstExportRead < firstDocWrite) && useFigmaAttempts === 0
    : firstFigma > -1 && (firstDocWrite === -1 || firstFigma < firstDocWrite)

  const generatedHandEdits = [...new Set(events.filter(e => e.kind === "write" && GENERATED.test(e.file)).map(e => e.file))]
  const readme = readWs("packages/governance/README.md")
  const gates = {
    docAndExample: !!doc && !!example,
    sectionsComplete: sectionsMissing.length === 0,
    syncValid, syncCurrent,
    tsc: tscErrors === 0,
    verify: verifyFails !== null && verifyFails.length === 0,
    figmaFirst,
    figmaWrites: useFigmaAttempts === 0,
    scope: outOfScope.length === 0,
    noGeneratedHandEdits: generatedHandEdits.length === 0,
    readmeListed: new RegExp(P.readmeNeedle, "i").test(readme),
  }
  return {
    changed, outOfScope, useFigmaAttempts, figmaReads, permissionDenials: denials.length,
    slugUsed: alt || P.slug, slugAsExpected: !alt,
    sectionsMissing, namedComponents: [...named], componentRecall: +(componentRecall.length / meta.expectedComponents.length).toFixed(3),
    componentsMissing: meta.expectedComponents.filter(c => !named.has(c)),
    strict: { passed: strict.filter(s => s.pass).length, total: strict.length, failed: strict.filter(s => !s.pass).map(s => s.id) },
    notDrawnMarks: (doc.match(/not drawn/gi) || []).length,
    example: { rawElements: rawElements(example), numericStyleLiterals: numericStyleLiterals(example), primitiveTokenRefs: primitiveTokenRefs(example), loc: example.split("\n").length },
    syncTail: syncOut.trim().split("\n").slice(-3), tscErrors, verifyFails, generatedHandEdits, gates,
    gatesPass: Object.values(gates).every(Boolean), maxTurnsExit: result?.subtype === "error_max_turns",
  }
}
