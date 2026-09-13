"use client"

import React, { useState } from "react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Label } from "@atlas/ui-web/primitives/Label/Label"
import { TabbyStepProps } from "../schema"
import { TABBY } from "../brand"
import { mockSubmit } from "../../_shared/mockApi"
import { ScreenHeader } from "./_chrome"

export function Phone({ data, patch, next, back, goTo }: TabbyStepProps) {
  const [submitting, setSubmitting] = useState(false)
  const country = data.country ?? { dialCode: "+971", flag: "🇦🇪", name: "United Arab Emirates", code: "AE" }
  const canContinue = data.phone.replace(/\D/g, "").length >= 8

  const handleContinue = async () => {
    if (!canContinue) return
    setSubmitting(true)
    try {
      await mockSubmit({ phone: country.dialCode + data.phone }, { delayMs: 1100 })
      next()
    } catch {
      setSubmitting(false)
    }
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
      <ScreenHeader onBack={back} onClose={() => goTo(0)} closeLabel="Close" />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-2)", marginBlockStart: "var(--atlas-spacing-3)" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--atlas-font-size-2xl)",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Enter your phone
          <br />
          number
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "var(--atlas-font-size-sm)",
            color: "var(--atlas-foreground-muted)",
            lineHeight: 1.5,
          }}
        >
          By entering your number you can log in or
          <br />
          create an account.
        </p>
      </div>

      {/* Phone input row */}
      <div
        style={{
          display: "flex",
          gap: "var(--atlas-spacing-2)",
          marginBlockStart: "var(--atlas-spacing-6)",
        }}
      >
        <button
          type="button"
          aria-label="Change country"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 12px",
            height: 48,
            background: "var(--atlas-background-muted)",
            border: 0,
            borderRadius: "var(--atlas-radius-md)",
            fontSize: "var(--atlas-font-size-base)",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span aria-hidden style={{ fontSize: 18 }}>{country.flag}</span>
          <span>{country.dialCode}</span>
          <span aria-hidden style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
        </button>
        <div style={{ flex: 1 }}>
          <Label htmlFor="tabby-phone" style={{ display: "none" } as React.CSSProperties}>
            Phone number
          </Label>
          <Input
            id="tabby-phone"
            inputMode="tel"
            autoComplete="tel"
            size="lg"
            placeholder="XX XXX XXXX"
            value={data.phone}
            onChange={(e) => patch({ phone: e.target.value })}
          />
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* CTA */}
      <Button
        variant="primary"
        size="lg"
        loading={submitting}
        disabled={!canContinue}
        onClick={handleContinue}
        style={{
          width: "100%",
          background: canContinue
            ? TABBY.ink
            : "var(--atlas-background-muted)",
          color: canContinue
            ? TABBY.onInk
            : "var(--atlas-foreground-disabled)",
          borderRadius: "var(--atlas-radius-full)",
          height: 52,
        }}
      >
        Continue
      </Button>
    </div>
  )
}
