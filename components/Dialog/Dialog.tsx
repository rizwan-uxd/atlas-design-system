"use client"

/**
 * Atlas Dialog — modal / sheet / drawer surface
 *
 * Powered by @radix-ui/react-dialog for:
 *   - focus trap (Tab / Shift+Tab cycles inside content)
 *   - scroll lock (body scroll disabled while open)
 *   - keyboard dismiss (Escape key)
 *   - aria-modal, aria-labelledby, aria-describedby wiring
 *   - click-outside dismiss via onInteractOutside
 *
 * Variants:  modal (default) | sheet | drawer
 * Sizes:     sm | md | lg | xl | full
 *
 * Compound API:
 *   <Dialog open onOpenChange={...}>
 *     <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
 *     <DialogContent variant="modal" size="md">
 *       <DialogHeader>
 *         <DialogTitle>…</DialogTitle>
 *         <DialogDescription>…</DialogDescription>
 *       </DialogHeader>
 *       <DialogBody>…</DialogBody>
 *       <DialogFooter>
 *         <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
 *         <Button>Confirm</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Accessibility:
 *   - role="dialog" + aria-modal="true" via Radix
 *   - aria-labelledby → DialogTitle id (Radix auto-wires)
 *   - aria-describedby → DialogDescription id (Radix auto-wires)
 *   - Initial focus → first focusable element inside DialogContent
 *   - Escape → closes (unless closeOnEscape=false)
 *   - Focus returns to trigger on close
 *
 * Token compliance: all values via semantic tokens in Dialog.module.css.
 */

import React, { useId } from "react"
import * as RadixDialog from "@radix-ui/react-dialog"
import styles from "./Dialog.module.css"

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ──────────────────────────────────────────────────────── */

export type DialogVariant = "modal" | "sheet" | "drawer"
export type DialogSize    = "sm" | "md" | "lg" | "xl" | "full"
export type DialogSide    = "start" | "end"

/* ── Dialog root ────────────────────────────────────────────────── */
/*
 * Thin wrapper around Radix Root.
 * Supports both controlled (open + onOpenChange) and uncontrolled (defaultOpen).
 */

export interface DialogProps {
  open?:          boolean
  defaultOpen?:   boolean
  /** Called with next open state; use setOpen directly (receives boolean) */
  onOpenChange?:  (open: boolean) => void
  /** @deprecated — use onOpenChange instead */
  onClose?:       () => void
  children?:      React.ReactNode
}

export function Dialog({ open, defaultOpen, onOpenChange, onClose, children }: DialogProps) {
  const handleChange = (next: boolean) => {
    onOpenChange?.(next)
    if (!next) onClose?.()
  }

  return (
    <RadixDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleChange}
    >
      {children}
    </RadixDialog.Root>
  )
}

/* ── DialogTrigger ──────────────────────────────────────────────── */

export interface DialogTriggerProps {
  asChild?:  boolean
  children?: React.ReactNode
}

export function DialogTrigger({ asChild = true, children }: DialogTriggerProps) {
  return (
    <RadixDialog.Trigger asChild={asChild}>
      {children}
    </RadixDialog.Trigger>
  )
}

/* ── DialogContent ──────────────────────────────────────────────── */
/*
 * Renders: Portal → Overlay → Content surface.
 * Variant / size classes applied here.
 * Sheet gets the drag handle at the top.
 */

export interface DialogContentProps {
  variant?:             DialogVariant
  size?:                DialogSize
  /** Drawer only: which edge to slide from */
  side?:                DialogSide
  id?:                  string
  closeOnEscape?:       boolean
  closeOnOverlayClick?: boolean
  className?:           string
  children?:            React.ReactNode
}

export function DialogContent({
  variant             = "modal",
  size                = "md",
  side                = "end",
  id,
  closeOnEscape       = true,
  closeOnOverlayClick = true,
  className,
  children,
}: DialogContentProps) {
  const contentClasses = cx(
    styles.content,
    styles[variant],
    size !== "md" && styles[size],
    className,
  )

  return (
    <RadixDialog.Portal>
      {/* Overlay */}
      <RadixDialog.Overlay className={styles.overlay} />

      {/* Content surface */}
      <RadixDialog.Content
        id={id}
        className={contentClasses}
        data-side={variant === "drawer" ? side : undefined}
        onEscapeKeyDown={(e) => { if (!closeOnEscape) e.preventDefault() }}
        onInteractOutside={(e) => { if (!closeOnOverlayClick) e.preventDefault() }}
      >
        {/* Drag handle — sheet only; visual affordance only (FIX BUG-037 + BUG-066)
             Not interactive: close is via header × button or swipe gesture.
             aria-hidden prevents screen readers from announcing the decoration. */}
        {variant === "sheet" && (
          <div className={styles.dragHandle} aria-hidden="true" />
        )}

        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}

/* ── DialogHeader ───────────────────────────────────────────────── */
/*
 * Horizontal row: [main slot] [close button].
 * showClose=true by default — renders a RadixDialog.Close button.
 * Pass showClose=false if you want no built-in × (or use DialogClose yourself).
 */

export interface DialogHeaderProps {
  showClose?: boolean
  /** @deprecated — close is now handled by Radix; prop accepted but ignored */
  onClose?:   () => void
  className?: string
  children?:  React.ReactNode
}

export function DialogHeader({ showClose = true, className, children }: DialogHeaderProps) {
  return (
    <div className={cx(styles.header, className)}>
      <div className={styles.headerMain}>
        {children}
      </div>

      {showClose && (
        <RadixDialog.Close
          className={styles.closeBtn}
          aria-label="Close dialog"
        >
          ✕
        </RadixDialog.Close>
      )}
    </div>
  )
}

/* ── DialogTitle ────────────────────────────────────────────────── */
/*
 * Wrapped in RadixDialog.Title for aria-labelledby wiring.
 * Required for accessibility — every dialog must have a title.
 */

export interface DialogTitleProps {
  className?: string
  children?:  React.ReactNode
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <RadixDialog.Title className={cx(styles.title, className)}>
      {children}
    </RadixDialog.Title>
  )
}

/* ── DialogDescription ──────────────────────────────────────────── */
/*
 * Wrapped in RadixDialog.Description for aria-describedby wiring.
 */

export interface DialogDescriptionProps {
  className?: string
  children?:  React.ReactNode
}

export function DialogDescription({ className, children }: DialogDescriptionProps) {
  return (
    <RadixDialog.Description className={cx(styles.description, className)}>
      {children}
    </RadixDialog.Description>
  )
}

/* ── DialogBody ─────────────────────────────────────────────────── */

export interface DialogBodyProps {
  className?: string
  children?:  React.ReactNode
}

export function DialogBody({ className, children }: DialogBodyProps) {
  return (
    <div className={cx(styles.body, className)}>
      {children}
    </div>
  )
}

/* ── DialogFooter ───────────────────────────────────────────────── */

export interface DialogFooterProps {
  justify?:   "start" | "between" | "end"
  className?: string
  children?:  React.ReactNode
}

export function DialogFooter({ justify = "end", className, children }: DialogFooterProps) {
  const justifyClass =
    justify === "between" ? styles.footerBetween :
    justify === "start"   ? styles.footerStart   :
    styles.footerEnd

  return (
    <div className={cx(styles.footer, justifyClass, className)}>
      {children}
    </div>
  )
}

/* ── DialogClose ────────────────────────────────────────────────── */
/*
 * Wraps any element to close the dialog on click.
 * Use asChild=true (default) to render the child element as the trigger.
 */

export interface DialogCloseProps {
  asChild?:  boolean
  children?: React.ReactNode
}

export function DialogClose({ asChild = true, children }: DialogCloseProps) {
  return (
    <RadixDialog.Close asChild={asChild}>
      {children}
    </RadixDialog.Close>
  )
}
