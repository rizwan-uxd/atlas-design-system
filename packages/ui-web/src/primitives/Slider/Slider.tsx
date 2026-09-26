"use client"

/**
 * Atlas Slider — pick a number, or a range between two numbers, by moving a thumb along a track.
 * Custom pointer-event implementation (no Radix, no native range input): a range needs two thumbs.
 *
 * Variants: none. Figma properties: Orientation horizontal | vertical, Range false | true,
 *   State default | disabled (the `orientation`, `range` and `disabled` props).
 * Size: the track is 4 thick (spacing-1) and fills its container along the axis; the thumb is 16
 *   (spacing-4) with a 44 touch hit area on the control (touch-min). Vertical runs bottom to top.
 * Values: `value`, `min`, `max` and `step` are props, never variants (DEC-003). Single = a number,
 *   range = [low, high]; the thumbs cannot cross. Label, value text, helper text, leading and
 *   trailing text are composed slots.
 * States: default · hover · focus-visible · dragging (looks like hover) · disabled.
 * Accessibility: each thumb is role="slider" with aria-valuemin / aria-valuemax / aria-valuenow
 *   (a range thumb's bounds are the other thumb), aria-valuetext when `getAriaValueText` is given and
 *   aria-orientation. Arrow keys step, PageUp / PageDown take 10 steps, Home / End jump to the
 *   thumb's bounds. RTL mirrors the horizontal track and its arrow keys. Named by `label`,
 *   aria-label or aria-labelledby; range thumbs are also named "Minimum" and "Maximum".
 *
 * Figma: Slider set 550:241 (Orientation, Range, State), internal .Slider / Bar 550:96 and
 * .Slider / Toggle 550:15. Track background-muted, fill and thumb border primary.
 */

import * as React from "react"
import styles from "./Slider.module.css"

export type SliderOrientation = "horizontal" | "vertical"

export interface SliderProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children" | "defaultValue" | "onChange" | "role" | "aria-label" | "aria-labelledby" | "aria-describedby"
  > {
  /** Two thumbs and a fill between them. `value` is then `[low, high]`. Default false. */
  range?: boolean
  /** Current value (controlled): a number, or `[low, high]` when `range`. */
  value?: number | [number, number]
  /** Initial value (uncontrolled). Default `min`, or `[min, max]` when `range`. */
  defaultValue?: number | [number, number]
  onValueChange?: (value: number | [number, number]) => void
  /** Default 0. */
  min?: number
  /** Default 100. */
  max?: number
  /** Default 1. */
  step?: number
  /** Default horizontal. Vertical runs bottom (min) to top (max). */
  orientation?: SliderOrientation
  disabled?: boolean
  /** Form field name; a range submits two values under the same name. */
  name?: string
  /** Text above the track; also the accessible name. */
  label?: React.ReactNode
  /** Value text beside the label, e.g. "50" or "30, 70". */
  valueLabel?: React.ReactNode
  /** Text below the track; linked with aria-describedby. */
  helperText?: React.ReactNode
  /** Text before the track (above it when vertical). */
  leading?: React.ReactNode
  /** Text after the track (below it when vertical). */
  trailing?: React.ReactNode
  /** Readable value for assistive tech, e.g. `(v) => `${v} degrees``. */
  getAriaValueText?: (value: number) => string
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
}

const PAGE_STEPS = 10

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
const decimals = (n: number) => String(n).split(".")[1]?.length ?? 0

function snap(v: number, min: number, max: number, step: number): number {
  const n = Math.round((v - min) / step)
  return clamp(Number((min + n * step).toFixed(Math.max(decimals(step), decimals(min)))), min, max)
}

function isRtl(el: Element | null): boolean {
  if (!el) return false
  return el.closest("[dir]")?.getAttribute("dir") === "rtl"
}

export function Slider({
  range = false,
  value: controlledValue,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  disabled = false,
  name,
  label,
  valueLabel,
  helperText,
  leading,
  trailing,
  getAriaValueText,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className,
  ...props
}: SliderProps) {
  const uid = React.useId()
  const labelId = `${uid}-label`
  const helperId = `${uid}-helper`
  const vertical = orientation === "vertical"

  const safeMax = max > min ? max : min + 1
  const safeStep = step > 0 ? step : 1

  const normalize = React.useCallback(
    (v: number | [number, number] | undefined): number[] => {
      const fix = (n: number) => snap(Number.isFinite(n) ? n : min, min, safeMax, safeStep)
      if (range) {
        const pair = Array.isArray(v) ? v : [min, safeMax]
        const a = fix(pair[0]), b = fix(pair[1])
        return a <= b ? [a, b] : [b, a]
      }
      return [fix(Array.isArray(v) ? v[0] : (v ?? min))]
    },
    [range, min, safeMax, safeStep],
  )

  const isControlled = controlledValue !== undefined
  const [internal, setInternal] = React.useState<number[]>(() => normalize(defaultValue))
  const values = isControlled ? normalize(controlledValue) : internal

  const commit = (next: number[]) => {
    if (next.length === values.length && next.every((n, i) => n === values[i])) return
    if (!isControlled) setInternal(next)
    onValueChange?.(range ? [next[0], next[1]] : next[0])
  }

  const setThumb = (index: number, raw: number) => {
    const lo = index === 1 ? values[0] : min
    const hi = index === 0 && range ? values[1] : safeMax
    const next = values.slice()
    next[index] = clamp(snap(raw, min, safeMax, safeStep), lo, hi)
    commit(next)
  }

  const controlRef = React.useRef<HTMLDivElement>(null)
  const thumbRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [dragging, setDragging] = React.useState<number | null>(null)

  const valueAt = (clientX: number, clientY: number): number => {
    const rect = controlRef.current!.getBoundingClientRect()
    let ratio: number
    if (vertical) ratio = rect.height ? 1 - (clientY - rect.top) / rect.height : 0
    else {
      ratio = rect.width ? (clientX - rect.left) / rect.width : 0
      if (isRtl(controlRef.current)) ratio = 1 - ratio
    }
    return min + clamp(ratio, 0, 1) * (safeMax - min)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return
    const v = valueAt(e.clientX, e.clientY)
    let index = 0
    if (range) {
      const [lo, hi] = values
      if (v <= lo) index = 0
      else if (v >= hi) index = 1
      else index = v - lo < hi - v ? 0 : 1
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(index)
    thumbRefs.current[index]?.focus({ preventScroll: true })
    setThumb(index, v)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging === null || disabled) return
    setThumb(dragging, valueAt(e.clientX, e.clientY))
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setDragging(null)
  }

  const onKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const lo = index === 1 ? values[0] : min
    const hi = index === 0 && range ? values[1] : safeMax
    const flip = !vertical && isRtl(e.currentTarget) ? -1 : 1
    let next: number | null = null
    switch (e.key) {
      case "ArrowRight": next = values[index] + safeStep * flip; break
      case "ArrowLeft": next = values[index] - safeStep * flip; break
      case "ArrowUp": next = values[index] + safeStep; break
      case "ArrowDown": next = values[index] - safeStep; break
      case "PageUp": next = values[index] + safeStep * PAGE_STEPS; break
      case "PageDown": next = values[index] - safeStep * PAGE_STEPS; break
      case "Home": next = lo; break
      case "End": next = hi; break
      default: return
    }
    e.preventDefault()
    setThumb(index, next)
  }

  const hasLabel = label !== undefined && label !== null && label !== false
  const hasValueLabel = valueLabel !== undefined && valueLabel !== null && valueLabel !== false
  const hasHelper = helperText !== undefined && helperText !== null && helperText !== false
  const hasLeading = leading !== undefined && leading !== null && leading !== false
  const hasTrailing = trailing !== undefined && trailing !== null && trailing !== false

  const nameSource = ariaLabelledBy ?? (hasLabel && !ariaLabel ? labelId : undefined)
  const describedBy = [ariaDescribedBy, hasHelper ? helperId : undefined].filter(Boolean).join(" ") || undefined

  if (process.env.NODE_ENV !== "production" && !hasLabel && !ariaLabel && !ariaLabelledBy) {
    console.warn("Slider: pass `label`, `aria-label` or `aria-labelledby` so the slider has an accessible name.")
  }

  const percent = (v: number) => ((v - min) / (safeMax - min)) * 100
  const pos = values.map(percent)
  const fillStart = range ? pos[0] : 0
  const fillEnd = range ? pos[1] : pos[0]

  const cls = [styles.root, className].filter(Boolean).join(" ")

  return (
    <div
      {...props}
      className={cls}
      data-orientation={orientation}
      data-range={range || undefined}
      data-disabled={disabled || undefined}
      data-dragging={dragging !== null || undefined}
    >
      {(hasLabel || hasValueLabel) && (
        <div className={styles.header}>
          {hasLabel && <span id={labelId} className={styles.label}>{label}</span>}
          {hasValueLabel && <span className={styles.value}>{valueLabel}</span>}
        </div>
      )}

      <div className={styles.row}>
        {hasLeading && <span className={styles.side}>{leading}</span>}
        <div
          ref={controlRef}
          className={styles.control}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={
            {
              "--_start": fillStart,
              "--_end": fillEnd,
            } as React.CSSProperties
          }
        >
          <div className={styles.track}>
            <div className={styles.fill} />
          </div>
          {values.map((v, i) => {
            const thumbId = `${uid}-thumb-${i}`
            const lo = i === 1 ? values[0] : min
            const hi = i === 0 && range ? values[1] : safeMax
            const rangeName = range ? (i === 0 ? "Minimum" : "Maximum") : undefined
            return (
              <div
                key={i}
                id={thumbId}
                ref={(el) => { thumbRefs.current[i] = el }}
                className={styles.thumb}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-valuemin={lo}
                aria-valuemax={hi}
                aria-valuenow={v}
                aria-valuetext={getAriaValueText?.(v)}
                aria-orientation={orientation}
                aria-disabled={disabled || undefined}
                aria-label={rangeName ?? ariaLabel}
                aria-labelledby={
                  rangeName
                    ? [nameSource, thumbId].filter(Boolean).join(" ")
                    : ariaLabel ? undefined : nameSource
                }
                aria-describedby={describedBy}
                data-active={dragging === i || undefined}
                onKeyDown={onKeyDown(i)}
                style={{ "--_pos": pos[i] } as React.CSSProperties}
              />
            )
          })}
        </div>
        {hasTrailing && <span className={styles.side}>{trailing}</span>}
      </div>

      {hasHelper && <span id={helperId} className={styles.helper}>{helperText}</span>}

      {name && values.map((v, i) => <input key={i} type="hidden" name={name} value={v} disabled={disabled} />)}
    </div>
  )
}
