/**
 * Atlas Alert — test suite
 *
 * Coverage:
 *   1. Renders default (info, md) without crashing, role="status"
 *   2. Variant × Size matrix — all 15 combinations render
 *   3. role switches to "alert" for warning/danger, stays "status" otherwise
 *   4. Dismissible — dismiss button fires onDismiss (after animation end), accessible label
 *   5. hideIcon suppresses the icon; description falls back to children
 *   6. axe accessibility check on each variant
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
})

// ─── 5. Icon and description fallback ───────────────────────────────────────

describe("Alert — icon and description", () => {
  it("hides the icon when hideIcon is set", () => {
    const { container } = render(<Alert hideIcon title="No icon" />)
    expect(container.querySelector("[aria-hidden='true']")).toBeNull()
  })

  it("falls back to children when description is not provided", () => {
    render(<Alert title="Title">Child description</Alert>)
    expect(screen.getByText("Child description")).toBeInTheDocument()
  })
})

// ─── 6. axe accessibility ───────────────────────────────────────────────────

describe("Alert — a11y (axe)", () => {
  for (const variant of VARIANTS) {
    it(`passes axe for variant="${variant}"`, async () => {
      const { container } = render(
        <Alert variant={variant} title={variant} description="Supporting text" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
