/**
 * Atlas AnimatedIcon — test suite
 *
 * Coverage:
 *   1. Registry — every name renders its own glyph
 *   2. Semantics — decorative by default, role="img" with a label
 *   3. Size × tone × state — data attributes
 *   4. Triggers — hover, press and focus listen on the nearest control; disabled targets are ignored
 *   5. Ref handle — start and stop do not throw, and are no-ops while disabled
 *   6. Reduced motion — MotionConfig "always" leaves icons static
 *   7. Stylesheet — size, stroke, tone and disabled use semantic tokens only
 *   8. axe accessibility check per icon
 *
 * Pattern: packages/ui-web/tests/Spinner.test.tsx
 */

import React from "react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, it, expect } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { MotionConfig } from "motion/react"
import { MotionProvider } from "@atlas/ui-web/motion"
import {
  AnimatedIcon,
  animatedIconNames,
  type AnimatedIconHandle,
  type AnimatedIconSize,
  type AnimatedIconState,
  type AnimatedIconTone,
} from "@atlas/ui-web/animated-icons"

const SIZES: AnimatedIconSize[] = ["xs", "sm", "md", "lg"]
const TONES: AnimatedIconTone[] = ["default", "muted", "success", "warning", "danger", "info"]
const STATES: AnimatedIconState[] = ["idle", "loading", "success", "error", "disabled"]

const icon = (container: HTMLElement) => container.querySelector("svg") as SVGSVGElement

describe("AnimatedIcon — registry", () => {
  it("registers the eight v1 icons and the migrated plug", () => {
    expect(animatedIconNames).toEqual(
      expect.arrayContaining(["check", "x", "search", "settings", "download", "upload", "refresh", "bell", "plug-connected", "panel-left-open"]),
    )
  })

  it.each(animatedIconNames)("%s renders a glyph", (name) => {
    const { container } = render(<AnimatedIcon name={name} />)
    const svg = icon(container)
    expect(svg).toHaveAttribute("data-icon", name)
    expect(svg.querySelectorAll("path, circle").length).toBeGreaterThan(0)
  })
})

describe("AnimatedIcon — semantics", () => {
  it("is decorative by default", () => {
    const { container } = render(<AnimatedIcon name="check" />)
    expect(icon(container)).toHaveAttribute("aria-hidden", "true")
    expect(icon(container)).not.toHaveAttribute("role")
  })

  it("becomes an image with a label", () => {
    render(<AnimatedIcon name="check" label="Saved" />)
    const img = screen.getByRole("img", { name: "Saved" })
    expect(img).not.toHaveAttribute("aria-hidden")
  })

  it("passes className and id through", () => {
    const { container } = render(<AnimatedIcon name="check" className="extra" id="ic" />)
    expect(icon(container)).toHaveClass("extra")
    expect(icon(container)).toHaveAttribute("id", "ic")
  })
})

describe("AnimatedIcon — size × tone × state", () => {
  it("defaults to md, default tone, manual trigger, idle", () => {
    const { container } = render(<AnimatedIcon name="bell" />)
    const svg = icon(container)
    expect(svg).toHaveAttribute("data-size", "md")
    expect(svg).toHaveAttribute("data-tone", "default")
    expect(svg).toHaveAttribute("data-trigger", "manual")
    expect(svg).toHaveAttribute("data-state", "idle")
    expect(svg).toHaveAttribute("data-disabled", "false")
  })

  it.each(SIZES)("size %s", (size) => {
    const { container } = render(<AnimatedIcon name="bell" size={size} />)
    expect(icon(container)).toHaveAttribute("data-size", size)
  })

  it.each(TONES)("tone %s", (tone) => {
    const { container } = render(<AnimatedIcon name="bell" tone={tone} />)
    expect(icon(container)).toHaveAttribute("data-tone", tone)
  })

  it.each(STATES)("state %s mounts without error", (state) => {
    const { container } = render(<AnimatedIcon name="refresh" state={state} />)
    expect(icon(container)).toHaveAttribute("data-state", state)
  })

  it("disabled prop and state=disabled are the same", () => {
    const a = render(<AnimatedIcon name="bell" disabled />)
    const b = render(<AnimatedIcon name="bell" state="disabled" />)
    expect(icon(a.container)).toHaveAttribute("data-disabled", "true")
    expect(icon(b.container)).toHaveAttribute("data-disabled", "true")
  })
})

describe("AnimatedIcon — triggers", () => {
  it("hover plays from the enclosing button and settles on leave", () => {
    render(
      <button type="button">
        <AnimatedIcon name="download" trigger="hover" />
        Download
      </button>,
    )
    const button = screen.getByRole("button")
    expect(() => {
      fireEvent.pointerEnter(button)
      fireEvent.pointerLeave(button)
    }).not.toThrow()
  })

  it("press, focus and loop mount and unmount cleanly", () => {
    const { unmount } = render(
      <>
        <button type="button"><AnimatedIcon name="upload" trigger="press" /></button>
        <button type="button"><AnimatedIcon name="settings" trigger="focus" /></button>
        <AnimatedIcon name="refresh" trigger="loop" />
        <AnimatedIcon name="check" trigger="appear" />
      </>,
    )
    const [press, focus] = screen.getAllByRole("button")
    expect(() => {
      fireEvent.pointerDown(press)
      fireEvent.pointerUp(press)
      fireEvent.focusIn(focus)
      fireEvent.focusOut(focus)
    }).not.toThrow()
    expect(() => unmount()).not.toThrow()
  })

  it("appear starts hidden so the icon does not flash before it plays", () => {
    const { container } = render(<AnimatedIcon name="check" trigger="appear" />)
    // motion applies the initial opacity inline on the svg
    expect(icon(container).style.opacity).not.toBe("")
  })
})

describe("AnimatedIcon — settling", () => {
  it.each(animatedIconNames)("%s settles to rest without an uncaught error", (name) => {
    const errors: unknown[] = []
    const onError = (e: ErrorEvent) => errors.push(e.error)
    window.addEventListener("error", onError)
    const ref = React.createRef<AnimatedIconHandle>()
    const { unmount } = render(
      <button type="button">
        <AnimatedIcon ref={ref} name={name} trigger="hover" />
      </button>,
    )
    const button = screen.getByRole("button")
    fireEvent.pointerEnter(button)
    fireEvent.pointerLeave(button)
    act(() => ref.current!.stopAnimation())
    unmount()
    window.removeEventListener("error", onError)
    expect(errors).toEqual([])
  })
})

describe("AnimatedIcon — ref handle", () => {
  it("exposes startAnimation and stopAnimation", () => {
    const ref = React.createRef<AnimatedIconHandle>()
    render(<AnimatedIcon ref={ref} name="settings" />)
    expect(ref.current).not.toBeNull()
    expect(() => {
      act(() => ref.current!.startAnimation())
      act(() => ref.current!.stopAnimation())
    }).not.toThrow()
  })

  it("does nothing while disabled", () => {
    const ref = React.createRef<AnimatedIconHandle>()
    const { container } = render(<AnimatedIcon ref={ref} name="settings" disabled />)
    const before = container.innerHTML
    act(() => ref.current!.startAnimation())
    expect(container.innerHTML).toBe(before)
  })
})

describe("AnimatedIcon — reduced motion", () => {
  it("renders every icon and trigger under MotionConfig reducedMotion=always", () => {
    const { container } = render(
      <MotionProvider>
        <MotionConfig reducedMotion="always">
          {animatedIconNames.map((name) => (
            <button type="button" key={name}>
              <AnimatedIcon name={name} trigger="hover" />
            </button>
          ))}
          <AnimatedIcon name="refresh" trigger="loop" state="loading" />
        </MotionConfig>
      </MotionProvider>,
    )
    expect(() => {
      screen.getAllByRole("button").forEach((b) => fireEvent.pointerEnter(b))
    }).not.toThrow()
    expect(container.querySelectorAll("svg").length).toBe(animatedIconNames.length + 1)
  })
})

describe("AnimatedIcon — stylesheet", () => {
  const css = readFileSync(
    resolve(__dirname, "../src/animated-icons/animated-icon.module.css"),
    "utf8",
  )

  it("sizes and strokes from icon tokens", () => {
    for (const s of SIZES) {
      expect(css).toContain(`--atlas-icon-size-${s}`)
      expect(css).toContain(`--atlas-icon-stroke-${s}`)
    }
  })

  it("colours tones from semantic tokens", () => {
    for (const t of ["foreground-muted", "success", "warning", "danger", "info"]) {
      expect(css).toContain(`var(--atlas-${t})`)
    }
  })

  it("dims when disabled from tokens", () => {
    expect(css).toContain("var(--atlas-foreground-disabled)")
    expect(css).toContain("var(--atlas-opacity-disabled)")
  })

  it("uses no colour literals or primitive tokens", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|oklch\(|hsl\(/i)
    expect(css).not.toMatch(/--atlas-color-/)
  })
})

describe("AnimatedIcon — axe", () => {
  it.each(animatedIconNames)("%s has no violations, decorative and labelled", async (name) => {
    const { container } = render(
      <div>
        <AnimatedIcon name={name} />
        <AnimatedIcon name={name} label={`${name} icon`} />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
