// M5.3 (Kind B): every type role field is an exact alias of an existing token; the responsive uplift stays on --atlas-text-*.
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve(__dirname, "../../tokens/atlas.tokens.css"), "utf8")
const ROLES = {
  heading: ["text-h3", "line-height-tight", "font-weight-semibold"],
  title: ["text-h4", "line-height-snug", "font-weight-semibold"],
  body: ["text-body", "line-height-normal", "font-weight-regular"],
  "body-sm": ["text-body-sm", "line-height-normal", "font-weight-regular"],
  label: ["text-body-sm", "line-height-normal", "font-weight-medium"],
  caption: ["text-caption", "line-height-normal", "font-weight-regular"],
  overline: ["text-caption", "line-height-normal", "font-weight-medium"],
  stat: ["font-size-3xl", "line-height-tight", "font-weight-semibold"],
} as const
const decls = (name: string) => [...css.matchAll(new RegExp(`${name}\\s*:\\s*([^;]+);`, "g"))].map((m) => m[1].trim())

describe("type roles", () => {
  for (const [role, [size, lh, wt]] of Object.entries(ROLES)) {
    for (const [field, src] of [["size", size], ["line-height", lh], ["weight", wt]] as const) {
      it(`--atlas-type-${role}-${field} aliases --atlas-${src}`, () => {
        expect(decls(`--atlas-type-${role}-${field}`)).toEqual([`var(--atlas-${src})`])
      })
    }
  }
  it("--atlas-type-overline-letter-spacing aliases --atlas-letter-spacing-wide", () => {
    expect(decls("--atlas-type-overline-letter-spacing")).toEqual(["var(--atlas-letter-spacing-wide)"])
  })
})
