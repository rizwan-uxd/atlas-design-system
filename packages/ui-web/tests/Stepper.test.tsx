/**
 * Atlas Stepper — test suite
 *
 * Coverage:
 *   1. Renders an ordered list with one item per step, named by aria-label
 *   2. Orientation × Size × Steps matrix renders
 *   3. Status follows `current`: complete, current (aria-current="step"), upcoming
 *   4. Complete steps show a check, the others show their number
 *   5. Status is written for assistive technology, not colour alone
 *   6. Connectors: none after the last step, in both orientations
 *   7. Description is optional; edge values of `current`
 *   8. Display only: no buttons or links
 *   9. axe accessibility check per orientation and size
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Stepper,
  getStepStatus,
  type StepperOrientation,
  type StepperSize,
} from "@atlas/ui-web/patterns/Stepper/Stepper"

const ORIENTATIONS: StepperOrientation[] = ["horizontal", "vertical"]
const SIZES: StepperSize[] = ["sm", "md", "lg"]
const STEPS = [{ label: "Account" }, { label: "Profile" }, { label: "Team" }, { label: "Review" }, { label: "Launch" }]

function items(container: HTMLElement) {
  return Array.from(container.querySelectorAll("li")) as HTMLElement[]
}

describe("Stepper", () => {
  it("renders a named ordered list with one item per step", () => {
    const { container } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 4)} current={2} />)
    expect(screen.getByRole("list", { name: "Setup" }).tagName).toBe("OL")
    expect(items(container)).toHaveLength(4)
  })

  describe.each(ORIENTATIONS)("%s", (orientation) => {
    describe.each(SIZES)("size %s", (size) => {
      it.each([3, 4, 5])("renders %i steps", (n) => {
        const { container } = render(
          <Stepper aria-label="Setup" orientation={orientation} size={size} steps={STEPS.slice(0, n)} current={2} />,
        )
        expect(items(container)).toHaveLength(n)
        expect(container.firstElementChild).toHaveAttribute("data-orientation", orientation)
        expect(container.firstElementChild).toHaveAttribute("data-size", size)
      })
    })

    it("has a connector after every step except the last", () => {
      const { container } = render(<Stepper aria-label="Setup" orientation={orientation} steps={STEPS.slice(0, 4)} current={1} />)
      const withConnector = items(container).filter((li) => li.querySelector("span[aria-hidden='true']:empty"))
      expect(withConnector).toHaveLength(3)
      expect(items(container)[3]).toHaveAttribute("data-last")
      expect(items(container)[3].querySelector("span[aria-hidden='true']:empty")).toBeNull()
    })
  })

  it("derives status from current", () => {
    const { container } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 4)} current={3} />)
    expect(items(container).map((li) => li.getAttribute("data-status"))).toEqual(["complete", "complete", "current", "upcoming"])
    expect(items(container).map((li) => li.getAttribute("aria-current"))).toEqual([null, null, "step", null])
  })

  it("getStepStatus follows the 1-based rule", () => {
    expect(getStepStatus(1, 2)).toBe("complete")
    expect(getStepStatus(2, 2)).toBe("current")
    expect(getStepStatus(3, 2)).toBe("upcoming")
  })

  it("shows a check for complete steps and the number for the rest", () => {
    const { container } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 3)} current={2} />)
    const [a, b, c] = items(container)
    expect(a.querySelector("svg")).not.toBeNull()
    expect(b.textContent).toContain("2")
    expect(b.querySelector("svg")).toBeNull()
    expect(c.textContent).toContain("3")
  })

  it("writes each status for assistive technology", () => {
    render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 3)} current={2} />)
    expect(screen.getByText(", completed")).toBeInTheDocument()
    expect(screen.getByText(", current step")).toBeInTheDocument()
    expect(screen.getByText(", upcoming")).toBeInTheDocument()
  })

  it("marks every step complete when current is above the count and none when 0", () => {
    const { container, rerender } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 3)} current={4} />)
    expect(items(container).every((li) => li.getAttribute("data-status") === "complete")).toBe(true)
    expect(container.querySelector("[aria-current]")).toBeNull()
    rerender(<Stepper aria-label="Setup" steps={STEPS.slice(0, 3)} current={0} />)
    expect(items(container).every((li) => li.getAttribute("data-status") === "upcoming")).toBe(true)
  })

  it("renders an optional description", () => {
    render(<Stepper aria-label="Setup" steps={[{ label: "Account", description: "Email and password" }, { label: "Profile" }]} current={1} />)
    expect(screen.getByText("Email and password")).toBeInTheDocument()
  })

  it("is display only", () => {
    render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 3)} current={2} />)
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.queryByRole("link")).toBeNull()
  })

  describe("axe", () => {
    it.each(ORIENTATIONS)("%s has no violations", async (orientation) => {
      const { container } = render(
        <Stepper aria-label="Setup" orientation={orientation} steps={[...STEPS.slice(0, 3)].map((s) => ({ ...s, description: "More" }))} current={2} />,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
    it.each(SIZES)("size %s has no violations", async (size) => {
      const { container } = render(<Stepper aria-label="Setup" size={size} steps={STEPS} current={3} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
