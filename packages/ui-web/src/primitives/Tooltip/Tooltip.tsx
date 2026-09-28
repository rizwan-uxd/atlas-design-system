"use client"

/**
 * Atlas Tooltip — a short, non-interactive label shown on hover or keyboard focus.
 *
 * Variants:      none (Figma models a single style)
 * Sides:         top | bottom | start | end — the side of the trigger the tooltip appears on;
 *                start/end are logical and flip in RTL. Radix flips it on viewport collision.
 * States:        closed · open (delayed/instant) — opens on hover and focus, closes on
 *                blur, pointer leave, Escape and scroll.
 * Accessibility: Radix wires `role="tooltip"` and `aria-describedby` on the trigger.
 *                Attach it to a focusable element so keyboard users can reach it; a
 *                disabled control needs a focusable wrapper. Never put interactive
 *                content inside.
 */

import React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import styles from "./Tooltip.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type TooltipSide = "top" | "bottom" | "start" | "end"

export type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider>

export type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root>

export type TooltipTriggerProps = React.ComponentProps<typeof TooltipPrimitive.Trigger>

export interface TooltipContentProps
  extends Omit<React.ComponentProps<typeof TooltipPrimitive.Content>, "side"> {
  /** Side of the trigger the tooltip appears on. Defaults to `top`. */
  side?: TooltipSide
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

function isRtl(): boolean {
  return typeof document !== "undefined" && getComputedStyle(document.documentElement).direction === "rtl"
}

function toPhysicalSide(side: TooltipSide): "top" | "bottom" | "left" | "right" {
  if (side === "start") return isRtl() ? "right" : "left"
  if (side === "end") return isRtl() ? "left" : "right"
  return side
}

/* ── TooltipProvider ────────────────────────────────────────────── */

/** Wrap the app (or a region) once; sets the hover delay shared by every tooltip inside. */
export function TooltipProvider({ delayDuration = 300, ...rest }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...rest} />
}

/* ── Tooltip (root) ─────────────────────────────────────────────── */

export function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive.Root {...props} />
}

/* ── TooltipTrigger ─────────────────────────────────────────────── */

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger {...props} />
}

/* ── TooltipContent ─────────────────────────────────────────────── */

export function TooltipContent({
  side = "top",
  sideOffset = 8,
  collisionPadding = 8,
  className,
  children,
  ...rest
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        {...rest}
        side={toPhysicalSide(side)}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cx(styles.content, className)}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
