# Atlas Design System — Mobile Sessions Plan

**Stack:** React Native (Expo) · TypeScript · `StyleSheet.create()` · NativeWind (optional)  
**Repo:** `github.com/rizwan-uxd/atlas-design-system`  
**Workspace:** `packages/mobile/`  
**Web reference:** 12 components completed in S3–S14 (Button, Input, Label, Textarea, Checkbox, Switch, Card, Badge, Alert, Dialog, Tabs, NavBar)

---

## Phase 0 — Foundation
> Complete this before writing any component code. No component PRs merge until all five steps are green.

| Step | Task | Status |
|------|------|--------|
| 0.1 | Expo project init in `packages/mobile/` | ✅ Done (Expo SDK 54 · React 19 · RN 0.81) |
| 0.2 | Token pipeline: `atlas.tokens.css` → `packages/mobile/tokens/atlas.tokens.ts` | ✅ Done (`scripts/convert-tokens.mjs`) |
| 0.3 | `ThemeProvider.tsx` + `useTheme.ts` (light/dark via `useColorScheme`) | ✅ Done (`packages/mobile/theme/`) |
| 0.4 | `shadowHelper.ts` — cross-platform shadow (iOS shadow props vs. Android `elevation`) | ✅ Done (`packages/mobile/utils/shadowHelper.ts`) |
| 0.5 | `useReducedMotion.ts` — wraps `AccessibilityInfo.isReduceMotionEnabled` | ✅ Done (`packages/mobile/utils/useReducedMotion.ts`) |

### Phase 0 Sign-off
- [ ] `npx expo start` boots without errors
- [ ] `useTheme()` returns correct token values for light and dark (toggle with `Appearance.setColorScheme`)
- [ ] Shadow helper renders a visible shadow on both iOS Simulator and Android Emulator
- [ ] Reduced motion hook returns `true` when accessibility setting is on

---

## Phase 1 — Primitives
> Pure `View` / `Text` / `Pressable` / `Animated` — no external gesture libraries required.

---

### M1 · Badge
**Web counterpart:** `Badge.tsx` + `Badge.module.css`  
**Blocking dependency:** Phase 0 complete

**What to build:**
- `packages/mobile/components/Badge/Badge.tsx`
- `packages/mobile/components/Badge/Badge.styles.ts`

**Prop matrix (mirrors web):**

| Prop | Values |
|------|--------|
| `variant` | `neutral` · `brand` · `success` · `warning` · `danger` · `info` |
| `size` | `sm` · `md` · `lg` |
| `dot` | `boolean` — replaces label with a dot indicator |

**RN-specific notes:**
- `<View>` + `<Text>` — no DOM span
- Border radius via `tokens.radius.full` (pill shape)
- Font size from `tokens.fontSize` mapped to RN `Text` style
- No hover state — tap highlight via `Pressable` `android_ripple` only if Badge is interactive

**Sign-off checklist:**
- [ ] All 6 variants render correct background + text colour in light mode
- [ ] All 6 variants correct in dark mode
- [ ] sm / md / lg sizes visually distinct
- [ ] `dot` prop shows dot, hides label
- [ ] No layout overflow on long label strings

---

### M2 · Label
**Web counterpart:** `Label.tsx` + `Label.module.css`  
**Blocking dependency:** M1 complete

**What to build:**
- `packages/mobile/components/Label/Label.tsx`
- `packages/mobile/components/Label/Label.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `size` | `sm` · `md` · `lg` (inherited from parent form field) |
| `required` | `boolean` — appends `*` in danger colour |
| `disabled` | `boolean` — reduced opacity |

**RN-specific notes:**
- Pure `<Text>` component — no `<label>` element or `htmlFor`
- Associate with input via `nativeID` on Label + `accessibilityLabelledBy` on Input
- Size inheritance: parent passes `size` prop explicitly (no CSS cascade)

**Sign-off checklist:**
- [ ] sm / md / lg type sizes match token scale
- [ ] Required asterisk appears in `tokens.semantic.danger` colour
- [ ] Disabled state renders at `tokens.opacity.disabled`
- [ ] `accessibilityLabelledBy` wiring verified with screen reader (VoiceOver / TalkBack)

---

### M3 · Alert
**Web counterpart:** `Alert.tsx` + `Alert.module.css`  
**Blocking dependency:** M2 complete

**What to build:**
- `packages/mobile/components/Alert/Alert.tsx`
- `packages/mobile/components/Alert/Alert.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `variant` | `info` · `success` · `warning` · `danger` |
| `title` | `string` (optional) |
| `description` | `string` |
| `onDismiss` | `() => void` (optional — shows close button) |
| `icon` | `boolean` (default true) |

**RN-specific notes:**
- Layout: `<View row>` [icon] + `<View column>` [title + description] + [dismiss button]
- Icon: use `@expo/vector-icons` (Ionicons) — `information-circle`, `checkmark-circle`, `warning`, `close-circle`
- Dismiss animation: `Animated.timing` on `opacity` + `maxHeight` (respect `useReducedMotion`)
- No CSS transitions — use `Animated` API

**Sign-off checklist:**
- [ ] All 4 variants render correct background tint + icon colour
- [ ] Light and dark mode correct
- [ ] Dismiss button fires `onDismiss` and fades out the alert
- [ ] Reduced motion: dismiss is instant (no animation) when setting is on
- [ ] Screen reader announces role `alert` via `accessibilityRole="alert"`

---

### M4 · Button
**Web counterpart:** `Button.tsx` + `Button.module.css`  
**Blocking dependency:** M3 complete

**What to build:**
- `packages/mobile/components/Button/Button.tsx`
- `packages/mobile/components/Button/Button.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `variant` | `primary` · `secondary` · `ghost` · `danger` |
| `size` | `sm` · `md` · `lg` |
| `disabled` | `boolean` |
| `loading` | `boolean` — replaces label with `ActivityIndicator` |
| `iconLeft` / `iconRight` | icon node (optional) |
| `fullWidth` | `boolean` |

**RN-specific notes:**
- Use `Pressable` not `TouchableOpacity` — gives full control over pressed state via `style` callback
- Pressed state: darken via `opacity: 0.85` (no CSS `filter`)
- Minimum touch target: 44×44pt enforced via `minHeight: tokens.touchTarget.min`
- `ActivityIndicator` colour matches button text colour
- `accessibilityRole="button"`, `accessibilityState={{ disabled, busy: loading }}`

**Sign-off checklist:**
- [ ] All 4 variants correct in light + dark
- [ ] sm / md / lg sizes correct — heights match token `touchTarget` scale
- [ ] Pressed state visible (opacity shift)
- [ ] Disabled: no press feedback, `accessibilityState.disabled` true
- [ ] Loading: spinner shows, button non-interactive
- [ ] Full-width stretches to parent container
- [ ] 44pt minimum touch target on all sizes

---

## Phase 2 — Forms
> Requires `@gorhom/bottom-sheet` (for bottom-sheet variant in Textarea/Input) and focus state managed in JS (no CSS `:focus-visible`).

**Install before starting Phase 2:**
```bash
npx expo install @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated
```

---

### M5 · Input
**Web counterpart:** `Input.tsx` + `Input.module.css`  
**Blocking dependency:** M4 complete + Phase 2 deps installed

**What to build:**
- `packages/mobile/components/Input/Input.tsx`
- `packages/mobile/components/Input/Input.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `variant` | `default` · `filled` · `ghost` |
| `size` | `sm` · `md` · `lg` |
| `state` | `default` · `error` · `success` · `disabled` |
| `label` | `string` (renders M2 Label above) |
| `helperText` | `string` |
| `errorText` | `string` |
| `leadingIcon` / `trailingIcon` | icon node |
| `secureTextEntry` | `boolean` |

**RN-specific notes:**
- Use RN `TextInput` — not `<input>`
- Focus ring: JS `useState(isFocused)` + `onFocus` / `onBlur` — toggle border colour
- `accessibilityLabel` = label prop value; `accessibilityHint` = helperText
- `accessibilityState={{ disabled }}`, `accessibilityInvalid` for error state

**Sign-off checklist:**
- [ ] All 3 variants render correct border/background in light + dark
- [ ] Focus state: border shifts to `tokens.semantic.primary`
- [ ] Error state: border + helperText in danger colour
- [ ] sm / md / lg sizes correct
- [ ] Disabled: no focus, reduced opacity
- [ ] SecureTextEntry toggle shows/hides password
- [ ] Keyboard avoidance works (content not hidden behind keyboard)

---

### M6 · Textarea
**Web counterpart:** `Textarea.tsx` + `Textarea.module.css`  
**Blocking dependency:** M5 complete

**What to build:**
- `packages/mobile/components/Textarea/Textarea.tsx`
- `packages/mobile/components/Textarea/Textarea.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `variant` | `default` · `filled` |
| `size` | `sm` · `md` · `lg` |
| `state` | `default` · `error` · `disabled` |
| `rows` | `number` (sets `minHeight`) |
| `autoGrow` | `boolean` — expands with content |
| `maxRows` | `number` — caps auto-grow height |
| `label` | `string` |
| `helperText` / `errorText` | `string` |

**RN-specific notes:**
- `TextInput multiline` — set `textAlignVertical: "top"` (Android alignment fix)
- Auto-grow: `onContentSizeChange` → update `height` in state (cap at `maxRows × lineHeight`)
- Character count: render `current/max` in subtext if `maxLength` provided
- Wrap in `KeyboardAvoidingView` in the storybook/demo screen

**Sign-off checklist:**
- [ ] Multiline input scrolls correctly (iOS and Android)
- [ ] Auto-grow expands up to `maxRows` then scrolls
- [ ] Focus ring same pattern as Input
- [ ] Error / disabled states correct
- [ ] Character counter updates on each keystroke
- [ ] `textAlignVertical: "top"` confirmed on Android

---

### M7 · Checkbox
**Web counterpart:** `Checkbox.tsx` + `Checkbox.module.css`  
**Blocking dependency:** M6 complete

**What to build:**
- `packages/mobile/components/Checkbox/Checkbox.tsx`
- `packages/mobile/components/Checkbox/Checkbox.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `checked` | `boolean` |
| `indeterminate` | `boolean` |
| `disabled` | `boolean` |
| `size` | `sm` · `md` · `lg` |
| `label` | `string` |
| `onValueChange` | `(checked: boolean) => void` |

**RN-specific notes:**
- No Radix — build custom `Pressable` + animated checkmark
- Checkmark: `Animated.timing` scale from 0 → 1 on check (respect `useReducedMotion`)
- Touch target: entire row (`View` with `Pressable`) not just the box — minimum 44pt height
- `accessibilityRole="checkbox"`, `accessibilityState={{ checked, disabled }}`

**Sign-off checklist:**
- [ ] Unchecked / checked / indeterminate states visually correct
- [ ] Check animation plays on tap (instant if reduced motion)
- [ ] sm / md / lg box sizes correct
- [ ] Label tap area triggers checkbox
- [ ] Disabled: no interaction, reduced opacity
- [ ] Screen reader announces checked/unchecked correctly

---

### M8 · Switch
**Web counterpart:** `Switch.tsx` + `Switch.module.css`  
**Blocking dependency:** M7 complete

**What to build:**
- `packages/mobile/components/Switch/Switch.tsx`
- `packages/mobile/components/Switch/Switch.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `value` | `boolean` |
| `disabled` | `boolean` |
| `size` | `sm` · `md` · `lg` |
| `label` | `string` |
| `onValueChange` | `(value: boolean) => void` |

**RN-specific notes:**
- Option A: use RN built-in `<Switch>` (easiest, matches native feel) — style via `trackColor` and `thumbColor` using Atlas tokens
- Option B: custom `Pressable` + `Animated` thumb slide (more control, matches web design exactly)
- Recommended: start with Option A, upgrade to B if design fidelity requires it
- `accessibilityRole="switch"`, `accessibilityState={{ checked: value, disabled }}`

**Sign-off checklist:**
- [ ] On/off states correct colours in light + dark
- [ ] Thumb slides smoothly on toggle (or instant if reduced motion)
- [ ] sm / md / lg sizes correct
- [ ] Disabled state: no interaction, reduced opacity
- [ ] Label tap toggles switch
- [ ] Screen reader announces on/off

---

## Phase 3 — Layout

---

### M9 · Card
**Web counterpart:** `Card.tsx` + `Card.module.css`  
**Blocking dependency:** Phase 2 complete

**What to build:**
- `packages/mobile/components/Card/Card.tsx`
- `packages/mobile/components/Card/Card.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `variant` | `elevated` · `outlined` · `filled` |
| `padding` | `none` · `sm` · `md` · `lg` |
| `onPress` | `() => void` (optional — makes card tappable) |
| `children` | `ReactNode` |

**RN-specific notes:**
- `variant="elevated"`: use `shadowHelper.ts` (from Phase 0.4) for cross-platform shadow
- `variant="outlined"`: `borderWidth: tokens.borderWidth.base`, `borderColor: tokens.semantic.border`
- `variant="filled"`: `backgroundColor: tokens.semantic.surfaceSubtle`
- Tappable card: wrap in `Pressable` — show pressed state via opacity or scale (0.98)
- No CSS `box-shadow` — all shadow via `shadowHelper`

**Sign-off checklist:**
- [ ] All 3 variants correct in light + dark
- [ ] Elevated shadow visible on both iOS and Android
- [ ] Tappable variant shows pressed state
- [ ] Padding variants create correct internal spacing
- [ ] Children render without overflow clipping issues

---

### M10 · NavBar (Header + TabBar)
**Web counterpart:** `NavBar.tsx` — single top bar  
**Blocking dependency:** M9 complete

> ⚠️ Biggest platform divergence. Web NavBar is a single top bar. Mobile NavBar splits into two separate components.

**What to build:**
- `packages/mobile/components/NavBar/Header.tsx` — top safe-area header
- `packages/mobile/components/NavBar/TabBar.tsx` — bottom tab navigation
- `packages/mobile/components/NavBar/NavBar.styles.ts`

**Header prop matrix:**

| Prop | Values |
|------|--------|
| `title` | `string` |
| `variant` | `default` · `transparent` · `elevated` |
| `leftAction` | `ReactNode` (back button, menu icon) |
| `rightAction` | `ReactNode` (actions, avatar) |

**TabBar prop matrix:**

| Prop | Values |
|------|--------|
| `tabs` | `Array<{ label, icon, onPress, active }>` |
| `variant` | `default` · `floating` |

**RN-specific notes:**
- `SafeAreaView` (from `react-native-safe-area-context`) wraps both — handles notch + home indicator
- Header `position: absolute` with `backgroundColor` for `transparent` variant — requires scroll detection
- TabBar sits at the bottom, `position: absolute` or managed by Expo Router / React Navigation
- Active tab: filled icon + `tokens.semantic.primary` colour; inactive: `tokens.semantic.textSubtle`
- Tab touch targets: minimum 44pt height

**Sign-off checklist:**
- [ ] Header renders correctly with notch/status bar on iPhone
- [ ] Header renders correctly on Android (status bar padding)
- [ ] Transparent variant: header overlaps content, text readable
- [ ] Elevated variant: shadow visible
- [ ] TabBar sits above home indicator on iPhone
- [ ] Active tab highlighted; inactive tabs muted
- [ ] Tab press fires `onPress` correctly
- [ ] Both components correct in dark mode

---

## Phase 4 — Overlays
> Requires `@gorhom/bottom-sheet` (already installed in Phase 2). Install `react-native-tab-view` before M12.

**Install before M12:**
```bash
npx expo install react-native-tab-view react-native-pager-view
```

---

### M11 · Dialog
**Web counterpart:** `Dialog.tsx` + `Dialog.module.css` (uses Radix Dialog)  
**Blocking dependency:** Phase 3 complete

**What to build:**
- `packages/mobile/components/Dialog/Dialog.tsx`
- `packages/mobile/components/Dialog/Dialog.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `variant` | `modal` · `sheet` · `alert` |
| `visible` | `boolean` |
| `onDismiss` | `() => void` |
| `title` | `string` (optional) |
| `description` | `string` (optional) |
| `actions` | `ReactNode` (footer buttons) |
| `snapPoints` | `string[]` (sheet variant only, e.g. `['50%', '90%']`) |

**RN-specific notes:**
- `variant="modal"`: RN built-in `<Modal>` — `animationType="fade"`, `transparent`, overlay `TouchableWithoutFeedback` to dismiss
- `variant="sheet"`: `@gorhom/bottom-sheet` `BottomSheet` component — gesture-driven, snap points
- `variant="alert"`: RN `<Modal>` with `animationType="none"` — no dismiss on overlay tap (destructive confirmation pattern)
- Focus trap: `Modal` handles this natively on iOS/Android
- `accessibilityViewIsModal={true}` on the modal container

**Sign-off checklist:**
- [ ] Modal variant opens/closes with fade animation
- [ ] Modal overlay tap dismisses (modal variant only)
- [ ] Sheet variant opens with gesture, snaps to defined points, dismisses via swipe-down
- [ ] Alert variant: no overlay dismiss, requires explicit button action
- [ ] Dark mode: correct overlay opacity and background
- [ ] Screen reader: focus moves into modal on open, returns on close

---

### M12 · Tabs
**Web counterpart:** `Tabs.tsx` + `Tabs.module.css` (uses Radix Tabs)  
**Blocking dependency:** M11 complete + `react-native-tab-view` installed

**What to build:**
- `packages/mobile/components/Tabs/Tabs.tsx`
- `packages/mobile/components/Tabs/Tabs.styles.ts`

**Prop matrix:**

| Prop | Values |
|------|--------|
| `variant` | `line` · `pill` · `filled` |
| `tabs` | `Array<{ label, value, content: ReactNode }>` |
| `defaultValue` | `string` |
| `onChange` | `(value: string) => void` |
| `scrollable` | `boolean` — enables horizontal scroll on tab strip |

**RN-specific notes:**
- Tab strip: horizontal `ScrollView` (if `scrollable`) or `View` row — `onLayout` measurements for indicator positioning
- Active indicator: `Animated.timing` sliding underline (`line` variant) or animated background (`pill` / `filled`) — respect `useReducedMotion`
- Content pane: `react-native-tab-view` `TabView` for swipe-between-tabs gesture
- No keyboard tab navigation (RN has no keyboard tab focus concept) — touch/swipe only
- `accessibilityRole="tab"` on each trigger, `accessibilityState={{ selected }}`, `accessibilityRole="tabpanel"` on content

**Sign-off checklist:**
- [ ] All 3 variants render correct active/inactive indicator in light + dark
- [ ] Swipe-left/right between tab content panes
- [ ] Sliding indicator follows active tab correctly on all screen widths
- [ ] Scrollable variant scrolls horizontally when tabs overflow
- [ ] `onChange` fires on both tap and swipe
- [ ] Reduced motion: indicator jumps to position (no slide animation)
- [ ] Screen reader announces selected tab correctly

---

## Overall Status Tracker

| Phase | Session | Component | Status |
|-------|---------|-----------|--------|
| 0 | — | Expo init | ✅ Done |
| 0 | — | Token pipeline | ✅ Done |
| 0 | — | ThemeProvider + useTheme | ✅ Done |
| 0 | — | shadowHelper | ✅ Done |
| 0 | — | useReducedMotion | ✅ Done |
| 1 | M1 | Badge | ✅ Done |
| 1 | M2 | Label | ✅ Done |
| 1 | M3 | Alert | ✅ Done |
| 1 | M4 | Button | ✅ Done |
| 2 | M5 | Input | ✅ Done |
| 2 | M6 | Textarea | ✅ Done |
| 2 | M7 | Checkbox | ⬜ |
| 2 | M8 | Switch | ⬜ |
| 3 | M9 | Card | ⬜ |
| 3 | M10 | NavBar (Header + TabBar) | ⬜ |
| 4 | M11 | Dialog | ⬜ |
| 4 | M12 | Tabs | ⬜ |

---

## Dependency Install Summary

| Phase | Package | Command |
|-------|---------|---------|
| 0 | Expo | `npx create-expo-app packages/mobile --template blank-typescript` |
| 0 | Safe Area | `npx expo install react-native-safe-area-context` |
| 0 | Vector Icons | `npx expo install @expo/vector-icons` |
| 2 | Gesture + Reanimated | `npx expo install react-native-gesture-handler react-native-reanimated` |
| 2 | Bottom Sheet | `npx expo install @gorhom/bottom-sheet` |
| 4 | Tab View | `npx expo install react-native-tab-view react-native-pager-view` |

---

## Sign-off Protocol (same as web S3–S14)

A component is **🟢 spec-complete** only when:
1. All variants × sizes × states render correctly on **iOS Simulator** (iPhone 15 Pro)
2. All variants × sizes × states render correctly on **Android Emulator** (Pixel 7)
3. Light mode and dark mode both verified
4. Screen reader (VoiceOver on iOS, TalkBack on Android) announces correctly
5. The sign-off checklist for that session is fully ticked

No component advances until its checklist is complete.
