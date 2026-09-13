#!/usr/bin/env node
// analyze.mjs <run.jsonl> <workspace> <meta.json>  → JSON metrics on stdout
import fs from "fs"; import path from "path"
import { sh, atlasImports, coverage, rawElements, numericStyleLiterals, primitiveTokenRefs, tokenLintViolations, tscErrors, registered } from "../scripts/lib/quality-checks.mjs"
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
const outDir = path.join(ws, "app/prototypes", meta.slug)
const files = fs.existsSync(outDir) ? run(`find app/prototypes/${meta.slug} -name '*.tsx' -o -name '*.ts'`).split("\n").filter(Boolean) : []
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
  expectedCoverage: coverage(meta.expectedComponents, imported),
  rawElements: rawElements(src),
  numericStyleLiterals: numericStyleLiterals(src),
  primitiveTokenRefs: primitiveTokenRefs(src),
}

// derived harness metrics
const toolCalls = Object.values(tools).reduce((a, b) => a + b, 0)
const figmaCalls = Object.entries(tools).filter(([n]) => /figma/i.test(n)).reduce((a, [, v]) => a + v, 0)
const isVerify = c => /token-lint|tsc|vitest|npm run (test|lint)/.test(c || "")
const firstVerifyAt = lines.findIndex(l => Array.isArray(l.message?.content) && l.message.content.some(c => c.type === "tool_use" && c.name === "Bash" && isVerify(c.input?.command)))
let reworkEdits = 0
if (firstVerifyAt > -1) for (const l of lines.slice(firstVerifyAt + 1)) {
  const c = l.message?.content
  if (Array.isArray(c)) for (const x of c) if (x.type === "tool_use" && ["Edit", "MultiEdit", "Write"].includes(x.name)) reworkEdits++
}
const verifyRuns = bashCmds.filter(isVerify).length

const u = result?.usage || {}
console.log(JSON.stringify({
  model: init.model, ok: result?.subtype === "success",
  turns: result?.num_turns, durationS: Math.round((result?.duration_ms || 0) / 1000), costUsd: result?.total_cost_usd,
  tokens: { input: u.input_tokens, cacheWrite: u.cache_creation_input_tokens, cacheRead: u.cache_read_input_tokens, output: u.output_tokens,
    totalContext: (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0) },
  tools, toolCalls, figmaCalls, verifyRuns, reworkEdits, toolResultChars: resultChars, skillsUsed,
  reads: { total: reads.length, unique: new Set(reads).size, offTask, byCategory: readsByCat, files: reads },
  bashCmds, quality: q,
}, null, 2))
