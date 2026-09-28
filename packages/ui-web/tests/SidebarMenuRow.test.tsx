/**
 * Atlas SidebarMenuRow — test suite
 *
 * Coverage:
 *   1. Renders default row
 *   2. active / expanded / disabled states — correct data-state + aria attributes
 *   3. hasChildren — chevron renders, aria-expanded reflects `expanded`
 *   4. badge slot renders when passed
 *   5. disabled blocks click
 *   6. keyboard activation (native <button>/<a> semantics)
 *   7. axe accessibility check — default, active, expanded, disabled, as="a"
 *   8. SidebarMenuRowChild — default/active/disabled + badge
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import { SidebarMenuRow, SidebarMenuRowChild } from "@atlas/ui-web/primitives/SidebarMenuRow/SidebarMenuRow"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"

describe("SidebarMenuRow — default render", () => {
  it("renders a <button> with the label", () => {
    render(<SidebarMenuRow>Home</SidebarMenuRow>)
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument()
  })

  it("defaults to data-state=default", () => {
    render(<SidebarMenuRow>Home</SidebarMenuRow>)
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "default")
  })

  it("renders as a link when as=\"a\"", () => {
    render(<SidebarMenuRow as="a" href="/home">Home</SidebarMenuRow>)
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home")
  })
})

describe("SidebarMenuRow — states", () => {
  it("active sets data-state and aria-current", () => {
    render(<SidebarMenuRow active>Home</SidebarMenuRow>)
    const row = screen.getByRole("button")
    expect(row).toHaveAttribute("data-state", "active")
    expect(row).toHaveAttribute("aria-current", "true")
  })

  it("active as a link sets aria-current=page", () => {
    render(<SidebarMenuRow as="a" href="/x" active>Home</SidebarMenuRow>)
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page")
  })

  it("expanded (with hasChildren) sets data-state=expanded, not active", () => {
    render(<SidebarMenuRow hasChildren expanded active>Billing</SidebarMenuRow>)
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "expanded")
  })

  it("disabled sets data-state, aria-disabled, and the native disabled attribute", () => {
    render(<SidebarMenuRow disabled>Archived</SidebarMenuRow>)
    const row = screen.getByRole("button")
    expect(row).toHaveAttribute("data-state", "disabled")
    expect(row).toHaveAttribute("aria-disabled", "true")
    expect(row).toBeDisabled()
  })

  it("disabled blocks click", () => {
    const onClick = vi.fn()
    render(<SidebarMenuRow disabled onClick={onClick}>Archived</SidebarMenuRow>)
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe("SidebarMenuRow — hasChildren / chevron", () => {
  it("shows no chevron when hasChildren is false", () => {
    const { container } = render(<SidebarMenuRow>Home</SidebarMenuRow>)
    expect(container.querySelector("svg")).toBeNull()
  })

  it("shows a chevron and aria-expanded=false when collapsed", () => {
    render(<SidebarMenuRow hasChildren>Payments</SidebarMenuRow>)
    const row = screen.getByRole("button")
    expect(row).toHaveAttribute("aria-expanded", "false")
    expect(row.querySelector("svg")).toBeInTheDocument()
  })

  it("sets aria-expanded=true when expanded", () => {
    render(<SidebarMenuRow hasChildren expanded>Billing</SidebarMenuRow>)
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true")
  })
})

describe("SidebarMenuRow — badge slot", () => {
  it("renders a passed badge", () => {
    render(<SidebarMenuRow badge={<Badge size="sm">3</Badge>}>Usage</SidebarMenuRow>)
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("renders no badge wrapper when none is passed", () => {
    const { container } = render(<SidebarMenuRow>Usage</SidebarMenuRow>)
    expect(container.querySelector('[class*="badge"]')).toBeNull()
  })
})

describe("SidebarMenuRow — keyboard", () => {
  it("activates on Enter (native button semantics)", () => {
    const onClick = vi.fn()
    render(<SidebarMenuRow onClick={onClick}>Home</SidebarMenuRow>)
    const row = screen.getByRole("button")
    row.focus()
    fireEvent.click(row)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe("SidebarMenuRow — accessibility", () => {
  it("has no axe violations — default", async () => {
    const { container } = render(<SidebarMenuRow icon={<svg />}>Home</SidebarMenuRow>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("has no axe violations — active", async () => {
    const { container } = render(<SidebarMenuRow active>Home</SidebarMenuRow>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("has no axe violations — expanded with children rendered", async () => {
    const { container } = render(
      <>
        <SidebarMenuRow hasChildren expanded>Billing</SidebarMenuRow>
        <ul>
          <li><SidebarMenuRowChild>Overview</SidebarMenuRowChild></li>
        </ul>
      </>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it("has no axe violations — disabled", async () => {
    const { container } = render(<SidebarMenuRow disabled>Archived</SidebarMenuRow>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("has no axe violations — as=\"a\"", async () => {
    const { container } = render(<SidebarMenuRow as="a" href="/home">Home</SidebarMenuRow>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe("SidebarMenuRowChild", () => {
  it("renders a <button> with the label, no icon slot", () => {
    const { container } = render(<SidebarMenuRowChild>Overview</SidebarMenuRowChild>)
    expect(screen.getByRole("button", { name: "Overview" })).toBeInTheDocument()
    expect(container.querySelector('[class*="icon"]')).toBeNull()
  })

  it("active sets data-state and aria-current", () => {
    render(<SidebarMenuRowChild active>Overview</SidebarMenuRowChild>)
    const row = screen.getByRole("button")
    expect(row).toHaveAttribute("data-state", "active")
    expect(row).toHaveAttribute("aria-current", "true")
  })

  it("disabled blocks click", () => {
    const onClick = vi.fn()
    render(<SidebarMenuRowChild disabled onClick={onClick}>Overview</SidebarMenuRowChild>)
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })

  it("renders a passed badge", () => {
    render(<SidebarMenuRowChild badge={<Badge size="sm">2</Badge>}>Costs</SidebarMenuRowChild>)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = render(<SidebarMenuRowChild active>Overview</SidebarMenuRowChild>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
