"use client"

/**
 * Atlas StatCard — one headline metric on an outlined Card
 *
 * Sizes:     sm | md | lg   (mirror Card; value text is font-size 2xl | 3xl | 4xl)
 * States:    default · loading
 * Delta:     trend up | down | flat, sentiment positive | negative | neutral
 *            (Badge success | danger | neutral). Sentiment defaults from the trend;
 *            set it when down is good (error rate, latency).
 *
 * Anatomy:   [Card: title (label) · description (period) · icon · value · delta badge]
 * Icon:      optional leading icon (16 px, muted) above the value; decorative, stays while loading
 *
 * Accessibility:
 *   - The delta text starts with the word Up, Down or Flat, so it never relies on colour
 *   - While loading, the content region has aria-busy and the skeletons are aria-hidden
 *   - The value is plain text; an empty metric is passed as "—"
 *   - The icon is decorative (aria-hidden); the label carries the meaning
 *
 * Rules:
 *   - Always pass a period; a metric without one is ambiguous
 *   - StatCard owns layout only; the surface is Card variant="outlined"
 */

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import styles from "./StatCard.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type StatCardSize = "sm" | "md" | "lg"
export type StatCardTrend = "up" | "down" | "flat"
export type StatCardSentiment = "positive" | "negative" | "neutral"

export interface StatCardDelta {
  /** The change and its comparison, without the direction word: "12% vs previous period" */
  text: string
  trend: StatCardTrend
  /** Defaults from the trend: up positive, down negative, flat neutral */
  sentiment?: StatCardSentiment
  /** Replaces the direction word (Up, Down, Flat), for other languages */
  trendLabel?: string
}

export interface StatCardProps {
  size?: StatCardSize
  /** The metric name */
  label: React.ReactNode
  /** The period the value covers: "Last 7 days" */
  period: React.ReactNode
  /** The headline number, formatted by the caller */
  value: React.ReactNode
  delta?: StatCardDelta
  /** Optional leading icon above the value, e.g. <Users />. Decorative; stays while loading */
  icon?: React.ReactNode
  /** Shows skeletons in place of the value and the delta */
  loading?: boolean
  className?: string
  id?: string
}

/* ── Maps ───────────────────────────────────────────────────── */

const TREND_WORD: Record<StatCardTrend, string> = { up: "Up", down: "Down", flat: "Flat" }
const DEFAULT_SENTIMENT: Record<StatCardTrend, StatCardSentiment> = {
  up: "positive",
  down: "negative",
  flat: "neutral",
}
const BADGE_VARIANT = { positive: "success", negative: "danger", neutral: "neutral" } as const

/* ── Component ──────────────────────────────────────────────── */

export function StatCard({
  size = "md",
  label,
  period,
  value,
  delta,
  icon,
  loading = false,
  className,
  id,
}: StatCardProps) {
  const sentiment = delta ? (delta.sentiment ?? DEFAULT_SENTIMENT[delta.trend]) : undefined

  return (
    <Card variant="outlined" size={size} className={className} id={id}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{period}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={styles.stat} data-size={size} aria-busy={loading || undefined}>
          {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
          {loading ? (
            <>
              <Skeleton className={styles.valueSkeleton} />
              <Skeleton className={styles.deltaSkeleton} />
            </>
          ) : (
            <>
              <p className={styles.value}>{value}</p>
              {delta && sentiment && (
                <Badge size="sm" variant={BADGE_VARIANT[sentiment]}>
                  {delta.trendLabel ?? TREND_WORD[delta.trend]} {delta.text}
                </Badge>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
