# Button

> Triggers an action. The most common interactive element. Variants signal hierarchy and intent.

---

## Anatomy

```
Button
├── Leading icon       (optional)
├── Label              (required, unless icon-only)
├── Trailing icon      (optional)
└── Loading spinner    (replaces leading icon when state=loading)
```

When `size = "icon"`, the label is replaced by a single icon and the button is square.

---

## Variants × Sizes × States

### Variants
- `primary` — brand-coloured fill; the single most prominent action on a screen
- `secondary` — neutral fill; a confirming action that isn't the primary
- `outline` — transparent fill with border; equal-weight alternatives
- `ghost` — transparent, no border; tertiary actions, toolbar items
- `destructive` — danger-coloured fill; irreversible actions
- `link` — looks like a hyperlink; inline or text-block contexts

### Sizes
| Size | Height | Padding-x | Type role | Use |
|---|---|---|---|---|
| `sm` | 32px | `spacing.3` | `text-sm` | Dense UIs, table rows |
| `md` | 40px | `spacing.4` | `text-body` | Default |
| `lg` | 48px | `spacing.6` | `text-body` | Hero CTAs, mobile primary |
| `icon` | matches size | square | — | Icon-only |

Mobile-native baseline: `md` and `lg` already meet `touch.min` (44px). `sm` is web-only — promote to `md` on mobile-app surfaces.

### States
- `default` — at rest
- `hover` — pointer over (web only)
- `focus-visible` — keyboard focus
- `active` / `pressed` — pointer/touch down
- `disabled` — non-interactive, reduced opacity
- `loading` — async in progress; spinner replaces leading icon, label remains, button stays the same width

---

## Token mappings

### Background

| Variant | default | hover | active | disabled |
|---|---|---|---|---|
| primary | `--atlas-primary` | `--atlas-primary-hover` | `--atlas-primary-active` | `--atlas-primary` + `opacity-disabled` |
| secondary | `--atlas-background-muted` | `--atlas-background-subtle` | `--atlas-background-subtle` | same + `opacity-disabled` |
| outline | `transparent` | `--atlas-background-subtle` | `--atlas-background-muted` | `transparent` |
| ghost | `transparent` | `--atlas-background-subtle` | `--atlas-background-muted` | `transparent` |
| destructive | `--atlas-danger` | `--atlas-danger-hover` | `--atlas-danger-hover` | `--atlas-danger` + `opacity-disabled` |
| link | `transparent` | `transparent` | `transparent` | `transparent` |

### Foreground (text + icon)

| Variant | default | disabled |
|---|---|---|
| primary | `--atlas-primary-foreground` | `--atlas-foreground-disabled` |
| secondary | `--atlas-foreground` | `--atlas-foreground-disabled` |
| outline | `--atlas-foreground` | `--atlas-foreground-disabled` |
| ghost | `--atlas-foreground` | `--atlas-foreground-disabled` |
| destructive | `--atlas-danger-foreground` | `--atlas-foreground-disabled` |
| link | `--atlas-primary` | `--atlas-foreground-disabled` |

### Border

| Variant | default |
|---|---|
| outline | `--atlas-border-width-1` solid `--atlas-border-strong` |
| all others | none |

### Radius

All variants except `link`: `--atlas-radius-md`. Link: 0.

### Focus ring

All variants when `focus-visible`: `2px` outline, `--atlas-focus-ring`, `2px` offset.

### Motion

`background-color`, `color`, `border-color` transition over `--atlas-duration-fast` `--atlas-easing-standard`. Respect `prefers-reduced-motion: reduce`.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | All sizes available; `md` is default. Hover states active. |
| Tablet Web | Same. Hover shows briefly on tap-and-hold; not a problem. |
| Mobile Web | Use `md` or `lg`. Hover state never persists. Hit area ≥ `--atlas-touch-min`. |
| Mobile App (RN) | `md` minimum. Long-press and pressed states use the active token mapping. NavBar buttons may use `ghost` variant at `md` size. |

Heading-level CTAs (e.g., "Sign up" on a landing hero) use `lg` and may set `text-h4` instead of `text-body` for typographic emphasis. Optional, not required.

---

## Accessibility

- **Role** — `button` (HTML `<button>` on web; Pressable on RN)
- **Keyboard** — `Enter` and `Space` trigger; `Tab` enters focus
- **Focus** — `--atlas-focus-ring` visible on `focus-visible`; never suppressed
- **Contrast** — text on background ≥ 4.5:1 in all variants × modes (verify in spec build)
- **Screen reader** — `aria-label` required when `size = "icon"`; otherwise label text suffices. `aria-busy="true"` while `loading`. `aria-disabled` mirrors `disabled`.
- **Reduced motion** — transitions reduced to `0ms` when `prefers-reduced-motion: reduce`

Web implementation delegates focus management to the browser default + Radix's `Slot` when used inside compound components.

---

## Code API

### Props

```ts
type ButtonProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  asChild?: boolean;          // Web only — Radix Slot pattern
  type?: "button" | "submit" | "reset";  // Web only
  className?: string;
  children?: React.ReactNode;
  onPress?: () => void;       // Mobile naming
  onClick?: () => void;       // Web naming
};
```

### Defaults

- `variant = "primary"`
- `size = "md"`
- `loading = false`
- `disabled = false`
- `type = "button"` (web)

### Behavior

- `loading = true` forces `disabled = true` from a UX perspective and shows a spinner in the leading-icon slot. Width does not collapse.
- `disabled = true` prevents `onClick`/`onPress`. Sets `aria-disabled` and visual disabled token mappings.
- `asChild` (web) renders the styles onto the child element instead of a `<button>` — useful for wrapping `<a>` tags.

### Code Connect mapping (Figma → React)

| Figma property | React prop | Enum strings |
|---|---|---|
| `Variant` | `variant` | primary · secondary · outline · ghost · destructive · link |
| `Size` | `size` | sm · md · lg · icon |
| `State` | (computed) | default → none; hover → CSS pseudo; focus → CSS pseudo; active → CSS pseudo; disabled → `disabled` prop; loading → `loading` prop |
| `Has leading icon` | `leadingIcon` boolean | true → render slot |
| `Has trailing icon` | `trailingIcon` boolean | true → render slot |

Figma's `State` variants exist for design exploration / hover docs, not for prop mapping. Code Connect ignores them.

---

## Test checklist

- [ ] All 6 variants × 4 sizes × 6 states render correctly in Light + Dark
- [ ] RTL: leading icon flips to inline-end; trailing icon flips to inline-start
- [ ] Mobile hit area ≥ 44px for `md`+
- [ ] `Tab` enters focus; `Enter`/`Space` activate
- [ ] Screen reader announces label + state (loading, disabled)
- [ ] `prefers-reduced-motion` removes transitions
- [ ] No primitive-token references; no hex
- [ ] Figma `Button` component name = code `Button` component name
- [ ] Code Connect round-trip verified on a sample frame
