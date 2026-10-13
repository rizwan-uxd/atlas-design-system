"use client"

/**
 * Atlas Pagination — page navigation for a long list or table
 *
 * Figma:      Pagination (Size × Position)
 * Sizes:      sm | md
 * Position:   start | middle | end — drawn from the current page in Figma, derived from
 *             `page` and `pageCount` here (not a prop)
 * States:     default · hover · focus-visible · active · disabled (from Button; the ends
 *             disable Previous and Next)
 *
 * Anatomy:    <nav aria-label="Pagination"> <ul>
 *               Previous · page Buttons · ellipsis markers · Next
 *             The current page is the outline Button; the others are ghost Buttons.
 *
 * Slots:      at most `siblingCount * 2 + 5` — the first and last page, the current page,
 *             its neighbours and up to two ellipses. A shorter list shows every page.
 *
 * Accessibility:
 *   - <nav> landmark with a list; the current page has aria-current="page"
 *   - Page buttons are named "Page N"; Previous and Next are named "Previous page" and
 *     "Next page" even when their text is hidden on a phone
 *   - Ellipses are decorative (aria-hidden) with a screen-reader "More pages" hint
 *   - The chevrons mirror in right-to-left layouts
 *   - Moving focus to the top of the list after a page change is the caller's job
 */

import React from "react"
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import styles from "./Pagination.module.css"

/* ── Types ──────────────────────────────────────────────── */

export type PaginationSize = "sm" | "md"

export interface PaginationProps extends Omit<React.ComponentProps<"nav">, "children" | "onChange"> {
  /** The current page, starting at 1. */
  page: number
  /** The total number of pages. */
  pageCount: number
  /** Called with the new page when the user picks a different one. */
  onPageChange: (page: number) => void
  /** Pages shown on each side of the current page. */
  siblingCount?: number
  size?: PaginationSize
  /** Disables every control. */
  disabled?: boolean
}

type Slot = number | "start-ellipsis" | "end-ellipsis"

/* ── Helpers ────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i)
}

/** The page numbers and ellipses to draw, in order. Never more than `siblingCount * 2 + 5` slots. */
export function getPaginationSlots(page: number, pageCount: number, siblingCount = 1): Slot[] {
  const sib = Math.max(0, Math.floor(siblingCount))
  const totalSlots = sib * 2 + 5
  if (pageCount <= totalSlots) return range(1, pageCount)

  const left = Math.max(page - sib, 1)
  const right = Math.min(page + sib, pageCount)
  const showStartEllipsis = left > 3
  const showEndEllipsis = right < pageCount - 2
  const edge = 3 + sib * 2

  if (!showStartEllipsis && showEndEllipsis) return [...range(1, edge), "end-ellipsis", pageCount]
  if (showStartEllipsis && !showEndEllipsis) return [1, "start-ellipsis", ...range(pageCount - edge + 1, pageCount)]
  return [1, "start-ellipsis", ...range(left, right), "end-ellipsis", pageCount]
}

/* ── Component ──────────────────────────────────────────── */

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  size = "md",
  disabled = false,
  className,
  "aria-label": ariaLabel = "Pagination",
  ...rest
}: PaginationProps) {
  const total = Math.max(1, Math.floor(pageCount))
  const current = Math.min(Math.max(1, Math.floor(page)), total)
  const slots = getPaginationSlots(current, total, siblingCount)

  const go = (next: number) => {
    if (disabled || next === current || next < 1 || next > total) return
    onPageChange(next)
  }

  return (
    <nav aria-label={ariaLabel} className={cx(styles.root, className)} data-size={size} {...rest}>
      <ul className={styles.list}>
        <li className={styles.item}>
          <Button
            variant="ghost"
            size={size}
            className={styles.step}
            disabled={disabled || current === 1}
            aria-label="Previous page"
            leadingIcon={<ChevronLeft className={styles.chevron} aria-hidden="true" />}
            onClick={() => go(current - 1)}
          >
            <span className={styles.label}>Previous</span>
          </Button>
        </li>

        {slots.map((slot) =>
          typeof slot === "number" ? (
            <li key={slot} className={styles.item}>
              <Button
                variant={slot === current ? "outline" : "ghost"}
                size={size}
                className={styles.page}
                disabled={disabled}
                aria-label={`Page ${slot}`}
                aria-current={slot === current ? "page" : undefined}
                onClick={() => go(slot)}
              >
                {slot}
              </Button>
            </li>
          ) : (
            <li key={slot} className={styles.item}>
              <span className={styles.ellipsis} data-size={size}>
                <Ellipsis className={styles.ellipsisIcon} aria-hidden="true" />
                <span className={styles.srOnly}>More pages</span>
              </span>
            </li>
          ),
        )}

        <li className={styles.item}>
          <Button
            variant="ghost"
            size={size}
            className={styles.step}
            disabled={disabled || current === total}
            aria-label="Next page"
            trailingIcon={<ChevronRight className={styles.chevron} aria-hidden="true" />}
            onClick={() => go(current + 1)}
          >
            <span className={styles.label}>Next</span>
          </Button>
        </li>
      </ul>
    </nav>
  )
}
