/**
 * Atlas DropdownMenu — test suite
 *
 * Coverage:
 *   1. Trigger — closed by default, aria-haspopup / aria-expanded, asChild merge
 *   2. Opening — click, ArrowDown (first row), ArrowUp (last row), side, controlled
 *   3. Keyboard — arrows wrap, skip disabled, Home / End, typeahead
 *   4. Selecting — Enter / Space / click, onSelect + preventDefault, disabled rows
 *   5. Closing — Escape returns focus, outside press, Tab
 *   6. Checkbox and radio rows — roles, aria-checked, callbacks
 *   7. Rows — destructive, icon, shortcut
 *   8. Submenu — ArrowRight / ArrowLeft, Escape closes only the submenu
 *   9. Breadcrumb dropdown wired as a trigger
 *  10. axe accessibility check on an open menu with every row type
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@atlas/ui-web/patterns/DropdownMenu/DropdownMenu"
import { BreadcrumbDropdown } from "@atlas/ui-web/patterns/Breadcrumb/Breadcrumb"

// ─── Fixtures ──────────────────────────────────────────────────────────────

function Basic(props: { onSelect?: (e: Event) => void; side?: "bottom" | "top"; defaultOpen?: boolean }) {
  return (
    <DropdownMenu defaultOpen={props.defaultOpen}>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent side={props.side}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={props.onSelect}>Profile</DropdownMenuItem>
          <DropdownMenuItem shortcut="⌘B">Billing</DropdownMenuItem>
          <DropdownMenuItem disabled>Support</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const trigger = () => screen.getByRole("button", { name: "Open menu" })
const openWithClick = () => fireEvent.click(trigger())
// Names may carry a shortcut hint ("Billing ⌘B"), so match on the start.
const item = (name: string) => screen.getByRole("menuitem", { name: new RegExp(`^${name}`) })

// ─── 1. Trigger ────────────────────────────────────────────────────────────

describe("DropdownMenuTrigger", () => {
  it("is closed by default with menu semantics", () => {
    render(<Basic />)
    expect(screen.queryByRole("menu")).toBeNull()
    expect(trigger()).toHaveAttribute("aria-haspopup", "menu")
    expect(trigger()).toHaveAttribute("aria-expanded", "false")
  })

  it("merges onto its child with asChild", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <a href="#x">Custom trigger</a>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const link = screen.getByRole("link", { name: "Custom trigger" })
    expect(link).toHaveAttribute("aria-haspopup", "menu")
    fireEvent.click(link)
    expect(screen.getByRole("menu")).toBeInTheDocument()
    expect(link).toHaveAttribute("aria-expanded", "true")
  })
})

// ─── 2. Opening ────────────────────────────────────────────────────────────

describe("opening", () => {
  it("opens on click, labelled by the trigger", () => {
    render(<Basic />)
    openWithClick()
    const menu = screen.getByRole("menu")
    expect(menu).toHaveAttribute("aria-labelledby", trigger().id)
    expect(trigger()).toHaveAttribute("aria-expanded", "true")
  })

  it("toggles closed on a second click", () => {
    render(<Basic />)
    openWithClick()
    openWithClick()
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("ArrowDown opens onto the first row", () => {
    render(<Basic />)
    fireEvent.keyDown(trigger(), { key: "ArrowDown" })
    expect(item("Profile")).toHaveFocus()
  })

  it("ArrowUp opens onto the last row", () => {
    render(<Basic />)
    fireEvent.keyDown(trigger(), { key: "ArrowUp" })
    expect(item("Log out")).toHaveFocus()
  })

  it("reports the side the panel opens on", () => {
    render(<Basic side="top" defaultOpen />)
    expect(screen.getByRole("menu")).toHaveAttribute("data-side", "top")
  })

  it("supports controlled open state", () => {
    const onOpenChange = vi.fn()
    render(
      <DropdownMenu open onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByRole("menu")).toBeInTheDocument()
    fireEvent.click(trigger())
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })
})

// ─── 3. Keyboard ───────────────────────────────────────────────────────────

describe("keyboard navigation", () => {
  it("ArrowDown and ArrowUp move focus, wrap, and skip disabled rows", () => {
    render(<Basic />)
    fireEvent.keyDown(trigger(), { key: "ArrowDown" })
    expect(item("Profile")).toHaveFocus()
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" })
    expect(item("Billing")).toHaveFocus()
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" })
    expect(item("Log out")).toHaveFocus() // Support is disabled
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" })
    expect(item("Profile")).toHaveFocus() // wrapped
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" })
    expect(item("Log out")).toHaveFocus()
  })

  it("Home and End jump to the first and last enabled rows", () => {
    render(<Basic />)
    fireEvent.keyDown(trigger(), { key: "ArrowDown" })
    fireEvent.keyDown(screen.getByRole("menu"), { key: "End" })
    expect(item("Log out")).toHaveFocus()
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Home" })
    expect(item("Profile")).toHaveFocus()
  })

  it("typeahead focuses the row that starts with the typed letters", () => {
    render(<Basic />)
    fireEvent.keyDown(trigger(), { key: "ArrowDown" })
    fireEvent.keyDown(screen.getByRole("menu"), { key: "l" })
    expect(item("Log out")).toHaveFocus()
  })

  it("pointer highlights a row like the keyboard does", () => {
    render(<Basic defaultOpen />)
    fireEvent.pointerMove(item("Billing"))
    expect(item("Billing")).toHaveFocus()
  })
})

// ─── 4. Selecting ──────────────────────────────────────────────────────────

describe("selecting", () => {
  it("Enter selects the focused row, calls onSelect and closes", () => {
    const onSelect = vi.fn()
    render(<Basic onSelect={onSelect} />)
    fireEvent.keyDown(trigger(), { key: "ArrowDown" })
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Enter" })
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("menu")).toBeNull()
    expect(trigger()).toHaveFocus()
  })

  it("Space selects the focused row", () => {
    const onSelect = vi.fn()
    render(<Basic onSelect={onSelect} />)
    fireEvent.keyDown(trigger(), { key: "ArrowDown" })
    fireEvent.keyDown(screen.getByRole("menu"), { key: " " })
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it("click selects and closes", () => {
    const onSelect = vi.fn()
    render(<Basic onSelect={onSelect} />)
    openWithClick()
    fireEvent.click(item("Profile"))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("preventDefault in onSelect keeps the menu open", () => {
    render(<Basic onSelect={(e) => e.preventDefault()} />)
    openWithClick()
    fireEvent.click(item("Profile"))
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })

  it("a disabled row is aria-disabled and cannot be selected", () => {
    const onSelect = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>Support</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const row = item("Support")
    expect(row).toHaveAttribute("aria-disabled", "true")
    fireEvent.click(row)
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })
})

// ─── 5. Closing ────────────────────────────────────────────────────────────

describe("closing", () => {
  it("Escape closes and returns focus to the trigger", () => {
    render(<Basic />)
    fireEvent.keyDown(trigger(), { key: "ArrowDown" })
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" })
    expect(screen.queryByRole("menu")).toBeNull()
    expect(trigger()).toHaveFocus()
  })

  it("a pointer press outside closes; inside does not", () => {
    render(<Basic />)
    openWithClick()
    fireEvent.pointerDown(screen.getByRole("menu"))
    expect(screen.getByRole("menu")).toBeInTheDocument()
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("Tab closes the menu", () => {
    render(<Basic />)
    fireEvent.keyDown(trigger(), { key: "ArrowDown" })
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" })
    expect(screen.queryByRole("menu")).toBeNull()
  })
})

// ─── 6. Checkbox and radio rows ────────────────────────────────────────────

describe("checkbox and radio rows", () => {
  it("checkbox row exposes menuitemcheckbox and toggles", () => {
    const onCheckedChange = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked onCheckedChange={onCheckedChange}>Status bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>Panel</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const on = screen.getByRole("menuitemcheckbox", { name: "Status bar" })
    expect(on).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("menuitemcheckbox", { name: "Panel" })).toHaveAttribute("aria-checked", "false")
    fireEvent.click(on)
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it("radio group marks the selected value and reports changes", () => {
    const onValueChange = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="name" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByRole("menuitemradio", { name: "Name" })).toHaveAttribute("aria-checked", "true")
    const date = screen.getByRole("menuitemradio", { name: "Date" })
    expect(date).toHaveAttribute("aria-checked", "false")
    fireEvent.click(date)
    expect(onValueChange).toHaveBeenCalledWith("date")
  })
})

// ─── 7. Rows ───────────────────────────────────────────────────────────────

describe("rows", () => {
  it("marks a destructive row", () => {
    render(<Basic defaultOpen />)
    expect(item("Log out")).toHaveAttribute("data-destructive")
    expect(item("Profile")).not.toHaveAttribute("data-destructive")
  })

  it("renders a shortcut hint", () => {
    render(<Basic defaultOpen />)
    expect(screen.getByText("⌘B")).toBeInTheDocument()
  })

  it("renders a separator and a group", () => {
    render(<Basic defaultOpen />)
    expect(screen.getByRole("separator")).toBeInTheDocument()
    expect(screen.getByRole("group")).toBeInTheDocument()
  })
})

// ─── 8. Submenu ────────────────────────────────────────────────────────────

function WithSub() {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>New file</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Message</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe("submenu", () => {
  it("the trigger row announces a popup and is closed by default", () => {
    render(<WithSub />)
    const row = screen.getByRole("menuitem", { name: "Share" })
    expect(row).toHaveAttribute("aria-haspopup", "menu")
    expect(row).toHaveAttribute("aria-expanded", "false")
    expect(screen.getAllByRole("menu")).toHaveLength(1)
  })

  it("ArrowRight opens the submenu onto its first row; ArrowLeft closes it", () => {
    render(<WithSub />)
    const row = screen.getByRole("menuitem", { name: "Share" })
    act(() => row.focus())
    fireEvent.keyDown(row, { key: "ArrowRight" })
    expect(screen.getAllByRole("menu")).toHaveLength(2)
    expect(screen.getByRole("menuitem", { name: "Email" })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Email" }), { key: "ArrowLeft" })
    expect(screen.getAllByRole("menu")).toHaveLength(1)
    expect(row).toHaveFocus()
  })

  it("Escape in the submenu closes only the submenu", () => {
    render(<WithSub />)
    const row = screen.getByRole("menuitem", { name: "Share" })
    act(() => row.focus())
    fireEvent.keyDown(row, { key: "ArrowRight" })
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Email" }), { key: "Escape" })
    expect(screen.getAllByRole("menu")).toHaveLength(1)
  })

  it("selecting a submenu row closes the whole menu", () => {
    render(<WithSub />)
    const row = screen.getByRole("menuitem", { name: "Share" })
    act(() => row.focus())
    fireEvent.keyDown(row, { key: "ArrowRight" })
    fireEvent.click(screen.getByRole("menuitem", { name: "Email" }))
    expect(screen.queryByRole("menu")).toBeNull()
  })
})

// ─── 9. Breadcrumb dropdown ────────────────────────────────────────────────

describe("with BreadcrumbDropdown", () => {
  it("opens an Atlas menu from the breadcrumb trigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <BreadcrumbDropdown>Components</BreadcrumbDropdown>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Documentation</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const button = screen.getByRole("button", { name: "Components" })
    expect(button).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(button)
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("menuitem", { name: "Documentation" })).toBeInTheDocument()
  })
})

// ─── 10. Accessibility ─────────────────────────────────────────────────────

describe("accessibility", () => {
  it("an open menu with every row type has no axe violations", async () => {
    const { baseElement } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem shortcut="⌘B">Billing</DropdownMenuItem>
            <DropdownMenuItem disabled>Support</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Status bar</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Date</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem destructive>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    // The panel is portalled to <body>, outside any page landmark, so the page-level region rule does not apply.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations()
  })
})
