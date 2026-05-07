# Textarea

> Multi-line text entry. Used for messages, descriptions, and free-form content.

---

## Anatomy

```
Textarea
├── Field              (required — multi-line editable area)
├── Resize handle      (optional, web only)
└── Character counter  (optional — bottom-end)
```

Inherits visual language from `Input`. Differences are vertical sizing and resize behavior.

---

## Variants × Sizes × States

### Variants
- `default` — neutral surface, default border
- `filled` — `--atlas-background-muted` fill

### Sizes
| Size | Min height | Padding | Type role |
|---|---|---|---|
| `sm` | 80px | `spacing.2` `spacing.3` | `text-sm` |
| `md` | 96px | `spacing.3` | `text-body` |
| `lg` | 128px | `spacing.3` `spacing.4` | `text-body` |

`rows` prop overrides min-height when provided.

### States
Same as Input: `default` · `hover` · `focus-visible` · `disabled` · `readonly` · `error`

---

## Token mappings

Background, border, foreground, focus ring, motion — identical to `Input` (see `Input.md`).

Resize handle (web only): `--atlas-foreground-muted`, `8px × 8px`. Hidden on `unstyled` and on RN.

Character counter:
- Position: bottom-inline-end, inset by `spacing.2`
- Color: `--atlas-foreground-muted`
- Color when over limit: `--atlas-danger`
- Type: `text-caption`

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | All sizes; resize defaults to `vertical`. |
| Tablet Web | Same. |
| Mobile Web | `md` minimum; resize disabled (`resize: none`) — height grows automatically with content if `autoGrow=true`. |
| Mobile App (RN) | `<TextInput multiline />`. No native resize handle. `autoGrow=true` measures content and resizes container; capped by `maxRows`. |

---

## Accessibility

- **Role** — `<textarea>` (web) / `TextInput multiline` (RN)
- **Labelling** — paired with `Label`
- **Error** — `aria-invalid="true"`, `aria-describedby` linked to error text
- **Required** — `aria-required="true"`
- **Counter** — when present, announced as `"X of Y characters used"` via `aria-live="polite"` (sparse — only on focus blur or limit approach)
- **Keyboard** — `Tab` exits the field (does not insert tab character by default; matches platform convention)

---

## Code API

```ts
type TextareaProps = {
  variant?: "default" | "filled";
  size?: "sm" | "md" | "lg";
  rows?: number;
  resize?: "none" | "vertical" | "both";   // Web only
  autoGrow?: boolean;
  maxRows?: number;                          // Cap for autoGrow
  showCount?: boolean;
  maxLength?: number;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
};
```

### Defaults

`variant = "default"` · `size = "md"` · `resize = "vertical"` (web) · `autoGrow = false`

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Size` | `size` |
| `State` | computed |
| `Show counter` | `showCount` |

---

## Test checklist

- [ ] All variants × sizes render in Light + Dark
- [ ] Resize handle appears only on web for permitted variants
- [ ] `autoGrow` works on RN (measures and resizes within `maxRows`)
- [ ] Counter color shifts to `--atlas-danger` over `maxLength`
- [ ] Focus ring visible
- [ ] `aria-invalid` / `aria-describedby` wire up
- [ ] No primitive tokens
- [ ] Figma `Textarea` = code `Textarea`
- [ ] Code Connect verified
