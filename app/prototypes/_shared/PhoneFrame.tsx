"use client"

import React from "react"

/**
 * PhoneFrame — chrome that wraps a prototype "screen" to feel like a phone.
 *
 * - 390 × 844 (iPhone 13/14 logical size)
 * - rounded device shell + faux iOS status bar (time, signal, wifi, battery)
 * - `background` lets a screen override the inside fill (e.g. Tabby's green splash)
 * - children fill the rest of the screen; the screen handles its own scrolling
 */
export function PhoneFrame({
  children,
  background,
  statusBarTint = "dark",
  homeIndicatorTint = "dark",
  hideStatusBar = false,
}: {
  children: React.ReactNode
  background?: string
  /** Color of the time / icons in the status bar */
  statusBarTint?: "dark" | "light"
  /** Color of the home indicator bar */
  homeIndicatorTint?: "dark" | "light"
  hideStatusBar?: boolean
}) {
  const tintColor =
    statusBarTint === "light" ? "var(--atlas-foreground-on-brand)" : "var(--atlas-foreground)"
  const homeColor =
    homeIndicatorTint === "light"
      ? "var(--atlas-foreground-on-brand)"
      : "var(--atlas-foreground)"

  return (
    <div
      style={{
        width: 390,
        height: 844,
        borderRadius: 48,
        background: background ?? "var(--atlas-background)",
        boxShadow:
          "0 0 0 12px var(--atlas-overlay), 0 0 0 13px var(--atlas-foreground-subtle), var(--atlas-shadow-xl)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--atlas-font-sans)",
      }}
    >
      {/* Notch */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 130,
          height: 28,
          background: "var(--atlas-overlay)",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          zIndex: 2,
        }}
      />

      {/* iOS status bar */}
      {!hideStatusBar && (
        <div
          aria-hidden
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 32px 0",
            height: 44,
            color: tintColor,
            fontSize: 14,
            fontWeight: 600,
            position: "relative",
            zIndex: 1,
          }}
        >
          <span>9:41</span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: 11, letterSpacing: -1 }}>●●●●</span>
            <svg width="16" height="11" viewBox="0 0 16 11" fill={tintColor} aria-hidden>
              <path d="M8 0a8 8 0 0 1 5.66 2.34l-1.42 1.42A6 6 0 0 0 8 2a6 6 0 0 0-4.24 1.76L2.34 2.34A8 8 0 0 1 8 0Zm0 4a4 4 0 0 1 2.83 1.17l-1.42 1.42A2 2 0 0 0 8 6a2 2 0 0 0-1.41.59L5.17 5.17A4 4 0 0 1 8 4Zm0 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            </svg>
            <svg width="24" height="11" viewBox="0 0 24 11" aria-hidden>
              <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" fill="none" stroke={tintColor} opacity="0.4" />
              <rect x="2" y="2" width="17" height="7" rx="1.5" fill={tintColor} />
              <rect x="21" y="3.5" width="1.5" height="4" rx="0.5" fill={tintColor} opacity="0.4" />
            </svg>
          </div>
        </div>
      )}

      {/* Screen content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Home indicator */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 134,
          height: 5,
          borderRadius: "var(--atlas-radius-full)",
          background: homeColor,
          opacity: 0.85,
          zIndex: 3,
        }}
      />
    </div>
  )
}
