"use client"

/**
 * Atlas Tabs — switch between sibling content panels
 *
 * Powered by @radix-ui/react-tabs for:
 *   - Roving tabIndex (arrow keys move between triggers)
 *   - Inline-Start/Inline-End arrows (RTL-aware)
 *   - Home/End jump to first/last trigger
 *   - Disabled trigger skipped in arrow navigation
 *   - aria-controls / aria-labelledby auto-wiring
 *   - aria-selected per trigger
 *   - Automatic (focus = activate) or manual (Enter/Space) activation
 *
 * Variants:  underline (default) | pills | enclosed
 * Sizes:     sm | md | lg
 *
 * Usage (items array API — recommended):
 *   <Tabs
 *     variant="underline"
 *     size="md"
 *     items={[
 *       { id: "one", label: "Overview", content: <p>…</p> },
 *       { id: "two", label: "Details",  content: <p>…</p>, badge: <Badge>3</Badge> },
 *       { id: "three", label: "Hidden", content: <></>, disabled: true },
 *     ]}
 *   />
 *
 * Token compliance: all values via semantic tokens in Tabs.module.css.
 */

import React from "react"
import * as RadixTabs from "@radix-ui/react-tabs"
import styles from "./Tabs.module.css"

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ──────────────────────────────────────────────────────── */

export type TabsVariant = "underline" | "pills" | "enclosed"
export type TabsSize    = "sm" | "md" | "lg"

export interface TabItem {
  id:        string
  label:     React.ReactNode
  /** Optional leading icon inside the trigger */
  icon?:     React.ReactNode
  /** Optional badge (count or status) trailing inside the trigger */
  badge?:    React.ReactNode
  content:   React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  variant?:        TabsVariant
  size?:           TabsSize
  items:           TabItem[]
  /** Controlled active value */
  value?:          string
  /** Uncontrolled default — falls back to first item */
  defaultValue?:   string
  /** @deprecated — use value */
  activeTab?:      string
  /** @deprecated — use defaultValue */
  defaultTab?:     string
  onValueChange?:  (value: string) => void
  /** @deprecated — use onValueChange */
  onTabChange?:    (value: string) => void
  /**
   * automatic: arrow key focus immediately activates the tab
   * manual:    focus then Enter/Space activates
   */
  activationMode?: "automatic" | "manual"
  className?:      string
}

/* ── Component ──────────────────────────────────────────────────── */

export function Tabs({
  variant        = "underline",
  size           = "md",
  items,
  value,
  defaultValue,
  activeTab,
  defaultTab,
  onValueChange,
  onTabChange,
  activationMode = "automatic",
  className,
}: TabsProps) {
  /* Backwards-compat aliases */
  const resolvedValue        = value        ?? activeTab
  const resolvedDefaultValue = defaultValue ?? defaultTab ?? items[0]?.id
  const handleChange         = (v: string) => { onValueChange?.(v); onTabChange?.(v) }

  const rootClasses = cx(
    styles.root,
    styles[variant],
    size !== "md" && styles[size],
    className,
  )

  return (
    <RadixTabs.Root
      className={rootClasses}
      value={resolvedValue}
      defaultValue={resolvedDefaultValue}
      onValueChange={handleChange}
      activationMode={activationMode}
    >
      {/* Trigger list */}
      <RadixTabs.List className={styles.list} aria-label="Tabs">
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.id}
            value={item.id}
            disabled={item.disabled}
            className={styles.trigger}
          >
            {item.icon && (
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.label}
            {item.badge && (
              <span aria-hidden="true">{item.badge}</span>
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {/* Content panels */}
      {items.map((item) => (
        <RadixTabs.Content
          key={item.id}
          value={item.id}
          className={styles.panel}
        >
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}
