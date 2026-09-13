#!/usr/bin/env node
// pins.mjs — phase 9 pins (proposal §5A.2). Refuses a run whose inputs differ from what was pinned.
//   pins.mjs check <workspace> <label> [--record]   workspace-derived + tooling + CLI + user context, before claude
//   pins.mjs post  <label> <run.jsonl> <type>       model id and Figma MCP tool list, after the run (first run of a type records)
// --record writes a missing entry (dry runs only); without it a missing or different pin exits 1.
import fs from "fs"; import path from "path"; import os from "os"; import crypto from "crypto"; import { execSync } from "child_process"; import { fileURLToPath } from "url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const FILE = path.join(ROOT, "benchmarks/phase-9/pins.json")
const [cmd, a1, a2] = process.argv.slice(2); const RECORD = process.argv.includes("--record")
const pins = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : { model: "claude-sonnet-5", cli: "2.1.270", common: null, labels: {}, runtime: null }
const out = (c, cwd) => { try { return execSync(c, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() } catch { return "absent" } }
const sha = p => fs.existsSync(p) ? crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 16) : "absent"

const WS_PATHS = [".agents/skills/atlas-component", ".agents/skills/atlas-verify", ".agents/skills/atlas-prototype", ".agents/skills/atlas-figma-sync",
  "AGENTS.md", "claude.md", "scripts/atlas-verify.mjs", "scripts/atlas-sync.mjs", "scripts/lib", "packages/governance/token-lint.mjs",
  "atlas/metadata/Switch.json", "atlas/metadata/Badge.json", "atlas/Switch.md", "atlas/Badge.md", "atlas/state",
  "packages/ui-web/src/primitives/Switch", "packages/ui-web/src/primitives/Badge", "packages/ui-web/tests",
  "packages/figma-sync/code-connect/Switch.figma.tsx", "packages/figma-sync/code-connect/Badge.figma.tsx",
  "packages/governance/contracts/Switch.contract.ts", "packages/governance/contracts/Badge.contract.ts"]
const TOOLING = ["benchmarks/run.sh", "benchmarks/analyze.mjs", "benchmarks/summarize.mjs", "benchmarks/rubric-component.md",
  "benchmarks/phase-9/validate-fixtures.mjs", "benchmarks/phase-9/component-metrics.mjs", "benchmarks/phase-9/budget.mjs",
  "benchmarks/phase-9/pins.mjs", "benchmarks/phase-9/no-skill.patch", "benchmarks/phase-9/live-figma.json",
  "benchmarks/tasks/T3/prompt.md", "benchmarks/tasks/T3/meta.json", "benchmarks/tasks/T4/prompt.md", "benchmarks/tasks/T4/meta.json",
  "scripts/lib/quality-checks.mjs"]
const settings = (() => { try { return JSON.parse(fs.readFileSync(path.join(os.homedir(), ".claude/settings.json"), "utf8")) } catch { return {} } })()

const diffs = (want, got, pre = "") => Object.keys({ ...want, ...got }).flatMap(k =>
  want[k] && typeof want[k] === "object" ? diffs(want[k], got[k] || {}, `${pre}${k}.`)
    : JSON.stringify(want[k]) === JSON.stringify(got[k]) ? [] : [`${pre}${k}: pinned ${JSON.stringify(want[k])} ≠ now ${JSON.stringify(got[k])}`])
const save = () => fs.writeFileSync(FILE, JSON.stringify(pins, null, 2) + "\n")
const settle = (slot, got, where) => {
  if (!slot.get()) { if (!RECORD) { console.error(`✗ pins: ${where} not pinned (record it with a dry run first)`); process.exit(1) } slot.set(got); save(); console.log(`  • pinned ${where}`); return }
  const d = diffs(slot.get(), got); if (d.length) { console.error(`✗ pins: ${where} mismatch\n  ${d.join("\n  ")}`); process.exit(1) }
}

if (cmd === "check") {
  const [ws, label] = [a1, a2]
  const common = {
    cli: out("claude --version").replace(/\s*\(Claude Code\)/, ""),
    tooling: Object.fromEntries(TOOLING.map(p => [p, out(`git hash-object "${p}"`, ROOT)])),
    user: { claudeMd: sha(path.join(os.homedir(), ".claude/CLAUDE.md")), skills: out(`ls "${path.join(os.homedir(), ".claude/skills")}"`).split("\n").join(" "),
      plugins: Object.keys(settings.enabledPlugins || {}).filter(k => settings.enabledPlugins[k]).sort().join(" "),
      projectSettingsLocal: sha(path.join(ROOT, ".claude/settings.local.json")) },
  }
  if (common.cli !== pins.cli) { console.error(`✗ pins: claude CLI ${common.cli} ≠ pinned ${pins.cli}`); process.exit(1) }
  settle({ get: () => pins.common, set: v => { pins.common = v } }, common, "common (tooling, CLI, user context)")
  const lab = { tree: out("git rev-parse HEAD^{tree}", ws), figmaVersion: JSON.parse(fs.readFileSync(path.join(ws, "atlas/metadata/Switch.json"), "utf8")).figmaVersion,
    paths: Object.fromEntries(WS_PATHS.map(p => [p, out(`git rev-parse "HEAD:${p}"`, ws)])) }
  settle({ get: () => pins.labels[label], set: v => { pins.labels[label] = v } }, lab, `label ${label}`)
  // the verifier is identical in every label (§5A.2)
  const v = l => ["scripts/atlas-verify.mjs", "packages/governance/token-lint.mjs", ".agents/skills/atlas-verify", "scripts/lib"].map(p => l.paths[p]).join()
  const odd = Object.entries(pins.labels).filter(([, l]) => v(l) !== v(lab)).map(([k]) => k)
  if (odd.length) { console.error(`✗ pins: verifier differs from labels ${odd.join(", ")}`); process.exit(1) }
  console.log(`  ✓ pins ok (${label}, tree ${lab.tree.slice(0, 10)})`)
} else if (cmd === "post") {
  const [label, log] = [a1, a2]
  const init = fs.readFileSync(log, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return {} } }).find(l => l.type === "system" && l.subtype === "init") || {}
  if (init.model !== pins.model) { console.error(`✗ pins: model ${init.model} ≠ pinned ${pins.model}`); process.exit(1) }
  const figma = (init.mcp_servers || []).find(s => s.name === "figma")
  const runtime = { figmaStatus: figma?.status || "absent", figmaTools: (init.tools || []).filter(t => /^mcp__figma__/.test(t)).sort().join(" ") }
  if (runtime.figmaStatus !== "connected") { console.error(`✗ pins: figma MCP ${runtime.figmaStatus} in ${label} (infrastructure failure)`); process.exit(1) }
  // only a real run can observe these, so the first run of each task type records them
  const type = process.argv[5] || "component"; pins.runtime = pins.runtime || {}
  if (!pins.runtime[type]) { pins.runtime[type] = runtime; save(); console.log(`  • pinned runtime.${type}`) }
  else { const d = diffs(pins.runtime[type], runtime); if (d.length) { console.error(`✗ pins: runtime.${type} mismatch\n  ${d.join("\n  ")}`); process.exit(1) } }
  console.log(`  ✓ model ${init.model}, figma MCP connected`)
} else { console.error("usage: pins.mjs check <ws> <label> [--record] | post <label> <run.jsonl> [--record]"); process.exit(1) }
