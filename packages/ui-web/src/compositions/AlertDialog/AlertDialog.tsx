"use client"

/**
 * Atlas AlertDialog — confirmation-only modal
 *
 * Not equal to Dialog: distinct component, distinct Radix primitive
 * (@radix-ui/react-alert-dialog, role="alertdialog"), distinct Figma component
 * set. Reuses Dialog's box/typography tokens for visual consistency but never
 * imports Dialog itself.
 *
 * Powered by @radix-ui/react-alert-dialog for:
 *   - role="alertdialog" + aria-modal="true"
 *   - focus trap (Tab / Shift+Tab cycles inside content)
 *   - scroll lock (body scroll disabled while open)
 *   - aria-labelledby → AlertDialogTitle, aria-describedby → AlertDialogDescription
 *   - no dismiss by clicking outside (Radix AlertDialog blocks onPointerDownOutside/
 *     onInteractOutside — accidental dismissal is prevented)
 *   - Escape still closes it, same as Dialog — Escape is a keyboard-accessible
 *     cancel, not an accidental dismissal
 *   - initial focus on AlertDialogCancel (matches the OS convention: the
 *     non-destructive choice is the safe default focus target)
 *
 * Variant is a semantic marker only (matches Figma `Variant`); it decides which
 * Button variant AlertDialogAction renders — it carries no other built-in recolor.
 * Variants:  default | destructive
 * Sizes:     sm | md | lg
 * State:     default | loading (AlertDialogAction shows Button's loading treatment)
 *
 * No close-X and no header — anatomy is fixed: Title, Description, Footer
 * (Cancel + Action). For general modal content with an optional close button,
 * or content beyond a confirm decision, use Dialog instead.
 *
 * Compound API:
 *   <AlertDialog open={open} onOpenChange={setOpen}>
 *     <AlertDialogTrigger asChild><Button variant="destructive">Delete</Button></AlertDialogTrigger>
 *     <AlertDialogContent variant="destructive" size="sm">
 *       <AlertDialogTitle>Delete this transfer?</AlertDialogTitle>
 *       <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
 *       <AlertDialogFooter>
 *         <AlertDialogCancel>Cancel</AlertDialogCancel>
 *         <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
 *       </AlertDialogFooter>
 *     </AlertDialogContent>
 *   </AlertDialog>
 *
 * Accessibility:
 *   - role="alertdialog" + aria-modal="true" via Radix
 *   - aria-labelledby → AlertDialogTitle id (Radix auto-wires)
 *   - aria-describedby → AlertDialogDescription id (Radix auto-wires)
 *   - Initial focus → AlertDialogCancel (Radix default: the least destructive action)
 *   - Focus returns to trigger on close
 *   - AlertDialogAction State=loading sets aria-busy and disables the button
 *
 * Token compliance: all values via semantic tokens in AlertDialog.module.css.
 */

import React from "react"
import * as RadixAlertDialog from "@radix-ui/react-alert-dialog"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import styles from "./AlertDialog.module.css"

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ──────────────────────────────────────────────────────── */

export type AlertDialogVariant = "default" | "destructive"
export type AlertDialogSize    = "sm" | "md" | "lg"

/* ── AlertDialog root ───────────────────────────────────────────── */

export interface AlertDialogProps {
  open?:         boolean
  defaultOpen?:  boolean
  onOpenChange?: (open: boolean) => void
  children?:     React.ReactNode
}

export function AlertDialog({ open, defaultOpen, onOpenChange, children }: AlertDialogProps) {
  return (
    <RadixAlertDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </RadixAlertDialog.Root>
  )
}

/* ── AlertDialogTrigger ─────────────────────────────────────────── */

export interface AlertDialogTriggerProps {
  asChild?:  boolean
  children?: React.ReactNode
}

export function AlertDialogTrigger({ asChild = true, children }: AlertDialogTriggerProps) {
  return (
    <RadixAlertDialog.Trigger asChild={asChild}>
      {children}
    </RadixAlertDialog.Trigger>
  )
}

/* ── AlertDialogContent ─────────────────────────────────────────── */
/*
 * Renders: Portal → Overlay → Content surface (centered, fixed anatomy).
 * `variant`/`state` are read by AlertDialogAction via context so the action
 * button can recolor/loading itself without the caller repeating the prop.
 */

const VariantContext = React.createContext<AlertDialogVariant>("default")
const StateContext   = React.createContext<"default" | "loading">("default")

export interface AlertDialogContentProps {
  /** Drives AlertDialogAction's Button variant (destructive → danger red) */
  variant?:   AlertDialogVariant
  size?:      AlertDialogSize
  /** loading → AlertDialogAction is disabled + shows Button's loading treatment */
  state?:     "default" | "loading"
  id?:        string
  className?: string
  children?:  React.ReactNode
}

export function AlertDialogContent({
  variant   = "default",
  size      = "md",
  state     = "default",
  id,
  className,
  children,
}: AlertDialogContentProps) {
  const contentClasses = cx(
    styles.content,
    size !== "md" && styles[size],
    className,
  )

  return (
    <RadixAlertDialog.Portal>
      <RadixAlertDialog.Overlay className={styles.overlay} />
      <RadixAlertDialog.Content id={id} className={contentClasses} data-variant={variant}>
        <VariantContext.Provider value={variant}>
          <StateContext.Provider value={state}>
            {children}
          </StateContext.Provider>
        </VariantContext.Provider>
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Portal>
  )
}

/* ── AlertDialogTitle ───────────────────────────────────────────── */

export interface AlertDialogTitleProps {
  className?: string
  children?:  React.ReactNode
}

export function AlertDialogTitle({ className, children }: AlertDialogTitleProps) {
  return (
    <RadixAlertDialog.Title className={cx(styles.title, className)}>
      {children}
    </RadixAlertDialog.Title>
  )
}

/* ── AlertDialogDescription ─────────────────────────────────────── */

export interface AlertDialogDescriptionProps {
  className?: string
  children?:  React.ReactNode
}

export function AlertDialogDescription({ className, children }: AlertDialogDescriptionProps) {
  return (
    <RadixAlertDialog.Description className={cx(styles.description, className)}>
      {children}
    </RadixAlertDialog.Description>
  )
}

/* ── AlertDialogFooter ──────────────────────────────────────────── */

export interface AlertDialogFooterProps {
  className?: string
  children?:  React.ReactNode
}

export function AlertDialogFooter({ className, children }: AlertDialogFooterProps) {
  return (
    <div className={cx(styles.footer, className)}>
      {children}
    </div>
  )
}

/* ── AlertDialogCancel ──────────────────────────────────────────── */
/*
 * Radix focuses this by default on open — the least destructive action.
 */

export interface AlertDialogCancelProps {
  className?: string
  children?:  React.ReactNode
}

export function AlertDialogCancel({ className, children }: AlertDialogCancelProps) {
  return (
    <RadixAlertDialog.Cancel asChild>
      <Button variant="outline" className={className}>
        {children}
      </Button>
    </RadixAlertDialog.Cancel>
  )
}

/* ── AlertDialogAction ──────────────────────────────────────────── */
/*
 * Button variant follows the enclosing AlertDialogContent's `variant`
 * (destructive → Button variant="destructive", default → "primary").
 * State=loading → disabled + Button's own loading treatment.
 * Does NOT auto-close — call onOpenChange(false) yourself after the async
 * action resolves (so a loading action can't be dismissed mid-flight).
 */

export interface AlertDialogActionProps {
  onClick?:   (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  children?:  React.ReactNode
}

export function AlertDialogAction({ onClick, className, children }: AlertDialogActionProps) {
  const variant = React.useContext(VariantContext)
  const state   = React.useContext(StateContext)
  const loading = state === "loading"

  return (
    <Button
      variant={variant === "destructive" ? "destructive" : "primary"}
      className={className}
      onClick={onClick}
      loading={loading}
    >
      {children}
    </Button>
  )
}
