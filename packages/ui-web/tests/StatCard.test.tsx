/**
 * Atlas StatCard — test suite
 *
 * Coverage:
 *   1. Renders label, period, value and delta on an outlined Card
 *   2. Size matrix (sm | md | lg)
 *   3. Delta words per trend, sentiment defaults and override, trendLabel
 *   4. Loading: skeletons in place of the value and delta, aria-busy on the content
 *   5. No delta renders no badge
 *   6. Leading icon: rendered decorative above the value, kept while loading, absent by default
 *   7. Clickable: one button named by the label, onClick, disabled, loading and static cases
 *   8. axe has no violations per state
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import { StatCard, type StatCardSize, type StatCardTrend } from "@atlas/ui-web/compositions/StatCard/StatCard"

const SIZES: StatCardSize[] = ["sm", "md", "lg"]
const base = { label: "Visitors", period: "Last 7 days", value: "12,480" }

describe("StatCard — content", () => {
  it("renders the label, period and value", () => {
    render(<StatCard {...base} />)
    expect(screen.getByRole("heading", { name: "Visitors" })).toBeInTheDocument()
    expect(screen.getByText("Last 7 days")).toBeInTheDocument()
    expect(screen.getByText("12,480")).toBeInTheDocument()
  })

  it.each(SIZES)("renders at size %s", (size) => {
    const { container } = render(<StatCard {...base} size={size} />)
    expect(container.querySelector(`[data-size="${size}"]`)).toBeTruthy()
  })

  it("renders no delta badge when delta is omitted", () => {
    const { container } = render(<StatCard {...base} />)
    expect(container.textContent).not.toMatch(/Up|Down|Flat/)
  })
})

describe("StatCard — delta", () => {
  it.each([
    ["up", "Up 12% vs previous period"],
    ["down", "Down 12% vs previous period"],
    ["flat", "Flat 12% vs previous period"],
  ] as [StatCardTrend, string][])("writes the direction word for %s", (trend, text) => {
    render(<StatCard {...base} delta={{ text: "12% vs previous period", trend }} />)
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it("trendLabel replaces the direction word", () => {
    render(<StatCard {...base} delta={{ text: "12 % gegenüber Vorperiode", trend: "up", trendLabel: "Plus" }} />)
    expect(screen.getByText("Plus 12 % gegenüber Vorperiode")).toBeInTheDocument()
  })

  it("sentiment defaults from the trend and can be overridden", () => {
    const { rerender } = render(<StatCard {...base} delta={{ text: "5%", trend: "down" }} />)
    const badge = () => screen.getByText("Down 5%")
    const toneDown = badge().className
    rerender(<StatCard {...base} delta={{ text: "5%", trend: "down", sentiment: "positive" }} />)
    expect(badge().className).not.toBe(toneDown)
    rerender(<StatCard {...base} delta={{ text: "5%", trend: "up" }} />)
    const toneUp = screen.getByText("Up 5%").className
    rerender(<StatCard {...base} delta={{ text: "5%", trend: "down", sentiment: "positive" }} />)
    expect(badge().className).toBe(toneUp)
  })
})

describe("StatCard — loading", () => {
  it("shows skeletons instead of the value and delta, and marks the content busy", () => {
    const { container } = render(
      <StatCard {...base} loading delta={{ text: "12% vs previous period", trend: "up" }} />,
    )
    expect(screen.queryByText("12,480")).toBeNull()
    expect(screen.queryByText(/Up 12%/)).toBeNull()
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2)
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  })

  it("is not busy when loaded", () => {
    const { container } = render(<StatCard {...base} />)
    expect(container.querySelector("[aria-busy]")).toBeNull()
  })
})

describe("StatCard — leading icon", () => {
  const Icon = () => <svg data-testid="stat-icon" viewBox="0 0 24 24" />

  it("renders the icon decorative, above the value", () => {
    render(<StatCard {...base} icon={<Icon />} />)
    const icon = screen.getByTestId("stat-icon")
    expect(icon.parentElement).toHaveAttribute("aria-hidden", "true")
    const value = screen.getByText("12,480")
    expect(icon.compareDocumentPosition(value) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("keeps the icon while loading", () => {
    render(<StatCard {...base} loading icon={<Icon />} />)
    expect(screen.getByTestId("stat-icon")).toBeInTheDocument()
  })

  it("renders no icon wrapper by default", () => {
    render(<StatCard {...base} />)
    expect(screen.queryByTestId("stat-icon")).toBeNull()
  })
})

describe("StatCard — clickable", () => {
  it("is not a button without onClick", () => {
    render(<StatCard {...base} />)
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("renders one button named by the label and calls onClick", () => {
    const onClick = vi.fn()
    render(<StatCard {...base} onClick={onClick} />)
    const button = screen.getByRole("button", { name: "Visitors" })
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getAllByRole("button")).toHaveLength(1)
  })

  it("disabled blocks the click and marks the button disabled", () => {
    const onClick = vi.fn()
    render(<StatCard {...base} onClick={onClick} disabled />)
    const button = screen.getByRole("button", { name: "Visitors" })
    expect(button).toHaveAttribute("aria-disabled", "true")
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("disabled without onClick stays a static card", () => {
    render(<StatCard {...base} disabled />)
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("a loading card is not clickable", () => {
    const onClick = vi.fn()
    render(<StatCard {...base} loading onClick={onClick} />)
    expect(screen.queryByRole("button")).toBeNull()
  })
})

describe("StatCard — accessibility", () => {
  it.each([
    ["default", {}],
    ["delta up", { delta: { text: "12% vs previous period", trend: "up" as const } }],
    ["delta down good", { delta: { text: "3%", trend: "down" as const, sentiment: "positive" as const } }],
    ["loading", { loading: true }],
    ["icon", { icon: <svg viewBox="0 0 24 24" /> }],
    ["clickable", { onClick: () => {} }],
    ["clickable disabled", { onClick: () => {}, disabled: true }],
  ])("has no axe violations: %s", async (_name, props) => {
    const { container } = render(<StatCard {...base} {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
