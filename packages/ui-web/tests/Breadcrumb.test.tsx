/**
 * Atlas Breadcrumb — test suite
 *
 * Coverage:
 *   1. Landmark + list semantics, default and custom aria-label
 *   2. Current page — aria-current, not a link
 *   3. Links — plain anchors, forwarded href and className
 *   4. Separators — chevron | dot, decorative, custom children
 *   5. Ellipsis — labelled button, click, custom label
 *   6. Dropdown — trigger-only semantics, aria-expanded
 *   7. Keyboard — links and buttons are focusable in DOM order
 *   8. axe accessibility check per separator style and item type
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbDropdown,
  type BreadcrumbSeparatorStyle,
} from "@atlas/ui-web/patterns/Breadcrumb/Breadcrumb"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const SEPARATORS: BreadcrumbSeparatorStyle[] = ["chevron", "dot"]

function Basic({ separator }: { separator?: BreadcrumbSeparatorStyle }) {
  return (
    <Breadcrumb separator={separator}>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbLink href="/components">Components</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// ─── 1. Landmark + list ────────────────────────────────────────────────────

describe("Breadcrumb — semantics", () => {
  it("renders a nav landmark named Breadcrumb by default", () => {
    render(<Basic />)
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument()
  })

  it("accepts a custom aria-label", () => {
    render(
      <Breadcrumb aria-label="Path to this page">
        <BreadcrumbList />
      </Breadcrumb>
    )
    expect(screen.getByRole("navigation", { name: "Path to this page" })).toBeInTheDocument()
  })

  it("renders an ordered list of segments", () => {
    const { container } = render(<Basic />)
    const list = screen.getByRole("list")
    expect(list.tagName).toBe("OL")
    expect(screen.getAllByRole("listitem")).toHaveLength(3) // separators are role="presentation"
    expect(container.querySelectorAll("li")).toHaveLength(5) // 3 items + 2 separators
  })
})

// ─── 2. Current page ───────────────────────────────────────────────────────

describe("Breadcrumb — current page", () => {
  it('marks the last segment aria-current="page" and does not make it a link', () => {
    render(<Basic />)
    const page = screen.getByText("Breadcrumb")
    expect(page).toHaveAttribute("aria-current", "page")
    expect(screen.queryByRole("link", { name: "Breadcrumb" })).not.toBeInTheDocument()
  })
})

// ─── 3. Links ──────────────────────────────────────────────────────────────

describe("Breadcrumb — links", () => {
  it("renders plain anchors with href", () => {
    render(<Basic />)
    const home = screen.getByRole("link", { name: "Home" })
    expect(home.tagName).toBe("A")
    expect(home).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: "Components" })).toHaveAttribute("href", "/components")
  })

  it("merges a custom className", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/" className="custom">Home</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("custom")
  })
})

// ─── 4. Separators ─────────────────────────────────────────────────────────

describe("Breadcrumb — separators", () => {
  for (const separator of SEPARATORS) {
    it(`renders decorative "${separator}" separators`, () => {
      const { container } = render(<Basic separator={separator} />)
      const seps = container.querySelectorAll("li[role='presentation']")
      expect(seps).toHaveLength(2)
      for (const sep of seps) {
        expect(sep).toHaveAttribute("aria-hidden", "true")
        expect(sep.querySelector("svg")).toBeInTheDocument()
      }
    })
  }

  it("chevron separators use the mirroring class; dot separators do not", () => {
    const chevron = render(<Basic separator="chevron" />)
    expect(chevron.container.querySelector("li[role='presentation'] svg")?.getAttribute("class")).toMatch(/mirror/)
    chevron.unmount()
    const dot = render(<Basic separator="dot" />)
    expect(dot.container.querySelector("li[role='presentation'] svg")?.getAttribute("class") ?? "").not.toMatch(/mirror/)
  })

  it("renders custom separator children", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbSeparator><span data-testid="custom-sep">/</span></BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(screen.getByTestId("custom-sep")).toBeInTheDocument()
  })
})

// ─── 5. Ellipsis ───────────────────────────────────────────────────────────

describe("BreadcrumbEllipsis", () => {
  it('is a button named "Show more" by default', () => {
    render(<BreadcrumbEllipsis />)
    const button = screen.getByRole("button", { name: "Show more" })
    expect(button).toHaveAttribute("type", "button")
  })

  it("accepts a custom label", () => {
    render(<BreadcrumbEllipsis label="Show hidden pages" />)
    expect(screen.getByRole("button", { name: "Show hidden pages" })).toBeInTheDocument()
  })

  it("fires onClick", () => {
    const onClick = vi.fn()
    render(<BreadcrumbEllipsis onClick={onClick} />)
    fireEvent.click(screen.getByRole("button", { name: "Show more" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

// ─── 6. Dropdown (trigger only) ────────────────────────────────────────────

describe("BreadcrumbDropdown", () => {
  it('is a button with aria-haspopup="menu" and aria-expanded=false by default', () => {
    render(<BreadcrumbDropdown>Components</BreadcrumbDropdown>)
    const trigger = screen.getByRole("button", { name: "Components" })
    expect(trigger).toHaveAttribute("aria-haspopup", "menu")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("reflects expanded", () => {
    render(<BreadcrumbDropdown expanded>Components</BreadcrumbDropdown>)
    expect(screen.getByRole("button", { name: "Components" })).toHaveAttribute("aria-expanded", "true")
  })

  it("fires onClick", () => {
    const onClick = vi.fn()
    render(<BreadcrumbDropdown onClick={onClick}>Components</BreadcrumbDropdown>)
    fireEvent.click(screen.getByRole("button", { name: "Components" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

// ─── 7. Keyboard ───────────────────────────────────────────────────────────

describe("Breadcrumb — keyboard", () => {
  it("links and buttons are focusable; the current page and separators are not tab stops", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    const link = screen.getByRole("link", { name: "Home" })
    const button = screen.getByRole("button", { name: "Show more" })
    link.focus()
    expect(link).toHaveFocus()
    button.focus()
    expect(button).toHaveFocus()
    expect(screen.getByText("Breadcrumb")).not.toHaveAttribute("tabindex")
  })
})

// ─── 8. axe ────────────────────────────────────────────────────────────────

describe("Breadcrumb — axe", () => {
  for (const separator of SEPARATORS) {
    it(`has no axe violations: separator="${separator}"`, async () => {
      const { container } = render(<Basic separator={separator} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  }

  it("has no axe violations: collapsed with ellipsis and dropdown", async () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbDropdown>Components</BreadcrumbDropdown></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
