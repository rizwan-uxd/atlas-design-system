"use client"

/**
 * Atlas DropdownMenu — a floating menu of actions opened from a trigger
 *
 * Figma:      Dropdown Menu Item (Type × State) · Dropdown Menu Label · Dropdown Menu (Groups 1–3)
 * Types:      item · destructive (`destructive`) · checkbox (DropdownMenuCheckboxItem) · radio (DropdownMenuRadioItem)
 * States:     default · focus (the highlighted row, by pointer or keyboard) · disabled
 * Sides:      bottom | top — the panel opens 4px off the trigger
 *
 * Anatomy (compound, like Card and Tabs):
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild><Button variant="outline">Open</Button></DropdownMenuTrigger>
 *     <DropdownMenuContent>
 *       <DropdownMenuLabel>My Account</DropdownMenuLabel>
 *       <DropdownMenuGroup>
 *         <DropdownMenuItem shortcut="⌘B">Billing</DropdownMenuItem>
 *         <DropdownMenuSub>
 *           <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
 *           <DropdownMenuSubContent>…</DropdownMenuSubContent>
 *         </DropdownMenuSub>
 *       </DropdownMenuGroup>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem destructive>Log out</DropdownMenuItem>
 *
 * Accessibility:
 *   - role="menu" panel of menuitem / menuitemcheckbox / menuitemradio rows, labelled by the trigger.
 *   - Trigger: aria-haspopup="menu" and aria-expanded. ArrowDown, ArrowUp, Enter and Space open it.
 *   - Focus moves with ArrowDown / ArrowUp (wraps), Home / End and typeahead; disabled rows are skipped.
 *   - Enter or Space selects; Escape closes and returns focus to the trigger; Tab closes.
 *   - ArrowRight opens a submenu (ArrowLeft in RTL) and the opposite key closes it.
 *   - Outside pointer press closes. No motion: Figma draws none.
 *
 * Built without a menu dependency: the panel is portalled to <body> and anchored to the trigger.
 */

import React from "react"
import { createPortal } from "react-dom"
import { Divider } from "../../primitives/Divider/Divider"
import styles from "./DropdownMenu.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type DropdownMenuSide = "bottom" | "top"

export interface DropdownMenuProps {
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export interface DropdownMenuTriggerProps extends React.ComponentProps<"button"> {
  /** Merge trigger behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean
}

export interface DropdownMenuContentProps extends React.ComponentProps<"div"> {
  /** Which side of the trigger the panel opens on. */
  side?: DropdownMenuSide
}

export interface DropdownMenuItemProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  /** Marks an irreversible action (danger text and icon). */
  destructive?: boolean
  disabled?: boolean
  /** 16px leading icon. */
  icon?: React.ReactNode
  /** Keyboard shortcut hint at the end of the row. */
  shortcut?: React.ReactNode
  /** Called on select; call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void
}

export interface DropdownMenuCheckboxItemProps extends Omit<DropdownMenuItemProps, "destructive" | "icon"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export interface DropdownMenuRadioGroupProps extends React.ComponentProps<"div"> {
  value?: string
  onValueChange?: (value: string) => void
}

export interface DropdownMenuRadioItemProps extends Omit<DropdownMenuItemProps, "destructive" | "icon"> {
  value: string
}

export interface DropdownMenuLabelProps extends React.ComponentProps<"div"> {}

export interface DropdownMenuGroupProps extends React.ComponentProps<"div"> {}

export interface DropdownMenuSeparatorProps extends Omit<React.ComponentProps<typeof Divider>, "orientation" | "tone" | "decorative"> {}

export interface DropdownMenuSubProps {
  children?: React.ReactNode
}

export interface DropdownMenuSubTriggerProps extends Omit<DropdownMenuItemProps, "destructive" | "shortcut" | "onSelect"> {}

export interface DropdownMenuSubContentProps extends React.ComponentProps<"div"> {}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value)
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value
}

const CONTENT_ATTR = "data-atlas-dropdown-content"
const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'

/** Enabled rows that belong to this panel (submenus are portalled, so they are not descendants). */
function enabledItems(content: HTMLElement): HTMLElement[] {
  return Array.from(content.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (el) => el.closest(`[${CONTENT_ATTR}]`) === content && el.getAttribute("aria-disabled") !== "true",
  )
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/* Inline SVG glyphs (repo convention: no icon dependency). Stroke comes from the CSS module. */

function CheckGlyph() {
  return (
    <svg className={styles.svg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ChevronRightGlyph() {
  return (
    <svg className={cx(styles.svg, styles.mirror)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

/* ── Context ────────────────────────────────────────────────────── */

interface MenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.MutableRefObject<HTMLElement | null>
  triggerId: string
  contentId: string
  /** Where focus goes when the panel opens: the first row, the last row, or the panel itself. */
  focusIntent: React.MutableRefObject<"first" | "last" | "content">
  closeRoot: () => void
  isSub: boolean
}

const MenuContext = React.createContext<MenuContextValue | null>(null)
const RadioContext = React.createContext<{ value?: string; onValueChange?: (value: string) => void } | null>(null)

function useMenu(part: string): MenuContextValue {
  const ctx = React.useContext(MenuContext)
  if (!ctx) throw new Error(`${part} must be used inside <DropdownMenu>`)
  return ctx
}

function useOpenState(props: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [inner, setInner] = React.useState(props.defaultOpen ?? false)
  const controlled = props.open !== undefined
  const open = controlled ? (props.open as boolean) : inner
  const { onOpenChange } = props
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setInner(next)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )
  return [open, setOpen] as const
}

/* ── DropdownMenu (root) ────────────────────────────────────────── */

export function DropdownMenu({ open: openProp, defaultOpen, onOpenChange, children }: DropdownMenuProps) {
  const [open, setOpen] = useOpenState({ open: openProp, defaultOpen, onOpenChange })
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const focusIntent = React.useRef<"first" | "last" | "content">("content")
  const baseId = React.useId()
  const value = React.useMemo<MenuContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      triggerId: `${baseId}-trigger`,
      contentId: `${baseId}-content`,
      focusIntent,
      closeRoot: () => setOpen(false),
      isSub: false,
    }),
    [open, setOpen, baseId],
  )
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

/* ── Trigger ────────────────────────────────────────────────────── */

export function DropdownMenuTrigger({ asChild = false, children, onClick, onKeyDown, ref, ...rest }: DropdownMenuTriggerProps) {
  const ctx = useMenu("DropdownMenuTrigger")

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented) return
    // A keyboard click (detail 0) keeps the "first row" intent set by keydown.
    if (event.detail > 0) ctx.focusIntent.current = "content"
    ctx.setOpen(!ctx.open)
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented) return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      ctx.focusIntent.current = event.key === "ArrowDown" ? "first" : "last"
      ctx.setOpen(true)
    } else if (event.key === "Enter" || event.key === " ") {
      // Keyboard activation opens onto the first row.
      ctx.focusIntent.current = "first"
    }
  }
  const attach = (node: HTMLElement | null) => {
    ctx.triggerRef.current = node
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown> & { ref?: React.Ref<HTMLElement> }>
    const childProps = child.props
    return React.cloneElement(child, {
      id: (childProps.id as string | undefined) ?? ctx.triggerId,
      "aria-haspopup": "menu",
      "aria-expanded": ctx.open,
      "aria-controls": ctx.open ? ctx.contentId : undefined,
      ref: (node: HTMLElement | null) => {
        attach(node)
        setRef(childProps.ref, node)
      },
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        ;(childProps.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined)?.(event)
        handleClick(event)
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        ;(childProps.onKeyDown as ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined)?.(event)
        handleKeyDown(event)
      },
    })
  }

  return (
    <button
      {...rest}
      ref={(node) => {
        attach(node)
        setRef(ref, node)
      }}
      id={rest.id ?? ctx.triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.contentId : undefined}
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
    </button>
  )
}

/* ── Panel (shared by Content and SubContent) ───────────────────── */

interface PanelProps extends React.ComponentProps<"div"> {
  side: DropdownMenuSide | "inline-end"
  variant: "root" | "sub"
}

function Panel({ side, variant, className, style, children, onKeyDown, ref, ...rest }: PanelProps) {
  const ctx = useMenu("DropdownMenuContent")
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [position, setPosition] = React.useState<React.CSSProperties | null>(null)
  const typeahead = React.useRef({ buffer: "", timer: 0 as unknown as ReturnType<typeof setTimeout> })

  React.useEffect(() => setMounted(true), [])

  /* Anchor to the trigger (root) or to the parent panel (submenu). Physical offsets are
     computed here; the 4px gap comes from the CSS module so it stays a token. */
  const place = React.useCallback(() => {
    const trigger = ctx.triggerRef.current
    if (!trigger) return
    const rtl = getComputedStyle(trigger).direction === "rtl"
    const next: React.CSSProperties = {}
    if (side === "inline-end") {
      const parent = trigger.closest<HTMLElement>(`[${CONTENT_ATTR}]`) ?? trigger
      const parentRect = parent.getBoundingClientRect()
      const row = trigger.getBoundingClientRect()
      next.top = row.top
      if (rtl) next.right = window.innerWidth - parentRect.left
      else next.left = parentRect.right
    } else {
      const rect = trigger.getBoundingClientRect()
      if (side === "top") next.bottom = window.innerHeight - rect.top
      else next.top = rect.bottom
      if (rtl) next.right = window.innerWidth - rect.right
      else next.left = rect.left
    }
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

  /* Move focus in when the panel opens. */
  React.useEffect(() => {
    if (!ctx.open || !mounted || !position) return
    const content = contentRef.current
    if (!content) return
    const items = enabledItems(content)
    const intent = ctx.focusIntent.current
    if (intent === "first") items[0]?.focus()
    else if (intent === "last") items[items.length - 1]?.focus()
    else content.focus()
    ctx.focusIntent.current = "content"
    // Only when the panel first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.open, mounted, position !== null])

  /* Root panel: an outside pointer press closes the whole menu. */
  React.useEffect(() => {
    if (!ctx.open || variant !== "root") return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (ctx.triggerRef.current?.contains(target)) return
      if ((target as Element).closest?.(`[${CONTENT_ATTR}]`)) return
      ctx.setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [ctx, variant])

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
    // Keys from a nested submenu bubble through the React tree; that panel handles them.
    if ((event.target as Element).closest(`[${CONTENT_ATTR}]`) !== content) return

    const items = enabledItems(content)
    const index = items.indexOf(document.activeElement as HTMLElement)
    const rtl = getComputedStyle(content).direction === "rtl"
    const closeKey = rtl ? "ArrowRight" : "ArrowLeft"
    const move = (to: HTMLElement | undefined) => {
      event.preventDefault()
      event.stopPropagation()
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
        event.stopPropagation()
        return closeAndRestoreFocus()
      case "Tab":
        event.preventDefault()
        return ctx.closeRoot()
      case "Enter":
      case " ": {
        const active = document.activeElement as HTMLElement | null
        if (active && content.contains(active) && active.matches(ITEM_SELECTOR)) {
          event.preventDefault()
          event.stopPropagation()
          active.click()
        }
        return
      }
      default:
        break
    }

    if (ctx.isSub && event.key === closeKey) {
      event.preventDefault()
      event.stopPropagation()
      return closeAndRestoreFocus()
    }

    // Typeahead: focus the next row whose text starts with what was typed.
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const state = typeahead.current
      clearTimeout(state.timer)
      state.buffer += event.key.toLowerCase()
      state.timer = setTimeout(() => (state.buffer = ""), 500)
      const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
      const match = ordered.find((el) => el.textContent?.trim().toLowerCase().startsWith(state.buffer))
      if (match) {
        event.stopPropagation()
        match.focus()
      }
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
      role="menu"
      tabIndex={-1}
      aria-labelledby={ctx.triggerId}
      aria-orientation="vertical"
      {...{ [CONTENT_ATTR]: "" }}
      data-side={side}
      data-variant={variant}
      className={cx(styles.content, className)}
      style={{ ...position, visibility: position ? undefined : "hidden", ...style }}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        rest.onBlur?.(event)
        // A submenu closes when focus leaves it for anything but its own trigger.
        if (variant !== "sub") return
        const next = event.relatedTarget as Node | null
        if (next && !event.currentTarget.contains(next) && next !== ctx.triggerRef.current) ctx.setOpen(false)
      }}
    >
      {children}
    </div>,
    document.body,
  )
}

/* ── Content ────────────────────────────────────────────────────── */

export function DropdownMenuContent({ side = "bottom", ...rest }: DropdownMenuContentProps) {
  return <Panel {...rest} side={side} variant="root" />
}

/* ── Rows ───────────────────────────────────────────────────────── */

interface RowProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  disabled?: boolean
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio"
  onActivate?: () => void
  onSelect?: (event: Event) => void
  keepOpenOnSelect?: boolean
}

function Row({ disabled, role, onActivate, onSelect, keepOpenOnSelect, className, onClick, onPointerMove, onPointerLeave, ref, ...rest }: RowProps) {
  const ctx = useMenu("DropdownMenuItem")

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event)
    if (disabled || event.defaultPrevented) return
    onActivate?.()
    const selectEvent = new Event("atlas.select", { cancelable: true })
    onSelect?.(selectEvent)
    if (!selectEvent.defaultPrevented && !keepOpenOnSelect) {
      ctx.closeRoot()
      ctx.triggerRef.current?.focus()
    }
  }

  return (
    <div
      {...rest}
      ref={ref}
      role={role}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      className={cx(styles.item, className)}
      onClick={handleClick}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        // Pointer highlights a row the same way the keyboard does.
        if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true })
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        const panel = event.currentTarget.closest<HTMLElement>(`[${CONTENT_ATTR}]`)
        if (panel && document.activeElement === event.currentTarget) panel.focus({ preventScroll: true })
      }}
    />
  )
}

export function DropdownMenuItem({ destructive = false, icon, shortcut, disabled, children, className, ...rest }: DropdownMenuItemProps) {
  return (
    <Row {...rest} role="menuitem" disabled={disabled} className={cx(destructive && styles.destructive, className)} data-destructive={destructive ? "" : undefined}>
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {shortcut ? <span className={styles.shortcut}>{shortcut}</span> : null}
    </Row>
  )
}

export function DropdownMenuCheckboxItem({ checked = false, onCheckedChange, shortcut, disabled, children, className, ...rest }: DropdownMenuCheckboxItemProps) {
  return (
    <Row
      {...rest}
      role="menuitemcheckbox"
      aria-checked={checked}
      disabled={disabled}
      data-state={checked ? "checked" : "unchecked"}
      className={cx(styles.inset, className)}
      onActivate={() => onCheckedChange?.(!checked)}
    >
      <span className={styles.indicator} aria-hidden="true">{checked ? <CheckGlyph /> : null}</span>
      <span className={styles.label}>{children}</span>
      {shortcut ? <span className={styles.shortcut}>{shortcut}</span> : null}
    </Row>
  )
}

export function DropdownMenuRadioGroup({ value, onValueChange, className, ...rest }: DropdownMenuRadioGroupProps) {
  const ctx = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange])
  return (
    <RadioContext.Provider value={ctx}>
      <div {...rest} role="group" className={cx(styles.group, className)} />
    </RadioContext.Provider>
  )
}

export function DropdownMenuRadioItem({ value, shortcut, disabled, children, className, ...rest }: DropdownMenuRadioItemProps) {
  const radio = React.useContext(RadioContext)
  const checked = radio?.value === value
  return (
    <Row
      {...rest}
      role="menuitemradio"
      aria-checked={checked}
      disabled={disabled}
      data-state={checked ? "checked" : "unchecked"}
      className={cx(styles.inset, className)}
      onActivate={() => radio?.onValueChange?.(value)}
    >
      <span className={styles.indicator} aria-hidden="true">{checked ? <span className={styles.dot} /> : null}</span>
      <span className={styles.label}>{children}</span>
      {shortcut ? <span className={styles.shortcut}>{shortcut}</span> : null}
    </Row>
  )
}

/* ── Label · Group · Separator ──────────────────────────────────── */

export function DropdownMenuLabel({ className, ...rest }: DropdownMenuLabelProps) {
  return <div {...rest} className={cx(styles.menuLabel, className)} />
}

export function DropdownMenuGroup({ className, ...rest }: DropdownMenuGroupProps) {
  return <div {...rest} role="group" className={cx(styles.group, className)} />
}

export function DropdownMenuSeparator({ className, ...rest }: DropdownMenuSeparatorProps) {
  return <Divider {...rest} className={cx(styles.separator, className)} />
}

/* ── Submenu ────────────────────────────────────────────────────── */

export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  const parent = useMenu("DropdownMenuSub")
  const [open, setOpen] = useOpenState({})
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const focusIntent = React.useRef<"first" | "last" | "content">("content")
  const baseId = React.useId()
  const value = React.useMemo<MenuContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      triggerId: `${baseId}-trigger`,
      contentId: `${baseId}-content`,
      focusIntent,
      closeRoot: parent.closeRoot,
      isSub: true,
    }),
    [open, setOpen, baseId, parent.closeRoot],
  )
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function DropdownMenuSubTrigger({ icon, disabled, children, className, ref, onKeyDown, onPointerEnter, onBlur, ...rest }: DropdownMenuSubTriggerProps) {
  const ctx = useMenu("DropdownMenuSubTrigger")
  const rowRef = React.useRef<HTMLDivElement | null>(null)

  const openSub = (intent: "first" | "content") => {
    if (disabled) return
    ctx.focusIntent.current = intent
    ctx.setOpen(true)
  }

  return (
    <div
      {...rest}
      ref={(node) => {
        rowRef.current = node
        ctx.triggerRef.current = node
        setRef(ref, node)
      }}
      id={ctx.triggerId}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.contentId : undefined}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      data-state={ctx.open ? "open" : "closed"}
      className={cx(styles.item, className)}
      onClick={(event) => {
        rest.onClick?.(event)
        if (!event.defaultPrevented) openSub("first")
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        openSub("content")
      }}
      onPointerMove={(event) => {
        rest.onPointerMove?.(event)
        if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true })
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || disabled) return
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
        if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
          event.preventDefault()
          event.stopPropagation()
          openSub("first")
        }
      }}
      onBlur={(event) => {
        onBlur?.(event)
        // Focus moving to another row of the parent panel closes the submenu;
        // moving into the submenu itself keeps it open.
        const next = event.relatedTarget as Element | null
        if (!ctx.open || !next) return
        if (next.closest(`[id="${ctx.contentId}"]`)) return
        ctx.setOpen(false)
      }}
    >
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      <span className={styles.chevron} aria-hidden="true"><ChevronRightGlyph /></span>
    </div>
  )
}

export function DropdownMenuSubContent(props: DropdownMenuSubContentProps) {
  return <Panel {...props} side="inline-end" variant="sub" />
}
