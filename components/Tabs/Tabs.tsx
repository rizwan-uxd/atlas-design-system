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
 * Two usage patterns:
 *
 * 1. Array API (shorthand):
 *   <Tabs
 *     variant="underline" size="md"
 *     items={[
 *       { id: "one", label: "Overview", content: <p>…</p> },
 *       { id: "two", label: "Details",  content: <p>…</p>, badge: <Badge>3</Badge> },
 *     ]}
 *   />
 *
 * 2. Compound API (full control):
 *   <Tabs.Root variant="underline" size="md" defaultValue="one">
 *     <Tabs.List aria-label="Account settings">
 *       <Tabs.Trigger value="one">Overview</Tabs.Trigger>
 *       <Tabs.Trigger value="two" badge={<Badge>3</Badge>}>Details</Tabs.Trigger>
 *     </Tabs.List>
 *     <Tabs.Panel value="one"><p>…</p></Tabs.Panel>
 *     <Tabs.Panel value="two" forceMount><p>…</p></Tabs.Panel>
 *   </Tabs.Root>
 *
 * Token compliance: all values via semantic tokens in Tabs.module.css.
 */

import React, { useRef, useEffect, useLayoutEffect, useCallback } from "react"
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

/* ── Tabs.Root ──────────────────────────────────────────────────── */

export interface TabsRootProps {
  variant?:        TabsVariant
  size?:           TabsSize
  /** Controlled active value */
  value?:          string
  /** Uncontrolled default — falls back to first item when used in array API */
  defaultValue?:   string
  onValueChange?:  (value: string) => void
  activationMode?: "automatic" | "manual"
  className?:      string
  children?:       React.ReactNode
}

export function TabsRoot({
  variant        = "underline",
  size           = "md",
  value,
  defaultValue,
  onValueChange,
  activationMode = "automatic",
  className,
  children,
}: TabsRootProps) {
  const rootClasses = cx(
    styles.root,
    styles[variant],
    size !== "md" && styles[size],
    className,
  )

  return (
    <RadixTabs.Root
      className={rootClasses}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      activationMode={activationMode}
    >
      {children}
    </RadixTabs.Root>
  )
}

/* ── Tabs.List ──────────────────────────────────────────────────── */

export interface TabsListProps {
  /**
   * Accessible name for the tab group.
   * Provide a unique description when multiple tab lists exist on one page.
   * FIX BUG-041: no longer defaults to "Tabs" (was generic and duplicated)
   */
  "aria-label"?: string
  className?:    string
  children?:     React.ReactNode
}

export function TabsList({
  "aria-label": ariaLabel,  /* FIX BUG-041: was = "Tabs" */
  className,
  children,
}: TabsListProps) {
  /* FIX BUG-039: sliding indicator via MutationObserver + CSS custom properties */
  const listRef = useRef<HTMLDivElement>(null)

  const updateIndicator = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector<HTMLElement>('[data-state="active"]')
    if (!active) return
    const listRect = list.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    /* scrollLeft accounts for lists that have scrolled horizontally */
    list.style.setProperty("--_ind-x", `${activeRect.left - listRect.left + list.scrollLeft}px`)
    list.style.setProperty("--_ind-w", `${activeRect.width}px`)
  }, [])

  /* Run after every render to catch Radix updating data-state */
  useLayoutEffect(() => {
    updateIndicator()
  })

  /* Observe data-state attribute changes + window resize */
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const observer = new MutationObserver(updateIndicator)
    observer.observe(list, {
      subtree:         true,
      attributes:      true,
      attributeFilter: ["data-state"],
    })
    window.addEventListener("resize", updateIndicator)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateIndicator)
    }
  }, [updateIndicator])

  return (
    <RadixTabs.List
      ref={listRef as React.Ref<HTMLDivElement>}
      className={cx(styles.list, className)}
      aria-label={ariaLabel}
    >
      {children}
    </RadixTabs.List>
  )
}

/* ── Tabs.Trigger ───────────────────────────────────────────────── */

export interface TabsTriggerProps {
  value:        string
  disabled?:    boolean
  /** Optional leading icon — aria-hidden */
  leadingIcon?: React.ReactNode
  /** Optional trailing badge (count or status) — aria-hidden */
  badge?:       React.ReactNode
  className?:   string
  children?:    React.ReactNode
}

export function TabsTrigger({
  value,
  disabled,
  leadingIcon,
  badge,
  className,
  children,
}: TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      value={value}
      disabled={disabled}
      className={cx(styles.trigger, className)}
    >
      {leadingIcon && (
        <span className={styles.icon} aria-hidden="true">{leadingIcon}</span>
      )}
      {children}
      {badge && <span aria-hidden="true">{badge}</span>}
    </RadixTabs.Trigger>
  )
}

/* ── Tabs.Panel ─────────────────────────────────────────────────── */

export interface TabsPanelProps {
  value:       string
  /**
   * Keep panel mounted even when not active.
   * Enables SSR of off-screen content and lazy-loaded routes.
   * FIX BUG-040: forceMount was missing from the API
   */
  forceMount?: true
  className?:  string
  children?:   React.ReactNode
}

export function TabsPanel({ value, forceMount, className, children }: TabsPanelProps) {
  return (
    <RadixTabs.Content
      value={value}
      forceMount={forceMount}
      className={cx(styles.panel, className)}
    >
      {children}
    </RadixTabs.Content>
  )
}

/* ── Tabs (array shorthand API + compound properties) ───────────── */

export interface TabsProps extends TabsRootProps {
  /** Array shorthand — renders List + Triggers + Panels automatically */
  items: TabItem[]
  /** @deprecated — use value */
  activeTab?:  string
  /** @deprecated — use defaultValue */
  defaultTab?: string
  /** @deprecated — use onValueChange */
  onTabChange?: (value: string) => void
}

function TabsBase({
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
  const resolvedValue        = value        ?? activeTab
  const resolvedDefaultValue = defaultValue ?? defaultTab ?? items[0]?.id
  const handleChange         = (v: string) => { onValueChange?.(v); onTabChange?.(v) }

  return (
    <TabsRoot
      variant={variant}
      size={size}
      value={resolvedValue}
      defaultValue={resolvedDefaultValue}
      onValueChange={handleChange}
      activationMode={activationMode}
      className={className}
    >
      <TabsList>
        {items.map((item) => (
          <TabsTrigger
            key={item.id}
            value={item.id}
            disabled={item.disabled}
            leadingIcon={item.icon}
            badge={item.badge}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsPanel key={item.id} value={item.id}>
          {item.content}
        </TabsPanel>
      ))}
    </TabsRoot>
  )
}

export const Tabs = Object.assign(TabsBase, {
  Root:    TabsRoot,
  List:    TabsList,
  Trigger: TabsTrigger,
  Panel:   TabsPanel,
})
