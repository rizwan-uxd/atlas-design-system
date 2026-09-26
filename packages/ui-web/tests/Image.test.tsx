/**
 * Atlas Image — test suite
 *
 * Coverage:
 *   1. Defaults — auto ratio, cover, md radius, loading state with a Skeleton
 *   2. Props — ratio, fit and radius reach the wrapper; passthrough to img and wrapper
 *   3. States — load, error, default fallback, custom fallback, src change, cached image
 *   4. Accessibility — alt required semantics, decorative alt, axe
 *   5. Stylesheet — every ratio and radius token, no hardcoded colours
 *
 * Pattern: packages/ui-web/tests/Skeleton.test.tsx
 */

import React from "react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import { Image, type ImageRatio, type ImageRadius } from "@atlas/ui-web/primitives/Image/Image"

const RATIOS: ImageRatio[] = ["1:1", "4:3", "3:2", "16:9", "16:10", "9:16", "3:4", "2:3", "4:5", "auto"]
const RADII: ImageRadius[] = ["none", "sm", "md", "lg", "xl", "full"]

const wrapper = (c: HTMLElement) => c.firstElementChild as HTMLElement

describe("Image — defaults", () => {
  it("starts loading with auto ratio, cover fit and md radius", () => {
    const { container } = render(<Image src="/a.jpg" alt="A" />)
    const el = wrapper(container)
    expect(el).toHaveAttribute("data-ratio", "auto")
    expect(el).toHaveAttribute("data-fit", "cover")
    expect(el).toHaveAttribute("data-radius", "md")
    expect(el).toHaveAttribute("data-state", "loading")
  })

  it("shows a Skeleton while loading, and keeps the img in the DOM so it can load", () => {
    const { container } = render(<Image src="/a.jpg" alt="A" />)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    expect(container.querySelector("img")).toHaveAttribute("src", "/a.jpg")
  })
})

describe("Image — props", () => {
  it.each(RATIOS)("ratio %s sets the data attribute", (ratio) => {
    const { container } = render(<Image src="/a.jpg" alt="A" ratio={ratio} />)
    expect(wrapper(container)).toHaveAttribute("data-ratio", ratio)
  })

  it.each(RADII)("radius %s sets the data attribute", (radius) => {
    const { container } = render(<Image src="/a.jpg" alt="A" radius={radius} />)
    expect(wrapper(container)).toHaveAttribute("data-radius", radius)
  })

  it("fit contain sets the data attribute", () => {
    const { container } = render(<Image src="/a.jpg" alt="A" fit="contain" />)
    expect(wrapper(container)).toHaveAttribute("data-fit", "contain")
  })

  it("puts className and style on the wrapper and other props on the img", () => {
    const { container } = render(
      <Image src="/a.jpg" alt="A" className="extra" style={{ inlineSize: "8rem" }} loading="lazy" id="pic" />
    )
    const el = wrapper(container)
    expect(el).toHaveClass("extra")
    expect(el.style.inlineSize).toBe("8rem")
    const img = container.querySelector("img")!
    expect(img).toHaveAttribute("loading", "lazy")
    expect(img).toHaveAttribute("id", "pic")
  })
})

describe("Image — states", () => {
  it("becomes loaded on load, drops the Skeleton and calls onLoad", () => {
    const onLoad = vi.fn()
    const { container } = render(<Image src="/a.jpg" alt="A" onLoad={onLoad} />)
    fireEvent.load(container.querySelector("img")!)
    expect(wrapper(container)).toHaveAttribute("data-state", "loaded")
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it("shows the default fallback on error, removes the img and calls onError", () => {
    const onError = vi.fn()
    const { container } = render(<Image src="/a.jpg" alt="A cat" onError={onError} />)
    fireEvent.error(container.querySelector("img")!)
    expect(wrapper(container)).toHaveAttribute("data-state", "error")
    expect(container.querySelector("img")).toBeNull()
    expect(screen.getByRole("img", { name: "A cat" })).toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it("renders a custom fallback instead of the default", () => {
    const { container } = render(<Image src="/a.jpg" alt="A" fallback={<span>No photo</span>} />)
    fireEvent.error(container.querySelector("img")!)
    expect(screen.getByText("No photo")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("starts loading again when src changes", () => {
    const { container, rerender } = render(<Image src="/a.jpg" alt="A" />)
    fireEvent.load(container.querySelector("img")!)
    expect(wrapper(container)).toHaveAttribute("data-state", "loaded")
    rerender(<Image src="/b.jpg" alt="A" />)
    expect(wrapper(container)).toHaveAttribute("data-state", "loading")
  })

  it("skips loading for an image that has already finished loading", () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true)
    const width = vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(120)
    const { container } = render(<Image src="/cached.jpg" alt="A" />)
    expect(wrapper(container)).toHaveAttribute("data-state", "loaded")
    complete.mockRestore()
    width.mockRestore()
  })
})

describe("Image — settled before hydration", () => {
  it("goes straight to error for an image that already failed", () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true)
    const { container } = render(<Image src="/broken.jpg" alt="A" />)
    expect(wrapper(container)).toHaveAttribute("data-state", "error")
    complete.mockRestore()
  })
})

describe("Image — accessibility", () => {
  it("names the img by alt", () => {
    render(<Image src="/a.jpg" alt="A red door" />)
    expect(screen.getByAltText("A red door")).toBeInTheDocument()
  })

  it("hides the default fallback when the image is decorative", () => {
    const { container } = render(<Image src="/a.jpg" alt="" />)
    fireEvent.error(container.querySelector("img")!)
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it("has no axe violations while loading, loaded, or in error", async () => {
    const { container } = render(<Image src="/a.jpg" alt="A" ratio="16:9" />)
    expect(await axe(container)).toHaveNoViolations()
    fireEvent.load(container.querySelector("img")!)
    expect(await axe(container)).toHaveNoViolations()
    const err = render(<Image src="/b.jpg" alt="B" />)
    fireEvent.error(err.container.querySelector("img")!)
    expect(await axe(err.container)).toHaveNoViolations()
  })
})

describe("Image — stylesheet", () => {
  const css = readFileSync(resolve(__dirname, "../src/primitives/Image/Image.module.css"), "utf8")

  it.each([
    ["1:1", "1 / 1"], ["4:3", "4 / 3"], ["3:2", "3 / 2"], ["16:9", "16 / 9"], ["16:10", "16 / 10"],
    ["9:16", "9 / 16"], ["3:4", "3 / 4"], ["2:3", "2 / 3"], ["4:5", "4 / 5"],
  ])("ratio %s maps to aspect-ratio %s", (ratio, value) => {
    expect(css).toContain(`data-ratio="${ratio}"`)
    expect(css).toContain(`aspect-ratio: ${value}`)
  })

  it.each(RADII)("radius %s uses its radius token", (radius) => {
    expect(css).toMatch(new RegExp(`data-radius="${radius}"\\]\\s*{\\s*border-radius: var\\(--atlas-radius-${radius}\\)`))
  })

  it("uses semantic tokens only, no hardcoded colours", () => {
    expect(css).toContain("var(--atlas-background-muted)")
    expect(css).toContain("var(--atlas-foreground-subtle)")
    expect(css).toContain("var(--atlas-icon-size-lg)")
    expect(css).toContain("var(--atlas-icon-stroke-lg)")
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/)
  })
})
