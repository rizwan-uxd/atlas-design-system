"use client"

/**
 * Atlas DatePicker — a field trigger that opens a calendar panel to pick a date, or a range
 *
 * Figma:      Date Picker (State × Placeholder) · .Date Picker / Date (day cell states, incl.
 *             range-start · range-middle · range-end) · Date Picker Calendar (single month) ·
 *             Date Picker Calendar (range) (shared nav, two months) ·
 *             Date Picker Calendar (dropdown) (Month/Year Select dropdowns instead of the text
 *             label, single mode only — <DatePickerContent captionLayout="dropdown" />) ·
 *             Examples — Input, Examples — Natural Language (DatePickerInput,
 *             DatePickerNaturalInput — Input compositions, no new Figma component set)
 * Sizes:      one size (Figma draws no Size variant)
 * States:     Trigger — default · hover · focus · open · disabled · invalid
 *             Date cell — default · hover · selected · today · outside-month · disabled ·
 *             range-start · range-middle · range-end
 * Sides:      bottom | top — the panel opens 4px off the trigger, like Select
 *
 * Anatomy (compound, like Select):
 *   <DatePicker value={date} onValueChange={setDate}>
 *     <DatePickerTrigger placeholder="Pick a date" />
 *     <DatePickerContent />
 *   </DatePicker>
 *
 *   <DatePicker mode="range" value={range} onValueChange={setRange}>
 *     <DatePickerTrigger placeholder="Pick a range" />
 *     <DatePickerContent />
 *   </DatePicker>
 *
 * Range mode: value/defaultValue become a [start, end] tuple (mirrors Slider's range pair,
 * DEC-023). The panel shows two adjacent months under one shared prev/next pair. The first
 * click sets the start and keeps the panel open; the second click orders [min, max], commits,
 * and closes — matching single-date's commit-and-close. There is no live hover preview of the
 * in-progress range (v1 scope); the picked start shows as a solid cell until the second date
 * is chosen. In range mode, a grid's outside-month cells are blank (not the adjacent month's
 * numbers) so the two months never show duplicate, ambiguously-clickable dates.
 *
 * DatePickerInput is a typed alternative to DatePickerTrigger — an Input paired with a trailing
 * calendar button, for when the exact typed value matters as much as picking from the grid:
 *   <DatePicker value={date} onValueChange={setDate}>
 *     <DatePickerInput placeholder="Pick a date" />
 *     <DatePickerContent />
 *   </DatePicker>
 *
 * DatePickerNaturalInput is a free-text alternative — chrono-node parses phrases like "in 2
 * days" or "next Friday" live for a preview line, commits on blur/Enter, and opens the panel
 * on focus as a persistent visual reference:
 *   <DatePicker value={date} onValueChange={setDate}>
 *     <DatePickerNaturalInput />
 *     <DatePickerContent />
 *   </DatePicker>
 *
 * Accessibility (APG date picker grid pattern):
 *   - Trigger: aria-haspopup="dialog", aria-expanded, formatted date/range or placeholder text.
 *   - Panel: role="dialog" aria-label="Choose date"/"Choose date range", portalled to <body>.
 *   - Grid: role="grid" of role="row" of role="gridcell" day buttons; a single cell holds
 *     roving tabIndex 0 (the focused date), every other cell is -1. In range mode, arrow
 *     navigation crosses freely between the two grids (both live in one keyboard scope).
 *   - ArrowLeft/Right move a day, ArrowUp/Down a week, Home/End to the row's start/end,
 *     PageUp/PageDown a month (Shift+PageUp/PageDown a year). Enter/Space selects.
 *   - Escape closes and returns focus to the trigger; also clears an in-progress range draft.
 *   - Outside pointer press closes (and clears a draft).
 *   - Disabled cells (outside min/max) are skipped by all of the above and cannot be selected.
 *   - The visible month heading(s) are aria-live="polite" so month changes are announced.
 *   - No motion: Figma draws none.
 *
 * Built without a popover dependency: the panel is portalled to <body> and anchored to the
 * trigger, the same pattern as Select and DropdownMenu (no Popover primitive is installed).
 */

import React from "react"
import { createPortal } from "react-dom"
import { Calendar as CalendarGlyph, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import * as chrono from "chrono-node"
import { Input } from "../../primitives/Input/Input"
import styles from "./DatePicker.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type DatePickerSide = "bottom" | "top"
export type DatePickerMode = "single" | "range"
/** A [start, end] pair. Either end may be undefined while a range is still being composed. */
export type DatePickerRange = [Date | undefined, Date | undefined]

interface DatePickerSingleProps {
  mode?: "single"
  /** Controlled selected date. */
  value?: Date
  /** Initial selected date when uncontrolled. */
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
}

interface DatePickerRangeProps {
  mode: "range"
  /** Controlled [start, end] range. */
  value?: DatePickerRange
  /** Initial range when uncontrolled. */
  defaultValue?: DatePickerRange
  onValueChange?: (range: DatePickerRange) => void
}

export type DatePickerProps = (DatePickerSingleProps | DatePickerRangeProps) & {
  /** Earliest selectable date, inclusive. */
  min?: Date
  /** Latest selectable date, inclusive. */
  max?: Date
  disabled?: boolean
  /** Hidden input name(s) for native form participation (ISO date; range writes `${name}-start`/`${name}-end`). */
  name?: string
  required?: boolean
  children?: React.ReactNode
}

export interface DatePickerTriggerProps extends Omit<React.ComponentProps<"button">, "children"> {
  /** Marks the control as invalid. */
  invalid?: boolean
  /** Shown when no date (or no range start) is selected. */
  placeholder?: string
  /** Formats the selected date for display in single mode. Defaults to a long localized date. */
  formatDate?: (date: Date) => string
  /** Formats the selected range for display in range mode. Defaults to "{start} – {end}". */
  formatRange?: (range: DatePickerRange) => string
  /** Leading icon. `true` shows the default calendar glyph (the range mode default); a node overrides it; `false` hides it. */
  icon?: boolean | React.ReactNode
}

export interface DatePickerContentProps extends React.ComponentProps<"div"> {
  side?: DatePickerSide
  /** "label" (default) shows "Month Year" text with prev/next arrows, matching Figma's plain
      header. "dropdown" swaps it for Month/Year <select> dropdowns for fast long-range
      navigation (birthdates) — single mode only; range mode ignores this and stays "label". */
  captionLayout?: "label" | "dropdown"
  /** [min, max] year for the dropdown caption's year <select>. Defaults to 100 years back
      to 10 years forward from today. */
  yearRange?: [number, number]
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value)
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(undefined, { month: "long" }))

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function compareDay(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime()
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

function addYears(d: Date, n: number): Date {
  return new Date(d.getFullYear() + n, d.getMonth(), d.getDate())
}

function isBeforeDay(a: Date, b: Date): boolean {
  return compareDay(a, b) < 0
}

function isAfterDay(a: Date, b: Date): boolean {
  return compareDay(a, b) > 0
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Full weeks (Sunday-start) covering `month`. */
function buildWeeks(month: Date): Date[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const gridStart = addDays(first, -first.getDay())
  const gridEnd = addDays(last, 6 - last.getDay())

  const days: Date[] = []
  for (let d = gridStart; d.getTime() <= gridEnd.getTime(); d = addDays(d, 1)) days.push(d)

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

function defaultFormatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
}

function defaultFormatRangeDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })
}

function defaultFormatRange([start, end]: DatePickerRange): string {
  if (!start) return ""
  if (!end) return defaultFormatRangeDate(start)
  return `${defaultFormatRangeDate(start)} – ${defaultFormatRangeDate(end)}`
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/* ── Context ────────────────────────────────────────────────────── */

interface DatePickerContextValue {
  mode: DatePickerMode
  open: boolean
  setOpen: (open: boolean) => void
  value: Date | DatePickerRange | undefined
  /** Range mode only: the first-picked date, while waiting for the second click. */
  draftStart: Date | null
  onSelect: (date: Date) => void
  min: Date | undefined
  max: Date | undefined
  disabled: boolean
  triggerRef: React.MutableRefObject<HTMLElement | null>
  triggerId: string
  contentId: string
  /** Where focus goes when the panel opens: the selected date, today, or the panel itself. */
  focusIntent: React.MutableRefObject<"selected" | "today" | "content">
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(null)

function useDatePicker(part: string): DatePickerContextValue {
  const ctx = React.useContext(DatePickerContext)
  if (!ctx) throw new Error(`${part} must be used inside <DatePicker>`)
  return ctx
}

/** Single mode → the value itself; range mode → its start. Used to pick an initial focus/month. */
function primaryDate(ctx: Pick<DatePickerContextValue, "mode" | "value">): Date | undefined {
  if (ctx.mode === "range") return (ctx.value as DatePickerRange | undefined)?.[0]
  return ctx.value as Date | undefined
}

/** A fully-picked [start, end] range, ordered low → high. Null while incomplete. */
function committedRange(ctx: Pick<DatePickerContextValue, "mode" | "value">): [Date, Date] | null {
  if (ctx.mode !== "range") return null
  const range = ctx.value as DatePickerRange | undefined
  if (!range?.[0] || !range?.[1]) return null
  return compareDay(range[0], range[1]) <= 0 ? [range[0], range[1]] : [range[1], range[0]]
}

/* ── DatePicker (root) ──────────────────────────────────────────── */

export function DatePicker(props: DatePickerProps) {
  const { min, max, disabled = false, name, required, children } = props
  const mode: DatePickerMode = props.mode ?? "single"
  const singleProps = props as DatePickerSingleProps
  const rangeProps = props as DatePickerRangeProps

  const [innerSingle, setInnerSingle] = React.useState<Date | undefined>(mode === "single" ? singleProps.defaultValue : undefined)
  const [innerRange, setInnerRange] = React.useState<DatePickerRange | undefined>(mode === "range" ? rangeProps.defaultValue : undefined)
  const [draftStart, setDraftStart] = React.useState<Date | null>(null)
  const [open, setOpenRaw] = React.useState(false)

  const controlledSingle = mode === "single" && singleProps.value !== undefined
  const controlledRange = mode === "range" && rangeProps.value !== undefined
  const singleValue = controlledSingle ? singleProps.value : innerSingle
  const rangeValue = controlledRange ? rangeProps.value : innerRange
  const value: Date | DatePickerRange | undefined = mode === "range" ? rangeValue : singleValue

  const triggerRef = React.useRef<HTMLElement | null>(null)
  const focusIntent = React.useRef<"selected" | "today" | "content">("selected")
  const baseId = React.useId()

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (disabled && next) return
      if (!next) setDraftStart(null)
      setOpenRaw(next)
    },
    [disabled],
  )

  const onSelectSingle = React.useCallback(
    (date: Date) => {
      if (!controlledSingle) setInnerSingle(date)
      singleProps.onValueChange?.(date)
      setOpenRaw(false)
      triggerRef.current?.focus()
    },
    [controlledSingle, singleProps.onValueChange],
  )

  const onSelectRangeDay = React.useCallback(
    (date: Date) => {
      if (draftStart == null) {
        setDraftStart(date)
        return
      }
      const next: DatePickerRange = compareDay(date, draftStart) >= 0 ? [draftStart, date] : [date, draftStart]
      if (!controlledRange) setInnerRange(next)
      rangeProps.onValueChange?.(next)
      setDraftStart(null)
      setOpenRaw(false)
      triggerRef.current?.focus()
    },
    [draftStart, controlledRange, rangeProps.onValueChange],
  )

  const onSelect = mode === "range" ? onSelectRangeDay : onSelectSingle

  const ctx = React.useMemo<DatePickerContextValue>(
    () => ({
      mode,
      open,
      setOpen,
      value,
      draftStart,
      onSelect,
      min,
      max,
      disabled,
      triggerRef,
      triggerId: `${baseId}-trigger`,
      contentId: `${baseId}-dialog`,
      focusIntent,
    }),
    [mode, open, setOpen, value, draftStart, onSelect, min, max, disabled, baseId],
  )

  const hiddenInputs =
    mode === "range"
      ? name && (
          <React.Fragment>
            <input type="hidden" name={`${name}-start`} value={(value as DatePickerRange | undefined)?.[0] ? toISODate((value as DatePickerRange)[0] as Date) : ""} aria-hidden="true" />
            <input type="hidden" name={`${name}-end`} value={(value as DatePickerRange | undefined)?.[1] ? toISODate((value as DatePickerRange)[1] as Date) : ""} aria-hidden="true" />
          </React.Fragment>
        )
      : name && <input type="hidden" name={name} value={value ? toISODate(value as Date) : ""} aria-hidden="true" />

  const hasValue = mode === "range" ? Boolean((value as DatePickerRange | undefined)?.[0] && (value as DatePickerRange | undefined)?.[1]) : Boolean(value)

  return (
    <DatePickerContext.Provider value={ctx}>
      {children}
      {hiddenInputs}
      {required && !hasValue && (
        <input
          type="text"
          required
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }}
          value=""
          onChange={() => {}}
        />
      )}
    </DatePickerContext.Provider>
  )
}

/* ── DatePickerTrigger ──────────────────────────────────────────── */

export function DatePickerTrigger({
  invalid = false,
  placeholder = "Pick a date",
  formatDate = defaultFormatDate,
  formatRange = defaultFormatRange,
  icon,
  className,
  onClick,
  onKeyDown,
  ref,
  ...rest
}: DatePickerTriggerProps) {
  const ctx = useDatePicker("DatePickerTrigger")
  const anchor = primaryDate(ctx)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.defaultPrevented) return
    ctx.focusIntent.current = anchor ? "selected" : "today"
    ctx.setOpen(!ctx.open)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.defaultPrevented) return
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      ctx.focusIntent.current = anchor ? "selected" : "today"
      ctx.setOpen(true)
    }
  }

  const showIcon = icon ?? ctx.mode === "range"
  const iconNode = showIcon ? (icon !== true && icon !== undefined && icon !== false ? icon : <CalendarGlyph />) : null

  let text: string = placeholder
  let showsPlaceholder = true
  if (ctx.mode === "range") {
    const range = ctx.value as DatePickerRange | undefined
    if (range?.[0]) {
      text = formatRange(range)
      showsPlaceholder = false
    }
  } else {
    const date = ctx.value as Date | undefined
    if (date) {
      text = formatDate(date)
      showsPlaceholder = false
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
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.contentId : undefined}
      aria-invalid={invalid || undefined}
      disabled={ctx.disabled || rest.disabled}
      className={cx(styles.trigger, className)}
      onClick={(event) => {
        onClick?.(event)
        handleClick(event)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        handleKeyDown(event)
      }}
    >
      {iconNode && (
        <span className={styles.icon} aria-hidden="true">
          {iconNode}
        </span>
      )}
      <span className={cx(styles.value, showsPlaceholder && styles.placeholder)}>{text}</span>
    </button>
  )
}

/* ── DatePickerInput (typed alternative to DatePickerTrigger) ──── */

function defaultParseDate(text: string): Date | undefined {
  const trimmed = text.trim()
  if (!trimmed) return undefined
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export interface DatePickerInputProps extends Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue" | "trailingIcon"> {
  /** Parses typed text into a Date. Defaults to `new Date(text)`, locale-fragile — override for
      a stricter/locale-aware parse. Returns undefined for unparseable text. */
  parseDate?: (text: string) => Date | undefined
  /** Formats the selected date into the field's text. Defaults to a long localized date. In
      range mode this only shows the range's start — use DatePickerTrigger + formatRange for a
      full range display; DatePickerInput is a single-value field by design. */
  formatDate?: (date: Date) => string
}

/** Pairs an Input with the calendar: type a date directly, or open the panel via the trailing
    calendar button. Commits on blur or Enter; unparseable text sets aria-invalid without being
    discarded, so the caller can fix a typo instead of losing it. */
export function DatePickerInput({ parseDate = defaultParseDate, formatDate = defaultFormatDate, placeholder = "Pick a date", invalid, onChange, onBlur, onKeyDown, className, ...rest }: DatePickerInputProps) {
  const ctx = useDatePicker("DatePickerInput")
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const anchor = primaryDate(ctx)
  const [text, setText] = React.useState(() => (anchor ? formatDate(anchor) : ""))
  const [dirty, setDirty] = React.useState(false)
  const [parseError, setParseError] = React.useState(false)

  React.useEffect(() => {
    if (dirty) return
    setText(anchor ? formatDate(anchor) : "")
    setParseError(false)
    // Only re-sync from the committed value while the field isn't being actively edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, dirty])

  React.useEffect(() => {
    // Input does not forward a ref (repo convention: reach it by id/DOM query), so the trigger
    // anchor and focus-restore target are the underlying <input>, found once after mount.
    const inputEl = wrapperRef.current?.querySelector("input")
    if (inputEl) ctx.triggerRef.current = inputEl
  }, [ctx.triggerRef])

  const commit = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setParseError(false)
      setDirty(false)
      return
    }
    const parsed = parseDate(trimmed)
    if (!parsed) {
      setParseError(true)
      return
    }
    setParseError(false)
    setDirty(false)
    ctx.onSelect(parsed)
  }

  return (
    <div ref={wrapperRef} className={styles.inputWrapper}>
      <Input
        {...rest}
        value={text}
        placeholder={placeholder}
        invalid={parseError || invalid}
        className={cx(styles.inputField, className)}
        onChange={(event) => {
          onChange?.(event)
          setDirty(true)
          setText(event.target.value)
        }}
        onBlur={(event) => {
          onBlur?.(event)
          commit()
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.key === "Enter") {
            event.preventDefault()
            commit()
          } else if (event.key === "Escape" && ctx.open) {
            ctx.setOpen(false)
          }
        }}
      />
      <button
        type="button"
        className={styles.inputTrailingButton}
        aria-label="Open calendar"
        aria-haspopup="dialog"
        aria-expanded={ctx.open}
        aria-controls={ctx.open ? ctx.contentId : undefined}
        onClick={() => {
          ctx.focusIntent.current = anchor ? "selected" : "today"
          ctx.setOpen(!ctx.open)
        }}
      >
        <CalendarGlyph aria-hidden="true" />
      </button>
    </div>
  )
}

/* ── DatePickerNaturalInput (free-text, parsed via chrono-node) ─── */

function defaultParseNaturalText(text: string): Date | undefined {
  const parsed = chrono.parseDate(text)
  return parsed ?? undefined
}

function defaultRenderPreview(date: Date | undefined): React.ReactNode {
  if (!date) return null
  return `Selected: ${defaultFormatDate(date)}`
}

export interface DatePickerNaturalInputProps extends Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue"> {
  /** Parses free text ("in 2 days", "next Friday") into a Date. Defaults to chrono-node's
      parseDate. Returns undefined for text chrono cannot resolve to a date. */
  parseText?: (text: string) => Date | undefined
  /** Renders a live preview below the field as the text changes — chrono re-parses on every
      keystroke so the preview always reflects the current text, independent of commit. Return
      null to render nothing. Defaults to "Selected: {formatted date}". */
  renderPreview?: (date: Date | undefined) => React.ReactNode
}

/** A free-text alternative to DatePickerTrigger: types a phrase, chrono-node parses it live for
    the preview line, and the parsed date commits on blur or Enter — the same commit timing as
    DatePickerInput, so only the preview text is live, not the calendar's selected cell. Opens
    the panel on focus for a persistent visual reference while typing (matches the reference);
    the panel's own outside-pointer-press and Escape handling close it as usual. */
export function DatePickerNaturalInput({
  parseText = defaultParseNaturalText,
  renderPreview = defaultRenderPreview,
  placeholder = "e.g. \"in 2 days\", \"next Friday\"",
  invalid,
  onChange,
  onBlur,
  onKeyDown,
  onFocus,
  className,
  ...rest
}: DatePickerNaturalInputProps) {
  const ctx = useDatePicker("DatePickerNaturalInput")
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const [text, setText] = React.useState("")
  const [parseError, setParseError] = React.useState(false)
  const preview = React.useMemo(() => (text.trim() ? parseText(text) : undefined), [text, parseText])
  /** Guards against a focus/reopen loop: onSelect refocuses the trigger element after a commit
      (shared behaviour with every other trigger type), but here the trigger's own onFocus
      reopens the panel — without this guard that reopen steals focus to the dialog, which
      blurs this field and fires a second, spurious commit. Set right before onSelect, consumed
      by the very next focus event (the synchronous refocus), so a genuine later focus (tabbing
      back in) is unaffected. */
  const justCommittedRef = React.useRef(false)

  React.useEffect(() => {
    const inputEl = wrapperRef.current?.querySelector("input")
    if (inputEl) ctx.triggerRef.current = inputEl
  }, [ctx.triggerRef])

  const commit = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setParseError(false)
      return
    }
    const parsed = parseText(trimmed)
    if (!parsed) {
      setParseError(true)
      return
    }
    setParseError(false)
    justCommittedRef.current = true
    ctx.onSelect(parsed)
  }

  return (
    <div ref={wrapperRef} className={cx(styles.naturalWrapper, className)}>
      <Input
        {...rest}
        value={text}
        placeholder={placeholder}
        invalid={parseError || invalid}
        onChange={(event) => {
          onChange?.(event)
          setParseError(false)
          setText(event.target.value)
        }}
        onFocus={(event) => {
          onFocus?.(event)
          if (justCommittedRef.current) {
            justCommittedRef.current = false
            return
          }
          ctx.focusIntent.current = "content"
          ctx.setOpen(true)
        }}
        onBlur={(event) => {
          onBlur?.(event)
          commit()
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.key === "Enter") {
            event.preventDefault()
            commit()
          } else if (event.key === "Escape" && ctx.open) {
            ctx.setOpen(false)
          }
        }}
      />
      {renderPreview(preview) != null && <p className={styles.naturalPreview}>{renderPreview(preview)}</p>}
    </div>
  )
}

/* ── DatePickerContent (panel: header + weekdays + grid) ───────── */

export function DatePickerContent({ side = "bottom", captionLayout = "label", yearRange, className, onKeyDown, ref, ...rest }: DatePickerContentProps) {
  const ctx = useDatePicker("DatePickerContent")
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [position, setPosition] = React.useState<React.CSSProperties | null>(null)
  const today = React.useMemo(() => startOfDay(new Date()), [])
  const [month, setMonth] = React.useState(() => primaryDate(ctx) ?? today)
  const [focusedDate, setFocusedDate] = React.useState(() => primaryDate(ctx) ?? today)
  const isRange = ctx.mode === "range"
  /** Dropdown caption is a single-month header layout; range's shared two-month nav keeps "label". */
  const useDropdownCaption = captionLayout === "dropdown" && !isRange
  const [yearMin, yearMax] = yearRange ?? [today.getFullYear() - 100, today.getFullYear() + 10]
  const yearOptions = React.useMemo(() => {
    const years: number[] = []
    for (let y = yearMax; y >= yearMin; y--) years.push(y)
    return years
  }, [yearMin, yearMax])
  /** Set by `focusDate` (arrow/page navigation) — moved to a ref instead of requestAnimationFrame
      so the DOM .focus() call runs deterministically after the month/focusedDate state that may
      remount the target cell has committed, not on the next paint. */
  const pendingFocusRef = React.useRef<string | null>(null)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    if (!ctx.open) return
    const next = primaryDate(ctx) ?? today
    setMonth(next)
    setFocusedDate(next)
    // Re-anchor only when the panel opens or the committed value changes — not on every
    // draftStart update, so picking the range end doesn't yank the visible months around.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.open, ctx.value, today])

  const place = React.useCallback(() => {
    const trigger = ctx.triggerRef.current
    if (!trigger) return
    const rtl = getComputedStyle(trigger).direction === "rtl"
    const rect = trigger.getBoundingClientRect()
    const next: React.CSSProperties = {}
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
    const intent = ctx.focusIntent.current
    if (intent === "content") {
      content.focus()
    } else {
      const target = intent === "selected" && primaryDate(ctx) ? (primaryDate(ctx) as Date) : today
      const cell = content.querySelector<HTMLElement>(`[data-date="${toISODate(target)}"]`)
      cell?.focus()
    }
    ctx.focusIntent.current = "content"
    // Only when the panel first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.open, mounted, position !== null])

  React.useEffect(() => {
    if (!ctx.open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (ctx.triggerRef.current?.contains(target)) return
      if ((target as Element).closest?.(`#${CSS.escape(ctx.contentId)}`)) return
      ctx.setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [ctx])

  /** Runs after the month/focusedDate state `focusDate` set has committed (and possibly
      remounted the grid into a new month), so the target cell reliably exists by the time
      we look it up — unlike a requestAnimationFrame callback, which isn't tied to React's
      commit and isn't flushed by test tooling. */
  React.useEffect(() => {
    if (!pendingFocusRef.current) return
    const iso = pendingFocusRef.current
    pendingFocusRef.current = null
    const cell = contentRef.current?.querySelector<HTMLElement>(`[data-date="${iso}"]`)
    cell?.focus()
  }, [focusedDate, month])

  if (!ctx.open || !mounted || typeof document === "undefined") return null

  const closeAndRestoreFocus = () => {
    ctx.setOpen(false)
    ctx.triggerRef.current?.focus()
  }

  const isDisabledDate = (d: Date) => (ctx.min ? isBeforeDay(d, ctx.min) : false) || (ctx.max ? isAfterDay(d, ctx.max) : false)

  const focusDate = (d: Date) => {
    setFocusedDate(d)
    const firstVisible = month
    const lastVisible = isRange ? addMonths(month, 1) : month
    const beforeFirst = d.getFullYear() < firstVisible.getFullYear() || (d.getFullYear() === firstVisible.getFullYear() && d.getMonth() < firstVisible.getMonth())
    const afterLast = d.getFullYear() > lastVisible.getFullYear() || (d.getFullYear() === lastVisible.getFullYear() && d.getMonth() > lastVisible.getMonth())
    if (beforeFirst) setMonth(addMonths(month, -1))
    else if (afterLast) setMonth(addMonths(month, 1))
    pendingFocusRef.current = toISODate(d)
  }

  const handleGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let next: Date | null = null
    switch (event.key) {
      case "ArrowLeft":
        next = addDays(focusedDate, -1)
        break
      case "ArrowRight":
        next = addDays(focusedDate, 1)
        break
      case "ArrowUp":
        next = addDays(focusedDate, -7)
        break
      case "ArrowDown":
        next = addDays(focusedDate, 7)
        break
      case "Home":
        next = addDays(focusedDate, -focusedDate.getDay())
        break
      case "End":
        next = addDays(focusedDate, 6 - focusedDate.getDay())
        break
      case "PageUp":
        next = event.shiftKey ? addYears(focusedDate, -1) : addMonths(focusedDate, -1)
        break
      case "PageDown":
        next = event.shiftKey ? addYears(focusedDate, 1) : addMonths(focusedDate, 1)
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (!isDisabledDate(focusedDate)) ctx.onSelect(focusedDate)
        return
      case "Escape":
        event.preventDefault()
        closeAndRestoreFocus()
        return
      default:
        return
    }
    if (next) {
      event.preventDefault()
      if (isDisabledDate(next)) return
      focusDate(next)
    }
  }

  const range = committedRange(ctx)

  function membership(day: Date): "start" | "middle" | "end" | null {
    if (!isRange) return null
    if (ctx.draftStart && !range && isSameDay(day, ctx.draftStart)) return "start"
    if (!range) return null
    const [start, end] = range
    if (isSameDay(day, start)) return "start"
    if (isSameDay(day, end)) return "end"
    if (compareDay(day, start) > 0 && compareDay(day, end) < 0) return "middle"
    return null
  }

  function renderMonthTable(monthDate: Date, heading: { id: string } | { label: string }) {
    const weeks = buildWeeks(monthDate)
    const headingProps = "id" in heading ? { "aria-labelledby": heading.id } : { "aria-label": heading.label }
    return (
      <table className={styles.grid} role="grid" {...headingProps}>
        <thead>
          <tr role="row">
            {WEEKDAYS.map((d, i) => (
              <th key={i} className={styles.weekday} scope="col" abbr={d}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => {
            const memberships = week.map((day) => (day.getMonth() === monthDate.getMonth() ? membership(day) : isRange ? null : membership(day)))
            const rowStartIndex = memberships.findIndex((m) => m != null)
            const rowEndIndex = memberships.length - 1 - [...memberships].reverse().findIndex((m) => m != null)
            return (
              <tr key={wi} role="row">
                {week.map((day, di) => {
                  const outside = day.getMonth() !== monthDate.getMonth()
                  if (outside && isRange) {
                    // Range mode: blank the adjacent-month padding so the two grids never
                    // show duplicate, ambiguously-clickable dates.
                    return <td key={toISODate(day)} className={styles.blankCell} aria-hidden="true" />
                  }
                  const selected = !isRange && ctx.value ? isSameDay(day, ctx.value as Date) : false
                  const isToday = isSameDay(day, today)
                  const isDisabled = isDisabledDate(day)
                  const isFocused = isSameDay(day, focusedDate)
                  const rangeState = membership(day)
                  const isRowStart = rowStartIndex === di
                  const isRowEnd = rowEndIndex === di
                  return (
                    <td key={toISODate(day)} role="gridcell" aria-selected={selected || rangeState != null}>
                      <button
                        type="button"
                        data-date={toISODate(day)}
                        className={styles.date}
                        data-outside={outside || undefined}
                        data-today={isToday || undefined}
                        data-selected={selected || undefined}
                        data-disabled={isDisabled || undefined}
                        data-range={rangeState ?? undefined}
                        data-range-row-start={(rangeState && isRowStart) || undefined}
                        data-range-row-end={(rangeState && isRowEnd) || undefined}
                        aria-disabled={isDisabled || undefined}
                        tabIndex={isFocused ? 0 : -1}
                        onFocus={() => setFocusedDate(day)}
                        onClick={() => {
                          if (isDisabled) return
                          ctx.onSelect(day)
                        }}
                      >
                        {day.getDate()}
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  const monthLabelId = `${ctx.contentId}-month`
  const monthLabelId2 = `${ctx.contentId}-month-2`
  const secondMonth = isRange ? addMonths(month, 1) : month

  return createPortal(
    <div
      {...rest}
      ref={(node) => {
        contentRef.current = node
        setRef(ref, node)
      }}
      id={ctx.contentId}
      role="dialog"
      aria-label={isRange ? "Choose date range" : "Choose date"}
      tabIndex={-1}
      data-side={side}
      className={cx(styles.content, className)}
      style={{ ...position, visibility: position ? undefined : "hidden", ...rest.style }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        handleGridKeyDown(event)
      }}
    >
      <div className={styles.header}>
        <button type="button" className={styles.navButton} aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))}>
          <ChevronLeft />
        </button>
        {useDropdownCaption ? (
          <>
            <span className={styles.captionField}>
              <select
                className={styles.captionSelect}
                aria-label="Month"
                value={month.getMonth()}
                onChange={(event) => setMonth(new Date(month.getFullYear(), Number(event.target.value), 1))}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.captionChevron} aria-hidden="true" />
            </span>
            <span className={styles.captionField}>
              <select
                className={styles.captionSelect}
                aria-label="Year"
                value={month.getFullYear()}
                onChange={(event) => setMonth(new Date(Number(event.target.value), month.getMonth(), 1))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.captionChevron} aria-hidden="true" />
            </span>
          </>
        ) : (
          <>
            <span id={monthLabelId} className={styles.monthLabel} aria-live="polite">
              {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            {isRange && (
              <span id={monthLabelId2} className={styles.monthLabel} aria-live="polite">
                {secondMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
            )}
          </>
        )}
        <button type="button" className={styles.navButton} aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))}>
          <ChevronRight />
        </button>
      </div>
      <div className={styles.grids}>
        {renderMonthTable(month, useDropdownCaption ? { label: month.toLocaleDateString(undefined, { month: "long", year: "numeric" }) } : { id: monthLabelId })}
        {isRange && renderMonthTable(secondMonth, { id: monthLabelId2 })}
      </div>
    </div>,
    document.body,
  )
}
