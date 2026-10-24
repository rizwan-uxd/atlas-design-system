// M5.2 (Kind A): every spacing role is an exact alias of one primitive step, never a new value.
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve(__dirname, "../../tokens/atlas.tokens.css"), "utf8")
const ROLES = {
  "focus-offset": "0_5", "item-gap": "1", "text-gap": "1", "overlay-offset": "1", "control-gap": "2",
  "item-padding": "2", "section-gap": "3", "surface-padding": "4", "surface-padding-lg": "6",
} as const
const COMPONENT = {
  "button-gap": "control-gap", "card-size-md-gap": "section-gap",
  "card-size-md-padding": "surface-padding", "card-size-lg-padding": "surface-padding-lg",
} as const
const decls = (name: string) =>
  [...css.matchAll(new RegExp(`${name}\\s*:\\s*([^;]+);`, "g"))].map((m) => m[1].trim())

describe("spacing roles", () => {
  for (const [role, step] of Object.entries(ROLES)) {
    it(`--atlas-spacing-${role} aliases --atlas-spacing-${step} exactly`, () => {
      expect(decls(`--atlas-spacing-${role}`)).toEqual([`var(--atlas-spacing-${step})`]) // once, in :root, never themed
    })
  }
  for (const [token, role] of Object.entries(COMPONENT)) {
    it(`--atlas-${token} names the ${role} role`, () => {
      expect(decls(`--atlas-${token}`)).toEqual([`var(--atlas-spacing-${role})`])
    })
  }
})
