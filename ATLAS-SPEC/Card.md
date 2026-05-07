# Card

> Surface that groups related content. The default container for content blocks, list items, and dashboard tiles.

---

## Anatomy

```
Card
├── Card.Header        (optional — title, subtitle, leading visual, action slot)
│   ├── Leading        (optional — icon, avatar)
│   ├── Title          (required if Header used)
│   ├── Subtitle       (optional)
│   └── Action         (optional — overflow menu, button)
├── Card.Content       (required — the body)
└── Card.Footer        (optional — actions row, meta info)
```

Compound component. Each slot is independently optional except `Card.Content` when slots are used.

---

## Variants × Sizes × States

### Variants
- `default` — neutral surface, hairline border
- `elevated` — no border, drop shadow `--atlas-shadow-md`
- `outlined` — no shadow, stronger border (`--atlas-border-strong`)
- `filled` — `--atlas-background-muted` fill, no border, no shadow

### Sizes
Sizes drive padding, not dimensions (cards size to content / parent).

| Size | Padding | Header → Content gap | Content → Footer gap |
|---|---|---|---|
| `sm` | `spacing.3` | `spacing.2` | `spacing.2` |
| `md` | `spacing.4` | `spacing.3` | `spacing.3` |
| `lg` | `spacing.6` | `spacing.4` | `spacing.4` |

Mobile-app baseline: `md` minimum (`spacing.4` = 16px).

### States
- `default`
- `hover` (when `interactive=true`)
- `focus-visible` (when `interactive=true`)
- `pressed` (when `interactive=true`)
- `selected` (optional — for selectable card lists)
- `disabled`

Non-interactive cards have only `default` and `disabled`.

---

## Token mappings

### Background

| Variant | default | hover (interactive) | selected |
|---|---|---|---|
| default | `--atlas-background` | `--atlas-background-subtle` | `--atlas-background-subtle` |
| elevated | `--atlas-background` | `--atlas-background` | `--atlas-background-subtle` |
| outlined | `--atlas-background` | `--atlas-background-subtle` | `--atlas-background-subtle` |
| filled | `--atlas-background-muted` | `--atlas-background-subtle` | `--atlas-background-subtle` |

### Border

| Variant | default | selected |
|---|---|---|
| default | `--atlas-border-width-1` solid `--atlas-border` | `--atlas-border-width-1` solid `--atlas-primary` |
| elevated | none | `--atlas-border-width-1` solid `--atlas-primary` |
| outlined | `--atlas-border-width-1` solid `--atlas-border-strong` | `--atlas-border-width-1` solid `--atlas-primary` |
| filled | none | `--atlas-border-width-1` solid `--atlas-primary` |

### Shadow

`elevated`: `--atlas-shadow-md`. All others: none.

### Radius

`--atlas-radius-lg` (12px) for all variants.

### Foreground

Title: `--atlas-foreground`, `text-h4` (responsive).
Subtitle: `--atlas-foreground-muted`, `text-body-sm`.
Content: `--atlas-foreground`, `text-body`.

### Focus ring (interactive only)

`2px` `--atlas-focus-ring`, `2px` offset on the card outer edge.

### Motion

When `interactive=true`: `background-color`, `box-shadow`, `border-color` over `--atlas-duration-fast` `--atlas-easing-standard`. Reduced motion → 0ms.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | All variants and sizes; `md` default. |
| Tablet Web | Same. |
| Mobile Web | `md` minimum. Padding stays at `spacing.4`. |
| Mobile App (RN) | `md` minimum. `interactive` cards use `Pressable` with native press feedback. Hit area = full card. |

Cards inside list flows on mobile may use `default` variant with no inter-card spacing for an iOS grouped-list look; this is a composition pattern, not a separate variant.

---

## Accessibility

- **Role** — `<article>` or `<section>` (web) / `View` with `accessibilityRole="summary"` or none (RN). Interactive cards become `<button>` (web) or `Pressable` (RN) with `accessibilityRole="button"`.
- **Keyboard** — when interactive, `Tab` enters focus; `Enter`/`Space` activates
- **Focus** — visible ring on `focus-visible` for interactive cards
- **Labelling** — interactive cards use `aria-labelledby` pointing to the title
- **Selected** — `aria-pressed="true"` for toggle-selected cards, or `aria-selected="true"` inside a `listbox`/`grid`
- **Reduced motion** — transitions reduced

---

## Code API

```ts
type CardProps = {
  variant?: "default" | "elevated" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  asChild?: boolean;            // Web Radix Slot
  onPress?: () => void;         // RN
  onClick?: () => void;         // Web
  className?: string;
  children?: React.ReactNode;
};

// Sub-components:
// Card.Header  — { leading?, title, subtitle?, action? }
// Card.Content — { children }
// Card.Footer  — { children, justify?: "start" | "between" | "end" }
```

### Defaults

`variant = "default"` · `size = "md"` · `interactive = false`

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Size` | `size` |
| `Interactive` | `interactive` |
| `Selected` | `selected` |
| `Has header` | render `Card.Header` |
| `Has footer` | render `Card.Footer` |
| `Has leading` | `Card.Header` `leading` slot |
| `Has action` | `Card.Header` `action` slot |

In Figma, `Card` is a single component set; header/content/footer are boolean variant properties that toggle nested instances.

---

## Test checklist

- [ ] All variants × sizes render in Light + Dark
- [ ] Compound API: `Card.Header`, `Card.Content`, `Card.Footer` each render correctly
- [ ] Interactive mode applies hover/press/focus correctly
- [ ] Selected state shows primary border on all variants
- [ ] Mobile hit area (interactive) covers full card
- [ ] RTL: leading/action slots in Header swap inline positions
- [ ] No primitive tokens
- [ ] Figma `Card` = code `Card`
- [ ] Code Connect verified
