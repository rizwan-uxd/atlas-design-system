/**
 * Atlas Toast — test suite
 *
 * Coverage:
 *   1. Renders title, description, action and close
 *   2. Variant matrix — every variant renders and sets data-variant
 *   3. Icon — off by default, `true` shows the variant icon, a node overrides it
 *   4. Close and action — onOpenChange fires, action click runs, close label is localisable
 *   5. Parts are optional (title only, description only)
 *   6. Imperative API — toast() mounts through <Toaster />, dismiss removes it
 *   7. axe accessibility check per variant
 */

import React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  Toaster,
  toast,
  dismissToast,
  type ToastVariant,
} from "@atlas/ui-web/compositions/Toast/Toast"

const VARIANTS: ToastVariant[] = ["default", "success", "danger"]

function Fixture(props: Partial<React.ComponentProps<typeof Toast>>) {
  return (
    <ToastProvider>
      <Toast open {...props}>
        <ToastTitle>Link copied</ToastTitle>
        <ToastDescription>Share it with your team.</ToastDescription>
        <ToastAction altText="Undo copying the link">Undo</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}

afterEach(() => {
  act(() => dismissToast())
})

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("Toast", () => {
  it("renders title, description, action and close", () => {
    render(<Fixture />)
    expect(screen.getByText("Link copied")).toBeTruthy()
    expect(screen.getByText("Share it with your team.")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
  })
})

// ─── 2. Variants ───────────────────────────────────────────────────────────

describe("Toast variants", () => {
  it.each(VARIANTS)("renders the %s variant", (variant) => {
    render(<Fixture variant={variant} />)
    expect(document.querySelector(`[data-variant="${variant}"]`)).toBeTruthy()
  })

  it("defaults to the default variant", () => {
    render(<Fixture />)
    expect(document.querySelector('[data-variant="default"]')).toBeTruthy()
  })
})

// ─── 3. Icon ───────────────────────────────────────────────────────────────

describe("Toast icon", () => {
  it("is hidden by default (only the close X is drawn)", () => {
    render(<Fixture />)
    expect(document.querySelectorAll("svg")).toHaveLength(1)
  })

  it.each(VARIANTS)("shows a default icon for %s when icon is true", (variant) => {
    render(<Fixture variant={variant} icon />)
    expect(document.querySelectorAll("svg")).toHaveLength(2)
  })

  it("accepts a custom node", () => {
    render(<Fixture icon={<span data-testid="custom-icon" />} />)
    expect(screen.getByTestId("custom-icon")).toBeTruthy()
  })
})

// ─── 4. Interaction ────────────────────────────────────────────────────────

describe("Toast interaction", () => {
  it("close calls onOpenChange(false)", () => {
    const onOpenChange = vi.fn()
    render(<Fixture onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("action click runs the handler", () => {
    const onClick = vi.fn()
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Deleted</ToastTitle>
          <ToastAction altText="Undo deleting" onClick={onClick}>Undo</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("localises the close label", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Saved</ToastTitle>
          <ToastClose aria-label="Fermer" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
    expect(screen.getByRole("button", { name: "Fermer" })).toBeTruthy()
  })
})

// ─── 5. Optional parts ─────────────────────────────────────────────────────

describe("Toast parts", () => {
  it("renders with only a title", () => {
    render(
      <ToastProvider>
        <Toast open><ToastTitle>Saved</ToastTitle></Toast>
        <ToastViewport />
      </ToastProvider>
    )
    expect(screen.getByText("Saved")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
  })

  it("renders with only a description", () => {
    render(
      <ToastProvider>
        <Toast open><ToastDescription>Synced 3 files</ToastDescription></Toast>
        <ToastViewport />
      </ToastProvider>
    )
    expect(screen.getByText("Synced 3 files")).toBeTruthy()
  })
})

// ─── 6. Imperative API ─────────────────────────────────────────────────────

describe("toast() / Toaster", () => {
  it("shows a toast and removes it after dismiss", () => {
    vi.useFakeTimers()
    render(<Toaster />)
    act(() => {
      toast({ variant: "success", title: "Saved", description: "All changes stored", icon: true })
    })
    expect(screen.getByText("Saved")).toBeTruthy()
    expect(document.querySelector('[data-variant="success"]')).toBeTruthy()

    act(() => dismissToast())
    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.queryByText("Saved")).toBeNull()
    vi.useRealTimers()
  })

  it("renders an action and hides close when dismissible is false", () => {
    render(<Toaster />)
    const onClick = vi.fn()
    act(() => {
      toast({ title: "Deleted", action: { label: "Undo", altText: "Undo deleting", onClick }, dismissible: false })
    })
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(onClick).toHaveBeenCalled()
  })
})

// ─── 7. axe ────────────────────────────────────────────────────────────────

describe("Toast accessibility", () => {
  it.each(VARIANTS)("has no axe violations for %s", async (variant) => {
    const { container } = render(<Fixture variant={variant} icon />)
    const results = await axe(container.ownerDocument.body)
    expect(results).toHaveNoViolations()
  })
})
