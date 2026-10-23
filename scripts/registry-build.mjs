#!/usr/bin/env node
/**
 * registry-build — generate packages/registry/generated/<Name>.facts.json and check the invariant
 * (M3, roadmap §2c; plan docs/superpowers/plans/2026-10-23-m3-registry.md).
 *
 *   node scripts/registry-build.mjs           write facts and contracts for every component in atlas/metadata
 *   node scripts/registry-build.mjs --check   FAIL on stale, missing or orphaned facts and contracts, then on
 *                                             the invariant: the authored registry is a subset of the facts
 *   --root <dir>                              repo root (tests point it at a fixture copy)
 *
 * Reads atlas/metadata, Code Connect and the component sources; never writes atlas/ and never calls
 * Figma. Every registry JSON is schema-validated through scripts/lib/schemas.mjs before it is read.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import { loadInputs } from "./lib/schemas.mjs"
import { ASSERT_SOURCE, checkRegistry, codeConnectFacts, compilerOptions, contractSource, extractFacts, formatJson } from "./lib/registry.mjs"

const args = process.argv.slice(2)
const CHECK = args.includes("--check")
const rootArg = args.indexOf("--root")
const ROOT = rootArg >= 0 ? path.resolve(args[rootArg + 1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const GEN = "packages/registry/generated"
const CONTRACTS = "packages/governance/contracts/generated"
const rel = (...p) => path.join(ROOT, ...p)

function fatal(lines) {
  console.error(["registry-build — FAIL", ...lines.map((l) => `  ${l}`)].join("\n"))
  process.exitCode = 1
}

function main() {
  const inputs = loadInputs(ROOT)
  // gate on the INPUTS only: generated facts are what this run rewrites (or, under --check, compares)
  const isInput = (f) => (f.startsWith("packages/registry/") && !f.startsWith(`${GEN}/`)) || f.startsWith("atlas/metadata/")
  const invalid = inputs.files.filter((f) => !f.ok && isInput(f.file))
  const missing = inputs.problems.filter((p) => p.includes("packages/registry") || p.includes("atlas/metadata"))
  if (invalid.length || missing.length)
    return fatal([...missing, ...invalid.map((f) => `${f.file}: ${f.errors.join("; ")}`), "fix these first: node scripts/atlas-verify.mjs --only design.schemas"])

  const pick = (re) => inputs.files.filter((f) => re.test(f.file))
  const entries = Object.fromEntries(pick(/^packages\/registry\/src\/[^/]+\.registry\.json$/).map((f) => [f.data.type, f.data]))
  const aliases = inputs.valid("packages/registry/aliases.json").aliases
  const metadata = Object.fromEntries(pick(/^atlas\/metadata\/[^/]+\.json$/).map((f) => [f.data.name, f.data]))
  if (Object.keys(entries).length === 0) return fatal(["0 registry entries in packages/registry/src — nothing was inspected"])

  // facts and a contract for every component in the snapshot, so every one has a contract (roadmap §2c)
  const rendered = Object.keys(metadata).sort()
  const sourceOf = (name) => {
    const imp = metadata[name].import
    const m = /^@atlas\/ui-web\/(.+)$/.exec(imp)
    if (!m) throw new Error(`atlas/metadata/${name}.json import "${imp}" is not under @atlas/ui-web`)
    return `packages/ui-web/src/${m[1]}.tsx`
  }
  const program = ts.createProgram(rendered.map((n) => rel(sourceOf(n))), compilerOptions(ROOT))

  const facts = {}, written = {}, problems = []
  const entryFor = (name) => Object.values(entries).filter((e) => e.aliasOf === name)
  for (const name of rendered) {
    const source = sourceOf(name)
    const m = metadata[name]
    const ccRel = `packages/figma-sync/code-connect/${name}.figma.tsx`
    try {
      if (!fs.existsSync(rel(ccRel))) throw new Error(`registry: ${ccRel} is missing; facts need Code Connect to know which part Figma binds`)
      const { bound, part, ...cc } = codeConnectFacts(fs.readFileSync(rel(ccRel), "utf8"), m.figmaNodeId, ccRel)
      const { propsType, ...code } = extractFacts(program, rel(source), part)
      facts[name] = {
        _generated: `GENERATED — do not hand-edit. registry-build from ${source}, Code Connect and atlas/metadata; run npm run registry:build.`,
        name,
        import: m.import,
        source,
        part,
        propsType,
        ...code,
        codeConnect: { file: ccRel, bound, ...cc },
        figma: { nodeId: m.figmaNodeId, axes: m.figmaProperties },
        tokensUsed: m.tokensUsed,
      }
    } catch (e) { problems.push(`${name}: ${e.message}`); continue }
    written[`${GEN}/${name}.facts.json`] = formatJson(facts[name])
    written[`${CONTRACTS}/${name}.contract.ts`] = contractSource(facts[name], entryFor(name))
  }
  written[`${CONTRACTS}/_assert.ts`] = ASSERT_SOURCE
  if (problems.length) return fatal(problems)

  const list = (dir, suffix) => (fs.existsSync(rel(dir)) ? fs.readdirSync(rel(dir)).filter((f) => f.endsWith(suffix)).map((f) => `${dir}/${f}`) : [])
  const orphans = [...list(GEN, ".json"), ...list(CONTRACTS, ".ts")].filter((f) => !(f in written))

  if (!CHECK) {
    fs.mkdirSync(rel(GEN), { recursive: true }); fs.mkdirSync(rel(CONTRACTS), { recursive: true })
    let changed = 0
    for (const [f, text] of Object.entries(written)) {
      if (fs.existsSync(rel(f)) && fs.readFileSync(rel(f), "utf8") === text) continue
      fs.writeFileSync(rel(f), text); changed++
    }
    for (const f of orphans) { fs.rmSync(rel(f)); changed++ }
    console.log(`registry-build — wrote ${changed} file(s); ${rendered.length} facts and contracts, ${Object.keys(entries).length} entries`)
    return
  }

  const stale = Object.entries(written).filter(([f, text]) => !fs.existsSync(rel(f)) || fs.readFileSync(rel(f), "utf8") !== text).map(([f]) => `${f} is stale or missing — run npm run registry:build`)
  stale.push(...orphans.map((f) => `${f} belongs to no component in atlas/metadata — run npm run registry:build`))

  const cssTokens = new Set(fs.readFileSync(rel("packages/tokens/atlas.tokens.css"), "utf8").match(/--atlas-[a-z0-9_-]+(?=\s*:)/g) ?? [])
  const r = checkRegistry({ entries, aliases, facts, components: new Set(Object.keys(metadata)), cssTokens })
  for (const w of r.warn) console.log(`  WARN  ${w}`)
  const failures = [...stale, ...r.fail]
  if (failures.length) return fatal(failures)
  console.log(`registry-build --check — PASS (${r.inspected} entries, ${rendered.length} facts, ${rendered.length} contracts, ${r.rules} rules checked${r.warn.length ? `, ${r.warn.length} warn` : ""})`)
}

main()
