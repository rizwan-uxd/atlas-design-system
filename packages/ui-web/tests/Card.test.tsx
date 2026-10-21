/**
 * Atlas Card — test suite
 *
 * Coverage:
 *   1. Renders default (md, default variant) as an <article> with its parts
 *   2. Variant × Size matrix — all 12 combinations render
 *   3. Interactive — native button named by its title, click handler, no handler when disabled
 *   4. Selected — aria-pressed on an interactive card only
 *   5. Disabled — aria-disabled, removed from the tab order, click ignored
 *   6. CardTitle level, and the title id that names an interactive card
 *   7. CardHeader leading and action slots; CardContent and CardFooter
 *   8. axe accessibility check on each variant, and on an interactive card
 *   9. Accessible name of an interactive card without a CardTitle: aria-label, or a dev warning
 *  10. Selected styling uses the card-selected tokens on every variant (Figma State = selected)
 */

import React from "react"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { axe } from "jest-axe"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardVariant,
  type CardSize,
} from "@atlas/ui-web/compositions/Card/Card"

// ─── Fixtures ──────────────────────────────────────────────────────────────

const VARIANTS: CardVariant[] = ["default", "elevated", "outlined", "filled"]
const SIZES: CardSize[] = ["sm", "md", "lg"]

function Basic(props: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Supporting copy</CardDescription>
      </CardHeader>
      <CardContent>Card content</CardContent>
      <CardFooter>
        <button>Action</button>
      </CardFooter>
    </Card>
  )
}

// ─── 1. Default render ─────────────────────────────────────────────────────

describe("Card — default render", () => {
  it("renders an article with title, description, content and footer", () => {
    render(<Basic />)
    expect(screen.getByRole("article")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Card title" })).toBeInTheDocument()
    expect(screen.getByText("Supporting copy")).toBeInTheDocument()
    expect(screen.getByText("Card content")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument()
  })

  it("is not a button unless interactive", () => {
    render(<Basic />)
    expect(screen.queryByRole("button", { name: "Card title" })).toBeNull()
  })

  it("ignores onClick when it is not interactive", () => {
    const onClick = vi.fn()
    render(<Basic onClick={onClick} />)
    fireEvent.click(screen.getByRole("article"))
    expect(onClick).not.toHaveBeenCalled()
  })
})

// ─── 2. Variant × Size matrix ──────────────────────────────────────────────

describe("Card — variant × size matrix", () => {
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      it(`renders variant="${variant}" size="${size}"`, () => {
        render(<Basic variant={variant} size={size} />)
        expect(screen.getByRole("article")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Card title" })).toBeInTheDocument()
      })
    }
  }
})

// ─── 3. Interactive ────────────────────────────────────────────────────────

describe("Card — interactive", () => {
  it("renders a native button named by its title", () => {
    render(<Basic interactive />)
    const card = screen.getByRole("button", { name: "Card title" })
    expect(card.tagName).toBe("BUTTON")
    expect(card).toHaveAttribute("type", "button")
  })

  it("calls onClick when clicked", () => {
    const onClick = vi.fn()
    render(<Basic interactive onClick={onClick} />)
    fireEvent.click(screen.getByRole("button", { name: "Card title" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

// ─── 4. Selected ───────────────────────────────────────────────────────────

describe("Card — selected", () => {
  it("sets aria-pressed on a selected interactive card", () => {
    render(<Basic interactive selected />)
    expect(screen.getByRole("button", { name: "Card title" })).toHaveAttribute("aria-pressed", "true")
  })

  it("has no aria-pressed when not selected", () => {
    render(<Basic interactive />)
    expect(screen.getByRole("button", { name: "Card title" })).not.toHaveAttribute("aria-pressed")
  })
})

// ─── 5. Disabled ───────────────────────────────────────────────────────────

describe("Card — disabled", () => {
  it("marks an interactive card aria-disabled, out of the tab order, and ignores clicks", () => {
    const onClick = vi.fn()
    render(<Basic interactive disabled onClick={onClick} />)
    const card = screen.getByRole("button", { name: "Card title" })
    expect(card).toHaveAttribute("aria-disabled", "true")
    expect(card).toHaveAttribute("tabindex", "-1")
    fireEvent.click(card)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("marks a non-interactive card with data-disabled", () => {
    render(<Basic disabled />)
    expect(screen.getByRole("article")).toHaveAttribute("data-disabled", "true")
  })
})

// ─── 6. Title ──────────────────────────────────────────────────────────────

describe("Card — title", () => {
  it("renders an h3 by default", () => {
    render(<Basic />)
    expect(screen.getByRole("heading", { level: 3, name: "Card title" })).toBeInTheDocument()
  })

  it("renders the requested heading level", () => {
    render(
      <Card>
        <CardHeader><CardTitle as="h2">Level two</CardTitle></CardHeader>
      </Card>
    )
    expect(screen.getByRole("heading", { level: 2, name: "Level two" })).toBeInTheDocument()
  })

  it("gives the interactive card its title as the accessible name via aria-labelledby", () => {
    render(<Basic interactive />)
    const card = screen.getByRole("button", { name: "Card title" })
    const titleId = screen.getByRole("heading", { name: "Card title" }).id
    expect(titleId).not.toBe("")
    expect(card).toHaveAttribute("aria-labelledby", titleId)
  })
})

// ─── 7. Header, content, footer ────────────────────────────────────────────

describe("Card — header slots", () => {
  it("renders leading (hidden from assistive tech) and action", () => {
    render(
      <Card>
        <CardHeader leading={<span data-testid="lead">i</span>} action={<button>More</button>}>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByTestId("lead").closest("[aria-hidden='true']")).not.toBeNull()
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument()
  })

  it("renders no leading or action wrapper when they are omitted", () => {
    const { container } = render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
      </Card>
    )
    expect(container.querySelector("[aria-hidden='true']")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })
})

describe("Card — content and footer", () => {
  it("renders content before the footer", () => {
    render(<Basic />)
    const content = screen.getByText("Card content")
    const action = screen.getByRole("button", { name: "Action" })
    expect(content.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it.each(["start", "between", "end"] as const)("renders a footer with justify=%s", (justify) => {
    render(
      <Card>
        <CardFooter justify={justify}><button>Go</button></CardFooter>
      </Card>
    )
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument()
  })
})

// ─── Hover and active styling (DISC-093) ───────────────────────────────────

describe("Card — interactive hover", () => {
  const css = readFileSync(join(__dirname, "../src/compositions/Card/Card.module.css"), "utf8")
  const rule = (sel: string) => css.match(new RegExp(`${sel.replace(/\./g, "\\.")}:hover\\s*\\{([^}]*)\\}`))?.[1] ?? ""

  for (const variant of ["default", "outlined"]) {
    it(`${variant} hover adds a shadow and keeps the fill; active has no rule`, () => {
      const body = rule(`.interactive.${variant}`)
      expect(body).toContain("box-shadow: var(--atlas-shadow-sm)")
      expect(body).not.toContain("background")
    })
  }
  it("has no :active rule on the interactive card (Figma draws active as default)", () => {
    expect(css).not.toMatch(/\.interactive[^{]*:active/)
  })
})

// ─── 9. Accessible name without a CardTitle ────────────────────────────────

describe("Card — name of an interactive card", () => {
  afterEach(() => vi.restoreAllMocks())

  it("uses aria-label and drops the title reference", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <Card interactive aria-label="Choose the Pro plan">
        <CardContent>Pro</CardContent>
      </Card>
    )
    const card = screen.getByRole("button", { name: "Choose the Pro plan" })
    expect(card).not.toHaveAttribute("aria-labelledby")
    expect(warn).not.toHaveBeenCalled()
  })

  it("warns in development when an interactive card has neither a CardTitle nor an aria-label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(<Card interactive><CardContent>Pro</CardContent></Card>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("needs a name"))
  })

  it("does not warn when the card has a CardTitle, or is not interactive", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(<Basic interactive />)
    render(<Card><CardContent>Static</CardContent></Card>)
    expect(warn).not.toHaveBeenCalled()
  })
})

// ─── 10. Selected styling (Figma State = selected) ─────────────────────────

describe("Card — selected styling", () => {
  const css = readFileSync(join(__dirname, "../src/compositions/Card/Card.module.css"), "utf8")

  for (const variant of VARIANTS) {
    it(`${variant} selected uses the selected border and background tokens`, () => {
      const rules = css.split("}").filter((r) => new RegExp(`\\.selected\\.${variant}\\b`).test(r)).join("}")
      expect(rules).toContain("var(--atlas-card-selected-border)")
      expect(rules).toContain("var(--atlas-card-selected-background)")
    })
  }
})

// ─── 8. axe accessibility ──────────────────────────────────────────────────

describe("Card — a11y (axe)", () => {
  for (const variant of VARIANTS) {
    it(`passes axe for variant="${variant}"`, async () => {
      const { container } = render(<Basic variant={variant} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  }

  it("passes axe for an interactive card", async () => {
    const { container } = render(
      <Card interactive>
        <CardHeader><CardTitle>Choose this plan</CardTitle></CardHeader>
      </Card>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
