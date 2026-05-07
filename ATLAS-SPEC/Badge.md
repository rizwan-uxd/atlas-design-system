# Badge

> Compact label for status, count, or category. Non-interactive by default.

---

## Anatomy

```
Badge
├── Leading icon       (optional)
├── Label              (required)
├── Trailing icon      (optional — e.g. dismiss "×" when removable)
└── Dot                (optional — leading status dot)
```

When `removable=true`, the trailing slot becomes a close affordance and the badge becomes interactive.

---

## Variants × Sizes × States

### Variants
- `default` — neutral
- `secondary` — subtle neutral fill
- `success` — success-coloured
- `warning` — warning-coloured
- `danger` — danger-coloured
- `info` — info-coloured
- `outline` — transparent fill, border only (any of the above intents can layer on by passing `intent`)

### Sizes
| Size | Height | Padding-x | Type role |
|---|---|---|---|
| `sm` | 18px | `spacing.1-5` | `text-caption` |
| `md` | 22px | `spacing.2` | `text-caption` |
| `lg` | 26px | `spacing.2-5` | `text-body-sm` |

### States
- `default`
- `hover` (only when `removable` or `onClick`)
- `focus-visible` (only when interactive)
- `disabled`

Most badges are non-interactive — states beyond `default` and `disabled` are skipped.

---

## Token mappings

### Background

| Variant | default | hover (interactive) | disabled |
|---|---|---|---|
| default | `--atlas-background-muted` | `--atlas-background-subtle` | same + `opacity-disabled` |
| secondary | `--atlas-background-subtle` | `--atlas-background-muted` | same + `opacity-disabled` |
| success | `--atlas-success-subtle` | `--atlas-success-muted` | same + `opacity-disabled` |
| warning | `--atlas-warning-subtle` | `--atlas-warning-muted` | same + `opacity-disabled` |
| danger | `--atlas-danger-subtle` | `--atlas-danger-muted` | same + `opacity-disabled` |
| info | `--atlas-info-subtle` | `--atlas-info-muted` | same + `opacity-disabled` |
| outline | `transparent` | `--atlas-background-subtle` | `transparent` |

### Foreground

| Variant | color |
|---|---|
| default | `--atlas-foreground` |
| secondary | `--atlas-foreground` |
| success | `--atlas-success-foreground` |
| warning | `--atlas-warning-foreground` |
| danger | `--atlas-danger-foreground` |
| info | `--atlas-info-foreground` |
| outline | follows `intent` token (e.g., `--atlas-success`) or `--atlas-foreground` |

Disabled foreground: `--atlas-foreground-disabled`.

### Border

`outline` only: `--atlas-border-width-1` solid (color follows intent or `--atlas-border-strong`). All others: none.

### Radius

`--atlas-radius-full` (pill). Optional `square` prop uses `--atlas-radius-sm`.

### Dot

Leading status dot: 6px circle, color = intent foreground, inline-start margin = `spacing.1-5`.

### Focus ring

When interactive: `2px` `--atlas-focus-ring`, `2px` offset.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | All sizes available. |
| Tablet Web | Same. |
| Mobile Web | All sizes; `sm` discouraged for tappable badges. |
| Mobile App (RN) | All sizes; tap target enlarged via padding when `removable=true` to meet `--atlas-touch-min`. |

---

## Accessibility

- **Role** — `<span>` or `<div>` with no role (web); `View` with no role (RN). Decorative.
- **Status badges** — when conveying live status, wrap in `role="status"` with `aria-live="polite"`.
- **Removable** — close affordance is `<button aria-label="Remove {label}">`. Pressable on RN.
- **Color reliance** — never rely on color alone for meaning; always include text or icon.
- **Contrast** — text on background ≥ 4.5:1 in all variants × modes.

---

## Code API

```ts
type BadgeProps = {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  intent?: "default" | "success" | "warning" | "danger" | "info";  // Used with variant="outline"
  square?: boolean;
  dot?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};
```

### Defaults

`variant = "default"` · `size = "md"` · `square = false` · `dot = false` · `removable = false`

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Size` | `size` |
| `Has leading icon` | `leadingIcon` boolean |
| `Has dot` | `dot` |
| `Removable` | `removable` |
| `Square` | `square` |

---

## Test checklist

- [ ] All variants × sizes render in Light + Dark
- [ ] Contrast ≥ 4.5:1 for text on all variant backgrounds
- [ ] Removable badges have ≥ 44px tap area on mobile
- [ ] Status badges announce via `aria-live` when wrapped in `role="status"`
- [ ] Dot color matches intent
- [ ] No primitive tokens
- [ ] Figma `Badge` = code `Badge`
- [ ] Code Connect verified
