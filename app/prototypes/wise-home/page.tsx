"use client"

/**
 * Wise Home Screen Prototype
 * ──────────────────────────────────────────────────────────────
 * Faithful recreation of the Wise mobile banking home screen.
 * Built with Atlas design tokens (spacing, radius, typography, shadow).
 * Brand colours with no Atlas token live in ./brand.ts (DEC-008).
 *
 * Route: /prototypes/wise-home
 */

import React, { useState } from "react"
import Link from "next/link"
import { WISE } from "./brand"

/* ── Helpers ───────────────────────────────────────────────────── */
function cx(...cls: (string | false | undefined | null)[]): string {
  return cls.filter(Boolean).join(" ")
}

/* ── Inline SVG Icons ─────────────────────────────────────────── */

const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconBank = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
)

const IconPlus = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconHome = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? WISE.green : "none"} stroke={active ? WISE.greenDark : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconCard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const IconRecipients = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconPayments = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

/* ── Singapore Flag SVG ───────────────────────────────────────── */
const SingaporeFlag = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" style={{ borderRadius: "50%", display: "block" }}>
    <circle cx="18" cy="18" r="18" fill={WISE.flagWhite} />
    <path d="M0 18a18 18 0 0 1 36 0z" fill={WISE.flagRed} />
    {/* Crescent */}
    <circle cx="13" cy="14" r="5" fill={WISE.flagWhite} />
    <circle cx="15" cy="14" r="5" fill={WISE.flagRed} />
    {/* 5 stars */}
    {[0, 1, 2, 3, 4].map((i) => {
      const angle = (i * 72 - 90) * (Math.PI / 180)
      const x = 19 + 3.8 * Math.cos(angle)
      const y = 14 + 3.8 * Math.sin(angle)
      return <polygon key={i} points={star(x, y, 1.2, 0.5, 5)} fill={WISE.flagWhite} />
    })}
  </svg>
)

function star(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(" ")
}

/* ── Signal/Battery status icons ─────────────────────────────── */
const StatusBarIcons = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    {/* Signal bars */}
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="0.4" />
      <rect x="4.5" y="5" width="3" height="7" rx="0.5" opacity="0.6" />
      <rect x="9" y="2" width="3" height="10" rx="0.5" />
      <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" />
    </svg>
    {/* Wifi */}
    <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M1.5 7C5.5 3 18.5 3 22.5 7" opacity="0.5" />
      <path d="M5 11c3.5-3 10.5-3 14 0" opacity="0.7" />
      <path d="M8.5 15c1.5-1.5 6.5-1.5 8 0" />
      <circle cx="12.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
    {/* Battery */}
    <svg width="24" height="12" viewBox="0 0 24 12" fill="currentColor">
      <rect x="0" y="1" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="20.5" y="3.5" width="2.5" height="5" rx="1" />
      <rect x="1.5" y="2.5" width="16" height="7" rx="1" />
    </svg>
  </div>
)

/* ── Main Component ─────────────────────────────────────────── */
export default function WiseHome() {
  const [interestDismissed, setInterestDismissed] = useState(false)

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--atlas-background-muted)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "var(--atlas-spacing-6) var(--atlas-spacing-4)",
        fontFamily: "var(--atlas-font-sans)",
      }}
    >
      {/* Back link */}
      <div style={{ width: "100%", maxWidth: 390, marginBottom: "var(--atlas-spacing-3)" }}>
        <Link
          href="/prototypes"
          style={{
            fontSize: "var(--atlas-font-size-sm)",
            color: "var(--atlas-foreground-muted)",
            textDecoration: "none",
          }}
        >
          ← Prototypes
        </Link>
      </div>

      {/* Phone shell */}
      <div
        style={{
          width: "100%",
          maxWidth: 390,
          minHeight: 844,
          background: WISE.pageBg,
          borderRadius: "var(--atlas-radius-2xl)",
          boxShadow: "var(--atlas-shadow-xl)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* ── Status bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px var(--atlas-spacing-4) var(--atlas-spacing-1)",
            fontSize: "var(--atlas-font-size-sm)",
            fontWeight: "var(--atlas-font-weight-semibold)" as React.CSSProperties["fontWeight"],
            color: "var(--atlas-foreground)",
          }}
        >
          <span>9:41</span>
          <StatusBarIcons />
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 120 }}>

          {/* ── App header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--atlas-spacing-3) var(--atlas-spacing-4) var(--atlas-spacing-2)",
            }}
          >
            {/* Avatar */}
            <div style={{ position: "relative", display: "inline-flex" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--atlas-radius-full)",
                  background: "var(--atlas-background-muted)",
                  border: "1.5px solid var(--atlas-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--atlas-font-size-sm)",
                  fontWeight: "var(--atlas-font-weight-bold)" as React.CSSProperties["fontWeight"],
                  color: "var(--atlas-foreground)",
                  letterSpacing: "0.02em",
                }}
                aria-label="User avatar: WY"
              >
                WY
              </div>
              {/* Online dot */}
              <span
                style={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 10,
                  height: 10,
                  background: "var(--atlas-danger)",
                  borderRadius: "var(--atlas-radius-full)",
                  border: "2px solid white",
                }}
              />
            </div>

            {/* Right cluster */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-2)" }}>
              {/* Earn pill */}
              <button
                style={{
                  background: WISE.green,
                  border: "none",
                  borderRadius: "var(--atlas-radius-full)",
                  padding: "var(--atlas-spacing-1_5) var(--atlas-spacing-4)",
                  fontSize: "var(--atlas-font-size-sm)",
                  fontWeight: "var(--atlas-font-weight-semibold)" as React.CSSProperties["fontWeight"],
                  color: WISE.onGreen,
                  cursor: "pointer",
                  transition: `background var(--atlas-duration-fast) var(--atlas-easing-standard)`,
                }}
                aria-label="Earn SGD 100"
              >
                Earn SGD 100
              </button>

              {/* Eye / hide button */}
              <button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--atlas-radius-full)",
                  background: "var(--atlas-background-muted)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--atlas-foreground-muted)",
                  cursor: "pointer",
                }}
                aria-label="Toggle balance visibility"
              >
                <IconEye />
              </button>
            </div>
          </div>

          {/* ── Welcome heading ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--atlas-spacing-2) var(--atlas-spacing-4)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: "var(--atlas-font-weight-bold)" as React.CSSProperties["fontWeight"],
                color: "var(--atlas-foreground)",
                letterSpacing: "var(--atlas-letter-spacing-tight)",
                lineHeight: "var(--atlas-line-height-tight)",
              }}
            >
              Welcome to Wise
            </h1>
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--atlas-radius-full)",
                background: "var(--atlas-background-muted)",
                border: "1px solid var(--atlas-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--atlas-foreground-muted)",
                cursor: "pointer",
              }}
              aria-label="View analytics"
            >
              <IconBarChart />
            </button>
          </div>

          {/* ── Action pills ── */}
          <div
            style={{
              display: "flex",
              gap: "var(--atlas-spacing-2)",
              padding: "var(--atlas-spacing-2) var(--atlas-spacing-4) var(--atlas-spacing-4)",
            }}
          >
            {/* Send — filled green */}
            <button
              style={{
                background: WISE.green,
                border: "none",
                borderRadius: "var(--atlas-radius-full)",
                padding: "var(--atlas-spacing-2) var(--atlas-spacing-5)",
                fontSize: "var(--atlas-font-size-base)",
                fontWeight: "var(--atlas-font-weight-semibold)" as React.CSSProperties["fontWeight"],
                color: WISE.onGreen,
                cursor: "pointer",
                minHeight: "var(--atlas-touch-min)",
                transition: `background var(--atlas-duration-fast) var(--atlas-easing-standard)`,
              }}
            >
              Send
            </button>

            {/* Add money — outlined */}
            {["Add money", "Request"].map((label) => (
              <button
                key={label}
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--atlas-border-strong)",
                  borderRadius: "var(--atlas-radius-full)",
                  padding: "var(--atlas-spacing-2) var(--atlas-spacing-4)",
                  fontSize: "var(--atlas-font-size-base)",
                  fontWeight: "var(--atlas-font-weight-medium)" as React.CSSProperties["fontWeight"],
                  color: "var(--atlas-foreground)",
                  cursor: "pointer",
                  minHeight: "var(--atlas-touch-min)",
                  transition: `border-color var(--atlas-duration-fast) var(--atlas-easing-standard)`,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Balance cards (horizontal scroll) ── */}
          <div
            style={{
              display: "flex",
              gap: "var(--atlas-spacing-3)",
              padding: "0 var(--atlas-spacing-4) var(--atlas-spacing-6)",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {/* SGD balance card */}
            <div
              style={{
                minWidth: 200,
                borderRadius: "var(--atlas-radius-xl)",
                background: "var(--atlas-background-muted)",
                padding: "var(--atlas-spacing-4)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--atlas-spacing-8)",
                flexShrink: 0,
              }}
            >
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-2)" }}>
                <SingaporeFlag />
                <span
                  style={{
                    fontSize: "var(--atlas-font-size-base)",
                    fontWeight: "var(--atlas-font-weight-semibold)" as React.CSSProperties["fontWeight"],
                    color: "var(--atlas-foreground)",
                  }}
                >
                  SGD
                </span>
              </div>

              {/* Card footer: account + balance */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--atlas-spacing-1)",
                    color: "var(--atlas-foreground-muted)",
                    fontSize: "var(--atlas-font-size-sm)",
                    marginBottom: "var(--atlas-spacing-1)",
                  }}
                >
                  <IconBank />
                  <span>·· 044-78</span>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: "var(--atlas-font-weight-bold)" as React.CSSProperties["fontWeight"],
                    color: "var(--atlas-foreground)",
                    letterSpacing: "var(--atlas-letter-spacing-tight)",
                  }}
                >
                  30.00
                </div>
              </div>
            </div>

            {/* New currency card (dashed) */}
            <div
              style={{
                minWidth: 160,
                borderRadius: "var(--atlas-radius-xl)",
                background: "transparent",
                border: "1.5px dashed var(--atlas-border-strong)",
                padding: "var(--atlas-spacing-4)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              {/* Plus icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--atlas-radius-full)",
                  border: "1.5px solid var(--atlas-border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--atlas-foreground-muted)",
                }}
              >
                <IconPlus size={16} />
              </div>

              <div>
                <div
                  style={{
                    fontWeight: "var(--atlas-font-weight-semibold)" as React.CSSProperties["fontWeight"],
                    fontSize: "var(--atlas-font-size-base)",
                    color: "var(--atlas-foreground)",
                    marginBottom: "var(--atlas-spacing-1)",
                  }}
                >
                  New
                </div>
                <div
                  style={{
                    fontSize: "var(--atlas-font-size-xs)",
                    color: "var(--atlas-foreground-muted)",
                    lineHeight: "var(--atlas-line-height-normal)",
                  }}
                >
                  Spend, save and more in 40+ currencies
                </div>
              </div>
            </div>
          </div>

          {/* ── Transactions ── */}
          <div style={{ padding: "0 var(--atlas-spacing-4) var(--atlas-spacing-6)" }}>
            {/* Section header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--atlas-spacing-4)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--atlas-font-size-xl)",
                  fontWeight: "var(--atlas-font-weight-bold)" as React.CSSProperties["fontWeight"],
                  color: "var(--atlas-foreground)",
                }}
              >
                Transactions
              </h2>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: WISE.greenDark,
                  fontSize: "var(--atlas-font-size-base)",
                  fontWeight: "var(--atlas-font-weight-medium)" as React.CSSProperties["fontWeight"],
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                See all
              </button>
            </div>

            {/* Transaction row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--atlas-spacing-3)",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--atlas-radius-full)",
                  border: "1.5px solid var(--atlas-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--atlas-foreground-muted)",
                  flexShrink: 0,
                }}
              >
                <IconPlus size={18} />
              </div>

              {/* Description */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "var(--atlas-font-weight-medium)" as React.CSSProperties["fontWeight"],
                    fontSize: "var(--atlas-font-size-base)",
                    color: "var(--atlas-foreground)",
                    marginBottom: 2,
                  }}
                >
                  To your SGD balance
                </div>
                <div
                  style={{
                    fontSize: "var(--atlas-font-size-sm)",
                    color: "var(--atlas-foreground-muted)",
                  }}
                >
                  Added · Wed, Mar 12
                </div>
              </div>

              {/* Amount */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontWeight: "var(--atlas-font-weight-semibold)" as React.CSSProperties["fontWeight"],
                    fontSize: "var(--atlas-font-size-base)",
                    color: WISE.greenDark,
                    marginBottom: 2,
                  }}
                >
                  + 30 SGD
                </div>
                <div
                  style={{
                    fontSize: "var(--atlas-font-size-sm)",
                    color: "var(--atlas-foreground-muted)",
                  }}
                >
                  31.41 SGD
                </div>
              </div>
            </div>
          </div>

          {/* ── Introducing Interest ── */}
          {!interestDismissed && (
            <div style={{ padding: "0 var(--atlas-spacing-4) var(--atlas-spacing-6)" }}>
              <h2
                style={{
                  margin: "0 0 var(--atlas-spacing-3)",
                  fontSize: "var(--atlas-font-size-xl)",
                  fontWeight: "var(--atlas-font-weight-bold)" as React.CSSProperties["fontWeight"],
                  color: "var(--atlas-foreground)",
                }}
              >
                Introducing Interest
              </h2>

              {/* Dark promotional card */}
              <div
                style={{
                  borderRadius: "var(--atlas-radius-xl)",
                  background: WISE.promoCard,
                  minHeight: 160,
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                {/* Coral flower decorative shape */}
                <div
                  style={{
                    position: "absolute",
                    right: -10,
                    top: -20,
                    width: 200,
                    height: 200,
                  }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 200 200" width="200" height="200">
                    {/* Stylized coral/flower shapes */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                      <ellipse
                        key={i}
                        cx={100 + 45 * Math.cos((angle * Math.PI) / 180)}
                        cy={100 + 45 * Math.sin((angle * Math.PI) / 180)}
                        rx={32}
                        ry={20}
                        transform={`rotate(${angle}, ${100 + 45 * Math.cos((angle * Math.PI) / 180)}, ${100 + 45 * Math.sin((angle * Math.PI) / 180)})`}
                        fill={i % 2 === 0 ? WISE.coralLight : WISE.coral}
                        opacity={0.85}
                      />
                    ))}
                    <circle cx="100" cy="100" r="22" fill={WISE.coralCentre} />
                  </svg>
                </div>

                {/* Dismiss X button */}
                <button
                  onClick={() => setInterestDismissed(true)}
                  style={{
                    position: "absolute",
                    top: "var(--atlas-spacing-3)",
                    right: "var(--atlas-spacing-3)",
                    width: 28,
                    height: 28,
                    borderRadius: "var(--atlas-radius-full)",
                    background: WISE.onPromoOverlay,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    cursor: "pointer",
                    backdropFilter: "blur(4px)",
                  }}
                  aria-label="Dismiss Introducing Interest"
                >
                  <IconX />
                </button>

                {/* Card label */}
                <div
                  style={{
                    padding: "var(--atlas-spacing-4)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--atlas-font-size-sm)",
                      color: WISE.onPromoMuted,
                    }}
                  >
                    Earn more on your balance
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom nav (fixed inside shell) ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: WISE.pageBg,
            borderTop: "1px solid var(--atlas-border)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "var(--atlas-spacing-2) 0 var(--atlas-spacing-5)",
          }}
        >
          {[
            { label: "Home", icon: <IconHome active />, active: true },
            { label: "Card", icon: <IconCard />, active: false },
            { label: "Recipients", icon: <IconRecipients />, active: false },
            { label: "Payments", icon: <IconPayments />, active: false },
          ].map(({ label, icon, active }) => (
            <button
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--atlas-spacing-0_5)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "var(--atlas-spacing-1) var(--atlas-spacing-3)",
                minWidth: 56,
                minHeight: "var(--atlas-touch-min)",
                color: active ? WISE.greenDark : "var(--atlas-foreground-muted)",
              }}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              {icon}
              <span
                style={{
                  fontSize: "var(--atlas-font-size-xs)",
                  fontWeight: active
                    ? ("var(--atlas-font-weight-semibold)" as React.CSSProperties["fontWeight"])
                    : ("var(--atlas-font-weight-regular)" as React.CSSProperties["fontWeight"]),
                }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Wise branding bar ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            marginBottom: -44,
          }}
        />
      </div>

      {/* Branding strip below phone */}
      <div
        style={{
          marginTop: "var(--atlas-spacing-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--atlas-spacing-2)",
          fontSize: "var(--atlas-font-size-sm)",
          color: "var(--atlas-foreground-muted)",
        }}
      >
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--atlas-spacing-1)",
          background: WISE.green,
          color: WISE.onGreen,
          borderRadius: "var(--atlas-radius-sm)",
          padding: "2px 6px",
          fontWeight: "var(--atlas-font-weight-bold)" as React.CSSProperties["fontWeight"],
          fontSize: "var(--atlas-font-size-xs)",
        }}>
          ⚡ Wise
        </span>
        <span>curated by Atlas</span>
      </div>
    </div>
  )
}
