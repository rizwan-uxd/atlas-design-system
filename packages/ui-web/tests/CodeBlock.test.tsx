/**
 * Atlas CodeBlock — test suite
 *
 * Coverage:
 *   1. Renders — group name, code, header label, header off
 *   2. Variant × size matrix
 *   3. Line numbers
 *   4. Copy — clipboard, "Copied" announcement, reset, onCopy
 *   5. Typing — writes out over time, onDone, writing={false}, reduced motion
 *   6. axe accessibility check per variant
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  CodeBlock,
  type CodeBlockSize,
  type CodeBlockVariant,
} from "@atlas/ui-web/compositions/CodeBlock/CodeBlock"

const motion = vi.hoisted(() => ({ reduced: false }))
vi.mock("@atlas/ui-web/motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@atlas/ui-web/motion")>()),
  usePrefersReducedMotion: () => motion.reduced,
}))

const CODE = 'const a = 1\nconst b = 2\nconst c = 3'
const SIZES: CodeBlockSize[] = ["sm", "md", "lg"]
const VARIANTS: CodeBlockVariant[] = ["default", "typing"]

afterEach(() => {
  motion.reduced = false
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// ─── 1. Renders ────────────────────────────────────────────────────────────

describe("CodeBlock — renders", () => {
  it("shows the code and names the group after the filename", () => {
    render(<CodeBlock code={CODE} filename="greet.ts" />)
    expect(screen.getByRole("group", { name: "greet.ts" })).toBeInTheDocument()
    expect(screen.getByText(/const a = 1/)).toBeInTheDocument()
    expect(screen.getByText("greet.ts")).toBeInTheDocument()
  })

  it("falls back to language, then to 'Code', for the name", () => {
    const { rerender } = render(<CodeBlock code={CODE} language="tsx" />)
    expect(screen.getByRole("group", { name: "tsx" })).toBeInTheDocument()
    rerender(<CodeBlock code={CODE} />)
    expect(screen.getByRole("group", { name: "Code" })).toBeInTheDocument()
  })

  it("aria-label overrides the derived name", () => {
    render(<CodeBlock code={CODE} filename="greet.ts" aria-label="Greeting example" />)
    expect(screen.getByRole("group", { name: "Greeting example" })).toBeInTheDocument()
  })

  it("keeps the copy button when the header is hidden", () => {
    const { container } = render(<CodeBlock code={CODE} showHeader={false} filename="greet.ts" />)
    expect(screen.queryByText("greet.ts")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument()
    expect(container.querySelector("pre")).toHaveAttribute("tabindex", "0")
  })
})

// ─── 2. Variant × size matrix ──────────────────────────────────────────────

describe("CodeBlock — variant × size", () => {
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      it(`variant="${variant}" size="${size}" sets its data attributes`, () => {
        render(<CodeBlock code={CODE} variant={variant} size={size} writing={false} />)
        const root = screen.getByRole("group")
        expect(root).toHaveAttribute("data-variant", variant)
        expect(root).toHaveAttribute("data-size", size)
      })
    }
  }
})

// ─── 3. Line numbers ───────────────────────────────────────────────────────

describe("CodeBlock — line numbers", () => {
  it("is off by default", () => {
    const { container } = render(<CodeBlock code={CODE} />)
    expect(container.querySelector('span[aria-hidden="true"]')).toBeNull()
  })

  it("shows one number per line, hidden from assistive tech", () => {
    const { container } = render(<CodeBlock code={CODE} showLineNumbers />)
    const numbers = container.querySelector('span[aria-hidden="true"]')!
    expect(numbers.textContent).toBe("1\n2\n3")
  })
})

// ─── 4. Copy ───────────────────────────────────────────────────────────────

describe("CodeBlock — copy", () => {
  function stubClipboard(impl: () => Promise<void> = () => Promise.resolve()) {
    const writeText = vi.fn(impl)
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } })
    return writeText
  }

  it("writes the full code to the clipboard, announces Copied and calls onCopy", async () => {
    const writeText = stubClipboard()
    const onCopy = vi.fn()
    render(<CodeBlock code={CODE} onCopy={onCopy} />)
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Copy code" })) })
    expect(writeText).toHaveBeenCalledWith(CODE)
    expect(onCopy).toHaveBeenCalledWith(CODE)
    expect(screen.getByRole("status")).toHaveTextContent("Copied")
  })

  it("resets after a moment", async () => {
    vi.useFakeTimers()
    stubClipboard()
    render(<CodeBlock code={CODE} />)
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Copy code" })) })
    expect(screen.getByRole("status")).toHaveTextContent("Copied")
    await act(async () => { vi.advanceTimersByTime(2100) })
    expect(screen.getByRole("status")).toHaveTextContent("")
  })

  it("does not announce when the clipboard write fails", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")))
    const onCopy = vi.fn()
    render(<CodeBlock code={CODE} onCopy={onCopy} />)
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Copy code" })) })
    expect(onCopy).not.toHaveBeenCalled()
    expect(screen.getByRole("status")).toHaveTextContent("")
  })

  it("uses a custom copy label", () => {
    render(<CodeBlock code={CODE} copyLabel="Copy snippet" />)
    expect(screen.getByRole("button", { name: "Copy snippet" })).toBeInTheDocument()
  })
})

// ─── 5. Typing ─────────────────────────────────────────────────────────────

describe("CodeBlock — typing variant", () => {
  let now = 0
  beforeEach(() => {
    vi.useFakeTimers()
    now = 0
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      setTimeout(() => { now += 16; cb(now) }, 16) as unknown as number
    )
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id))
  })

  it("starts empty and writes the code out, then calls onDone", () => {
    const onDone = vi.fn()
    const { container } = render(<CodeBlock code={CODE} variant="typing" duration={320} onDone={onDone} />)
    const visible = () => container.querySelector('code > span[aria-hidden="true"]')?.textContent ?? ""
    expect(visible()).toBe("")
    act(() => { vi.advanceTimersByTime(160) })
    expect(visible().length).toBeGreaterThan(0)
    expect(visible().length).toBeLessThan(CODE.length)
    expect(onDone).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(400) })
    expect(container.querySelector("code")?.textContent).toBe(CODE)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it("exposes the full code to assistive tech while typing", () => {
    const { container } = render(<CodeBlock code={CODE} variant="typing" duration={320} />)
    act(() => { vi.advanceTimersByTime(80) })
    const sr = Array.from(container.querySelectorAll("code span")).find((el) => el.textContent === CODE)
    expect(sr).toBeTruthy()
    expect(container.querySelector('code > span[aria-hidden="true"]')).toBeTruthy()
  })

  it("respects delay", () => {
    const { container } = render(<CodeBlock code={CODE} variant="typing" duration={320} delay={200} />)
    act(() => { vi.advanceTimersByTime(150) })
    expect(container.querySelector('code > span[aria-hidden="true"]')?.textContent ?? "").toBe("")
  })

  it("writing={false} shows the full code and reports done", () => {
    const onDone = vi.fn()
    const { container } = render(<CodeBlock code={CODE} variant="typing" writing={false} onDone={onDone} />)
    expect(container.querySelector("code")?.textContent).toBe(CODE)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it("shows the full code immediately under reduced motion", () => {
    motion.reduced = true
    const onDone = vi.fn()
    const { container } = render(<CodeBlock code={CODE} variant="typing" onDone={onDone} />)
    expect(container.querySelector("code")?.textContent).toBe(CODE)
    expect(onDone).toHaveBeenCalled()
  })

  it("the default variant never animates", () => {
    const { container } = render(<CodeBlock code={CODE} />)
    expect(container.querySelector("code")?.textContent).toBe(CODE)
  })
})

// ─── 6. axe ────────────────────────────────────────────────────────────────

describe("CodeBlock — axe", () => {
  for (const variant of VARIANTS) {
    it(`has no axe violations: variant="${variant}" with header and line numbers`, async () => {
      const { container } = render(
        <CodeBlock code={CODE} variant={variant} writing={false} filename="greet.ts" showLineNumbers />
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  }

  it("has no axe violations: header hidden", async () => {
    const { container } = render(<CodeBlock code={CODE} showHeader={false} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
