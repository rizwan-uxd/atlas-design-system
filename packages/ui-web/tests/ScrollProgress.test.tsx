/**
 * Atlas ScrollProgress — test suite
 *
 * Coverage:
 *   1. Orientation × scope matrix — data attributes
 *   2. Progress maths — container and page, vertical and horizontal axis, clamping, non-scrollable
 *   3. Accessibility wiring — decorative by default, progressbar with a label, 5% steps
 *   4. Container scope without a target warns
 *   5. Reduced motion — the fill has no transition
 *   6. axe accessibility check per orientation and scope
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { readFileSync } from "node:fs"
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, act, cleanup } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  ScrollProgress,
  type ScrollProgressOrientation,
  type ScrollProgressScope,
} from "@atlas/ui-web/primitives/ScrollProgress/ScrollProgress"

const ORIENTATIONS: ScrollProgressOrientation[] = ["horizontal", "vertical"]
const SCOPES: ScrollProgressScope[] = ["page", "container"]

beforeEach(() => {
  // Runs frames synchronously; returns 0 so the component sees no frame pending afterwards.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 0 })
  vi.stubGlobal("cancelAnimationFrame", () => {})
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** Give an element scroll geometry (jsdom has none). */
function setGeometry(el: Element, g: { scrollHeight?: number; clientHeight?: number; scrollTop?: number; scrollWidth?: number; clientWidth?: number; scrollLeft?: number }) {
  for (const [key, value] of Object.entries(g)) {
    Object.defineProperty(el, key, { value, configurable: true, writable: true })
  }
}

const scrollValue = (el: HTMLElement) => Number(el.style.getPropertyValue("--scroll"))

// ─── 1. Orientation × scope ────────────────────────────────────────────────

describe("ScrollProgress — orientation × scope", () => {
  for (const orientation of ORIENTATIONS) {
    for (const scope of SCOPES) {
      it(`orientation="${orientation}" scope="${scope}" sets its data attributes`, () => {
        const target = { current: document.createElement("div") }
        const { container } = render(<ScrollProgress orientation={orientation} scope={scope} target={target} />)
        const bar = container.firstElementChild as HTMLElement
        expect(bar).toHaveAttribute("data-orientation", orientation)
        expect(bar).toHaveAttribute("data-scope", scope)
      })
    }
  }

  it("defaults to a horizontal page bar", () => {
    const { container } = render(<ScrollProgress />)
    const bar = container.firstElementChild as HTMLElement
    expect(bar).toHaveAttribute("data-orientation", "horizontal")
    expect(bar).toHaveAttribute("data-scope", "page")
  })
})

// ─── 2. Progress maths ─────────────────────────────────────────────────────

describe("ScrollProgress — progress", () => {
  it("container: follows the target's scroll position", () => {
    const el = document.createElement("div")
    setGeometry(el, { scrollHeight: 1000, clientHeight: 200, scrollTop: 0 })
    const { container } = render(<ScrollProgress scope="container" target={{ current: el }} />)
    const bar = container.firstElementChild as HTMLElement
    expect(scrollValue(bar)).toBe(0)
    act(() => { setGeometry(el, { scrollTop: 400 }); el.dispatchEvent(new Event("scroll")) })
    expect(scrollValue(bar)).toBeCloseTo(0.5)
    act(() => { setGeometry(el, { scrollTop: 800 }); el.dispatchEvent(new Event("scroll")) })
    expect(scrollValue(bar)).toBe(1)
  })

  it("clamps overscroll to 0–1", () => {
    const el = document.createElement("div")
    setGeometry(el, { scrollHeight: 1000, clientHeight: 200, scrollTop: 2000 })
    const { container } = render(<ScrollProgress scope="container" target={{ current: el }} />)
    expect(scrollValue(container.firstElementChild as HTMLElement)).toBe(1)
  })

  it("reads 0 when the target cannot scroll", () => {
    const el = document.createElement("div")
    setGeometry(el, { scrollHeight: 200, clientHeight: 200, scrollTop: 0 })
    const { container } = render(<ScrollProgress scope="container" target={{ current: el }} />)
    expect(scrollValue(container.firstElementChild as HTMLElement)).toBe(0)
  })

  it("axis=horizontal measures scrollLeft, and RTL negative offsets count as progress", () => {
    const el = document.createElement("div")
    setGeometry(el, { scrollWidth: 900, clientWidth: 300, scrollLeft: -300 })
    const { container } = render(<ScrollProgress scope="container" axis="horizontal" target={{ current: el }} />)
    expect(scrollValue(container.firstElementChild as HTMLElement)).toBeCloseTo(0.5)
  })

  it("page: follows the document scroll", () => {
    const root = document.scrollingElement ?? document.documentElement
    setGeometry(root, { scrollHeight: 2000, clientHeight: 500, scrollTop: 0 })
    const { container } = render(<ScrollProgress />)
    const bar = container.firstElementChild as HTMLElement
    act(() => { setGeometry(root, { scrollTop: 750 }); window.dispatchEvent(new Event("scroll")) })
    expect(scrollValue(bar)).toBeCloseTo(0.5)
  })

  it("stops listening after unmount", () => {
    const el = document.createElement("div")
    const remove = vi.spyOn(el, "removeEventListener")
    const { unmount } = render(<ScrollProgress scope="container" target={{ current: el }} />)
    unmount()
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function))
  })
})

// ─── 3. Accessibility wiring ───────────────────────────────────────────────

describe("ScrollProgress — accessibility", () => {
  it("is decorative by default", () => {
    const { container } = render(<ScrollProgress />)
    const bar = container.firstElementChild as HTMLElement
    expect(bar).toHaveAttribute("aria-hidden", "true")
    expect(bar).not.toHaveAttribute("role")
  })

  it("becomes a progressbar with an aria-label, in 5% steps", () => {
    const el = document.createElement("div")
    setGeometry(el, { scrollHeight: 1000, clientHeight: 200, scrollTop: 336 })
    const { container } = render(
      <ScrollProgress scope="container" target={{ current: el }} aria-label="Reading progress" />
    )
    const bar = container.firstElementChild as HTMLElement
    expect(bar).toHaveAttribute("role", "progressbar")
    expect(bar).not.toHaveAttribute("aria-hidden")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    expect(bar).toHaveAttribute("aria-valuenow", "40") // 336/800 = 42% → nearest 5%
  })
})

// ─── 4. Missing target ─────────────────────────────────────────────────────

describe("ScrollProgress — container without a target", () => {
  it("warns in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(<ScrollProgress scope="container" />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[Atlas ScrollProgress]"))
  })
})

// ─── 5. Reduced motion ─────────────────────────────────────────────────────

describe("ScrollProgress — reduced motion", () => {
  it("removes the fill transition under prefers-reduced-motion", () => {
    const css = readFileSync("packages/ui-web/src/primitives/ScrollProgress/ScrollProgress.module.css", "utf8")
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))
    expect(block).toContain("transition: none")
  })
})

// ─── 6. axe ────────────────────────────────────────────────────────────────

describe("ScrollProgress — axe", () => {
  for (const orientation of ORIENTATIONS) {
    for (const scope of SCOPES) {
      it(`has no axe violations: orientation="${orientation}" scope="${scope}", decorative and labelled`, async () => {
        const target = { current: document.createElement("div") }
        const { container } = render(
          <>
            <ScrollProgress orientation={orientation} scope={scope} target={target} />
            <ScrollProgress orientation={orientation} scope={scope} target={target} aria-label="Reading progress" />
          </>
        )
        expect(await axe(container)).toHaveNoViolations()
      })
    }
  }
})
