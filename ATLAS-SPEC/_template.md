# <ComponentName>

> One-line purpose. What is this component for, in plain language?

---

## Anatomy

Labelled list of parts/slots and their relationships.

```
ComponentName
├── Slot A
├── Slot B
└── Slot C
```

Diagram or ASCII sketch optional but encouraged. Note which slots are required vs optional.

---

## Variants × Sizes × States

### Variants
List each visual variant the component supports, with one-line purpose.

- `variantA` — purpose
- `variantB` — purpose

### Sizes
List sizes and their numeric values (token-mapped).

- `sm` — height, padding, type role
- `md` — default
- `lg` — height, padding, type role

### States
Every component must define behavior for:

- `default`
- `hover` (web only; touch falls through to default + active)
- `focus-visible`
- `active` / `pressed`
- `disabled`
- additional states (e.g., `loading`, `error`, `checked`, `indeterminate`)

Express the matrix as a table when useful, or call out only the cells that differ from `default`.

---

## Token mappings

Per (variant × state), list the tokens used. Always reference **semantic** tokens, never primitives, never hex.

| Property | default | hover | focus-visible | active | disabled |
|---|---|---|---|---|---|
| `background` | `--atlas-…` | `--atlas-…` | `--atlas-…` | `--atlas-…` | `--atlas-…` |
| `color` | … | … | … | … | … |
| `border` | … | … | … | … | … |

If padding/radius/font tokens vary by size, include a separate sizes table.

---

## Responsive behavior

Express expectations across the four platforms. Reference responsive tokens (`text-h*`, `layout.*`, `touch.*`) rather than hard-coded breakpoints inside the component.

| Platform | Notes |
|---|---|
| Responsive Desktop Web | Default behavior |
| Tablet Web | What changes? |
| Mobile Web | Touch targets, layout shift |
| Mobile App (RN) | Native idiom expression, safe-area, keyboard interaction |

---

## Accessibility

- **Role** — ARIA role or native equivalent
- **Keyboard** — every pointer interaction has a keyboard equivalent
- **Focus** — uses `--atlas-focus-ring`, visible at all times when `focus-visible`
- **Contrast** — WCAG 2.1 AA at minimum
- **Screen reader** — labels, descriptions, state announcements
- **Reduced motion** — respect `prefers-reduced-motion`

Cite Radix / RN Primitives upstream behavior when delegated.

---

## Code API

### Props

```ts
type ComponentNameProps = {
  variant?: "variantA" | "variantB";
  size?: "sm" | "md" | "lg";
  // …state props
  // …slot props
  className?: string;
  children?: React.ReactNode;
};
```

### Defaults

- `variant = "variantA"`
- `size = "md"`

### Slots

Document any compound API (e.g., `Card.Header`, `Card.Content`).

### Code Connect mapping notes

How Figma variant properties map to React prop names. 1-to-1 where possible.

| Figma property | React prop | Notes |
|---|---|---|
| `Variant` | `variant` | Identical enum strings |
| `Size` | `size` | Identical enum strings |

---

## Test checklist

Before marking the component done, verify:

- [ ] All variants × sizes × states render correctly in Light + Dark
- [ ] RTL renders correctly (no `left`/`right` in CSS)
- [ ] Mobile hit area ≥ 44px
- [ ] Keyboard tab order and shortcuts work
- [ ] Screen reader announces correctly
- [ ] `prefers-reduced-motion` respected
- [ ] Tokens used are semantic only (no primitives, no hex)
- [ ] Figma component name matches code component name
- [ ] Code Connect mapping verified
