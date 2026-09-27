"use client"

/**
 * Atlas Drawer — edge-anchored side panel
 *
 * Root, trigger and the header/body/footer slots are Dialog's — Drawer is a
 * Radix Dialog underneath (same focus trap, scroll lock, Escape, aria-modal
 * wiring), just re-exported under the Drawer name. Only DrawerContent is new:
 * a side panel geometry instead of Dialog's centered modal card.
 *
 * Variants (Figma "Side"): start | end
 * Sizes:                   sm | md | lg | xl | full (code-only, no Figma
 *                          variant — reuses Dialog's dialog-sm/md/lg/xl width tokens)
 *
 * Compound API:
 *   <Drawer open onOpenChange={...}>
 *     <DrawerContent side="start" size="sm">
 *       <DrawerHeader><DrawerTitle>Menu</DrawerTitle></DrawerHeader>
 *       <DrawerBody>…</DrawerBody>
 *     </DrawerContent>
 *   </Drawer>
 *
 * Accessibility: identical to Dialog (role="dialog", aria-modal, focus trap,
 * Escape to close, focus returns to trigger) — inherited via the Radix root.
 *
 * Token compliance: all values via semantic tokens in Drawer.module.css.
 */

import React from "react"
import * as RadixDialog from "@radix-ui/react-dialog"
import {
  Dialog as Drawer,
  DialogTrigger as DrawerTrigger,
  DialogHeader as DrawerHeader,
  DialogTitle as DrawerTitle,
  DialogDescription as DrawerDescription,
  DialogBody as DrawerBody,
  DialogFooter as DrawerFooter,
  DialogClose as DrawerClose,
} from "../Dialog/Dialog"
import styles from "./Drawer.module.css"

export {
  Drawer,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ──────────────────────────────────────────────────────── */

export type DrawerSide = "start" | "end"
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full"

/* ── DrawerContent ──────────────────────────────────────────────── */
/*
 * Renders: Portal → Overlay → Content surface.
 * No drag handle — that affordance is Sheet-only (BUG-037/066), not Drawer's.
 */

export interface DrawerContentProps {
  side?:                DrawerSide
  size?:                DrawerSize
  id?:                  string
  closeOnEscape?:       boolean
  closeOnOverlayClick?: boolean
  className?:           string
  children?:            React.ReactNode
}

export function DrawerContent({
  side                = "end",
  size                = "md",
  id,
  closeOnEscape       = true,
  closeOnOverlayClick = true,
  className,
  children,
}: DrawerContentProps) {
  const contentClasses = cx(
    styles.content,
    size !== "md" && styles[size],
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
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
