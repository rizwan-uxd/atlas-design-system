"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { TabbyStepProps } from "../schema"
import { mockVerifyOtp } from "../../_shared/mockApi"
import { ScreenHeader } from "./_chrome"

const LENGTH = 4

export function OTP({ data, patch, next, back }: TabbyStepProps) {
  const [digits, setDigits] = useState<string[]>(() =>
    data.otp ? data.otp.split("").slice(0, LENGTH) : Array(LENGTH).fill(""),
  )
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(51)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [seconds])

  const code = digits.join("")
  const full = code.length === LENGTH && digits.every((d) => d !== "")

  const handleSubmit = () => {
    if (!full || verifying) return
    setVerifying(true)
    setError(null)
    mockVerifyOtp(code, { delayMs: 700 })
      .then(() => {
        patch({ otp: code })
        next()
      })
      .catch((e: Error) => {
        setError(e.message)
        setVerifying(false)
        setDigits(Array(LENGTH).fill(""))
        inputs.current[0]?.focus()
      })
  }

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (full) handleSubmit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full])

  // Autofocus the first empty slot on mount
  useEffect(() => {
    const firstEmpty = digits.findIndex((d) => d === "")
    inputs.current[Math.max(0, firstEmpty)]?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setDigit = (i: number, v: string) => {
    const cleaned = v.replace(/\D/g, "").slice(-1)
    setDigits((prev) => {
      const arr = [...prev]
      arr[i] = cleaned
      return arr
    })
    if (cleaned && i < LENGTH - 1) {
      inputs.current[i + 1]?.focus()
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH)
    if (!text) return
    e.preventDefault()
    const arr = Array(LENGTH).fill("") as string[]
    text.split("").forEach((c, i) => (arr[i] = c))
    setDigits(arr)
    inputs.current[Math.min(text.length, LENGTH - 1)]?.focus()
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
      <ScreenHeader onBack={back} />

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
          Enter the 4-digit code
        </h1>
        <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>
          Sent to you at{" "}
          <span style={{ color: "var(--atlas-foreground)" }}>
            {data.country?.dialCode ?? "+971"} •••• {data.phone.slice(-4) || "0000"}
          </span>
          .{" "}
          <button
            type="button"
            onClick={back}
            style={{
              background: "transparent",
              border: 0,
              padding: 0,
              color: "var(--atlas-primary)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: 600,
            }}
          >
            Change.
          </button>
        </p>
      </div>

      {/* 4 boxes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${LENGTH}, 1fr)`,
          gap: "var(--atlas-spacing-3)",
          marginBlockStart: "var(--atlas-spacing-6)",
        }}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            value={d}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={verifying}
            style={{
              width: "100%",
              height: 64,
              textAlign: "center",
              fontSize: 28,
              fontWeight: 600,
              border: `1px solid ${error ? "var(--atlas-danger)" : d ? "var(--atlas-foreground)" : "var(--atlas-border-strong)"}`,
              borderRadius: "var(--atlas-radius-md)",
              outline: "none",
              background: "var(--atlas-background)",
              color: "var(--atlas-foreground)",
              fontFamily: "inherit",
            }}
          />
        ))}
      </div>

      <div style={{ marginBlockStart: "var(--atlas-spacing-4)" }}>
        {error ? (
          <Alert variant="danger" size="sm" description={error} />
        ) : (
          <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>
            {seconds > 0 ? (
              <>Resend code in 00:{seconds.toString().padStart(2, "0")}</>
            ) : (
              <button
                type="button"
                onClick={() => setSeconds(30)}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  color: "var(--atlas-primary)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: 600,
                }}
              >
                Resend code
              </button>
            )}
          </p>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <Button
        variant="primary"
        size="lg"
        loading={verifying}
        disabled={!full || verifying}
        onClick={handleSubmit}
        style={{
          width: "100%",
          background: full
            ? "var(--atlas-color-neutral-950)"
            : "var(--atlas-background-muted)",
          color: full ? "var(--atlas-color-neutral-0)" : "var(--atlas-foreground-disabled)",
          borderRadius: "var(--atlas-radius-full)",
          height: 52,
        }}
      >
        Continue
      </Button>
    </div>
  )
}
