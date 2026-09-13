"use client"

import React from "react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { TabbyStepProps } from "../schema"
import { TABBY } from "../brand"
import { IllustrationDisc, ScreenHeader } from "./_chrome"

export function Privacy({ patch, next, back }: TabbyStepProps) {
  const accept = () => {
    patch({ agreedPrivacy: true })
    next()
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "var(--atlas-spacing-3) var(--atlas-spacing-5) var(--atlas-spacing-5)",
      }}
    >
      <ScreenHeader onClose={back} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--atlas-spacing-4)",
          paddingBlockStart: "var(--atlas-spacing-4)",
        }}
      >
        <IllustrationDisc emoji="📄" tint="var(--atlas-info-muted)" fg="var(--atlas-info)" />
        <h1
          style={{
            margin: 0,
            fontSize: "var(--atlas-font-size-2xl)",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Your privacy matters
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "var(--atlas-font-size-sm)",
            color: "var(--atlas-foreground-muted)",
            lineHeight: 1.6,
          }}
        >
          We handle your personal information in line with applicable laws and
          our Privacy policy. We use bank-level security measures and encrypt
          all payment information to ensure your data is safe.
          <br />
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ color: "var(--atlas-primary)", textDecoration: "none", fontWeight: 600 }}
          >
            Learn more
          </a>
        </p>
        <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>
          Tabby&apos;s{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ color: "var(--atlas-primary)", textDecoration: "none", fontWeight: 600 }}
          >
            Privacy policy
          </a>
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={accept}
        style={{
          width: "100%",
          background: TABBY.ink,
          color: TABBY.onInk,
          borderRadius: "var(--atlas-radius-full)",
          height: 52,
        }}
      >
        Agree and continue
      </Button>
    </div>
  )
}
