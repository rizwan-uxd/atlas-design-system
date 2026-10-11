/**
 * Atlas Input — test suite
 *
 * Coverage:
 *   1. Renders default (default, md) without crashing
 *   2. Variant × Size matrix — all 9 combinations render
 *   3. Leading / trailing icons — each alone, both, neither; aria-hidden; data attributes
 *   4. Loading — spinner replaces the trailing icon
 *   5. Affixes — prefix / suffix, and icon priority over them
 *   6. Disabled and invalid states
 *   7. axe accessibility check
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { Input, type InputVariant, type InputSize } from "@atlas/ui-web/primitives/Input/Input"

const VARIANTS: InputVariant[] = ["default", "filled", "unstyled"]
const SIZES: InputSize[] = ["sm", "md", "lg"]

const wrapper = (container: HTMLElement) => container.firstElementChild as HTMLElement

describe("Input — render", () => {
  it("renders a text input", () => {
    render(<Input aria-label="Name" />)
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument()
  })

  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      it(`renders variant=${variant} size=${size}`, () => {
        render(<Input aria-label="Field" variant={variant} size={size} />)
        expect(screen.getByRole("textbox", { name: "Field" })).toBeInTheDocument()
      })
    }
  }
})

describe("Input — leading and trailing icons", () => {
  const icon = (id: string) => <svg data-testid={id} />

  it("shows no icon slot when neither is set", () => {
    const { container } = render(<Input aria-label="Field" />)
    expect(wrapper(container)).not.toHaveAttribute("data-leading-icon")
    expect(wrapper(container)).not.toHaveAttribute("data-trailing-icon")
  })

  it("shows only the leading icon", () => {
    const { container } = render(<Input aria-label="Field" leadingIcon={icon("lead")} />)
    expect(screen.getByTestId("lead")).toBeInTheDocument()
    expect(wrapper(container)).toHaveAttribute("data-leading-icon")
    expect(wrapper(container)).not.toHaveAttribute("data-trailing-icon")
  })

  it("shows only the trailing icon", () => {
    const { container } = render(<Input aria-label="Field" trailingIcon={icon("trail")} />)
    expect(screen.getByTestId("trail")).toBeInTheDocument()
    expect(wrapper(container)).toHaveAttribute("data-trailing-icon")
    expect(wrapper(container)).not.toHaveAttribute("data-leading-icon")
  })

  it("shows both icons, each hidden from assistive tech", () => {
    render(<Input aria-label="Field" leadingIcon={icon("lead")} trailingIcon={icon("trail")} />)
    expect(screen.getByTestId("lead").parentElement).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByTestId("trail").parentElement).toHaveAttribute("aria-hidden", "true")
  })
})

describe("Input — loading", () => {
  it("replaces the trailing icon with a spinner", () => {
    const { container } = render(<Input aria-label="Field" loading trailingIcon={<svg data-testid="trail" />} />)
    expect(screen.queryByTestId("trail")).not.toBeInTheDocument()
    expect(wrapper(container)).toHaveAttribute("data-trailing-icon")
  })
})

describe("Input — affixes", () => {
  it("renders prefix and suffix text, hidden from assistive tech", () => {
    render(<Input aria-label="Amount" prefix="$" suffix="USD" />)
    expect(screen.getByText("$")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByText("USD")).toHaveAttribute("aria-hidden", "true")
  })

  it("lets a leading icon take priority over a prefix, and a trailing icon over a suffix", () => {
    render(<Input aria-label="Amount" prefix="$" suffix="USD" leadingIcon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />} />)
    expect(screen.queryByText("$")).not.toBeInTheDocument()
    expect(screen.queryByText("USD")).not.toBeInTheDocument()
    expect(screen.getByTestId("lead")).toBeInTheDocument()
    expect(screen.getByTestId("trail")).toBeInTheDocument()
  })
})

describe("Input — states", () => {
  it("disables the control", () => {
    render(<Input aria-label="Field" disabled />)
    expect(screen.getByRole("textbox", { name: "Field" })).toBeDisabled()
  })

  it("sets aria-invalid when invalid", () => {
    render(<Input aria-label="Field" invalid />)
    expect(screen.getByRole("textbox", { name: "Field" })).toHaveAttribute("aria-invalid", "true")
  })
})

describe("Input — accessibility", () => {
  it("passes axe with icons, invalid and disabled variants", async () => {
    const { container } = render(
      <div>
        <Input aria-label="Search" leadingIcon={<svg />} trailingIcon={<svg />} />
        <Input aria-label="Email" invalid />
        <Input aria-label="Locked" disabled />
      </div>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
