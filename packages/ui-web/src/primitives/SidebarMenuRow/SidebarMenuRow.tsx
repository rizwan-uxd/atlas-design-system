"use client"

/**
 * Atlas SidebarMenuRow — a dashboard sidebar navigation row
 *
 * Figma:      Sidebar Menu Row (State) · .Sidebar Menu Row Child (State, hidden — nested use only)
 * Reference:  Stripe sidebar (default/active/expandable rows) + Grok sidebar (expanded child disclosure)
 * States:     default · hover (`:hover:not([data-disabled])`) · active (selected, colour-only —
 *             no background fill) · expanded (a `hasChildren` row whose children are shown — bolder
 *             label + rotated chevron, distinct from active) · disabled
 * Sizes:      — (single size in v1)
 *
 * Anatomy:
 *   <SidebarMenuRow icon={<Icon />} active hasChildren expanded badge={<Badge size="sm">3</Badge>}
 *                    onClick={...}>
 *     Billing
 *   </SidebarMenuRow>
 *   {expanded && (
 *     <ul>
 *       <li><SidebarMenuRowChild active>Overview</SidebarMenuRowChild></li>
 *     </ul>
 *   )}
 *
 * `hasChildren` shows the trailing chevron; `expanded` rotates it and applies the bolder
 * "expanded" look — meaningful only when `hasChildren` is true. `active` and `expanded` are
 * mutually exclusive visual states (matches the Figma component: an expanded parent reads as
 * "expanded", never "active", even if one of its children is the current selection).
 *
 * SidebarMenuRowChild has no icon (matches the Grok reference) and one nesting level only —
 * v1 does not support a second level of disclosure.
 *
 * Accessibility:
 *   - Renders a <button> by default (`as="a"` for a real navigation link).
 *   - `hasChildren` rows get `aria-expanded`; the caller owns the actual show/hide of children.
 *   - `active` sets `aria-current="page"` (`as="a"`) or `aria-current="true"` (`as="button"`).
 *   - `disabled` sets `aria-disabled` and blocks pointer/keyboard activation.
 *   - Icon is decorative (`aria-hidden`); the visible label is the accessible name.
 *   - Logical properties and token-only values in SidebarMenuRow.module.css.
 */

import React from "react"
import styles from "./SidebarMenuRow.module.css"

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

function ChevronDownGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/* ── SidebarMenuRow ─────────────────────────────────────────────── */

export interface SidebarMenuRowProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Element to render — "a" for a real navigation link. */
  as?:          "button" | "a"
  /** Decorative leading icon (16px slot). */
  icon?:        React.ReactNode
  /** Selected/current row. Colour-only — no background fill (matches the Stripe reference). */
  active?:      boolean
  /** Shows the trailing chevron for a collapsible child group. */
  hasChildren?: boolean
  /** Whether the child group is currently shown. Meaningful only with `hasChildren`. */
  expanded?:    boolean
  /** Trailing slot — typically a Badge for a count or status. */
  badge?:       React.ReactNode
  disabled?:    boolean
  href?:        string
  children:     React.ReactNode
}

export function SidebarMenuRow({
  as = "button",
  icon,
  active = false,
  hasChildren = false,
  expanded = false,
  badge,
  disabled = false,
  className,
  children,
  ...rest
}: SidebarMenuRowProps) {
  const As = as as React.ElementType
  const isExpandedLook = hasChildren && expanded
  const state = disabled ? "disabled" : isExpandedLook ? "expanded" : active ? "active" : "default"

  return (
    <As
      {...rest}
      type={as === "button" ? "button" : undefined}
      disabled={as === "button" ? disabled : undefined}
      aria-disabled={disabled || undefined}
      aria-current={active ? (as === "a" ? "page" : "true") : undefined}
      aria-expanded={hasChildren ? expanded : undefined}
      data-state={state}
      data-disabled={disabled || undefined}
      className={cx(styles.root, className)}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {badge && <span className={styles.badge}>{badge}</span>}
      {hasChildren && (
        <ChevronDownGlyph className={cx(styles.chevron, expanded && styles.chevronExpanded)} />
      )}
    </As>
  )
}

/* ── SidebarMenuRowChild ────────────────────────────────────────── */

export interface SidebarMenuRowChildProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  as?:       "button" | "a"
  active?:   boolean
  badge?:    React.ReactNode
  disabled?: boolean
  href?:     string
  children:  React.ReactNode
}

export function SidebarMenuRowChild({
  as = "button",
  active = false,
  badge,
  disabled = false,
  className,
  children,
  ...rest
}: SidebarMenuRowChildProps) {
  const As = as as React.ElementType
  const state = disabled ? "disabled" : active ? "active" : "default"

  return (
    <As
      {...rest}
      type={as === "button" ? "button" : undefined}
      disabled={as === "button" ? disabled : undefined}
      aria-disabled={disabled || undefined}
      aria-current={active ? (as === "a" ? "page" : "true") : undefined}
      data-state={state}
      data-disabled={disabled || undefined}
      className={cx(styles.child, className)}
    >
      <span className={styles.label}>{children}</span>
      {badge && <span className={styles.badge}>{badge}</span>}
    </As>
  )
}
