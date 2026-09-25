/**
 * Atlas Avatar — test suite
 *
 * Coverage:
 *   1. Content fallback — image → initials → icon; failed image falls back
 *   2. Shape × size matrix
 *   3. Accessible name — informative alt, decorative alt="", status label
 *   4. Status dot and badge icon slots
 *   5. AvatarGroup — role, context inheritance, add button (click + focus)
 *   6. axe accessibility check per shape and content type
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Avatar,
  AvatarGroup,
  type AvatarShape,
  type AvatarSize,
} from "@atlas/ui-web/primitives/Avatar/Avatar"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const SHAPES: AvatarShape[] = ["circle", "squircle"]
const SIZES: AvatarSize[] = ["xs", "sm", "md", "lg", "xl"]

// ─── 1. Content fallback ───────────────────────────────────────────────────

describe("Avatar — content fallback", () => {
  it("renders the image when src is given", () => {
    const { container } = render(<Avatar alt="Jane Cooper" src="/jane.jpg" initials="JC" />)
    expect(container.querySelector("img")).toHaveAttribute("src", "/jane.jpg")
    expect(screen.queryByText("JC")).not.toBeInTheDocument()
  })

  it("falls back to initials when there is no src", () => {
    render(<Avatar alt="Jane Cooper" initials="JC" />)
    expect(screen.getByText("JC")).toBeInTheDocument()
  })

  it("falls back to the person icon when there is no src or initials", () => {
    const { container } = render(<Avatar alt="Jane Cooper" />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("falls back to initials when the image fails to load", () => {
    const { container } = render(<Avatar alt="Jane Cooper" src="/broken.jpg" initials="JC" />)
    fireEvent.error(container.querySelector("img")!)
    expect(container.querySelector("img")).not.toBeInTheDocument()
    expect(screen.getByText("JC")).toBeInTheDocument()
  })

  it("falls back to the icon when the image fails and there are no initials", () => {
    const { container } = render(<Avatar alt="Jane Cooper" src="/broken.jpg" />)
    fireEvent.error(container.querySelector("img")!)
    expect(container.querySelector("img")).not.toBeInTheDocument()
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("tries the image again when src changes after a failure", () => {
    const { container, rerender } = render(<Avatar alt="Jane Cooper" src="/broken.jpg" initials="JC" />)
    fireEvent.error(container.querySelector("img")!)
    rerender(<Avatar alt="Jane Cooper" src="/fixed.jpg" initials="JC" />)
    expect(container.querySelector("img")).toHaveAttribute("src", "/fixed.jpg")
  })

  it("falls back when the image already failed before hydration (no error event)", () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true)
    const naturalWidth = vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(0)
    const { container } = render(<Avatar alt="Jane Cooper" src="/broken.jpg" initials="JC" />)
    expect(container.querySelector("img")).not.toBeInTheDocument()
    expect(screen.getByText("JC")).toBeInTheDocument()
    complete.mockRestore()
    naturalWidth.mockRestore()
  })

  it("renders a custom icon in place of the default", () => {
    render(<Avatar alt="Team" icon={<svg data-testid="custom-icon" />} />)
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument()
  })
})

// ─── 2. Shape × size matrix ────────────────────────────────────────────────

describe("Avatar — shape × size matrix", () => {
  for (const shape of SHAPES) {
    for (const size of SIZES) {
      it(`renders shape="${shape}" size="${size}"`, () => {
        render(<Avatar alt={`${shape} ${size}`} initials="JC" shape={shape} size={size} />)
        const el = screen.getByRole("img", { name: `${shape} ${size}` })
        expect(el).toHaveAttribute("data-shape", shape)
        expect(el).toHaveAttribute("data-size", size)
      })
    }
  }

  it("defaults to circle / md", () => {
    render(<Avatar alt="Jane Cooper" initials="JC" />)
    const el = screen.getByRole("img", { name: "Jane Cooper" })
    expect(el).toHaveAttribute("data-shape", "circle")
    expect(el).toHaveAttribute("data-size", "md")
  })
})

// ─── 3. Accessible name ────────────────────────────────────────────────────

describe("Avatar — accessible name", () => {
  it("informative avatar: exposes alt as role=img name", () => {
    render(<Avatar alt="Jane Cooper" initials="JC" />)
    expect(screen.getByRole("img", { name: "Jane Cooper" })).toBeInTheDocument()
  })

  it('decorative avatar (alt=""): hidden from assistive tech', () => {
    const { container } = render(<Avatar alt="" initials="JC" />)
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
  })

  it("image never carries its own alt (the root owns the name)", () => {
    const { container } = render(<Avatar alt="Jane Cooper" src="/jane.jpg" />)
    expect(container.querySelector("img")).toHaveAttribute("alt", "")
  })

  it("appends statusLabel to the accessible name so status is not colour-only", () => {
    render(<Avatar alt="Jane Cooper" initials="JC" showStatus statusLabel="Online" />)
    expect(screen.getByRole("img", { name: "Jane Cooper, Online" })).toBeInTheDocument()
  })

  it("warns in development when alt is missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(<Avatar initials="JC" />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[Atlas Avatar]"))
    warn.mockRestore()
  })

  it("warns in development when showStatus has no statusLabel", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(<Avatar alt="Jane Cooper" initials="JC" showStatus />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("statusLabel"))
    warn.mockRestore()
  })
})

// ─── 4. Status dot and badge icon ──────────────────────────────────────────

describe("Avatar — badge slot", () => {
  it("renders nothing extra by default", () => {
    const { container } = render(<Avatar alt="Jane Cooper" initials="JC" />)
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBe(1) // initials only
  })

  it("shows the status dot", () => {
    const { container } = render(<Avatar alt="Jane Cooper" initials="JC" showStatus statusLabel="Online" />)
    expect(container.querySelectorAll("span[aria-hidden='true']").length).toBeGreaterThan(1)
  })

  it("shows a custom status indicator in place of the dot", () => {
    render(
      <Avatar
        alt="Jane Cooper"
        initials="JC"
        showStatus
        statusLabel="Away"
        statusIndicator={<span data-testid="custom-status" />}
      />
    )
    expect(screen.getByTestId("custom-status")).toBeInTheDocument()
  })

  it("shows the badge icon with the default plus glyph", () => {
    const { container } = render(<Avatar alt="Jane Cooper" initials="JC" showBadgeIcon />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("shows a custom badge icon", () => {
    render(<Avatar alt="Jane Cooper" initials="JC" showBadgeIcon badgeIcon={<svg data-testid="custom-badge" />} />)
    expect(screen.getByTestId("custom-badge")).toBeInTheDocument()
  })
})

// ─── 5. AvatarGroup ────────────────────────────────────────────────────────

describe("AvatarGroup", () => {
  it("renders role=group with its accessible name", () => {
    render(
      <AvatarGroup aria-label="Project members">
        <Avatar alt="Jane Cooper" initials="JC" />
        <Avatar alt="Dev Patel" initials="DP" />
      </AvatarGroup>
    )
    expect(screen.getByRole("group", { name: "Project members" })).toBeInTheDocument()
    expect(screen.getAllByRole("img")).toHaveLength(2)
  })

  it("children inherit size and shape from the group", () => {
    render(
      <AvatarGroup aria-label="Project members" size="lg" shape="squircle">
        <Avatar alt="Jane Cooper" initials="JC" />
      </AvatarGroup>
    )
    const el = screen.getByRole("img", { name: "Jane Cooper" })
    expect(el).toHaveAttribute("data-size", "lg")
    expect(el).toHaveAttribute("data-shape", "squircle")
  })

  it("a child's own size overrides the group", () => {
    render(
      <AvatarGroup aria-label="Project members" size="lg">
        <Avatar alt="Jane Cooper" initials="JC" size="xs" />
      </AvatarGroup>
    )
    expect(screen.getByRole("img", { name: "Jane Cooper" })).toHaveAttribute("data-size", "xs")
  })

  it("does not render the add button by default", () => {
    render(
      <AvatarGroup aria-label="Project members">
        <Avatar alt="Jane Cooper" initials="JC" />
      </AvatarGroup>
    )
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("showAdd renders a labelled button that fires onAdd on click", () => {
    const onAdd = vi.fn()
    render(
      <AvatarGroup aria-label="Project members" showAdd onAdd={onAdd} addLabel="Invite member">
        <Avatar alt="Jane Cooper" initials="JC" />
      </AvatarGroup>
    )
    fireEvent.click(screen.getByRole("button", { name: "Invite member" }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it("add button is a native focusable button (Enter/Space activation is native)", () => {
    render(
      <AvatarGroup aria-label="Project members" showAdd onAdd={() => {}}>
        <Avatar alt="Jane Cooper" initials="JC" />
      </AvatarGroup>
    )
    const button = screen.getByRole("button", { name: "Add member" })
    expect(button.tagName).toBe("BUTTON")
    expect(button).toHaveAttribute("type", "button")
    button.focus()
    expect(button).toHaveFocus()
  })

  it("warns in development when the group has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <AvatarGroup>
        <Avatar alt="Jane Cooper" initials="JC" />
      </AvatarGroup>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[Atlas AvatarGroup]"))
    warn.mockRestore()
  })
})

// ─── 6. axe ────────────────────────────────────────────────────────────────

describe("Avatar — axe", () => {
  for (const shape of SHAPES) {
    it(`has no axe violations: shape="${shape}", image`, async () => {
      const { container } = render(<Avatar alt="Jane Cooper" src="/jane.jpg" shape={shape} />)
      expect(await axe(container)).toHaveNoViolations()
    })

    it(`has no axe violations: shape="${shape}", initials with status and badge icon`, async () => {
      const { container } = render(
        <Avatar alt="Jane Cooper" initials="JC" shape={shape} showStatus statusLabel="Online" showBadgeIcon />
      )
      expect(await axe(container)).toHaveNoViolations()
    })

    it(`has no axe violations: shape="${shape}", icon, decorative`, async () => {
      const { container } = render(<Avatar alt="" shape={shape} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  }

  it("has no axe violations: group with add button", async () => {
    const { container } = render(
      <AvatarGroup aria-label="Project members" showAdd onAdd={() => {}}>
        <Avatar alt="Jane Cooper" initials="JC" />
        <Avatar alt="Dev Patel" initials="DP" />
      </AvatarGroup>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
