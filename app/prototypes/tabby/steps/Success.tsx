"use client"

import React from "react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Card, CardContent } from "@atlas/ui-web/compositions/Card/Card"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { TabbyStepProps } from "../schema"

/**
 * Success — simplified "stores" home that lands after onboarding.
 * Mirrors the last screen of the source flow at a high level only.
 */
export function Success({ goTo }: TabbyStepProps) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Header search */}
      <div style={{ padding: "var(--atlas-spacing-4) var(--atlas-spacing-5)" }}>
        <Input
          placeholder="Stores or products"
          leadingIcon={<span aria-hidden style={{ fontSize: 14 }}>🔍</span>}
          size="md"
        />
      </div>

      {/* Quick links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--atlas-spacing-3)",
          padding: "0 var(--atlas-spacing-5)",
        }}
      >
        <QuickLink emoji="🛒" title="All stores" sub="Shop and split" />
        <QuickLink emoji="🏷️" title="Deals" sub="Discounts up to 30%" />
      </div>

      {/* Categories row */}
      <div
        style={{
          display: "flex",
          gap: "var(--atlas-spacing-3)",
          padding: "var(--atlas-spacing-5)",
          overflowX: "auto",
        }}
      >
        {[
          { emoji: "💸", label: "Customise your Tabby" },
          { emoji: "📱", label: "Mobile" },
          { emoji: "💍", label: "Jewelry" },
        ].map((c) => (
          <div key={c.label} style={{ minWidth: 110 }}>
            <Card variant="outlined" size="sm">
              <CardContent>
                <div style={{ fontSize: 24 }}>{c.emoji}</div>
                <div
                  style={{
                    marginBlockStart: 6,
                    fontSize: "var(--atlas-font-size-xs)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {c.label}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Invite friends card */}
      <div style={{ padding: "0 var(--atlas-spacing-5)" }}>
        <Card variant="filled">
          <CardContent>
            <div style={{ display: "flex", gap: "var(--atlas-spacing-3)", alignItems: "center" }}>
              <span aria-hidden style={{ fontSize: 28 }}>🏠</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--atlas-font-size-sm)", fontWeight: 600 }}>
                  Earn up to ₪200 by inviting friends to Tabby
                </div>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{ fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-primary)", fontWeight: 600 }}
                >
                  Learn more
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores for you */}
      <div
        style={{
          padding: "var(--atlas-spacing-5) var(--atlas-spacing-5) 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong style={{ fontSize: "var(--atlas-font-size-base)" }}>Stores For You</strong>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-primary)", fontWeight: 600 }}
        >
          View all
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--atlas-spacing-2)",
          padding: "var(--atlas-spacing-3) var(--atlas-spacing-5)",
        }}
      >
        {["Cole", "Glamzale", "Ecco", "Mumzw"].map((store) => (
          <div
            key={store}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--atlas-radius-full)",
                background: "var(--atlas-background-muted)",
              }}
            />
            <span style={{ fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)" }}>{store}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Reset CTA so user can run the flow again */}
      <div style={{ padding: "var(--atlas-spacing-3) var(--atlas-spacing-5)" }}>
        <Badge size="sm" variant="success" dot>
          You&apos;re all set
        </Badge>
        <div style={{ marginBlockStart: "var(--atlas-spacing-2)" }}>
          <Button variant="outline" size="sm" onClick={() => goTo(0)}>
            Run the flow again
          </Button>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          padding: "var(--atlas-spacing-3) var(--atlas-spacing-4) var(--atlas-spacing-6)",
          borderTop: "1px solid var(--atlas-border)",
          background: "var(--atlas-background)",
        }}
      >
        {[
          { icon: "🔍", label: "Discover", active: true },
          { icon: "🛍️", label: "Shop" },
          { icon: "💳", label: "Money" },
          { icon: "👤", label: "Profile" },
        ].map((t) => (
          <div
            key={t.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: t.active ? "var(--atlas-foreground)" : "var(--atlas-foreground-muted)",
            }}
          >
            <span aria-hidden style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickLink({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <Card variant="outlined" size="sm" interactive>
      <CardContent>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-2)" }}>
          <span aria-hidden style={{ fontSize: 18 }}>{emoji}</span>
          <div style={{ fontSize: "var(--atlas-font-size-sm)", fontWeight: 600 }}>{title}</div>
        </div>
        <div style={{ fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", marginBlockStart: 2 }}>
          {sub}
        </div>
      </CardContent>
    </Card>
  )
}
