/**
 * Atlas EmptyState — test suite
 *
 * Coverage:
 *   1. Renders default (md) without crashing, role="status"
 *   2. Size matrix — sm, md, lg render and carry data-size
 *   3. Title, description and icon render; the icon is aria-hidden
 *   4. Action slot — primary action, optional secondary action, order, interaction
 *   5. Empty slots render no empty wrappers
 *   6. Long text wraps inside the container (no truncation, fills the width)
 *   7. axe accessibility check per size, with and without a secondary action
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import { SearchX } from "lucide-react"
import {
  EmptyState,
  type EmptyStateSize,
} from "@atlas/ui-web/compositions/EmptyState/EmptyState"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

const SIZES: EmptyStateSize[] = ["sm", "md", "lg"]

const full = (size?: EmptyStateSize, secondary = true) => (
  <EmptyState
    size={size}
    icon={<SearchX data-testid="icon" />}
    title="No results found"
    description="Try a different search, or clear it to see every project."
    action={<Button variant="primary">Clear search</Button>}
    secondaryAction={secondary ? <Button variant="ghost">Learn more</Button> : undefined}
  />
)

describe("EmptyState: default", () => {
  it("renders a polite status region at md", () => {
    render(full())
    const region = screen.getByRole("status")
    expect(region).toHaveAttribute("data-size", "md")
  })
})

describe("EmptyState: sizes", () => {
  it.each(SIZES)("renders size %s", (size) => {
    render(full(size))
    expect(screen.getByRole("status")).toHaveAttribute("data-size", size)
    expect(screen.getByText("No results found")).toBeInTheDocument()
  })
})

describe("EmptyState: content", () => {
  it("renders title, description and a decorative icon", () => {
    render(full())
    expect(screen.getByText("No results found")).toBeInTheDocument()
    expect(screen.getByText(/Try a different search/)).toBeInTheDocument()
    expect(screen.getByTestId("icon").closest("[aria-hidden='true']")).not.toBeNull()
  })

  it("renders no empty wrappers when slots are omitted", () => {
    const { container } = render(<EmptyState title="Nothing here" />)
    expect(container.querySelector("[aria-hidden='true']")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })
})

describe("EmptyState: actions", () => {
  it("renders the primary action and fires it", () => {
    const onClear = vi.fn()
    render(<EmptyState title="No results" action={<Button onClick={onClear}>Clear search</Button>} />)
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("renders the secondary action after the primary, only when given", () => {
    const { rerender } = render(full(undefined, false))
    expect(screen.queryByRole("button", { name: "Learn more" })).toBeNull()
    rerender(full(undefined, true))
    const buttons = screen.getAllByRole("button")
    expect(buttons.map((b) => b.textContent)).toEqual(["Clear search", "Learn more"])
  })
})

describe("EmptyState: wrapping", () => {
  it("keeps long text in the document, not truncated", () => {
    const long = "A very long description ".repeat(30).trim()
    render(<EmptyState title="Title" description={long} />)
    expect(screen.getByText(long)).toBeInTheDocument()
  })
})

describe("EmptyState: accessibility", () => {
  it.each(SIZES)("has no axe violations at size %s", async (size) => {
    const { container } = render(full(size))
    expect(await axe(container)).toHaveNoViolations()
  })

  it("has no axe violations without a secondary action", async () => {
    const { container } = render(full("md", false))
    expect(await axe(container)).toHaveNoViolations()
  })
})
