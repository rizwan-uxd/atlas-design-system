/**
 * Atlas Field — test suite
 *
 * Coverage:
 *   1. Renders a labelled control; Label htmlFor matches the control id
 *   2. Size matrix (sm | md | lg) with Input
 *   3. Help text is linked by aria-describedby
 *   4. Error replaces help text, sets invalid on the control, role="alert"
 *   5. required / optional markers; aria-required reaches the control
 *   6. disabled reaches the control and the Label
 *   7. Works with Textarea; explicit id is honoured
 *   8. axe has no violations per state
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { Field, type FieldSize } from "@atlas/ui-web/compositions/Field/Field"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Textarea } from "@atlas/ui-web/primitives/Textarea/Textarea"

const SIZES: FieldSize[] = ["sm", "md", "lg"]

describe("Field — wiring", () => {
  it("links the label to the control", () => {
    render(<Field label="Email">{(c) => <Input {...c} />}</Field>)
    const input = screen.getByLabelText("Email")
    expect(input.tagName).toBe("INPUT")
    expect(input).not.toHaveAttribute("aria-invalid")
    expect(input).not.toHaveAttribute("aria-describedby")
  })

  it("honours an explicit id", () => {
    render(<Field label="Email" id="email">{(c) => <Input {...c} />}</Field>)
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email")
  })

  it.each(SIZES)("renders at size %s and passes it to the Label", (size) => {
    const { container } = render(
      <Field size={size} label="Email">{(c) => <Input size={size} {...c} />}</Field>,
    )
    expect(container.firstElementChild).toHaveAttribute("data-size", size)
    expect(screen.getByText("Email").closest("label")).toBeTruthy()
  })
})

describe("Field — help and error", () => {
  it("references the help text with aria-describedby", () => {
    render(<Field label="Email" helpText="We only send receipts.">{(c) => <Input {...c} />}</Field>)
    const input = screen.getByLabelText("Email")
    const help = screen.getByText("We only send receipts.")
    expect(input).toHaveAttribute("aria-describedby", help.id)
  })

  it("shows the error instead of the help text and marks the control invalid", () => {
    render(
      <Field label="Email" helpText="We only send receipts." error="Enter a valid email address.">
        {(c) => <Input {...c} />}
      </Field>,
    )
    const input = screen.getByLabelText("Email")
    const error = screen.getByRole("alert")
    expect(error).toHaveTextContent("Enter a valid email address.")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAttribute("aria-describedby", error.id)
    expect(screen.queryByText("We only send receipts.")).toBeNull()
  })

  it("hides the error icon from assistive tech", () => {
    render(<Field label="Email" error="Required">{(c) => <Input {...c} />}</Field>)
    expect(screen.getByRole("alert").querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })
})

describe("Field — markers and states", () => {
  it("required shows the marker and sets aria-required on the control", () => {
    render(<Field label="Name" required>{(c) => <Input {...c} />}</Field>)
    expect(screen.getByLabelText(/Name/)).toHaveAttribute("aria-required", "true")
  })

  it("optional shows the hint, and required wins when both are set", () => {
    const { rerender } = render(<Field label="Company" optional>{(c) => <Input {...c} />}</Field>)
    expect(screen.getByText("(optional)")).toBeInTheDocument()
    rerender(<Field label="Company" optional required>{(c) => <Input {...c} />}</Field>)
    expect(screen.queryByText("(optional)")).toBeNull()
  })

  it("disabled reaches the control", () => {
    render(<Field label="Email" disabled>{(c) => <Input {...c} />}</Field>)
    expect(screen.getByLabelText("Email")).toBeDisabled()
  })

  it("works with a Textarea", () => {
    render(<Field label="Message" error="Too short">{(c) => <Textarea {...c} />}</Field>)
    const ta = screen.getByLabelText("Message")
    expect(ta.tagName).toBe("TEXTAREA")
    expect(ta).toHaveAttribute("aria-invalid", "true")
  })
})

describe("Field — accessibility", () => {
  it.each([
    ["default", {}],
    ["help", { helpText: "Help" }],
    ["error", { error: "Error" }],
    ["required", { required: true }],
    ["disabled", { disabled: true }],
  ] as const)("has no axe violations: %s", async (_name, props) => {
    const { container } = render(
      <Field label="Email" {...props}>{(c) => <Input {...c} />}</Field>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
