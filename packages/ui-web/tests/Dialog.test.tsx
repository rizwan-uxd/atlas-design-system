/**
 * Atlas Dialog — test suite
 *
 * Coverage:
 *   1. Trigger / open / close (Escape, DialogClose, closeOnOverlayClick).
 *   2. DialogContent — variant × size matrix, data-variant attribute.
 *   3. axe accessibility check per variant × size.
 *
 * Pattern: packages/ui-web/tests/Sheet.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
  type DialogVariant,
  type DialogSize,
} from "@atlas/ui-web/compositions/Dialog/Dialog"

function Basic(props: {
  variant?:             DialogVariant
  size?:                DialogSize
  closeOnEscape?:       boolean
  closeOnOverlayClick?: boolean
  defaultOpen?:         boolean
}) {
  return (
    <Dialog defaultOpen={props.defaultOpen}>
      <DialogTrigger asChild={false}>Open dialog</DialogTrigger>
      <DialogContent
        variant={props.variant}
        size={props.size}
        closeOnEscape={props.closeOnEscape}
        closeOnOverlayClick={props.closeOnOverlayClick}
      >
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogHeader>
        <DialogBody>Content</DialogBody>
        <DialogFooter>
          <DialogClose asChild={false}>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const trigger = () => screen.getByRole("button", { name: "Open dialog" })
const openWithClick = () => fireEvent.click(trigger())

// ─── 1. Trigger / open / close ─────────────────────────────────────────────

describe("Dialog trigger and open/close", () => {
  it("is closed by default", () => {
    render(<Basic />)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("opens on trigger click with dialog semantics wired to title and description", () => {
    render(<Basic />)
    openWithClick()
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAccessibleName("Confirm action")
    expect(dialog).toHaveAccessibleDescription("Dialog description")
  })

  it("closes via DialogClose", () => {
    render(<Basic defaultOpen />)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
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

// ─── 2. Variant × size ──────────────────────────────────────────────────────

describe("DialogContent variant", () => {
  it.each<DialogVariant>(["default", "destructive"])("renders data-variant=%s", (variant) => {
    render(<Basic defaultOpen variant={variant} />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-variant", variant)
  })

  it("defaults to variant=default", () => {
    render(<Basic defaultOpen />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-variant", "default")
  })
})

describe("DialogContent size", () => {
  it.each<DialogSize>(["sm", "md", "lg", "xl", "full"])("renders without error at size=%s", (size) => {
    render(<Basic defaultOpen size={size} />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

// ─── 3. Accessibility ───────────────────────────────────────────────────────

describe("Dialog accessibility", () => {
  it.each<DialogVariant>(["default", "destructive"])("has no axe violations, variant=%s", async (variant) => {
    const { container } = render(<Basic defaultOpen variant={variant} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it.each<DialogSize>(["sm", "md", "lg", "xl", "full"])("has no axe violations, size=%s", async (size) => {
    const { container } = render(<Basic defaultOpen size={size} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
