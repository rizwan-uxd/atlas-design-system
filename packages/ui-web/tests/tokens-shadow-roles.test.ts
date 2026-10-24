// M5.5 (Kind B): every shadow role is an exact alias of one size token, declared on the dark
// selectors too so a dark subtree re-resolves it (DEC-090).
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve(__dirname, "../../tokens/atlas.tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
const ROLES = { raised: "sm", surface: "md", popover: "md", floating: "lg", modal: "xl" } as const
const decls = (name: string) =>
  [...css.matchAll(new RegExp(`${name}\\s*:\\s*([^;]+);`, "g"))].map((m) => ({
    value: m[1].trim(),
    selector: css.slice(css.lastIndexOf("}", m.index) + 1, css.lastIndexOf("{", m.index)).trim(),
  }))

describe("shadow roles", () => {
  for (const [role, size] of Object.entries(ROLES)) {
    it(`--atlas-shadow-${role} is --atlas-shadow-${size}, on :root and the dark selectors`, () => {
      const d = decls(`--atlas-shadow-${role}`)
      expect(d.map((x) => x.value)).toEqual([`var(--atlas-shadow-${size})`])
      expect(d[0].selector.split(/\s*,\s*/)).toEqual([":root", '[data-theme="dark"]', ".dark"])
    })
  }
  it("the Card elevated tokens point at roles", () => {
    expect(decls("--atlas-card-elevated-shadow").map((x) => x.value)).toEqual(["var(--atlas-shadow-surface)"])
    expect(decls("--atlas-card-elevated-shadow-hover").map((x) => x.value)).toEqual(["var(--atlas-shadow-floating)"])
  })
})
