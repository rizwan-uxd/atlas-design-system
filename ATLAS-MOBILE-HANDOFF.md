# Atlas Mobile — Session Handoff

**Repo:** `github.com/rizwan-uxd/atlas-design-system`  
**Project path (Mac):** `~/Desktop/Learnings/AI vibe coding projects/Projects /Claude code design system/Design system with Claude/`  
**Mobile workspace:** `packages/mobile/`  
**Stack:** Expo SDK 54 · React Native 0.81 · React 19 · TypeScript

---

## ✅ What's complete

### Phase 0 — Foundation (all done)
| Step | File(s) |
|------|---------|
| Expo init (SDK 54) | `packages/mobile/` |
| Token pipeline | `packages/mobile/tokens/atlas.tokens.ts` |
| ThemeProvider + useTheme | `packages/mobile/theme/ThemeProvider.tsx`, `useTheme.ts`, `index.ts` |
| shadowHelper | `packages/mobile/utils/shadowHelper.ts` |
| useReducedMotion | `packages/mobile/utils/useReducedMotion.ts` |

### Phase 1 — Primitives (all done, iOS simulator verified ✅)
| Component | Files | Notes |
|-----------|-------|-------|
| M1 Badge | `components/Badge/Badge.tsx` + `Badge.styles.ts` | 6 variants × 3 sizes × dot mode |
| M2 Label | `components/Label/Label.tsx` + `Label.styles.ts` | 3 sizes, required asterisk, disabled opacity |
| M3 Alert | `components/Alert/Alert.tsx` + `Alert.styles.ts` | 4 variants, animated dismiss, useReducedMotion, Ionicons |
| M4 Button | `components/Button/Button.tsx` + `Button.styles.ts` | 4 variants × 3 sizes, loading spinner, disabled, 44pt min touch target |

**Barrel export:** `packages/mobile/components/index.ts`  
**Demo screen:** `packages/mobile/App.tsx` — Phase 1 interactive demo (Alert dismiss + Button loading timer)

---

## ⏭️ Next: Phase 2 — Forms (M5–M8)

### Step 1 — Install deps FIRST (before writing any code)
```bash
cd "~/Desktop/Learnings/AI vibe coding projects/Projects /Claude code design system/Design system with Claude/packages/mobile"
npx expo install react-native-gesture-handler react-native-reanimated @gorhom/bottom-sheet
```

### Step 2 — Build in order (each blocks the next)

| Session | Component | Key RN notes |
|---------|-----------|-------------|
| M5 | **Input** | `TextInput`, JS focus state via `useState(isFocused)` + `onFocus`/`onBlur`, border colour toggle, `accessibilityLabelledBy` wired to Label |
| M6 | **Textarea** | `TextInput multiline`, `textAlignVertical:"top"` (Android fix), auto-grow via `onContentSizeChange`, character counter |
| M7 | **Checkbox** | Custom `Pressable` + `Animated` checkmark scale 0→1, `accessibilityRole="checkbox"`, entire row is touch target |
| M8 | **Switch** | Start with RN built-in `<Switch>` styled via `trackColor`/`thumbColor` using Atlas tokens, `accessibilityRole="switch"` |

### Prop matrices
**M5 Input:** `variant` (default·filled·ghost) · `size` (sm·md·lg) · `state` (default·error·success·disabled) · `label` · `helperText` · `errorText` · `leadingIcon` · `trailingIcon` · `secureTextEntry`

**M6 Textarea:** `variant` (default·filled) · `size` (sm·md·lg) · `state` (default·error·disabled) · `rows` · `autoGrow` · `maxRows` · `label` · `helperText` · `errorText`

**M7 Checkbox:** `checked` · `indeterminate` · `disabled` · `size` (sm·md·lg) · `label` · `onValueChange`

**M8 Switch:** `value` · `disabled` · `size` (sm·md·lg) · `label` · `onValueChange`

---

## Token reference (key values)

```ts
// Import pattern used in all components:
import { useTheme } from '../../theme/useTheme'
import tokens from '../../tokens/atlas.tokens'

const { colors, tokens } = useTheme()

// colors  → semantic (light/dark aware): colors.primary, colors.danger, etc.
// tokens  → scale (scheme-independent): tokens.spacing[4], tokens.radius.md, etc.
```

**Focus ring colour:** `colors.focusRing` (`#4b7ff7` light / `#729fff` dark)  
**Error colour:** `colors.danger`  
**Disabled opacity:** `tokens.opacity.disabled` = `0.5`  
**Min touch target:** `tokens.touchTarget.min` = `44`  
**Border width:** `tokens.borderWidth[1]` = `1`

---

## Sign-off protocol (same for every component)
A component is 🟢 only when:
1. All variants × sizes × states correct on **iOS Simulator** (iPhone 15 Pro / iPhone 17)
2. Light **and** dark mode verified
3. Screen reader accessible (`accessibilityRole`, `accessibilityState`, `accessibilityLabel`)
4. Sign-off checklist in `ATLAS-MOBILE-SESSIONS-PLAN.md` fully ticked

---

## File tree (current state)
```
packages/mobile/
├── App.tsx                          ← Phase 1 demo screen
├── index.ts                         ← Expo entry point
├── tokens/
│   └── atlas.tokens.ts              ← All design tokens
├── theme/
│   ├── ThemeProvider.tsx
│   ├── useTheme.ts
│   └── index.ts
├── utils/
│   ├── shadowHelper.ts
│   └── useReducedMotion.ts
└── components/
    ├── index.ts                     ← Barrel export (Phase 1)
    ├── Badge/
    │   ├── Badge.tsx
    │   └── Badge.styles.ts
    ├── Label/
    │   ├── Label.tsx
    │   └── Label.styles.ts
    ├── Alert/
    │   ├── Alert.tsx
    │   └── Alert.styles.ts
    └── Button/
        ├── Button.tsx
        └── Button.styles.ts
```
