# Tabs

> Switch between sibling content panels at the same level. Top tabs only in v1; bottom-tab navigation lives in `NavBar`.

---

## Anatomy

```
Tabs
├── Tabs.List              (required — the strip of triggers)
│   └── Tabs.Trigger       (one per panel)
│       ├── Leading icon   (optional)
│       ├── Label          (required — unless icon-only)
│       └── Badge          (optional — count or status)
└── Tabs.Panel             (one per trigger; only the active panel renders/displays)
```

Roving tab focus inside `Tabs.List`; arrow keys move between triggers, `Enter`/`Space` activates.

---

## Variants × Sizes × States

### Variants
- `underline` — active trigger has a 2px underline (default)
- `pills` — active trigger has a filled background pill
- `enclosed` — triggers form a card-like row with active = filled

### Sizes
| Size | Trigger height | Padding-x | Type role |
|---|---|---|---|
| `sm` | 32px | `spacing.3` | `text-sm` |
| `md` | 40px | `spacing.4` | `text-body` |
| `lg` | 48px | `spacing.5` | `text-body` |

Mobile-app baseline: `md` minimum; tap target ≥ `--atlas-touch-min`.

### States (per trigger)
- `default` (inactive)
- `active` (current panel)
- `hover` (web)
- `focus-visible`
- `pressed`
- `disabled`

---

## Token mappings

### Underline variant

| State | trigger color | underline |
|---|---|---|
| default | `--atlas-foreground-muted` | none |
| hover | `--atlas-foreground` | none |
| active | `--atlas-foreground` | 2px solid `--atlas-primary` |
| disabled | `--atlas-foreground-disabled` | none |

List has a hairline underline at the bottom: `--atlas-border-width-1` solid `--atlas-border`.

### Pills variant

| State | background | color |
|---|---|---|
| default | `transparent` | `--atlas-foreground-muted` |
| hover | `--atlas-background-subtle` | `--atlas-foreground` |
| active | `--atlas-primary` | `--atlas-primary-foreground` |
| disabled | `transparent` | `--atlas-foreground-disabled` |

Trigger radius: `--atlas-radius-md`. List has no border.

### Enclosed variant

List background `--atlas-background-muted`, radius `--atlas-radius-md`, padding `spacing.1`.

| State | background | color |
|---|---|---|
| default | `transparent` | `--atlas-foreground-muted` |
| hover | `--atlas-background-subtle` | `--atlas-foreground` |
| active | `--atlas-background` | `--atlas-foreground` |
| disabled | `transparent` | `--atlas-foreground-disabled` |

Active trigger has `--atlas-shadow-sm` for separation.

### Focus ring (all variants)

`2px` `--atlas-focus-ring`, `2px` offset on the trigger.

### Motion

Active indicator slides between positions using `transform: translateX` over `--atlas-duration-base` `--atlas-easing-emphasized`.
Color/background transitions over `--atlas-duration-fast` `--atlas-easing-standard`.
Reduced motion: instant indicator move, no glide.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | All variants and sizes. List can be horizontally scrollable when overflowing (`overflow-x: auto`, scroll snap). |
| Tablet Web | Same. |
| Mobile Web | List is horizontally scrollable; `md` minimum. Underline variant recommended (familiar mobile pattern). |
| Mobile App (RN) | Implemented via Reusables Tabs or `react-native-tab-view`. Swipe between panels enabled by default; opt out via `swipeable={false}`. Underline variant default; bottom-tab navigation handled by NavBar. |

---

## Accessibility

- **Role** — `tablist` for `Tabs.List`, `tab` for each trigger, `tabpanel` for each panel
- **Labelling** — each `Tabs.Panel` has `aria-labelledby` pointing to its trigger; each trigger has `aria-controls` pointing to its panel
- **Activation** — `automatic` (focus = activate) or `manual` (focus then `Enter`/`Space` activates) — controlled via `activationMode`. Default: `automatic`.
- **Keyboard** — Arrow Inline-Start/Inline-End move between triggers (RTL-aware), Home/End jump to first/last, `Enter`/`Space` activates in manual mode
- **Disabled tab** — skipped during arrow navigation
- **Screen reader** — announces tab name and position ("Tab 2 of 4")
- **Reduced motion** — instant indicator move

---

## Code API

```ts
type TabsProps = {
  variant?: "underline" | "pills" | "enclosed";
  size?: "sm" | "md" | "lg";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  activationMode?: "automatic" | "manual";
  swipeable?: boolean;            // RN only
  className?: string;
  children?: React.ReactNode;
};

// Sub-components:
// Tabs.List      — { children, scrollable? }
// Tabs.Trigger   — { value, leadingIcon?, badge?, disabled? }
// Tabs.Panel     — { value, forceMount? }
```

### Defaults

`variant = "underline"` · `size = "md"` · `activationMode = "automatic"` · `swipeable = true` (RN)

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Size` | `size` |
| `Active index` | computed via `value` |
| `Has leading icon` | per-trigger `leadingIcon` boolean |
| `Has badge` | per-trigger `badge` boolean |

In Figma, `Tabs` is the parent set; `Tabs.Trigger` is a nested component with its own variants for state (default/active/disabled) — used at design time and ignored by Code Connect.

---

## Test checklist

- [ ] All variants × sizes render in Light + Dark
- [ ] Active indicator slides correctly when switching
- [ ] Arrow keys navigate (RTL-aware: inline-start/end)
- [ ] `aria-controls` / `aria-labelledby` wire up
- [ ] Disabled tabs skip in arrow navigation
- [ ] Mobile horizontal scroll snaps to triggers
- [ ] RN swipe between panels works
- [ ] Mobile hit area ≥ 44px
- [ ] Reduced motion suppresses indicator glide
- [ ] No primitive tokens
- [ ] Figma `Tabs` = code `Tabs`
- [ ] Code Connect verified
