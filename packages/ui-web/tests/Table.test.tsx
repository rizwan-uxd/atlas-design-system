/**
 * Atlas Table — test suite
 *
 * Coverage:
 *   1. Renders a real table with header, body and caption
 *   2. Align — start (default) and end on head and cell
 *   3. Sort — none renders plain text; unsorted / ascending / descending render a button + aria-sort
 *   4. Sort button calls onSort
 *   5. Row selected state and hover class hook
 *   6. Scroll wrapper — focusable, named region when aria-label is given
 *   7. axe accessibility check (plain, sorted, selected)
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  type TableSort,
  type TableAlign,
} from "@atlas/ui-web/primitives/Table/Table"

const SORTS: TableSort[] = ["none", "unsorted", "ascending", "descending"]
const ALIGNS: TableAlign[] = ["start", "end"]

function Fixture({ sort = "none", selected = false }: { sort?: TableSort; selected?: boolean }) {
  return (
    <Table aria-label="Recent payments">
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead sort={sort}>Email</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow selected={selected}>
          <TableCell>Success</TableCell>
          <TableCell>ken99@yahoo.com</TableCell>
          <TableCell align="end">$316.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>1 payment</TableCell>
        </TableRow>
      </TableFooter>
      <TableCaption>A list of recent payments.</TableCaption>
    </Table>
  )
}

// ─── 1. Structure ──────────────────────────────────────────────────────────

describe("Table", () => {
  it("renders a table with headers, cells and caption", () => {
    render(<Fixture />)
    expect(screen.getByRole("table")).toBeTruthy()
    expect(screen.getAllByRole("columnheader")).toHaveLength(3)
    expect(screen.getByRole("cell", { name: "ken99@yahoo.com" })).toBeTruthy()
    expect(screen.getByText("A list of recent payments.")).toBeTruthy()
  })

  it("sets scope=col on heads", () => {
    render(<Fixture />)
    for (const h of screen.getAllByRole("columnheader")) expect(h.getAttribute("scope")).toBe("col")
  })
})

// ─── 2. Align ──────────────────────────────────────────────────────────────

describe("Table align", () => {
  it("defaults to start", () => {
    render(<Fixture />)
    expect(screen.getByRole("columnheader", { name: "Status" }).getAttribute("data-align")).toBe("start")
    expect(screen.getByRole("cell", { name: "Success" }).getAttribute("data-align")).toBe("start")
  })

  it.each(ALIGNS)("applies %s to head and cell", (align) => {
    render(
      <Table aria-label="t">
        <TableHeader><TableRow><TableHead align={align}>H</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell align={align}>C</TableCell></TableRow></TableBody>
      </Table>
    )
    expect(screen.getByRole("columnheader").getAttribute("data-align")).toBe(align)
    expect(screen.getByRole("cell").getAttribute("data-align")).toBe(align)
  })
})

// ─── 3. Sort ───────────────────────────────────────────────────────────────

describe("Table sort", () => {
  it("none renders plain text with no button and no aria-sort", () => {
    render(<Fixture sort="none" />)
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.getByRole("columnheader", { name: "Email" }).getAttribute("aria-sort")).toBeNull()
  })

  it.each(SORTS.filter((s) => s !== "none"))("%s renders a sort button", (sort) => {
    render(<Fixture sort={sort} />)
    expect(screen.getByRole("button", { name: "Email" })).toBeTruthy()
    expect(document.querySelectorAll("svg")).toHaveLength(1)
  })

  it.each([
    ["unsorted", "none"],
    ["ascending", "ascending"],
    ["descending", "descending"],
  ] as const)("%s sets aria-sort=%s", (sort, expected) => {
    render(<Fixture sort={sort} />)
    expect(screen.getByRole("columnheader", { name: "Email" }).getAttribute("aria-sort")).toBe(expected)
  })
})

// ─── 4. Sort interaction ───────────────────────────────────────────────────

describe("Table sort interaction", () => {
  it("calls onSort when the sort button is pressed", () => {
    const onSort = vi.fn()
    render(
      <Table aria-label="t">
        <TableHeader><TableRow><TableHead sort="unsorted" onSort={onSort}>Email</TableHead></TableRow></TableHeader>
      </Table>
    )
    fireEvent.click(screen.getByRole("button", { name: "Email" }))
    expect(onSort).toHaveBeenCalledTimes(1)
  })
})

// ─── 5. Rows ───────────────────────────────────────────────────────────────

describe("Table row", () => {
  it("is not selected by default", () => {
    render(<Fixture />)
    const row = screen.getByRole("cell", { name: "Success" }).closest("tr")!
    expect(row.getAttribute("data-state")).toBeNull()
  })

  it("marks a selected row", () => {
    render(<Fixture selected />)
    const row = screen.getByRole("cell", { name: "Success" }).closest("tr")!
    expect(row.getAttribute("data-state")).toBe("selected")
  })
})

// ─── 6. Wrapper ────────────────────────────────────────────────────────────

describe("Table wrapper", () => {
  it("is a focusable, named region when aria-label is given", () => {
    render(<Fixture />)
    const region = screen.getByRole("region", { name: "Recent payments" })
    expect(region.getAttribute("tabindex")).toBe("0")
  })

  it("has no region role without a label", () => {
    render(
      <Table>
        <TableBody><TableRow><TableCell>C</TableCell></TableRow></TableBody>
      </Table>
    )
    expect(screen.queryByRole("region")).toBeNull()
  })
})

// ─── 7. axe ────────────────────────────────────────────────────────────────

describe("Table accessibility", () => {
  it.each(SORTS)("has no axe violations with sort=%s", async (sort) => {
    const { container } = render(<Fixture sort={sort} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("has no axe violations with a selected row", async () => {
    const { container } = render(<Fixture selected />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
