"use client"

/**
 * Atlas Avatar — identity image, initials or person icon, with an optional status dot and badge icon
 *
 * Figma:     Type (Image | Text | Icon) × Size × Shape — Type is derived from the props, not passed
 * Shapes:    circle | squircle
 * Sizes:     xs | sm | md | lg | xl
 * States:    presentational — no hover, active or disabled (only the AvatarGroup add button is interactive)
 *
 * Content fallback: valid image (`src`) → `initials` → person icon (`icon` swaps it).
 *
 * Slots:
 *   showStatus     — status dot at inline-end / block-end (default success token; `statusIndicator` swaps it)
 *   showBadgeIcon  — plus badge at the same corner (`badgeIcon` swaps the glyph)
 *
 * Subcomponent: AvatarGroup — overlapping stack; `showAdd` appends a plus avatar button.
 *
 * Accessibility:
 *   - `alt` is the accessible name. Informative avatar → meaningful alt; decorative avatar beside a
 *     visible name → alt="" (the avatar is hidden from assistive tech).
 *   - A failed image falls back to initials, then the icon; the accessible name does not change.
 *   - The status dot is never colour-only: `statusLabel` is appended to the accessible name.
 *   - AvatarGroup renders role="group"; give it an aria-label. The add avatar is a <button>.
 */

import React from "react"
import styles from "./Avatar.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type AvatarShape = "circle" | "squircle"
export type AvatarSize  = "xs" | "sm" | "md" | "lg" | "xl"

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "role"> {
  shape?:           AvatarShape
  size?:            AvatarSize
  /** Image URL. If it fails to load, the avatar falls back to initials, then the icon. */
  src?:             string
  /** Accessible name. Use alt="" for a decorative avatar next to a visible name. */
  alt?:             string
  /** Text fallback, e.g. "JD". Shown when there is no valid image. */
  initials?:        string
  /** Replaces the default person icon (the last fallback). */
  icon?:            React.ReactNode
  /** Shows the status dot. */
  showStatus?:      boolean
  /** Text alternative for the status, e.g. "Online". Required when showStatus is true. */
  statusLabel?:     string
  /** Replaces the default status dot. */
  statusIndicator?: React.ReactNode
  /** Shows the plus badge at the status corner. */
  showBadgeIcon?:   boolean
  /** Replaces the default plus glyph inside the badge. */
  badgeIcon?:       React.ReactNode
}

export interface AvatarGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  size?:      AvatarSize
  shape?:     AvatarShape
  /** Appends a trailing plus avatar button. */
  showAdd?:   boolean
  onAdd?:     () => void
  /** Accessible name of the add button. */
  addLabel?:  string
  children:   React.ReactNode
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

interface AvatarGroupContextValue { size: AvatarSize; shape: AvatarShape }
const AvatarGroupContext = React.createContext<AvatarGroupContextValue | null>(null)

/* Inline SVG glyphs (repo convention: no icon dependency). Stroke comes from the CSS module. */

function PersonGlyph() {
  return (
    <svg className={styles.svg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function PlusGlyph() {
  return (
    <svg className={styles.svg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

/* ── Avatar ─────────────────────────────────────────────────────── */

export function Avatar({
  shape,
  size,
  src,
  alt,
  initials,
  icon,
  showStatus      = false,
  statusLabel,
  statusIndicator,
  showBadgeIcon   = false,
  badgeIcon,
  className,
  ...rest
}: AvatarProps) {
  const group = React.useContext(AvatarGroupContext)
  const resolvedSize  = size  ?? group?.size  ?? "md"
  const resolvedShape = shape ?? group?.shape ?? "circle"

  const [failedSrc, setFailedSrc] = React.useState<string | undefined>(undefined)
  const showImage = Boolean(src) && failedSrc !== src

  /* An image that fails during server render errors before hydration, so onError never fires. */
  const imgRef = React.useRef<HTMLImageElement>(null)
  React.useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) setFailedSrc(src)
  }, [src])
  const text = initials?.trim()

  if (process.env.NODE_ENV !== "production") {
    if (alt === undefined) {
      console.warn(
        '[Atlas Avatar] pass `alt`: a meaningful name for an informative avatar, or alt="" when it sits next to a visible name.'
      )
    }
    if (showStatus && !statusLabel) {
      console.warn("[Atlas Avatar] showStatus=true requires `statusLabel` so the status is not colour-only.")
    }
  }

  const name = [alt, showStatus ? statusLabel : undefined].filter(Boolean).join(", ")

  return (
    <span
      {...rest}
      className={cx(styles.root, className)}
      data-size={resolvedSize}
      data-shape={resolvedShape}
      role={name ? "img" : undefined}
      aria-label={name || undefined}
      aria-hidden={name ? undefined : true}
    >
      <span className={styles.surface}>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- the accessible name lives on the root
          <img ref={imgRef} className={styles.image} src={src} alt="" onError={() => setFailedSrc(src)} />
        ) : text ? (
          <span aria-hidden="true">{text}</span>
        ) : (
          <span className={styles.glyph} aria-hidden="true">{icon ?? <PersonGlyph />}</span>
        )}
      </span>

      {(showBadgeIcon || showStatus) && (
        <span className={styles.badge} aria-hidden="true">
          {showBadgeIcon && (
            <span className={cx(styles.badgeLayer, styles.badgeIcon)}>
              <span className={styles.badgeGlyph}>{badgeIcon ?? <PlusGlyph />}</span>
            </span>
          )}
          {showStatus && (statusIndicator ?? <span className={cx(styles.badgeLayer, styles.statusDot)} />)}
        </span>
      )}
    </span>
  )
}

/* ── AvatarGroup ────────────────────────────────────────────────── */

export function AvatarGroup({
  size     = "md",
  shape    = "circle",
  showAdd  = false,
  onAdd,
  addLabel = "Add member",
  className,
  children,
  ...rest
}: AvatarGroupProps) {
  if (
    process.env.NODE_ENV !== "production" &&
    !rest["aria-label"] &&
    !rest["aria-labelledby"]
  ) {
    console.warn("[Atlas AvatarGroup] pass `aria-label` (e.g. \"Project members\") to name the group.")
  }

  return (
    <AvatarGroupContext.Provider value={{ size, shape }}>
      <div {...rest} role="group" className={cx(styles.group, className)}>
        {children}
        {showAdd && (
          <button
            type="button"
            className={styles.addButton}
            data-size={size}
            data-shape={shape}
            aria-label={addLabel}
            onClick={onAdd}
          >
            <Avatar alt="" icon={<PlusGlyph />} />
          </button>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
}
