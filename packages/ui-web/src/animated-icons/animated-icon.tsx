"use client"

/**
 * Atlas AnimatedIcon — an outline icon that animates from motion tokens.
 *
 * Icons: check | x | search | settings | download | upload | refresh | bell | plug-connected | panel-left-open
 *        | airplay | volume | mic | mic-v2 | video | video-v2 | play-pause-circle | play-pause
 *        | skip-back | skip-forward
 * Sizes: xs 16 | sm 20 | md 24 | lg 32 (icon-size tokens; stroke follows icon-stroke tokens)
 * Tone: default (inherits text colour) | muted | success | warning | danger | info
 * Trigger (when it plays): manual | appear | hover | press | focus | loop | toggle
 * State (what it says): idle | loading | success | error | disabled
 *
 * Motion: durations, easings and the pulse opacity come from the motion tokens via MotionProvider.
 *   Reduced motion: `MotionConfig reducedMotion="user"` drops transforms, and this component also
 *   drops path, opacity and loop animation. Icons render their static end state; `appear` becomes
 *   a short opacity fade.
 * Accessibility: decorative (`aria-hidden`) unless `label` is set, which makes it `role="img"`.
 * Toggle: `trigger="toggle"` follows the controlled `pressed` prop. The parent control owns the
 *   state and `aria-pressed`; the icon plays its toggle timeline forward when `pressed` becomes true
 *   and backward when it becomes false, continuing from the current frame if flipped mid-flight.
 *   Momentary icons (skip) restart forward from frame 0 on every change instead.
 *   Reduced motion and disabled jump straight to the target pose.
 * Parent-driven: `hover`, `press` and `focus` listen on the nearest interactive ancestor, so
 *   `<Button><AnimatedIcon trigger="hover" /></Button>` needs no wiring. For any other case use the
 *   ref handle (`startAnimation` / `stopAnimation`).
 */

import * as React from "react"
import { animate as animateValue, motion, useAnimate } from "motion/react"
import { useMotionPresets, usePrefersReducedMotion } from "../motion"
import { animatedIconRegistry } from "./animated-icon.registry"
import { frameSeconds } from "./timeline"
import type {
  AnimatedIconHandle,
  AnimatedIconProps,
  IconMotionContext,
  IconPlayback,
} from "./animated-icon.types"
import styles from "./animated-icon.module.css"

type PlayKind = "appear" | "hover" | "press" | "loop" | "success" | "error"

const INTERACTIVE = "button, a[href], [role='button'], [role='tab'], [role='menuitem'], label, summary"

function isDisabledTarget(el: Element): boolean {
  return el.matches(":disabled, [aria-disabled='true']")
}

function isFocusVisible(el: Element): boolean {
  try {
    return el.matches(":focus-visible")
  } catch {
    return true
  }
}

export const AnimatedIcon = React.forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function AnimatedIcon(
    {
      name,
      size = "md",
      tone = "default",
      trigger = "manual",
      state = "idle",
      disabled = false,
      pressed = false,
      label,
      className,
      ...props
    },
    ref,
  ) {
    const definition = animatedIconRegistry[name]
    const presets = useMotionPresets()
    const reduced = usePrefersReducedMotion()
    const [scope, animate] = useAnimate<SVGSVGElement>()
    const running = React.useRef(new Set<IconPlayback>())
    const isDisabled = disabled || state === "disabled"
    const uid = React.useId().replace(/:/g, "")
    const toggle = trigger === "toggle" ? definition.toggle : undefined
    const progress = React.useRef(pressed ? 1 : 0)
    const toggleRun = React.useRef<IconPlayback | null>(null)

    const track = React.useCallback(<T extends IconPlayback>(playback: T): T => {
      running.current.add(playback)
      return playback
    }, [])

    const cancel = React.useCallback(() => {
      running.current.forEach((playback) => playback.stop())
      running.current.clear()
    }, [])

    /** Return every part to rest: quickly, or instantly under reduced motion. */
    const rest = React.useCallback(() => {
      const root = scope.current
      if (!root) return
      const options = reduced ? { duration: 0 } : presets.quick
      if (!isDisabled) animate(root, { x: 0, scale: 1, opacity: 1 }, options)
      // Not every icon has drawn paths, and motion throws when a selector matches nothing.
      const parts = root.querySelectorAll("[data-part]")
      const drawn = root.querySelectorAll("[data-draw]")
      if (parts.length) animate(parts, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }, options)
      if (drawn.length) animate(drawn, { pathLength: 1, pathOffset: 0 }, options)
    }, [animate, isDisabled, presets, reduced, scope])

    const play = React.useCallback(
      (kind: PlayKind) => {
        const root = scope.current
        if (!root || isDisabled) return

        if (reduced) {
          if (kind === "appear") track(animate(root, { opacity: [0, 1] }, presets.quick))
          return
        }

        const ctx: IconMotionContext = {
          animate: (selector, keyframes, options) => track(animate(selector, keyframes, options)),
          presets,
        }

        switch (kind) {
          case "appear":
            animate(root, { opacity: 1 }, { duration: 0 })
            definition.appear(ctx)
            break
          case "hover":
            definition.hover(ctx)
            break
          case "press":
            if (definition.press) definition.press(ctx)
            else track(animate(root, { scale: 0.9 }, presets.quick))
            break
          case "loop":
            if (definition.loop) definition.loop(ctx)
            else track(animate(root, { opacity: [1, presets.pulseOpacity, 1] }, presets.pulse))
            break
          case "success":
            if (definition.success) definition.success(ctx)
            else track(animate(root, { scale: [1, 1.2, 1] }, presets.emphasis))
            break
          case "error":
            track(animate(root, { x: [0, -2, 2, -1, 0] }, presets.emphasis))
            break
        }
      },
      [animate, definition, isDisabled, presets, reduced, scope, track],
    )

    // State: loading loops, success and error play once when they are entered.
    React.useEffect(() => {
      if (isDisabled) return
      if (state === "loading") {
        play("loop")
        return () => {
          cancel()
          rest()
        }
      }
      if (state === "success") play("success")
      if (state === "error") play("error")
    }, [state, isDisabled, play, cancel, rest])

    // Toggle: lay out the starting pose before paint, then follow `pressed`.
    React.useLayoutEffect(() => {
      const root = scope.current
      if (root && toggle) toggle.render(root, progress.current * (toggle.frames - 1))
      // eslint-disable-next-line react-hooks/exhaustive-deps -- first pose only; changes go through the effect below
    }, [toggle])

    const lastPressed = React.useRef(pressed)
    React.useEffect(() => {
      const root = scope.current
      if (!root || !toggle) return
      const changed = lastPressed.current !== pressed
      lastPressed.current = pressed
      const seconds = toggle.duration?.(presets) ?? frameSeconds(toggle.frames)
      const end = toggle.frames - 1

      // Momentary: every change restarts from frame 0 and holds the last frame.
      if (toggle.momentary) {
        if (!changed) return
        toggleRun.current?.stop()
        if (reduced || isDisabled || seconds <= 0) {
          progress.current = 1
          toggle.render(root, end)
          return
        }
        progress.current = 0
        toggle.render(root, 0)
        toggleRun.current = animateValue(0, 1, {
          duration: seconds,
          ease: "linear",
          onUpdate: (value) => {
            progress.current = value
            toggle.render(root, value * end)
          },
        })
        return
      }

      const target = pressed ? 1 : 0
      toggleRun.current?.stop()
      toggleRun.current = null
      const from = progress.current
      if (from === target) return
      if (reduced || isDisabled || seconds <= 0) {
        progress.current = target
        toggle.render(root, target * end)
        return
      }
      toggleRun.current = animateValue(from, target, {
        duration: seconds * Math.abs(target - from),
        ease: "linear",
        onUpdate: (value) => {
          progress.current = value
          toggle.render(root, value * end)
        },
      })
    }, [pressed, toggle, presets, reduced, isDisabled, scope])

    React.useEffect(() => () => toggleRun.current?.stop(), [])

    // Trigger: appear and loop start on their own; hover, press and focus listen on the control.
    React.useEffect(() => {
      const root = scope.current
      if (!root || isDisabled) return

      if (trigger === "appear") {
        play("appear")
        return
      }
      if (trigger === "loop") {
        if (state === "loading") return
        play("loop")
        return () => {
          cancel()
          rest()
        }
      }
      if (trigger !== "hover" && trigger !== "press" && trigger !== "focus") return

      const target = root.closest(INTERACTIVE) ?? root
      const live = () => !isDisabledTarget(target)
      const settle = () => {
        cancel()
        rest()
      }
      const listeners: Array<[string, () => void]> =
        trigger === "hover"
          ? [
              ["pointerenter", () => live() && play("hover")],
              ["pointerleave", settle],
            ]
          : trigger === "press"
            ? [
                ["pointerdown", () => live() && play("press")],
                ["pointerup", settle],
                ["pointerleave", settle],
                ["pointercancel", settle],
              ]
            : [
                ["focusin", () => live() && isFocusVisible(target) && play("hover")],
                ["focusout", settle],
              ]

      listeners.forEach(([type, handler]) => target.addEventListener(type, handler))
      return () => listeners.forEach(([type, handler]) => target.removeEventListener(type, handler))
    }, [trigger, state, isDisabled, play, cancel, rest, scope])

    React.useImperativeHandle(
      ref,
      () => ({
        startAnimation: () => {
          cancel()
          play("hover")
        },
        stopAnimation: () => {
          cancel()
          rest()
        },
      }),
      [cancel, play, rest],
    )

    const cls = [styles.icon, className].filter(Boolean).join(" ")

    return (
      <motion.svg
        {...props}
        ref={scope}
        className={cls}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        focusable="false"
        initial={trigger === "appear" && !isDisabled ? { opacity: 0 } : false}
        data-icon={name}
        data-size={size}
        data-tone={tone}
        data-trigger={trigger}
        data-state={state}
        data-disabled={isDisabled}
        data-pressed={toggle ? pressed : undefined}
      >
        {typeof definition.glyph === "function" ? definition.glyph(uid) : definition.glyph}
      </motion.svg>
    )
  },
)
