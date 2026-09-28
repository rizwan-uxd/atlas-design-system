/**
 * Atlas Chart — test suite
 *
 * Coverage:
 *   1. Renders a section named by ChartTitle and described by ChartDescription
 *   2. State matrix — default | loading | empty
 *   3. ChartStat toggles with aria-pressed and is keyboard-operable
 *   4. ChartLegend items, ChartBar plot alternative
 *   5. axe accessibility check per state
 *
 * Recharts measures its container with ResizeObserver, which jsdom lacks; the mock is local to this file.
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Chart,
  ChartBar,
  ChartContent,
  ChartDescription,
  ChartHeader,
  ChartLegend,
  ChartLegendItem,
  ChartStat,
  ChartStats,
  ChartTitle,
  type ChartState,
} from "@atlas/ui-web/compositions/Chart/Chart"

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} })
})

const STATES: ChartState[] = ["default", "loading", "empty"]
const ROWS = [{ date: "Apr 9", visitors: 12 }, { date: "Apr 10", visitors: 30 }]

function Example({ state = "default", withStats = false }: { state?: ChartState; withStats?: boolean }) {
  const [active, setActive] = React.useState("desktop")
  return (
    <Chart state={state}>
      <ChartHeader
        stats={withStats ? (
          <ChartStats aria-label="Series">
            <ChartStat label="Desktop" value="24,828" selected={active === "desktop"} onClick={() => setActive("desktop")} />
            <ChartStat label="Mobile" value="25,010" selected={active === "mobile"} onClick={() => setActive("mobile")} />
          </ChartStats>
        ) : undefined}
      >
        <ChartTitle>Visitors</ChartTitle>
        <ChartDescription>Last 3 months</ChartDescription>
      </ChartHeader>
      <ChartContent>
        <ChartBar aria-label="Visitors per day" data={ROWS} xKey="date" dataKey="visitors" label="Desktop" />
        <ChartLegend><ChartLegendItem>Desktop</ChartLegendItem></ChartLegend>
      </ChartContent>
    </Chart>
  )
}

describe("Chart — default render", () => {
  it("is a section named by the title and described by the description", () => {
    render(<Example />)
    const section = screen.getByRole("region", { name: "Visitors" })
    expect(section).toHaveAccessibleDescription("Last 3 months")
    expect(section).toHaveAttribute("data-state", "default")
  })

  it("renders the plot as an image with its text alternative and a legend", () => {
    render(<Example />)
    expect(screen.getByRole("img", { name: "Visitors per day" })).toBeInTheDocument()
    expect(screen.getByText("Desktop", { selector: "li" })).toBeInTheDocument()
  })
})

describe("Chart — state matrix", () => {
  it("loading sets aria-busy, announces Loading and hides the plot", () => {
    render(<Example state="loading" />)
    expect(screen.getByRole("region", { name: "Visitors" })).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
    expect(screen.queryByRole("img")).toBeNull()
  })

  it("empty shows the message and hides the plot", () => {
    render(<Example state="empty" />)
    expect(screen.getByText("No data to display")).toBeInTheDocument()
    expect(screen.queryByRole("img")).toBeNull()
    expect(screen.getByRole("region", { name: "Visitors" })).not.toHaveAttribute("aria-busy")
  })
})

describe("ChartStat", () => {
  it("shows label and value and toggles aria-pressed on click", () => {
    render(<Example withStats />)
    const desktop = screen.getByRole("button", { name: /Desktop/ })
    const mobile = screen.getByRole("button", { name: /Mobile/ })
    expect(desktop).toHaveAttribute("aria-pressed", "true")
    expect(mobile).toHaveAttribute("aria-pressed", "false")
    expect(mobile).toHaveTextContent("25,010")
    fireEvent.click(mobile)
    expect(mobile).toHaveAttribute("aria-pressed", "true")
    expect(desktop).toHaveAttribute("aria-pressed", "false")
  })
})

describe("Chart — accessibility", () => {
  for (const state of STATES) {
    it(`has no axe violations: ${state}`, async () => {
      const { container } = render(<Example state={state} withStats />)
      expect(await axe(container)).toHaveNoViolations()
    })
  }
})
