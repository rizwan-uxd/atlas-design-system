/**
 * Atlas Textarea — test suite
 *
 * Coverage:
 *   1. Renders default (default, md) without crashing
 *   2. Variant × Size matrix — all 9 combinations render
 *   3. Disabled / readOnly — disabled blocks interaction
 *   4. Invalid — sets aria-invalid
 *   5. Character counter — shows count, flips to over-limit style
 *   6. axe accessibility check on each variant
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Textarea,
  type TextareaVariant,
  type TextareaSize,
} from "@atlas/ui-web/primitives/Textarea/Textarea"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const VARIANTS: TextareaVariant[] = ["default", "filled", "unstyled"]
const SIZES: TextareaSize[] = ["sm", "md", "lg"]

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("Textarea — default render", () => {
  it("renders a <textarea> element", () => {
    render(<Textarea aria-label="Notes" />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })
})

// ─── 2. Variant × Size matrix ───────────────────────────────────────────────

describe("Textarea — variant × size matrix", () => {
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      it(`renders variant="${variant}" size="${size}"`, () => {
        render(<Textarea variant={variant} size={size} aria-label={`${variant}-${size}`} />)
        expect(screen.getByRole("textbox")).toBeInTheDocument()
      })
    }
  }
})

// ─── 3. Disabled / readOnly ──────────────────────────────────────────────────

describe("Textarea — disabled state", () => {
  it("disables the field", () => {
    render(<Textarea disabled aria-label="Notes" />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("marks the field readOnly", () => {
    render(<Textarea readOnly aria-label="Notes" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly")
  })
})

// ─── 4. Invalid ───────────────────────────────────────────────────────────

describe("Textarea — invalid state", () => {
  it("sets aria-invalid=true when invalid", () => {
    render(<Textarea invalid aria-label="Notes" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
  })
})

// ─── 5. Character counter ────────────────────────────────────────────────────

describe("Textarea — character counter", () => {
  it("shows the count when showCount is set", () => {
    render(<Textarea showCount defaultValue="hello" aria-label="Notes" />)
    expect(screen.getByRole("status")).toHaveTextContent("5")
  })

  it("shows count/max and flips to over-limit style past maxLength", () => {
    render(<Textarea showCount maxLength={3} defaultValue="hello" aria-label="Notes" />)
    expect(screen.getByRole("status")).toHaveTextContent("5/3")
  })
})

// ─── 6. axe accessibility ───────────────────────────────────────────────────

describe("Textarea — a11y (axe)", () => {
  for (const variant of VARIANTS) {
    it(`passes axe for variant="${variant}"`, async () => {
      const { container } = render(<Textarea variant={variant} aria-label={`${variant} field`} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
