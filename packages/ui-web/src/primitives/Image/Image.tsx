"use client"

/**
 * Atlas Image — a picture with a fixed aspect ratio, a loading state and an error fallback.
 *
 * Props (code): ratio 1:1 | 4:3 | 3:2 | 16:9 | 16:10 | 9:16 | 3:4 | 2:3 | 4:5 | auto,
 *   fit cover | contain, radius none | sm | md | lg | xl | full, fallback slot.
 * Figma variants: Ratio (ten values) × State (loaded | loading | error).
 * Sizing: fills its container's width; height follows the ratio (`auto` keeps the natural size).
 * States: loading shows a Skeleton until the image loads (a cached image skips it; one that already failed goes straight to error); error shows
 *   the fallback slot, or a background-muted block with the image-off icon.
 * Accessibility: alt is required (pass "" for a decorative image). The default fallback is an
 *   img role named by alt, or aria-hidden when alt is empty. The Skeleton is aria-hidden.
 *
 * Figma: Image set 534:35 (Ratio × State). Plain img wrapper, not next/image.
 */

import * as React from "react"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import styles from "./Image.module.css"

export type ImageRatio = "1:1" | "4:3" | "3:2" | "16:9" | "16:10" | "9:16" | "3:4" | "2:3" | "4:5" | "auto"
export type ImageFit = "cover" | "contain"
export type ImageRadius = "none" | "sm" | "md" | "lg" | "xl" | "full"
export type ImageState = "loading" | "loaded" | "error"

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt" | "src" | "className" | "style"> {
  /** Image URL. */
  src: string
  /** Alternative text. Required; pass an empty string for a decorative image. */
  alt: string
  /** Aspect ratio of the box. `auto` keeps the image's natural size. */
  ratio?: ImageRatio
  /** How the picture fills the box. */
  fit?: ImageFit
  /** Corner radius, mapped to the radius tokens. */
  radius?: ImageRadius
  /** Shown instead of the default fallback when the image fails to load. */
  fallback?: React.ReactNode
  /** Class for the wrapper element. */
  className?: string
  /** Style for the wrapper element. */
  style?: React.CSSProperties
}

export function Image({
  src,
  alt,
  ratio = "auto",
  fit = "cover",
  radius = "md",
  fallback,
  className,
  style,
  onLoad,
  onError,
  ...imgProps
}: ImageProps) {
  // Status belongs to a src: a new src starts loading again without an effect-driven reset.
  const [result, setResult] = React.useState<{ src: string; status: "loaded" | "error" } | null>(null)
  const state: ImageState = result && result.src === src ? result.status : "loading"
  const imgRef = React.useRef<HTMLImageElement>(null)

  // An image that finished (or failed) before hydration never fires onLoad or onError.
  React.useEffect(() => {
    const el = imgRef.current
    if (el && el.complete) setResult({ src, status: el.naturalWidth > 0 ? "loaded" : "error" })
  }, [src])

  const cls = [styles.image, className].filter(Boolean).join(" ")
  const decorative = alt === ""

  return (
    <div className={cls} style={style} data-ratio={ratio} data-fit={fit} data-radius={radius} data-state={state}>
      {state !== "error" && (
        <img
          {...imgProps}
          ref={imgRef}
          className={styles.img}
          src={src}
          alt={alt}
          onLoad={(e) => {
            setResult({ src, status: "loaded" })
            onLoad?.(e)
          }}
          onError={(e) => {
            setResult({ src, status: "error" })
            onError?.(e)
          }}
        />
      )}
      {state === "loading" && <Skeleton className={styles.skeleton} />}
      {state === "error" &&
        (fallback ?? (
          <div
            className={styles.fallback}
            role={decorative ? undefined : "img"}
            aria-label={decorative ? undefined : alt}
            aria-hidden={decorative ? true : undefined}
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <line x1="2" x2="22" y1="2" y2="22" />
              <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
              <line x1="13.5" x2="6" y1="13.5" y2="21" />
              <line x1="18" x2="21" y1="12" y2="15" />
              <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
              <path d="M21 15V5a2 2 0 0 0-2-2H9" />
            </svg>
          </div>
        ))}
    </div>
  )
}
