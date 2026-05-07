# Switch

> Binary toggle for an immediate setting (on/off). Distinct from Checkbox: changes apply on flip, not on form submit.

---

## Anatomy

```
Switch
├── Track              (required — the pill background)
├── Thumb              (required — the moving circle)
└── Label              (optional, external)
```

Label sits beside the switch (typically inline-start) inside a `Field` row.

---

## Variants × Sizes × States

### Variants
- `default` — standard pill switch

(Single visual variant in v1. Use Checkbox or Radio for richer choice surfaces.)

### Sizes
| Size | Track | Thumb | Type role |
|---|---|---|---|
| `sm` | 32 × 18px | 14px | `text-sm` |
| `md` | 40 × 24px | 20px | `text-body` |

Mobile-app: row is the tap target (≥ `--atlas-touch-min`).

### States
- `off` (default)
- `on`
- `hover` (web)
- `focus-visible`
- `pressed`
- `disabled`

---

## Token mappings

### Track background

| State | off | on |
|---|---|---|
| default | `--atlas-background-muted` | `--atlas-primary` |
| hover | `--atlas-background-subtle` | `--atlas-primary-hover` |
| disabled | `--atlas-background-muted` + `opacity-disabled` | `--atlas-primary` + `opacity-disabled` |

### Thumb

Color: `--atlas-background` (white surface) at all times. Optional shadow `--atlas-shadow-sm` for elevation.

### Border

None on track. Optional `--atlas-border-width-1` solid `--atlas-border` on `off` state for higher contrast in light mode.

### Radius

Track: `--atlas-radius-full` (pill). Thumb: `--atlas-radius-full`.

### Focus ring

`2px` `--atlas-focus-ring`, `2px` offset around the track.

### Motion

Thumb position transitions over `--atlas-duration-base` `--atlas-easing-emphasized`. Track color over `--atlas-duration-fast` `--atlas-easing-standard`. Reduced motion → no thumb glide; snap.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | Default behavior. |
| Tablet Web | Same. |
| Mobile Web | Tap target = full row. |
| Mobile App (RN) | Native `Switch` from `react-native`. Track tinted via `trackColor`, thumb via `thumbColor`. Visual size mapped to closest native equivalent (iOS native track is ~51 × 31; Atlas md adapts but iOS native dimensions take precedence). |

Note on RN: on iOS the system Switch component has a fixed visual size; consumers may opt into a custom `<Pressable>`-based switch via `unstyled={true}` if pixel-parity with web is required. Default = native idiom.

---

## Accessibility

- **Role** — `switch` (web `<button role="switch">` via Radix; RN `Switch` exposes correct accessibility)
- **State** — `aria-checked = "true" | "false"`
- **Keyboard** — `Space` and `Enter` toggle; `Tab` enters focus
- **Labelling** — paired `Label` linked via `htmlFor`/`nativeID`; if no label, `aria-label` required
- **Announcement** — screen reader announces "On"/"Off" or "Switch, on"/"Switch, off"
- **Reduced motion** — instant snap

---

## Code API

```ts
type SwitchProps = {
  size?: "sm" | "md";
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  label?: React.ReactNode;
  unstyled?: boolean;          // RN escape hatch for custom switch
  className?: string;
};
```

### Defaults

`size = "md"` · uncontrolled by default.

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Size` | `size` |
| `State` | computed (`checked`, `disabled`) |
| `Has label` | `label` boolean |

---

## Test checklist

- [ ] All sizes × states render in Light + Dark
- [ ] Thumb glides smoothly between states (or snaps with reduced motion)
- [ ] Tap on label toggles
- [ ] Mobile hit area ≥ 44px row
- [ ] Focus ring visible on track
- [ ] `Space`/`Enter` toggle via keyboard
- [ ] RN uses native `Switch` by default
- [ ] No primitive tokens
- [ ] Figma `Switch` = code `Switch`
- [ ] Code Connect verified
