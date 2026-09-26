/**
 * Atlas Spinner — test suite
 *
 * Coverage:
 *   1. Semantics — status role, default and custom accessible label, aria-hidden svg
 *   2. Variant × size matrix — data attributes and glyph
 *   3. Passthrough — className and id
 *   4. Motion — reduced-motion rule and spin token in the stylesheet
 *   5. axe accessibility check per variant and size
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Spinner,
  type SpinnerVariant,
  type SpinnerSize,
} from "@atlas/ui-web/primitives/Spinner/Spinner"

const VARIANTS: SpinnerVariant[] = ["default", "custom"]
const SIZES: SpinnerSize[] = ["xs", "sm", "md", "lg"]

describe("Spinner — semantics", () => {
  it("renders a status with the default label", () => {
    render(<Spinner />)
    const el = screen.getByRole("status")
    expect(el).toHaveTextContent("Loading")
    expect(el).toHaveAttribute("data-variant", "default")
    expect(el).toHaveAttribute("data-size", "md")
  })

  it("uses a custom label", () => {
    render(<Spinner label="Saving changes" />)
    expect(screen.getByRole("status")).toHaveTextContent("Saving changes")
  })

  it("hides the svg from assistive tech", () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })
})

describe("Spinner — variant × size", () => {
  it.each(VARIANTS.flatMap((v) => SIZES.map((s) => [v, s] as const)))(
    "%s at %s sets data attributes",
    (variant, size) => {
      render(<Spinner variant={variant} size={size} />)
      const el = screen.getByRole("status")
      expect(el).toHaveAttribute("data-variant", variant)
      expect(el).toHaveAttribute("data-size", size)
    }
  )

  it("draws one arc for default and eight ticks for custom", () => {
    const { container, rerender } = render(<Spinner variant="default" />)
    expect(container.querySelectorAll("svg path")).toHaveLength(1)
    rerender(<Spinner variant="custom" />)
    expect(container.querySelectorAll("svg path")).toHaveLength(8)
  })
})

describe("Spinner — passthrough", () => {
  it("forwards className and id", () => {
    render(<Spinner className="extra" id="s1" />)
    const el = screen.getByRole("status")
    expect(el).toHaveClass("extra")
    expect(el).toHaveAttribute("id", "s1")
  })
})

describe("Spinner — motion", () => {
  const css = readFileSync(
    resolve(__dirname, "../src/primitives/Spinner/Spinner.module.css"),
    "utf8"
  )

  it("spins with the spin duration and linear easing", () => {
    expect(css).toContain("var(--atlas-duration-spin)")
    expect(css).toContain("var(--atlas-easing-linear)")
  })

  it("stops the animation under prefers-reduced-motion", () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*{\s*\.icon\s*{\s*animation:\s*none/)
  })
})

describe("Spinner — axe", () => {
  it.each(VARIANTS.flatMap((v) => SIZES.map((s) => [v, s] as const)))(
    "%s at %s has no violations",
    async (variant, size) => {
      const { container } = render(<Spinner variant={variant} size={size} />)
      expect(await axe(container)).toHaveNoViolations()
    }
  )
})
