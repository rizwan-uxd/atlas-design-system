import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'
import { shadowHelper } from '../../utils/shadowHelper'
import type { ColorScheme } from '../../theme'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Visual treatment of the card surface. */
export type CardVariant = 'elevated' | 'outlined' | 'filled'

/**
 * Internal padding scale.
 * Maps to Atlas spacing tokens so all padding matches the broader scale.
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

// ─── Padding map ──────────────────────────────────────────────────────────────

const PADDING: Record<CardPadding, number> = {
  none: tokens.spacing[0],   //  0
  sm:   tokens.spacing[3],   // 12
  md:   tokens.spacing[4],   // 16
  lg:   tokens.spacing[6],   // 24
}

// ─── Style factory ────────────────────────────────────────────────────────────

/**
 * createCardStyles
 *
 * Returns a StyleSheet for the given Card configuration.
 * Called inside the component so it reacts to theme changes.
 *
 * Variants:
 *   elevated  — white/dark surface + md-level shadow via shadowHelper
 *   outlined  — surface background + 1px border in semantic border colour
 *   filled    — backgroundSubtle tinted surface (no border, no shadow)
 *
 * @param variant     - 'elevated' | 'outlined' | 'filled'
 * @param padding     - 'none' | 'sm' | 'md' | 'lg'
 * @param disabled    - reduces opacity when true
 * @param colors      - resolved semantic colour tokens from useTheme()
 * @param colorScheme - 'light' | 'dark' — forwarded to shadowHelper
 */
export function createCardStyles(
  variant:     CardVariant,
  padding:     CardPadding,
  disabled:    boolean,
  colors:      Theme,
  colorScheme: ColorScheme,
) {
  const pad = PADDING[padding]

  // ── Variant-specific surface styles ───────────────────────────────────────
  const variantStyle = (() => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          borderWidth:     0,
          ...shadowHelper('md', colorScheme),
        }

      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth:     tokens.borderWidth[1],
          borderColor:     colors.border,
        }

      case 'filled':
        return {
          backgroundColor: colors.backgroundSubtle,
          borderWidth:     0,
        }
    }
  })()

  return StyleSheet.create({
    /**
     * Card root — owns the shadow + border-radius.
     *
     * IMPORTANT: overflow must NOT be 'hidden' here on iOS because that kills
     * the shadow entirely. Shadow is painted outside the view's bounds, and
     * overflow:hidden clips everything outside — including the shadow.
     *
     * Children are clipped by the `inner` layer below which carries its own
     * matching borderRadius + overflow:hidden, so rounded corners still work.
     */
    root: {
      borderRadius: tokens.radius.lg,   // 12 pt
      // overflow deliberately omitted — shadow must escape the bounds on iOS
      opacity:      disabled ? tokens.opacity.disabled : 1,
      ...variantStyle,
    },

    /**
     * Inner clip wrapper — owns overflow:hidden so child content (images,
     * coloured regions) is clipped to the card's rounded corners.
     * Carries the same borderRadius as root so the clip matches exactly.
     */
    inner: {
      borderRadius: tokens.radius.lg,
      overflow:     'hidden',
      padding:      pad,
    },

    // ── Sub-component styles ────────────────────────────────────────────────

    /**
     * CardHeader
     * Row: [leading icon] [main content block] [action]
     */
    header: {
      flexDirection:  'row',
      alignItems:     'flex-start',
      gap:            tokens.spacing[3],    // 12 — gap between leading/main/action
      paddingBottom:  tokens.spacing[3],    // 12 — visual separation from content below
    },

    /** Left-edge slot — icon, avatar, image thumbnail. */
    headerLeading: {
      flexShrink: 0,
      marginTop:  2,   // optical alignment with first line of title text
    },

    /** Flexible main block that holds CardTitle + CardDescription. */
    headerMain: {
      flex: 1,
      gap:  tokens.spacing[1],   // 4 — tight gap between title and description
    },

    /** Right-edge slot — overflow menu, icon button. */
    headerAction: {
      flexShrink: 0,
      marginTop:  2,
    },

    /** CardTitle — semibold body text */
    title: {
      fontSize:   tokens.textRole.body,           // 16
      fontWeight: tokens.fontWeight.semibold,      // '600'
      lineHeight: Math.ceil(tokens.textRole.body * tokens.lineHeight.snug),  // 22
      color:      colors.foreground,
    },

    /** CardDescription — muted supporting text below the title */
    description: {
      fontSize:   tokens.textRole.bodySm,          // 14
      fontWeight: tokens.fontWeight.regular,        // '400'
      lineHeight: Math.ceil(tokens.textRole.bodySm * tokens.lineHeight.normal), // 21
      color:      colors.foregroundMuted,
    },

    /**
     * CardContent
     * Generic slot for any content (lists, media, custom layouts).
     * No default padding — the Card's inner padding already provides breathing room.
     */
    content: {
      // intentionally empty — children control their own layout
    },

    /**
     * CardFooter
     * Horizontal row for actions (buttons, links, metadata).
     */
    footer: {
      flexDirection:  'row',
      alignItems:     'center',
      paddingTop:     tokens.spacing[3],    // 12 — separation from content above
      gap:            tokens.spacing[2],    // 8 — gap between footer children
    },

    /** Footer: children packed to the left (default). */
    footerStart: {
      justifyContent: 'flex-start',
    },

    /** Footer: children pushed to each edge (space-between). */
    footerBetween: {
      justifyContent: 'space-between',
    },

    /** Footer: children packed to the right. */
    footerEnd: {
      justifyContent: 'flex-end',
    },

    // ── Pressable feedback ──────────────────────────────────────────────────

    /** Applied to the Pressable root when actively pressed. */
    pressed: {
      opacity: tokens.opacity.hover,  // 0.9
    },
  })
}
