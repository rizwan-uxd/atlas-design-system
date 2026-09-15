#!/usr/bin/env node
// stale-row-metric.mjs — phase 9 H6 primary metric, T3 only, read-only (docs/PHASE-9-RESULTS.md).
// DISC-004 is a hand-written compound row: "Figma: Variant → Checked boolean. Code: add size lg."
// Once SwitchSize includes lg, the row is STALE if it was removed or closed, if a sentence still describes lg
// as missing/to add, or if the remaining Variant→Checked part is gone.
//   stale-row-metric.mjs measure <workspace>             print the result as JSON
//   stale-row-metric.mjs archive <workspace> <out-dir>   copy the final discrepancies.json + write stale-row.json
// Never writes to the workspace.
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url"

export const ROW = "DISC-004"
const DONE = /\b(added|adds|done|resolved|shipped|implemented|now has|now includes|closed)\b/i
const REMAINING = /\b(checked|on\/off|variant)\b/i

/** @returns {{ lgShipped: boolean, stale: boolean|null, reasons: string[], row: object|null }} */
export function staleRow({ rows, switchSizes }) {
  const lgShipped = !!switchSizes?.includes("lg")
  const row = rows.find(r => r.id === ROW) ?? null
  if (!lgShipped) return { lgShipped, stale: null, reasons: ["lg not shipped — metric not applicable"], row }
  const reasons = []
  if (!row) reasons.push(`${ROW} removed`)
  else {
    if (row.status !== "open") reasons.push(`${ROW} status "${row.status}" — the Variant→Checked part is still unresolved`)
    const text = `${row.issue ?? ""} ${row.resolution ?? ""}`
    for (const sentence of text.split(/\.(?:\s|$)/).map(s => s.trim()).filter(Boolean))
      if (/\blg\b/i.test(sentence) && !DONE.test(sentence)) reasons.push(`lg still described as missing: "${sentence}"`)
    if (!REMAINING.test(text)) reasons.push("remaining Variant→Checked part dropped")
  }
  return { lgShipped, stale: reasons.length > 0, reasons, row }
}

export function readWorkspace(ws) {
  const disc = JSON.parse(fs.readFileSync(path.join(ws, "atlas/state/discrepancies.json"), "utf8"))
  const rows = Array.isArray(disc) ? disc : Object.values(disc).find(Array.isArray) || []
  const tsx = fs.readFileSync(path.join(ws, "packages/ui-web/src/primitives/Switch/Switch.tsx"), "utf8")
  const m = tsx.match(/export type SwitchSize\s*=\s*([^\n]+)/)
  return { rows, switchSizes: m ? [...m[1].matchAll(/["']([\w-]+)["']/g)].map(x => x[1]) : [] }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, ws, out] = process.argv.slice(2)
  if (!["measure", "archive"].includes(cmd) || !ws || (cmd === "archive" && !out)) {
    console.error("usage: stale-row-metric.mjs measure <workspace> | archive <workspace> <out-dir>"); process.exit(1)
  }
  const result = staleRow(readWorkspace(ws))
  if (cmd === "archive") {
    fs.mkdirSync(out, { recursive: true })
    fs.copyFileSync(path.join(ws, "atlas/state/discrepancies.json"), path.join(out, "discrepancies.final.json"))
    fs.writeFileSync(path.join(out, "stale-row.json"), JSON.stringify({ workspace: path.basename(ws), ...result }, null, 2) + "\n")
  }
  console.log(JSON.stringify(result))
}
