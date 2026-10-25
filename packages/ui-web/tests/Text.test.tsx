/**
 * Atlas Text — test suite
 *
 * Coverage:
 *   1. Renders its children
 *   2. Variant × tone matrix — 7 roles × default | muted
 *   3. Default element per variant, and `as` overriding it without changing the role
 *   4. ref, className and native props pass through
 *   5. axe accessibility check per variant × tone
 *
 * Text is not interactive, so there are no hover, focus, disabled or invalid states to test.
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React, { createRef } from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { Text, type TextTone, type TextVariant } from "@atlas/ui-web/primitives/Text/Text"

const VARIANTS: TextVariant[] = ["heading", "title", "body", "body-sm", "label", "caption", "overline"]
const TONES: TextTone[] = ["default", "muted"]
const ELEMENT: Record<TextVariant, string> = {
  heading: "H2", title: "H3", body: "P", "body-sm": "P", label: "SPAN", caption: "SPAN", overline: "SPAN",
}

describe("Text — default render", () => {
  it("renders its children as body, default tone, in a p", () => {
    render(<Text>Hello</Text>)
    const el = screen.getByText("Hello")
    expect(el.tagName).toBe("P")
    expect(el).toHaveAttribute("data-variant", "body")
    expect(el).toHaveAttribute("data-tone", "default")
  })
})

describe("Text — variant × tone matrix", () => {
  for (const variant of VARIANTS) {
    for (const tone of TONES) {
      it(`renders ${variant} / ${tone}`, () => {
        render(<Text variant={variant} tone={tone}>Sample</Text>)
        const el = screen.getByText("Sample")
        expect(el).toHaveAttribute("data-variant", variant)
        expect(el).toHaveAttribute("data-tone", tone)
        expect(el.className).toContain("text")
      })
    }
  }
})

describe("Text — element", () => {
  for (const variant of VARIANTS) {
    it(`${variant} defaults to ${ELEMENT[variant].toLowerCase()}`, () => {
      render(<Text variant={variant}>Sample</Text>)
      expect(screen.getByText("Sample").tagName).toBe(ELEMENT[variant])
    })
  }

  it("as changes the element and keeps the role", () => {
    render(<Text variant="heading" as="h1">Page</Text>)
    const el = screen.getByRole("heading", { level: 1 })
    expect(el).toHaveAttribute("data-variant", "heading")
  })
})

describe("Text — passthrough", () => {
  it("forwards ref, className and native props", () => {
    const ref = createRef<HTMLElement>()
    render(<Text ref={ref} className="extra" id="t" lang="ar" dir="rtl">Sample</Text>)
    const el = screen.getByText("Sample")
    expect(ref.current).toBe(el)
    expect(el).toHaveClass("extra")
    expect(el).toHaveAttribute("id", "t")
    expect(el).toHaveAttribute("dir", "rtl")
  })
})

describe("Text — accessibility", () => {
  for (const variant of VARIANTS) {
    for (const tone of TONES) {
      it(`${variant} / ${tone} has no axe violations`, async () => {
        const { container } = render(<Text variant={variant} tone={tone}>Sample</Text>)
        expect(await axe(container)).toHaveNoViolations()
      })
    }
  }
})
