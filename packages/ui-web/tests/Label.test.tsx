/**
 * Atlas Label — test suite
 *
 * Coverage:
 *   1. Renders a label associated with its control
 *   2. Variant × size matrix — default | inline × sm | md | lg
 *   3. Required marker — decorative, excluded from the accessible name
 *   4. Optional hint — decorative; required wins when both are passed
 *   5. Disabled and invalid states
 *   6. axe accessibility check
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { Label, type LabelSize, type LabelVariant } from "@atlas/ui-web/primitives/Label/Label"

const VARIANTS: LabelVariant[] = ["default", "inline"]
const SIZES: LabelSize[] = ["sm", "md", "lg"]

describe("Label — default render", () => {
  it("names its control through htmlFor", () => {
    render(
      <>
        <Label htmlFor="amount">Amount</Label>
        <input id="amount" />
      </>
    )
    expect(screen.getByLabelText("Amount")).toBeInTheDocument()
  })
})

describe("Label — variant × size matrix", () => {
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      it(`renders ${variant} / ${size}`, () => {
        render(<Label variant={variant} size={size}>Name</Label>)
        expect(screen.getByText("Name").tagName).toBe("LABEL")
      })
    }
  }
})

describe("Label — required and optional markers", () => {
  it("renders * for required, hidden from assistive tech", () => {
    render(<Label required>Name</Label>)
    const marker = screen.getByText("*")
    expect(marker).toHaveAttribute("aria-hidden", "true")
  })

  it("renders (optional) for optional, hidden from assistive tech", () => {
    render(<Label optional>Name</Label>)
    expect(screen.getByText("(optional)")).toHaveAttribute("aria-hidden", "true")
  })

  it("required wins when both are passed", () => {
    render(<Label required optional>Name</Label>)
    expect(screen.getByText("*")).toBeInTheDocument()
    expect(screen.queryByText("(optional)")).toBeNull()
  })

  it("renders no marker by default", () => {
    render(<Label>Name</Label>)
    expect(screen.queryByText("*")).toBeNull()
    expect(screen.queryByText("(optional)")).toBeNull()
  })
})

describe("Label — states", () => {
  it("sets data-disabled when disabled", () => {
    render(<Label disabled>Name</Label>)
    expect(screen.getByText("Name")).toHaveAttribute("data-disabled")
  })

  it("sets data-invalid when invalid", () => {
    render(<Label invalid>Name</Label>)
    expect(screen.getByText("Name")).toHaveAttribute("data-invalid")
  })
})

describe("Label — accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <Label htmlFor="email" required>Email</Label>
        <input id="email" />
      </>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
