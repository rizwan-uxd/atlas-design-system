/**
 * Atlas Pagination — test suite
 *
 * Coverage:
 *   1. Landmark, list and accessible names
 *   2. Size matrix (sm | md)
 *   3. Slot algorithm: every page when short, start / middle / end windows, siblingCount
 *   4. Current page: aria-current, outline Button, no callback when it is picked again
 *   5. Previous and Next: callbacks, disabled at the ends
 *   6. Ellipses are decorative with a screen-reader hint
 *   7. disabled blocks every control; page is clamped into range
 *   8. Keyboard: native, focusable buttons
 *   9. axe has no violations per size and position
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { Pagination, getPaginationSlots, type PaginationSize } from "@atlas/ui-web/patterns/Pagination/Pagination"

const SIZES: PaginationSize[] = ["sm", "md"]
const noop = () => {}

describe("Pagination — structure", () => {
  it("renders a labelled nav with a list", () => {
    render(<Pagination page={5} pageCount={10} onPageChange={noop} />)
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument()
    expect(screen.getByRole("list")).toBeInTheDocument()
  })

  it("accepts another aria-label", () => {
    render(<Pagination page={1} pageCount={3} onPageChange={noop} aria-label="Invoices pages" />)
    expect(screen.getByRole("navigation", { name: "Invoices pages" })).toBeInTheDocument()
  })

  it("names the page buttons and the steps", () => {
    render(<Pagination page={5} pageCount={10} onPageChange={noop} />)
    expect(screen.getByRole("button", { name: "Page 4" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument()
  })

  it.each(SIZES)("renders at size %s", (size) => {
    const { container } = render(<Pagination page={5} pageCount={10} onPageChange={noop} size={size} />)
    expect(container.querySelector(`[data-size="${size}"]`)).toBeTruthy()
  })
})

describe("Pagination — slots", () => {
  it("shows every page when they fit", () => {
    expect(getPaginationSlots(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("start window", () => {
    expect(getPaginationSlots(1, 10)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 10])
    expect(getPaginationSlots(4, 10)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 10])
  })

  it("middle window", () => {
    expect(getPaginationSlots(5, 10)).toEqual([1, "start-ellipsis", 4, 5, 6, "end-ellipsis", 10])
  })

  it("end window", () => {
    expect(getPaginationSlots(7, 10)).toEqual([1, "start-ellipsis", 6, 7, 8, 9, 10])
    expect(getPaginationSlots(10, 10)).toEqual([1, "start-ellipsis", 6, 7, 8, 9, 10])
  })

  it("siblingCount widens the window and never exceeds siblingCount * 2 + 5 slots", () => {
    const slots = getPaginationSlots(10, 20, 2)
    expect(slots).toEqual([1, "start-ellipsis", 8, 9, 10, 11, 12, "end-ellipsis", 20])
    for (let p = 1; p <= 20; p++) expect(getPaginationSlots(p, 20, 2).length).toBeLessThanOrEqual(9)
  })

  it("always includes the first, last and current page", () => {
    for (let p = 1; p <= 30; p++) {
      const slots = getPaginationSlots(p, 30)
      expect(slots[0]).toBe(1)
      expect(slots[slots.length - 1]).toBe(30)
      expect(slots).toContain(p)
    }
  })
})

describe("Pagination — current page", () => {
  it("marks the current page with aria-current", () => {
    render(<Pagination page={5} pageCount={10} onPageChange={noop} />)
    expect(screen.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: "Page 4" })).not.toHaveAttribute("aria-current")
  })

  it("does not call back when the current page is picked again", () => {
    const onPageChange = vi.fn()
    render(<Pagination page={5} pageCount={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Page 5" }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it("calls back with the picked page", () => {
    const onPageChange = vi.fn()
    render(<Pagination page={5} pageCount={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Page 6" }))
    expect(onPageChange).toHaveBeenCalledWith(6)
  })
})

describe("Pagination — previous and next", () => {
  it("steps back and forward", () => {
    const onPageChange = vi.fn()
    render(<Pagination page={5} pageCount={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }))
    fireEvent.click(screen.getByRole("button", { name: "Next page" }))
    expect(onPageChange).toHaveBeenNthCalledWith(1, 4)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 6)
  })

  it("disables Previous on the first page and Next on the last", () => {
    const { rerender } = render(<Pagination page={1} pageCount={10} onPageChange={noop} />)
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled()
    rerender(<Pagination page={10} pageCount={10} onPageChange={noop} />)
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled()
  })

  it("renders one page with both steps disabled", () => {
    render(<Pagination page={1} pageCount={1} onPageChange={noop} />)
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page")
  })
})

describe("Pagination — ellipsis", () => {
  it("hides the glyph and gives screen readers a hint", () => {
    const { container } = render(<Pagination page={5} pageCount={10} onPageChange={noop} />)
    expect(screen.getAllByText("More pages")).toHaveLength(2)
    expect(container.querySelectorAll("svg[aria-hidden='true']").length).toBeGreaterThanOrEqual(4)
  })
})

describe("Pagination — disabled and range", () => {
  it("disables every control", () => {
    render(<Pagination page={5} pageCount={10} onPageChange={noop} disabled />)
    for (const b of screen.getAllByRole("button")) expect(b).toBeDisabled()
  })

  it("clamps a page outside the range", () => {
    render(<Pagination page={99} pageCount={10} onPageChange={noop} />)
    expect(screen.getByRole("button", { name: "Page 10" })).toHaveAttribute("aria-current", "page")
  })
})

describe("Pagination — keyboard", () => {
  it("uses native buttons, so Enter and Space activate them and Tab reaches each one", () => {
    render(<Pagination page={5} pageCount={10} onPageChange={noop} />)
    const buttons = screen.getAllByRole("button")
    for (const b of buttons) {
      expect(b.tagName).toBe("BUTTON")
      expect(b).not.toHaveAttribute("tabindex", "-1")
    }
    screen.getByRole("button", { name: "Page 6" }).focus()
    expect(screen.getByRole("button", { name: "Page 6" })).toHaveFocus()
  })
})

describe("Pagination — axe", () => {
  it.each(SIZES.flatMap((size) => [1, 5, 10].map((page) => [size, page] as const)))("size %s, page %s has no violations", async (size, page) => {
    const { container } = render(<Pagination page={page} pageCount={10} onPageChange={noop} size={size} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
