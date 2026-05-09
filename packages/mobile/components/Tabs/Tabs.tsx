/**
 * Atlas Tabs — M12 · Mobile (Phase 4 · Overlays)
 *
 * Three-variant tab strip with an animated sliding indicator and a swipeable
 * content area. Implemented with core React Native primitives only — no
 * `react-native-tab-view` dependency required.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Variants
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * line   — Underline indicator that slides along a hairline strip border.
 *           Classic tabbed-navigation pattern.
 *
 * pill   — Floating pill background (white in both themes) slides beneath the
 *           active tab label. Strip has a muted background tray.
 *
 * filled — Solid primary-colour rectangle slides to the active tab.
 *           Active label is rendered in the primary-foreground (white) colour.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Indicator animation
 * ─────────────────────────────────────────────────────────────────────────────
 *  Two Animated.Values drive `left` and `width` of the absolute-positioned
 *  indicator View. `useNativeDriver: false` is required because layout props
 *  (left / width) cannot be handled by the native thread.
 *
 *  When `useReducedMotion` is true, animation duration collapses to 0 ms —
 *  the indicator jumps instantly to the new tab position.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Content area
 * ─────────────────────────────────────────────────────────────────────────────
 *  A horizontal `ScrollView` with `pagingEnabled` hosts all tab panes side by
 *  side. Each pane is exactly `paneWidth` wide — measured via `onLayout`.
 *
 *  - Tab press: `scrollTo()` navigates programmatically.
 *  - Swipe gesture: `onMomentumScrollEnd` reads the new offset, snaps the
 *    active index, and re-animates the strip indicator.
 *
 *  → To upgrade to gesture-driven snap points, replace the content ScrollView
 *    with `react-native-tab-view` once installed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Accessibility
 * ─────────────────────────────────────────────────────────────────────────────
 *  - Each trigger: `accessibilityRole="tab"`, `accessibilityState={{ selected, disabled }}`
 *  - Each pane:    `importantForAccessibility` hides inactive panes from
 *                  VoiceOver / TalkBack so screen readers don't read hidden content.
 *  - RN has no native "tabpanel" role — pane containers use the default role.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage
 * ─────────────────────────────────────────────────────────────────────────────
 *  const TABS = [
 *    { value: 'overview',  label: 'Overview',  content: <OverviewScreen /> },
 *    { value: 'details',   label: 'Details',   content: <DetailsScreen />  },
 *    { value: 'history',   label: 'History',   content: <HistoryScreen />  },
 *  ]
 *
 *  // Line (default)
 *  <Tabs tabs={TABS} defaultValue="overview" onChange={console.log} />
 *
 *  // Pill, scrollable strip
 *  <Tabs variant="pill" scrollable tabs={MANY_TABS} defaultValue="tab1" />
 *
 *  // Filled
 *  <Tabs variant="filled" tabs={TABS} defaultValue="overview" />
 */

import React, {
  useCallback,
  useRef,
  useState,
} from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  type ViewStyle,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'

import { useTheme }           from '../../theme/useTheme'
import { useReducedMotion, getDuration } from '../../utils/useReducedMotion'
import {
  createTabsStyles,
  getTriggerStyle,
  getTriggerTextStyle,
} from './Tabs.styles'
import type { TabsVariant }   from './Tabs.styles'
import tokens                 from '../../tokens/atlas.tokens'

export type { TabsVariant }

// ─── Types ────────────────────────────────────────────────────────────────────

/** One entry in the `tabs` array. */
export interface TabsItem {
  /** Unique string used for selection and `onChange`. */
  value: string
  /** Display label shown in the tab trigger. */
  label: string
  /**
   * Content rendered in this tab's pane.
   * Optional — omit if you only need the tab strip.
   */
  content?: React.ReactNode
  /** Prevent selection of this tab. */
  disabled?: boolean
}

export interface TabsProps {
  /** Visual style of the tab strip. @default 'line' */
  variant?: TabsVariant
  /** Tab items. Order defines left-to-right render order. */
  tabs: TabsItem[]
  /** Value of the initially active tab. Defaults to the first tab. */
  defaultValue?: string
  /** Fired when the active tab changes — receives the tab's `value`. */
  onChange?: (value: string) => void
  /**
   * Allow the tab strip to scroll horizontally when tabs overflow.
   * When false (default), tabs share equal width across the strip.
   */
  scrollable?: boolean
  /** Additional style merged onto the outermost container View. */
  style?: ViewStyle
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Return the index of the tab matching `value`, falling back to 0. */
function resolveInitialIndex(tabs: TabsItem[], value?: string): number {
  if (!value) return 0
  const idx = tabs.findIndex(t => t.value === value)
  return idx >= 0 ? idx : 0
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Tabs({
  variant     = 'line',
  tabs,
  defaultValue,
  onChange,
  scrollable  = false,
  style,
}: TabsProps) {
  const { colors, colorScheme } = useTheme()
  const reduceMotion            = useReducedMotion()
  const styles                  = createTabsStyles(variant, colors, colorScheme)

  // ── Active index ────────────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(() =>
    resolveInitialIndex(tabs, defaultValue),
  )

  // ── Layout state ────────────────────────────────────────────────────────────
  // tabLayouts[i] = { x, width } of each trigger within the strip View.
  // paneWidth = measured width of the content ScrollView (one page per tab).
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([])
  const [paneWidth,  setPaneWidth]  = useState(0)

  // ── Animated indicator ──────────────────────────────────────────────────────
  // `left` and `width` of the absolute-positioned indicator shape.
  // useNativeDriver must be false for layout (non-transform) properties.
  const indicatorX     = useRef(new Animated.Value(0)).current
  const indicatorWidth = useRef(new Animated.Value(0)).current
  const initialized    = useRef(false)

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const contentScrollRef = useRef<ScrollView>(null)
  const stripScrollRef   = useRef<ScrollView>(null)

  // ── Indicator animation ─────────────────────────────────────────────────────

  const animateIndicatorTo = useCallback(
    (index: number, layouts: { x: number; width: number }[]) => {
      const layout = layouts[index]
      if (!layout) return

      const dur = getDuration(tokens.duration.base, reduceMotion)
      Animated.parallel([
        Animated.timing(indicatorX, {
          toValue:         layout.x,
          duration:        dur,
          useNativeDriver: false,
        }),
        Animated.timing(indicatorWidth, {
          toValue:         layout.width,
          duration:        dur,
          useNativeDriver: false,
        }),
      ]).start()
    },
    [reduceMotion, indicatorX, indicatorWidth],
  )

  // Seed indicator position without animation on first layout resolution.
  const tryInit = useCallback(
    (layouts: { x: number; width: number }[], forIndex: number) => {
      if (initialized.current) return
      const layout = layouts[forIndex]
      if (!layout) return
      indicatorX.setValue(layout.x)
      indicatorWidth.setValue(layout.width)
      initialized.current = true
    },
    [indicatorX, indicatorWidth],
  )

  // ── Tab layout measurement ──────────────────────────────────────────────────
  //
  // `onLayout` fires after each trigger renders. We collect x + width for each
  // tab so we know where to move the indicator.

  const handleTriggerLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout
      setTabLayouts(prev => {
        const next = [...prev]
        next[index] = { x, width }
        // As soon as the active tab's layout arrives, seed the indicator.
        tryInit(next, activeIndex)
        return next
      })
    },
    [activeIndex, tryInit],
  )

  // ── Tab press handler ───────────────────────────────────────────────────────

  const handleTabPress = useCallback(
    (index: number) => {
      if (tabs[index]?.disabled) return

      setActiveIndex(index)
      onChange?.(tabs[index].value)

      // Animate the indicator strip.
      animateIndicatorTo(index, tabLayouts)

      // Scroll the content pane to the new page.
      if (paneWidth > 0) {
        contentScrollRef.current?.scrollTo({
          x:        index * paneWidth,
          animated: !reduceMotion,
        })
      }

      // Scroll the strip so the active trigger stays visible (scrollable mode).
      if (scrollable) {
        const layout = tabLayouts[index]
        if (layout) {
          stripScrollRef.current?.scrollTo({
            x:        Math.max(0, layout.x - 16), // 16 pt left margin
            animated: !reduceMotion,
          })
        }
      }
    },
    [
      tabs, onChange, animateIndicatorTo, tabLayouts,
      paneWidth, reduceMotion, scrollable,
    ],
  )

  // ── Content swipe handler ───────────────────────────────────────────────────
  //
  // User swiped between pages. `onMomentumScrollEnd` fires once the
  // deceleration finishes — giving us the settled content offset.

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (paneWidth === 0) return
      const rawIndex = e.nativeEvent.contentOffset.x / paneWidth
      const newIndex = Math.round(rawIndex)
      if (newIndex === activeIndex) return
      if (newIndex < 0 || newIndex >= tabs.length) return
      if (tabs[newIndex]?.disabled) return

      setActiveIndex(newIndex)
      onChange?.(tabs[newIndex].value)
      animateIndicatorTo(newIndex, tabLayouts)
    },
    [paneWidth, activeIndex, tabs, onChange, animateIndicatorTo, tabLayouts],
  )

  // ── Content area layout ──────────────────────────────────────────────────────

  const handleContentLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width
      if (w !== paneWidth) {
        setPaneWidth(w)
        // Snap to current page after resize (e.g. orientation change).
        contentScrollRef.current?.scrollTo({
          x:        activeIndex * w,
          animated: false,
        })
      }
    },
    [paneWidth, activeIndex],
  )

  // ── Render ───────────────────────────────────────────────────────────────────

  // Strip inner content — shared for both scrollable and non-scrollable modes.
  const stripContent = (
    <View style={styles.strip}>
      {/*
        Indicator — rendered first (lowest z-index) so it sits behind triggers.
        `left` and `width` are animated; all other styles come from styles.indicator.
      */}
      <Animated.View
        style={[
          styles.indicator,
          { left: indicatorX, width: indicatorWidth },
        ]}
        pointerEvents="none"
      />

      {tabs.map((tab, index) => {
        const active = index === activeIndex
        return (
          <Pressable
            key={tab.value}
            style={getTriggerStyle(variant, scrollable, active, !!tab.disabled)}
            onPress={() => handleTabPress(index)}
            onLayout={(e) => handleTriggerLayout(index, e)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: !!tab.disabled }}
            accessibilityLabel={tab.label}
            disabled={tab.disabled}
          >
            <Text style={getTriggerTextStyle(variant, colors, active)}>
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )

  return (
    <View style={[styles.container, style]}>

      {/* ── Tab strip ────────────────────────────────────────────────────── */}
      {scrollable ? (
        <ScrollView
          ref={stripScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stripScroll}
          contentContainerStyle={{ flexGrow: 0 }}
        >
          {stripContent}
        </ScrollView>
      ) : (
        stripContent
      )}

      {/* ── Content panes ─────────────────────────────────────────────────── */}
      <ScrollView
        ref={contentScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onLayout={handleContentLayout}
        style={styles.contentScroll}
        // Disable bounce so swiping past the last tab doesn't look odd
        bounces={false}
      >
        {tabs.map((tab, index) => (
          <View
            key={tab.value}
            style={[styles.pane, { width: paneWidth }]}
            // Hide inactive panes from the accessibility tree so VoiceOver /
            // TalkBack only announces the visible content.
            importantForAccessibility={index === activeIndex ? 'yes' : 'no-hide-descendants'}
            accessibilityElementsHidden={index !== activeIndex}
          >
            {tab.content ?? null}
          </View>
        ))}
      </ScrollView>

    </View>
  )
}

export default Tabs
