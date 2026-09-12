"use client"

import React, { useState } from "react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { TabbyStepProps, TABBY_GREEN } from "../schema"

const SLIDES = [
  {
    bg: "linear-gradient(140deg, #F2D26E 0%, #5CCFC2 100%)",
    title: "Split your purchases in 4 payments.",
    sub: "Always interest-free. No fees.",
    illo: "🧘",
  },
  {
    bg: "var(--atlas-background-subtle)",
    title: "Split in 4 at thousands of your favourite brands.",
    sub: "",
    illo: "🛍️",
  },
]

export function Marketing({ next }: TabbyStepProps) {
  const [slide, setSlide] = useState(0)
  const total = SLIDES.length

  const advance = () => {
    if (slide < total - 1) setSlide(slide + 1)
  }

  const current = SLIDES[slide]

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Hero image area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: current.bg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "var(--atlas-spacing-6) var(--atlas-spacing-5) var(--atlas-spacing-4)",
          position: "relative",
        }}
      >
        {/* Brand wordmark top-left */}
        <div
          style={{
            fontFamily:
              "ui-rounded, 'SF Pro Rounded', system-ui, -apple-system, sans-serif",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--atlas-color-neutral-950)",
          }}
        >
          tabby
          <span
            style={{
              display: "inline-block",
              marginInlineStart: 2,
              width: 4,
              height: 4,
              borderRadius: "var(--atlas-radius-full)",
              background: "var(--atlas-color-neutral-950)",
              transform: "translateY(-12px)",
            }}
          />
        </div>

        {/* Headline + illustration */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-4)" }}>
          <div
            aria-hidden
            style={{
              fontSize: 72,
              alignSelf: "center",
              filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.08))",
            }}
          >
            {current.illo}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "var(--atlas-font-size-3xl)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              color: "var(--atlas-color-neutral-950)",
            }}
          >
            {current.title}
          </h1>
          {current.sub && (
            <p
              style={{
                margin: 0,
                fontSize: "var(--atlas-font-size-base)",
                color: "var(--atlas-color-neutral-800)",
                lineHeight: 1.4,
              }}
            >
              {current.sub}
            </p>
          )}
        </div>

        {/* Pagination dots */}
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            paddingBlockStart: "var(--atlas-spacing-2)",
          }}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 18 : 6,
                height: 6,
                padding: 0,
                border: 0,
                background:
                  i === slide
                    ? "var(--atlas-color-neutral-950)"
                    : "rgba(0,0,0,0.25)",
                borderRadius: "var(--atlas-radius-full)",
                cursor: "pointer",
                transition: "width 200ms ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--atlas-spacing-2)",
          padding: "var(--atlas-spacing-4) var(--atlas-spacing-5) var(--atlas-spacing-8)",
          background: "var(--atlas-background)",
        }}
      >
        <Button
          variant="primary"
          size="lg"
          style={{
            width: "100%",
            background: "var(--atlas-color-neutral-950)",
            color: "var(--atlas-color-neutral-0)",
            borderRadius: "var(--atlas-radius-full)",
            height: 52,
          }}
          onClick={() => (slide < total - 1 ? advance() : next())}
        >
          Log in or sign up
        </Button>
        <Button
          variant="ghost"
          size="lg"
          style={{
            width: "100%",
            borderRadius: "var(--atlas-radius-full)",
            height: 52,
            background: "var(--atlas-background-muted)",
          }}
          onClick={() => (slide < total - 1 ? advance() : next())}
        >
          Skip to stores
        </Button>
      </div>

      {/* Hidden helper to use the Tabby brand color somewhere visible — keeps import warning-free */}
      <span style={{ display: "none" }} aria-hidden data-brand={TABBY_GREEN} />
    </div>
  )
}
