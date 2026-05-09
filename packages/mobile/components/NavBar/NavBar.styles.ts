import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'
import { shadowHelper } from '../../utils/shadowHelper'
import type { ColorScheme } from '../../theme'

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeaderVariant  = 'default' | 'transparent' | 'elevated'
export type TabBarVariant  = 'default' | 'floating'

/** Height of the header content row (below the status-bar safe area). */
export const HEADER_HEIGHT = 56

/** Height of a single tab item, enforcing 44pt minimum touch target. */
export const TAB_ITEM_HEIGHT = 56

// ─── Header styles ────────────────────────────────────────────────────────────

/**
 * createHeaderStyles
 *
 * Returns a StyleSheet for the given Header configuration.
 *
 * Variants:
 *   default      — opaque surface background + subtle bottom border
 *   transparent  — no background; positioned absolute so content scrolls under
 *   elevated     — surface background + sm-level shadow via shadowHelper
 *
 * Safe-area top inset is NOT baked in here — the component adds it dynamically
 * via useSafeAreaInsets() so the style factory stays pure and testable.
 *
 * @param variant     - 'default' | 'transparent' | 'elevated'
 * @param colors      - resolved semantic colour tokens from useTheme()
 * @param colorScheme - 'light' | 'dark' — forwarded to shadowHelper
 */
export function createHeaderStyles(
  variant:     HeaderVariant,
  colors:      Theme,
  colorScheme: ColorScheme,
) {
  // ── Variant-specific container styles ──────────────────────────────────────
  const variantStyle = (() => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.surface,
          borderBottomWidth: tokens.borderWidth[1],
          borderBottomColor: colors.border,
        }

      case 'transparent':
        return {
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
          // Transparent header sits above scrolling content
          position: 'absolute' as const,
          left:     0,
          right:    0,
          top:      0,
          zIndex:   10,
        }

      case 'elevated':
        return {
          backgroundColor: colors.surface,
          borderBottomWidth: 0,
          ...shadowHelper('sm', colorScheme),
        }
    }
  })()

  return StyleSheet.create({
    /**
     * Outer container — includes the dynamic safe-area top padding injected
     * by the component. Width is 100% of its parent (full-bleed).
     */
    container: {
      width: '100%',
      ...variantStyle,
    },

    /**
     * Content row — fixed height row holding left / title / right slots.
     * flexDirection: row with alignItems:center so all slots baseline-align.
     */
    content: {
      height:        HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems:    'center',
      paddingHorizontal: tokens.spacing[4],  // 16 — matches page gutter
      gap: tokens.spacing[2],               // 8 — between slots
    },

    /**
     * Left slot — back button, menu icon, or any ReactNode.
     * Fixed 40pt width so the title always centres correctly.
     */
    leftSlot: {
      width:          40,
      alignItems:     'flex-start',
      justifyContent: 'center',
    },

    /**
     * Title — fills remaining space between left and right slots.
     * Centred text via textAlign:'center'.
     */
    title: {
      flex:       1,
      fontSize:   tokens.textRole.h4,                                    // 16
      fontWeight: tokens.fontWeight.semibold,                            // '600'
      lineHeight: Math.ceil(tokens.textRole.h4 * tokens.lineHeight.snug), // 22
      color:      colors.foreground,
      textAlign:  'center',
    },

    /**
     * Transparent variant title override — white text so it reads over images.
     * Caller can also supply a custom style if needed.
     */
    titleTransparent: {
      color: '#ffffff',
    },

    /**
     * Right slot — icon buttons, avatar, or any ReactNode.
     * Fixed 40pt width (mirrors left) to keep title visually centred.
     */
    rightSlot: {
      width:          40,
      alignItems:     'flex-end',
      justifyContent: 'center',
    },
  })
}

// ─── TabBar styles ────────────────────────────────────────────────────────────

/**
 * createTabBarStyles
 *
 * Returns a StyleSheet for the given TabBar configuration.
 *
 * Variants:
 *   default   — full-width bar at the bottom of the screen, surface background
 *               + top border, safe-area bottom inset added dynamically.
 *   floating  — pill-shaped card that floats above the home indicator,
 *               with horizontal margin and elevated shadow.
 *
 * @param variant     - 'default' | 'floating'
 * @param colors      - resolved semantic colour tokens from useTheme()
 * @param colorScheme - 'light' | 'dark' — forwarded to shadowHelper
 */
export function createTabBarStyles(
  variant:     TabBarVariant,
  colors:      Theme,
  colorScheme: ColorScheme,
) {
  const variantStyle = (() => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor:  colors.surface,
          borderTopWidth:   tokens.borderWidth[1],
          borderTopColor:   colors.border,
          borderRadius:     0,
          marginHorizontal: 0,
          marginBottom:     0,
        }

      case 'floating':
        return {
          backgroundColor:  colors.surface,
          borderTopWidth:   0,
          borderRadius:     tokens.radius['2xl'],  // 24 — pill-like
          marginHorizontal: tokens.spacing[4],     // 16 — page gutter
          marginBottom:     tokens.spacing[4],     // 16 — lift off screen edge
          ...shadowHelper('md', colorScheme),
        }
    }
  })()

  return StyleSheet.create({
    /**
     * Outer container — the safe-area bottom inset is added dynamically by the
     * component so the tab bar always clears the home indicator.
     * For `floating` variant this wraps the pill; for `default` it IS the bar.
     */
    container: {
      flexDirection: 'row',
      alignItems:    'center',
      ...variantStyle,
    },

    /**
     * Individual tab item — Pressable.
     * Flex:1 distributes width evenly across all tabs.
     * minHeight enforces WCAG 2.5.5 / Apple HIG 44pt touch target.
     */
    tab: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      TAB_ITEM_HEIGHT,
      paddingVertical: tokens.spacing[2],  // 8 — vertical breathing room
      gap:            tokens.spacing[0.5], // 2 — between icon and label
    },

    /** Label text under the icon. */
    label: {
      fontSize:   tokens.fontSize.xs,              // 12
      fontWeight: tokens.fontWeight.medium,         // '500'
      lineHeight: Math.ceil(tokens.fontSize.xs * tokens.lineHeight.snug), // 16
    },
  })
}
