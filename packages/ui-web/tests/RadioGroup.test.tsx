/**
 * Atlas RadioGroup — test suite
 *
 * Coverage:
 *   1. Semantics — radiogroup, native radios, naming, description
 *   2. Selection — uncontrolled, controlled, one selected at a time (arrow keys are native browser
 *      behaviour, checked in the browser, not in jsdom)
 *   3. Variant × size matrix and direction — data attributes, axe clean
 *   4. States — disabled blocks selection, invalid sets aria-invalid, item overrides
 *   5. Guard — item outside a group throws
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupVariant,
  type RadioGroupSize,
  type RadioGroupDirection,
} from "@atlas/ui-web/primitives/RadioGroup/RadioGroup"

const VARIANTS: RadioGroupVariant[] = ["default", "card"]
const SIZES: RadioGroupSize[] = ["sm", "md"]
const DIRECTIONS: RadioGroupDirection[] = ["vertical", "horizontal"]

function Basic(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup aria-label="Plan" {...props}>
      <RadioGroupItem value="free" label="Free" description="For trying it out" />
      <RadioGroupItem value="pro" label="Pro" />
      <RadioGroupItem value="team" label="Team" />
    </RadioGroup>
  )
}

describe("RadioGroup — semantics", () => {
  it("renders a named radiogroup of native radios", () => {
    render(<Basic />)
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument()
    const radios = screen.getAllByRole("radio")
    expect(radios).toHaveLength(3)
    radios.forEach((r) => expect(r.tagName).toBe("INPUT"))
  })

  it("names each radio by its label and links the description", () => {
    render(<Basic />)
    const free = screen.getByRole("radio", { name: "Free" })
    expect(free).toHaveAccessibleDescription("For trying it out")
  })

  it("shares one name across the items", () => {
    render(<Basic name="plan" />)
    screen.getAllByRole("radio").forEach((r) => expect(r).toHaveAttribute("name", "plan"))
  })

  it("defaults to vertical, default variant, md", () => {
    const { container } = render(<Basic />)
    const group = container.firstElementChild!
    expect(group).toHaveAttribute("data-direction", "vertical")
    expect(group).toHaveAttribute("data-variant", "default")
    expect(container.querySelector("label")).toHaveAttribute("data-size", "md")
  })
})

describe("RadioGroup — selection", () => {
  it("selects on click and keeps a single selection", () => {
    const onValueChange = vi.fn()
    render(<Basic onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "Pro" }))
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked()
    fireEvent.click(screen.getByRole("radio", { name: "Team" }))
    expect(screen.getByRole("radio", { name: "Pro" })).not.toBeChecked()
    expect(screen.getByRole("radio", { name: "Team" })).toBeChecked()
    expect(onValueChange).toHaveBeenLastCalledWith("team")
  })

  it("clicking the label selects the item", () => {
    render(<Basic />)
    fireEvent.click(screen.getByText("Pro"))
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked()
  })

  it("honours defaultValue", () => {
    render(<Basic defaultValue="pro" />)
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked()
  })

  it("is controlled by value", () => {
    const onValueChange = vi.fn()
    render(<Basic value="free" onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "Team" }))
    expect(onValueChange).toHaveBeenCalledWith("team")
    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked()
  })

  it("marks the selected item with data-checked", () => {
    const { container } = render(<Basic defaultValue="pro" />)
    const labels = container.querySelectorAll("label")
    expect(labels[0]).not.toHaveAttribute("data-checked")
    expect(labels[1]).toHaveAttribute("data-checked", "true")
  })
})

describe("RadioGroup — variant × size × direction", () => {
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      for (const direction of DIRECTIONS) {
        it(`${variant} / ${size} / ${direction} sets data attributes and passes axe`, async () => {
          const { container } = render(
            <Basic variant={variant} size={size} direction={direction} defaultValue="pro" />,
          )
          const group = container.firstElementChild!
          expect(group).toHaveAttribute("data-variant", variant)
          expect(group).toHaveAttribute("data-direction", direction)
          container.querySelectorAll("label").forEach((l) => {
            expect(l).toHaveAttribute("data-variant", variant)
            expect(l).toHaveAttribute("data-size", size)
          })
          expect(await axe(container)).toHaveNoViolations()
        })
      }
    }
  }
})

describe("RadioGroup — states", () => {
  it("disabled group blocks selection", () => {
    const onValueChange = vi.fn()
    render(<Basic disabled defaultValue="free" onValueChange={onValueChange} />)
    const pro = screen.getByRole("radio", { name: "Pro" })
    expect(pro).toBeDisabled()
    fireEvent.click(pro)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(pro).not.toBeChecked()
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true")
  })

  it("a disabled item blocks only itself", () => {
    render(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem value="a" label="A" disabled />
        <RadioGroupItem value="b" label="B" />
      </RadioGroup>,
    )
    expect(screen.getByRole("radio", { name: "A" })).toBeDisabled()
    expect(screen.getByRole("radio", { name: "B" })).toBeEnabled()
  })

  it("invalid group sets aria-invalid on the group and every radio", async () => {
    const { container } = render(<Basic invalid />)
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true")
    screen.getAllByRole("radio").forEach((r) => expect(r).toHaveAttribute("aria-invalid", "true"))
    expect(await axe(container)).toHaveNoViolations()
  })

  it("an item can override invalid", () => {
    render(
      <RadioGroup aria-label="Plan" invalid>
        <RadioGroupItem value="a" label="A" invalid={false} />
        <RadioGroupItem value="b" label="B" />
      </RadioGroup>,
    )
    expect(screen.getByRole("radio", { name: "A" })).not.toHaveAttribute("aria-invalid")
    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute("aria-invalid", "true")
  })

  it("required marks the group and the radios", () => {
    render(<Basic required />)
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true")
    screen.getAllByRole("radio").forEach((r) => expect(r).toBeRequired())
  })

  it("an item can override variant and size", () => {
    const { container } = render(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem value="a" label="A" variant="card" size="sm" />
      </RadioGroup>,
    )
    const label = container.querySelector("label")!
    expect(label).toHaveAttribute("data-variant", "card")
    expect(label).toHaveAttribute("data-size", "sm")
  })

  it("forwards aria-describedby and aria-label", () => {
    render(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem value="a" aria-label="Only" aria-describedby="err" />
        <p id="err">Choose one</p>
      </RadioGroup>,
    )
    const r = screen.getByRole("radio", { name: "Only" })
    expect(r).toHaveAccessibleDescription("Choose one")
  })
})

describe("RadioGroupItem — guard", () => {
  it("throws outside a RadioGroup", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<RadioGroupItem value="a" label="A" />)).toThrow(/RadioGroup/)
    spy.mockRestore()
  })
})
