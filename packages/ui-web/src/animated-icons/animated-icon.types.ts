import type { ReactNode, SVGProps } from "react"
import type { AnimationOptions, DOMKeyframesDefinition } from "motion/react"
import type { MotionPresets } from "../motion"

/** Icons in the registry. Add a name here, then a definition in `icons/` and `animated-icon.registry.ts`. */
export type AnimatedIconName =
  | "check"
  | "x"
  | "search"
  | "settings"
  | "download"
  | "upload"
  | "refresh"
  | "bell"
  | "plug-connected"
  | "panel-left-open"

/** Icon size: 16, 20, 24 or 32px (icon-size tokens; stroke follows the icon-stroke tokens). */
export type AnimatedIconSize = "xs" | "sm" | "md" | "lg"

/** Semantic colour. `default` inherits the surrounding text colour. */
export type AnimatedIconTone = "default" | "muted" | "success" | "warning" | "danger" | "info"

/**
 * When the icon plays its own animation.
 * - `manual`  never on its own; drive it with the ref handle
 * - `appear`  once on mount
 * - `hover` / `press` / `focus`  from the nearest interactive ancestor (button, link, tab, menu
 *   item, label), or the icon itself when it has none
 * - `loop`    continuously while mounted
 */
export type AnimatedIconTrigger = "manual" | "appear" | "hover" | "press" | "focus" | "loop"

/**
 * What the icon is communicating, independent of when it animates.
 * - `idle`     at rest
 * - `loading`  loops (the icon's own loop, or a pulse)
 * - `success`  plays a one-shot confirmation
 * - `error`    plays a one-shot shake
 * - `disabled` static, dimmed; same as the `disabled` prop
 */
export type AnimatedIconState = "idle" | "loading" | "success" | "error" | "disabled"

/** Imperative handle for parent-driven animation, e.g. a Button playing its icon on hover or focus. */
export interface AnimatedIconHandle {
  /** Play the icon's hover animation. No-op while disabled. */
  startAnimation: () => void
  /** Stop and return every part to rest. */
  stopAnimation: () => void
}

type ReservedSvgProps =
  | "ref"
  | "name"
  | "color"
  | "children"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDragStart"
  | "onDrop"
  | "values"

export interface AnimatedIconProps extends Omit<SVGProps<SVGSVGElement>, ReservedSvgProps> {
  /** Which icon to render. */
  name: AnimatedIconName
  size?: AnimatedIconSize
  tone?: AnimatedIconTone
  trigger?: AnimatedIconTrigger
  state?: AnimatedIconState
  /** Static and dimmed. Equivalent to `state="disabled"`. */
  disabled?: boolean
  /** Accessible name. Without it the icon is decorative (`aria-hidden`). */
  label?: string
}

// ─── Icon authoring contract ─────────────────────────────────────────────────

/** Minimal playback handle an icon animation returns. */
export interface IconPlayback {
  stop: () => void
}

/** What an icon animation gets: a scoped `animate` and the token-based presets. */
export interface IconMotionContext {
  /** Animate elements inside this icon's svg by CSS selector, e.g. `[data-part="arrow"]`. */
  animate: (
    selector: string,
    keyframes: DOMKeyframesDefinition,
    options?: AnimationOptions,
  ) => IconPlayback
  presets: MotionPresets
}

export type IconAnimation = (ctx: IconMotionContext) => void

/**
 * One icon: static glyph plus named animations. Mark movable parts `data-part="…"` (reset to rest
 * automatically) and drawn paths `data-draw` (their `pathLength` resets to 1). Durations and
 * easings come from `ctx.presets`, never literals. Every icon is 24×24, outline, stroke from
 * the size token.
 */
export interface AnimatedIconDefinition {
  glyph: ReactNode
  appear: IconAnimation
  hover: IconAnimation
  /** Falls back to a small scale-down. */
  press?: IconAnimation
  /** Also used for `state="loading"`. Falls back to an opacity pulse. */
  loop?: IconAnimation
  /** Falls back to a scale pop. */
  success?: IconAnimation
}
