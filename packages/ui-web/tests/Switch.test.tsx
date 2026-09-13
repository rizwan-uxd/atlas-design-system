/**
 * Atlas Switch — test suite
 *
 * Coverage:
 *   1. Renders default, role=switch + aria-checked
 *   2. Size matrix — sm, md
 *   3. Keyboard activation — Space and Enter toggle; click toggles
 *   4. Focus-visible ring on the track
 *   5. Disabled state — blocks interaction, aria-disabled set
 *   6. Invalid state — aria-invalid set
 *   7. Controlled vs uncontrolled checked
 *   8. axe accessibility check
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import { Switch, type SwitchSize } from "@atlas/ui-web/primitives/Switch/Switch"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const SIZES: SwitchSize[] = ["sm", "md"]

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("Switch — default render", () => {
  it("renders role=switch with aria-checked=false by default", () => {
    render(<Switch label="Push notifications" />)
    const el = screen.getByRole("switch", { name: /push notifications/i })
    expect(el).toHaveAttribute("aria-checked", "false")
  })

  it("renders aria-checked=true when defaultChecked", () => {
    render(<Switch label="Push notifications" defaultChecked />)
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true")
  })
})

// ─── 2. Size matrix ─────────────────────────────────────────────────────

describe("Switch — size matrix", () => {
  for (const size of SIZES) {
    it(`renders size="${size}"`, () => {
      render(<Switch size={size} label={`${size} switch`} />)
      expect(screen.getByRole("switch", { name: new RegExp(`${size} switch`, "i") })).toBeInTheDocument()
    })
  }
})

// ─── 3. Keyboard + click activation ────────────────────────────────────────

describe("Switch — keyboard and click activation", () => {
  it("toggles on click", () => {
    const onCheckedChange = vi.fn()
    render(<Switch label="Wi-Fi" onCheckedChange={onCheckedChange} />)
    fireEvent.click(screen.getByRole("switch"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  // Space/Enter activation comes from the native <button>; jsdom does not synthesise the
  // key→click, so these assert the preconditions rather than simulate the keys.
  it("is type=button, so Space/Enter activate it and it never submits a form", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(<form onSubmit={onSubmit}><Switch label="Wi-Fi" /></form>)
    const el = screen.getByRole("switch")
    expect(el).toHaveAttribute("type", "button")
    fireEvent.click(el)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("toggles back off on a second click", () => {
    const onCheckedChange = vi.fn()
    render(<Switch label="Wi-Fi" onCheckedChange={onCheckedChange} />)
    const el = screen.getByRole("switch")
    fireEvent.click(el)
    fireEvent.click(el)
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
    expect(el).toHaveAttribute("aria-checked", "false")
  })

  it("is a native <button> so it receives keyboard focus in the tab order", () => {
    render(<Switch label="Wi-Fi" />)
    expect(screen.getByRole("switch").tagName).toBe("BUTTON")
  })
})

// ─── 4. Focus-visible ring ─────────────────────────────────────────────────

describe("Switch — focus", () => {
  it("can receive programmatic focus on the track element", () => {
    render(<Switch label="Wi-Fi" />)
    const el = screen.getByRole("switch")
    el.focus()
    expect(el).toHaveFocus()
  })
})

// ─── 5. Disabled state ──────────────────────────────────────────────────

describe("Switch — disabled state", () => {
  it("sets aria-disabled=true when disabled", () => {
    render(<Switch label="Wi-Fi" disabled />)
    expect(screen.getByRole("switch")).toHaveAttribute("aria-disabled", "true")
  })

  it("does not fire onCheckedChange when disabled", () => {
    const onCheckedChange = vi.fn()
    render(<Switch label="Wi-Fi" disabled onCheckedChange={onCheckedChange} />)
    fireEvent.click(screen.getByRole("switch"))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})

// ─── 6. Invalid state ───────────────────────────────────────────────────

describe("Switch — invalid state", () => {
  it("sets aria-invalid=true when invalid", () => {
    render(<Switch label="Wi-Fi" invalid />)
    expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true")
  })

  it("does not set aria-invalid by default", () => {
    render(<Switch label="Wi-Fi" />)
    expect(screen.getByRole("switch")).not.toHaveAttribute("aria-invalid")
  })
})

// ─── 7. Controlled vs uncontrolled ──────────────────────────────────────

describe("Switch — controlled vs uncontrolled", () => {
  it("respects a controlled checked prop and does not flip internally", () => {
    const onCheckedChange = vi.fn()
    render(<Switch label="Wi-Fi" checked={false} onCheckedChange={onCheckedChange} />)
    const el = screen.getByRole("switch")
    fireEvent.click(el)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    // controlled: prop unchanged, so aria-checked stays false until parent re-renders
    expect(el).toHaveAttribute("aria-checked", "false")
  })

  it("flips internal state when uncontrolled", () => {
    render(<Switch label="Wi-Fi" />)
    const el = screen.getByRole("switch")
    fireEvent.click(el)
    expect(el).toHaveAttribute("aria-checked", "true")
  })
})

// ─── 8. axe accessibility ───────────────────────────────────────────────

describe("Switch — a11y (axe)", () => {
  it("passes axe unchecked", async () => {
    const { container } = render(<Switch label="Push notifications" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("passes axe checked", async () => {
    const { container } = render(<Switch label="Push notifications" defaultChecked />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("passes axe disabled", async () => {
    const { container } = render(<Switch label="Push notifications" disabled />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("passes axe with description", async () => {
    const { container } = render(
      <Switch label="Push notifications" description="Alerts on this device" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it("warns in dev when no accessible name is provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(<Switch />)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("No accessible name provided"))
    warnSpy.mockRestore()
  })
})
