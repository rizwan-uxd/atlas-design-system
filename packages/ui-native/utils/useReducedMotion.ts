import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

// ??? Hook ?????????????????????????????????????????????????????????????????????

/**
 * useReducedMotion
 *
 * Returns `true` when the user has enabled the "Reduce Motion" accessibility
 * setting on their device. Stays in sync with live changes Ñ no restart needed.
 *
 * iOS:     Settings ? Accessibility ? Motion ? Reduce Motion
 * Android: Settings ? Accessibility ? Remove Animations (or Transition Animation Scale = off)
 *
 * Every animated Atlas component must call this hook and skip or shorten
 * animations when it returns `true`.
 *
 * @example
 * import { useReducedMotion, getDuration } from '../utils/useReducedMotion'
 * import tokens from '../tokens/atlas.tokens'
 *
 * function FadeIn({ children }: { children: React.ReactNode }) {
 *   const reduceMotion = useReducedMotion()
 *   const opacity = useRef(new Animated.Value(0)).current
 *
 *   useEffect(() => {
 *     Animated.timing(opacity, {
 *       toValue: 1,
 *       duration: getDuration(tokens.duration.base, reduceMotion),
 *       useNativeDriver: true,
 *     }).start()
 *   }, [])
 *
 *   return <Animated.View style={{ opacity }}>{children}</Animated.View>
 * }
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    // Read the current value asynchronously on mount.
    // useState is initialised to false (motion allowed) so there is no flash
    // of incorrect animation Ñ the worst case is one frame of animation before
    // the Promise resolves and state updates.
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)

    // Subscribe to live changes so toggling the system setting mid-session
    // takes effect immediately without a restart.
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    )

    return () => subscription.remove()
  }, [])

  return reduceMotion
}

// ??? Helpers ??????????????????????????????????????????????????????????????????

/**
 * getDuration
 *
 * Returns 0 when reduced motion is enabled, otherwise the supplied duration.
 * Use this wherever you pass a `duration` to `Animated.timing` or
 * `Animated.spring` to make every animation respect the accessibility setting
 * with a single call.
 *
 * @param ms           - Duration in milliseconds (typically from tokens.duration)
 * @param reduceMotion - Value returned by useReducedMotion()
 *
 * @example
 * Animated.timing(anim, {
 *   toValue:         1,
 *   duration:        getDuration(tokens.duration.base, reduceMotion),
 *   useNativeDriver: true,
 * }).start()
 */
export function getDuration(ms: number, reduceMotion: boolean): number {
  return reduceMotion ? 0 : ms
}

/**
 * getScale
 *
 * Convenience helper for scale/slide animations Ñ returns the identity value
 * when reduced motion is on, otherwise the animated target value.
 * Prevents scale-from-zero entrance animations from running.
 *
 * @example
 * // Checkbox check-mark scale: 0 ? 1 when checked
 * Animated.timing(scale, {
 *   toValue:         getScale(1, reduceMotion),
 *   duration:        getDuration(tokens.duration.fast, reduceMotion),
 *   useNativeDriver: true,
 * }).start()
 */
export function getScale(target: number, reduceMotion: boolean): number {
  return reduceMotion ? target : target
}

// Note on getScale: when reduceMotion is true the caller should also set
// duration to 0 via getDuration Ñ the value jumps to target instantly.
// getScale is a no-op today but kept for symmetry and future use (e.g. if
// we ever want to cap scale to a smaller value rather than skip entirely).
