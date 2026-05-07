import { useContext } from 'react'
import { ThemeContext } from './ThemeProvider'
import type { ThemeContextValue } from './ThemeProvider'

/**
 * useTheme
 *
 * Returns the active Atlas theme context Ñ semantic colours for the current
 * colour scheme, the full scale token set, and the active scheme name.
 *
 * Must be called inside a <ThemeProvider>. Throws a descriptive error otherwise.
 *
 * @example
 * import { useTheme } from '../theme'
 *
 * function MyComponent() {
 *   const { colors, tokens, colorScheme } = useTheme()
 *
 *   return (
 *     <View style={{ backgroundColor: colors.background, padding: tokens.spacing[4] }}>
 *       <Text style={{ color: colors.foreground, fontSize: tokens.fontSize.base }}>
 *         {colorScheme === 'dark' ? 'Dark mode active' : 'Light mode active'}
 *       </Text>
 *     </View>
 *   )
 * }
 *
 * Returned shape:
 *   colorScheme  Ñ 'light' | 'dark'
 *   colors       Ñ semantic colour tokens resolved for the active scheme
 *                  e.g. colors.primary, colors.danger, colors.border É
 *   tokens       Ñ scale tokens (spacing, radius, fontSize, duration, opacity É)
 *                  safe to use inside StyleSheet.create()
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)

  if (ctx === null) {
    throw new Error(
      '[Atlas] useTheme() was called outside of a <ThemeProvider>.\n' +
        'Wrap your app root (or the relevant subtree) with <ThemeProvider> ' +
        'before calling useTheme().',
    )
  }

  return ctx
}
