"use client"

import React from "react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { TabbyStepProps } from "../schema"
import { TABBY } from "../brand"
import { IllustrationDisc, ScreenHeader } from "./_chrome"

export function TrustDevice({ patch, next, back }: TabbyStepProps) {
  const accept = () => {
    patch({ trustedDevice: true })
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
        <IllustrationDisc emoji="🛡️" tint="var(--atlas-info-muted)" fg="var(--atlas-info)" />
        <h1
          style={{
            margin: 0,
            fontSize: "var(--atlas-font-size-2xl)",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Trust this device to
          <br />
          boost account security
        </h1>

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--atlas-spacing-3)",
          }}
        >
          <Bullet icon="🔒" text="Protects your account from unauthorised access and fraud" />
          <Bullet icon="⚡" text="Enables faster purchases" />
        </ul>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-2)" }}>
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
          Trust this device
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
          I&apos;ll do it later
        </Button>
      </div>
    </div>
  )
}

function Bullet({ icon, text }: { icon: string; text: string }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--atlas-spacing-3)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 24,
          height: 24,
          flex: "0 0 auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: "var(--atlas-font-size-sm)", lineHeight: 1.5, color: "var(--atlas-foreground)" }}>
        {text}
      </span>
    </li>
  )
}
