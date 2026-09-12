"use client"

import React from "react"

export function StepProgress({
  total,
  current,
  variant = "bar",
}: {
  total: number
  /** Zero-based current index */
  current: number
  variant?: "bar" | "dots"
}) {
  if (variant === "dots") {
    return (
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        style={{ display: "flex", gap: "var(--atlas-spacing-2)", justifyContent: "center" }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            style={{
              width: i === current ? 24 : 6,
              height: 6,
              borderRadius: "var(--atlas-radius-full)",
              background:
                i === current ? "var(--atlas-foreground)" : "var(--atlas-border-strong)",
              transition: "width 200ms ease",
            }}
          />
        ))}
      </div>
    )
  }

  const pct = total <= 1 ? 100 : ((current + 1) / total) * 100
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      style={{
        height: 4,
        width: "100%",
        background: "var(--atlas-background-muted)",
        borderRadius: "var(--atlas-radius-full)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--atlas-primary)",
          transition: "width 240ms ease",
        }}
      />
    </div>
  )
}
