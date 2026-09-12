#!/usr/bin/env node
// summarize.mjs <resultsDir> → writes SUMMARY.md (medians per label × task)
import fs from "fs"; import path from "path"
const dir = process.argv[2]
const med = a => { const s = a.filter(x => typeof x === "number").sort((x, y) => x - y); if (!s.length) return "–"; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(3) }
const rows = []
for (const label of fs.readdirSync(dir).filter(d => fs.statSync(path.join(dir, d)).isDirectory()))
  for (const task of fs.readdirSync(path.join(dir, label)).filter(d => fs.statSync(path.join(dir, label, d)).isDirectory())) {
    const tdir = path.join(dir, label, task)
    const runs = fs.readdirSync(tdir).filter(f => /^run-\d+\.json$/.test(f)).map(f => { try { return JSON.parse(fs.readFileSync(path.join(tdir, f), "utf8")) } catch { return null } }).filter(Boolean)
    if (!runs.length) continue
    let manual = null; try { manual = JSON.parse(fs.readFileSync(path.join(tdir, "manual.json"), "utf8")) } catch {}
    const g = f => med(runs.map(f))
    rows.push([label, task, runs.length, g(r => r.tokens.totalContext), g(r => r.tokens.output), g(r => r.costUsd), g(r => r.turns), g(r => r.durationS),
      g(r => r.reads.total), g(r => r.reads.offTask), g(r => r.toolCalls), g(r => r.figmaCalls), g(r => r.reworkEdits), g(r => r.quality.tokenLintViolations), g(r => r.quality.tscErrors),
      g(r => r.quality.rawElements), g(r => r.quality.numericStyleLiterals),
      runs.map(r => r.quality.expectedCoverage).join(" "), runs.filter(r => r.quality.registered).length + "/" + runs.length,
      manual ? manual.total ?? "–" : "–"])
  }
const H = ["label", "task", "runs", "context tok", "output tok", "cost $", "turns", "time s", "reads", "off-task reads", "tool calls", "figma calls", "rework edits", "lint", "tsc", "raw els", "num literals", "coverage", "registered", "manual /20"]
const md = `# Atlas benchmark summary\n\nMedians across runs. Lower is better except coverage, registered, manual score.\n\n| ${H.join(" | ")} |\n|${H.map(() => "---").join("|")}|\n` + rows.map(r => `| ${r.join(" | ")} |`).join("\n") + "\n"
fs.writeFileSync(path.join(dir, "SUMMARY.md"), md)
