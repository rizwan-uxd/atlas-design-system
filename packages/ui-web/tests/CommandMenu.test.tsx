/**
 * Atlas CommandMenu — test suite
 *
 * Coverage:
 *   1. Closed until opened; opens by prop and by the Cmd/Ctrl + K shortcut (and `hotkey={false}`)
 *   2. Size matrix renders; the search field is a labelled combobox over a listbox
 *   3. Typing filters items (value, keywords, custom filter, filter={false}); groups with no match disappear
 *   4. Empty state when nothing matches; loading state hides the results and sets aria-busy
 *   5. Arrow, Home, End and Enter drive the highlighted row (aria-activedescendant)
 *   6. onSelect and closeOnSelect; disabled rows do not run
 *   7. axe accessibility check per size and state
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  CommandMenu,
  CommandMenuContent,
  CommandMenuGroup,
  CommandMenuItem,
  type CommandMenuSize,
} from "@atlas/ui-web/compositions/CommandMenu/CommandMenu"

const SIZES: CommandMenuSize[] = ["md", "lg"]

function Menu({
  size,
  loading,
  onSelect,
  onOpenChange,
  hotkey,
  open,
  filter,
}: {
  size?: CommandMenuSize
  loading?: boolean
  onSelect?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  hotkey?: string | false
  open?: boolean
  filter?: React.ComponentProps<typeof CommandMenuContent>["filter"]
}) {
  return (
    <CommandMenu open={open} defaultOpen={open === undefined ? true : undefined} onOpenChange={onOpenChange} hotkey={hotkey}>
      <CommandMenuContent size={size} loading={loading} filter={filter} label="Command menu">
        <CommandMenuGroup heading="Suggestions">
          <CommandMenuItem shortcut="⌘N" onSelect={onSelect}>New document</CommandMenuItem>
          <CommandMenuItem keywords={["recent", "history"]} onSelect={onSelect}>Open file</CommandMenuItem>
          <CommandMenuItem disabled onSelect={onSelect}>Invite teammate</CommandMenuItem>
        </CommandMenuGroup>
        <CommandMenuGroup heading="Navigation">
          <CommandMenuItem onSelect={onSelect}>Go to settings</CommandMenuItem>
        </CommandMenuGroup>
      </CommandMenuContent>
    </CommandMenu>
  )
}

const search = () => screen.getByRole("combobox", { name: "Command menu" }) as HTMLInputElement
const shown = () => screen.queryAllByRole("option").map((o) => o.textContent)

describe("CommandMenu", () => {
  it("renders a combobox over a listbox with every item", () => {
    render(<Menu />)
    expect(search()).toHaveAttribute("aria-autocomplete", "list")
    expect(screen.getByRole("listbox", { name: "Command menu" })).toBeInTheDocument()
    expect(screen.getAllByRole("option")).toHaveLength(4)
    expect(screen.getByRole("group", { name: "Suggestions" })).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it.each(SIZES)("renders size %s", (size) => {
    render(<Menu size={size} />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getAllByRole("option")).toHaveLength(4)
  })

  it("is closed until opened", () => {
    render(<Menu open={false} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("toggles with Cmd or Ctrl + K and reports it", () => {
    const onOpenChange = vi.fn()
    render(<Menu open={false} onOpenChange={onOpenChange} />)
    fireEvent.keyDown(document, { key: "k", metaKey: true })
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    fireEvent.keyDown(document, { key: "K", ctrlKey: true })
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })

  it("ignores the shortcut when hotkey is false", () => {
    const onOpenChange = vi.fn()
    render(<Menu open={false} onOpenChange={onOpenChange} hotkey={false} />)
    fireEvent.keyDown(document, { key: "k", metaKey: true })
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  describe("filtering", () => {
    it("filters by the item text, case-insensitively", () => {
      render(<Menu />)
      fireEvent.change(search(), { target: { value: "SETT" } })
      expect(shown()).toEqual(["Go to settings"])
    })

    it("also matches keywords", () => {
      render(<Menu />)
      fireEvent.change(search(), { target: { value: "history" } })
      expect(shown()).toEqual(["Open file"])
    })

    it("leaves a group with no matching item with no rows (the CSS then hides its heading)", () => {
      render(<Menu />)
      fireEvent.change(search(), { target: { value: "settings" } })
      expect(within(screen.getByRole("group", { name: "Suggestions" })).queryAllByRole("option")).toHaveLength(0)
      expect(within(screen.getByRole("group", { name: "Navigation" })).getAllByRole("option")).toHaveLength(1)
    })

    it("uses a custom filter, and filter={false} shows every item", () => {
      const { unmount } = render(<Menu filter={() => false} />)
      expect(shown()).toEqual([])
      unmount()
      render(<Menu filter={false} />)
      fireEvent.change(search(), { target: { value: "zzz" } })
      expect(shown()).toHaveLength(4)
    })
  })

  describe("states", () => {
    it("shows the empty message when nothing matches", () => {
      render(<Menu />)
      fireEvent.change(search(), { target: { value: "zzz" } })
      expect(screen.getByRole("status")).toHaveTextContent("No results found")
    })

    it("shows a spinner instead of the results while loading", () => {
      render(<Menu loading />)
      expect(screen.getByRole("status")).toHaveTextContent("Loading")
      expect(screen.queryByRole("option")).not.toBeInTheDocument()
      expect(screen.queryByText("No results found")).not.toBeInTheDocument()
      expect(screen.getByRole("dialog").querySelector("[aria-busy='true']")).not.toBeNull()
    })
  })

  describe("keyboard", () => {
    const active = () => search().getAttribute("aria-activedescendant")
    const idOf = (name: string) => screen.getByRole("option", { name: new RegExp(`^${name}`) }).id

    it("highlights the first enabled row, and moves with the arrow keys, skipping disabled rows", () => {
      render(<Menu />)
      expect(active()).toBe(idOf("New document"))
      fireEvent.keyDown(search(), { key: "ArrowDown" })
      expect(active()).toBe(idOf("Open file"))
      fireEvent.keyDown(search(), { key: "ArrowDown" })
      expect(active()).toBe(idOf("Go to settings"))
      fireEvent.keyDown(search(), { key: "ArrowDown" })
      expect(active()).toBe(idOf("New document"))
      fireEvent.keyDown(search(), { key: "ArrowUp" })
      expect(active()).toBe(idOf("Go to settings"))
    })

    it("Home and End jump to the ends", () => {
      render(<Menu />)
      fireEvent.keyDown(search(), { key: "End" })
      expect(active()).toBe(idOf("Go to settings"))
      fireEvent.keyDown(search(), { key: "Home" })
      expect(active()).toBe(idOf("New document"))
    })

    it("marks the highlighted row aria-selected", () => {
      render(<Menu />)
      expect(screen.getByRole("option", { name: /^New document/ })).toHaveAttribute("aria-selected", "true")
      expect(screen.getByRole("option", { name: "Open file" })).toHaveAttribute("aria-selected", "false")
    })

    it("moves the highlight to a row that is still shown after filtering", () => {
      render(<Menu />)
      fireEvent.change(search(), { target: { value: "settings" } })
      expect(active()).toBe(idOf("Go to settings"))
    })

    it("Enter runs the highlighted row", () => {
      const onSelect = vi.fn()
      render(<Menu onSelect={onSelect} />)
      fireEvent.keyDown(search(), { key: "ArrowDown" })
      fireEvent.keyDown(search(), { key: "Enter" })
      expect(onSelect).toHaveBeenCalledWith("Open file")
    })
  })

  describe("selecting", () => {
    it("runs onSelect on click and closes the menu", () => {
      const onSelect = vi.fn()
      render(<Menu onSelect={onSelect} />)
      fireEvent.click(screen.getByRole("option", { name: "Go to settings" }))
      expect(onSelect).toHaveBeenCalledWith("Go to settings")
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("does not run a disabled row", () => {
      const onSelect = vi.fn()
      render(<Menu onSelect={onSelect} />)
      const row = screen.getByRole("option", { name: "Invite teammate" })
      expect(row).toHaveAttribute("aria-disabled", "true")
      fireEvent.click(row)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it("stays open when closeOnSelect is false", () => {
      render(
        <CommandMenu defaultOpen>
          <CommandMenuContent closeOnSelect={false}>
            <CommandMenuItem>Stay</CommandMenuItem>
          </CommandMenuContent>
        </CommandMenu>,
      )
      fireEvent.click(screen.getByRole("option", { name: "Stay" }))
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })
  })

  describe("axe", () => {
    it.each(SIZES)("has no violations at size %s", async (size) => {
      render(<Menu size={size} />)
      expect(await axe(screen.getByRole("dialog"))).toHaveNoViolations()
    })

    it("has no violations when empty or loading", async () => {
      const { unmount } = render(<Menu loading />)
      expect(await axe(screen.getByRole("dialog"))).toHaveNoViolations()
      unmount()
      render(<Menu />)
      fireEvent.change(search(), { target: { value: "zzz" } })
      expect(await axe(screen.getByRole("dialog"))).toHaveNoViolations()
    })
  })
})
