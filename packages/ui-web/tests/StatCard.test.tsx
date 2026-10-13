/**
 * Atlas StatCard — test suite
 *
 * Coverage:
 *   1. Renders label, period, value and delta on an outlined Card
 *   2. Size matrix (sm | md | lg)
 *   3. Delta words per trend, sentiment defaults and override, trendLabel
 *   4. Loading: skeletons in place of the value and delta, aria-busy on the content
 *   5. No delta renders no badge
 *   6. axe has no violations per state
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
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

describe("StatCard — accessibility", () => {
  it.each([
    ["default", {}],
    ["delta up", { delta: { text: "12% vs previous period", trend: "up" as const } }],
    ["delta down good", { delta: { text: "3%", trend: "down" as const, sentiment: "positive" as const } }],
    ["loading", { loading: true }],
  ])("has no axe violations: %s", async (_name, props) => {
    const { container } = render(<StatCard {...base} {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
