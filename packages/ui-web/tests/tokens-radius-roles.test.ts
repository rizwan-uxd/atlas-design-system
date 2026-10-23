// M5.1 (Kind A): every radius role is an exact alias of one primitive step, never a new value.
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve(__dirname, "../../tokens/atlas.tokens.css"), "utf8")
const ROLES = { item: "sm", control: "md", surface: "lg", pill: "full" } as const

describe("radius roles", () => {
  for (const [role, step] of Object.entries(ROLES)) {
    it(`--atlas-radius-${role} aliases --atlas-radius-${step} exactly`, () => {
      const decls = [...css.matchAll(new RegExp(`--atlas-radius-${role}\\s*:\\s*([^;]+);`, "g"))].map((m) => m[1].trim())
      expect(decls).toEqual([`var(--atlas-radius-${step})`]) // declared once, in :root, never overridden by a theme
    })
  }
})
