/**
 * Atlas ListItem — test suite
 *
 * Coverage:
 *   1. Defaults — horizontal, default, md; renders every slot
 *   2. Direction × variant × size matrix — data attributes
 *   3. Slots — each part is optional and hides by omission
 *   4. Media — type attribute, decorative aria-hidden, Avatar passthrough
 *   5. Polymorphism — as="li" inside a list
 *   6. Passthrough — className and HTML attributes
 *   7. axe accessibility check per direction, variant and size
 *
 * Pattern: packages/ui-web/tests/Button.test.tsx
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemActions,
  type ListItemDirection,
  type ListItemVariant,
  type ListItemSize,
  type ListItemMediaType,
} from "@atlas/ui-web/compositions/ListItem/ListItem"
import { Avatar } from "@atlas/ui-web/primitives/Avatar/Avatar"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

const DIRECTIONS: ListItemDirection[] = ["horizontal", "vertical"]
const VARIANTS: ListItemVariant[]     = ["default", "outline", "muted"]
const SIZES: ListItemSize[]           = ["sm", "md"]
const MEDIA_TYPES: ListItemMediaType[] = ["icon", "tile", "image"]

const Glyph = () => <svg data-testid="glyph" viewBox="0 0 16 16" />

function full(props: React.ComponentProps<typeof ListItem> = {}) {
  return (
    <ListItem {...props}>
      <ListItemMedia type="tile"><Glyph /></ListItemMedia>
      <ListItemContent>
        <ListItemTitle>Item Title</ListItemTitle>
        <ListItemDescription>This is the item description text</ListItemDescription>
      </ListItemContent>
      <ListItemActions>
        <Button variant="outline" size="sm">Action</Button>
      </ListItemActions>
    </ListItem>
  )
}

describe("ListItem — defaults", () => {
  it("renders a horizontal, default, md div with every slot", () => {
    const { container } = render(full())
    const el = container.firstElementChild!
    expect(el.tagName).toBe("DIV")
    expect(el).toHaveAttribute("data-direction", "horizontal")
    expect(el).toHaveAttribute("data-variant", "default")
    expect(el).toHaveAttribute("data-size", "md")
    expect(screen.getByText("Item Title")).toBeInTheDocument()
    expect(screen.getByText("This is the item description text")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument()
  })
})

describe("ListItem — direction × variant × size", () => {
  for (const direction of DIRECTIONS) for (const variant of VARIANTS) for (const size of SIZES) {
    it(`${direction} / ${variant} / ${size}`, () => {
      const { container } = render(full({ direction, variant, size }))
      const el = container.firstElementChild!
      expect(el).toHaveAttribute("data-direction", direction)
      expect(el).toHaveAttribute("data-variant", variant)
      expect(el).toHaveAttribute("data-size", size)
    })
  }
})

describe("ListItem — slots", () => {
  it("hides media, description and actions by omission", () => {
    render(
      <ListItem>
        <ListItemContent>
          <ListItemTitle>Only a title</ListItemTitle>
        </ListItemContent>
      </ListItem>
    )
    expect(screen.getByText("Only a title")).toBeInTheDocument()
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.queryByTestId("glyph")).toBeNull()
  })

  it("renders a description-only content slot", () => {
    render(
      <ListItem>
        <ListItemContent>
          <ListItemDescription>Just a description</ListItemDescription>
        </ListItemContent>
      </ListItem>
    )
    expect(screen.getByText("Just a description")).toBeInTheDocument()
  })
})

describe("ListItem — media", () => {
  for (const type of MEDIA_TYPES) {
    it(`sets data-type="${type}"`, () => {
      render(<ListItem><ListItemMedia type={type} data-testid="media"><Glyph /></ListItemMedia></ListItem>)
      expect(screen.getByTestId("media")).toHaveAttribute("data-type", type)
    })
  }

  it("is decorative by default and can opt out", () => {
    render(
      <ListItem>
        <ListItemMedia type="image" data-testid="a"><img src="/a.jpg" alt="" /></ListItemMedia>
        <ListItemMedia type="image" data-testid="b" decorative={false}><img src="/b.jpg" alt="Cover" /></ListItemMedia>
      </ListItem>
    )
    expect(screen.getByTestId("a")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByTestId("b")).not.toHaveAttribute("aria-hidden")
    expect(screen.getByAltText("Cover")).toBeInTheDocument()
  })

  it("is a plain slot without a type (Avatar passthrough)", () => {
    render(
      <ListItem>
        <ListItemMedia data-testid="media"><Avatar alt="Jane Cooper" initials="JC" /></ListItemMedia>
      </ListItem>
    )
    expect(screen.getByTestId("media")).not.toHaveAttribute("data-type")
  })
})

describe("ListItem — polymorphism", () => {
  it("renders an li inside a list", () => {
    render(<ul><ListItem as="li"><ListItemContent><ListItemTitle>Row</ListItemTitle></ListItemContent></ListItem></ul>)
    expect(screen.getByRole("listitem")).toBeInTheDocument()
  })
})

describe("ListItem — passthrough", () => {
  it("forwards className and HTML attributes", () => {
    const { container } = render(full({ className: "extra", id: "row-1" }))
    const el = container.firstElementChild!
    expect(el.className).toContain("extra")
    expect(el).toHaveAttribute("id", "row-1")
  })
})

describe("ListItem — accessibility (axe)", () => {
  for (const direction of DIRECTIONS) for (const variant of VARIANTS) for (const size of SIZES) {
    it(`${direction} / ${variant} / ${size} has no violations`, async () => {
      const { container } = render(full({ direction, variant, size }))
      expect(await axe(container)).toHaveNoViolations()
    })
  }

  it("a list of items has no violations", async () => {
    const { container } = render(
      <ul>
        <ListItem as="li" variant="outline">
          <ListItemMedia><Avatar alt="" initials="JC" /></ListItemMedia>
          <ListItemContent><ListItemTitle>Jane Cooper</ListItemTitle></ListItemContent>
        </ListItem>
      </ul>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
