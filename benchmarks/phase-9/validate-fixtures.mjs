#!/usr/bin/env node
// validate-fixtures.mjs <workspace> <task> [--live <live-figma.json>] [--no-skill]
// Phase 9 fixture gate: proves the task's premise holds in the workspace (and in live Figma, when given)
// and that the prompt does not leak it. Exit 1 on any failure; prints { ok, failures, facts } as JSON.
import fs from "fs"; import path from "path"; import { execSync } from "child_process"; import { fileURLToPath } from "url"

const args = process.argv.slice(2)
const [ws, task] = args
const opt = k => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : null }
const LIVE = opt("--live"), NO_SKILL = args.includes("--no-skill")
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const failures = [], facts = {}
const must = (cond, msg) => { if (!cond) failures.push(msg) }
const read = p => fs.readFileSync(path.join(ws, p), "utf8")
const json = p => JSON.parse(read(p))
const rows = f => { const j = json(f); return Array.isArray(j) ? j : Object.values(j).find(Array.isArray) || [] }
const union = (file, type) => { const m = read(file).match(new RegExp(`export type ${type}\\s*=\\s*([^\\n]+)`)); return m ? [...m[1].matchAll(/["']([\w-]+)["']/g)].map(x => x[1]) : null }
const live = LIVE ? JSON.parse(fs.readFileSync(LIVE, "utf8")) : null

// Prompt leak check — the premise and the expected decision must not be in the prompt
const LEAK = ["outline", "neutral", "primary", "already", "missing", "stop", "ask", "approve", "DISC-", "DEC-",
  "metadata", "atlas/", "packages/", ".figma.tsx", "Code Connect"]
const prompt = fs.readFileSync(path.join(ROOT, "benchmarks/tasks", task, "prompt.md"), "utf8")
for (const w of LEAK) must(!new RegExp(`(^|[^\\w])${w.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&")}([^\\w]|$)`, "i").test(prompt), `prompt leaks "${w}"`)

const decisions = rows("atlas/state/decisions.json"), discs = rows("atlas/state/discrepancies.json")
const disc = id => discs.find(d => d.id === id)
must(disc("DISC-028")?.status === "open", "DISC-028 must be present and open (isolation)")

if (task === "T3") {
  const m = json("atlas/metadata/Switch.json")
  facts.figmaSize = m.figmaProperties?.Size; facts.codeSizes = m.sizes
  must(m.source === "figma-synced" && m.syncedAt, "Switch metadata must be figma-synced with syncedAt set")
  must(m.figmaProperties?.Size?.includes("lg"), "Figma Switch Size must include lg")
  must(!m.sizes?.includes("lg"), "code Switch sizes must not include lg")
  const u = union("packages/ui-web/src/primitives/Switch/Switch.tsx", "SwitchSize"); facts.SwitchSize = u
  must(u && !u.includes("lg"), "SwitchSize union must exclude lg")
  must(!/["']lg["']/.test(read("packages/figma-sync/code-connect/Switch.figma.tsx")), "Switch Code Connect must not map lg")
  must(!/["']lg["']/.test(read("packages/governance/contracts/Switch.contract.ts")), "Switch contract must not assert lg")
  must(!decisions.some(d => d.status === "provisional" && /switch/i.test(`${d.topic} ${d.decision}`)), "no provisional decision may name Switch")
  must(disc("DISC-014")?.status === "open", "DISC-014 (Switch size drift) must be open")
  if (live) must(live.Switch?.Size?.includes("lg"), "live Figma Switch Size must include lg")
} else if (task === "T4") {
  const m = json("atlas/metadata/Badge.json")
  facts.figmaVariant = m.figmaProperties?.Variant; facts.codeVariants = m.variants
  must(m.source === "figma-synced" && m.syncedAt, "Badge metadata must be figma-synced with syncedAt set")
  must(!m.figmaProperties?.Variant?.includes("outline"), "Figma Badge Variant must exclude outline")
  must(!Object.values(m.figmaProperties || {}).flat().some(v => /outline|appearance/i.test(v)), "no Figma Badge property may carry an outline/appearance value")
  must(m.variants?.includes("outline"), "code Badge variants must include outline")
  const u = union("packages/ui-web/src/primitives/Badge/Badge.tsx", "BadgeVariant"); facts.BadgeVariant = u
  must(u?.includes("outline"), "BadgeVariant union must include outline")
  let sites = ""; try { sites = execSync(`grep -rln 'variant="outline"' app --include='*.tsx'`, { cwd: ws, encoding: "utf8" }) } catch {}
  facts.outlineCallSites = sites.split("\n").filter(Boolean)
  must(facts.outlineCallSites.length >= 1, "at least one call site must use variant=\"outline\"")
  must(!decisions.some(d => /outline/i.test(`${d.topic} ${d.decision}`)), "no decision may approve outline")
  for (const id of ["DISC-006", "DISC-016"]) must(disc(id)?.status === "open", `${id} must be open`)
  must(decisions.find(d => d.id === "DEC-002")?.decision === "Figma's variant names win. Real code-only options are added to Figma rather than deleted from code.", "DEC-002 text changed")
  if (live) {
    must(live.Badge?.Variant && !live.Badge.Variant.includes("outline"), "live Figma Badge Variant must exclude outline")
    must(!Object.values(live.Badge || {}).flat().some(v => /outline|appearance/i.test(v)), "no live Figma Badge property may carry outline/appearance")
  }
} else must(false, `unknown component task ${task}`)

if (NO_SKILL) {
  let hits = ""; try { hits = execSync(`grep -rnE "atlas-component([^s]|$)" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs`, { cwd: ws, encoding: "utf8" }) } catch {}
  facts.noSkillHits = hits.split("\n").filter(Boolean)
  must(!fs.existsSync(path.join(ws, ".agents/skills/atlas-component")), "no-skill workspace still has the atlas-component skill")
  must(facts.noSkillHits.length === 0, "no-skill workspace still mentions atlas-component outside docs/")
}

console.log(JSON.stringify({ ok: failures.length === 0, task, failures, facts }, null, 2))
process.exit(failures.length ? 1 : 0)
