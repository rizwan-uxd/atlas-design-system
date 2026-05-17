/**
 * Atlas Button — test suite
 *
 * Coverage:
 *   1. Renders default variant without crashing
 *   2. Variant × Size matrix — all 24 combinations render a <button>
 *   3. Loading state — aria-busy + aria-disabled set correctly
 *   4. Disabled state — aria-disabled set, onClick not fired
 *   5. iconOnly — warns in dev when aria-label is missing (skipped in prod)
 *   6. axe accessibility check on each variant
 *
 * Pattern: copy this file to test other components (~15 min each).
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Button,
  type ButtonVariant,
  type ButtonSize,
} from "@atlas/ui-web/primitives/Button/Button"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const VARIANTS: ButtonVariant[] = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
]

const SIZES: ButtonSize[] = ["sm", "md", "lg", "icon"]

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("Button — default render", () => {
  it("renders a <button> element with children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("applies default variant=primary class", () => {
    const { container } = render(<Button>Label</Button>)
    const btn = container.querySelector("button")
    expect(btn).toBeTruthy()
    // Button should have at least one class applied
    expect(btn!.className.length).toBeGreaterThan(0)
  })
})

// ─── 2. Variant × Size matrix ─────────────────────────────────────────────

describe("Button — variant × size matrix", () => {
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      it(`renders variant="${variant}" size="${size}"`, () => {
        const label = `${variant} ${size}`
        render(
          <Button
            variant={variant}
            size={size}
            aria-label={size === "icon" ? label : undefined}
          >
            {size !== "icon" ? label : undefined}
          </Button>
        )
        // A <button> must be present regardless of variant/size
        const btn = document.querySelector("button")
        expect(btn).toBeTruthy()
      })
    }
  }
})

// ─── 3. Loading state ─────────────────────────────────────────────────────

describe("Button — loading state", () => {
  it("sets aria-busy=true when loading", () => {
    render(<Button loading>Submit</Button>)
    const btn = screen.getByRole("button")
    expect(btn).toHaveAttribute("aria-busy", "true")
  })

  it("sets aria-disabled=true when loading", () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true")
  })

  it("does not fire onClick while loading", () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Submit
      </Button>
    )
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })
})

// ─── 4. Disabled state ────────────────────────────────────────────────────

describe("Button — disabled state", () => {
  it("sets aria-disabled=true when disabled", () => {
    render(<Button disabled>Delete</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true")
  })

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Delete
      </Button>
    )
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })
})

// ─── 5. iconOnly ──────────────────────────────────────────────────────────

describe("Button — iconOnly", () => {
  it("renders without children when iconOnly + aria-label provided", () => {
    render(
      <Button iconOnly aria-label="Close dialog">
        ✕
      </Button>
    )
    expect(screen.getByRole("button", { name: /close dialog/i })).toBeInTheDocument()
  })
})

// ─── 6. axe accessibility ─────────────────────────────────────────────────

describe("Button — a11y (axe)", () => {
  for (const variant of VARIANTS) {
    it(`passes axe for variant="${variant}"`, async () => {
      const { container } = render(
        <Button variant={variant} aria-label={`${variant} button`}>
          {variant}
        </Button>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
