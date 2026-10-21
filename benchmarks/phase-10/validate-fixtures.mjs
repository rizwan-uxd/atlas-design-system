#!/usr/bin/env node
// validate-fixtures.mjs <workspace> <task> [--no-skill] — wave 2 fixture gate (T17, T18).
// Proves the task's premise holds in the workspace and that the prompt does not leak the expected path.
// Prints { ok, failures, facts } as JSON; exit 1 on any failure. Figma itself is not checked here: see benchmarks/README.md.
import fs from "fs"; import path from "path"; import { execSync } from "child_process"; import { fileURLToPath } from "url"

const args = process.argv.slice(2)
const [ws, task] = args
const NO_SKILL = args.includes("--no-skill")
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, "benchmarks/tasks", task, "meta.json"), "utf8"))
const failures = [], facts = {}
const must = (c, m) => { if (!c) failures.push(m) }
const has = p => fs.existsSync(path.join(ws, p))
const read = p => has(p) ? fs.readFileSync(path.join(ws, p), "utf8") : ""

// the prompt must not name where files go, how to validate, or the decision to stop
const LEAK = ["packages/", "atlas/", "sync", "tsc", "verify", "README", "example", "skill", "stop", "Figma is unavailable", "candidates", ".md", ".tsx"]
const prompt = fs.readFileSync(path.join(ROOT, "benchmarks/tasks", task, "prompt.md"), "utf8")
for (const w of LEAK) must(!prompt.toLowerCase().includes(w.toLowerCase()), `prompt leaks "${w}"`)

// the arm: the skill and its routing row are present, or both gone
const skill = has(".agents/skills/atlas-pattern/SKILL.md"), row = /`atlas-pattern` skill/.test(read("AGENTS.md"))
facts.skill = skill; facts.routingRow = row
must(skill === !NO_SKILL && row === !NO_SKILL, NO_SKILL ? "no-skill arm still has the atlas-pattern skill or its routing row" : "skill arm is missing the atlas-pattern skill or its routing row")

if (meta.exportDir) {
  // T18c: the text export must be present in the workspace, and the prompt must point at it
  const dir = path.join("figma-export", "members-and-permissions")
  facts.export = has(path.join(dir, "frame-tree.txt"))
  must(facts.export, "figma-export/members-and-permissions/frame-tree.txt is missing from the workspace")
  must(prompt.includes(meta.exportDir), "prompt does not point at the export directory")
}

const P = meta.pattern
must(!has(P.docPath) && !has(P.examplePath), `${P.slug} doc or example already exists in the starting workspace`)
must(!has(`atlas/patterns/${P.slug}.md`), `generated atlas/patterns/${P.slug}.md already exists`)
must(!read("atlas/index.md").includes(P.slug), `atlas/index.md still lists ${P.slug}`)

if (task === "T18" || task === "T18c") {
  // the workspace must be a clean starting point: sync validates and has nothing left to write
  let out = ""; try { out = execSync("node scripts/atlas-sync.mjs --check", { cwd: ws, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) } catch (e) { out = (e.stdout || "") + (e.stderr || "") }
  facts.syncCheck = out.trim().split("\n").slice(-2)
  must(!/pattern validation failed/.test(out) && /would write\s+0 file\(s\)/.test(out), "atlas:sync --check is not clean in the starting workspace")
  must(!/members and permissions/i.test(read("packages/governance/README.md")), "README still names the pattern")
  const siblings = fs.readdirSync(path.join(ws, "packages/governance/patterns")).filter(f => f.endsWith(".md"))
  facts.siblingPatterns = siblings.length
  must(siblings.length >= 12, "sibling patterns are missing")
}
console.log(JSON.stringify({ ok: failures.length === 0, failures, facts }, null, 2))
process.exit(failures.length ? 1 : 0)
