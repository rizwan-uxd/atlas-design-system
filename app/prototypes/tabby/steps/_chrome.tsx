"use client"

import React from "react"

/**
 * Shared screen chrome for Tabby step screens — a thin header row
 * with optional back and close affordances.
 */
export function ScreenHeader({
  onBack,
  onClose,
  closeLabel = "Close",
  rightSlot,
}: {
  onBack?: () => void
  onClose?: () => void
  closeLabel?: string
  rightSlot?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 44,
      }}
    >
      <div>
        {onBack && (
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            style={iconBtnStyle}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {rightSlot}
        {onClose && (
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            style={iconBtnStyle}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: 0,
  cursor: "pointer",
  color: "var(--atlas-foreground)",
  borderRadius: "var(--atlas-radius-full)",
}

/**
 * Big circular illustration disc — used by trust/privacy/PIN intro screens.
 */
export function IllustrationDisc({
  emoji,
  tint = "var(--atlas-primary-subtle)",
  fg = "var(--atlas-primary)",
}: {
  emoji: string
  tint?: string
  fg?: string
}) {
  return (
    <div
      aria-hidden
      style={{
        width: 56,
        height: 56,
        borderRadius: "var(--atlas-radius-full)",
        background: tint,
        color: fg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
      }}
    >
      {emoji}
    </div>
  )
}
