/**
 * Atlas Sheet — test suite
 *
 * Coverage:
 *   1. Root/Trigger/Header/Title/Description/Body/Footer/Close are re-exported
 *      from Dialog — same Radix wiring, so trigger + open/close behavior mirrors it.
 *   2. SheetContent — side=bottom | top | start | end, data-side attribute,
 *      closeOnEscape, closeOnOverlayClick.
 *   3. Drag handle renders only for side=bottom.
 *   4. axe accessibility check per side.
 *
 * Pattern: packages/ui-web/tests/Drawer.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
  type SheetSide,
} from "@atlas/ui-web/compositions/Sheet/Sheet"

function Basic(props: { side?: SheetSide; closeOnEscape?: boolean; closeOnOverlayClick?: boolean; defaultOpen?: boolean }) {
  return (
    <Sheet defaultOpen={props.defaultOpen}>
      <SheetTrigger asChild={false}>Open sheet</SheetTrigger>
      <SheetContent side={props.side} closeOnEscape={props.closeOnEscape} closeOnOverlayClick={props.closeOnOverlayClick}>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetHeader>
        <SheetBody>Content</SheetBody>
        <SheetFooter>
          <SheetClose asChild={false}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

const trigger = () => screen.getByRole("button", { name: "Open sheet" })
const openWithClick = () => fireEvent.click(trigger())

// ─── 1. Trigger / open / close ─────────────────────────────────────────────

describe("Sheet trigger and open/close", () => {
  it("is closed by default", () => {
    render(<Basic />)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("opens on trigger click with dialog semantics wired to title and description", () => {
    render(<Basic />)
    openWithClick()
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAccessibleName("Menu")
    expect(dialog).toHaveAccessibleDescription("Sheet description")
  })

  it("closes via SheetClose", () => {
    render(<Basic defaultOpen />)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("closes on Escape by default", () => {
    render(<Basic defaultOpen />)
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("does not close on Escape when closeOnEscape is false", () => {
    render(<Basic defaultOpen closeOnEscape={false} />)
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

// ─── 2. Side ────────────────────────────────────────────────────────────────

describe("SheetContent side", () => {
  it.each<SheetSide>(["bottom", "top", "start", "end"])("renders data-side=%s", (side) => {
    render(<Basic defaultOpen side={side} />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", side)
  })

  it("defaults to side=bottom", () => {
    render(<Basic defaultOpen />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "bottom")
  })
})

// ─── 3. Drag handle ─────────────────────────────────────────────────────────

describe("SheetContent drag handle", () => {
  it("renders the drag handle for side=bottom", () => {
    render(<Basic defaultOpen side="bottom" />)
    expect(screen.getByRole("dialog").querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it.each<SheetSide>(["top", "start", "end"])("omits the drag handle for side=%s", (side) => {
    render(<Basic defaultOpen side={side} />)
    expect(screen.getByRole("dialog").querySelector('[aria-hidden="true"]')).toBeNull()
  })
})

// ─── 4. Accessibility ───────────────────────────────────────────────────────

describe("Sheet accessibility", () => {
  it.each<SheetSide>(["bottom", "top", "start", "end"])("has no axe violations, side=%s", async (side) => {
    const { container } = render(<Basic defaultOpen side={side} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
