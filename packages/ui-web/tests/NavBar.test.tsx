/**
 * Atlas NavBar — test suite
 *
 * Coverage:
 *   1. Renders <header> with brand and primary nav
 *   2. Variant matrix — default, transparent, bordered, floating (DISC-010/025/026)
 *   3. Size matrix — sm, md, lg
 *   4. Active link gets aria-current="page"
 *   5. Hamburger — visible when links present, opens the mobile drawer
 *   6. axe accessibility check per variant
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import { NavBar, type NavBarVariant, type NavBarSize } from "@atlas/ui-web/layouts/NavBar/NavBar"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const VARIANTS: NavBarVariant[] = ["default", "transparent", "bordered", "floating"]
const SIZES: NavBarSize[] = ["sm", "md", "lg"]

const LINKS = [
  { label: "Components", active: true },
  { label: "Tokens" },
]

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("NavBar — default render", () => {
  it("renders a <header> with the brand and a labelled primary nav", () => {
    render(<NavBar brand="Atlas" links={LINKS} />)
    expect(screen.getByText("Atlas")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument()
  })
})

// ─── 2. Variant matrix ──────────────────────────────────────────────────

describe("NavBar — variant matrix", () => {
  for (const variant of VARIANTS) {
    it(`renders variant="${variant}"`, () => {
      render(<NavBar variant={variant} brand={`${variant} navbar`} />)
      expect(screen.getByText(`${variant} navbar`)).toBeInTheDocument()
    })
  }
})

// ─── 3. Size matrix ─────────────────────────────────────────────────────

describe("NavBar — size matrix", () => {
  for (const size of SIZES) {
    it(`renders size="${size}"`, () => {
      render(<NavBar size={size} brand={`${size} navbar`} />)
      expect(screen.getByText(`${size} navbar`)).toBeInTheDocument()
    })
  }
})

// ─── 4. Active link ─────────────────────────────────────────────────────

describe("NavBar — active link", () => {
  it("marks the active link with aria-current=page", () => {
    render(<NavBar links={LINKS} />)
    expect(screen.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "Tokens" })).not.toHaveAttribute("aria-current")
  })
})

// ─── 5. Hamburger + mobile drawer ────────────────────────────────────────

describe("NavBar — hamburger", () => {
  it("shows a hamburger button when links are present", () => {
    render(<NavBar links={LINKS} />)
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument()
  })

  it("does not render a hamburger when there are no links", () => {
    render(<NavBar brand="Atlas" />)
    expect(screen.queryByRole("button", { name: /open menu/i })).not.toBeInTheDocument()
  })

  it("opens the mobile drawer on hamburger click", () => {
    render(<NavBar links={LINKS} />)
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

// ─── 6. axe accessibility ───────────────────────────────────────────────

describe("NavBar — a11y (axe)", () => {
  for (const variant of VARIANTS) {
    it(`passes axe for variant="${variant}"`, async () => {
      const { container } = render(
        <NavBar variant={variant} brand="Atlas" links={LINKS} />
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  }
})
