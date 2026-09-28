/**
 * Atlas NavBar — test suite
 *
 * Coverage:
 *   1. Renders <header> with brand and primary nav
 *   2. Variant matrix — default, transparent, bordered, floating
 *   3. Size matrix — sm, md, lg
 *   4. Active link gets aria-current="page"
 *   5. Hamburger — visible when links present, opens the mobile drawer
 *   6. Breadcrumb slot renders content
 *   7. Search slot renders content
 *   8. Dashboard mode — breadcrumb + search without links
 *   9. axe accessibility check per variant
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

// ─── 6. Breadcrumb slot ─────────────────────────────────────────────────

describe("NavBar — breadcrumb slot", () => {
  it("renders breadcrumb content when provided", () => {
    render(
      <NavBar
        brand="Atlas"
        breadcrumb={<nav aria-label="Breadcrumb"><span>Home / Dashboard</span></nav>}
      />
    )
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument()
    expect(screen.getByText("Home / Dashboard")).toBeInTheDocument()
  })

  it("does not render breadcrumb wrapper when not provided", () => {
    const { container } = render(<NavBar brand="Atlas" />)
    expect(container.querySelector("[class*=breadcrumb]")).not.toBeInTheDocument()
  })
})

// ─── 7. Search slot ─────────────────────────────────────────────────────

describe("NavBar — search slot", () => {
  it("renders search content when provided", () => {
    render(
      <NavBar
        brand="Atlas"
        search={<input type="search" aria-label="Search" placeholder="Search..." />}
      />
    )
    expect(screen.getByRole("searchbox", { name: /search/i })).toBeInTheDocument()
  })

  it("does not render search wrapper when not provided", () => {
    const { container } = render(<NavBar brand="Atlas" />)
    expect(container.querySelector("[class*=search]")).not.toBeInTheDocument()
  })
})

// ─── 8. Dashboard mode (breadcrumb + search, no links) ──────────────────

describe("NavBar — dashboard mode", () => {
  it("renders breadcrumb + search + actions without links or hamburger", () => {
    render(
      <NavBar
        brand="Atlas"
        breadcrumb={<span>Home / Analytics</span>}
        search={<input type="search" aria-label="Search" />}
        actions={<button type="button">Profile</button>}
      />
    )
    expect(screen.getByText("Home / Analytics")).toBeInTheDocument()
    expect(screen.getByRole("searchbox")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Profile" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /open menu/i })).not.toBeInTheDocument()
  })

  it("can coexist with links if both provided", () => {
    render(
      <NavBar
        brand="Atlas"
        links={LINKS}
        breadcrumb={<span>Home</span>}
      />
    )
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument()
  })
})

// ─── 9. axe accessibility ───────────────────────────────────────────────

describe("NavBar — a11y (axe)", () => {
  for (const variant of VARIANTS) {
    it(`passes axe for variant="${variant}"`, async () => {
      const { container } = render(
        <NavBar variant={variant} brand="Atlas" links={LINKS} />
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  }

  it("passes axe in dashboard mode", async () => {
    const { container } = render(
      <NavBar
        brand="Atlas"
        breadcrumb={<nav aria-label="Breadcrumb"><span>Home / Dashboard</span></nav>}
        search={<input type="search" aria-label="Search" />}
        actions={<button type="button">Profile</button>}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
