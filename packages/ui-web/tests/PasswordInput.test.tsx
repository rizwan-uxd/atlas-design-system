/**
 * Atlas PasswordInput — test suite
 *
 * Coverage:
 *   1. Renders a password field with a named toggle; size matrix (sm | md | lg)
 *   2. Toggle: type, label, aria-pressed, defaultVisible, onVisibleChange, value kept
 *   3. States: disabled blocks field and toggle, invalid sets aria-invalid
 *   4. getPasswordStrength: the five checks and the four levels
 *   5. Strength meter: off by default, hidden while empty, levels as words, live region, describedby
 *   6. Controlled and uncontrolled values
 *   7. axe has no violations per size, visibility and strength
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { PasswordInput, getPasswordStrength, type PasswordInputSize } from "@atlas/ui-web/compositions/PasswordInput/PasswordInput"

const SIZES: PasswordInputSize[] = ["sm", "md", "lg"]
const field = () => screen.getByLabelText("Password", { selector: "input" }) as HTMLInputElement

describe("PasswordInput — structure", () => {
  it("renders a masked field with a toggle", () => {
    render(<PasswordInput aria-label="Password" />)
    expect(field()).toHaveAttribute("type", "password")
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("aria-pressed", "false")
  })

  it.each(SIZES)("renders at size %s", (size) => {
    const { container } = render(<PasswordInput aria-label="Password" size={size} />)
    expect(container.querySelector(`[data-size="${size}"]`)).toBeTruthy()
  })
})

describe("PasswordInput — toggle", () => {
  it("shows and hides the value without losing it", () => {
    render(<PasswordInput aria-label="Password" defaultValue="Secret123!" />)
    fireEvent.click(screen.getByRole("button", { name: "Show password" }))
    expect(field()).toHaveAttribute("type", "text")
    expect(field().value).toBe("Secret123!")
    const hide = screen.getByRole("button", { name: "Hide password" })
    expect(hide).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(hide)
    expect(field()).toHaveAttribute("type", "password")
    expect(field().value).toBe("Secret123!")
  })

  it("starts shown with defaultVisible", () => {
    render(<PasswordInput aria-label="Password" defaultVisible />)
    expect(field()).toHaveAttribute("type", "text")
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument()
  })

  it("reports the new visibility", () => {
    const onVisibleChange = vi.fn()
    render(<PasswordInput aria-label="Password" onVisibleChange={onVisibleChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Show password" }))
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }))
    expect(onVisibleChange).toHaveBeenNthCalledWith(1, true)
    expect(onVisibleChange).toHaveBeenNthCalledWith(2, false)
  })

  it("is a native button that does not submit a form", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(<form onSubmit={onSubmit}><PasswordInput aria-label="Password" /></form>)
    const toggle = screen.getByRole("button", { name: "Show password" })
    expect(toggle.tagName).toBe("BUTTON")
    expect(toggle).toHaveAttribute("type", "button")
    fireEvent.click(toggle)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe("PasswordInput — states", () => {
  it("disables the field and the toggle", () => {
    render(<PasswordInput aria-label="Password" disabled />)
    expect(field()).toBeDisabled()
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled()
  })

  it("sets aria-invalid when invalid", () => {
    render(<PasswordInput aria-label="Password" invalid />)
    expect(field()).toHaveAttribute("aria-invalid", "true")
  })

  it("passes autoComplete through", () => {
    render(<PasswordInput aria-label="Password" autoComplete="new-password" />)
    expect(field()).toHaveAttribute("autocomplete", "new-password")
  })
})

describe("getPasswordStrength", () => {
  it("returns no level for an empty value", () => {
    expect(getPasswordStrength("")).toMatchObject({ level: null, score: 0 })
  })

  it("runs the five checks", () => {
    expect(getPasswordStrength("Abcdefghij1!").checks).toEqual({ length: true, lowercase: true, uppercase: true, number: true, special: true })
    expect(getPasswordStrength("abc").checks).toEqual({ length: false, lowercase: true, uppercase: false, number: false, special: false })
    expect(getPasswordStrength("   ").checks.special).toBe(false)
  })

  it.each([
    ["abc", "weak"],
    ["abcdefghijkl", "weak"],
    ["Abcdefgh", "weak"],
    ["Abcdefg1", "fair"],
    ["Abcdefghijkl", "fair"],
    ["Abcdef1!", "good"],
    ["Abcdefghij1!", "strong"],
  ] as const)("scores %s as %s", (value, level) => {
    expect(getPasswordStrength(value).level).toBe(level)
  })
})

describe("PasswordInput — strength meter", () => {
  it("is off by default", () => {
    render(<PasswordInput aria-label="Password" defaultValue="Abcdefghij1!" />)
    expect(screen.queryByText("Strong")).not.toBeInTheDocument()
  })

  it("shows nothing while the value is empty", () => {
    render(<PasswordInput aria-label="Password" showStrength />)
    expect(screen.queryByText(/Weak|Fair|Good|Strong/)).not.toBeInTheDocument()
  })

  it("writes the level as a word and follows typing", () => {
    render(<PasswordInput aria-label="Password" showStrength />)
    fireEvent.change(field(), { target: { value: "abc" } })
    expect(screen.getByText("Weak")).toBeInTheDocument()
    fireEvent.change(field(), { target: { value: "Abcdef1!" } })
    expect(screen.getByText("Good")).toBeInTheDocument()
    fireEvent.change(field(), { target: { value: "Abcdefghij1!" } })
    expect(screen.getByText("Strong")).toBeInTheDocument()
  })

  it("fills the matching number of segments", () => {
    const { container } = render(<PasswordInput aria-label="Password" showStrength defaultValue="Abcdefg1" />)
    expect(container.querySelectorAll("[data-filled]").length).toBe(2)
  })

  it("announces through a polite live region that describes the field", () => {
    const { container } = render(<PasswordInput aria-label="Password" showStrength aria-describedby="hint" defaultValue="Abcdef1!" />)
    const live = container.querySelector("[aria-live='polite']") as HTMLElement
    expect(live).toBeTruthy()
    expect(live.textContent).toBe("Password strength: Good")
    expect(field().getAttribute("aria-describedby")).toBe(`hint ${live.id}`)
  })

  it("scores a controlled value", () => {
    const { rerender } = render(<PasswordInput aria-label="Password" showStrength value="abc" onChange={() => {}} />)
    expect(screen.getByText("Weak")).toBeInTheDocument()
    rerender(<PasswordInput aria-label="Password" showStrength value="Abcdefghij1!" onChange={() => {}} />)
    expect(screen.getByText("Strong")).toBeInTheDocument()
  })
})

describe("PasswordInput — axe", () => {
  it.each(SIZES.flatMap((size) => [false, true].map((visible) => [size, visible] as const)))(
    "size %s, visible %s has no violations", async (size, visible) => {
      const { container } = render(<PasswordInput aria-label="Password" size={size} defaultVisible={visible} showStrength defaultValue="Abcdef1!" />)
      expect(await axe(container)).toHaveNoViolations()
    })

  it("disabled and invalid have no violations", async () => {
    const { container } = render(<><PasswordInput aria-label="Password" disabled /><PasswordInput aria-label="Confirm password" invalid /></>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
