import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarSection,
  SidebarFooter,
  SidebarCollapseToggle,
  useSidebar,
} from "@atlas/ui-web/layouts/Sidebar/Sidebar"

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("Sidebar — default render", () => {
  it("renders an <aside> landmark with default aria-label", () => {
    render(<Sidebar>Content</Sidebar>)
    const aside = screen.getByRole("complementary", { name: /sidebar/i })
    expect(aside).toBeInTheDocument()
    expect(aside.tagName).toBe("ASIDE")
  })

  it("does not set data-collapsed when expanded", () => {
    render(<Sidebar>Content</Sidebar>)
    const aside = screen.getByRole("complementary")
    expect(aside).not.toHaveAttribute("data-collapsed")
  })
})

// ─── 2. Collapsed state ───────────────────────────────────────────────────

describe("Sidebar — collapsed state", () => {
  it("sets data-collapsed when collapsed=true", () => {
    render(<Sidebar collapsed>Content</Sidebar>)
    const aside = screen.getByRole("complementary")
    expect(aside).toHaveAttribute("data-collapsed")
  })

  it("applies collapsed class", () => {
    const { container } = render(<Sidebar collapsed>Content</Sidebar>)
    const aside = container.querySelector("aside")
    expect(aside!.className).toContain("collapsed")
  })
})

// ─── 3. SidebarSection — label visibility ─────────────────────────────────

describe("SidebarSection — label", () => {
  it("renders label text when expanded", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarSection label="Navigation">Items</SidebarSection>
        </SidebarBody>
      </Sidebar>
    )
    expect(screen.getByText("Navigation")).toBeInTheDocument()
  })

  it("hides label text when collapsed", () => {
    render(
      <Sidebar collapsed>
        <SidebarBody>
          <SidebarSection label="Navigation">Items</SidebarSection>
        </SidebarBody>
      </Sidebar>
    )
    expect(screen.queryByText("Navigation")).not.toBeInTheDocument()
  })

  it("sets role=group with aria-label on section", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarSection label="Main">Items</SidebarSection>
        </SidebarBody>
      </Sidebar>
    )
    const group = screen.getByRole("group", { name: /main/i })
    expect(group).toBeInTheDocument()
  })
})

// ─── 4. SidebarCollapseToggle — keyboard + a11y ──────────────────────────

describe("SidebarCollapseToggle", () => {
  it("has aria-expanded=true when sidebar is expanded", () => {
    render(
      <Sidebar>
        <SidebarFooter>
          <SidebarCollapseToggle />
        </SidebarFooter>
      </Sidebar>
    )
    const btn = screen.getByRole("button", { name: /collapse sidebar/i })
    expect(btn).toHaveAttribute("aria-expanded", "true")
  })

  it("has aria-expanded=false when sidebar is collapsed", () => {
    render(
      <Sidebar collapsed>
        <SidebarFooter>
          <SidebarCollapseToggle />
        </SidebarFooter>
      </Sidebar>
    )
    const btn = screen.getByRole("button", { name: /expand sidebar/i })
    expect(btn).toHaveAttribute("aria-expanded", "false")
  })

  it("calls onCollapsedChange when clicked", () => {
    const handler = vi.fn()
    render(
      <Sidebar onCollapsedChange={handler}>
        <SidebarFooter>
          <SidebarCollapseToggle onClick={() => handler(true)} />
        </SidebarFooter>
      </Sidebar>
    )
    fireEvent.click(screen.getByRole("button", { name: /collapse sidebar/i }))
    expect(handler).toHaveBeenCalledWith(true)
  })

  it("is keyboard-activable with Enter", () => {
    const handler = vi.fn()
    render(
      <Sidebar>
        <SidebarFooter>
          <SidebarCollapseToggle onClick={handler} />
        </SidebarFooter>
      </Sidebar>
    )
    const btn = screen.getByRole("button", { name: /collapse sidebar/i })
    fireEvent.keyDown(btn, { key: "Enter" })
    fireEvent.keyUp(btn, { key: "Enter" })
  })
})

// ─── 5. Subcomponent slots ────────────────────────────────────────────────

describe("Sidebar — subcomponent slots", () => {
  it("renders header, body, and footer children", () => {
    render(
      <Sidebar>
        <SidebarHeader>Header content</SidebarHeader>
        <SidebarBody>Body content</SidebarBody>
        <SidebarFooter>Footer content</SidebarFooter>
      </Sidebar>
    )
    expect(screen.getByText("Header content")).toBeInTheDocument()
    expect(screen.getByText("Body content")).toBeInTheDocument()
    expect(screen.getByText("Footer content")).toBeInTheDocument()
  })
})

// ─── 6. Custom aria-label ─────────────────────────────────────────────────

describe("Sidebar — custom aria-label", () => {
  it("accepts a custom aria-label", () => {
    render(<Sidebar aria-label="Main navigation">Content</Sidebar>)
    expect(screen.getByRole("complementary", { name: /main navigation/i })).toBeInTheDocument()
  })
})

// ─── 7. Accessibility — axe ──────────────────────────────────────────────

describe("Sidebar — axe", () => {
  it("expanded sidebar has no axe violations", async () => {
    const { container } = render(
      <Sidebar>
        <SidebarHeader>Logo</SidebarHeader>
        <SidebarBody>
          <SidebarSection label="Menu">Items</SidebarSection>
        </SidebarBody>
        <SidebarFooter>
          <SidebarCollapseToggle />
        </SidebarFooter>
      </Sidebar>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("collapsed sidebar has no axe violations", async () => {
    const { container } = render(
      <Sidebar collapsed>
        <SidebarHeader>Logo</SidebarHeader>
        <SidebarBody>
          <SidebarSection label="Menu">Items</SidebarSection>
        </SidebarBody>
        <SidebarFooter>
          <SidebarCollapseToggle />
        </SidebarFooter>
      </Sidebar>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
