# Checkbox

> Binary or tri-state selector for one or many independent choices.

---

## Anatomy

```
Checkbox
├── Box                 (required — the visual square)
├── Indicator           (the check or dash glyph; appears when checked/indeterminate)
└── Label               (optional — recommended; when omitted, aria-label required)
```

Often composed inside a `Field` with `Label` and `HelperText`. The label tap zone is part of the hit target.

---

## Variants × Sizes × States

### Variants
- `default` — single, standalone
- `card` — wrapped in a selectable surface (e.g., feature picker); whole card is the click target

### Sizes
| Size | Box | Type role for label |
|---|---|---|
| `sm` | 16px | `text-sm` |
| `md` | 20px | `text-body` |

Mobile-app: tap target is the whole row, ≥ `--atlas-touch-min`. Box itself stays compact.

### States
- `unchecked` (default)
- `checked`
- `indeterminate`
- `hover` (web)
- `focus-visible`
- `pressed`
- `disabled`
- `error`

---

## Token mappings

### Box background

| State | unchecked | checked / indeterminate |
|---|---|---|
| default | `--atlas-background` | `--atlas-primary` |
| hover | `--atlas-background-subtle` | `--atlas-primary-hover` |
| disabled | `--atlas-background-muted` + `opacity-disabled` | `--atlas-primary` + `opacity-disabled` |
| error | `--atlas-background` | `--atlas-danger` |

### Box border

| State | unchecked | checked |
|---|---|---|
| default | `--atlas-border-width-1` solid `--atlas-border-strong` | none (filled) |
| hover | `--atlas-border-width-1` solid `--atlas-foreground` | none |
| disabled | `--atlas-border-width-1` solid `--atlas-border` | none |
| error | `--atlas-border-width-1` solid `--atlas-danger` | none |

### Indicator (check / dash)

Color: `--atlas-primary-foreground`. In error state when checked: `--atlas-danger-foreground`.

### Radius

`--atlas-radius-sm` (4px). Slightly tighter than Button to match the smaller form.

### Focus ring

`2px` `--atlas-focus-ring`, `2px` offset around the box (not the entire row, on web). RN uses platform native ring.

### Motion

Indicator scales `0 → 1` over `--atlas-duration-fast` `--atlas-easing-emphasized`. Background color over `--atlas-duration-fast` `--atlas-easing-standard`. Reduced motion → no scale, instant background.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | Default behavior. |
| Tablet Web | Same. |
| Mobile Web | Tap target = full row. Hover state never persists. |
| Mobile App (RN) | RN Reusables checkbox primitive. Press feedback on the row, indicator scales in. Long press not used. |

---

## Accessibility

- **Role** — `checkbox` (HTML `<input type="checkbox">`; RN `Pressable` with `accessibilityRole="checkbox"`)
- **State** — `aria-checked = "true" | "false" | "mixed"` (mixed for indeterminate)
- **Keyboard** — `Space` toggles; `Tab` enters focus
- **Labelling** — labelled by adjacent `Label` via `htmlFor`/`nativeID`; if no label, `aria-label` required
- **Group** — when in a group, wrap in `fieldset` + `legend` (web) or `accessibilityRole="radiogroup"` is wrong here — for groups of checkboxes, use a labeled container
- **Error** — `aria-invalid="true"` + `aria-describedby` to error text
- **Reduced motion** — indicator scale reduced

---

## Code API

```ts
type CheckboxProps = {
  variant?: "default" | "card";
  size?: "sm" | "md";
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};
```

### Defaults

`variant = "default"` · `size = "md"` · uncontrolled by default (use `defaultChecked` or controlled via `checked` + `onCheckedChange`).

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Size` | `size` |
| `State` | computed (`checked`, `indeterminate`, `disabled`, `invalid`) |
| `Has label` | `label` boolean |
| `Has description` | `description` boolean |

---

## Test checklist

- [ ] All variants × sizes × states render in Light + Dark
- [ ] Indeterminate state announces `aria-checked="mixed"`
- [ ] Tap on label toggles state on web and RN
- [ ] Mobile hit area = full row, ≥ 44px
- [ ] Focus ring visible on box
- [ ] `Space` toggles via keyboard
- [ ] No primitive tokens
- [ ] Figma `Checkbox` = code `Checkbox`
- [ ] Code Connect verified
