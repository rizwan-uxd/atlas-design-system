/**
 * Atlas Card — M9 · Mobile (Phase 3 · Layout)
 *
 * A surface that groups related content. Supports three visual variants,
 * four padding sizes, and an optional tappable mode.
 *
 * Variants:
 *   elevated  — surface + medium shadow (shadowHelper cross-platform)
 *   outlined  — surface + 1 pt border in semantic border colour
 *   filled    — subtle tinted background, no border / shadow
 *
 * Padding:   none · sm (12) · md (16) · lg (24)
 *
 * Tappable:
 *   Pass `onPress` to make the entire card interactive.
 *   Pressed state: slight opacity shift (0.9) — instant if Reduce Motion is on.
 *
 * Compound API:
 *   <Card variant="elevated" padding="md">
 *     <CardHeader leading={<Icon />} action={<Button />}>
 *       <CardTitle>Title</CardTitle>
 *       <CardDescription>Supporting text</CardDescription>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter justify="between">…</CardFooter>
 *   </Card>
 *
 * Accessibility:
 *   Non-interactive: plain View — not focusable, not announced as interactive.
 *   Interactive:     accessibilityRole="button", accessibilityState.disabled,
 *                    accessibilityLabel required (pass via prop).
 *   Disabled:        opacity reduced, Pressable disabled prop set.
 *
 * Shadow note:
 *   On Android, `elevation` is set on the outer root View. The inner `<View>`
 *   carries the padding, keeping overflow:hidden from clipping the shadow.
 *   On iOS, shadowHelper props are spread directly onto the root View.
 */

import React from 'react'
import {
  Pressable,
  View,
  Text,
  type PressableStateCallbackType,
  type ViewStyle,
} from 'react-native'

import { useTheme }       from '../../theme/useTheme'
import { createCardStyles } from './Card.styles'
import type { CardVariant, CardPadding } from './Card.styles'

// ─── Re-export types for index ────────────────────────────────────────────────

export type { CardVariant, CardPadding }

// ─── Card root ────────────────────────────────────────────────────────────────

export interface CardProps {
  /** Visual surface treatment. @default 'elevated' */
  variant?: CardVariant
  /** Internal padding scale. @default 'md' */
  padding?: CardPadding
  /**
   * When provided, the card becomes a Pressable with a pressed-opacity state.
   * Also set `accessibilityLabel` so screen readers can announce the action.
   */
  onPress?: () => void
  /** Prevents press interaction and reduces opacity. @default false */
  disabled?: boolean
  /**
   * Screen-reader label for tappable cards.
   * Only used when `onPress` is provided.
   */
  accessibilityLabel?: string
  /** Additional ViewStyle merged onto the card root. */
  style?: ViewStyle
  children?: React.ReactNode
}

export function Card({
  variant     = 'elevated',
  padding     = 'md',
  onPress,
  disabled    = false,
  accessibilityLabel,
  style,
  children,
}: CardProps) {
  const { colors, colorScheme } = useTheme()
  const styles = createCardStyles(variant, padding, disabled, colors, colorScheme)

  const rootStyle   = [styles.root, style]
  const innerStyle  = styles.inner

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }: PressableStateCallbackType) => [
          ...rootStyle,
          pressed && !disabled && styles.pressed,
        ]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={accessibilityLabel}
      >
        <View style={innerStyle}>
          {children}
        </View>
      </Pressable>
    )
  }

  return (
    <View style={rootStyle}>
      <View style={innerStyle}>
        {children}
      </View>
    </View>
  )
}

// ─── CardHeader ───────────────────────────────────────────────────────────────

export interface CardHeaderProps {
  /** Inline-start slot — icon, avatar, image thumbnail. aria-hidden on native. */
  leading?: React.ReactNode
  /** Inline-end slot — overflow menu, icon button. */
  action?: React.ReactNode
  children?: React.ReactNode
}

export function CardHeader({ leading, action, children }: CardHeaderProps) {
  const { colors, colorScheme } = useTheme()
  const styles = createCardStyles('elevated', 'md', false, colors, colorScheme)

  return (
    <View style={styles.header}>
      {leading && (
        <View
          style={styles.headerLeading}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          {leading}
        </View>
      )}

      <View style={styles.headerMain}>
        {children}
      </View>

      {action && (
        <View style={styles.headerAction}>
          {action}
        </View>
      )}
    </View>
  )
}

// ─── CardTitle ────────────────────────────────────────────────────────────────

export interface CardTitleProps {
  children?: React.ReactNode
  numberOfLines?: number
}

export function CardTitle({ children, numberOfLines }: CardTitleProps) {
  const { colors, colorScheme } = useTheme()
  const styles = createCardStyles('elevated', 'md', false, colors, colorScheme)

  return (
    <Text
      style={styles.title}
      numberOfLines={numberOfLines}
      accessibilityRole="header"
    >
      {children}
    </Text>
  )
}

// ─── CardDescription ─────────────────────────────────────────────────────────

export interface CardDescriptionProps {
  children?: React.ReactNode
  numberOfLines?: number
}

export function CardDescription({ children, numberOfLines }: CardDescriptionProps) {
  const { colors, colorScheme } = useTheme()
  const styles = createCardStyles('elevated', 'md', false, colors, colorScheme)

  return (
    <Text style={styles.description} numberOfLines={numberOfLines}>
      {children}
    </Text>
  )
}

// ─── CardContent ──────────────────────────────────────────────────────────────

export interface CardContentProps {
  style?: ViewStyle
  children?: React.ReactNode
}

export function CardContent({ style, children }: CardContentProps) {
  const { colors, colorScheme } = useTheme()
  const styles = createCardStyles('elevated', 'md', false, colors, colorScheme)

  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  )
}

// ─── CardFooter ───────────────────────────────────────────────────────────────

export type CardFooterJustify = 'start' | 'between' | 'end'

export interface CardFooterProps {
  /** Horizontal alignment of footer children. @default 'start' */
  justify?: CardFooterJustify
  style?: ViewStyle
  children?: React.ReactNode
}

export function CardFooter({ justify = 'start', style, children }: CardFooterProps) {
  const { colors, colorScheme } = useTheme()
  const styles = createCardStyles('elevated', 'md', false, colors, colorScheme)

  const justifyStyle =
    justify === 'between' ? styles.footerBetween :
    justify === 'end'     ? styles.footerEnd :
    styles.footerStart

  return (
    <View style={[styles.footer, justifyStyle, style]}>
      {children}
    </View>
  )
}

export default Card
