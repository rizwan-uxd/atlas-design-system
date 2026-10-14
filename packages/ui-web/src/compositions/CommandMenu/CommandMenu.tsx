"use client"

/**
 * Atlas CommandMenu — a search field over a grouped list of commands, in a Dialog
 *
 * Figma:      Command Menu (Size × State), a Results slot in the default state
 * Sizes:      md | lg (the Dialog widths)
 * States:     default (results) · empty (no match) · loading (`loading`)
 *
 * Compound API:
 *   <CommandMenu open onOpenChange={...}>
 *     <CommandMenuContent label="Command menu" placeholder="Search commands...">
 *       <CommandMenuGroup heading="Suggestions">
 *         <CommandMenuItem icon={<Plus />} shortcut="⌘N" onSelect={...}>New document</CommandMenuItem>
 *       </CommandMenuGroup>
 *     </CommandMenuContent>
 *   </CommandMenu>
 *
 * Opens with Cmd or Ctrl + K (`hotkey`, set it to false to turn that off). Typing filters the items
 * (`filter`, or false when the list is filtered elsewhere); Arrow Up and Down, Home and End move the
 * highlighted row, Enter runs it and Escape closes. An item closes the menu when it runs, unless
 * `closeOnSelect` is false.
 *
 * Accessibility:
 *   - Dialog supplies the focus trap, scroll lock, Escape and aria-modal
 *   - The search field is a combobox over a listbox; the highlighted row is aria-activedescendant
 *   - Groups are named by their heading; "no results" and loading are announced as status
 *   - Reduced motion is honoured by Dialog
 */

import React from "react"
import { Search } from "lucide-react"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Divider } from "@atlas/ui-web/primitives/Divider/Divider"
import { Spinner } from "@atlas/ui-web/primitives/Spinner/Spinner"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../Dialog/Dialog"
import styles from "./CommandMenu.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type CommandMenuSize = "md" | "lg"

export type CommandMenuFilter = (value: string, query: string, keywords?: string[]) => boolean

/* ── Helpers ────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

const defaultFilter: CommandMenuFilter = (value, query, keywords) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [value, ...(keywords ?? [])].some((text) => text.toLowerCase().includes(q))
}

/* ── Context ────────────────────────────────────────────────── */

const RootContext = React.createContext<{ setOpen: (open: boolean) => void } | null>(null)

interface ListContextValue {
  query: string
  filter: CommandMenuFilter | null
  activeId: string | null
  setActiveId: (id: string) => void
  closeOnSelect: boolean
  close: () => void
}

const ListContext = React.createContext<ListContextValue | null>(null)

function useList(): ListContextValue {
  const ctx = React.useContext(ListContext)
  if (!ctx) throw new Error("CommandMenuItem and CommandMenuGroup must be used inside CommandMenuContent")
  return ctx
}

/* ── CommandMenu root ───────────────────────────────────────── */

export interface CommandMenuProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Key pressed with Cmd or Ctrl to toggle the menu; false turns the shortcut off */
  hotkey?: string | false
  children?: React.ReactNode
}

export function CommandMenu({ open: openProp, defaultOpen = false, onOpenChange, hotkey = "k", children }: CommandMenuProps) {
  const [inner, setInner] = React.useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : inner

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setInner(next)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  React.useEffect(() => {
    if (hotkey === false) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey.toLowerCase()) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [hotkey, open, setOpen])

  return (
    <RootContext.Provider value={{ setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </RootContext.Provider>
  )
}

/* ── CommandMenuContent ─────────────────────────────────────── */

export interface CommandMenuContentProps {
  size?: CommandMenuSize
  /** Accessible name of the menu and of the search field */
  label?: string
  placeholder?: string
  /** Controlled search text */
  value?: string
  /** Initial search text when uncontrolled */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** How an item matches the search text; false shows every item (filter the list yourself) */
  filter?: CommandMenuFilter | false
  /** Shows a spinner in place of the results */
  loading?: boolean
  /** Shown when nothing matches */
  emptyText?: string
  /** Close the menu when an item runs (default true) */
  closeOnSelect?: boolean
  className?: string
  children?: React.ReactNode
}

export function CommandMenuContent({ size = "md", className, ...panel }: CommandMenuContentProps) {
  return (
    <DialogContent size={size} className={cx(styles.menu, className)}>
      <CommandMenuPanel {...panel} />
    </DialogContent>
  )
}

/* The state lives below DialogContent: Radix mounts its portal one pass later, and the
   highlighted row is worked out from the rows once they exist. */
function CommandMenuPanel({
  label = "Command menu",
  placeholder = "Search commands...",
  value: valueProp,
  defaultValue = "",
  onValueChange,
  filter = defaultFilter,
  loading = false,
  emptyText = "No results found",
  closeOnSelect = true,
  children,
}: Omit<CommandMenuContentProps, "size" | "className">) {
  const root = React.useContext(RootContext)
  const listId = React.useId()
  const listRef = React.useRef<HTMLDivElement>(null)

  const [innerQuery, setInnerQuery] = React.useState(defaultValue)
  const query = valueProp !== undefined ? valueProp : innerQuery
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [visibleCount, setVisibleCount] = React.useState(0)

  const options = (): HTMLElement[] =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([hidden]):not([aria-disabled="true"])') ?? [])

  /* Keep the highlighted row on a row that is still shown, and count the rows that match.
     The rows come from `children` and the search text, so it re-runs when either changes. */
  React.useLayoutEffect(() => {
    setVisibleCount(listRef.current?.querySelectorAll('[role="option"]:not([hidden])').length ?? 0)
    const rows = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([hidden]):not([aria-disabled="true"])') ?? [],
    )
    if (!rows.some((row) => row.id === activeId)) setActiveId(rows[0]?.id ?? null)
  }, [activeId, children, query, loading])

  const move = (to: (rows: HTMLElement[], index: number) => number) => {
    const rows = options()
    if (rows.length === 0) return
    const next = rows[to(rows, rows.findIndex((row) => row.id === activeId))]
    setActiveId(next.id)
    next.scrollIntoView?.({ block: "nearest" })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      move((rows, i) => (i + 1) % rows.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      move((rows, i) => (i <= 0 ? rows.length - 1 : i - 1))
    } else if (e.key === "Home") {
      e.preventDefault()
      move(() => 0)
    } else if (e.key === "End") {
      e.preventDefault()
      move((rows) => rows.length - 1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      options().find((row) => row.id === activeId)?.click()
    }
  }

  const onQueryChange = (next: string) => {
    if (valueProp === undefined) setInnerQuery(next)
    onValueChange?.(next)
  }

  const context: ListContextValue = {
    query,
    filter: filter === false ? null : filter,
    activeId,
    setActiveId,
    closeOnSelect,
    close: () => root?.setOpen(false),
  }

  return (
    <>
      <DialogTitle className={styles.srOnly}>{label}</DialogTitle>
      <DialogDescription className={styles.srOnly}>
        Type to search. Use the arrow keys to choose a command and Enter to run it.
      </DialogDescription>

      <div className={styles.search}>
        <Input
          variant="unstyled"
          size="md"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          leadingIcon={<Search aria-hidden="true" />}
          role="combobox"
          aria-label={label}
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId ?? undefined}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <Divider decorative />

      <div className={styles.results} aria-busy={loading || undefined}>
        <ListContext.Provider value={context}>
          <div ref={listRef} id={listId} role="listbox" aria-label={label} hidden={loading}>
            {children}
          </div>
        </ListContext.Provider>
        {loading && (
          <div className={styles.status}>
            <Spinner size="sm" label="Loading" />
          </div>
        )}
        {!loading && visibleCount === 0 && (
          <div className={cx(styles.status, styles.empty)} role="status">
            {emptyText}
          </div>
        )}
      </div>
    </>
  )
}

/* ── CommandMenuGroup ───────────────────────────────────────── */

export interface CommandMenuGroupProps extends Omit<React.ComponentProps<"div">, "role"> {
  /** Heading shown above the group's items */
  heading?: React.ReactNode
}

export function CommandMenuGroup({ heading, className, children, ...rest }: CommandMenuGroupProps) {
  const headingId = React.useId()
  return (
    <div {...rest} role="group" aria-labelledby={heading ? headingId : undefined} className={cx(styles.group, className)}>
      {heading && (
        <div id={headingId} className={styles.heading}>
          {heading}
        </div>
      )}
      {children}
    </div>
  )
}

/* ── CommandMenuItem ────────────────────────────────────────── */

export interface CommandMenuItemProps extends Omit<React.ComponentProps<"div">, "onSelect" | "role" | "id"> {
  /** Text the search matches; defaults to the children when they are a string */
  value?: string
  /** Extra words the search also matches */
  keywords?: string[]
  /** Icon shown before the label */
  icon?: React.ReactNode
  /** Shortcut hint shown at the end of the row, for example "⌘N" */
  shortcut?: string
  disabled?: boolean
  /** Runs on click or Enter; receives the item's value */
  onSelect?: (value: string) => void
}

export function CommandMenuItem({
  value,
  keywords,
  icon,
  shortcut,
  disabled = false,
  onSelect,
  onClick,
  onPointerMove,
  className,
  children,
  ...rest
}: CommandMenuItemProps) {
  const ctx = useList()
  const id = React.useId()
  const text = value ?? (typeof children === "string" ? children : "")
  const visible = ctx.filter ? ctx.filter(text, ctx.query, keywords) : true
  const active = ctx.activeId === id

  return (
    <div
      {...rest}
      id={id}
      role="option"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      hidden={!visible}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      className={cx(styles.item, className)}
      /* Focus stays in the search field; the row is reached with aria-activedescendant */
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
      onPointerMove={(e) => {
        onPointerMove?.(e)
        if (!disabled && !active) ctx.setActiveId(id)
      }}
      onClick={(e) => {
        onClick?.(e)
        if (disabled || e.defaultPrevented) return
        onSelect?.(text)
        if (ctx.closeOnSelect) ctx.close()
      }}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
    </div>
  )
}
