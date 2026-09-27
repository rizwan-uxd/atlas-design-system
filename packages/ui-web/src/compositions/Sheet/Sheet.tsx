"use client"

/**
 * Atlas Sheet — edge-anchored panel with 4 sides
 *
 * Root, trigger and the header/body/footer slots are Dialog's — Sheet is a
 * Radix Dialog underneath (same focus trap, scroll lock, Escape, aria-modal
 * wiring), just re-exported under the Sheet name. Only SheetContent is new:
 * an edge-anchored panel geometry instead of Dialog's centered modal card.
 *
 * Variants (Figma "Side"): bottom | top | start | end
 * Sizes: sm | md | lg | xl | full (code-only, no Figma variant — reuses
 *        Dialog's dialog-sm/md/lg/xl width tokens; start/end only. bottom/top
 *        are always full inline width, matching Dialog's former sheet variant.)
 *
 * Drag handle: bottom only (BUG-037/066 precedent) — top/start/end have none,
 * matching Drawer's "no handle" convention for its start/end sides.
 *
 * Compound API:
 *   <Sheet open onOpenChange={...}>
 *     <SheetContent side="bottom">
 *       <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
 *       <SheetBody>…</SheetBody>
 *     </SheetContent>
 *   </Sheet>
 *
 * Accessibility: identical to Dialog (role="dialog", aria-modal, focus trap,
 * Escape to close, focus returns to trigger) — inherited via the Radix root.
 *
 * Token compliance: all values via semantic tokens in Sheet.module.css.
 */

import React from "react"
import * as RadixDialog from "@radix-ui/react-dialog"
import {
  Dialog as Sheet,
  DialogTrigger as SheetTrigger,
  DialogHeader as SheetHeader,
  DialogTitle as SheetTitle,
  DialogDescription as SheetDescription,
  DialogBody as SheetBody,
  DialogFooter as SheetFooter,
  DialogClose as SheetClose,
} from "../Dialog/Dialog"
import styles from "./Sheet.module.css"

export {
  Sheet,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ──────────────────────────────────────────────────────── */

export type SheetSide = "bottom" | "top" | "start" | "end"
export type SheetSize = "sm" | "md" | "lg" | "xl" | "full"

/* ── SheetContent ───────────────────────────────────────────────── */
/*
 * Renders: Portal → Overlay → Content surface.
 * Drag handle — bottom only; visual affordance only (FIX BUG-037 + BUG-066
 *   precedent, carried over from Dialog's old sheet variant).
 *   Not interactive: close is via header × button or swipe gesture.
 *   aria-hidden prevents screen readers from announcing the decoration.
 */

export interface SheetContentProps {
  side?:                SheetSide
  /** start/end only — bottom/top are always full inline width */
  size?:                SheetSize
  id?:                  string
  closeOnEscape?:       boolean
  closeOnOverlayClick?: boolean
  className?:           string
  children?:            React.ReactNode
}

export function SheetContent({
  side                = "bottom",
  size                = "md",
  id,
  closeOnEscape       = true,
  closeOnOverlayClick = true,
  className,
  children,
}: SheetContentProps) {
  const isEdge = side === "start" || side === "end"
  const contentClasses = cx(
    styles.content,
    isEdge && size !== "md" && styles[size],
    className,
  )

  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.overlay} />

      <RadixDialog.Content
        id={id}
        className={contentClasses}
        data-side={side}
        onEscapeKeyDown={(e) => { if (!closeOnEscape) e.preventDefault() }}
        onInteractOutside={(e) => { if (!closeOnOverlayClick) e.preventDefault() }}
      >
        {side === "bottom" && (
          <div className={styles.dragHandle} aria-hidden="true" />
        )}

        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
