/**
 * Atlas Skeleton — test suite
 *
 * Coverage:
 *   1. Semantics — aria-hidden, no role, no accessible name
 *   2. Shape — data attribute, default rect
 *   3. Passthrough — className, style and id
 *   4. Motion — pulse tokens and reduced-motion rule in the stylesheet
 *   5. Loading container — aria-busy on the parent, axe clean
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { Skeleton, type SkeletonShape } from "@atlas/ui-web/primitives/Skeleton/Skeleton"

const SHAPES: SkeletonShape[] = ["rect", "circle"]

describe("Skeleton — semantics", () => {
  it("is hidden from assistive tech and has no role", () => {
    const { container } = render(<Skeleton />)
    const el = container.firstElementChild!
    expect(el).toHaveAttribute("aria-hidden", "true")
    expect(el).not.toHaveAttribute("role")
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})

describe("Skeleton — shape", () => {
  it("defaults to rect", () => {
    const { container } = render(<Skeleton />)
    expect(container.firstElementChild).toHaveAttribute("data-shape", "rect")
  })

  it.each(SHAPES)("%s sets the data attribute", (shape) => {
    const { container } = render(<Skeleton shape={shape} />)
    expect(container.firstElementChild).toHaveAttribute("data-shape", shape)
  })
})

describe("Skeleton — passthrough", () => {
  it("forwards className, style and id", () => {
    const { container } = render(<Skeleton className="extra" id="s1" style={{ inlineSize: "8rem" }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveClass("extra")
    expect(el).toHaveAttribute("id", "s1")
    expect(el.style.inlineSize).toBe("8rem")
  })
})

describe("Skeleton — motion", () => {
  const css = readFileSync(
    resolve(__dirname, "../src/primitives/Skeleton/Skeleton.module.css"),
    "utf8"
  )

  it("pulses with the pulse duration, pulse opacity and standard easing", () => {
    expect(css).toContain("var(--atlas-duration-pulse)")
    expect(css).toContain("var(--atlas-opacity-pulse)")
    expect(css).toContain("var(--atlas-easing-standard)")
  })

  it("does not reuse the disabled opacity token", () => {
    expect(css).not.toContain("--atlas-opacity-disabled")
  })

  it("stops the animation under prefers-reduced-motion", () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*{\s*\.skeleton\s*{\s*animation:\s*none/)
  })
})

describe("Skeleton — loading container", () => {
  it("composes inside an aria-busy container without violations", async () => {
    const { container } = render(
      <div aria-busy="true" aria-label="Loading profile" role="group">
        <Skeleton shape="circle" />
        <Skeleton />
        <Skeleton />
      </div>
    )
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3)
    expect(await axe(container)).toHaveNoViolations()
  })

  it.each(SHAPES)("%s has no axe violations", async (shape) => {
    const { container } = render(<Skeleton shape={shape} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
