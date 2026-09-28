/**
 * Atlas Bubble — test suite
 *
 * Coverage:
 *   1. Renders a non-interactive div by default
 *   2. Variant × align matrix
 *   3. asChild renders the child link or button as the bubble
 *   4. BubbleGroup role=group; BubbleReactions chip
 *   5. axe accessibility check per variant
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Bubble,
  BubbleGroup,
  BubbleReactions,
  type BubbleAlign,
  type BubbleVariant,
} from "@atlas/ui-web/primitives/Bubble/Bubble"

const VARIANTS: BubbleVariant[] = ["primary", "secondary", "muted", "tinted", "outline", "destructive"]
const ALIGNS: BubbleAlign[] = ["start", "end"]

describe("Bubble — default render", () => {
  it("renders a div with primary/start by default", () => {
    render(<Bubble>Hello</Bubble>)
    const el = screen.getByText("Hello")
    expect(el.tagName).toBe("DIV")
    expect(el).toHaveAttribute("data-variant", "primary")
    expect(el).toHaveAttribute("data-align", "start")
  })

  it("passes native props and className through", () => {
    render(<Bubble id="m1" className="extra">Hello</Bubble>)
    const el = screen.getByText("Hello")
    expect(el).toHaveAttribute("id", "m1")
    expect(el.className).toContain("extra")
  })
})

describe("Bubble — variant × align matrix", () => {
  for (const variant of VARIANTS) {
    for (const align of ALIGNS) {
      it(`renders ${variant} / ${align}`, () => {
        render(<Bubble variant={variant} align={align}>Msg</Bubble>)
        const el = screen.getByText("Msg")
        expect(el).toHaveAttribute("data-variant", variant)
        expect(el).toHaveAttribute("data-align", align)
      })
    }
  }
})

describe("Bubble — asChild", () => {
  it("renders the child link as the bubble", () => {
    const { container } = render(<Bubble asChild variant="tinted"><a href="/reset">Reset password</a></Bubble>)
    const link = screen.getByRole("link", { name: "Reset password" })
    expect(link).toHaveAttribute("href", "/reset")
    expect(link).toHaveAttribute("data-variant", "tinted")
    expect(container.querySelector("div")).toBeNull()
  })

  it("renders the child button as the bubble", () => {
    render(<Bubble asChild><button type="button">Yes</button></Bubble>)
    expect(screen.getByRole("button", { name: "Yes" })).toHaveAttribute("data-variant", "primary")
  })
})

describe("BubbleGroup and BubbleReactions", () => {
  it("BubbleGroup is a labelled group", () => {
    render(<BubbleGroup aria-label="Thread"><Bubble>One</Bubble><Bubble>Two</Bubble></BubbleGroup>)
    expect(screen.getByRole("group", { name: "Thread" })).toBeInTheDocument()
  })

  it("BubbleReactions renders inside a bubble", () => {
    render(<Bubble>Msg<BubbleReactions>👍 +2</BubbleReactions></Bubble>)
    expect(screen.getByText("👍 +2")).toHaveAttribute("data-bubble-reactions")
  })
})

describe("Bubble — accessibility", () => {
  for (const variant of VARIANTS) {
    it(`has no axe violations: ${variant}`, async () => {
      const { container } = render(<Bubble variant={variant}>Message text</Bubble>)
      expect(await axe(container)).toHaveNoViolations()
    })
  }
})
