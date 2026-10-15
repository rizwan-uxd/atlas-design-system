/**
 * Atlas Stepper — test suite
 *
 * Coverage:
 *   1. Renders an ordered list with one item per step, named by aria-label
 *   2. Orientation × Steps matrix renders; no size prop (the viewport is CSS, DEC-074)
 *   3. Status follows `current`: complete, current (aria-current="step"), upcoming
 *   4. Complete steps show a check, the others show their number
 *   5. Status is written for assistive technology, not colour alone
 *   6. Connectors: none after the last step, in both orientations
 *   7. Description is optional; edge values of `current`
 *   8. Display only: no buttons or links
 *   9. Mobile summary (horizontal only): ring text "N of M", current label, "Next: ..." line (none on the last
 *      step), aria-hidden, and the list still carries every step
 *  10. axe accessibility check per orientation and step count
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Stepper,
  getStepStatus,
  type StepperOrientation,
} from "@atlas/ui-web/patterns/Stepper/Stepper"

const ORIENTATIONS: StepperOrientation[] = ["horizontal", "vertical"]
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
    it.each([3, 4, 5])("renders %i steps", (n) => {
      const { container } = render(
        <Stepper aria-label="Setup" orientation={orientation} steps={STEPS.slice(0, n)} current={2} />,
      )
      expect(items(container)).toHaveLength(n)
      expect(container.querySelector("ol")).toHaveAttribute("data-orientation", orientation)
      expect(container.querySelector("ol")).not.toHaveAttribute("data-size")
    })

    // On mobile the CSS clips every label but the current one; they must stay in the DOM and be read out.
    it("keeps every step's label and status in the document", () => {
      const { container } = render(<Stepper aria-label="Setup" orientation={orientation} steps={STEPS.slice(0, 4)} current={2} />)
      const texts = items(container).map((li) => li.textContent)
      expect(texts[0]).toContain("Account, completed")
      expect(texts[1]).toContain("Profile, current step")
      expect(texts[2]).toContain("Team, upcoming")
      expect(texts[3]).toContain("Review, upcoming")
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

  describe("mobile summary (horizontal)", () => {
    const summaryOf = (container: HTMLElement) => container.querySelector("div[aria-hidden='true']") as HTMLElement | null

    it("shows N of M, the current label and the next label", () => {
      const { container } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 4)} current={2} />)
      const summary = summaryOf(container)!
      expect(summary).not.toBeNull()
      expect(summary).toHaveTextContent("2 of 4")
      expect(summary).toHaveTextContent("Profile")
      expect(summary).toHaveTextContent("Next: Team")
    })

    it("fills the ring to current / steps through one custom property", () => {
      const { container } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 4)} current={3} />)
      const ring = summaryOf(container)!.firstElementChild as HTMLElement
      expect(ring.style.getPropertyValue("--stepper-progress")).toBe("75")
    })

    it("has no next line on the last step", () => {
      const { container } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 3)} current={3} />)
      const summary = summaryOf(container)!
      expect(summary).toHaveTextContent("3 of 3")
      expect(summary).not.toHaveTextContent("Next:")
    })

    it("is hidden from assistive technology while the list keeps every step", () => {
      const { container } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 4)} current={2} />)
      expect(summaryOf(container)).toHaveAttribute("aria-hidden", "true")
      expect(screen.getByRole("list", { name: "Setup" })).toBeInTheDocument()
      expect(items(container)).toHaveLength(4)
      expect(screen.getByText(/Review/, { selector: "li *" })).toBeInTheDocument()
    })

    it("clamps current into the range: above the count shows the last step, 0 shows the first", () => {
      const { container, rerender } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, 3)} current={9} />)
      expect(summaryOf(container)).toHaveTextContent("3 of 3")
      rerender(<Stepper aria-label="Setup" steps={STEPS.slice(0, 3)} current={0} />)
      expect(summaryOf(container)).toHaveTextContent("1 of 3")
    })

    it("is not rendered for the vertical orientation", () => {
      const { container } = render(<Stepper aria-label="Setup" orientation="vertical" steps={STEPS.slice(0, 3)} current={2} />)
      expect(summaryOf(container)).toBeNull()
    })
  })

  describe("axe", () => {
    it.each(ORIENTATIONS)("%s has no violations", async (orientation) => {
      const { container } = render(
        <Stepper aria-label="Setup" orientation={orientation} steps={[...STEPS.slice(0, 3)].map((s) => ({ ...s, description: "More" }))} current={2} />,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
    it.each([3, 4, 5])("%i steps have no violations", async (n) => {
      const { container } = render(<Stepper aria-label="Setup" steps={STEPS.slice(0, n)} current={2} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
