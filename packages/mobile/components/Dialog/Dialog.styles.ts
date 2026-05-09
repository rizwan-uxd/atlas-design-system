import { StyleSheet, Dimensions } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'
import { shadowHelper } from '../../utils/shadowHelper'
import type { ColorScheme } from '../../theme'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DialogVariant = 'modal' | 'sheet' | 'alert'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Shared overlay ───────────────────────────────────────────────────────────

/**
 * Semi-transparent full-screen overlay behind every dialog variant.
 * Uses tokens.opacity.overlay (0.6) against the scheme's overlay colour.
 */
export function overlayColor(colors: Theme): string {
  // We can't animate backgroundColor on the native driver, so we bake opacity
  // directly into the colour via rgba. tokens.overlay is near-black in both schemes.
  return colors.overlay  // caller handles opacity separately
}

// ─── Style factory ────────────────────────────────────────────────────────────

/**
 * createDialogStyles
 *
 * Returns a StyleSheet covering all three Dialog variants.
 * Components import this once and apply the styles they need.
 *
 * @param variant     - 'modal' | 'sheet' | 'alert'
 * @param colors      - resolved semantic tokens from useTheme()
 * @param colorScheme - 'light' | 'dark' — forwarded to shadowHelper
 */
export function createDialogStyles(
  variant:     DialogVariant,
  colors:      Theme,
  colorScheme: ColorScheme,
) {
  return StyleSheet.create({

    // ── Full-screen RN Modal container ─────────────────────────────────────
    // The Modal renders outside the normal view hierarchy so this is
    // the root flex container that fills the entire screen.
    modalRoot: {
      flex: 1,
    },

    // ── Overlay (tappable backdrop) ────────────────────────────────────────
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
      opacity:         tokens.opacity.overlay,  // 0.6
    },

    // ── Modal variant ──────────────────────────────────────────────────────
    // Centred floating card, max 480pt wide on large screens.
    modalContainer: {
      flex:           1,
      justifyContent: 'center',
      alignItems:     'center',
      padding:        tokens.spacing[4],        // 16 — min edge gutter
    },

    modalCard: {
      width:           '100%',
      maxWidth:        480,
      backgroundColor: colors.surface,
      borderRadius:    tokens.radius.xl,         // 16
      overflow:        'hidden',
      ...shadowHelper('xl', colorScheme),
    },

    // ── Alert variant ──────────────────────────────────────────────────────
    // Narrower card (matches iOS-style system alert), no overlay dismiss.
    alertCard: {
      width:           Math.min(SCREEN_WIDTH - tokens.spacing[8], 320), // 320pt max
      backgroundColor: colors.surface,
      borderRadius:    tokens.radius.xl,
      overflow:        'hidden',
      ...shadowHelper('xl', colorScheme),
    },

    // ── Sheet variant ──────────────────────────────────────────────────────
    // Slides up from the bottom edge. Rounded top corners only.
    sheetContainer: {
      flex:           1,
      justifyContent: 'flex-end',
    },

    sheetCard: {
      backgroundColor:          colors.surface,
      borderTopLeftRadius:      tokens.radius['2xl'],   // 24
      borderTopRightRadius:     tokens.radius['2xl'],
      borderBottomLeftRadius:   0,
      borderBottomRightRadius:  0,
      overflow:                 'hidden',
      ...shadowHelper('xl', colorScheme),
    },

    // ── Drag handle (sheet only) ───────────────────────────────────────────
    handleRow: {
      alignItems:     'center',
      paddingTop:     tokens.spacing[3],        // 12
      paddingBottom:  tokens.spacing[1],        // 4
    },

    handle: {
      width:           40,
      height:          4,
      borderRadius:    tokens.radius.full,
      backgroundColor: colors.borderStrong,
    },

    // ── Inner padding wrapper ──────────────────────────────────────────────
    // All three variants share this padding block for the header/body/footer.
    inner: {
      padding: tokens.spacing[6],               // 24
      gap:     tokens.spacing[4],               // 16
    },

    // ── Header (title + optional description) ─────────────────────────────
    header: {
      gap: tokens.spacing[1],                   // 4
    },

    title: {
      fontSize:   tokens.textRole.h3,                                     // 18
      fontWeight: tokens.fontWeight.semibold,
      lineHeight: Math.ceil(tokens.textRole.h3 * tokens.lineHeight.snug),  // 25
      color:      colors.foreground,
    },

    description: {
      fontSize:   tokens.textRole.bodySm,                                         // 14
      fontWeight: tokens.fontWeight.regular,
      lineHeight: Math.ceil(tokens.textRole.bodySm * tokens.lineHeight.normal),   // 21
      color:      colors.foregroundMuted,
    },

    // ── Body ──────────────────────────────────────────────────────────────
    // Scrollable when content overflows — consumer wraps content in ScrollView.
    body: {
      // No fixed styles — children control layout
    },

    // ── Footer (action buttons) ────────────────────────────────────────────
    footer: {
      flexDirection: 'column',
      gap:           tokens.spacing[2],         // 8 — between action buttons
    },

    // ── Divider (between body and footer) ─────────────────────────────────
    divider: {
      height:          tokens.borderWidth[1],
      backgroundColor: colors.border,
      marginHorizontal: -tokens.spacing[6],    // bleed to card edges
    },
  })
}
