"use client"

/**
 * Atlas Breadcrumb — the path to the current page as a hierarchy of links
 *
 * Figma:      Breadcrumb (Separator = chevron | dot) + BreadcrumbItem (Type × State)
 * Separators: chevron | dot
 * Types:      Link · Current Page · Dropdown · Ellipsis (one subcomponent each)
 * States:     default · hover (Link) · focus-visible (every interactive item)
 *
 * Anatomy (compound, like Card and Tabs):
 *   <Breadcrumb>                       <nav aria-label="Breadcrumb">
 *     <BreadcrumbList>                   <ol>
 *       <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
 *       <BreadcrumbSeparator />          decorative <li>
 *       <BreadcrumbItem><BreadcrumbEllipsis onClick={…} /></BreadcrumbItem>
 *       <BreadcrumbItem><BreadcrumbDropdown>Docs</BreadcrumbDropdown></BreadcrumbItem>
 *       <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
 *
 * Accessibility:
 *   - <nav> landmark with an ordered list; the last segment is the current page
 *     (aria-current="page", not a link).
 *   - Separators are decorative (aria-hidden); the chevron mirrors in RTL.
 *   - BreadcrumbEllipsis is a <button> named "Show more" (override with `label`).
 *   - BreadcrumbDropdown is a trigger: a <button aria-haspopup="menu">. Wrap it in
 *     <DropdownMenuTrigger asChild> (patterns/DropdownMenu) to open an Atlas menu; the trigger
 *     supplies aria-expanded, so the `expanded` prop is only for a caller-managed menu.
 *   - Links are plain <a> elements.
 */

import React from "react"
import styles from "./Breadcrumb.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type BreadcrumbSeparatorStyle = "chevron" | "dot"

export interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  /** Separator glyph between segments. */
  separator?: BreadcrumbSeparatorStyle
}

export interface BreadcrumbListProps extends React.ComponentProps<"ol"> {}

export interface BreadcrumbItemProps extends React.ComponentProps<"li"> {}

export interface BreadcrumbLinkProps extends React.ComponentProps<"a"> {}

export interface BreadcrumbPageProps extends React.ComponentProps<"span"> {}

export interface BreadcrumbSeparatorProps extends React.ComponentProps<"li"> {}

export interface BreadcrumbEllipsisProps extends React.ComponentProps<"button"> {
  /** Accessible name of the button. */
  label?: string
}

export interface BreadcrumbDropdownProps extends React.ComponentProps<"button"> {
  /** Whether the caller's menu is open (drives aria-expanded). */
  expanded?: boolean
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

const BreadcrumbContext = React.createContext<{ separator: BreadcrumbSeparatorStyle }>({ separator: "chevron" })

/* Inline SVG glyphs (repo convention: no icon dependency). Stroke comes from the CSS module. */

function ChevronRightGlyph({ className }: { className?: string }) {
  return (
    <svg className={cx(styles.svg, className)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function ChevronDownGlyph() {
  return (
    <svg className={styles.svg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function DotGlyph() {
  return (
    <svg className={styles.svg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12.1" cy="12.1" r="1" />
    </svg>
  )
}

function EllipsisGlyph() {
  return (
    <svg className={styles.svg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

/* ── Breadcrumb (root) ──────────────────────────────────────────── */

export function Breadcrumb({
  separator = "chevron",
  "aria-label": ariaLabel = "Breadcrumb",
  className,
  children,
  ...rest
}: BreadcrumbProps) {
  return (
    <BreadcrumbContext.Provider value={{ separator }}>
      <nav {...rest} aria-label={ariaLabel} className={cx(styles.root, className)}>
        {children}
      </nav>
    </BreadcrumbContext.Provider>
  )
}

export function BreadcrumbList({ className, ...rest }: BreadcrumbListProps) {
  return <ol {...rest} className={cx(styles.list, className)} />
}

export function BreadcrumbItem({ className, ...rest }: BreadcrumbItemProps) {
  return <li {...rest} className={cx(styles.item, className)} />
}

/* ── Link ───────────────────────────────────────────────────────── */

export function BreadcrumbLink({ className, ...rest }: BreadcrumbLinkProps) {
  return <a {...rest} className={cx(styles.link, className)} />
}

/* ── Current Page ───────────────────────────────────────────────── */

export function BreadcrumbPage({ className, ...rest }: BreadcrumbPageProps) {
  return <span {...rest} aria-current="page" className={cx(styles.page, className)} />
}

/* ── Separator ──────────────────────────────────────────────────── */

export function BreadcrumbSeparator({ className, children, ...rest }: BreadcrumbSeparatorProps) {
  const { separator } = React.useContext(BreadcrumbContext)
  return (
    <li {...rest} role="presentation" aria-hidden="true" className={cx(styles.separator, className)}>
      {children ?? (separator === "dot" ? <DotGlyph /> : <ChevronRightGlyph className={styles.mirror} />)}
    </li>
  )
}

/* ── Ellipsis (collapsed segments) ──────────────────────────────── */

export function BreadcrumbEllipsis({ label = "Show more", className, ...rest }: BreadcrumbEllipsisProps) {
  return (
    <button {...rest} type="button" aria-label={label} className={cx(styles.ellipsis, className)}>
      <EllipsisGlyph />
    </button>
  )
}

/* ── Dropdown (trigger only) ────────────────────────────────────── */

export function BreadcrumbDropdown({ expanded = false, className, children, ...rest }: BreadcrumbDropdownProps) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={expanded}
      {...rest}
      className={cx(styles.dropdown, className)}
    >
      {children}
      <ChevronDownGlyph />
    </button>
  )
}
