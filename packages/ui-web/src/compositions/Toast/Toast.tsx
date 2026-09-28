"use client"

/**
 * Atlas Toast — a brief, transient message shown out of flow at the edge of the screen.
 *
 * Variants:      default | success | danger
 * Parts:         Icon (`icon` prop) · ToastTitle · ToastDescription · ToastAction · ToastClose
 *                (Figma booleans Icon / Title / Description / Action / Close; compose the parts you need)
 * States:        closed · open · swipe (move, cancel, end) — auto-dismisses after `duration`,
 *                pauses on hover, focus and window blur.
 * Accessibility: Radix renders a live region. `danger` is announced assertively
 *                (`type="foreground"`), the others politely. ToastAction needs `altText`
 *                (the action described for screen-reader users). F8 jumps to the viewport;
 *                Escape dismisses the focused toast. Swipe direction follows the reading
 *                direction (`end`).
 *
 * Imperative use: mount `<Toaster />` once, then call `toast({ ... })` from anywhere.
 */

import React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { CircleAlert, CircleCheck, Info, X } from "lucide-react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import styles from "./Toast.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type ToastVariant = "default" | "success" | "danger"

export interface ToastProps
  extends Omit<React.ComponentProps<typeof ToastPrimitive.Root>, "type"> {
  variant?: ToastVariant
  /**
   * Leading icon. `true` shows the variant's default icon (info, check, alert);
   * pass a node to override it. Off by default.
   */
  icon?: React.ReactNode | boolean
}

export type ToastProviderProps = React.ComponentProps<typeof ToastPrimitive.Provider>

export type ToastViewportProps = React.ComponentProps<typeof ToastPrimitive.Viewport>

export type ToastTitleProps = React.ComponentProps<typeof ToastPrimitive.Title>

export type ToastDescriptionProps = React.ComponentProps<typeof ToastPrimitive.Description>

export interface ToastActionProps
  extends Omit<React.ComponentProps<typeof ToastPrimitive.Action>, "asChild"> {
  /** The action described for screen-reader users, e.g. "Undo deleting the file". Required. */
  altText: string
}

export type ToastCloseProps = Omit<React.ComponentProps<typeof ToastPrimitive.Close>, "asChild">

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

function isRtl(): boolean {
  return typeof document !== "undefined" && getComputedStyle(document.documentElement).direction === "rtl"
}

const DEFAULT_ICONS: Record<ToastVariant, React.ElementType> = {
  default: Info,
  success: CircleCheck,
  danger: CircleAlert,
}

/* ── ToastProvider ──────────────────────────────────────────────── */

/** Wrap the app (or a region) once. Swipe-to-dismiss goes toward the inline end. */
export function ToastProvider({ duration = 5000, swipeDirection, ...rest }: ToastProviderProps) {
  return (
    <ToastPrimitive.Provider
      duration={duration}
      swipeDirection={swipeDirection ?? (isRtl() ? "left" : "right")}
      {...rest}
    />
  )
}

/* ── ToastViewport ──────────────────────────────────────────────── */

/** Fixed stack at the bottom, inline-end corner of the screen. Render it inside ToastProvider. */
export function ToastViewport({ className, ...rest }: ToastViewportProps) {
  return <ToastPrimitive.Viewport className={cx(styles.viewport, className)} {...rest} />
}

/* ── Toast ──────────────────────────────────────────────────────── */

export function Toast({ variant = "default", icon = false, className, children, ...rest }: ToastProps) {
  const DefaultIcon = DEFAULT_ICONS[variant]
  const iconNode = icon === true ? <DefaultIcon size={16} aria-hidden="true" /> : icon || null

  return (
    <ToastPrimitive.Root
      {...rest}
      type={variant === "danger" ? "foreground" : "background"}
      data-variant={variant}
      className={cx(styles.root, className)}
    >
      {iconNode ? <span className={styles.icon}>{iconNode}</span> : null}
      {children}
    </ToastPrimitive.Root>
  )
}

/* ── ToastTitle · ToastDescription ──────────────────────────────── */

export function ToastTitle({ className, ...rest }: ToastTitleProps) {
  return <ToastPrimitive.Title className={cx(styles.title, className)} {...rest} />
}

export function ToastDescription({ className, ...rest }: ToastDescriptionProps) {
  return <ToastPrimitive.Description className={cx(styles.description, className)} {...rest} />
}

/* ── ToastAction ────────────────────────────────────────────────── */

/** One short verb (Undo, Retry, View). Renders an outline `sm` Button. */
export function ToastAction({ altText, className, children, ...rest }: ToastActionProps) {
  return (
    <ToastPrimitive.Action altText={altText} asChild {...rest}>
      <Button variant="outline" size="sm" className={cx(styles.action, className)}>
        {children}
      </Button>
    </ToastPrimitive.Action>
  )
}

/* ── ToastClose ─────────────────────────────────────────────────── */

/** Icon-only ghost `sm` Button. Pass `aria-label` to localise; defaults to "Close". */
export function ToastClose({ className, "aria-label": ariaLabel = "Close", ...rest }: ToastCloseProps) {
  return (
    <ToastPrimitive.Close asChild {...rest}>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={ariaLabel}
        className={cx(styles.close, className)}
      >
        <X size={16} aria-hidden="true" />
      </Button>
    </ToastPrimitive.Close>
  )
}

/* ── Imperative API ─────────────────────────────────────────────── */

export interface ToastOptions {
  variant?: ToastVariant
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode | boolean
  /** Renders a ToastAction; `onClick` runs before the toast closes. */
  action?: { label: string; altText: string; onClick?: () => void }
  /** Milliseconds before auto-dismiss. Default 5000; `Infinity` keeps it until dismissed. */
  duration?: number
  /** Show the Close button. Default true. */
  dismissible?: boolean
}

interface ToastEntry extends ToastOptions {
  id: string
  open: boolean
}

/** Longer than the exit animation (`--atlas-duration-slow`), so it never cuts it short. */
const REMOVE_DELAY_MS = 500

let entries: ToastEntry[] = []
let nextId = 0
const listeners = new Set<() => void>()

function emit(next: ToastEntry[]) {
  entries = next
  listeners.forEach((l) => l())
}

/** Show a toast from anywhere. Requires `<Toaster />` to be mounted. Returns its id. */
export function toast(options: ToastOptions): string {
  const id = String(++nextId)
  emit([...entries, { ...options, id, open: true }])
  return id
}

/** Close one toast by id, or all of them when no id is given. */
export function dismissToast(id?: string) {
  emit(entries.map((e) => (id === undefined || e.id === id ? { ...e, open: false } : e)))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Hook form of the imperative API. */
export function useToast() {
  const current = React.useSyncExternalStore(subscribe, () => entries, () => entries)
  return { toasts: current, toast, dismiss: dismissToast }
}

/** Mount once near the app root: renders the provider, the queued toasts and the viewport. */
export function Toaster(props: Omit<ToastProviderProps, "children">) {
  const { toasts } = useToast()

  // Closed toasts stay mounted while their exit animation plays, then are dropped.
  React.useEffect(() => {
    if (!toasts.some((t) => !t.open)) return
    const timer = setTimeout(() => emit(entries.filter((e) => e.open)), REMOVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [toasts])

  return (
    <ToastProvider {...props}>
      {toasts.map(({ id, open, title, description, action, dismissible = true, duration, ...rest }) => (
        <Toast
          key={id}
          open={open}
          duration={duration}
          onOpenChange={(next) => {
            if (!next) dismissToast(id)
          }}
          {...rest}
        >
          {title ? <ToastTitle>{title}</ToastTitle> : null}
          {description ? <ToastDescription>{description}</ToastDescription> : null}
          {action ? (
            <ToastAction altText={action.altText} onClick={action.onClick}>
              {action.label}
            </ToastAction>
          ) : null}
          {dismissible ? <ToastClose /> : null}
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
