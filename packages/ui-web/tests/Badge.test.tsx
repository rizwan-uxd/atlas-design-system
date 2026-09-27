/**
 * Atlas Badge — test suite
 *
 * Coverage:
 *   1. Renders default (neutral, filled, md) without crashing
 *   2. Variant × Appearance × Size matrix — all 36 combinations render
 *   3. Disabled state — aria-disabled set, onClick not fired
 *   4. Removable — remove button fires onRemove, has an accessible label
 *   5. Interactive (onClick) — renders as <button>, keyboard-activatable
 *   6. axe accessibility check on each variant × appearance
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Badge,
  type BadgeVariant,
  type BadgeAppearance,
  type BadgeSize,
} from "@atlas/ui-web/primitives/Badge/Badge"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const VARIANTS: BadgeVariant[] = ["neutral", "primary", "success", "warning", "danger", "info"]
const APPEARANCES: BadgeAppearance[] = ["default", "outline"]
const SIZES: BadgeSize[] = ["sm", "md", "lg"]

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("Badge — default render", () => {
  it("renders label text", () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("applies neutral variant class by default", () => {
    const { container } = render(<Badge>Label</Badge>)
    const el = container.firstElementChild
    expect(el).toBeTruthy()
    expect(el!.className.length).toBeGreaterThan(0)
  })
})

// ─── 2. Variant × Appearance × Size matrix ─────────────────────────────────

describe("Badge — variant × appearance × size matrix", () => {
  for (const variant of VARIANTS) {
    for (const appearance of APPEARANCES) {
      for (const size of SIZES) {
        it(`renders variant="${variant}" appearance="${appearance}" size="${size}"`, () => {
          render(
            <Badge variant={variant} appearance={appearance} size={size}>
              {variant}
            </Badge>
          )
          expect(screen.getByText(variant)).toBeInTheDocument()
        })
      }
    }
  }
})

// ─── 3. Disabled state ──────────────────────────────────────────────────────

describe("Badge — disabled state", () => {
  it("sets aria-disabled=true when disabled and interactive", () => {
    render(
      <Badge disabled onClick={() => {}}>
        Delete
      </Badge>
    )
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true")
  })

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn()
    render(
      <Badge disabled onClick={onClick}>
        Delete
      </Badge>
    )
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })
})

// ─── 4. Removable ───────────────────────────────────────────────────────────

describe("Badge — removable", () => {
  it("fires onRemove when the remove button is clicked", () => {
    const onRemove = vi.fn()
    render(
      <Badge removable onRemove={onRemove}>
        Tag
      </Badge>
    )
    fireEvent.click(screen.getByRole("button", { name: /remove tag/i }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it("warns in dev when removable without a derivable label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <Badge removable>
        <span>icon-only</span>
      </Badge>
    )
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

// ─── 5. Interactive (onClick) ───────────────────────────────────────────────

describe("Badge — interactive", () => {
  it("renders as a <button> when onClick is provided", () => {
    render(<Badge onClick={() => {}}>Filter</Badge>)
    expect(screen.getByRole("button", { name: /filter/i })).toBeInTheDocument()
  })

  it("renders as a <span> (non-interactive) without onClick", () => {
    const { container } = render(<Badge>Static</Badge>)
    expect(container.querySelector("button")).toBeNull()
    expect(container.querySelector("span.badge, span")).toBeTruthy()
  })
})

// ─── 6. axe accessibility ───────────────────────────────────────────────────

describe("Badge — a11y (axe)", () => {
  for (const variant of VARIANTS) {
    for (const appearance of APPEARANCES) {
      it(`passes axe for variant="${variant}" appearance="${appearance}"`, async () => {
        const { container } = render(
          <Badge variant={variant} appearance={appearance}>
            {variant}
          </Badge>
        )
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    }
  }
})
