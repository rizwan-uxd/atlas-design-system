"use client"

import React from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check } from "lucide-react"
import { Divider } from "../Divider/Divider"
import styles from "./Select.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type SelectSize = "sm" | "md"

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Hidden input name for native form participation. */
  name?: string
  required?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

export interface SelectTriggerProps extends React.ComponentProps<"button"> {
  size?: SelectSize
  /** Marks the control as invalid. */
  invalid?: boolean
}

export interface SelectContentProps extends React.ComponentProps<"div"> {
  side?: "bottom" | "top"
}

export interface SelectItemProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  value: string
  disabled?: boolean
}

export interface SelectValueProps {
  placeholder?: string
}

export interface SelectGroupProps extends React.ComponentProps<"div"> {}

export interface SelectLabelProps extends React.ComponentProps<"div"> {}

export interface SelectSeparatorProps extends Omit<React.ComponentProps<typeof Divider>, "orientation" | "tone" | "decorative"> {}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value)
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value
}

const CONTENT_ATTR = "data-atlas-select-content"
const ITEM_SELECTOR = '[role="option"]:not([aria-disabled="true"])'

function enabledItems(content: HTMLElement): HTMLElement[] {
  return Array.from(content.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/* ── Context ────────────────────────────────────────────────────── */

interface SelectContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string | undefined
  onSelect: (value: string) => void
  triggerRef: React.MutableRefObject<HTMLElement | null>
  triggerId: string
  contentId: string
  disabled: boolean
  focusIntent: React.MutableRefObject<"first" | "last" | "selected" | "content">
  itemLabels: React.MutableRefObject<Map<string, string>>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelect(part: string): SelectContextValue {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error(`${part} must be used inside <Select>`)
  return ctx
}

/* ── Select (root) ──────────────────────────────────────────────── */

export function Select({ value: valueProp, defaultValue, onValueChange, name, required, disabled = false, children }: SelectProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : inner
  const [open, setOpenRaw] = React.useState(false)

  const triggerRef = React.useRef<HTMLElement | null>(null)
  const focusIntent = React.useRef<"first" | "last" | "selected" | "content">("content")
  const itemLabels = React.useRef<Map<string, string>>(new Map())
  const baseId = React.useId()

  const setOpen = React.useCallback((next: boolean) => {
    if (disabled && next) return
    setOpenRaw(next)
  }, [disabled])

  const onSelect = React.useCallback((v: string) => {
    if (!controlled) setInner(v)
    onValueChange?.(v)
    setOpenRaw(false)
    triggerRef.current?.focus()
  }, [controlled, onValueChange])

  const ctx = React.useMemo<SelectContextValue>(() => ({
    open,
    setOpen,
    value,
    onSelect,
    triggerRef,
    triggerId: `${baseId}-trigger`,
    contentId: `${baseId}-listbox`,
    disabled,
    focusIntent,
    itemLabels,
  }), [open, setOpen, value, onSelect, baseId, disabled])

  return (
    <SelectContext.Provider value={ctx}>
      {children}
      {name && <input type="hidden" name={name} value={value ?? ""} aria-hidden="true" />}
      {required && !value && <input type="text" required tabIndex={-1} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }} value="" onChange={() => {}} />}
    </SelectContext.Provider>
  )
}

/* ── SelectTrigger ──────────────────────────────────────────────── */

export function SelectTrigger({ size = "md", invalid = false, className, children, onClick, onKeyDown, ref, ...rest }: SelectTriggerProps) {
  const ctx = useSelect("SelectTrigger")

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.defaultPrevented) return
    if (event.detail > 0) ctx.focusIntent.current = ctx.value ? "selected" : "first"
    ctx.setOpen(!ctx.open)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.defaultPrevented) return
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        ctx.focusIntent.current = "first"
        ctx.setOpen(true)
        break
      case "ArrowUp":
        event.preventDefault()
        ctx.focusIntent.current = "last"
        ctx.setOpen(true)
        break
      case "Enter":
      case " ":
        ctx.focusIntent.current = ctx.value ? "selected" : "first"
        break
      case "Home":
        event.preventDefault()
        ctx.focusIntent.current = "first"
        ctx.setOpen(true)
        break
      case "End":
        event.preventDefault()
        ctx.focusIntent.current = "last"
        ctx.setOpen(true)
        break
    }
  }

  return (
    <button
      {...rest}
      ref={(node) => {
        ctx.triggerRef.current = node
        setRef(ref, node)
      }}
      id={rest.id ?? ctx.triggerId}
      type="button"
      role="combobox"
      aria-expanded={ctx.open}
      aria-haspopup="listbox"
      aria-controls={ctx.open ? ctx.contentId : undefined}
      aria-invalid={invalid || undefined}
      disabled={ctx.disabled || rest.disabled}
      className={cx(styles.trigger, styles[size], className)}
      onClick={(event) => {
        onClick?.(event)
        handleClick(event)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        handleKeyDown(event)
      }}
    >
      {children}
      <span className={styles.chevron} aria-hidden="true">
        <ChevronDown />
      </span>
    </button>
  )
}

/* ── SelectValue ────────────────────────────────────────────────── */

export function SelectValue({ placeholder }: SelectValueProps) {
  const ctx = useSelect("SelectValue")
  const label = ctx.value ? ctx.itemLabels.current.get(ctx.value) : undefined
  const showPlaceholder = !ctx.value || !label

  return (
    <span className={cx(styles.value, showPlaceholder && styles.placeholder)}>
      {showPlaceholder ? (placeholder ?? " ") : label}
    </span>
  )
}

/* ── SelectContent ──────────────────────────────────────────────── */

export function SelectContent({ side = "bottom", className, children, onKeyDown, ref, ...rest }: SelectContentProps) {
  const ctx = useSelect("SelectContent")
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [position, setPosition] = React.useState<React.CSSProperties | null>(null)
  const typeahead = React.useRef({ buffer: "", timer: 0 as unknown as ReturnType<typeof setTimeout> })

  React.useEffect(() => setMounted(true), [])

  const place = React.useCallback(() => {
    const trigger = ctx.triggerRef.current
    if (!trigger) return
    const rtl = getComputedStyle(trigger).direction === "rtl"
    const rect = trigger.getBoundingClientRect()
    const next: React.CSSProperties = {
      "--select-trigger-width": `${rect.width}px`,
    } as React.CSSProperties
    if (side === "top") next.bottom = window.innerHeight - rect.top
    else next.top = rect.bottom
    if (rtl) next.right = window.innerWidth - rect.right
    else next.left = rect.left
    setPosition(next)
  }, [ctx.triggerRef, side])

  useIsoLayoutEffect(() => {
    if (!ctx.open || !mounted) return
    place()
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [ctx.open, mounted, place])

  React.useEffect(() => {
    if (!ctx.open || !mounted || !position) return
    const content = contentRef.current
    if (!content) return
    const items = enabledItems(content)
    const intent = ctx.focusIntent.current
    if (intent === "selected" && ctx.value) {
      const selected = items.find(el => el.getAttribute("data-value") === ctx.value)
      if (selected) { selected.focus(); ctx.focusIntent.current = "content"; return }
    }
    if (intent === "first") items[0]?.focus()
    else if (intent === "last") items[items.length - 1]?.focus()
    else content.focus()
    ctx.focusIntent.current = "content"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.open, mounted, position !== null])

  React.useEffect(() => {
    if (!ctx.open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (ctx.triggerRef.current?.contains(target)) return
      if ((target as Element).closest?.(`[${CONTENT_ATTR}]`)) return
      ctx.setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [ctx])

  React.useEffect(() => () => clearTimeout(typeahead.current.timer), [])

  if (!ctx.open || !mounted || typeof document === "undefined") return null

  const closeAndRestoreFocus = () => {
    ctx.setOpen(false)
    ctx.triggerRef.current?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    const content = contentRef.current
    if (!content || event.defaultPrevented) return

    const items = enabledItems(content)
    const index = items.indexOf(document.activeElement as HTMLElement)
    const move = (to: HTMLElement | undefined) => {
      event.preventDefault()
      to?.focus()
    }

    switch (event.key) {
      case "ArrowDown":
        return move(items[(index + 1) % items.length])
      case "ArrowUp":
        return move(items[(index - 1 + items.length) % items.length])
      case "Home":
        return move(items[0])
      case "End":
        return move(items[items.length - 1])
      case "Escape":
        event.preventDefault()
        return closeAndRestoreFocus()
      case "Tab":
        event.preventDefault()
        return closeAndRestoreFocus()
      case "Enter":
      case " ": {
        const active = document.activeElement as HTMLElement | null
        if (active && content.contains(active) && active.matches(ITEM_SELECTOR)) {
          event.preventDefault()
          active.click()
        }
        return
      }
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const state = typeahead.current
      clearTimeout(state.timer)
      state.buffer += event.key.toLowerCase()
      state.timer = setTimeout(() => (state.buffer = ""), 500)
      const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
      const match = ordered.find(el => el.textContent?.trim().toLowerCase().startsWith(state.buffer))
      if (match) match.focus()
    }
  }

  return createPortal(
    <div
      {...rest}
      ref={(node) => {
        contentRef.current = node
        setRef(ref, node)
      }}
      id={ctx.contentId}
      role="listbox"
      tabIndex={-1}
      aria-labelledby={ctx.triggerId}
      {...{ [CONTENT_ATTR]: "" }}
      data-side={side}
      className={cx(styles.content, className)}
      style={{ ...position, visibility: position ? undefined : "hidden", ...rest.style }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>,
    document.body,
  )
}

/* ── SelectItem ─────────────────────────────────────────────────── */

export function SelectItem({ value, disabled = false, className, children, onClick, ref, ...rest }: SelectItemProps) {
  const ctx = useSelect("SelectItem")
  const selected = ctx.value === value

  const text = typeof children === "string" ? children : undefined

  React.useEffect(() => {
    if (text) ctx.itemLabels.current.set(value, text)
  }, [text, value, ctx.itemLabels])

  return (
    <div
      {...rest}
      ref={ref}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-value={value}
      tabIndex={-1}
      className={cx(styles.item, className)}
      onClick={(event) => {
        onClick?.(event)
        if (!disabled && !event.defaultPrevented) ctx.onSelect(value)
      }}
    >
      <span className={styles.indicator} aria-hidden="true">
        {selected && <Check />}
      </span>
      {children}
    </div>
  )
}

/* ── SelectGroup ────────────────────────────────────────────────── */

export function SelectGroup({ className, children, ref, ...rest }: SelectGroupProps) {
  return (
    <div {...rest} ref={ref} role="group" className={cx(styles.group, className)}>
      {children}
    </div>
  )
}

/* ── SelectLabel ────────────────────────────────────────────────── */

export function SelectLabel({ className, children, ref, ...rest }: SelectLabelProps) {
  return (
    <div {...rest} ref={ref} className={cx(styles.label, className)}>
      {children}
    </div>
  )
}

/* ── SelectSeparator ────────────────────────────────────────────── */

export function SelectSeparator({ className, ...rest }: SelectSeparatorProps) {
  return <Divider {...rest} className={cx(styles.separator, className)} />
}
