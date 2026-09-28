import { describe, it, expect, vi, beforeAll, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  type TooltipSide,
} from "../src/primitives/Tooltip/Tooltip"

beforeAll(() => {
  // Radix Popper measures with ResizeObserver, which jsdom lacks.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function TestTooltip(props: { side?: TooltipSide; defaultOpen?: boolean; text?: string }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip defaultOpen={props.defaultOpen}>
        <TooltipTrigger asChild>
          <button type="button">Trigger</button>
        </TooltipTrigger>
        <TooltipContent side={props.side}>{props.text ?? "Add to library"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const contentEl = () => document.querySelector<HTMLElement>("[data-side]")

// The portalled content sits outside any landmark in an isolated fragment; the
// page-level `region` rule doesn't apply to a component under test.
const axeBody = () => axe(document.body, { rules: { region: { enabled: false } } })

describe("Tooltip", () => {
  // ── 1. Renders ──────────────────────────────────────────────────
  it("is closed by default", () => {
    render(<TestTooltip />)
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  it("renders its content with the tooltip role when open", () => {
    render(<TestTooltip defaultOpen text="Add to library" />)
    expect(screen.getByRole("tooltip")).toHaveTextContent("Add to library")
  })

  // ── 2. Sides ────────────────────────────────────────────────────
  it.each<[TooltipSide, string]>([
    ["top", "top"],
    ["bottom", "bottom"],
    ["start", "left"],
    ["end", "right"],
  ])("side=%s renders on the %s edge in LTR", (side, physical) => {
    render(<TestTooltip defaultOpen side={side} />)
    expect(contentEl()).toHaveAttribute("data-side", physical)
  })

  it.each<[TooltipSide, string]>([
    ["start", "right"],
    ["end", "left"],
  ])("side=%s flips to the %s edge in RTL", (side, physical) => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ direction: "rtl" } as CSSStyleDeclaration)
    render(<TestTooltip defaultOpen side={side} />)
    expect(contentEl()).toHaveAttribute("data-side", physical)
  })

  it("defaults to the top side", () => {
    render(<TestTooltip defaultOpen />)
    expect(contentEl()).toHaveAttribute("data-side", "top")
  })

  // ── 3. Interaction ──────────────────────────────────────────────
  it("opens when the trigger receives keyboard focus", async () => {
    render(<TestTooltip />)
    fireEvent.focus(screen.getByRole("button", { name: "Trigger" }))
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Add to library")
  })

  it("opens on pointer hover", async () => {
    render(<TestTooltip />)
    fireEvent.pointerMove(screen.getByRole("button", { name: "Trigger" }))
    expect(await screen.findByRole("tooltip")).toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    render(<TestTooltip defaultOpen />)
    expect(screen.getByRole("tooltip")).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole("button", { name: "Trigger" }), { key: "Escape" })
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  it("describes the trigger while open", () => {
    render(<TestTooltip defaultOpen />)
    const trigger = screen.getByRole("button", { name: "Trigger" })
    const describedBy = trigger.getAttribute("aria-describedby")
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy as string)).toHaveTextContent("Add to library")
  })

  // ── 4. Styling hooks ────────────────────────────────────────────
  it("merges a custom className onto the content", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">Trigger</button>
          </TooltipTrigger>
          <TooltipContent className="custom">Hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(contentEl()).toHaveClass("custom")
  })

  // ── 5. Accessibility ────────────────────────────────────────────
  it.each<TooltipSide>(["top", "bottom", "start", "end"])("side=%s has no axe violations", async (side) => {
    render(<TestTooltip defaultOpen side={side} />)
    expect(await axeBody()).toHaveNoViolations()
  })

  it("has no axe violations when closed", async () => {
    render(<TestTooltip />)
    expect(await axeBody()).toHaveNoViolations()
  })
})
