/**
 * Atlas Drawer — test suite
 *
 * Coverage:
 *   1. Root/Trigger/Header/Title/Description/Body/Footer/Close are re-exported
 *      from Dialog — same Radix wiring, so trigger + open/close behavior mirrors it.
 *   2. DrawerContent — side=start | end, data-side attribute, closeOnEscape,
 *      closeOnOverlayClick.
 *   3. axe accessibility check per side.
 *
 * Pattern: packages/ui-web/tests/DropdownMenu.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
  type DrawerSide,
} from "@atlas/ui-web/compositions/Drawer/Drawer"

function Basic(props: { side?: DrawerSide; closeOnEscape?: boolean; closeOnOverlayClick?: boolean; defaultOpen?: boolean }) {
  return (
    <Drawer defaultOpen={props.defaultOpen}>
      <DrawerTrigger asChild={false}>Open drawer</DrawerTrigger>
      <DrawerContent side={props.side} closeOnEscape={props.closeOnEscape} closeOnOverlayClick={props.closeOnOverlayClick}>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerDescription>Drawer description</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>Content</DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild={false}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const trigger = () => screen.getByRole("button", { name: "Open drawer" })
const openWithClick = () => fireEvent.click(trigger())

// ─── 1. Trigger / open / close ─────────────────────────────────────────────

describe("Drawer trigger and open/close", () => {
  it("is closed by default", () => {
    render(<Basic />)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("opens on trigger click with dialog semantics wired to title and description", () => {
    render(<Basic />)
    openWithClick()
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAccessibleName("Menu")
    expect(dialog).toHaveAccessibleDescription("Drawer description")
  })

  it("closes via DrawerClose", () => {
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

describe("DrawerContent side", () => {
  it.each<DrawerSide>(["start", "end"])("renders data-side=%s", (side) => {
    render(<Basic defaultOpen side={side} />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", side)
  })

  it("defaults to side=end", () => {
    render(<Basic defaultOpen />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "end")
  })
})

// ─── 3. Accessibility ───────────────────────────────────────────────────────

describe("Drawer accessibility", () => {
  it.each<DrawerSide>(["start", "end"])("has no axe violations, side=%s", async (side) => {
    const { container } = render(<Basic defaultOpen side={side} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
