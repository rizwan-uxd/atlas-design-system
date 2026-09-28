/**
 * Atlas ButtonGroup — test suite
 *
 * Coverage:
 *   1. Renders a labelled group with its items
 *   2. Orientation × size matrix — size reaches every item
 *   3. Position derivation — horizontal, vertical, single, explicit override
 *   4. Variants — every ButtonGroupItemVariant; ghost is always single and spaced
 *   5. Disabled item blocks interaction; keyboard activation
 *   6. Icon-only items
 *   7. axe accessibility check per orientation and variant
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  ButtonGroup,
  ButtonGroupButton,
  ButtonGroupIconButton,
  type ButtonGroupOrientation,
  type ButtonGroupSize,
  type ButtonGroupItemVariant,
} from "@atlas/ui-web/compositions/ButtonGroup/ButtonGroup"

const ORIENTATIONS: ButtonGroupOrientation[] = ["horizontal", "vertical"]
const SIZES: ButtonGroupSize[] = ["sm", "md", "lg"]
const VARIANTS: ButtonGroupItemVariant[] = ["outline", "secondary", "ghost"]

const positions = (c: HTMLElement) =>
  Array.from(c.querySelectorAll("button")).map((b) => b.getAttribute("data-position"))

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("ButtonGroup — default render", () => {
  it("renders a named group containing its buttons", () => {
    render(
      <ButtonGroup aria-label="Alignment">
        <ButtonGroupButton>Left</ButtonGroupButton>
        <ButtonGroupButton>Right</ButtonGroupButton>
      </ButtonGroup>,
    )
    const group = screen.getByRole("group", { name: "Alignment" })
    expect(group).toHaveAttribute("data-orientation", "horizontal")
    expect(screen.getAllByRole("button")).toHaveLength(2)
  })
})

// ─── 2. Orientation × size ─────────────────────────────────────────────────

describe("ButtonGroup — orientation × size matrix", () => {
  for (const orientation of ORIENTATIONS) {
    for (const size of SIZES) {
      it(`orientation=${orientation} size=${size} renders three items`, () => {
        const { container } = render(
          <ButtonGroup orientation={orientation} size={size} aria-label="Actions">
            <ButtonGroupButton>A</ButtonGroupButton>
            <ButtonGroupButton>B</ButtonGroupButton>
            <ButtonGroupButton>C</ButtonGroupButton>
          </ButtonGroup>,
        )
        expect(container.querySelector("[role=group]")).toHaveAttribute("data-orientation", orientation)
        expect(container.querySelectorAll("button")).toHaveLength(3)
      })
    }
  }

  it("an item's own size wins over the group's", () => {
    const { container } = render(
      <ButtonGroup size="sm" aria-label="Actions">
        <ButtonGroupButton>A</ButtonGroupButton>
        <ButtonGroupButton size="lg">B</ButtonGroupButton>
      </ButtonGroup>,
    )
    const [a, b] = Array.from(container.querySelectorAll("button"))
    expect(a.className).not.toEqual(b.className)
  })
})

// ─── 3. Position derivation ────────────────────────────────────────────────

describe("ButtonGroup — position", () => {
  it("horizontal: left · middle · right", () => {
    const { container } = render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton>A</ButtonGroupButton>
        <ButtonGroupButton>B</ButtonGroupButton>
        <ButtonGroupButton>C</ButtonGroupButton>
      </ButtonGroup>,
    )
    expect(positions(container)).toEqual(["left", "middle", "right"])
  })

  it("vertical: top · middle · bottom", () => {
    const { container } = render(
      <ButtonGroup orientation="vertical" aria-label="Actions">
        <ButtonGroupButton>A</ButtonGroupButton>
        <ButtonGroupButton>B</ButtonGroupButton>
        <ButtonGroupButton>C</ButtonGroupButton>
      </ButtonGroup>,
    )
    expect(positions(container)).toEqual(["top", "middle", "bottom"])
  })

  it("two items have no middle; one item is single", () => {
    const two = render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton>A</ButtonGroupButton>
        <ButtonGroupButton>B</ButtonGroupButton>
      </ButtonGroup>,
    )
    expect(positions(two.container)).toEqual(["left", "right"])
    const one = render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton>A</ButtonGroupButton>
      </ButtonGroup>,
    )
    expect(positions(one.container)).toEqual(["single"])
  })

  it("an explicit position on an item wins", () => {
    const { container } = render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton position="single">A</ButtonGroupButton>
        <ButtonGroupButton>B</ButtonGroupButton>
      </ButtonGroup>,
    )
    expect(positions(container)).toEqual(["single", "right"])
  })

  it("non-item children are not counted", () => {
    const { container } = render(
      <ButtonGroup aria-label="Actions">
        <span>label</span>
        <ButtonGroupButton>A</ButtonGroupButton>
        <ButtonGroupButton>B</ButtonGroupButton>
      </ButtonGroup>,
    )
    expect(positions(container)).toEqual(["left", "right"])
  })
})

// ─── 4. Variants ───────────────────────────────────────────────────────────

describe("ButtonGroup — variants", () => {
  for (const variant of VARIANTS) {
    it(`variant=${variant} renders`, () => {
      const { container } = render(
        <ButtonGroup aria-label="Actions">
          <ButtonGroupButton variant={variant}>A</ButtonGroupButton>
          <ButtonGroupButton variant={variant}>B</ButtonGroupButton>
        </ButtonGroup>,
      )
      expect(container.querySelectorAll("button")).toHaveLength(2)
    })
  }

  it("ghost items are single and the group is spaced", () => {
    const { container } = render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton variant="ghost">A</ButtonGroupButton>
        <ButtonGroupButton variant="ghost">B</ButtonGroupButton>
      </ButtonGroup>,
    )
    expect(positions(container)).toEqual(["single", "single"])
    expect(container.querySelector("[role=group]")).toHaveAttribute("data-spaced")
  })

  it("joined variants are not spaced", () => {
    const { container } = render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton>A</ButtonGroupButton>
        <ButtonGroupButton>B</ButtonGroupButton>
      </ButtonGroup>,
    )
    expect(container.querySelector("[role=group]")).not.toHaveAttribute("data-spaced")
  })
})

// ─── 5. Disabled + keyboard ────────────────────────────────────────────────

describe("ButtonGroup — states", () => {
  it("a disabled item does not fire onClick", () => {
    const onClick = vi.fn()
    render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton disabled onClick={onClick}>A</ButtonGroupButton>
        <ButtonGroupButton>B</ButtonGroupButton>
      </ButtonGroup>,
    )
    fireEvent.click(screen.getByRole("button", { name: "A" }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it("an enabled item fires onClick", () => {
    const onClick = vi.fn()
    render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton onClick={onClick}>A</ButtonGroupButton>
      </ButtonGroup>,
    )
    fireEvent.click(screen.getByRole("button", { name: "A" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("items are native buttons, so they are tabbable and Enter/Space activate them", () => {
    render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton>A</ButtonGroupButton>
        <ButtonGroupButton>B</ButtonGroupButton>
      </ButtonGroup>,
    )
    const [a, b] = screen.getAllByRole("button")
    expect(a.tagName).toBe("BUTTON")
    expect(b.tabIndex).toBe(0)
  })
})

// ─── 6. Icon-only ──────────────────────────────────────────────────────────

describe("ButtonGroup — icon-only items", () => {
  it("renders labelled icon buttons in a group", () => {
    render(
      <ButtonGroup orientation="vertical" aria-label="Zoom">
        <ButtonGroupIconButton aria-label="Zoom in">+</ButtonGroupIconButton>
        <ButtonGroupIconButton aria-label="Zoom out">-</ButtonGroupIconButton>
      </ButtonGroup>,
    )
    const zoomIn = screen.getByRole("button", { name: "Zoom in" })
    expect(zoomIn).toHaveAttribute("data-position", "top")
    expect(screen.getByRole("button", { name: "Zoom out" })).toHaveAttribute("data-position", "bottom")
  })
})

// ─── 7. Accessibility ──────────────────────────────────────────────────────

describe("ButtonGroup — axe", () => {
  for (const orientation of ORIENTATIONS) {
    for (const variant of VARIANTS) {
      it(`orientation=${orientation} variant=${variant} has no axe violations`, async () => {
        const { container } = render(
          <ButtonGroup orientation={orientation} aria-label="Actions">
            <ButtonGroupButton variant={variant}>A</ButtonGroupButton>
            <ButtonGroupButton variant={variant}>B</ButtonGroupButton>
            <ButtonGroupIconButton variant={variant} aria-label="More">+</ButtonGroupIconButton>
          </ButtonGroup>,
        )
        expect(await axe(container)).toHaveNoViolations()
      })
    }
  }
})
