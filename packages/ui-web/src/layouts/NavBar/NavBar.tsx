"use client"

/**
 * Atlas NavBar — top app bar (web) + mobile-native shell
 *
 * Web variants:  default | transparent | elevated
 * Web sizes:     sm (48px) | md (64px) | lg (80px)
 *
 * Layout zones:
 *   [brand]  [desktop nav links]  ──────────  [actions]  [hamburger]
 *
 * Responsive behaviour:
 *   ≥ 768px (md): desktop links visible, hamburger hidden  — FIX BUG-043
 *   < 768px:      desktop links hidden, hamburger visible → opens Drawer
 *
 * Accessibility:
 *   - <header> root element
 *   - <nav aria-label="Primary"> wraps the link list
 *   - aria-current="page" on the active link
 *   - Hamburger: aria-label, aria-expanded, aria-controls (id forwarded to DialogContent)
 *   - Focus ring on all interactive elements
 *
 * Token compliance: all values via semantic tokens in NavBar.module.css.
 */

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@atlas/ui-web/compositions/Dialog/Dialog"
import styles from "./NavBar.module.css"

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ──────────────────────────────────────────────────────── */

export type NavBarVariant = "default" | "transparent" | "elevated"
export type NavBarSize    = "sm" | "md" | "lg"

export interface NavLink {
  label:        string
  href?:        string
  active?:      boolean
  disabled?:    boolean
  /** FIX BUG-048: leading icon slot */
  leadingIcon?: React.ReactNode
  /** FIX BUG-048: trailing badge slot (count, status) */
  badge?:       React.ReactNode
}

export interface NavBarProps {
  variant?:      NavBarVariant
  size?:         NavBarSize
  /** Brand node — logo + wordmark */
  brand?:        React.ReactNode
  /**
   * URL the brand/logo links to.
   * When provided, wraps brand in an <a> tag.
   * FIX BUG-068
   */
  brandHref?:    string
  /** Navigation links */
  links?:        NavLink[]
  /** Right-side action slot — buttons, avatar, etc. */
  actions?:      React.ReactNode
  /**
   * Hide navbar on downward scroll, reveal on upward scroll.
   * FIX BUG-046
   */
  hideOnScroll?: boolean
  className?:    string
  /** @deprecated — use className */
  style?:        React.CSSProperties
}

/* ── Component ──────────────────────────────────────────────────── */

export function NavBar({
  variant       = "default",
  size          = "md",
  brand,
  brandHref,
  links,
  actions,
  hideOnScroll  = false,
  className,
}: NavBarProps) {
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)   /* FIX BUG-045 */
  const [hidden,      setHidden]      = useState(false)   /* FIX BUG-046 */
  const lastScrollY = useRef(0)

  /* FIX BUG-045 + BUG-046: scroll event listener */
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY

    /* BUG-045: transparent → scrolled state */
    setScrolled(currentY > 0)

    /* BUG-046: hide on downscroll, reveal on upscroll */
    if (hideOnScroll) {
      const isScrollingDown = currentY > lastScrollY.current && currentY > 64
      setHidden(isScrollingDown)
    }

    lastScrollY.current = currentY
  }, [hideOnScroll])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const navbarClasses = cx(
    styles.navbar,
    styles[variant],
    size !== "md" && styles[size],
    scrolled && styles.scrolled,        /* FIX BUG-045 */
    hidden  && styles.navbarHidden,     /* FIX BUG-046 */
    className,
  )

  /* FIX BUG-068: brand wrapped in <a> when brandHref provided */
  const brandNode = brand ? (
    brandHref
      ? <a href={brandHref} className={styles.brand}>{brand}</a>
      : <span className={styles.brand}>{brand}</span>
  ) : null

  return (
    <>
      <header className={navbarClasses}>
        <div className={styles.inner}>
          {/* ── Start zone: brand + desktop links ── */}
          <div className={styles.start}>
            {brandNode}

            {/* Desktop nav links — hidden below md breakpoint (FIX BUG-043: was lg) */}
            {links && links.length > 0 && (
              <nav aria-label="Primary">
                <ul className={styles.links}>
                  {links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href ?? "#"}
                        className={styles.link}
                        aria-current={link.active   ? "page"      : undefined}
                        aria-disabled={link.disabled || undefined}
                        tabIndex={link.disabled ? -1 : undefined}
                      >
                        {/* FIX BUG-048 */}
                        {link.leadingIcon && (
                          <span aria-hidden="true" className={styles.linkIcon}>{link.leadingIcon}</span>
                        )}
                        {link.label}
                        {link.badge && (
                          <span aria-hidden="true">{link.badge}</span>
                        )}
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

            {/* Hamburger — visible below md, hidden on desktop (FIX BUG-043: was lg) */}
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

      {/* Mobile drawer */}
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
                        aria-current={link.active   ? "page"      : undefined}
                        aria-disabled={link.disabled || undefined}
                      >
                        {/* FIX BUG-048 */}
                        {link.leadingIcon && (
                          <span aria-hidden="true" className={styles.linkIcon}>{link.leadingIcon}</span>
                        )}
                        {link.label}
                        {link.badge && (
                          <span aria-hidden="true">{link.badge}</span>
                        )}
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
   NavBar — Mobile-Native anatomy  (BUG-069 + BUG-070 already fixed)
   NavBar.Header, NavBar.Header.Leading,
   NavBar.Header.Title, NavBar.Header.Actions,
   NavBar.TabBar, NavBar.Tab
   ================================================================= */

export interface NavBarHeaderLeadingProps {
  children?: React.ReactNode
  className?: string
}

export function NavBarHeaderLeading({ children, className }: NavBarHeaderLeadingProps) {
  return <div className={cx(styles.headerLeading, className)}>{children}</div>
}

export interface NavBarHeaderTitleProps {
  children?: React.ReactNode
  className?: string
}

export function NavBarHeaderTitle({ children, className }: NavBarHeaderTitleProps) {
  return <span className={cx(styles.headerTitle, className)}>{children}</span>
}

export interface NavBarHeaderActionsProps {
  children?: React.ReactNode
  className?: string
}

export function NavBarHeaderActions({ children, className }: NavBarHeaderActionsProps) {
  return <div className={cx(styles.headerActions, className)}>{children}</div>
}

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

export interface NavBarTabProps {
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
  value, label, icon, badge,
  active = false, disabled = false,
  onClick, className,
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
      {icon && <span className={styles.tabIcon} aria-hidden="true">{icon}</span>}
      <span className={styles.tabLabel}>
        {label}
        {badge && <span aria-hidden="true">{badge}</span>}
      </span>
    </button>
  )
}

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
      className={cx(styles.tabBar, size !== "md" && styles[size], className)}
    >
      {children}
    </nav>
  )
}
