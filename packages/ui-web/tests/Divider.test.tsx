/**
 * Atlas Divider — test suite
 *
 * Coverage:
 *   1. Semantics — separator role, hr for horizontal, aria-orientation for vertical
 *   2. Decorative — role="none", no separator in the accessibility tree
 *   3. Orientation × tone matrix — data attributes
 *   4. Passthrough — className and aria-label
 *   5. axe accessibility check per orientation, tone and decorative
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Divider,
  type DividerOrientation,
  type DividerTone,
} from "@atlas/ui-web/primitives/Divider/Divider"

const ORIENTATIONS: DividerOrientation[] = ["horizontal", "vertical"]
const TONES: DividerTone[] = ["default", "strong", "subtle", "inverse"]

describe("Divider — semantics", () => {
  it("renders a horizontal separator as an hr by default", () => {
    const { container } = render(<Divider />)
    const el = container.firstElementChild!
    expect(el.tagName).toBe("HR")
    expect(screen.getByRole("separator")).toBe(el)
    expect(el).toHaveAttribute("data-orientation", "horizontal")
    expect(el).toHaveAttribute("data-tone", "default")
  })

  it("renders a vertical separator with aria-orientation", () => {
    render(<Divider orientation="vertical" />)
    const el = screen.getByRole("separator")
    expect(el).toHaveAttribute("aria-orientation", "vertical")
    expect(el).toHaveAttribute("data-orientation", "vertical")
  })
})

describe("Divider — decorative", () => {
  it.each(ORIENTATIONS)("%s decorative has role none and no separator", (orientation) => {
    const { container } = render(<Divider orientation={orientation} decorative />)
    expect(container.firstElementChild).toHaveAttribute("role", "none")
    expect(screen.queryByRole("separator")).not.toBeInTheDocument()
  })
})

describe("Divider — orientation × tone", () => {
  for (const orientation of ORIENTATIONS) {
    for (const tone of TONES) {
      it(`${orientation} / ${tone}`, () => {
        const { container } = render(<Divider orientation={orientation} tone={tone} />)
        const el = container.firstElementChild!
        expect(el).toHaveAttribute("data-orientation", orientation)
        expect(el).toHaveAttribute("data-tone", tone)
      })
    }
  }
})

describe("Divider — passthrough", () => {
  it("forwards className and aria-label", () => {
    render(<Divider className="extra" aria-label="Section break" />)
    const el = screen.getByRole("separator", { name: "Section break" })
    expect(el.className).toContain("extra")
  })
})

describe("Divider — accessibility (axe)", () => {
  for (const orientation of ORIENTATIONS) {
    for (const tone of TONES) {
      it(`${orientation} / ${tone} has no violations`, async () => {
        const { container } = render(<Divider orientation={orientation} tone={tone} />)
        expect(await axe(container)).toHaveNoViolations()
      })
    }
  }

  it("decorative has no violations", async () => {
    const { container } = render(<Divider decorative />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
