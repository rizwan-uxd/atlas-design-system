# Alert

> Inline message that conveys status or feedback in-place. Not a toast; renders within page flow.

---

## Anatomy

```
Alert
├── Leading icon       (optional but recommended — intent-coded)
├── Title              (optional — bold, first line)
├── Description        (optional — body)
├── Actions            (optional — inline buttons)
└── Dismiss button     (optional — trailing "×")
```

At least one of `title` or `description` must be present.

---

## Variants × Sizes × States

### Variants
- `info` — neutral informational
- `success` — confirmation
- `warning` — caution
- `danger` — error / blocking issue

### Sizes
| Size | Padding | Type roles |
|---|---|---|
| `sm` | `spacing.3` | title `text-body-sm` · desc `text-caption` |
| `md` | `spacing.4` | title `text-body` · desc `text-body-sm` |

### States
- `default`
- `dismissing` (transient — out animation)

Alerts have no hover/focus states themselves (they are not interactive); embedded buttons and dismiss carry their own states.

---

## Token mappings

### Background

| Variant | background |
|---|---|
| info | `--atlas-info-subtle` |
| success | `--atlas-success-subtle` |
| warning | `--atlas-warning-subtle` |
| danger | `--atlas-danger-subtle` |

### Border

`--atlas-border-width-1` solid, color follows intent:

| Variant | border |
|---|---|
| info | `--atlas-info-muted` |
| success | `--atlas-success-muted` |
| warning | `--atlas-warning-muted` |
| danger | `--atlas-danger-muted` |

### Foreground

| Variant | title color | description color |
|---|---|---|
| info | `--atlas-info-foreground` | `--atlas-foreground` |
| success | `--atlas-success-foreground` | `--atlas-foreground` |
| warning | `--atlas-warning-foreground` | `--atlas-foreground` |
| danger | `--atlas-danger-foreground` | `--atlas-foreground` |

Leading icon color follows the title color of the variant.

### Radius

`--atlas-radius-md`.

### Motion

Enter: fade + 4px translate-y over `--atlas-duration-base` `--atlas-easing-emphasized`.
Exit (dismissing): fade + height collapse over `--atlas-duration-base` `--atlas-easing-exit`.
Reduced motion → no translate, no collapse animation; instant.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | Inline above forms, in page sections, etc. |
| Tablet Web | Same. |
| Mobile Web | Same; `md` minimum. Actions wrap to a new line if the row would overflow. |
| Mobile App (RN) | Same. Dismiss button hit area ≥ `--atlas-touch-min`. |

Alerts never anchor to viewport edges — that's a Toast (deferred to v1.1+).

---

## Accessibility

- **Role** — `role="status"` for `info`/`success` (polite live region); `role="alert"` for `warning`/`danger` (assertive live region)
- **aria-live** — automatic via `role`; `polite` for non-blocking, `assertive` for blocking
- **Dismiss** — `<button aria-label="Dismiss">` with the variant intent name optionally appended
- **Keyboard** — when dismissable, dismiss button is focusable; `Enter`/`Space` activates
- **Color** — never rely on color alone; intent icon and (often) text provide redundant cue
- **Reduced motion** — instant enter/exit

---

## Code API

```ts
type AlertProps = {
  variant?: "info" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  title?: React.ReactNode;
  icon?: React.ReactNode;          // Override default intent icon
  hideIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;       // Slot for inline buttons
  className?: string;
  children?: React.ReactNode;       // Description content
};
```

### Defaults

`variant = "info"` · `size = "md"` · `dismissible = false` · `hideIcon = false`. Default icon is a built-in mapping per variant (info: ⓘ, success: ✓, warning: ⚠, danger: ⊗); consumer can override.

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Size` | `size` |
| `Has title` | `title` boolean |
| `Has icon` | `hideIcon` (inverted) |
| `Has actions` | `actions` boolean |
| `Dismissible` | `dismissible` |

---

## Test checklist

- [ ] All variants × sizes render in Light + Dark
- [ ] Leading icon color matches intent
- [ ] Border color matches intent without overpowering background
- [ ] `role="alert"` for warning/danger; `role="status"` for info/success
- [ ] Screen reader announces title + description on mount
- [ ] Dismiss button has accessible name
- [ ] Mobile dismiss hit area ≥ 44px
- [ ] Reduced motion suppresses enter/exit animations
- [ ] No primitive tokens
- [ ] Figma `Alert` = code `Alert`
- [ ] Code Connect verified
