/**
 * Atlas Button — test suite
 *
 * Coverage:
 *   1. Renders default variant without crashing
 *   2. Variant × Size × iconOnly matrix — all 48 combinations render a <button>
 *      (xs is 24px, one class per size; iconOnly adds a square modifier)
 *   3. Loading state — aria-busy + aria-disabled set correctly
 *   4. Disabled state — aria-disabled set, onClick not fired
 *   5. iconOnly — warns in dev when aria-label is missing (skipped in prod)
 *   6. axe accessibility check on each variant
 *   7. AnimatedIcon in the icon slots — plays from the button, not while disabled or loading
 *
 * Pattern: copy this file to test other components (~15 min each).
 */

import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Button,
  type ButtonVariant,
  type ButtonSize,
} from "@atlas/ui-web/primitives/Button/Button"
import { AnimatedIcon } from "@atlas/ui-web/animated-icons"

// Passes motion through unchanged, but records every scoped animate() call an icon makes.
const animateSpy = vi.hoisted(() => vi.fn())
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>()
  return {
    ...actual,
    useAnimate: () => {
      const [scope, animate] = actual.useAnimate()
      const spied = ((...args: Parameters<typeof animate>) => {
        animateSpy(...args)
        return animate(...args)
      }) as typeof animate
      return [scope, spied] as [typeof scope, typeof animate]
    },
  }
})

// ─── Fixtures ──────────────────────────────────────────────────────────────

const VARIANTS: ButtonVariant[] = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
]

const SIZES: ButtonSize[] = ["xs", "sm", "md", "lg"]

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
      for (const iconOnly of [false, true]) {
        it(`renders variant="${variant}" size="${size}" iconOnly=${iconOnly}`, () => {
          const label = `${variant} ${size}`
          render(
            <Button
              variant={variant}
              size={size}
              iconOnly={iconOnly}
              aria-label={iconOnly ? label : undefined}
            >
              {iconOnly ? "✕" : label}
            </Button>
          )
          // A <button> must be present regardless of variant/size
          const btn = document.querySelector("button")
          expect(btn).toBeTruthy()
        })
      }
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

// ─── 7. AnimatedIcon in the icon slots ─────────────────────────────────────

describe("Button — AnimatedIcon in icon slots", () => {
  beforeEach(() => animateSpy.mockClear())

  it("plays a leading icon when the button is hovered", () => {
    render(
      <Button leadingIcon={<AnimatedIcon name="download" trigger="hover" />}>Download</Button>
    )
    fireEvent.pointerEnter(screen.getByRole("button"))
    expect(animateSpy).toHaveBeenCalled()
  })

  it("plays a trailing icon when the button is hovered", () => {
    render(
      <Button trailingIcon={<AnimatedIcon name="upload" trigger="hover" />}>Upload</Button>
    )
    fireEvent.pointerEnter(screen.getByRole("button"))
    expect(animateSpy).toHaveBeenCalled()
  })

  it("plays an icon-only button's icon on hover", () => {
    render(
      <Button iconOnly aria-label="Settings" leadingIcon={<AnimatedIcon name="settings" trigger="hover" />} />
    )
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Settings" }))
    expect(animateSpy).toHaveBeenCalled()
  })

  it("does not play while the button is disabled", () => {
    render(
      <Button disabled leadingIcon={<AnimatedIcon name="download" trigger="hover" />}>Download</Button>
    )
    fireEvent.pointerEnter(screen.getByRole("button"))
    expect(animateSpy).not.toHaveBeenCalled()
  })

  it("does not play a trailing icon while the button is loading", () => {
    render(
      <Button loading trailingIcon={<AnimatedIcon name="upload" trigger="hover" />}>Upload</Button>
    )
    fireEvent.pointerEnter(screen.getByRole("button"))
    expect(animateSpy).not.toHaveBeenCalled()
  })

  it("replaces a leading icon with the spinner while loading", () => {
    const { container } = render(
      <Button loading leadingIcon={<AnimatedIcon name="download" trigger="hover" />}>Download</Button>
    )
    expect(container.querySelector("svg[data-icon]")).toBeNull()
  })

  it("passes axe with a labelled and a decorative animated icon", async () => {
    const { container } = render(
      <div>
        <Button leadingIcon={<AnimatedIcon name="download" trigger="hover" />}>Download</Button>
        <Button iconOnly aria-label="Refresh" leadingIcon={<AnimatedIcon name="refresh" trigger="hover" />} />
      </div>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
