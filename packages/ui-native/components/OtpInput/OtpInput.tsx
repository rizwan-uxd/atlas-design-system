import React, { useId, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { Label } from '../Label/Label'
import { createOtpInputStyles } from './OtpInput.styles'
import type { OtpInputSize, OtpInputState } from './OtpInput.styles'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OtpInputProps {
  /** Size scale. @default 'md' */
  size?: OtpInputSize
  /** Validation / interaction state. @default 'default' */
  state?: OtpInputState
  /** Number of digits, 4 to 8. @default 6 */
  length?: number
  /** Label rendered above the slots. */
  label?: string
  /** Appends a required asterisk (*) to the label. */
  required?: boolean
  /** Helper text below the slots. Hidden when errorText is shown. */
  helperText?: string
  /** Error message shown when state='error'. */
  errorText?: string
  /** Controlled value (digits only). */
  value?: string
  /** Called with the digits whenever the value changes. */
  onChangeText?: (text: string) => void
  /** Called once when the value reaches `length`. */
  onComplete?: (text: string) => void
  /** Screen-reader label (defaults to the label prop, then "Verification code"). */
  accessibilityLabel?: string
  /** Screen-reader hint. */
  accessibilityHint?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MIN_LENGTH = 4
const MAX_LENGTH = 8

function clampLength(length: number): number {
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(length)))
}

function toDigits(raw: string, length: number): string {
  return raw.replace(/\D/g, '').slice(0, length)
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * One real (visually hidden) TextInput over a row of aria-hidden digit slots, like the web
 * OtpInput: paste, one-time-code autofill and the screen-reader label all work on the single
 * input. The value is digits only and is cut to `length`. Digits are only added or removed at the
 * end, so the active slot is always the next empty one.
 */
export function OtpInput({
  size       = 'md',
  state      = 'default',
  length: lengthProp = 6,
  label,
  required   = false,
  helperText,
  errorText,
  value,
  onChangeText,
  onComplete,
  accessibilityLabel,
  accessibilityHint,
}: OtpInputProps) {
  const { colors } = useTheme()
  const length = clampLength(lengthProp)
  const isControlled = value !== undefined
  const [inner, setInner] = useState('')
  const [isFocused, setFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const labelId = useId()

  const current    = toDigits(isControlled ? value : inner, length)
  const isDisabled = state === 'disabled'
  const styles     = createOtpInputStyles(size, state, colors)
  const active     = isFocused && !isDisabled ? Math.min(current.length, length - 1) : -1

  const showError  = state === 'error' && !!errorText
  const showHelper = !showError && !!helperText

  const handleChange = (text: string) => {
    const next = toDigits(text, length)
    if (!isControlled) setInner(next)
    if (next !== current) {
      onChangeText?.(next)
      if (next.length === length) onComplete?.(next)
    }
  }

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

      {/* ── Slots — tapping anywhere focuses the hidden TextInput ─────────── */}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessible={false}   // the TextInput is the accessible element
        disabled={isDisabled}
      >
        <View style={styles.slotsWrap}>
          <View
            style={styles.slots}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {Array.from({ length }, (_, i) => (
              <View
                key={i}
                style={[styles.slot, { borderColor: styles.slotBorder(i === active) }]}
              >
                <Text style={styles.digit}>{current[i] ?? ''}</Text>
              </View>
            ))}
          </View>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={current}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            editable={!isDisabled}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            caretHidden
            autoCorrect={false}
            // Accessibility
            accessibilityLabel={accessibilityLabel ?? label ?? 'Verification code'}
            accessibilityHint={accessibilityHint}
            accessibilityLabelledBy={label ? labelId : undefined}
            accessibilityState={{ disabled: isDisabled }}
          />
        </View>
      </Pressable>

      {/* ── Sub-text ───────────────────────────────────────────────────────── */}
      {showError && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {errorText}
        </Text>
      )}
      {showHelper && (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      )}

    </View>
  )
}

export default OtpInput
