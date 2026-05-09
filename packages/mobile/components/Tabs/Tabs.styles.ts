import { StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabsVariant = 'line' | 'pill' | 'filled'

// ─── Per-variant strip wrapper ────────────────────────────────────────────────

/**
 * The strip is `position: 'relative'` so the absolute-positioned indicator
 * is clipped to the strip bounds and slides within it.
 */
function buildStripStyle(variant: TabsVariant, colors: Theme): ViewStyle {
  const base: ViewStyle = {
    flexDirection: 'row',
    position: 'relative',
  }

  switch (variant) {
    case 'pill':
      return {
        ...base,
        backgroundColor: colors.backgroundMuted,
        borderRadius: tokens.radius.full,
        padding: tokens.spacing[1],             // 4 — inset so pill sits inside
      }
    case 'filled':
      return {
        ...base,
        backgroundColor: colors.backgroundMuted,
        borderRadius: tokens.radius.lg,
        padding: tokens.spacing[1],
      }
    case 'line':
    default:
      return {
        ...base,
        borderBottomWidth: tokens.borderWidth[1],
        borderBottomColor: colors.border,
      }
  }
}

// ─── Per-variant animated indicator ──────────────────────────────────────────
//
// The indicator is `position: 'absolute'` inside the strip.
// `left` and `width` are driven by Animated.Values in the component —
// they are NOT set here (use-native-driver: false for layout props).
//
// What IS set here: shape, color, and vertical positioning.

function buildIndicatorStyle(
  variant: TabsVariant,
  colors: Theme,
  colorScheme: 'light' | 'dark',
): ViewStyle {
  const base: ViewStyle = { position: 'absolute' }

  switch (variant) {
    case 'pill':
      return {
        ...base,
        top: 0,
        bottom: 0,
        borderRadius: tokens.radius.full,
        backgroundColor: colors.surface,
        // Subtle shadow so the pill "lifts" off the background
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: colorScheme === 'dark' ? 0.28 : 0.12,
        shadowRadius: 3,
        elevation: 2,
      }
    case 'filled':
      return {
        ...base,
        top: 0,
        bottom: 0,
        borderRadius: tokens.radius.md,
        backgroundColor: colors.primary,
      }
    case 'line':
    default:
      return {
        ...base,
        bottom: 0,
        height: 2,
        borderRadius: tokens.radius.full,
        backgroundColor: colors.primary,
      }
  }
}

// ─── Per-tab trigger style (dynamic — varies by active / disabled) ────────────
//
// Not in StyleSheet.create because it depends on runtime per-tab state.
// Called once per tab during render — returns a plain ViewStyle object.

export function getTriggerStyle(
  variant:    TabsVariant,
  scrollable: boolean,
  active:     boolean,
  disabled:   boolean,
): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[4],   // 16
    paddingVertical:   tokens.spacing[2],   // 8
    minHeight: tokens.touchTarget.min,      // 44 — WCAG 2.5.5 / Apple HIG
    zIndex: 1,                              // sit above the absolute indicator
    // Equal-width flex tabs only when the strip is NOT horizontally scrollable.
    // Scrollable strips let tabs take their natural content width.
    ...(scrollable ? {} : { flex: 1 }),
    opacity: disabled ? tokens.opacity.disabled : 1,
  }
}

// ─── Per-tab trigger text style (dynamic — varies by active) ─────────────────

export function getTriggerTextStyle(
  variant: TabsVariant,
  colors:  Theme,
  active:  boolean,
): TextStyle {
  // Active text colour: white on filled (text sits over primary bg),
  // primary on line/pill (coloured label).
  const activeColor =
    variant === 'filled' ? colors.primaryForeground : colors.primary

  return {
    fontSize:   tokens.fontSize.sm,
    fontWeight: active ? tokens.fontWeight.semibold : tokens.fontWeight.medium,
    lineHeight: Math.round(tokens.fontSize.sm * tokens.lineHeight.normal),  // ~21
    color:      active ? activeColor : colors.foregroundMuted,
  }
}

// ─── Static style factory ─────────────────────────────────────────────────────
//
// Called once when the component mounts (or when variant / theme changes).
// Returns a StyleSheet for all non-dynamic styles.

export function createTabsStyles(
  variant:     TabsVariant,
  colors:      Theme,
  colorScheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    // ── Outer container ──────────────────────────────────────────────────────
    // flex: 1 so the content ScrollView stretches to fill available space.
    container: {
      flex: 1,
    },

    // ── Horizontal strip scroll-wrapper (used when scrollable=true) ──────────
    stripScroll: {
      flexGrow: 0,
      flexShrink: 0,
    },

    // ── Strip row ────────────────────────────────────────────────────────────
    strip: buildStripStyle(variant, colors),

    // ── Animated indicator ───────────────────────────────────────────────────
    // `left` and `width` are injected as inline animated styles in the component.
    indicator: buildIndicatorStyle(variant, colors, colorScheme),

    // ── Content pane area ────────────────────────────────────────────────────
    contentScroll: {
      flex: 1,
    },

    // ── Individual pane ──────────────────────────────────────────────────────
    // `width` is injected dynamically once the container lays out.
    pane: {
      overflow: 'hidden',
    },
  })
}
