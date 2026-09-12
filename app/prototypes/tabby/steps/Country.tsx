"use client"

import React from "react"
import { Card } from "@atlas/ui-web/compositions/Card/Card"
import { COUNTRIES, TabbyStepProps } from "../schema"

export function Country({ data, patch, next }: TabbyStepProps) {
  const selectedCode = data.country?.code

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "var(--atlas-spacing-6) var(--atlas-spacing-5) var(--atlas-spacing-5)",
        gap: "var(--atlas-spacing-5)",
        overflowY: "auto",
      }}
    >
      {/* Top row: language toggle, right-aligned (RTL hint) */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          style={{
            background: "var(--atlas-background-muted)",
            border: 0,
            borderRadius: "var(--atlas-radius-full)",
            padding: "6px 12px",
            fontSize: "var(--atlas-font-size-sm)",
            color: "var(--atlas-foreground)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          العربية
        </button>
      </div>

      {/* Heading */}
      <h1
        style={{
          margin: 0,
          fontSize: "var(--atlas-font-size-3xl)",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
        }}
      >
        Select your
        <br />
        country
      </h1>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-2)" }}>
        {COUNTRIES.map((country) => {
          const selected = selectedCode === country.code
          return (
            <Card
              key={country.code}
              interactive
              selected={selected}
              variant={selected ? "default" : "outlined"}
              size="sm"
              onClick={() => {
                patch({ country })
                // brief delay so user sees the selection state
                setTimeout(() => next(), 180)
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--atlas-spacing-3)",
                  padding: "var(--atlas-spacing-1) var(--atlas-spacing-1)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--atlas-radius-full)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    background: "var(--atlas-background-subtle)",
                  }}
                >
                  {country.flag}
                </span>
                <span
                  style={{
                    fontSize: "var(--atlas-font-size-base)",
                    fontWeight: 500,
                  }}
                >
                  {country.name}
                </span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
