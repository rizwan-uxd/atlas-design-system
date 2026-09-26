/**
 * Atlas Slider — test suite
 *
 * Coverage:
 *   1. Semantics — role=slider, aria values, names, orientation, value text
 *   2. Keyboard — arrows, PageUp/PageDown, Home/End, RTL, vertical, clamping and step
 *   3. Range — two thumbs, bounds, thumbs cannot cross, Minimum/Maximum names
 *   4. Pointer — value from the pointer position, nearest thumb, disabled
 *   5. Controlled and uncontrolled, form values, slots, axe
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import { Slider, type SliderOrientation } from "@atlas/ui-web/primitives/Slider/Slider"

const ORIENTATIONS: SliderOrientation[] = ["horizontal", "vertical"]

afterEach(() => vi.restoreAllMocks())

/** jsdom has no PointerEvent, so dispatch a MouseEvent with the pointer event name (keeps clientX/Y). */
function pointer(el: Element, type: "pointerdown" | "pointermove" | "pointerup", init: MouseEventInit = {}) {
  fireEvent(el, new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...init }))
}

function mockRect(el: Element, rect: Partial<DOMRect>) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {}, ...rect,
  } as DOMRect)
}

describe("Slider — semantics", () => {
  it("renders one named slider thumb with aria values", () => {
    render(<Slider label="Volume" defaultValue={40} />)
    const s = screen.getByRole("slider", { name: "Volume" })
    expect(s).toHaveAttribute("aria-valuemin", "0")
    expect(s).toHaveAttribute("aria-valuemax", "100")
    expect(s).toHaveAttribute("aria-valuenow", "40")
    expect(s).toHaveAttribute("aria-orientation", "horizontal")
    expect(s).toHaveAttribute("tabindex", "0")
  })

  it("uses aria-label when there is no visible label", () => {
    render(<Slider aria-label="Brightness" />)
    expect(screen.getByRole("slider", { name: "Brightness" })).toBeInTheDocument()
  })

  it("links helper text with aria-describedby", () => {
    render(<Slider label="Volume" helperText="Drag me" />)
    expect(screen.getByRole("slider")).toHaveAccessibleDescription("Drag me")
  })

  it("sets aria-valuetext from getAriaValueText", () => {
    render(<Slider label="Temp" defaultValue={21} getAriaValueText={(v) => `${v} degrees`} />)
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "21 degrees")
  })

  it("defaults: horizontal, min 0, max 100, value min", () => {
    const { container } = render(<Slider aria-label="x" />)
    expect(container.firstElementChild).toHaveAttribute("data-orientation", "horizontal")
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0")
  })

  it("renders label, value text and side text slots", () => {
    render(<Slider label="Brightness" valueLabel="50" leading="0" trailing="100" defaultValue={50} />)
    expect(screen.getByText("Brightness")).toBeInTheDocument()
    expect(screen.getByText("50")).toBeInTheDocument()
    expect(screen.getByText("0")).toBeInTheDocument()
    expect(screen.getByText("100")).toBeInTheDocument()
  })

  for (const o of ORIENTATIONS) {
    it(`${o} sets the orientation and passes axe`, async () => {
      const { container } = render(<Slider label="Level" orientation={o} defaultValue={30} />)
      expect(container.firstElementChild).toHaveAttribute("data-orientation", o)
      expect(screen.getByRole("slider")).toHaveAttribute("aria-orientation", o)
      expect(await axe(container)).toHaveNoViolations()
    })
  }
})

describe("Slider — keyboard", () => {
  it("arrows step and clamp", () => {
    const onValueChange = vi.fn()
    render(<Slider label="v" defaultValue={99} onValueChange={onValueChange} />)
    const s = screen.getByRole("slider")
    fireEvent.keyDown(s, { key: "ArrowRight" })
    expect(s).toHaveAttribute("aria-valuenow", "100")
    fireEvent.keyDown(s, { key: "ArrowUp" })
    expect(s).toHaveAttribute("aria-valuenow", "100")
    fireEvent.keyDown(s, { key: "ArrowLeft" })
    fireEvent.keyDown(s, { key: "ArrowDown" })
    expect(s).toHaveAttribute("aria-valuenow", "98")
    expect(onValueChange).toHaveBeenLastCalledWith(98)
  })

  it("PageUp and PageDown take ten steps", () => {
    render(<Slider label="v" defaultValue={50} step={2} />)
    const s = screen.getByRole("slider")
    fireEvent.keyDown(s, { key: "PageUp" })
    expect(s).toHaveAttribute("aria-valuenow", "70")
    fireEvent.keyDown(s, { key: "PageDown" })
    fireEvent.keyDown(s, { key: "PageDown" })
    expect(s).toHaveAttribute("aria-valuenow", "30")
  })

  it("Home and End go to the ends", () => {
    render(<Slider label="v" defaultValue={50} min={10} max={90} />)
    const s = screen.getByRole("slider")
    fireEvent.keyDown(s, { key: "End" })
    expect(s).toHaveAttribute("aria-valuenow", "90")
    fireEvent.keyDown(s, { key: "Home" })
    expect(s).toHaveAttribute("aria-valuenow", "10")
  })

  it("respects fractional steps without float drift", () => {
    render(<Slider label="v" defaultValue={0} step={0.1} max={1} />)
    const s = screen.getByRole("slider")
    for (let i = 0; i < 3; i++) fireEvent.keyDown(s, { key: "ArrowRight" })
    expect(s).toHaveAttribute("aria-valuenow", "0.3")
  })

  it("RTL reverses ArrowRight and ArrowLeft on a horizontal slider", () => {
    render(
      <div dir="rtl">
        <Slider label="v" defaultValue={50} />
      </div>,
    )
    const s = screen.getByRole("slider")
    fireEvent.keyDown(s, { key: "ArrowRight" })
    expect(s).toHaveAttribute("aria-valuenow", "49")
    fireEvent.keyDown(s, { key: "ArrowLeft" })
    fireEvent.keyDown(s, { key: "ArrowLeft" })
    expect(s).toHaveAttribute("aria-valuenow", "51")
  })

  it("vertical ArrowUp increases and ArrowDown decreases, RTL does not flip", () => {
    render(
      <div dir="rtl">
        <Slider label="v" orientation="vertical" defaultValue={50} />
      </div>,
    )
    const s = screen.getByRole("slider")
    fireEvent.keyDown(s, { key: "ArrowUp" })
    expect(s).toHaveAttribute("aria-valuenow", "51")
    fireEvent.keyDown(s, { key: "ArrowRight" })
    expect(s).toHaveAttribute("aria-valuenow", "52")
  })

  it("ignores other keys", () => {
    render(<Slider label="v" defaultValue={50} />)
    const s = screen.getByRole("slider")
    fireEvent.keyDown(s, { key: "a" })
    expect(s).toHaveAttribute("aria-valuenow", "50")
  })
})

describe("Slider — range", () => {
  it("renders two named thumbs with bounds set by each other", () => {
    render(<Slider range label="Price" defaultValue={[30, 70]} />)
    const lo = screen.getByRole("slider", { name: "Price Minimum" })
    const hi = screen.getByRole("slider", { name: "Price Maximum" })
    expect(lo).toHaveAttribute("aria-valuenow", "30")
    expect(lo).toHaveAttribute("aria-valuemin", "0")
    expect(lo).toHaveAttribute("aria-valuemax", "70")
    expect(hi).toHaveAttribute("aria-valuemin", "30")
    expect(hi).toHaveAttribute("aria-valuemax", "100")
  })

  it("thumbs cannot cross", () => {
    const onValueChange = vi.fn()
    render(<Slider range aria-label="Price" defaultValue={[40, 60]} onValueChange={onValueChange} />)
    const lo = screen.getByRole("slider", { name: "Minimum" })
    const hi = screen.getByRole("slider", { name: "Maximum" })
    fireEvent.keyDown(lo, { key: "End" })
    expect(lo).toHaveAttribute("aria-valuenow", "60")
    expect(onValueChange).toHaveBeenLastCalledWith([60, 60])
    fireEvent.keyDown(hi, { key: "Home" })
    expect(hi).toHaveAttribute("aria-valuenow", "60")
    fireEvent.keyDown(hi, { key: "ArrowLeft" })
    expect(hi).toHaveAttribute("aria-valuenow", "60")
  })

  it("defaults to the full range", () => {
    render(<Slider range aria-label="Price" />)
    expect(screen.getByRole("slider", { name: "Minimum" })).toHaveAttribute("aria-valuenow", "0")
    expect(screen.getByRole("slider", { name: "Maximum" })).toHaveAttribute("aria-valuenow", "100")
  })

  it("sorts a reversed value", () => {
    render(<Slider range aria-label="Price" value={[80, 20]} />)
    expect(screen.getByRole("slider", { name: "Minimum" })).toHaveAttribute("aria-valuenow", "20")
  })

  it("passes axe", async () => {
    const { container } = render(<Slider range label="Price" defaultValue={[20, 80]} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe("Slider — pointer", () => {
  function setup(props: React.ComponentProps<typeof Slider>) {
    const { container } = render(<Slider aria-label="v" {...props} />)
    const control = container.querySelector('[class*="control"]') as HTMLElement
    mockRect(control, { left: 0, top: 0, width: 200, height: 200 })
    return control
  }

  it("pointer down sets the value from the position", () => {
    const control = setup({ defaultValue: 0 })
    pointer(control, "pointerdown", { clientX: 50, clientY: 0, button: 0 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "25")
  })

  it("dragging follows the pointer and stops on release", () => {
    const control = setup({ defaultValue: 0 })
    pointer(control, "pointerdown", { clientX: 20, clientY: 0, button: 0 })
    pointer(control, "pointermove", { clientX: 100, clientY: 0 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50")
    pointer(control, "pointerup")
    pointer(control, "pointermove", { clientX: 180, clientY: 0 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50")
  })

  it("clamps outside the track", () => {
    const control = setup({ defaultValue: 50 })
    pointer(control, "pointerdown", { clientX: 999, clientY: 0, button: 0 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "100")
  })

  it("vertical maps the bottom to min and the top to max", () => {
    const control = setup({ orientation: "vertical", defaultValue: 0 })
    pointer(control, "pointerdown", { clientX: 0, clientY: 200, button: 0 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0")
    pointer(control, "pointerdown", { clientX: 0, clientY: 0, button: 0 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "100")
  })

  it("RTL maps the right edge to min", () => {
    const { container } = render(
      <div dir="rtl">
        <Slider aria-label="v" defaultValue={50} />
      </div>,
    )
    const control = container.querySelector('[class*="control"]') as HTMLElement
    mockRect(control, { left: 0, width: 200 })
    pointer(control, "pointerdown", { clientX: 200, clientY: 0, button: 0 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0")
  })

  it("range moves the nearest thumb", () => {
    const control = setup({ range: true, defaultValue: [20, 80] })
    pointer(control, "pointerdown", { clientX: 140, clientY: 0, button: 0 })
    expect(screen.getByRole("slider", { name: "Maximum" })).toHaveAttribute("aria-valuenow", "70")
    expect(screen.getByRole("slider", { name: "Minimum" })).toHaveAttribute("aria-valuenow", "20")
    pointer(control, "pointerup")
    pointer(control, "pointerdown", { clientX: 20, clientY: 0, button: 0 })
    expect(screen.getByRole("slider", { name: "Minimum" })).toHaveAttribute("aria-valuenow", "10")
  })

  it("snaps to the step", () => {
    const control = setup({ defaultValue: 0, step: 10 })
    pointer(control, "pointerdown", { clientX: 62, clientY: 0, button: 0 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "30")
  })

  it("ignores non-primary buttons", () => {
    const control = setup({ defaultValue: 0 })
    pointer(control, "pointerdown", { clientX: 100, clientY: 0, button: 2 })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0")
  })
})

describe("Slider — disabled", () => {
  it("blocks keyboard and pointer and leaves the tab order", () => {
    const onValueChange = vi.fn()
    const { container } = render(<Slider aria-label="v" disabled defaultValue={50} onValueChange={onValueChange} />)
    const s = screen.getByRole("slider")
    expect(s).toHaveAttribute("aria-disabled", "true")
    expect(s).toHaveAttribute("tabindex", "-1")
    expect(container.firstElementChild).toHaveAttribute("data-disabled", "true")
    fireEvent.keyDown(s, { key: "ArrowRight" })
    const control = container.querySelector('[class*="control"]') as HTMLElement
    mockRect(control, { width: 200 })
    pointer(control, "pointerdown", { clientX: 150, button: 0 })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(s).toHaveAttribute("aria-valuenow", "50")
  })
})

describe("Slider — controlled and forms", () => {
  it("controlled value only changes through the prop", () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<Slider aria-label="v" value={30} onValueChange={onValueChange} />)
    const s = screen.getByRole("slider")
    fireEvent.keyDown(s, { key: "ArrowRight" })
    expect(onValueChange).toHaveBeenCalledWith(31)
    expect(s).toHaveAttribute("aria-valuenow", "30")
    rerender(<Slider aria-label="v" value={31} onValueChange={onValueChange} />)
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "31")
  })

  it("submits hidden inputs under the name", () => {
    const { container } = render(<Slider aria-label="v" name="vol" defaultValue={40} />)
    const inputs = container.querySelectorAll('input[type="hidden"][name="vol"]')
    expect(inputs).toHaveLength(1)
    expect((inputs[0] as HTMLInputElement).value).toBe("40")
  })

  it("a range submits two values", () => {
    const { container } = render(<Slider range aria-label="v" name="price" defaultValue={[10, 90]} />)
    const vals = [...container.querySelectorAll('input[name="price"]')].map((i) => (i as HTMLInputElement).value)
    expect(vals).toEqual(["10", "90"])
  })

  it("passes className and other props to the root", () => {
    const { container } = render(<Slider aria-label="v" className="x" data-testid="s" />)
    expect(container.firstElementChild).toHaveClass("x")
    expect(screen.getByTestId("s")).toBeInTheDocument()
  })
})

describe("Slider — styles", () => {
  const css = readFileSync(resolve(__dirname, "../src/primitives/Slider/Slider.module.css"), "utf8")

  it("uses no hardcoded colours", () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(/)
  })

  it("stops transitions under reduced motion", () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*transition: none/)
  })

  it("expands the hit area to the touch minimum", () => {
    expect(css).toContain("--atlas-touch-min")
  })
})
