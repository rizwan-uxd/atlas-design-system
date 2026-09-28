import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "../src/primitives/Select/Select"

function TestSelect(props: {
  size?: "sm" | "md"
  disabled?: boolean
  invalid?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  placeholder?: string
}) {
  return (
    <Select
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
    >
      <SelectTrigger size={props.size} invalid={props.invalid} aria-label="Test select">
        <SelectValue placeholder={props.placeholder ?? "Pick one"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Alpha</SelectItem>
        <SelectItem value="b">Bravo</SelectItem>
        <SelectItem value="c" disabled>Charlie</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe("Select", () => {
  // ── 1. Renders ──────────────────────────────────────────────────
  it("renders a trigger with combobox role", () => {
    render(<TestSelect />)
    const trigger = screen.getByRole("combobox")
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("shows placeholder text", () => {
    render(<TestSelect placeholder="Choose" />)
    expect(screen.getByRole("combobox")).toHaveTextContent("Choose")
  })

  // ── 2. Sizes ────────────────────────────────────────────────────
  it.each(["sm", "md"] as const)("applies %s size class", (size) => {
    render(<TestSelect size={size} />)
    expect(screen.getByRole("combobox").className).toContain(size)
  })

  // ── 3. Open / close ────────────────────────────────────────────
  it("opens on click and shows listbox", () => {
    render(<TestSelect />)
    fireEvent.click(screen.getByRole("combobox"))
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true")
  })

  it("closes on Escape", () => {
    render(<TestSelect />)
    fireEvent.click(screen.getByRole("combobox"))
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" })
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getByRole("combobox"))
  })

  // ── 4. Selection ───────────────────────────────────────────────
  it("selects an item on click and shows its label", () => {
    const onChange = vi.fn()
    render(<TestSelect onValueChange={onChange} />)
    fireEvent.click(screen.getByRole("combobox"))
    fireEvent.click(screen.getByText("Alpha"))
    expect(onChange).toHaveBeenCalledWith("a")
    expect(screen.getByRole("combobox")).toHaveTextContent("Alpha")
  })

  it("shows checkmark on the selected item", () => {
    render(<TestSelect defaultValue="b" />)
    fireEvent.click(screen.getByRole("combobox"))
    const bravo = screen.getByText("Bravo").closest('[role="option"]')!
    expect(bravo).toHaveAttribute("aria-selected", "true")
  })

  // ── 5. Keyboard ────────────────────────────────────────────────
  it("opens with ArrowDown and focuses first item", () => {
    render(<TestSelect />)
    const trigger = screen.getByRole("combobox")
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "ArrowDown" })
    expect(screen.getByRole("listbox")).toBeInTheDocument()
  })

  it("Enter selects the focused item", () => {
    const onChange = vi.fn()
    render(<TestSelect onValueChange={onChange} />)
    const trigger = screen.getByRole("combobox")
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "ArrowDown" })
    const listbox = screen.getByRole("listbox")
    fireEvent.keyDown(listbox, { key: "Enter" })
    expect(onChange).toHaveBeenCalledWith("a")
  })

  // ── 6. Disabled ────────────────────────────────────────────────
  it("disabled trigger prevents opening", () => {
    render(<TestSelect disabled />)
    const trigger = screen.getByRole("combobox")
    expect(trigger).toBeDisabled()
    fireEvent.click(trigger)
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("disabled items have aria-disabled", () => {
    render(<TestSelect />)
    fireEvent.click(screen.getByRole("combobox"))
    const charlie = screen.getByText("Charlie").closest('[role="option"]')!
    expect(charlie).toHaveAttribute("aria-disabled", "true")
  })

  // ── 7. Invalid ─────────────────────────────────────────────────
  it("invalid sets aria-invalid on trigger", () => {
    render(<TestSelect invalid />)
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
  })

  // ── 8. Groups and labels ───────────────────────────────────────
  it("renders groups and labels", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Veggies</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    )
    fireEvent.click(screen.getByRole("combobox"))
    expect(screen.getByText("Fruits")).toBeInTheDocument()
    expect(screen.getByText("Veggies")).toBeInTheDocument()
    expect(screen.getAllByRole("group")).toHaveLength(2)
  })

  // ── 9. Form participation ──────────────────────────────────────
  it("renders hidden input with name and value", () => {
    const { container } = render(
      <Select name="freq" defaultValue="daily">
        <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
        </SelectContent>
      </Select>,
    )
    const hidden = container.querySelector('input[name="freq"]') as HTMLInputElement
    expect(hidden).toBeTruthy()
    expect(hidden.value).toBe("daily")
  })

  // ── 10. Accessibility ──────────────────────────────────────────
  it("passes axe (closed)", async () => {
    const { container } = render(<TestSelect />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("passes axe (open)", async () => {
    const { container } = render(<TestSelect />)
    fireEvent.click(screen.getByRole("combobox"))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
