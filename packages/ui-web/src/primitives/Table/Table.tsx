"use client"

/**
 * Atlas Table — styled semantic parts for tabular data.
 *
 * Parts:         Table · TableHeader · TableBody · TableFooter · TableRow · TableHead ·
 *                TableCell · TableCaption
 * Variants:      none (Figma models a single style)
 * Align:         start | end on TableHead and TableCell (logical, flips in RTL);
 *                use `end` for numeric columns
 * Sort:          none | unsorted | ascending | descending on TableHead. Anything but `none`
 *                renders a ghost Button with an arrow icon and sets `aria-sort`
 * States:        row default · hover · selected (`selected` prop → data-state="selected")
 * Accessibility: real <table> markup, `scope="col"` on heads, `aria-sort` on the sorted head.
 *                The scroll wrapper is focusable so keyboard users can scroll a wide table;
 *                pass `aria-label` (or a TableCaption) to name it. There is no `aria-selected`
 *                on rows: it is not valid on a plain table row, so give selection a visible
 *                control (a labelled Checkbox in the row).
 *
 * Sorting, row selection, column visibility and pagination are not part of Table;
 * they belong to a DataTable built on top of it.
 */

import React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import styles from "./Table.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type TableAlign = "start" | "end"

export type TableSort = "none" | "unsorted" | "ascending" | "descending"

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>

export type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Marks the row as picked by the user. Off by default. */
  selected?: boolean
}

export interface TableHeadProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** Inline alignment. Use `end` for numeric columns. Defaults to `start`. */
  align?: TableAlign
  /**
   * Sort state. `none` (default) is a plain heading; the other values render a sort
   * button. Only one column should be `ascending` or `descending` at a time.
   */
  sort?: TableSort
  /** Called when the sort button is pressed. */
  onSort?: () => void
}

export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** Inline alignment. Match the column's TableHead. Defaults to `start`. */
  align?: TableAlign
}

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

const SORT_ICONS = {
  unsorted: ArrowUpDown,
  ascending: ArrowUp,
  descending: ArrowDown,
} as const

const ARIA_SORT = {
  unsorted: "none",
  ascending: "ascending",
  descending: "descending",
} as const

/* ── Table ──────────────────────────────────────────────────────── */

export function Table({ className, ...rest }: TableProps) {
  const label = rest["aria-label"]
  return (
    <div className={styles.wrapper} role={label ? "region" : undefined} aria-label={label} tabIndex={0}>
      <table {...rest} className={cx(styles.table, className)} />
    </div>
  )
}

/* ── Sections ───────────────────────────────────────────────────── */

export function TableHeader({ className, ...rest }: TableSectionProps) {
  return <thead {...rest} className={cx(styles.header, className)} />
}

export function TableBody({ className, ...rest }: TableSectionProps) {
  return <tbody {...rest} className={cx(styles.body, className)} />
}

/** Unstyled `<tfoot>`: Figma does not draw a table footer. */
export function TableFooter({ className, ...rest }: TableSectionProps) {
  return <tfoot {...rest} className={className} />
}

/* ── TableRow ───────────────────────────────────────────────────── */

export function TableRow({ selected = false, className, ...rest }: TableRowProps) {
  return (
    <tr
      {...rest}
      data-state={selected ? "selected" : undefined}
      className={cx(styles.row, className)}
    />
  )
}

/* ── TableHead ──────────────────────────────────────────────────── */

export function TableHead({
  align = "start",
  sort = "none",
  onSort,
  className,
  children,
  ...rest
}: TableHeadProps) {
  const SortIcon = sort === "none" ? null : SORT_ICONS[sort]

  return (
    <th
      scope="col"
      {...rest}
      data-align={align}
      aria-sort={sort === "none" ? undefined : ARIA_SORT[sort]}
      className={cx(styles.head, className)}
    >
      {SortIcon ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSort}
          trailingIcon={<SortIcon size={16} aria-hidden="true" />}
        >
          {children}
        </Button>
      ) : (
        children
      )}
    </th>
  )
}

/* ── TableCell ──────────────────────────────────────────────────── */

export function TableCell({ align = "start", className, ...rest }: TableCellProps) {
  return <td {...rest} data-align={align} className={cx(styles.cell, className)} />
}

/* ── TableCaption ───────────────────────────────────────────────── */

/** Sits below the table. Name the table with a caption or `aria-label` on `Table`. */
export function TableCaption({ className, ...rest }: TableCaptionProps) {
  return <caption {...rest} className={cx(styles.caption, className)} />
}
