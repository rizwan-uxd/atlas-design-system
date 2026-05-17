/**
 * Atlas Dialog — M11 · Mobile (Phase 4 · Overlays)
 *
 * Three-in-one overlay component covering the most common mobile modal patterns.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Variants
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * modal  — Centred floating card with a fade + scale entrance.
 *          Tapping the backdrop calls onDismiss.
 *          Use for confirmations, forms, detail views.
 *
 * sheet  — Slides up from the bottom edge with a spring entrance.
 *          Drag the handle (or swipe down anywhere) to dismiss.
 *          Implemented with RN Animated + PanResponder (no external dep).
 *          → When @gorhom/bottom-sheet is available, replace the inner
 *            SheetContent with BottomSheet for gesture-driven snap points.
 *
 * alert  — Narrow centred card, no backdrop dismiss, no animation.
 *          Mirrors the iOS system alert. Requires explicit button action.
 *          Use for destructive confirmations.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Accessibility
 * ─────────────────────────────────────────────────────────────────────────────
 *  - accessibilityViewIsModal={true} on the container — locks VoiceOver/TalkBack
 *    focus inside the dialog while it is open.
 *  - The title Text carries accessibilityRole="header".
 *  - RN's built-in <Modal> already handles focus trapping and the
 *    screen-reader "modal" announcement natively on both platforms.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Animation — Reduce Motion
 * ─────────────────────────────────────────────────────────────────────────────
 *  useReducedMotion is consulted: when true, all entrance/exit durations
 *  collapse to 0 ms (instant show/hide).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage
 * ─────────────────────────────────────────────────────────────────────────────
 *  const [open, setOpen] = useState(false)
 *
 *  // Modal
 *  <Dialog
 *    variant="modal"
 *    visible={open}
 *    onDismiss={() => setOpen(false)}
 *    title="Confirm action"
 *    description="Are you sure you want to proceed?"
 *    actions={<Button onPress={() => setOpen(false)}>OK</Button>}
 *  />
 *
 *  // Sheet
 *  <Dialog
 *    variant="sheet"
 *    visible={open}
 *    onDismiss={() => setOpen(false)}
 *    title="Choose photo"
 *    actions={<Button onPress={() => setOpen(false)}>Take photo</Button>}
 *  />
 *
 *  // Alert (no backdrop dismiss)
 *  <Dialog
 *    variant="alert"
 *    visible={open}
 *    onDismiss={() => setOpen(false)}
 *    title="Delete item"
 *    description="This cannot be undone."
 *    actions={<>
 *      <Button variant="danger"    onPress={() => { doDelete(); setOpen(false) }}>Delete</Button>
 *      <Button variant="secondary" onPress={() => setOpen(false)}>Cancel</Button>
 *    </>}
 *  />
 */

import React, { useEffect, useRef } from 'react'
import {
  Modal,
  View,
  Text,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  Dimensions,
  type ViewStyle,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme }           from '../../theme/useTheme'
import { useReducedMotion, getDuration } from '../../utils/useReducedMotion'
import { createDialogStyles } from './Dialog.styles'
import type { DialogVariant } from './Dialog.styles'
import tokens                 from '../../tokens/atlas.tokens'

export type { DialogVariant }

// ─── Constants ────────────────────────────────────────────────────────────────

const SHEET_DISMISS_THRESHOLD = 80   // pt — drag this far down to dismiss
const { height: SCREEN_HEIGHT } = Dimensions.get('window')

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DialogProps {
  /** Visual pattern — determines layout, animation, and dismiss behaviour. @default 'modal' */
  variant?: DialogVariant
  /** Controls visibility. @required */
  visible: boolean
  /**
   * Called when the dialog should close (backdrop tap for modal, swipe-down
   * for sheet). NOT called on backdrop tap for the alert variant.
   */
  onDismiss: () => void
  /** Optional heading text. */
  title?: string
  /** Optional supporting text beneath the title. */
  description?: string
  /**
   * Action buttons rendered in the footer.
   * Render stacked Button components — full-width by default inside the footer.
   */
  actions?: React.ReactNode
  /**
   * Arbitrary body content rendered between the header and the footer.
   * Wrap in a ScrollView for scrollable content.
   */
  children?: React.ReactNode
  /** Additional style merged onto the card container. */
  style?: ViewStyle
}

// ─── Shared header + footer ───────────────────────────────────────────────────

interface DialogBodyProps {
  title?:       string
  description?: string
  children?:    React.ReactNode
  actions?:     React.ReactNode
  styles:       ReturnType<typeof createDialogStyles>
}

function DialogBody({ title, description, children, actions, styles }: DialogBodyProps) {
  return (
    <View style={styles.inner}>
      {/* Header */}
      {(title || description) && (
        <View style={styles.header}>
          {title && (
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          )}
          {description && (
            <Text style={styles.description}>
              {description}
            </Text>
          )}
        </View>
      )}

      {/* Body */}
      {children && (
        <View style={styles.body}>
          {children}
        </View>
      )}

      {/* Divider + footer */}
      {actions && (
        <>
          <View style={styles.divider} />
          <View style={styles.footer}>
            {actions}
          </View>
        </>
      )}
    </View>
  )
}

// ─── Modal variant ────────────────────────────────────────────────────────────

function ModalDialog({
  visible, onDismiss, title, description, children, actions, style, styles,
}: DialogProps & { styles: ReturnType<typeof createDialogStyles> }) {
  const reduceMotion = useReducedMotion()

  // Fade + scale animation
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         visible ? 1 : 0,
      duration:        getDuration(tokens.duration.base, reduceMotion),
      useNativeDriver: true,
    }).start()
  }, [visible, reduceMotion])

  const opacity   = anim
  const scale     = anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] })

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"   // we drive animation ourselves
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Overlay */}
        <Animated.View style={[styles.overlay, { opacity }]} />

        {/* Backdrop tap — dismisses */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityLabel="Close dialog"
        />

        {/* Card */}
        <View
          style={styles.modalContainer}
          pointerEvents="box-none"
          accessibilityViewIsModal
        >
          <Animated.View
            style={[styles.modalCard, style, { opacity, transform: [{ scale }] }]}
          >
            <DialogBody
              title={title}
              description={description}
              actions={actions}
              styles={styles}
            >
              {children}
            </DialogBody>
          </Animated.View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Alert variant ────────────────────────────────────────────────────────────

function AlertDialog({
  visible, onDismiss, title, description, children, actions, style, styles,
}: DialogProps & { styles: ReturnType<typeof createDialogStyles> }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Overlay — NOT tappable (alert requires explicit action) */}
        <View style={styles.overlay} />

        <View style={[styles.modalContainer, { justifyContent: 'center' }]}>
          <View
            style={[styles.alertCard, style]}
            accessibilityViewIsModal
          >
            <DialogBody
              title={title}
              description={description}
              actions={actions}
              styles={styles}
            >
              {children}
            </DialogBody>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Sheet variant ────────────────────────────────────────────────────────────
//
// Slide-up sheet built on Animated + PanResponder.
// The sheet slides from SCREEN_HEIGHT (off-screen bottom) to its natural
// rendered height. The translateY animation drives open/close.
//
// Drag behaviour:
//   - User grabs the handle row (PanResponder on handleRow View).
//   - Dragging down accumulates offset in dragY (clamped to >= 0 so
//     you can't drag upward past the settled position).
//   - On release: if drag > SHEET_DISMISS_THRESHOLD → dismiss (animate out);
//     otherwise spring back to 0 (re-settle).
//
// TODO: Replace with @gorhom/bottom-sheet for snap-point support:
//   import BottomSheet from '@gorhom/bottom-sheet'
//   <BottomSheet ref={sheetRef} snapPoints={snapPoints} onClose={onDismiss}>
//     {children}
//   </BottomSheet>

function SheetDialog({
  visible, onDismiss, title, description, children, actions, style, styles,
}: DialogProps & { styles: ReturnType<typeof createDialogStyles> }) {
  const reduceMotion = useReducedMotion()
  const insets       = useSafeAreaInsets()

  // translateY: 0 = fully visible, SCREEN_HEIGHT = off-screen below
  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const dragY  = useRef(new Animated.Value(0)).current

  // Open / close animation
  useEffect(() => {
    if (visible) {
      // Reset drag offset first
      dragY.setValue(0)
      Animated.spring(slideY, {
        toValue:         0,
        useNativeDriver: true,
        bounciness:      4,
        speed:           getDuration(14, reduceMotion) === 0 ? 1000 : 14,
      }).start()
    } else {
      Animated.timing(slideY, {
        toValue:         SCREEN_HEIGHT,
        duration:        getDuration(tokens.duration.base, reduceMotion),
        useNativeDriver: true,
      }).start()
    }
  }, [visible, reduceMotion])

  // Overlay fade — derived from slideY position
  const overlayOpacity = slideY.interpolate({
    inputRange:  [0, SCREEN_HEIGHT * 0.5],
    outputRange: [tokens.opacity.overlay, 0],
    extrapolate: 'clamp',
  })

  // PanResponder for the drag handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  (_, { dy }) => dy > 2,

      onPanResponderMove: (_, { dy }) => {
        // Only allow downward drag (dy > 0)
        if (dy > 0) dragY.setValue(dy)
      },

      onPanResponderRelease: (_, { dy, vy }) => {
        const shouldDismiss = dy > SHEET_DISMISS_THRESHOLD || vy > 0.5

        if (shouldDismiss) {
          // Animate out then call onDismiss
          Animated.timing(slideY, {
            toValue:         SCREEN_HEIGHT,
            duration:        getDuration(tokens.duration.base, reduceMotion),
            useNativeDriver: true,
          }).start(() => {
            dragY.setValue(0)
            onDismiss()
          })
        } else {
          // Spring back
          Animated.spring(dragY, {
            toValue:         0,
            useNativeDriver: true,
            bounciness:      6,
          }).start()
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(dragY, {
          toValue:         0,
          useNativeDriver: true,
        }).start()
      },
    }),
  ).current

  const combinedY = Animated.add(slideY, dragY)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Overlay with fading opacity tied to slide position */}
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />

        {/* Backdrop tap — dismisses (same as modal) */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityLabel="Close sheet"
        />

        {/* Sheet card */}
        <View style={styles.sheetContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheetCard,
              style,
              {
                transform: [{ translateY: combinedY }],
                paddingBottom: insets.bottom,
              },
            ]}
            accessibilityViewIsModal
          >
            {/* Drag handle */}
            <View {...panResponder.panHandlers}>
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>
            </View>

            <DialogBody
              title={title}
              description={description}
              actions={actions}
              styles={styles}
            >
              {children}
            </DialogBody>
          </Animated.View>
        </View>
      </View>
    </Modal>
  )
}

// ─── StyleSheet.absoluteFill shim (used inline above) ────────────────────────

import { StyleSheet } from 'react-native'

// ─── Public component ─────────────────────────────────────────────────────────

export function Dialog({
  variant = 'modal',
  ...props
}: DialogProps) {
  const { colors, colorScheme } = useTheme()
  const styles = createDialogStyles(variant, colors, colorScheme)

  switch (variant) {
    case 'sheet':
      return <SheetDialog  {...props} variant={variant} styles={styles} />
    case 'alert':
      return <AlertDialog  {...props} variant={variant} styles={styles} />
    default:
      return <ModalDialog  {...props} variant={variant} styles={styles} />
  }
}

export default Dialog
