# Label

> Form-field label. Identifies the control it labels and signals required/optional state.

---

## Anatomy

```
Label
├── Text                (required)
├── Required marker     (optional — "*" when required)
└── Optional hint       (optional — "(optional)" subdued text)
```

Pairs with any form control via `htmlFor` (web) or `nativeID` (RN). Inside compound `Field`, the link is automatic.

---

## Variants × Sizes × States

### Variants
- `default` — paired with single-line controls
- `inline` — sits beside the control (used in horizontal layouts)

### Sizes
Inherits from the control it labels:
| Control size | Label type role |
|---|---|
| `sm` | `text-sm` |
| `md` | `text-body-sm` |
| `lg` | `text-body` |

### States
- `default` · `disabled` (mirrors control) · `error` (text shifts color)

Required/optional are not states — they are anatomy slots that may be present.

---

## Token mappings

| Property | default | disabled | error |
|---|---|---|---|
| `color` | `--atlas-foreground` | `--atlas-foreground-disabled` | `--atlas-danger` |
| Required marker color | `--atlas-danger` | `--atlas-foreground-disabled` | `--atlas-danger` |
| Optional hint color | `--atlas-foreground-muted` | `--atlas-foreground-disabled` | `--atlas-foreground-muted` |
| Font weight | `--atlas-font-weight-medium` | same | same |
| Margin-block-end (gap to control) | `--atlas-spacing-1-5` (6px) | same | same |

No background, no border, no radius.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | Default block placement above control. |
| Tablet Web | Same. |
| Mobile Web | Same; ensure tap on label focuses control (native `<label htmlFor>`). |
| Mobile App (RN) | RN `Pressable` wrapping `Text` + linked control via `nativeID`. Tap on label focuses input. |

---

## Accessibility

- **Role** — `<label>` (web) / `Text` with `accessibilityRole="text"` linked via `nativeID` (RN)
- **Linking** — `htmlFor` matches control `id` (web); `accessibilityLabelledBy`/`nativeID` (RN)
- **Required** — required marker is decorative; the control itself carries `aria-required`
- **Error** — when error, color shifts; the error text is announced via `aria-describedby` on control, not via label

---

## Code API

```ts
type LabelProps = {
  variant?: "default" | "inline";
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  htmlFor?: string;            // Web
  nativeID?: string;           // RN
  className?: string;
  children: React.ReactNode;
};
```

### Defaults

`variant = "default"` · `required = false` · `optional = false`

`required` and `optional` are mutually exclusive; if both are passed, `required` wins.

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Required` | `required` |
| `Optional` | `optional` |
| `State` | computed (`disabled`, `invalid`) |

---

## Test checklist

- [ ] All variants render in Light + Dark
- [ ] Required marker only shows when `required=true`
- [ ] Optional hint only shows when `optional=true`
- [ ] Tap on label focuses linked control on web and RN
- [ ] Disabled and error color tokens applied
- [ ] No primitive tokens, no hex
- [ ] Figma `Label` = code `Label`
- [ ] Code Connect verified
