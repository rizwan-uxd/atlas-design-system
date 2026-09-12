"use client"

import React from "react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { TabbyStepProps } from "../schema"
import { IllustrationDisc, ScreenHeader } from "./_chrome"

export function PIN({ next, back }: TabbyStepProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "var(--atlas-spacing-3) var(--atlas-spacing-5) var(--atlas-spacing-5)",
      }}
    >
      <ScreenHeader onBack={back} onClose={back} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--atlas-spacing-3)",
          paddingBlockStart: "var(--atlas-spacing-6)",
        }}
      >
        <IllustrationDisc emoji="⋯" />
        <h1
          style={{
            margin: 0,
            fontSize: "var(--atlas-font-size-2xl)",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Set your PIN code?
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "var(--atlas-font-size-sm)",
            color: "var(--atlas-foreground-muted)",
            lineHeight: 1.5,
          }}
        >
          You&apos;ll use this 4-digit PIN code to access the Tabby app.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-2)" }}>
        <Button
          variant="primary"
          size="lg"
          onClick={next}
          style={{
            width: "100%",
            background: "var(--atlas-color-neutral-950)",
            color: "var(--atlas-color-neutral-0)",
            borderRadius: "var(--atlas-radius-full)",
            height: 52,
          }}
        >
          Set PIN code
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={next}
          style={{
            width: "100%",
            background: "var(--atlas-background-muted)",
            borderRadius: "var(--atlas-radius-full)",
            height: 52,
          }}
        >
          Skip for now
        </Button>
      </div>
    </div>
  )
}
