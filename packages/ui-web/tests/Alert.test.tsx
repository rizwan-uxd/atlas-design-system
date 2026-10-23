/**
 * Atlas Alert — test suite
 *
 * Coverage:
 *   1. Renders default (info, md) without crashing, role="status"
 *   2. Variant × Size matrix — all 15 combinations render
 *   3. role switches to "alert" for warning/danger, stays "status" otherwise
 *   4. Dismissible — dismiss button fires onDismiss (after animation end), accessible label
 *   5. hideIcon suppresses the icon; description falls back to children
 *   6. Actions slot — renders in order after the description, keeps the dismiss button
 *   7. axe accessibility check on each variant, with and without actions
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Alert,
  type AlertVariant,
  type AlertSize,
} from "@atlas/ui-web/compositions/Alert/Alert"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const VARIANTS: AlertVariant[] = ["info", "success", "warning", "danger", "neutral"]
const SIZES: AlertSize[] = ["sm", "md", "lg"]

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("Alert — default render", () => {
  it("renders title and description", () => {
    render(<Alert title="Heads up" description="Details" />)
    expect(screen.getByText("Heads up")).toBeInTheDocument()
    expect(screen.getByText("Details")).toBeInTheDocument()
  })

  it("uses role=status by default (info)", () => {
    render(<Alert title="Info" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })
})

// ─── 2. Variant × Size matrix ───────────────────────────────────────────────

describe("Alert — variant × size matrix", () => {
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      it(`renders variant="${variant}" size="${size}"`, () => {
        render(<Alert variant={variant} size={size} title={`${variant}-${size}`} />)
        expect(screen.getByText(`${variant}-${size}`)).toBeInTheDocument()
      })
    }
  }
})

// ─── 3. role by severity ────────────────────────────────────────────────────

describe("Alert — role follows severity", () => {
  it("uses role=alert for warning", () => {
    render(<Alert variant="warning" title="Warning" />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("uses role=alert for danger", () => {
    render(<Alert variant="danger" title="Danger" />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("uses role=status for neutral", () => {
    render(<Alert variant="neutral" title="Neutral" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })
})

// ─── 4. Dismissible ──────────────────────────────────────────────────────────

describe("Alert — dismissible", () => {
  it("renders a dismiss button with an accessible label", () => {
    render(<Alert variant="info" dismissible title="Info" />)
    expect(screen.getByRole("button", { name: /dismiss info alert/i })).toBeInTheDocument()
  })

  it("does not render a dismiss button when dismissible is false", () => {
    render(<Alert title="Info" />)
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("fires onDismiss under reduced motion (immediate path)", () => {
    const matchMediaMock = vi.fn().mockReturnValue({ matches: true })
    const original = window.matchMedia
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia
    const onDismiss = vi.fn()
    render(<Alert dismissible onDismiss={onDismiss} title="Info" />)
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    window.matchMedia = original
  })

  it("starts the exit collapse from the alert's measured height, not a fixed cap", () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia
    const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(312)
    const onDismiss = vi.fn()
    render(<Alert dismissible onDismiss={onDismiss} title="Info" />)
    const root = screen.getByRole("status")
    expect(root.style.getPropertyValue("--_exit-h")).toBe("")
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }))
    expect(root.style.getPropertyValue("--_exit-h")).toBe("312px")
    expect(onDismiss).not.toHaveBeenCalled() // waits for the exit animation
    height.mockRestore()
    window.matchMedia = original
  })
})

// ─── 5. Icon and description fallback ───────────────────────────────────────

describe("Alert — icon and description", () => {
  it("hides the icon when hideIcon is set", () => {
    const { container } = render(<Alert hideIcon title="No icon" />)
    expect(container.querySelector("[aria-hidden='true']")).toBeNull()
  })

  it.each([
    ["info", "lucide-info"],
    ["success", "lucide-circle-check"],
    ["warning", "lucide-triangle-alert"],
    ["danger", "lucide-circle-x"],
    ["neutral", "lucide-info"],
  ] as const)("renders the Lucide icon for the %s intent", (variant, cls) => {
    const { container } = render(<Alert variant={variant} title="T" />)
    const svg = container.querySelector("svg")
    expect(svg).not.toBeNull()
    expect(svg).toHaveClass(cls)
    expect(svg?.closest("[aria-hidden='true']")).not.toBeNull()
  })

  it("renders the dismiss control as a Lucide X icon, not a text glyph", () => {
    render(<Alert title="T" dismissible />)
    const btn = screen.getByRole("button", { name: /dismiss/i })
    expect(btn.querySelector("svg.lucide-x")).not.toBeNull()
    expect(btn.textContent).toBe("")
  })

  it("renders a custom icon instead of the default", () => {
    const { container } = render(<Alert title="T" icon={<span data-testid="custom">★</span>} />)
    expect(screen.getByTestId("custom")).toBeInTheDocument()
    expect(container.querySelector("svg")).toBeNull()
  })

  it("falls back to children when description is not provided", () => {
    render(<Alert title="Title">Child description</Alert>)
    expect(screen.getByText("Child description")).toBeInTheDocument()
  })
})

// ─── 6. Actions slot ────────────────────────────────────────────────────────

describe("Alert — actions", () => {
  it("renders the actions inside the alert", () => {
    render(<Alert variant="danger" title="Failed" description="Try again." actions={<button>Retry</button>} />)
    expect(screen.getByRole("alert")).toContainElement(screen.getByRole("button", { name: "Retry" }))
  })

  it("places the actions after the description", () => {
    render(<Alert title="Failed" description="Try again." actions={<button>Retry</button>} />)
    const description = screen.getByText("Try again.")
    const action = screen.getByRole("button", { name: "Retry" })
    expect(description.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("lets an action handle its own click", () => {
    const onRetry = vi.fn()
    render(<Alert title="Failed" actions={<button onClick={onRetry}>Retry</button>} />)
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it("renders several actions in order", () => {
    render(
      <Alert title="Failed" actions={<><button>Retry</button><button>Cancel</button></>} />
    )
    const names = screen.getAllByRole("button").map((b) => b.textContent)
    expect(names).toEqual(["Retry", "Cancel"])
  })

  it("renders no buttons when actions is omitted", () => {
    render(<Alert title="Saved" description="All changes saved." />)
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("keeps the dismiss button next to the actions", () => {
    render(<Alert dismissible title="Failed" actions={<button>Retry</button>} />)
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument()
  })
})

// ─── 7. axe accessibility ───────────────────────────────────────────────────

describe("Alert — a11y (axe)", () => {
  for (const variant of VARIANTS) {
    it(`passes axe for variant="${variant}"`, async () => {
      const { container } = render(
        <Alert variant={variant} title={variant} description="Supporting text" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it(`passes axe for variant="${variant}" with actions`, async () => {
      const { container } = render(
        <Alert
          variant={variant}
          title={variant}
          description="Supporting text"
          actions={<><button>Retry</button><button>Cancel</button></>}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
