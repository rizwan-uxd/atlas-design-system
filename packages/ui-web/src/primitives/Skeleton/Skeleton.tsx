"use client"

/**
 * Atlas Skeleton — a placeholder block shown where content is still loading.
 *
 * Variants (Shape): rect | circle
 * Size: none — a skeleton fills its container's width and takes its height from the layout.
 *   Defaults: rect 16 tall (spacing-4), circle 40 (spacing-10). Override with className or style.
 * States: none interactive. Motion: a pulse — opacity 1 → --atlas-opacity-pulse → 1 over
 *   --atlas-duration-pulse, standard easing, looping; stopped under prefers-reduced-motion.
 * Accessibility: aria-hidden, no role. The loading container sets aria-busy="true" and owns any
 *   announcement (compose Avatar, Text, Card, Form or Table placeholders from several blocks).
 *
 * Figma: Skeleton set 531:5 (Shape). Colour is background-muted.
 */

import * as React from "react"
import styles from "./Skeleton.module.css"

export type SkeletonShape = "rect" | "circle"

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role"> {
  /** Rounded block (`rect`, default) or round (`circle`, for avatars). */
  shape?: SkeletonShape
}

export function Skeleton({ shape = "rect", className, ...props }: SkeletonProps) {
  const cls = [styles.skeleton, className].filter(Boolean).join(" ")
  return <div {...props} className={cls} data-shape={shape} aria-hidden="true" />
}
