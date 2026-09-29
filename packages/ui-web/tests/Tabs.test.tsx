/**
 * Atlas Tabs — test suite
 *
 * Coverage:
 *   1. Array API renders List + Triggers + Panels, first item active by default.
 *   2. Variant × size matrix renders without error.
 *   3. Arrow-key roving focus (automatic activation) and manual activation mode.
 *   4. Disabled tab is skipped by arrow navigation.
 *   5. axe accessibility check per variant.
 *   6. Vertical orientation: aria-orientation, Up/Down roving focus.
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { axe } from "jest-axe"
import { Tabs, type TabsVariant, type TabsSize, type TabsOrientation } from "@atlas/ui-web/patterns/Tabs/Tabs"

const items = [
  { id: "one",   label: "Overview" },
  { id: "two",   label: "Details" },
  { id: "three", label: "Settings", disabled: true },
  { id: "four",  label: "Extra" },
].map((item) => ({ ...item, content: <p>{item.label} panel</p> }))

function Basic(props: {
  variant?: TabsVariant
  size?: TabsSize
  orientation?: TabsOrientation
  activationMode?: "automatic" | "manual"
}) {
  return (
    <Tabs
      variant={props.variant}
      size={props.size}
      orientation={props.orientation}
      activationMode={props.activationMode}
      items={items}
    />
  )
}

// ─── 1. Array API ───────────────────────────────────────────────────────────

describe("Tabs array API", () => {
  it("renders a tab per item and activates the first by default", () => {
    render(<Basic />)
    expect(screen.getAllByRole("tab")).toHaveLength(4)
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Overview panel")).toBeInTheDocument()
  })

  it("marks the disabled item's tab as disabled", () => {
    render(<Basic />)
    expect(screen.getByRole("tab", { name: "Settings" })).toBeDisabled()
  })
})

// ─── 2. Variant × size ──────────────────────────────────────────────────────

describe("Tabs variant", () => {
  it.each<TabsVariant>(["line", "pill", "segmented", "outline"])("renders variant=%s without error", (variant) => {
    render(<Basic variant={variant} />)
    expect(screen.getAllByRole("tab")).toHaveLength(4)
  })
})

describe("Tabs size", () => {
  it.each<TabsSize>(["sm", "md", "lg"])("renders size=%s without error", (size) => {
    render(<Basic size={size} />)
    expect(screen.getAllByRole("tab")).toHaveLength(4)
  })
})

// ─── 3. Keyboard activation ─────────────────────────────────────────────────

describe("Tabs keyboard activation", () => {
  it("automatic mode: arrow-right moves focus and activates the next tab", async () => {
    render(<Basic />)
    const overview = screen.getByRole("tab", { name: "Overview" })
    overview.focus()
    fireEvent.keyDown(overview, { key: "ArrowRight" })
    await waitFor(() => expect(screen.getByRole("tab", { name: "Details" })).toHaveFocus())
    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true")
  })

  it("manual mode: arrow-right moves focus without activating; Enter activates", async () => {
    render(<Basic activationMode="manual" />)
    const overview = screen.getByRole("tab", { name: "Overview" })
    overview.focus()
    fireEvent.keyDown(overview, { key: "ArrowRight" })
    const details = screen.getByRole("tab", { name: "Details" })
    await waitFor(() => expect(details).toHaveFocus())
    expect(details).toHaveAttribute("aria-selected", "false")
    fireEvent.keyDown(details, { key: "Enter" })
    await waitFor(() => expect(details).toHaveAttribute("aria-selected", "true"))
  })

  it("skips the disabled tab when moving focus with arrow keys", async () => {
    render(<Basic />)
    const details = screen.getByRole("tab", { name: "Details" })
    details.focus()
    fireEvent.keyDown(details, { key: "ArrowRight" })
    await waitFor(() => expect(screen.getByRole("tab", { name: "Extra" })).toHaveFocus())
  })
})

// ─── 4. Orientation ─────────────────────────────────────────────────────────

describe("Tabs orientation", () => {
  it("defaults to horizontal — no aria-orientation override needed", () => {
    render(<Basic />)
    const tablist = screen.getByRole("tablist")
    expect(tablist).toHaveAttribute("aria-orientation", "horizontal")
  })

  it("vertical: sets aria-orientation and roves focus with Up/Down", async () => {
    render(<Basic orientation="vertical" />)
    const tablist = screen.getByRole("tablist")
    expect(tablist).toHaveAttribute("aria-orientation", "vertical")

    const overview = screen.getByRole("tab", { name: "Overview" })
    overview.focus()
    fireEvent.keyDown(overview, { key: "ArrowDown" })
    await waitFor(() => expect(screen.getByRole("tab", { name: "Details" })).toHaveFocus())
    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true")
  })
})

// ─── 5. Accessibility ───────────────────────────────────────────────────────

describe("Tabs accessibility", () => {
  it.each<TabsVariant>(["line", "pill", "segmented", "outline"])("has no axe violations, variant=%s", async (variant) => {
    const { container } = render(<Basic variant={variant} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("has no axe violations, orientation=vertical", async () => {
    const { container } = render(<Basic orientation="vertical" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
