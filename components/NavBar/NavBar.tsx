"use client"

/**
 * Atlas NavBar — top app bar (web)
 *
 * Variants:  default | transparent | elevated
 * Sizes:     sm (48px) | md (64px) | lg (80px)
 *
 * Layout zones:
 *   [brand]  [desktop nav links]  ──────────  [actions]  [hamburger]
 *
 * Responsive behaviour:
 *   ≥ 1024px (lg): desktop links visible, hamburger hidden
 *   < 1024px:      desktop links hidden, hamburger visible → opens Drawer
 *
 * Accessibility:
 *   - <header> root element
 *   - <nav aria-label="Primary"> wraps the link list
 *   - aria-current="page" on the active link
 *   - Hamburger button: aria-label, aria-expanded, aria-controls
 *   - Drawer link list: same aria-current wiring
 *   - Focus ring on all interactive elements
 *
 * Token compliance: all values via semantic tokens in NavBar.module.css.
 */

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/Dialog/Dialog"
import styles from "./NavBar.module.css"

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ──────────────────────────────────────────────────────── */

export type NavBarVariant = "default" | "transparent" | "elevated"
export type NavBarSize    = "sm" | "md" | "lg"

export interface NavLink {
  label:     string
  href?:     string
  active?:   boolean
  disabled?: boolean
}

export interface NavBarProps {
  variant?:  NavBarVariant
  size?:     NavBarSize
  /** Brand node — logo + wordmark */
  brand?:    React.ReactNode
  /** Navigation links */
  links?:    NavLink[]
  /** Right-side action slot — buttons, avatar, etc. */
  actions?:  React.ReactNode
  className?: string
  /** @deprecated — use className */
  style?:    React.CSSProperties
}

/* ── Component ──────────────────────────────────────────────────── */

export function NavBar({
  variant   = "default",
  size      = "md",
  brand,
  links,
  actions,
  className,
}: NavBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navbarClasses = cx(
    styles.navbar,
    styles[variant],
    size !== "md" && styles[size],
    className,
  )

  return (
    <>
      <header className={navbarClasses}>
        <div className={styles.inner}>
          {/* ── Start zone: brand + desktop links ── */}
          <div className={styles.start}>
            {/* Brand */}
            {brand && (
              <span className={styles.brand}>{brand}</span>
            )}

            {/* Desktop nav links — hidden below lg breakpoint */}
            {links && links.length > 0 && (
              <nav aria-label="Primary">
                <ul className={styles.links}>
                  {links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href ?? "#"}
                        className={styles.link}
                        aria-current={link.active ? "page" : undefined}
                        aria-disabled={link.disabled || undefined}
                        tabIndex={link.disabled ? -1 : undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>

          {/* ── End zone: actions + hamburger ── */}
          <div className={styles.end}>
            {actions}

            {/* Hamburger — visible below lg, hidden on desktop */}
            {links && links.length > 0 && (
              <button
                type="button"
                className={styles.hamburger}
                aria-label={drawerOpen ? "Close menu" : "Open menu"}
                aria-expanded={drawerOpen}
                aria-controls="mobile-nav-drawer"
                onClick={() => setDrawerOpen(true)}
              >
                <span className={styles.hamburgerLine} />
                <span className={styles.hamburgerLine} />
                <span className={styles.hamburgerLine} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer — rendered via Dialog for focus trap + Esc close */}
      {links && links.length > 0 && (
        <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DialogContent
            variant="drawer"
            size="sm"
            side="start"
            id="mobile-nav-drawer"
          >
            <DialogHeader>
              <DialogTitle>{brand ?? "Menu"}</DialogTitle>
            </DialogHeader>

            <nav aria-label="Mobile primary">
              <ul className={styles.drawerLinks}>
                {links.map((link, i) => (
                  <li key={i}>
                    <DialogClose asChild>
                      <a
                        href={link.href ?? "#"}
                        className={styles.drawerLink}
                        aria-current={link.active ? "page" : undefined}
                        aria-disabled={link.disabled || undefined}
                      >
                        {link.label}
                      </a>
                    </DialogClose>
                  </li>
                ))}
              </ul>
            </nav>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

/* =================================================================
   NavBar — Mobile-Native anatomy
   BUG-069 fix: NavBar.Header, NavBar.Header.Leading,
                NavBar.Header.Title, NavBar.Header.Actions,
                NavBar.TabBar, NavBar.Tab
   BUG-070 fix: safe-area insets applied via CSS (.navbarHeader,
                .tabBar) — see NavBar.module.css
   ================================================================= */

/* ── NavBar.Header.Leading ───────────────────────────────────── */

export interface NavBarHeaderLeadingProps {
  children?: React.ReactNode
  className?: string
}

export function NavBarHeaderLeading({ children, className }: NavBarHeaderLeadingProps) {
  return (
    <div className={cx(styles.headerLeading, className)}>
      {children}
    </div>
  )
}

/* ── NavBar.Header.Title ─────────────────────────────────────── */

export interface NavBarHeaderTitleProps {
  children?: React.ReactNode
  className?: string
}

export function NavBarHeaderTitle({ children, className }: NavBarHeaderTitleProps) {
  return (
    <span className={cx(styles.headerTitle, className)}>
      {children}
    </span>
  )
}

/* ── NavBar.Header.Actions ───────────────────────────────────── */

export interface NavBarHeaderActionsProps {
  children?: React.ReactNode
  className?: string
}

export function NavBarHeaderActions({ children, className }: NavBarHeaderActionsProps) {
  return (
    <div className={cx(styles.headerActions, className)}>
      {children}
    </div>
  )
}

/* ── NavBar.Header ───────────────────────────────────────────── */

export interface NavBarHeaderProps {
  variant?:   NavBarVariant
  size?:      NavBarSize
  children?:  React.ReactNode
  className?: string
}

function NavBarHeaderBase({ variant = "default", size = "md", children, className }: NavBarHeaderProps) {
  return (
    <header
      className={cx(
        styles.navbarHeader,
        styles[variant],
        size !== "md" && styles[size],
        className,
      )}
    >
      {children}
    </header>
  )
}

export const NavBarHeader = Object.assign(NavBarHeaderBase, {
  Leading: NavBarHeaderLeading,
  Title:   NavBarHeaderTitle,
  Actions: NavBarHeaderActions,
})

/* ── NavBar.Tab ──────────────────────────────────────────────── */

export interface NavBarTabProps {
  /** Must match the value tracked by the consumer's active state */
  value:      string
  label:      string
  icon?:      React.ReactNode
  badge?:     React.ReactNode
  active?:    boolean
  disabled?:  boolean
  onClick?:   (value: string) => void
  className?: string
}

export function NavBarTab({
  value,
  label,
  icon,
  badge,
  active = false,
  disabled = false,
  onClick,
  className,
}: NavBarTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      className={cx(styles.tab, className)}
      onClick={() => !disabled && onClick?.(value)}
      tabIndex={disabled ? -1 : 0}
    >
      {icon && (
        <span className={styles.tabIcon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.tabLabel}>
        {label}
        {badge && <span aria-hidden="true">{badge}</span>}
      </span>
    </button>
  )
}

/* ── NavBar.TabBar ───────────────────────────────────────────── */

export interface NavBarTabBarProps {
  size?:      NavBarSize
  children?:  React.ReactNode
  className?: string
}

export function NavBarTabBar({ size = "md", children, className }: NavBarTabBarProps) {
  return (
    <nav
      role="tablist"
      aria-label="Primary navigation"
      className={cx(
        styles.tabBar,
        size !== "md" && styles[size],
        className,
      )}
    >
      {children}
    </nav>
  )
}
