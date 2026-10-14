/**
 * Atlas OtpInput — test suite
 *
 * Coverage:
 *   1. Renders one slot per digit and a single labelled input
 *   2. Size × Length matrix renders
 *   3. Typing filters to digits and cuts to length; paste and autofill go through the same path
 *   4. onValueChange and onComplete (once, at full length)
 *   5. Controlled and uncontrolled values; length clamped to 4–8
 *   6. States: invalid sets aria-invalid, disabled blocks input
 *   7. Active slot follows the value
 *   8. axe accessibility check per size and state
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import { OtpInput, type OtpInputSize } from "@atlas/ui-web/compositions/OtpInput/OtpInput"

const SIZES: OtpInputSize[] = ["sm", "md", "lg"]
const LENGTHS = [4, 5, 6, 7, 8]

function field() {
  return screen.getByLabelText("Verification code") as HTMLInputElement
}
function slotEls(container: HTMLElement) {
  return Array.from(container.querySelectorAll("span")) as HTMLElement[]
}

describe("OtpInput", () => {
  it("renders six slots and one numeric one-time-code input by default", () => {
    const { container } = render(<OtpInput aria-label="Verification code" />)
    expect(slotEls(container)).toHaveLength(6)
    const input = field()
    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("autocomplete", "one-time-code")
    expect(container.querySelectorAll("input")).toHaveLength(1)
  })

  describe.each(SIZES)("size %s", (size) => {
    it.each(LENGTHS)("renders length %i", (length) => {
      const { container } = render(<OtpInput aria-label="Verification code" size={size} length={length} />)
      expect(slotEls(container)).toHaveLength(length)
      expect(container.firstElementChild).toHaveAttribute("data-size", size)
    })
  })

  it("clamps length to 4–8", () => {
    const { container, rerender } = render(<OtpInput aria-label="Verification code" length={2} />)
    expect(slotEls(container)).toHaveLength(4)
    rerender(<OtpInput aria-label="Verification code" length={12} />)
    expect(slotEls(container)).toHaveLength(8)
  })

  it("keeps only digits and cuts to length (typing, paste and autofill)", () => {
    const onValueChange = vi.fn()
    const { container } = render(<OtpInput aria-label="Verification code" onValueChange={onValueChange} />)
    fireEvent.change(field(), { target: { value: "12a3" } })
    expect(field().value).toBe("123")
    expect(slotEls(container).map((s) => s.textContent).join("")).toBe("123")
    fireEvent.change(field(), { target: { value: "123 456 789" } })
    expect(field().value).toBe("123456")
    expect(onValueChange).toHaveBeenLastCalledWith("123456")
  })

  it("calls onComplete once, when the value reaches length", () => {
    const onComplete = vi.fn()
    render(<OtpInput aria-label="Verification code" length={4} onComplete={onComplete} />)
    fireEvent.change(field(), { target: { value: "123" } })
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.change(field(), { target: { value: "1234" } })
    fireEvent.change(field(), { target: { value: "1234x" } })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith("1234")
  })

  it("supports a controlled value", () => {
    const onValueChange = vi.fn()
    const { container, rerender } = render(
      <OtpInput aria-label="Verification code" value="12" onValueChange={onValueChange} />,
    )
    expect(slotEls(container).map((s) => s.textContent).join("")).toBe("12")
    fireEvent.change(field(), { target: { value: "123" } })
    expect(onValueChange).toHaveBeenCalledWith("123")
    rerender(<OtpInput aria-label="Verification code" value="123" onValueChange={onValueChange} />)
    expect(field().value).toBe("123")
  })

  it("supports defaultValue when uncontrolled", () => {
    render(<OtpInput aria-label="Verification code" defaultValue="98" />)
    expect(field().value).toBe("98")
  })

  it("marks the slot that takes the next digit as active", () => {
    const { container } = render(<OtpInput aria-label="Verification code" defaultValue="12" />)
    const active = slotEls(container).findIndex((s) => s.hasAttribute("data-active"))
    expect(active).toBe(2)
    fireEvent.change(field(), { target: { value: "123456" } })
    const full = slotEls(container).findIndex((s) => s.hasAttribute("data-active"))
    expect(full).toBe(5)
  })

  it("invalid sets aria-invalid and the invalid marker", () => {
    const { container } = render(<OtpInput aria-label="Verification code" invalid />)
    expect(field()).toHaveAttribute("aria-invalid", "true")
    expect(container.firstElementChild).toHaveAttribute("data-invalid")
  })

  it("disabled blocks the input", () => {
    const { container } = render(<OtpInput aria-label="Verification code" disabled />)
    expect(field()).toBeDisabled()
    expect(container.firstElementChild).toHaveAttribute("data-disabled")
  })

  it("never moves the caret off the end with arrow keys", () => {
    render(<OtpInput aria-label="Verification code" defaultValue="12" />)
    const notPrevented = fireEvent.keyDown(field(), { key: "ArrowLeft" })
    expect(notPrevented).toBe(false)
  })

  it("keeps the slots hidden from assistive technology", () => {
    const { container } = render(<OtpInput aria-label="Verification code" />)
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull()
  })

  describe("axe", () => {
    it.each(SIZES)("size %s has no violations", async (size) => {
      const { container } = render(<OtpInput aria-label="Verification code" size={size} defaultValue="123" />)
      expect(await axe(container)).toHaveNoViolations()
    })
    it("invalid and disabled have no violations", async () => {
      const a = render(<OtpInput aria-label="Verification code" invalid />)
      expect(await axe(a.container)).toHaveNoViolations()
      const b = render(<OtpInput aria-label="Verification code" disabled />)
      expect(await axe(b.container)).toHaveNoViolations()
    })
  })
})
