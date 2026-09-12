"use client"

import React, { useEffect } from "react"
import { TabbyStepProps } from "../schema"

/**
 * Splash — Tabby green wordmark. Auto-advances after 1.6s,
 * or tap anywhere to advance immediately.
 */
export function Splash({ next }: TabbyStepProps) {
  useEffect(() => {
    const t = setTimeout(() => next(), 1600)
    return () => clearTimeout(t)
  }, [next])

  return (
    <div
      onClick={next}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <Wordmark />
    </div>
  )
}

function Wordmark() {
  return (
    <div
      aria-label="tabby"
      style={{
        fontFamily:
          "ui-rounded, 'SF Pro Rounded', system-ui, -apple-system, sans-serif",
        fontSize: 64,
        fontWeight: 800,
        letterSpacing: "-0.04em",
        color: "var(--atlas-color-neutral-950)",
        display: "flex",
        alignItems: "center",
      }}
    >
      tabby
      <span
        style={{
          display: "inline-block",
          marginInlineStart: 4,
          width: 8,
          height: 8,
          borderRadius: "var(--atlas-radius-full)",
          background: "var(--atlas-color-neutral-950)",
        }}
      />
    </div>
  )
}
