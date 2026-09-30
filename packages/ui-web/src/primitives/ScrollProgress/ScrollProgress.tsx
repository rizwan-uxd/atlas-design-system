"use client"

/**
 * Atlas ScrollProgress — a thin bar that shows how far the reader has scrolled through the page or a container
 *
 * Figma:        Orientation (horizontal | vertical) × Scope (page | container) × Progress (0 | 50 | 100)
 *               Progress is a drawn level only — in code the fill follows scroll position continuously.
 * Orientations: horizontal | vertical — the shape of the bar
 * Scopes:       page | container
 *   page        fixed to the top edge (horizontal) or the inline-end edge (vertical) of the viewport; tracks the document
 *   container   placed by the caller inside a positioned wrapper; tracks the element passed as `target`
 * States:       rest (0) · scrolling (fill follows scroll) · complete (100). No hover, focus or disabled state.
 *
 * `axis` picks the scroll axis that is measured (default "vertical"), independent of the bar's orientation, so a
 * horizontal bar can track a vertical scroll (the usual reading indicator).
 *
 * Motion: the fill eases with --atlas-duration-fast and --atlas-easing-standard; reduced motion sets it directly.
 *
 * Accessibility:
 *   - Decorative by default (aria-hidden) — the scrollbar already exposes position.
 *   - With an `aria-label` it is a role="progressbar" with aria-valuemin, aria-valuemax and aria-valuenow, and the
 *     value changes in 5% steps so assistive tech is not flooded.
 *   - Fill grows from the inline-start edge, so it mirrors in RTL.
 */

import React from "react"
import styles from "./ScrollProgress.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type ScrollProgressOrientation = "horizontal" | "vertical"
export type ScrollProgressScope       = "page" | "container"
export type ScrollProgressAxis        = "vertical" | "horizontal"

export interface ScrollProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role"> {
  orientation?: ScrollProgressOrientation
  scope?:       ScrollProgressScope
  /** The scrollable element to track when `scope="container"`. Ignored for `scope="page"`. */
  target?:      React.RefObject<HTMLElement | null>
  /** Which scroll direction is measured. Defaults to "vertical". */
  axis?:        ScrollProgressAxis
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/** Scrolled fraction 0–1 of `el` along `axis`. An element that cannot scroll reads 0. */
function readProgress(el: Element, axis: ScrollProgressAxis): number {
  const total = axis === "vertical"
    ? el.scrollHeight - el.clientHeight
    : el.scrollWidth - el.clientWidth
  if (total <= 0) return 0
  const offset = Math.abs(axis === "vertical" ? el.scrollTop : el.scrollLeft)
  return Math.min(1, Math.max(0, offset / total))
}

function useScrollProgress(
  scope: ScrollProgressScope,
  axis: ScrollProgressAxis,
  target: React.RefObject<HTMLElement | null> | undefined,
): number {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const pageMode = scope === "page"
    const el: Element | null = pageMode
      ? (document.scrollingElement ?? document.documentElement)
      : (target?.current ?? null)
    if (!el) return

    const listenOn: EventTarget = pageMode ? window : el
    let frame = 0
    const update = () => {
      frame = 0
      setProgress(readProgress(el, axis))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    listenOn.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule)
    observer?.observe(el)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      listenOn.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      observer?.disconnect()
    }
  }, [scope, axis, target])

  return progress
}

/* ── ScrollProgress ─────────────────────────────────────────────── */

export function ScrollProgress({
  orientation = "horizontal",
  scope       = "page",
  target,
  axis        = "vertical",
  className,
  style,
  ...rest
}: ScrollProgressProps) {
  const progress = useScrollProgress(scope, axis, target)

  if (process.env.NODE_ENV !== "production" && scope === "container" && !target) {
    console.warn('[Atlas ScrollProgress] scope="container" needs a `target` ref to the scrollable element.')
  }

  const labelled = Boolean(rest["aria-label"] || rest["aria-labelledby"])
  const aria = labelled
    ? {
        role: "progressbar" as const,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": Math.round(progress * 20) * 5,
      }
    : { "aria-hidden": true as const }

  return (
    <div
      {...rest}
      {...aria}
      className={cx(styles.track, className)}
      data-orientation={orientation}
      data-scope={scope}
      style={{ ...style, ["--scroll" as string]: progress }}
    >
      <div className={styles.fill} />
    </div>
  )
}
