# Atlas Design System — Mobile (React Native) Implementation Plan

> **Goal:** Build React Native counterparts for all 12 Atlas v1 web components, sharing the same token system, design decisions, and sign-off process as the web track.
>
> **Output:** `packages/mobile/` — a fully working Expo app with a component sandbox, mirroring `app/page.tsx` on the web side.

---

## Why this is a separate track

The web components use React + CSS Modules + DOM elements. None of that runs in React Native. Every component needs to be rewritten from scratch using:

| Web | React Native |
|---|---|
| `<div>`, `<span>`, `<p>` | `<View>`, `<Text>` |
| `<button>` | `<Pressable>` |
| `<input>`, `<textarea>` | `<TextInput>` |
| `<a>` | `<Pressable>` + `Linking` |
| CSS Modules | `StyleSheet.create()` |
| CSS custom properties | JS token object |
| Radix UI | RN-specific alternatives |
| `@media` breakpoints | `useWindowDimensions()` |
| `prefers-reduced-motion` | `AccessibilityInfo.isReduceMotionEnabled()` |
| `position: fixed` | Absolute layout + safe area insets |

---

## Phase 0 — Foundation (do this before any component work)

### 0.1 Project setup

Create an Expo project inside the existing monorepo:

```bash
npx create-expo-app packages/mobile --template blank-typescript
cd packages/mobile
```

Install shared dependencies:

```bash
npx expo install expo-font expo-haptics expo-linking
npx expo install react-native-safe-area-context react-native-screens
npx expo install @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated
```

**Folder structure:**

```
packages/mobile/
├── app/                        # Expo Router screens
│   └── index.tsx               # Component sandbox (mirrors web page.tsx)
├── components/                 # Atlas RN components (mirrors web components/)
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.styles.ts    # StyleSheet (mirrors .module.css)
│   ├── Input/
│   └── … (one folder per component)
├── tokens/
│   └── atlas.tokens.ts         # JS token object (mirrors atlas.tokens.css)
├── theme/
│   ├── ThemeProvider.tsx       # Light/dark context
│   └── useTheme.ts             # Hook to consume tokens
└── ATLAS-MOBILE-SESSIONS-PLAN.md
```

### 0.2 Token adapter — `atlas.tokens.ts`

The CSS file uses `var(--atlas-*)` custom properties. RN needs plain JS values. Create a mirrored token object:

```ts
// tokens/atlas.tokens.ts

export const spacing = {
  0_5: 2,  1: 4,  1_5: 6,  2: 8,  2_5: 10,  3: 12,
  4: 16,   5: 20,  6: 24,  7: 28,  8: 32,   9: 36,
  10: 40,  11: 44, 12: 48,
} as const

export const radius = {
  sm: 4, md: 8, lg: 12, full: 9999,
} as const

export const fontWeight = {
  regular: '400', medium: '500', semibold: '600', bold: '700',
} as const

export const fontSize = {
  xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24,
} as const

export const duration = {
  fast: 120, base: 200, slow: 320,
} as const

export const touchMin = 44

// Semantic color palettes — light and dark
export const light = {
  background:         '#ffffff',
  backgroundMuted:    '#f4f4f5',
  backgroundSubtle:   '#f8f8f9',
  foreground:         '#09090b',
  foregroundMuted:    '#71717a',
  foregroundDisabled: '#a1a1aa',
  border:             '#e4e4e7',
  borderStrong:       '#a1a1aa',
  primary:            '#2563eb',
  primaryForeground:  '#ffffff',
  primaryHover:       '#1d4ed8',
  success:            '#16a34a',
  successSubtle:      '#f0fdf4',
  warning:            '#d97706',
  warningSubtle:      '#fffbeb',
  danger:             '#dc2626',
  dangerSubtle:       '#fef2f2',
  info:               '#2563eb',
  infoSubtle:         '#eff6ff',
  focusRing:          '#2563eb',
  overlay:            'rgba(0,0,0,0.5)',
  shadowSm:           '0 1px 2px rgba(0,0,0,0.05)',
  shadowMd:           '0 4px 6px rgba(0,0,0,0.08)',
} as const

export const dark = {
  background:         '#09090b',
  backgroundMuted:    '#18181b',
  backgroundSubtle:   '#27272a',
  foreground:         '#fafafa',
  foregroundMuted:    '#a1a1aa',
  foregroundDisabled: '#52525b',
  border:             '#27272a',
  borderStrong:       '#52525b',
  primary:            '#3b82f6',
  primaryForeground:  '#ffffff',
  primaryHover:       '#60a5fa',
  success:            '#22c55e',
  successSubtle:      '#052e16',
  warning:            '#f59e0b',
  warningSubtle:      '#422006',
  danger:             '#ef4444',
  dangerSubtle:       '#450a0a',
  info:               '#3b82f6',
  infoSubtle:         '#1e3a5f',
  focusRing:          '#3b82f6',
  overlay:            'rgba(0,0,0,0.7)',
  shadowSm:           '0 1px 2px rgba(0,0,0,0.4)',
  shadowMd:           '0 4px 6px rgba(0,0,0,0.5)',
} as const

export type Theme = typeof light
```

> **Note:** Exact OKLCH values from `atlas.tokens.css` should be converted to hex/rgb at build time using a script. The values above are approximations — run the conversion script in Phase 0 before starting components.

### 0.3 ThemeProvider

```tsx
// theme/ThemeProvider.tsx
import { createContext, useContext } from 'react'
import { useColorScheme } from 'react-native'
import { light, dark, type Theme } from '../tokens/atlas.tokens'

const ThemeContext = createContext<Theme>(light)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme()
  return (
    <ThemeContext.Provider value={scheme === 'dark' ? dark : light}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

### 0.4 Shadow helper

iOS and Android handle shadows differently:

```ts
// theme/shadows.ts
import { Platform } from 'react-native'

export const shadow = {
  sm: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    android: { elevation: 1 },
    default: {},
  }),
  md: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 6 },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 16 },
    android: { elevation: 8 },
    default: {},
  }),
}
```

### 0.5 Reduced motion helper

```ts
// theme/useReducedMotion.ts
import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => sub.remove()
  }, [])
  return reduced
}
```

---

## Phase 1 — Primitive components (no external dependencies)

These four are pure `View` + `Text` + `Pressable`. Build them first — they're depended on by everything else.

### M1 — Badge

**Web counterpart:** `components/Badge/Badge.tsx`
**RN approach:** `View` (outer pill) + `Text` (label) + optional `Pressable` remove button

**Key differences:**
- No CSS `border-radius: full` — use `borderRadius: 9999` in StyleSheet
- No `::before` dot — render a `<View style={{ width: 6, height: 6, borderRadius: 3 }}>`
- Remove button needs `hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}` for 44px touch target

### M2 — Label

**Web counterpart:** `components/Label/Label.tsx`
**RN approach:** `<Text>` with `accessibilityRole="label"`

**Key differences:**
- No `htmlFor` — RN doesn't have label-input association; use `nativeID` on the input and `aria-labelledby` on Pressable wrapper
- Required/optional markers remain as `<Text>` spans inside the label

### M3 — Alert

**Web counterpart:** `components/Alert/Alert.tsx`
**RN approach:** `View` (surface) + `View` (accent bar) + `Text` (title/description)

**Key differences:**
- Accent bar: `position: 'absolute', left: 0, top: 0, bottom: 0, width: 4` (same concept as `::before`)
- `role="alert"` equivalent: `accessibilityLiveRegion="assertive"` (danger/warning) or `"polite"` (info/success)
- Dismiss button: `Pressable` with `accessibilityLabel="Dismiss alert"`

### M4 — Button

**Web counterpart:** `components/Button/Button.tsx`
**RN approach:** `Pressable` + `Animated` for press feedback

**Key differences:**
- No `<a>` variant — use `onPress={() => Linking.openURL(href)}`
- Hover state doesn't exist on mobile — use `onPressIn`/`onPressOut` for pressed state
- Loading: `ActivityIndicator` replaces the spinner (built into RN)
- Android ripple: `android_ripple={{ color: 'rgba(0,0,0,0.1)' }}`
- Icon-only: `accessibilityLabel` required (same as web `aria-label`)
- Press animation: `Animated.spring` scale 1→0.97 on press, back to 1 on release (unless reduced motion)

```tsx
// Pressable animation pattern
const scale = useRef(new Animated.Value(1)).current
const onPressIn = () => !reducedMotion && Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()
const onPressOut = () => !reducedMotion && Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
```

---

## Phase 2 — Form components

### M5 — Input

**Web counterpart:** `components/Input/Input.tsx`
**RN approach:** `View` (wrapper) + `TextInput` (native field)

**Key differences:**
- Focus ring: listen to `onFocus`/`onBlur` on `TextInput`, toggle a `borderColor` state on the wrapper `View`
- No `:has()` trick — manage focus state in JS
- Prefix/suffix affixes: `View` siblings inside the wrapper row
- `variant="filled"`: `backgroundColor: tokens.backgroundMuted` on the wrapper
- `KeyboardType` prop maps to RN's `keyboardType` (`'email-address'`, `'numeric'`, etc.)
- `size` prop → explicit `height` value (sm=32, md=40, lg=48)

### M6 — Textarea

**Web counterpart:** `components/Textarea/Textarea.tsx`
**RN approach:** `TextInput` with `multiline={true}` + `scrollEnabled={true}`

**Key differences:**
- `resize: vertical` doesn't exist — RN `TextInput` with `multiline` grows naturally
- `autoGrow`: set `minHeight` + no `maxHeight` (let it grow), or clamp with `maxHeight` + `scrollEnabled`
- Char counter: `onChangeText` tracks length; `Text` below shows count, colour flips at limit
- `KeyboardAvoidingView` wrapper in the sandbox so the keyboard doesn't cover the textarea

### M7 — Checkbox

**Web counterpart:** `components/Checkbox/Checkbox.tsx`
**RN approach:** Custom `Pressable` (no Radix in RN)

**Key differences:**
- No Radix — build the checkbox manually with `Animated` for the check mark scale
- Check icon: render a `<Text>✓</Text>` or an SVG check, scale from 0→1 with `Animated.spring`
- Indeterminate: render a `<View>` dash (4px high, 10px wide) instead of the checkmark
- Card variant: outer `Pressable` wrapping a styled `View` card
- Focus: RN's built-in `onFocus` + `accessibilityState={{ checked }}`
- Haptic feedback on toggle: `Haptics.selectionAsync()` from `expo-haptics`

### M8 — Switch

**Web counterpart:** `components/Switch/Switch.tsx`
**RN approach:** RN's built-in `Switch` component OR custom animated version

**Decision:** Use RN's built-in `<Switch>` for correct platform appearance (iOS toggle, Android material) rather than the exact Atlas pixel spec. The built-in switch respects system accessibility settings and platform conventions. Wrap it with Atlas label/description layout.

```tsx
import { Switch as RNSwitch } from 'react-native'

// trackColor and thumbColor map to Atlas tokens
<RNSwitch
  value={checked}
  onValueChange={onCheckedChange}
  trackColor={{ false: tokens.backgroundMuted, true: tokens.primary }}
  thumbColor={tokens.background}
  accessibilityLabel={label}
  accessibilityRole="switch"
  accessibilityState={{ checked }}
/>
```

> **Alt:** Build a fully custom animated switch if exact Atlas spec dimensions are required for design parity. Use `Animated.Value` for thumb translation and `Animated.spring` for motion.

---

## Phase 3 — Layout components

### M9 — Card

**Web counterpart:** `components/Card/Card.tsx`
**RN approach:** `Pressable` (interactive) or `View` (static) with shadow helper

**Key differences:**
- `variant="elevated"`: apply `shadow.md` from the shadow helper
- `variant="outlined"`: `borderWidth: 1, borderColor: tokens.border`
- `variant="filled"`: `backgroundColor: tokens.backgroundMuted`
- `interactive`: wrap in `Pressable` with `onPress`, use `Animated` scale on press
- `selected`: `borderColor: tokens.primary` (same concept)
- Sub-components (`CardHeader`, `CardContent`, `CardFooter`) are plain `View` wrappers
- `CardHeader` leading/action slots: `View` with `flexDirection: 'row'` + `justifyContent: 'space-between'`

### M10 — NavBar

**Web counterpart:** `components/NavBar/NavBar.tsx`
**RN approach:** Completely different anatomy — top `Header` + bottom `TabBar`

**This is the biggest platform divergence in v1.**

#### Top Header

```tsx
<SafeAreaView edges={['top']} style={{ backgroundColor: tokens.background }}>
  <View style={styles.header}>
    {leading}       {/* back button, hamburger, logo */}
    <Text style={styles.title}>{title}</Text>
    {actions}       {/* icon buttons, max ~3 */}
  </View>
</SafeAreaView>
```

- Height: md=56px (spec), sized from `--atlas-spacing-14` equivalent
- `SafeAreaView edges={['top']}` handles iOS status bar inset
- No hamburger → navigation is the bottom TabBar

#### Bottom TabBar

```tsx
<SafeAreaView edges={['bottom']} style={{ backgroundColor: tokens.background }}>
  <View style={styles.tabBar}>
    {tabs.map(tab => (
      <Pressable
        key={tab.value}
        style={styles.tab}
        onPress={() => setActive(tab.value)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active === tab.value }}
        accessibilityLabel={tab.label}
      >
        <View style={styles.tabIcon}>{tab.icon}</View>
        <Text style={[styles.tabLabel, active === tab.value && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </Pressable>
    ))}
  </View>
</SafeAreaView>
```

- `SafeAreaView edges={['bottom']}` handles iOS home indicator inset
- Each tab: min touch target 44×44px
- Active tab: icon + label in `tokens.primary`
- Haptic feedback on tab press: `Haptics.selectionAsync()`

---

## Phase 4 — Overlay components

### M11 — Dialog / Sheet

**Web counterpart:** `components/Dialog/Dialog.tsx`
**RN approach:** Two separate implementations depending on variant

#### Modal variant → RN `Modal`

```tsx
import { Modal, Animated, Pressable } from 'react-native'

<Modal
  visible={open}
  transparent
  animationType="none"   // handle animation manually
  statusBarTranslucent
  onRequestClose={onClose}   // Android back button
>
  <Pressable style={styles.overlay} onPress={onClose} />
  <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
    {children}
  </Animated.View>
</Modal>
```

#### Sheet variant → `@gorhom/bottom-sheet`

```tsx
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

<BottomSheet
  ref={sheetRef}
  snapPoints={['50%', '85%']}
  enablePanDownToClose
  onClose={onClose}
  backgroundStyle={{ backgroundColor: tokens.background }}
  handleIndicatorStyle={{ backgroundColor: tokens.borderStrong }}
>
  <BottomSheetView>{children}</BottomSheetView>
</BottomSheet>
```

- `@gorhom/bottom-sheet` provides the drag handle, snap points, and gesture-to-dismiss — exactly matching the spec requirement for the sheet variant
- Requires `react-native-reanimated` and `react-native-gesture-handler` (both installed in Phase 0)
- Focus management: use `AccessibilityInfo.setAccessibilityFocus()` on the first focusable element on open

#### Drawer variant → custom slide-in panel

```tsx
// Slide from left or right using Animated.timing + translateX
const translateX = useRef(new Animated.Value(side === 'start' ? -width : width)).current
// Open: Animated.timing(translateX, { toValue: 0, ... }).start()
// Close: Animated.timing(translateX, { toValue: ..., ... }).start(onClose)
```

### M12 — Tabs

**Web counterpart:** `components/Tabs/Tabs.tsx`
**RN approach:** `ScrollView` (horizontal trigger list) + conditional panel render

**Key differences:**
- No Radix — implement roving focus manually (less critical on mobile; swipe handles navigation)
- Trigger list: `<ScrollView horizontal showsHorizontalScrollIndicator={false}>`
- Active indicator: `underline` variant uses an `Animated.View` bottom border that slides between positions using `Animated.spring` + `onLayout` measurements
- Panel switching: conditional render or `react-native-tab-view` for swipe-between-panels
- `activationMode` is always "automatic" on mobile (tap = activate immediately)
- Consider `react-native-tab-view` for the swipeable panel behaviour the spec requires

---

## Session map

Mirrors the web S3–S14 plan. Each session ends with a sandbox sign-off on device/simulator.

| Session | Component | Key RN work |
|---|---|---|
| M1 | Badge | View pill, dot View, remove Pressable with hitSlop |
| M2 | Label | Text + accessibilityRole, nativeID wiring |
| M3 | Alert | Absolute accent bar, accessibilityLiveRegion |
| M4 | Button | Pressable, Animated scale, ActivityIndicator, android_ripple |
| M5 | Input | TextInput, focus border state in JS, prefix/suffix Views |
| M6 | Textarea | multiline TextInput, char counter, KeyboardAvoidingView |
| M7 | Checkbox | Custom Pressable, Animated check, indeterminate dash |
| M8 | Switch | RN built-in Switch or custom Animated track/thumb |
| M9 | Card | Pressable/View, platform shadows, compound slots |
| M10 | NavBar | SafeAreaView header + bottom TabBar (largest divergence) |
| M11 | Dialog | RN Modal (modal), @gorhom/bottom-sheet (sheet), slide (drawer) |
| M12 | Tabs | Horizontal ScrollView list, Animated indicator, swipeable panels |

---

## Sign-off gate (per session)

Each component is marked ✅ only when verified on:

- [ ] iOS Simulator (iPhone 15 Pro — notch + Dynamic Island)
- [ ] Android Emulator (Pixel 7)
- [ ] Light mode + Dark mode
- [ ] Reduce Motion ON
- [ ] VoiceOver (iOS) — announces component role and state correctly
- [ ] TalkBack (Android) — same

---

## Key risks and mitigations

| Risk | Mitigation |
|---|---|
| OKLCH tokens don't resolve to hex automatically | Write a one-time conversion script in Phase 0 using `culori` to convert all OKLCH values to hex for the JS token file |
| `@gorhom/bottom-sheet` gesture conflicts with ScrollView inside sheet | Use `BottomSheetScrollView` from the same package instead of RN's ScrollView |
| Android ripple looks inconsistent with iOS press state | Set `android_ripple` on Pressable AND use `onPressIn`/`onPressOut` for the Animated scale — both coexist |
| Font loading — Atlas uses a custom sans font | Load via `expo-font` in `_layout.tsx` before rendering any component; show a splash until fonts are ready |
| Safe area insets differ across device families | Always use `react-native-safe-area-context` — never hardcode status bar heights |
| Animated tab indicator needs layout measurements | Use `onLayout` on each trigger to capture x positions; store in a ref array; interpolate `translateX` between them |

---

## What to build first

Recommended order to start immediately after Phase 0:

1. **Token conversion script** — converts `atlas.tokens.css` OKLCH values to hex using `culori`; outputs `tokens/atlas.tokens.ts`
2. **ThemeProvider + sandbox shell** — dark mode toggle working in the Expo app
3. **Button** — validates the entire Pressable + Animated + token pattern; all other components build on it
4. **Input + Label** — validates the focus-state-in-JS pattern; needed by Checkbox, Switch, Dialog forms

Everything else follows from there.

---

## Progress tracker

| Session | Component | Status | Signed off |
|---|---|---|---|
| Phase 0 | Foundation (Expo, tokens, theme) | 🔴 Not started | — |
| M1 | Badge | 🔴 Not started | — |
| M2 | Label | 🔴 Not started | — |
| M3 | Alert | 🔴 Not started | — |
| M4 | Button | 🔴 Not started | — |
| M5 | Input | 🔴 Not started | — |
| M6 | Textarea | 🔴 Not started | — |
| M7 | Checkbox | 🔴 Not started | — |
| M8 | Switch | 🔴 Not started | — |
| M9 | Card | 🔴 Not started | — |
| M10 | NavBar | 🔴 Not started | — |
| M11 | Dialog | 🔴 Not started | — |
| M12 | Tabs | 🔴 Not started | — |

**Legend:** 🔴 Not started · 🟡 In progress · 🟢 Spec-complete ✅ Device-verified
