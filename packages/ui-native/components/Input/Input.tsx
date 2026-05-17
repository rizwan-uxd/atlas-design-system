import React, { useId, useRef, useState } from 'react'
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { Label } from '../Label/Label'
import { createInputStyles } from './Input.styles'
import type { InputVariant, InputSize, InputState } from './Input.styles'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InputProps {
  /** Visual style. @default 'default' */
  variant?: InputVariant
  /** Size scale. @default 'md' */
  size?: InputSize
  /** Interaction/validation state. @default 'default' */
  state?: InputState
  /** Label rendered above the input. Wired to TextInput via accessibilityLabelledBy. */
  label?: string
  /** Appends a required asterisk (*) to the label. */
  required?: boolean
  /** Helper text below the input. Hidden when errorText or successText is shown. */
  helperText?: string
  /** Error message shown when state='error'. */
  errorText?: string
  /** Success message shown when state='success'. */
  successText?: string
  /** Icon node in the leading (left) slot. Size from tokens — 16/18/20px per size. */
  leadingIcon?: React.ReactNode
  /** Icon node in the trailing (right) slot. */
  trailingIcon?: React.ReactNode
  /** Placeholder text. */
  placeholder?: string
  /** Controlled value. */
  value?: string
  /** Change handler for controlled mode. */
  onChangeText?: (text: string) => void
  /** Password / secure text mode. */
  secureTextEntry?: boolean
  /** RN keyboard type forwarded to TextInput. */
  keyboardType?: TextInputProps['keyboardType']
  /** Return key appearance. */
  returnKeyType?: TextInputProps['returnKeyType']
  /** Called when return key is pressed. */
  onSubmitEditing?: TextInputProps['onSubmitEditing']
  /** Auto-capitalise mode. @default 'none' */
  autoCapitalize?: TextInputProps['autoCapitalize']
  /** Auto-correct. @default false */
  autoCorrect?: boolean
  /** Max character count. */
  maxLength?: number
  /** Screen-reader label (defaults to the label prop). */
  accessibilityLabel?: string
  /** Screen-reader hint. */
  accessibilityHint?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Input({
  variant           = 'default',
  size              = 'md',
  state             = 'default',
  label,
  required          = false,
  helperText,
  errorText,
  successText,
  leadingIcon,
  trailingIcon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry   = false,
  keyboardType,
  returnKeyType,
  onSubmitEditing,
  autoCapitalize    = 'none',
  autoCorrect       = false,
  maxLength,
  accessibilityLabel,
  accessibilityHint,
}: InputProps) {
  const { colors } = useTheme()
  const [isFocused, setFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  // Stable ID so the Label's nativeID wires to this TextInput's accessibilityLabelledBy
  const labelId = useId()

  const styles    = createInputStyles(variant, size, state, isFocused, colors)
  const isDisabled = state === 'disabled'

  // Which sub-text row to show (priority: error > success > helper)
  const showError   = state === 'error'   && !!errorText
  const showSuccess = state === 'success' && !!successText
  const showHelper  = !showError && !showSuccess && !!helperText

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

      {/* ── Input row — tapping anywhere in the row focuses the TextInput ── */}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessible={false}   // the TextInput is the accessible element
      >
        <View style={styles.inputRow}>

          {/* Leading icon */}
          {leadingIcon && (
            <View style={styles.iconWrapper}>
              {leadingIcon}
            </View>
          )}

          {/* Text input */}
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            editable={!isDisabled}
            placeholder={placeholder}
            placeholderTextColor={styles.placeholderColor}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            maxLength={maxLength}
            // Accessibility
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityHint={accessibilityHint}
            accessibilityLabelledBy={label ? labelId : undefined}
            accessibilityState={{ disabled: isDisabled }}
          />

          {/* Trailing icon */}
          {trailingIcon && (
            <View style={styles.iconWrapper}>
              {trailingIcon}
            </View>
          )}
        </View>
      </Pressable>

      {/* ── Sub-text ───────────────────────────────────────────────────────── */}
      {showError   && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {errorText}
        </Text>
      )}
      {showSuccess && (
        <Text style={styles.successText}>
          {successText}
        </Text>
      )}
      {showHelper  && (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      )}

    </View>
  )
}

export default Input
