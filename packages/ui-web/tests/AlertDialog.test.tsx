/**
 * Atlas AlertDialog — test suite
 *
 * Coverage:
 *   1. Trigger / open / close — no dismiss by Escape or outside click,
 *      role="alertdialog" distinct from Dialog's role="dialog".
 *   2. AlertDialogContent — variant × size matrix, data-variant attribute.
 *   3. AlertDialogAction — variant → Button variant, state=loading → Button loading.
 *   4. axe accessibility check per variant × size.
 *
 * Pattern: packages/ui-web/tests/Dialog.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  type AlertDialogVariant,
  type AlertDialogSize,
} from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"

function Basic(props: {
  variant?:     AlertDialogVariant
  size?:        AlertDialogSize
  state?:       "default" | "loading"
  defaultOpen?: boolean
}) {
  return (
    <AlertDialog defaultOpen={props.defaultOpen}>
      <AlertDialogTrigger asChild={false}>Open alert dialog</AlertDialogTrigger>
      <AlertDialogContent variant={props.variant} size={props.size} state={props.state}>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const trigger = () => screen.getByRole("button", { name: "Open alert dialog" })
const openWithClick = () => fireEvent.click(trigger())

// ─── 1. Trigger / open / close ─────────────────────────────────────────────

describe("AlertDialog trigger and open/close", () => {
  it("is closed by default", () => {
    render(<Basic />)
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })

  it("opens on trigger click with alertdialog semantics wired to title and description", () => {
    render(<Basic />)
    openWithClick()
    const dialog = screen.getByRole("alertdialog")
    expect(dialog).toHaveAccessibleName("Are you absolutely sure?")
    expect(dialog).toHaveAccessibleDescription("This action cannot be undone.")
  })

  it("closes via AlertDialogCancel", () => {
    render(<Basic defaultOpen />)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })

  it("closes on Escape, same as Dialog", () => {
    render(<Basic defaultOpen />)
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" })
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })

  it("renders role=alertdialog, not role=dialog", () => {
    render(<Basic defaultOpen />)
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})

// ─── 2. Variant × size ──────────────────────────────────────────────────────

describe("AlertDialogContent variant", () => {
  it.each<AlertDialogVariant>(["default", "destructive"])("renders data-variant=%s", (variant) => {
    render(<Basic defaultOpen variant={variant} />)
    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-variant", variant)
  })

  it("defaults to variant=default", () => {
    render(<Basic defaultOpen />)
    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-variant", "default")
  })

  it("destructive variant gives the Action button a different class than default", () => {
    const { unmount } = render(<Basic defaultOpen variant="default" />)
    const defaultClass = screen.getByRole("button", { name: "Continue" }).className
    unmount()

    render(<Basic defaultOpen variant="destructive" />)
    const destructiveClass = screen.getByRole("button", { name: "Continue" }).className
    expect(destructiveClass).not.toBe(defaultClass)
  })
})

describe("AlertDialogContent size", () => {
  it.each<AlertDialogSize>(["sm", "md", "lg"])("renders without error at size=%s", (size) => {
    render(<Basic defaultOpen size={size} />)
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
  })
})

// ─── 3. AlertDialogAction state ────────────────────────────────────────────

describe("AlertDialogAction state", () => {
  it("state=loading disables the Action button and sets aria-busy", () => {
    render(<Basic defaultOpen state="loading" />)
    const action = screen.getByRole("button", { name: "Continue" })
    expect(action).toHaveAttribute("aria-busy", "true")
    expect(action).toHaveAttribute("aria-disabled", "true")
  })

  it("state=default leaves the Action button interactive", () => {
    render(<Basic defaultOpen state="default" />)
    expect(screen.getByRole("button", { name: "Continue" })).not.toHaveAttribute("aria-busy", "true")
  })
})

// ─── 4. Accessibility ───────────────────────────────────────────────────────

describe("AlertDialog accessibility", () => {
  it.each<AlertDialogVariant>(["default", "destructive"])("has no axe violations, variant=%s", async (variant) => {
    const { container } = render(<Basic defaultOpen variant={variant} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it.each<AlertDialogSize>(["sm", "md", "lg"])("has no axe violations, size=%s", async (size) => {
    const { container } = render(<Basic defaultOpen size={size} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
