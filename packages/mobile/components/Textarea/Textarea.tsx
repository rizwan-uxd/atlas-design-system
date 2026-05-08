import React, { useId, useRef, useState } from 'react'
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { Label } from '../Label/Label'
import {
  createTextareaStyles,
  computeMaxHeight,
} from './Textarea.styles'
import type { TextareaVariant, TextareaSize, TextareaState } from './Textarea.styles'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TextareaProps {
  /** Visual style. @default 'default' */
  variant?: TextareaVariant
  /** Size scale. @default 'md' */
  size?: TextareaSize
  /** Interaction / validation state. @default 'default' */
  state?: TextareaState
  /**
   * Number of visible text rows used to set the initial `minHeight`.
   * @default 3
   */
  rows?: number
  /**
   * Allow the textarea to grow vertically as the user types.
   * @default false
   */
  autoGrow?: boolean
  /**
   * When `autoGrow` is true, caps height at this many rows.
   * Once the cap is reached the field becomes scrollable.
   */
  maxRows?: number
  /** Label rendered above the textarea. Wired via `accessibilityLabelledBy`. */
  label?: string
  /** Appends a required asterisk (*) to the label. */
  required?: boolean
  /** Helper text below the textarea. Hidden when errorText is shown. */
  helperText?: string
  /** Error message shown when state='error'. */
  errorText?: string
  /** Placeholder text. */
  placeholder?: string
  /** Controlled value. */
  value?: string
  /** Change handler for controlled mode. */
  onChangeText?: (text: string) => void
  /**
   * Hard character limit forwarded to `TextInput.maxLength`.
   * When set, a `current / maxLength` counter is rendered below the field.
   */
  maxLength?: number
  /** Auto-capitalise mode. @default 'sentences' (multiline default) */
  autoCapitalize?: TextInputProps['autoCapitalize']
  /** Auto-correct. @default true */
  autoCorrect?: boolean
  /** Screen-reader label (defaults to the `label` prop). */
  accessibilityLabel?: string
  /** Screen-reader hint. */
  accessibilityHint?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Textarea({
  variant        = 'default',
  size           = 'md',
  state          = 'default',
  rows           = 3,
  autoGrow       = false,
  maxRows,
  label,
  required       = false,
  helperText,
  errorText,
  placeholder,
  value,
  onChangeText,
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect    = true,
  accessibilityLabel,
  accessibilityHint,
}: TextareaProps) {
  const { colors } = useTheme()
  const [isFocused, setFocused] = useState(false)
  const [charCount, setCharCount] = useState(value?.length ?? 0)

  // Dynamic height when autoGrow is enabled
  const [dynamicHeight, setDynamicHeight] = useState<number | undefined>(undefined)

  const inputRef = useRef<TextInput>(null)

  // Stable ID so the Label's nativeID wires to this TextInput's accessibilityLabelledBy
  const labelId = useId()

  const styles    = createTextareaStyles(variant, size, state, isFocused, colors, rows, maxRows, autoGrow)
  const isDisabled = state === 'disabled'

  const showError  = state === 'error' && !!errorText
  const showHelper = !showError && !!helperText
  const showCounter = maxLength !== undefined

  // ── Change handler — tracks char count ──────────────────────────────────────
  function handleChangeText(text: string) {
    setCharCount(text.length)
    onChangeText?.(text)
  }

  // ── Auto-grow: update dynamic height from content size ──────────────────────
  function handleContentSizeChange(event: {
    nativeEvent: { contentSize: { width: number; height: number } }
  }) {
    if (!autoGrow) return

    const contentHeight = event.nativeEvent.contentSize.height
    const cap           = maxRows !== undefined
      ? computeMaxHeight(size, maxRows)
      : undefined

    setDynamicHeight(
      cap !== undefined ? Math.min(contentHeight, cap) : contentHeight,
    )
  }

  // Build the wrapper style, injecting the dynamic height when auto-grow is on
  const wrapperStyle = [
    styles.textareaWrapper,
    autoGrow && dynamicHeight !== undefined
      ? { height: dynamicHeight, minHeight: dynamicHeight }
      : undefined,
  ]

  return (
    <View style={styles.root}>

      {/* ── Label ─────────────────────────────────────────────────────────── */}
      {label && (
        <Label
          size={styles.labelSize}
          required={required}
          disabled={isDisabled}
          nativeID={labelId}
        >
          {label}
        </Label>
      )}

      {/* ── Textarea wrapper ─────────────────────────────────────────────── */}
      <View style={wrapperStyle}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          multiline
          scrollEnabled={!autoGrow || (maxRows !== undefined && dynamicHeight !== undefined)}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onContentSizeChange={handleContentSizeChange}
          editable={!isDisabled}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholderColor}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          // Return key — multiline should insert a newline, not submit
          blurOnSubmit={false}
          // Accessibility
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={accessibilityHint}
          accessibilityLabelledBy={label ? labelId : undefined}
          accessibilityState={{ disabled: isDisabled }}
        />
      </View>

      {/* ── Sub-text row: helper/error (left) + char counter (right) ─────── */}
      {(showError || showHelper || showCounter) && (
        <View style={styles.subTextRow}>

          {/* Left: error or helper */}
          {showError  && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {errorText}
            </Text>
          )}
          {showHelper && (
            <Text style={styles.helperText}>
              {helperText}
            </Text>
          )}
          {/* Spacer when there's no left text but there's a counter */}
          {!showError && !showHelper && showCounter && (
            <View style={{ flex: 1 }} />
          )}

          {/* Right: character counter */}
          {showCounter && (
            <Text
              style={[
                styles.charCounter,
                { color: styles.charCounterColor(charCount, maxLength!) },
              ]}
              accessibilityLabel={`${charCount} of ${maxLength} characters`}
            >
              {charCount}/{maxLength}
            </Text>
          )}

        </View>
      )}

    </View>
  )
}

export default Textarea
