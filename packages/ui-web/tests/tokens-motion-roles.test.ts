// M5.4 (Kind B): every motion role is an exact alias of one duration and one easing token.
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve(__dirname, "../../tokens/atlas.tokens.css"), "utf8")
const ROLES = {
  state: ["fast", "standard"], move: ["base", "emphasized"], enter: ["base", "emphasized"],
  exit: ["base", "exit"], "enter-quick": ["fast", "standard"], "exit-quick": ["fast", "exit"],
} as const
const decls = (name: string) => [...css.matchAll(new RegExp(`${name}\\s*:\\s*([^;]+);`, "g"))].map((m) => m[1].trim())

describe("motion roles", () => {
  for (const [role, [d, e]] of Object.entries(ROLES)) {
    it(`--atlas-motion-${role} is duration-${d} + easing-${e}`, () => {
      expect(decls(`--atlas-motion-${role}-duration`)).toEqual([`var(--atlas-duration-${d})`])
      expect(decls(`--atlas-motion-${role}-easing`)).toEqual([`var(--atlas-easing-${e})`])
    })
  }
})
