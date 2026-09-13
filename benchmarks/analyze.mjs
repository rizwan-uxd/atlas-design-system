#!/usr/bin/env node
// analyze.mjs <run.jsonl> <workspace> <meta.json> [candidates-before.json]  → JSON metrics on stdout
import fs from "fs"; import path from "path"
import { sh, atlasImports, coverage, rawElements, numericStyleLiterals, primitiveTokenRefs, tokenLintViolations, tscErrors, registered } from "../scripts/lib/quality-checks.mjs"
import { componentMetrics } from "./phase-9/component-metrics.mjs"
const [log, ws, metaPath] = process.argv.slice(2)
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"))
const lines = fs.readFileSync(log, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)

const norm = p => (p || "").replace(/^\/private/, "").replace(/\/{2,}/g, "/").replace(/\/$/, "")
const wsN = norm(ws)
const rel = p => { const n = norm(p); return n.startsWith(wsN) ? n.slice(wsN.length + 1) : n }
const CATS = [
  ["skills", /(^|\/)(SKILL\.md|references\/)/],
  ["atlas-snapshot", /^atlas\//],
  ["components", /^packages\/ui-web\//],
  ["tokens", /^packages\/tokens\//],
  ["prototype-shell", /^app\/prototypes\/(_shared\/|page\.tsx)/],
  ["new-output", new RegExp(`^app/prototypes/${meta.slug}/`)],
  ["prototype-examples", /^app\/prototypes\//],
  ["framework-docs", /node_modules\//],
  ["agent-memory", /^(claude\.md|CLAUDE\.md|AGENTS\.md)$/],
  ["planning-docs", /^(docs\/|pratices\/|ROADMAP\.md|README\.md|examples\/)/],
  ["other-platforms", /^packages\/(ui-native|mobile|figma-sync|ai-workflows)\//],
  ["governance", /^packages\/governance\//],
]
const cat = p => (CATS.find(([, re]) => re.test(p)) || ["other"])[0]

let init = lines.find(l => l.type === "system" && l.subtype === "init") || {}
const result = lines.findLast ? lines.findLast(l => l.type === "result") : [...lines].reverse().find(l => l.type === "result")
const toolById = {}, tools = {}, reads = [], resultChars = {}
let bashCmds = [], skillsUsed = []
for (const l of lines) {
  const content = l.message?.content
  if (!Array.isArray(content)) continue
  for (const c of content) {
    if (c.type === "tool_use") {
      toolById[c.id] = c.name; tools[c.name] = (tools[c.name] || 0) + 1
      if (c.name === "Read") reads.push(rel(c.input?.file_path))
      if (c.name === "Bash") bashCmds.push(c.input?.command)
      if (c.name === "Skill") skillsUsed.push(c.input?.skill || c.input?.command)
    }
    if (c.type === "tool_result") {
      const n = toolById[c.tool_use_id] || "?"
      const txt = typeof c.content === "string" ? c.content : JSON.stringify(c.content || "")
      resultChars[n] = (resultChars[n] || 0) + txt.length
    }
  }
}
const readsByCat = {}
for (const r of reads) readsByCat[cat(r)] = (readsByCat[cat(r)] || 0) + 1
const offTask = ["planning-docs", "other-platforms", "framework-docs", "other"].reduce((a, k) => a + (readsByCat[k] || 0), 0)

// ---- quality checks on the output (shared with scripts/atlas-verify.mjs) ----
const run = cmd => sh(cmd, ws).out
const outDir = meta.slug ? path.join(ws, "app/prototypes", meta.slug) : null // component tasks have no prototype output
const files = outDir && fs.existsSync(outDir) ? run(`find app/prototypes/${meta.slug} -name '*.tsx' -o -name '*.ts'`).split("\n").filter(Boolean) : []
const src = files.map(f => fs.readFileSync(path.join(ws, f), "utf8")).join("\n")
const imported = atlasImports(src)
const registry = fs.existsSync(path.join(ws, "app/prototypes/_shared/flowRegistry.ts")) ? fs.readFileSync(path.join(ws, "app/prototypes/_shared/flowRegistry.ts"), "utf8") : ""
const lint = run("node packages/governance/token-lint.mjs")
const tsc = run("npx tsc --noEmit -p tsconfig.json")
const q = {
  outputExists: files.length > 0, files: files.length, loc: src.split("\n").length,
  registered: registered(registry, meta.slug),
  tokenLintViolations: tokenLintViolations(lint, `prototypes/${meta.slug}`),
  tscErrors: tscErrors(tsc, `prototypes/${meta.slug}`),
  atlasComponentsImported: imported,
  expectedCoverage: coverage(meta.expectedComponents || [], imported),
  rawElements: rawElements(src),
  numericStyleLiterals: numericStyleLiterals(src),
  primitiveTokenRefs: primitiveTokenRefs(src),
}

// derived harness metrics
const toolCalls = Object.values(tools).reduce((a, b) => a + b, 0)
const figmaCalls = Object.entries(tools).filter(([n]) => /figma/i.test(n)).reduce((a, [, v]) => a + v, 0)
const isVerify = c => /atlas-verify|atlas:verify|token-lint|tsc|vitest|npm run (test|lint)/.test(c || "")
const firstVerifyAt = lines.findIndex(l => Array.isArray(l.message?.content) && l.message.content.some(c => c.type === "tool_use" && c.name === "Bash" && isVerify(c.input?.command)))
let reworkEdits = 0
if (firstVerifyAt > -1) for (const l of lines.slice(firstVerifyAt + 1)) {
  const c = l.message?.content
  if (Array.isArray(c)) for (const x of c) if (x.type === "tool_use" && ["Edit", "MultiEdit", "Write"].includes(x.name)) reworkEdits++
}
const verifyRuns = bashCmds.filter(isVerify).length

// ---- phase 8: every file opened, however it was opened ----
// A Bash command that is not a build/verify/run step is scanned for path-like tokens that exist as files in the
// workspace (cat/head/sed/grep/python open(...) all count); simple VAR=value assignments are expanded first.
const isFile = p => { try { return fs.statSync(path.join(ws, p)).isFile() } catch { return false } }
const EXEC = /^\s*(npm|npx|mkdir|ls|rm|cp|mv|touch|echo|git)\b|^\s*node\s+(scripts|packages|benchmarks)\//
const events = [] // ordered { kind: "read"|"write", file, via }
const toolResults = {} // id → { text, isError }
for (const l of lines) for (const c of Array.isArray(l.message?.content) ? l.message.content : [])
  if (c.type === "tool_result") toolResults[c.tool_use_id] = { text: typeof c.content === "string" ? c.content : JSON.stringify(c.content || ""), isError: !!c.is_error }
const calls = []
for (const l of lines) for (const c of Array.isArray(l.message?.content) ? l.message.content : []) {
  if (c.type !== "tool_use") continue
  calls.push(c)
  const i = c.input || {}
  if (c.name === "Read") events.push({ kind: "read", file: rel(i.file_path), via: "Read" })
  if (c.name === "Grep" && i.path && isFile(rel(i.path))) events.push({ kind: "read", file: rel(i.path), via: "Grep" })
  if (["Write", "Edit", "MultiEdit"].includes(c.name)) events.push({ kind: "write", file: rel(i.file_path), via: c.name })
  if (c.name === "Bash" && i.command) {
    let cmd = i.command
    for (const [, k, v] of cmd.matchAll(/(?:^|\s)([A-Z_][A-Z0-9_]*)=("[^"]*"|'[^']*'|\S+)/g)) cmd = cmd.split(`$${k}`).join(v.replace(/^["']|["']$/g, ""))
    for (const part of cmd.split(/&&|\|\||;|\n/)) {
      if (EXEC.test(part) || !part.trim()) continue
      const toks = new Set([...part.matchAll(/[\w@.~\/-]*[\w-]\.(?:tsx?|jsx?|mjs|cjs|json|md|css)\b/g)].map(m => rel(m[0])))
      for (const t of toks) if (isFile(t)) events.push({ kind: "read", file: t, via: "Bash" })
    }
  }
}
const allReads = events.filter(e => e.kind === "read")
const componentNames = fs.existsSync(path.join(ws, "packages/ui-web/src"))
  ? fs.readdirSync(path.join(ws, "packages/ui-web/src"), { withFileTypes: true }).filter(d => d.isDirectory())
      .flatMap(d => fs.readdirSync(path.join(ws, "packages/ui-web/src", d.name), { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name))
  : []
const SOURCE = [
  ["component-source", /^packages\/ui-web\/src\//],
  ["token-source", /^packages\/tokens\//],
  ["verifier-internals", /^(scripts\/|packages\/governance\/)/],
  ["shared-internals", /^app\/prototypes\/_shared\/(?!flowRegistry\.ts$)/],
  ["other-prototypes", new RegExp(`^app/prototypes/(?!_shared/|${meta.slug}/)[^/]+/`)],
]
const sourceOpened = {}
for (const r of new Set(allReads.map(e => e.file))) { const k = (SOURCE.find(([, re]) => re.test(r)) || [])[0]; if (k) sourceOpened[k] = [...(sourceOpened[k] || []), r] }

// duplicate = a file opened again with no write to it since the last open
let duplicateReads = 0; const lastOpen = new Map()
for (const e of events) {
  if (e.kind === "write") { lastOpen.delete(e.file); continue }
  if (lastOpen.has(e.file) && !e.file.startsWith(`app/prototypes/${meta.slug}/`)) duplicateReads++
  lastOpen.set(e.file, true)
}
const componentOf = f => (f.match(/^atlas\/(?:metadata\/)?([A-Z]\w+)\.(?:md|json)$/) || f.match(/^packages\/ui-web\/src\/\w+\/([A-Z]\w+)\//) || [])[1]
const unusedComponentReads = [...new Set(allReads.map(e => e.file))].filter(f => { const n = componentOf(f); return n && componentNames.includes(n) && !imported.some(i => i.startsWith(n)) })
const offTaskAll = [...new Set(allReads.map(e => e.file))].filter(f => ["planning-docs", "other-platforms", "framework-docs"].includes(cat(f)))

// verification: each verify-type Bash call and whether its result failed
// stricter than isVerify (kept for the phase 0 fields): a command that *runs* a check, not one that mentions tsconfig
const runsCheck = c => /atlas-verify\.mjs|atlas:verify|token-lint|\btsc\b|vitest|npm run (test|lint)\b/.test(c || "") && !/^\s*(grep|cat|sed|head|tail)\b/.test(c)
const verifyCalls = calls.filter(c => c.name === "Bash" && runsCheck(c.input?.command)).map(c => {
  const r = toolResults[c.id] || { text: "", isError: false }
  const failed = r.isError || /FAILED —|❌|error TS\d+|Tests?\s+\d+ failed|✖ \d+ problems? \(\d+ error/.test(r.text)
  return { cmd: c.input.command.slice(0, 120), failed }
})
const failedNonVerify = calls.filter(c => !(c.name === "Bash" && runsCheck(c.input?.command)) && toolResults[c.id]?.isError).length

// gaps: candidates.json entries added or bumped vs the copy the run started from
const parseCands = s => { try { return JSON.parse(s).candidates || [] } catch { return [] } }
const baseCandsSrc = process.argv[5] ? fs.readFileSync(process.argv[5], "utf8") : sh("git show HEAD:atlas/state/candidates.json", ws).out
const before = new Map(parseCands(baseCandsSrc).map(c => [c.id, JSON.stringify(c)]))
const afterCands = fs.existsSync(path.join(ws, "atlas/state/candidates.json")) ? parseCands(fs.readFileSync(path.join(ws, "atlas/state/candidates.json"), "utf8")) : []
const candidatesChanged = afterCands.filter(c => before.get(c.id) !== JSON.stringify(c)).map(c => `${c.id} ${c.name}`)
const expectedGaps = meta.gapComponents || []
const gapsRecognised = expectedGaps.filter(g => candidatesChanged.some(c => c.toLowerCase().includes(g.toLowerCase())))

const phase8 = {
  readsAll: { total: allReads.length, unique: new Set(allReads.map(e => e.file)).size, viaBash: allReads.filter(e => e.via === "Bash").length,
    files: allReads.map(e => `${e.via === "Read" ? "" : e.via + ":"}${e.file}`) },
  sourceOpened, sourceOpenedCount: Object.values(sourceOpened).reduce((a, b) => a + b.length, 0),
  verify: { runs: verifyCalls.length, failures: verifyCalls.filter(v => v.failed).length,
    firstPass: verifyCalls.length ? !verifyCalls[0].failed : null, finalPass: verifyCalls.length ? !verifyCalls.at(-1).failed : null, calls: verifyCalls },
  wasted: { duplicateReads, unusedComponentReads, offTask: offTaskAll, verifierInternals: sourceOpened["verifier-internals"] || [], failedToolCalls: failedNonVerify,
    total: duplicateReads + unusedComponentReads.length + offTaskAll.length + (sourceOpened["verifier-internals"] || []).length + failedNonVerify },
  // available=false: the workspace had no candidates.json, so the run had nowhere to log a gap (phase 0)
  gaps: { available: fs.existsSync(path.join(ws, "atlas/state/candidates.json")), candidatesChanged, expected: expectedGaps, recognised: gapsRecognised },
}

// phase 9: component tasks get correctness gates and H1–H5 source signals (prototype metrics above are unchanged)
const component = meta.type === "component" ? componentMetrics({ ws, meta, calls, allReads, events, result, sh, tscOut: tsc, verify: phase8.verify }) : undefined

const u = result?.usage || {}
console.log(JSON.stringify({
  // a usage-limit or API error still arrives as subtype "success" with is_error set
  model: init.model, ok: result?.subtype === "success" && !result?.is_error, error: result?.is_error ? (result.result || "").slice(0, 200) : null,
  turns: result?.num_turns, durationS: Math.round((result?.duration_ms || 0) / 1000), costUsd: result?.total_cost_usd,
  tokens: { input: u.input_tokens, cacheWrite: u.cache_creation_input_tokens, cacheRead: u.cache_read_input_tokens, output: u.output_tokens,
    totalContext: (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0) },
  tools, toolCalls, figmaCalls, verifyRuns, reworkEdits, toolResultChars: resultChars, skillsUsed,
  reads: { total: reads.length, unique: new Set(reads).size, offTask, byCategory: readsByCat, files: reads },
  bashCmds, quality: q, phase8, component, subtype: result?.subtype,
}, null, 2))
