"use client"

/**
 * Atlas Stepper — numbered markers joined by connectors, showing where someone is in a multi-step flow
 *
 * Figma:       Stepper (Orientation × Viewport × Steps × Current) built from Step (Orientation × Status × Viewport)
 *              and Step Marker (Status × Viewport)
 * Orientation: horizontal (default) | vertical
 * Viewport:    no prop. CSS follows the screen width. Horizontal on mobile (< 640px) is a compact summary instead
 *              of the marker row: a ring filled to the current step with "N of M" inside, the current label
 *              and a muted "Next: ..." line (none on the last step). Tablet (640px up) shows the markers at
 *              spacing-8 and desktop (1024px up) at spacing-10. Vertical keeps the markers at every width.
 * Status:      complete | current | upcoming — derived from `current`, never passed in
 * Steps:       a value (`steps`), any count from 2; Figma draws 3 to 5
 *
 * Anatomy:     <ol> of <li> steps: marker (number, or a check when complete) · label · optional description
 *              · connector to the next step (not on the last). Horizontal also renders the mobile summary
 *              (aria-hidden) next to the list.
 *
 * Display only: it shows progress through a flow the page controls with Back and Continue. The markers are
 * not buttons, so there is no hover, focus or press state.
 *
 * `current` is 1-based, like "Step 2 of 4". A value above the step count marks every step complete; 0 or
 * less leaves every step upcoming.
 *
 * Accessibility:
 *   - An <ol> named by aria-label (or aria-labelledby); the current step carries aria-current="step"
 *   - Each status is also written for assistive technology ("completed", "current step", "upcoming"),
 *     so it never relies on colour or the check alone
 *   - The marker is aria-hidden; the label and description carry the content
 *   - The mobile summary is aria-hidden and repeats what the list already says; below 640px the list is
 *     visually hidden (clipped, not display: none) so every step name and status is still read out once
 *   - Logical properties, so the row and the connectors flip in RTL; no motion
 */

import React from "react"
import { Check } from "lucide-react"
import styles from "./Stepper.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type StepperOrientation = "horizontal" | "vertical"
export type StepperStatus = "complete" | "current" | "upcoming"

export interface StepperStep {
  /** Short name of the step, one or two words */
  label: React.ReactNode
  /** Optional supporting line under the label */
  description?: React.ReactNode
}

export interface StepperProps extends Omit<React.ComponentProps<"ol">, "children"> {
  /** The steps, in order */
  steps: StepperStep[]
  /** The current step, 1-based. Above the step count marks every step complete. */
  current: number
  orientation?: StepperOrientation
}

/* ── Helpers ────────────────────────────────────────────────── */

const STATUS_TEXT: Record<StepperStatus, string> = {
  complete: "completed",
  current: "current step",
  upcoming: "upcoming",
}

/** Status of the step at 1-based `position` while `current` is the current step */
export function getStepStatus(position: number, current: number): StepperStatus {
  if (position < current) return "complete"
  if (position === current) return "current"
  return "upcoming"
}

/* ── Component ──────────────────────────────────────────────── */

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  className,
  ...rest
}: StepperProps) {
  if (process.env.NODE_ENV !== "production") {
    if (!rest["aria-label"] && !rest["aria-labelledby"]) {
      console.warn("Stepper needs a name: pass aria-label or aria-labelledby.")
    }
  }

  const count = steps.length
  const position = Math.min(Math.max(current, 1), Math.max(count, 1))
  const here = steps[position - 1]
  const next = steps[position]

  const list = (
    <ol
      {...rest}
      className={[styles.root, styles[orientation], className].filter(Boolean).join(" ")}
      data-orientation={orientation}
    >
      {steps.map((step, index) => {
        const position = index + 1
        const status = getStepStatus(position, current)
        const last = position === steps.length
        return (
          <li
            key={index}
            className={styles.step}
            data-status={status}
            data-last={last ? "" : undefined}
            aria-current={status === "current" ? "step" : undefined}
          >
            <span className={styles.rail}>
              <span className={styles.marker} aria-hidden="true">
                {status === "complete" ? <Check className={styles.check} /> : position}
              </span>
              {orientation === "vertical" && !last && <span className={styles.connector} aria-hidden="true" />}
            </span>
            <span className={styles.text}>
              <span className={styles.label}>
                {step.label}
                <span className={styles.status}>, {STATUS_TEXT[status]}</span>
              </span>
              {step.description != null && <span className={styles.description}>{step.description}</span>}
            </span>
            {orientation === "horizontal" && !last && <span className={styles.connector} aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )

  if (orientation === "vertical" || !here) return list

  return (
    <>
      <div className={styles.summary} aria-hidden="true">
        <span className={styles.ring} style={{ "--stepper-progress": (position / count) * 100 } as React.CSSProperties}>
          <span className={styles.arc} />
          <span className={styles.count}>
            {position} of {count}
          </span>
        </span>
        <span className={styles.summaryText}>
          <span className={styles.summaryLabel}>{here.label}</span>
          {next && <span className={styles.summaryNext}>Next: {next.label}</span>}
        </span>
      </div>
      {list}
    </>
  )
}
