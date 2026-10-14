/**
 * Atlas Sparkline — test suite
 *
 * Coverage:
 *   1. getSparklinePath: spread, scaling, flat series, non-finite values, too few values, closed area
 *   2. Renders one image named by the label, drawn left to right in the order given
 *   3. Variant (line | area), tone and size reach the element; defaults
 *   4. Fewer than two finite values renders nothing
 *   5. Extra props (id, className) pass through
 *   6. axe has no violations per variant and tone
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Sparkline,
  getSparklinePath,
  type SparklineSize,
  type SparklineTone,
  type SparklineVariant,
} from "@atlas/ui-web/primitives/Sparkline/Sparkline"

const VARIANTS: SparklineVariant[] = ["line", "area"]
const TONES: SparklineTone[] = ["neutral", "positive", "negative"]
const SIZES: SparklineSize[] = ["sm", "md", "lg"]
const values = [8, 14, 10, 18]
const label = "Visitors, last 7 days, rising"

describe("getSparklinePath", () => {
  it("spreads x evenly and puts the lowest value at the bottom, the highest at the top", () => {
    expect(getSparklinePath([0, 50, 100])).toBe("M 0 100 L 50 50 L 100 0")
  })

  it("draws a flat series in the middle", () => {
    expect(getSparklinePath([5, 5, 5])).toBe("M 0 50 L 50 50 L 100 50")
  })

  it("skips values that are not finite", () => {
    expect(getSparklinePath([0, Number.NaN, 100, Number.POSITIVE_INFINITY])).toBe("M 0 100 L 100 0")
  })

  it("returns an empty path for fewer than two finite values", () => {
    expect(getSparklinePath([])).toBe("")
    expect(getSparklinePath([3])).toBe("")
    expect(getSparklinePath([3, Number.NaN])).toBe("")
  })

  it("closes the path down to the bottom corners for the area fill", () => {
    expect(getSparklinePath([0, 100], true)).toBe("M 0 100 L 100 0 L 100 100 L 0 100 Z")
  })
})

describe("Sparkline — content", () => {
  it("renders one image named by the label", () => {
    render(<Sparkline values={values} label={label} />)
    expect(screen.getByRole("img", { name: label })).toBeInTheDocument()
  })

  it("draws the values in the order given", () => {
    const { container } = render(<Sparkline values={values} label={label} />)
    expect(container.querySelector("path")?.getAttribute("d")).toBe(getSparklinePath(values))
  })

  it("passes id and className through", () => {
    render(<Sparkline values={values} label={label} id="trend" className="custom" />)
    const img = screen.getByRole("img")
    expect(img).toHaveAttribute("id", "trend")
    expect(img.getAttribute("class")).toContain("custom")
  })

  it("renders nothing for fewer than two finite values", () => {
    const { container } = render(<Sparkline values={[7]} label={label} />)
    expect(container.firstChild).toBeNull()
  })
})

describe("Sparkline — variant, tone, size", () => {
  it("defaults to line, neutral, md", () => {
    render(<Sparkline values={values} label={label} />)
    const img = screen.getByRole("img")
    expect(img).toHaveAttribute("data-variant", "line")
    expect(img).toHaveAttribute("data-tone", "neutral")
    expect(img).toHaveAttribute("data-size", "md")
  })

  it.each(VARIANTS)("renders variant %s", (variant) => {
    const { container } = render(<Sparkline values={values} variant={variant} label={label} />)
    expect(screen.getByRole("img")).toHaveAttribute("data-variant", variant)
    expect(container.querySelectorAll("path")).toHaveLength(variant === "area" ? 2 : 1)
  })

  it.each(TONES)("renders tone %s", (tone) => {
    render(<Sparkline values={values} tone={tone} label={label} />)
    expect(screen.getByRole("img")).toHaveAttribute("data-tone", tone)
  })

  it.each(SIZES)("renders size %s", (size) => {
    render(<Sparkline values={values} size={size} label={label} />)
    expect(screen.getByRole("img")).toHaveAttribute("data-size", size)
  })
})

describe("Sparkline — accessibility", () => {
  it.each(VARIANTS.flatMap((v) => TONES.map((t) => [v, t] as const)))(
    "has no axe violations: %s %s",
    async (variant, tone) => {
      const { container } = render(<Sparkline values={values} variant={variant} tone={tone} label={label} />)
      expect(await axe(container)).toHaveNoViolations()
    },
  )
})
