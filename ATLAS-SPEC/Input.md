# Input

> Single-line text entry. The workhorse of every form.

---

## Anatomy

```
Input
├── Leading icon       (optional)
├── Field              (required — the editable text area)
├── Trailing icon      (optional — clear, reveal, search)
└── Affix              (optional — prefix/suffix text, e.g. "$" or ".com")
```

Composed inside `Field` (Label + Input + HelperText/ErrorText). This spec covers the input atom only.

---

## Variants × Sizes × States

### Variants
- `default` — neutral surface, default border
- `filled` — `--atlas-background-muted` fill, no visible border at rest
- `unstyled` — borderless, transparent (table cells, inline edits)

### Sizes
| Size | Height | Padding-x | Type role |
|---|---|---|---|
| `sm` | 32px | `spacing.3` | `text-sm` |
| `md` | 40px | `spacing.3` | `text-body` |
| `lg` | 48px | `spacing.4` | `text-body` |

Mobile-app baseline: `md` minimum (44px hit area when paired with label tap zone).

### States
- `default` · `hover` (web) · `focus-visible` · `disabled` · `readonly` · `error` · `loading` (trailing spinner)

---

## Token mappings

### Background

| Variant | default | hover | focus | disabled |
|---|---|---|---|---|
| default | `--atlas-background` | `--atlas-background` | `--atlas-background` | `--atlas-background-muted` |
| filled | `--atlas-background-muted` | `--atlas-background-subtle` | `--atlas-background` | `--atlas-background-muted` |
| unstyled | `transparent` | `transparent` | `transparent` | `transparent` |

### Border

| Variant / state | default | hover | focus-visible | error |
|---|---|---|---|---|
| default | `--atlas-border-width-1` solid `--atlas-border` | same · color → `--atlas-border-strong` | same · color → `--atlas-primary` | same · color → `--atlas-danger` |
| filled | none | none | bottom border `--atlas-primary` | bottom border `--atlas-danger` |
| unstyled | none | none | bottom border `--atlas-primary` | bottom border `--atlas-danger` |

### Foreground

- Text: `--atlas-foreground`
- Placeholder: `--atlas-foreground-muted`
- Disabled text: `--atlas-foreground-disabled`
- Icon: `--atlas-foreground-muted`

### Radius

`default`, `filled`: `--atlas-radius-md`. `unstyled`: 0.

### Focus ring

Outside-ring (`2px` `--atlas-focus-ring`, `2px` offset) when `focus-visible`. Border color also shifts.

### Motion

`border-color`, `background-color` over `--atlas-duration-fast` `--atlas-easing-standard`. Reduced-motion → 0ms.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | All sizes; `md` default. |
| Tablet Web | Same. |
| Mobile Web | `md` minimum; hit area ≥ `--atlas-touch-min`. |
| Mobile App (RN) | `md` minimum. `keyboardType` and `autoCapitalize` props passed through. Native focus highlight on iOS preserved. |

---

## Accessibility

- **Role** — `<input>` (web) / `TextInput` (RN)
- **Labelling** — always paired with `Label` (or `aria-label` if visually hidden)
- **Error** — `aria-invalid="true"`, error text linked via `aria-describedby`
- **Required** — `aria-required="true"`, label shows required marker
- **Keyboard** — native browser/RN behavior; all keyboard navigation works
- **Screen reader** — announces label, value, state, helper/error text
- **Reduced motion** — transitions reduced to 0ms

---

## Code API

```ts
type InputProps = {
  variant?: "default" | "filled" | "unstyled";
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  // Native HTML / RN TextInput props passed through
  className?: string;
};
```

### Defaults

`variant = "default"` · `size = "md"` · `invalid = false` · `disabled = false`

### Code Connect mapping

| Figma property | React prop | Enum strings |
|---|---|---|
| `Variant` | `variant` | default · filled · unstyled |
| `Size` | `size` | sm · md · lg |
| `State` | computed | default · hover · focus · disabled · error |
| `Has leading icon` | `leadingIcon` boolean | true → render slot |
| `Has trailing icon` | `trailingIcon` boolean | true → render slot |

---

## Test checklist

- [ ] All variants × sizes × states render in Light + Dark
- [ ] RTL: leading/trailing icons swap positions; affixes follow logical order
- [ ] Mobile hit area ≥ 44px
- [ ] Focus ring visible on `focus-visible`
- [ ] `aria-invalid` and `aria-describedby` wire up correctly
- [ ] Tokens semantic only; no primitives, no hex
- [ ] Figma `Input` name = code `Input` name
- [ ] Code Connect round-trip verified
