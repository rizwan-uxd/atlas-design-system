import { Platform } from 'react-native'
import type { ViewStyle } from 'react-native'
import type { ColorScheme } from '../theme'

// ??? Types ????????????????????????????????????????????????????????????????????

/**
 * Atlas shadow scale Ñ four levels of elevation.
 *
 * | Level | Use case                                   |
 * |-------|--------------------------------------------|
 * | sm    | Subtle lift Ñ hover cards, list items      |
 * | md    | Cards, dropdowns, tooltips                 |
 * | lg    | Bottom sheets, floating action buttons     |
 * | xl    | Dialogs, modals, full-screen overlays      |
 */
export type ShadowLevel = 'sm' | 'md' | 'lg' | 'xl'

/**
 * The subset of ViewStyle that shadowHelper returns.
 * Typed explicitly so callers know exactly which keys are injected.
 */
export type ShadowStyle = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>

// ??? Shadow tables ????????????????????????????????????????????????????????????

/**
 * iOS shadow parameters per level.
 * All offsets are purely vertical (x = 0) Ñ matches web box-shadow convention.
 */
const IOS_SHADOWS: Record<
  ShadowLevel,
  { offsetY: number; opacity: { light: number; dark: number }; radius: number }
> = {
  sm: { offsetY: 1,  opacity: { light: 0.06, dark: 0.20 }, radius: 2  },
  md: { offsetY: 2,  opacity: { light: 0.08, dark: 0.26 }, radius: 6  },
  lg: { offsetY: 4,  opacity: { light: 0.10, dark: 0.32 }, radius: 12 },
  xl: { offsetY: 8,  opacity: { light: 0.14, dark: 0.40 }, radius: 20 },
}

/**
 * Android elevation value per level.
 * Maps roughly to Material Design dp elevation tiers.
 */
const ANDROID_ELEVATION: Record<ShadowLevel, number> = {
  sm:  2,
  md:  4,
  lg:  8,
  xl:  16,
}

/**
 * Shadow colour per scheme.
 * Light uses near-black (neutral-950); dark uses pure black Ñ both give the
 * strongest contrast against their respective surface colours.
 */
const SHADOW_COLOR: Record<ColorScheme, string> = {
  light: '#080a0d', // tokens.primitive['neutral-950']
  dark:  '#000000', // tokens.primitive['neutral-1000']
}

// ??? Helper ???????????????????????????????????????????????????????????????????

/**
 * shadowHelper
 *
 * Returns a platform-correct shadow style object for the given elevation level
 * and colour scheme. Spread directly into a StyleSheet style or an inline style.
 *
 * On iOS  ? shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * On Android ? elevation  (shadowColor is also set for Android API 28+)
 * On Web  ? elevation  (RNW maps elevation to box-shadow)
 *
 * @example
 * import { shadowHelper } from '../utils/shadowHelper'
 *
 * // Inside a component:
 * const { colorScheme } = useTheme()
 *
 * const styles = StyleSheet.create({
 *   card: {
 *     borderRadius: tokens.radius.lg,
 *     backgroundColor: colors.surface,
 *     ...shadowHelper('md', colorScheme),
 *   },
 * })
 *
 * // Or inline:
 * <View style={[styles.base, shadowHelper('lg', colorScheme)]} />
 */
export function shadowHelper(
  level: ShadowLevel,
  colorScheme: ColorScheme = 'light',
): ShadowStyle {
  const color = SHADOW_COLOR[colorScheme]

  if (Platform.OS === 'android') {
    return {
      elevation:   ANDROID_ELEVATION[level],
      // shadowColor is respected on Android API 28+ (Pie) for coloured shadows.
      shadowColor: color,
    }
  }

  // iOS (and web via React Native Web's elevation fallback)
  const { offsetY, opacity, radius } = IOS_SHADOWS[level]
  return {
    shadowColor:   color,
    shadowOffset:  { width: 0, height: offsetY },
    shadowOpacity: opacity[colorScheme],
    shadowRadius:  radius,
  }
}

// ??? Convenience presets ??????????????????????????????????????????????????????

/**
 * Pre-baked shadow objects for light mode Ñ use when colorScheme is not
 * available at StyleSheet.create() time (StyleSheet.create runs once at module
 * load, before the theme is known).
 *
 * Prefer calling shadowHelper(level, colorScheme) inside a component when you
 * need dark-mode-correct shadows.
 *
 * @example
 * const styles = StyleSheet.create({
 *   card: { ...shadows.light.md }
 * })
 */
export const shadows = {
  light: {
    sm: shadowHelper('sm', 'light'),
    md: shadowHelper('md', 'light'),
    lg: shadowHelper('lg', 'light'),
    xl: shadowHelper('xl', 'light'),
  },
  dark: {
    sm: shadowHelper('sm', 'dark'),
    md: shadowHelper('md', 'dark'),
    lg: shadowHelper('lg', 'dark'),
    xl: shadowHelper('xl', 'dark'),
  },
} as const
