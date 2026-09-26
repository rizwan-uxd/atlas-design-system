/**
 * Atlas Progress — test suite
 *
 * Coverage:
 *   1. Semantics — role, aria-value*, clamping, indeterminate omits aria-valuenow
 *   2. Naming — label, aria-label, aria-labelledby, helper linked with aria-describedby
 *   3. Fill — width from value / max
 *   4. Slots — label, value text and helper text
 *   5. Motion — tokens and reduced-motion rules in the stylesheet
 *   6. axe per state
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { Progress } from "@atlas/ui-web/primitives/Progress/Progress"

describe("Progress — semantics", () => {
  it("renders a progressbar with min, max and now", () => {
    render(<Progress value={40} aria-label="Upload" />)
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    expect(bar).toHaveAttribute("aria-valuenow", "40")
  })

  it("defaults to 0 of 100", () => {
    render(<Progress aria-label="Upload" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0")
  })

  it("uses a custom max", () => {
    render(<Progress value={3} max={5} aria-label="Steps" />)
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuemax", "5")
    expect(bar).toHaveAttribute("aria-valuenow", "3")
  })

  it("clamps the value to 0…max", () => {
    const { rerender } = render(<Progress value={150} aria-label="Upload" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100")
    rerender(<Progress value={-5} aria-label="Upload" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0")
  })

  it("omits aria-valuenow and aria-valuetext when indeterminate", () => {
    const { container } = render(<Progress indeterminate value={40} aria-valuetext="x" aria-label="Loading" />)
    const bar = screen.getByRole("progressbar")
    expect(bar).not.toHaveAttribute("aria-valuenow")
    expect(bar).not.toHaveAttribute("aria-valuetext")
    expect(container.firstElementChild).toHaveAttribute("data-state", "indeterminate")
  })

  it("sets data-state determinate by default", () => {
    const { container } = render(<Progress aria-label="Upload" />)
    expect(container.firstElementChild).toHaveAttribute("data-state", "determinate")
  })

  it("forwards aria-valuetext", () => {
    render(<Progress value={3} max={5} aria-valuetext="3 of 5 steps" aria-label="Steps" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "3 of 5 steps")
  })
})

describe("Progress — naming", () => {
  it("is named by the label", () => {
    render(<Progress value={20} label="Uploading" />)
    expect(screen.getByRole("progressbar", { name: "Uploading" })).toBeInTheDocument()
  })

  it("is named by aria-label", () => {
    render(<Progress value={20} aria-label="Export" />)
    expect(screen.getByRole("progressbar", { name: "Export" })).toBeInTheDocument()
  })

  it("prefers an explicit aria-labelledby", () => {
    render(<><span id="ext">External</span><Progress label="Inner" aria-labelledby="ext" /></>)
    expect(screen.getByRole("progressbar", { name: "External" })).toBeInTheDocument()
  })

  it("links helper text with aria-describedby", () => {
    render(<Progress value={20} label="Storage" helperText="Upgrade for more space" />)
    expect(screen.getByRole("progressbar")).toHaveAccessibleDescription("Upgrade for more space")
  })

  it("warns in development when there is no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(<Progress value={20} />)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe("Progress — fill", () => {
  const fillOf = (c: HTMLElement) => c.querySelector('[role="progressbar"]')!.firstElementChild as HTMLElement

  it("sets --progress from value / max", () => {
    const { container } = render(<Progress value={3} max={4} aria-label="Steps" />)
    expect(fillOf(container).style.getPropertyValue("--progress")).toBe("75")
  })

  it("is 0 when empty and 100 when full", () => {
    const { container, rerender } = render(<Progress value={0} aria-label="Upload" />)
    expect(fillOf(container).style.getPropertyValue("--progress")).toBe("0")
    rerender(<Progress value={100} aria-label="Upload" />)
    expect(fillOf(container).style.getPropertyValue("--progress")).toBe("100")
  })

  it("does not set --progress when indeterminate", () => {
    const { container } = render(<Progress indeterminate aria-label="Loading" />)
    expect(fillOf(container).style.getPropertyValue("--progress")).toBe("")
  })

  it("falls back to max 100 for a non-positive max", () => {
    render(<Progress value={50} max={0} aria-label="Upload" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "100")
  })
})

describe("Progress — slots and passthrough", () => {
  it("renders label, value text and helper text", () => {
    render(<Progress value={62} label="Uploading" valueLabel="62%" helperText="About a minute left" />)
    expect(screen.getByText("Uploading")).toBeInTheDocument()
    expect(screen.getByText("62%")).toBeInTheDocument()
    expect(screen.getByText("About a minute left")).toBeInTheDocument()
  })

  it("forwards className, id and style to the root", () => {
    const { container } = render(<Progress className="extra" id="p1" style={{ maxInlineSize: "20rem" }} aria-label="Upload" />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveClass("extra")
    expect(el).toHaveAttribute("id", "p1")
    expect(el.style.maxInlineSize).toBe("20rem")
  })
})

describe("Progress — motion and tokens", () => {
  const css = readFileSync(resolve(__dirname, "../src/primitives/Progress/Progress.module.css"), "utf8")

  it("uses the Atlas tokens for size, colour and motion", () => {
    for (const token of [
      "--atlas-spacing-1", "--atlas-radius-full", "--atlas-background-muted", "--atlas-primary",
      "--atlas-duration-base", "--atlas-easing-standard", "--atlas-duration-pulse", "--atlas-easing-linear",
    ]) expect(css).toContain(`var(${token})`)
  })

  it("has an RTL slide and stops motion under prefers-reduced-motion", () => {
    expect(css).toContain('[dir="rtl"] .progress')
    expect(css).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*transition:\s*none[\s\S]*animation:\s*none/)
  })
})

describe("Progress — axe", () => {
  it.each([
    ["determinate", <Progress key="d" value={40} label="Uploading" valueLabel="40%" helperText="Almost there" />],
    ["indeterminate", <Progress key="i" indeterminate label="Loading" />],
    ["aria-label only", <Progress key="a" value={10} aria-label="Upload" />],
  ])("%s has no violations", async (_name, ui) => {
    const { container } = render(ui)
    expect(await axe(container)).toHaveNoViolations()
  })
})
