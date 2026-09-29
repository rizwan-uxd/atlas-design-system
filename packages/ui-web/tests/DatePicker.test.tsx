/**
 * Atlas DatePicker — test suite
 *
 * Coverage:
 *   1. Renders the trigger with placeholder text by default
 *   2. Opens the panel on click; closes and restores focus on Escape
 *   3. Single mode — selecting a date closes the panel and updates the trigger text
 *   4. Keyboard grid navigation — ArrowRight moves focus, Enter selects
 *   5. Disabled — trigger cannot open the panel
 *   6. Invalid — sets aria-invalid on the trigger
 *   7. Range mode — two clicks commit an ordered [start, end] range and update trigger text
 *   8. Dropdown caption — Month/Year <select>s replace the text label and navigate the month
 *   8b. DatePickerInput — typed field commits on Enter, invalid text keeps aria-invalid and
 *       the typed text, trailing button opens the panel
 *   9. axe accessibility check for single/range triggers, DatePickerInput, and open panels
 */

import React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, within, cleanup } from "@testing-library/react"
import { axe } from "jest-axe"
import { DatePicker, DatePickerTrigger, DatePickerInput, DatePickerContent } from "@atlas/ui-web/compositions/DatePicker/DatePicker"

const FIXED_TODAY = new Date(2026, 1, 10) // Feb 10, 2026

// DatePickerContent portals to document.body, outside RTL's per-test container — without
// explicit cleanup, portaled dialogs from every render() accumulate across the whole file,
// making the axe(document.body) checks below order-dependent (see Tooltip.test.tsx).
afterEach(() => cleanup())

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("DatePicker — default render", () => {
  it("renders the trigger with placeholder text", () => {
    render(
      <DatePicker>
        <DatePickerTrigger placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    expect(screen.getByRole("button", { name: /pick a date/i })).toBeInTheDocument()
  })

  it("shows the formatted date when a value is provided", () => {
    render(
      <DatePicker value={FIXED_TODAY}>
        <DatePickerTrigger />
        <DatePickerContent />
      </DatePicker>,
    )
    expect(screen.getByRole("button", { name: /february 10, 2026/i })).toBeInTheDocument()
  })
})

// ─── 2. Open / close ────────────────────────────────────────────────────────

describe("DatePicker — open and close", () => {
  it("opens the panel on trigger click", () => {
    render(
      <DatePicker>
        <DatePickerTrigger placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /pick a date/i }))
    expect(screen.getByRole("dialog", { name: /choose date/i })).toBeInTheDocument()
  })

  it("closes on Escape and returns focus to the trigger", () => {
    render(
      <DatePicker>
        <DatePickerTrigger placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    const trigger = screen.getByRole("button", { name: /pick a date/i })
    fireEvent.click(trigger)
    const dialog = screen.getByRole("dialog")
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})

// ─── 3. Single-date selection ───────────────────────────────────────────────

describe("DatePicker — single mode selection", () => {
  it("selecting a date closes the panel and updates the trigger", () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker defaultValue={FIXED_TODAY} onValueChange={onValueChange}>
        <DatePickerTrigger />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /february 10, 2026/i }))
    const target = document.querySelector('[data-date="2026-02-15"]') as HTMLElement
    expect(target).toBeTruthy()
    fireEvent.click(target)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    const called = onValueChange.mock.calls[0][0] as Date
    expect(called.getDate()).toBe(15)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

// ─── 4. Keyboard grid navigation ────────────────────────────────────────────

describe("DatePicker — keyboard navigation", () => {
  it("ArrowRight moves the roving-focus cell, Enter selects it", () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker defaultValue={FIXED_TODAY} onValueChange={onValueChange}>
        <DatePickerTrigger />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /february 10, 2026/i }))
    const start = document.querySelector('[data-date="2026-02-10"]') as HTMLElement
    expect(start).toHaveFocus()
    const grid = screen.getByRole("dialog").querySelector('[role="grid"]')!.parentElement as HTMLElement
    fireEvent.keyDown(grid, { key: "ArrowRight" })
    const next = document.querySelector('[data-date="2026-02-11"]') as HTMLElement
    expect(next).toHaveFocus()
    fireEvent.keyDown(grid, { key: "Enter" })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect((onValueChange.mock.calls[0][0] as Date).getDate()).toBe(11)
  })
})

// ─── 5. Disabled ─────────────────────────────────────────────────────────────

describe("DatePicker — disabled", () => {
  it("does not open the panel when disabled", () => {
    render(
      <DatePicker disabled>
        <DatePickerTrigger placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /pick a date/i }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

// ─── 6. Invalid ──────────────────────────────────────────────────────────────

describe("DatePicker — invalid", () => {
  it("sets aria-invalid on the trigger", () => {
    render(
      <DatePicker>
        <DatePickerTrigger placeholder="Pick a date" invalid />
        <DatePickerContent />
      </DatePicker>,
    )
    expect(screen.getByRole("button", { name: /pick a date/i })).toHaveAttribute("aria-invalid", "true")
  })
})

// ─── 7. Range mode ───────────────────────────────────────────────────────────

describe("DatePicker — range mode", () => {
  it("two clicks commit an ordered [start, end] range and update the trigger", () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker mode="range" defaultValue={[FIXED_TODAY, undefined]} onValueChange={onValueChange}>
        <DatePickerTrigger placeholder="Pick a range" />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /feb 10, 2026/i }))
    // First click sets the draft start; panel stays open.
    const day20 = document.querySelector('[data-date="2026-02-20"]') as HTMLElement
    fireEvent.click(day20)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(onValueChange).not.toHaveBeenCalled()

    // Second click (earlier date) — the picker orders [min, max] regardless of click order.
    const day05 = document.querySelector('[data-date="2026-02-05"]') as HTMLElement
    fireEvent.click(day05)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    const [start, end] = onValueChange.mock.calls[0][0] as [Date, Date]
    expect(start.getDate()).toBe(5)
    expect(end.getDate()).toBe(20)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /feb 05, 2026 – feb 20, 2026/i })).toBeInTheDocument()
  })

  it("shows two months under one shared nav", () => {
    render(
      <DatePicker mode="range" defaultValue={[FIXED_TODAY, undefined]}>
        <DatePickerTrigger placeholder="Pick a range" />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /feb 10, 2026/i }))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getAllByRole("grid")).toHaveLength(2)
    expect(within(dialog).getByText("February 2026")).toBeInTheDocument()
    expect(within(dialog).getByText("March 2026")).toBeInTheDocument()
  })
})

// ─── 8. Dropdown caption ─────────────────────────────────────────────────────

describe("DatePicker — dropdown caption", () => {
  it("shows Month/Year selects instead of the text label, and navigates the month", () => {
    render(
      <DatePicker defaultValue={FIXED_TODAY}>
        <DatePickerTrigger />
        <DatePickerContent captionLayout="dropdown" />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /february 10, 2026/i }))
    const dialog = screen.getByRole("dialog")
    const monthSelect = within(dialog).getByRole("combobox", { name: "Month" }) as HTMLSelectElement
    const yearSelect = within(dialog).getByRole("combobox", { name: "Year" }) as HTMLSelectElement
    expect(monthSelect.value).toBe("1") // February = index 1
    expect(yearSelect.value).toBe("2026")
    expect(within(dialog).queryByText("February 2026")).not.toBeInTheDocument()

    fireEvent.change(monthSelect, { target: { value: "4" } }) // May
    expect((within(dialog).getByRole("combobox", { name: "Month" }) as HTMLSelectElement).value).toBe("4")
    expect(document.querySelector('[data-date="2026-05-01"]')).toBeTruthy()
  })

  it("ignores captionLayout=\"dropdown\" in range mode and keeps the text label", () => {
    render(
      <DatePicker mode="range" defaultValue={[FIXED_TODAY, undefined]}>
        <DatePickerTrigger placeholder="Pick a range" />
        <DatePickerContent captionLayout="dropdown" />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /feb 10, 2026/i }))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByText("February 2026")).toBeInTheDocument()
    expect(within(dialog).queryByRole("combobox", { name: "Month" })).not.toBeInTheDocument()
  })
})

// ─── 8b. DatePickerInput ────────────────────────────────────────────────────

describe("DatePicker — DatePickerInput", () => {
  it("shows the formatted date as the field's text", () => {
    render(
      <DatePicker defaultValue={FIXED_TODAY}>
        <DatePickerInput />
        <DatePickerContent />
      </DatePicker>,
    )
    expect(screen.getByRole("textbox")).toHaveValue("February 10, 2026")
  })

  it("commits a typed date on Enter and calls onValueChange", () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker onValueChange={onValueChange}>
        <DatePickerInput placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    const field = screen.getByRole("textbox")
    fireEvent.change(field, { target: { value: "2026-03-15" } })
    fireEvent.keyDown(field, { key: "Enter" })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect((onValueChange.mock.calls[0][0] as Date).getDate()).toBe(15)
  })

  it("sets aria-invalid on unparseable text without discarding it", () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker onValueChange={onValueChange}>
        <DatePickerInput placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    const field = screen.getByRole("textbox")
    fireEvent.change(field, { target: { value: "not a date" } })
    fireEvent.blur(field)
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(field).toHaveValue("not a date")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("opens the panel via the trailing calendar button", () => {
    render(
      <DatePicker>
        <DatePickerInput placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /open calendar/i }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

// ─── 9. axe accessibility ────────────────────────────────────────────────────

describe("DatePicker — a11y (axe)", () => {
  it("passes axe for the closed single trigger", async () => {
    const { container } = render(
      <DatePicker>
        <DatePickerTrigger placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("passes axe for the open single panel", async () => {
    render(
      <DatePicker defaultValue={FIXED_TODAY}>
        <DatePickerTrigger />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /february 10, 2026/i }))
    const results = await axe(document.body)
    expect(results).toHaveNoViolations()
  })

  it("passes axe for the open range panel", async () => {
    render(
      <DatePicker mode="range" defaultValue={[FIXED_TODAY, undefined]}>
        <DatePickerTrigger placeholder="Pick a range" />
        <DatePickerContent />
      </DatePicker>,
    )
    fireEvent.click(screen.getByRole("button", { name: /feb 10, 2026/i }))
    const results = await axe(document.body)
    expect(results).toHaveNoViolations()
  })

  it("passes axe for DatePickerInput, closed and open", async () => {
    const { container } = render(
      <DatePicker defaultValue={FIXED_TODAY}>
        <DatePickerInput placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>,
    )
    expect((await axe(container)).violations).toHaveLength(0)
    fireEvent.click(screen.getByRole("button", { name: /open calendar/i }))
    // "region" (all page content must be in a landmark) is a page-layout rule, not a
    // component contract — it fires here only because the test has no <main>/app shell
    // around a bare <input>, not because DatePickerInput itself is inaccessible.
    const results = await axe(document.body, { rules: { region: { enabled: false } } })
    expect(results).toHaveNoViolations()
  })
})
