import React, { createContext, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import tokens, { light, dark } from '../tokens/atlas.tokens'
import type { Theme } from '../tokens/atlas.tokens'

// ??? Types ????????????????????????????????????????????????????????????????????

export type ColorScheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** Active colour scheme Ñ follows system preference unless overridden. */
  colorScheme: ColorScheme
  /**
   * Resolved semantic colour tokens for the active scheme.
   * Use these for all component colours Ñ never reference primitive tokens directly.
   *
   * @example
   * const { colors } = useTheme()
   * // light ? colors.primary === '#3265e0'
   * // dark  ? colors.primary === '#4b7ff7'
   */
  colors: Theme
  /**
   * Full Atlas token set Ñ spacing, radius, fontSize, motion, opacity, touch targets, etc.
   * These are scheme-independent scale tokens safe to read in StyleSheet.create().
   */
  tokens: typeof tokens
}

// ??? Context ??????????????????????????????????????????????????????????????????

/**
 * Internal context Ñ consume via useTheme(), not directly.
 * Exported for advanced use-cases (e.g. writing tests with a custom context value).
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)

// ??? Provider ?????????????????????????????????????????????????????????????????

export interface ThemeProviderProps {
  children: React.ReactNode
  /**
   * Optional override Ñ forces a specific colour scheme regardless of system preference.
   * Useful for testing, Storybook, and developer debug toggles.
   * Omit to follow the system setting via useColorScheme().
   */
  colorScheme?: ColorScheme
}

/**
 * AtlasThemeProvider
 *
 * Wrap your app root (or a subtree) with this provider to give all Atlas
 * components access to the active theme.
 *
 * @example
 * // App.tsx
 * export default function App() {
 *   return (
 *     <ThemeProvider>
 *       <RootNavigator />
 *     </ThemeProvider>
 *   )
 * }
 *
 * // Force dark mode for testing:
 * <ThemeProvider colorScheme="dark">...</ThemeProvider>
 */
export function ThemeProvider({ children, colorScheme: override }: ThemeProviderProps) {
  // useColorScheme() subscribes to Appearance changes Ñ re-renders automatically
  // when the user toggles system dark mode or Appearance.setColorScheme() is called.
  const system = useColorScheme()
  const colorScheme: ColorScheme = override ?? (system === 'dark' ? 'dark' : 'light')

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      colors: colorScheme === 'dark' ? dark : light,
      tokens,
    }),
    [colorScheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
