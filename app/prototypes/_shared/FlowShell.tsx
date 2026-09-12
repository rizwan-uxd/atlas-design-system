"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { PhoneFrame } from "./PhoneFrame"
import { StepProgress } from "./StepProgress"

/**
 * FlowShell — outer page chrome for any prototype flow.
 *
 * Renders the page background, a small header with the flow title + a
 * "back to prototypes" link, an optional step progress bar, and the phone
 * frame that wraps the active screen.
 */
export function FlowShell({
  title,
  step,
  totalSteps,
  onReset,
  showProgress = true,
  phoneBackground,
  statusBarTint,
  homeIndicatorTint,
  children,
}: {
  title: string
  step: number
  totalSteps: number
  onReset?: () => void
  showProgress?: boolean
  phoneBackground?: string
  statusBarTint?: "dark" | "light"
  homeIndicatorTint?: "dark" | "light"
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--atlas-background-subtle)",
        color: "var(--atlas-foreground)",
        fontFamily: "var(--atlas-font-sans)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Page header — outside the phone */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--atlas-spacing-4) var(--atlas-spacing-6)",
          borderBottom: "1px solid var(--atlas-border)",
          background: "var(--atlas-background)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-3)" }}>
          <Link
            href="/prototypes"
            style={{
              fontSize: "var(--atlas-font-size-sm)",
              color: "var(--atlas-foreground-muted)",
              textDecoration: "none",
            }}
          >
            ← Prototypes
          </Link>
          <span style={{ color: "var(--atlas-border-strong)" }}>/</span>
          <strong style={{ fontSize: "var(--atlas-font-size-sm)" }}>{title}</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-3)" }}>
          <span
            style={{
              fontSize: "var(--atlas-font-size-xs)",
              color: "var(--atlas-foreground-muted)",
            }}
          >
            Step {step + 1} of {totalSteps}
          </span>
          {onReset && (
            <Button size="sm" variant="ghost" onClick={onReset}>
              Reset
            </Button>
          )}
        </div>
      </header>

      {/* Progress bar — full width, slim, under the header */}
      {showProgress && (
        <div style={{ padding: "var(--atlas-spacing-2) var(--atlas-spacing-6)" }}>
          <StepProgress total={totalSteps} current={step} />
        </div>
      )}

      {/* Phone frame */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--atlas-spacing-8) var(--atlas-spacing-4)",
        }}
      >
        <PhoneFrame
          background={phoneBackground}
          statusBarTint={statusBarTint}
          homeIndicatorTint={homeIndicatorTint}
        >
          {children}
        </PhoneFrame>
      </main>
    </div>
  )
}
