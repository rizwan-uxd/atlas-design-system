// The A1 baseline (DEC-092): the prompt an agent would get with no filter — every registered type as catalogPrompt
// writes it, plus one line per facts-only component (its prop names). Bench-only: it reads generated facts from disk.
import fs from "node:fs"
import path from "node:path"
import { fullCatalog, registry } from "@atlas/registry/lib"
import { catalogPrompt } from "@atlas/runtime/session"

const GEN = path.resolve(process.cwd(), "packages/registry/generated")

export function fullCatalogPrompt(): string {
  const lines = catalogPrompt(registry).split("\n")
  for (const name of fullCatalog().filter((n) => !Object.hasOwn(registry.entries, n))) {
    const facts = JSON.parse(fs.readFileSync(path.join(GEN, `${name}.facts.json`), "utf8")) as { props?: Array<{ name: string }> }
    const props = (facts.props ?? []).map((p) => p.name).filter((n) => n !== "className")
    lines.push(JSON.stringify({ type: name, props }))
  }
  return lines.sort().join("\n")
}
