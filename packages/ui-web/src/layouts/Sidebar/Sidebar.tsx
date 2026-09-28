"use client"

// Sidebar layout shell
// Variants: — (single shell)
// Sizes: — (fixed width from token)
// States: collapsed (icon-only rail)
// Accessibility: <aside> landmark, collapse toggle with aria-expanded

import React, { createContext, useContext, useId } from "react"
import styles from "./Sidebar.module.css"

/* ── Context ─────────────────────────────────────────────────────── */

interface SidebarContextValue {
  collapsed: boolean
}

const SidebarContext = createContext<SidebarContextValue>({ collapsed: false })

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext)
}

/* ── Sidebar ─────────────────────────────────────────────────────── */

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  children?: React.ReactNode
}

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function Sidebar({
  collapsed = false,
  onCollapsedChange,
  children,
  className,
  ...rest
}: SidebarProps) {
  const bodyId = useId()

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        {...rest}
        data-collapsed={collapsed || undefined}
        aria-label={rest["aria-label"] ?? "Sidebar"}
        className={cx(styles.root, collapsed && styles.collapsed, className)}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  )
}

/* ── SidebarHeader ───────────────────────────────────────────────── */

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarHeader({ children, className, ...rest }: SidebarHeaderProps) {
  const { collapsed } = useSidebar()
  return (
    <div
      {...rest}
      className={cx(styles.header, collapsed && styles.headerCollapsed, className)}
    >
      {children}
    </div>
  )
}

/* ── SidebarBody ─────────────────────────────────────────────────── */

export interface SidebarBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarBody({ children, className, ...rest }: SidebarBodyProps) {
  return (
    <div {...rest} className={cx(styles.body, className)}>
      {children}
    </div>
  )
}

/* ── SidebarSection ──────────────────────────────────────────────── */

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  children?: React.ReactNode
}

export function SidebarSection({ label, children, className, ...rest }: SidebarSectionProps) {
  const { collapsed } = useSidebar()
  return (
    <div {...rest} className={cx(styles.section, className)} role="group" aria-label={label}>
      {label && !collapsed && (
        <span className={styles.sectionLabel}>{label}</span>
      )}
      {children}
    </div>
  )
}

/* ── SidebarFooter ───────────────────────────────────────────────── */

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarFooter({ children, className, ...rest }: SidebarFooterProps) {
  const { collapsed } = useSidebar()
  return (
    <div
      {...rest}
      className={cx(styles.footer, collapsed && styles.footerCollapsed, className)}
    >
      {children}
    </div>
  )
}

/* ── SidebarCollapseToggle ───────────────────────────────────────── */

export interface SidebarCollapseToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarCollapseToggle({ className, ...rest }: SidebarCollapseToggleProps) {
  const { collapsed } = useSidebar()
  return (
    <button
      {...rest}
      type="button"
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cx(styles.collapseToggle, className)}
    >
      <svg
        className={styles.collapseIcon}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {collapsed ? (
          <polyline points="6 4 10 8 6 12" />
        ) : (
          <polyline points="10 4 6 8 10 12" />
        )}
      </svg>
    </button>
  )
}
