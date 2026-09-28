"use client"

/**
 * Atlas Chart — a card that frames a chart: header (title, description, stat toggles),
 * a plot area, an optional legend, and loading and empty states. The plot is a bar chart (Recharts).
 *
 * State:   default | loading | empty (Figma State)
 * Sizes:   none — the card fills its container; the plot is a fixed height
 * Series:  one, in the primary colour (Atlas has no chart palette yet)
 *
 * Compound API:
 *   <Chart state="default">
 *     <ChartHeader stats={<ChartStats><ChartStat label="Desktop" value="24,828" selected /></ChartStats>}>
 *       <ChartTitle>Visitors</ChartTitle>
 *       <ChartDescription>Last 3 months</ChartDescription>
 *     </ChartHeader>
 *     <ChartContent>
 *       <ChartBar aria-label="Visitors per day" data={rows} xKey="date" dataKey="visitors" label="Desktop" />
 *       <ChartLegend><ChartLegendItem>Desktop</ChartLegendItem></ChartLegend>
 *     </ChartContent>
 *   </Chart>
 *
 * Accessibility:
 *   - The card is a section labelled by ChartTitle and described by ChartDescription
 *   - loading sets aria-busy and announces "Loading" through a status region; empty shows a message
 *   - ChartStat is a button with aria-pressed and a focus-visible ring
 *   - ChartBar is role="img" and needs an aria-label; the hover tooltip is a visual aid only
 *   - Recharts animation is off (no reduced-motion story is drawn in Figma)
 *
 * Figma: Chart set 660:247, Chart Stat 660:9, Chart Tooltip 660:13, Chart Legend Item 660:10.
 */

import React, { createContext, useContext, useId } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import styles from "./Chart.module.css"

export type ChartState = "default" | "loading" | "empty"

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Context ─────────────────────────────────────────────────── */

interface ChartContextValue {
  state: ChartState
  titleId: string
  descriptionId: string
}

const ChartContext = createContext<ChartContextValue | null>(null)

function useChart(): ChartContextValue {
  const ctx = useContext(ChartContext)
  if (!ctx) throw new Error("Chart parts must be rendered inside <Chart>")
  return ctx
}

/* ── Chart ───────────────────────────────────────────────────── */

export interface ChartProps extends React.ComponentProps<"section"> {
  /** default draws the plot, loading a placeholder, empty a message. */
  state?: ChartState
}

export function Chart({ state = "default", className, children, ...rest }: ChartProps) {
  const titleId = useId()
  const descriptionId = useId()
  return (
    <ChartContext.Provider value={{ state, titleId, descriptionId }}>
      <section
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={state === "loading" || undefined}
        {...rest}
        data-state={state}
        className={cx(styles.chart, className)}
      >
        {children}
      </section>
    </ChartContext.Provider>
  )
}

/* ── Header ──────────────────────────────────────────────────── */

export interface ChartHeaderProps extends React.ComponentProps<"div"> {
  /** Stat toggles shown at the end of the header (a ChartStats). */
  stats?: React.ReactNode
}

export function ChartHeader({ stats, className, children, ...rest }: ChartHeaderProps) {
  return (
    <div {...rest} className={cx(styles.header, className)}>
      <div className={styles.titleBlock}>{children}</div>
      {stats}
    </div>
  )
}

export function ChartTitle({ className, ...rest }: React.ComponentProps<"p">) {
  const { titleId } = useChart()
  return <p id={titleId} {...rest} className={cx(styles.title, className)} />
}

export function ChartDescription({ className, ...rest }: React.ComponentProps<"p">) {
  const { descriptionId } = useChart()
  return <p id={descriptionId} {...rest} className={cx(styles.description, className)} />
}

/* ── Stats ───────────────────────────────────────────────────── */

export function ChartStats({ className, ...rest }: React.ComponentProps<"div">) {
  return <div role="group" {...rest} className={cx(styles.stats, className)} />
}

export interface ChartStatProps extends Omit<React.ComponentProps<"button">, "children" | "value"> {
  label: React.ReactNode
  value: React.ReactNode
  /** The active series or range; sets aria-pressed. */
  selected?: boolean
}

export function ChartStat({ label, value, selected = false, className, type = "button", ...rest }: ChartStatProps) {
  return (
    <button {...rest} type={type} aria-pressed={selected} data-selected={selected || undefined} className={cx(styles.stat, className)}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </button>
  )
}

/* ── Content ─────────────────────────────────────────────────── */

export interface ChartContentProps extends React.ComponentProps<"div"> {
  /** Shown in the empty state. */
  emptyMessage?: React.ReactNode
  /** Announced by the loading state. */
  loadingLabel?: string
}

const PLACEHOLDER_BARS = [40, 55, 30, 70, 45, 60, 35, 80, 50, 65, 40, 75, 55, 45, 70, 35, 60, 50, 85, 40]

export function ChartContent({
  emptyMessage = "No data to display",
  loadingLabel = "Loading",
  className,
  children,
  ...rest
}: ChartContentProps) {
  const { state } = useChart()
  return (
    <div {...rest} className={cx(styles.content, className)}>
      {state === "default" && children}
      {state === "loading" && (
        <>
          <div className={styles.placeholder} aria-hidden="true">
            {PLACEHOLDER_BARS.map((h, i) => (
              <span key={i} className={styles.placeholderBar} style={{ "--bar-height": `${h}%` } as React.CSSProperties} />
            ))}
          </div>
          <span role="status" className={styles.visuallyHidden}>{loadingLabel}</span>
        </>
      )}
      {state === "empty" && <p className={styles.empty}>{emptyMessage}</p>}
    </div>
  )
}

/* ── Legend ──────────────────────────────────────────────────── */

export function ChartLegend({ className, ...rest }: React.ComponentProps<"ul">) {
  return <ul {...rest} className={cx(styles.legend, className)} />
}

export function ChartLegendItem({ className, children, ...rest }: React.ComponentProps<"li">) {
  return (
    <li {...rest} className={cx(styles.legendItem, className)}>
      <span className={styles.swatch} aria-hidden="true" />
      {children}
    </li>
  )
}

/* ── Bar plot ────────────────────────────────────────────────── */

export interface ChartBarProps
  extends Omit<React.ComponentProps<"div">, "children" | "aria-label"> {
  /** Text alternative for the plot; say what it shows. */
  "aria-label": string
  data: Array<Record<string, string | number>>
  /** Key of the category (x-axis) value in each row. */
  xKey: string
  /** Key of the numeric value in each row. */
  dataKey: string
  /** Series name shown in the hover tooltip. */
  label: string
}

/** Mirrors --atlas-radius-sm; a Recharts prop cannot read a CSS variable. */
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0]

interface TooltipContentProps {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string | number
  series: string
}

function TooltipContent({ active, payload, label, series }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipLabel}>{label}</span>
      <span className={styles.tooltipRow}>
        <span className={styles.swatch} aria-hidden="true" />
        <span>{series}</span>
        <span className={styles.tooltipValue}>{payload[0].value}</span>
      </span>
    </div>
  )
}

export function ChartBar({
  data,
  xKey,
  dataKey,
  label,
  className,
  ...rest
}: ChartBarProps) {
  return (
    <div role="img" {...rest} className={cx(styles.plot, className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={48} />
          <Tooltip
            isAnimationActive={false}
            cursor={false}
            content={<TooltipContent series={label} />}
          />
          <Bar dataKey={dataKey} isAnimationActive={false} className={styles.bar} radius={BAR_RADIUS} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
