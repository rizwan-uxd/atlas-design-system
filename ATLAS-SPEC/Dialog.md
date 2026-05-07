# Dialog

> Modal surface that interrupts flow to focus on a discrete task. Web = centered modal; Mobile App = bottom sheet (full-screen on small viewports).

---

## Anatomy

```
Dialog
├── Overlay              (required — backdrop)
├── Dialog.Content       (required — the modal surface)
│   ├── Dialog.Header
│   │   ├── Dialog.Title       (required — accessible name)
│   │   ├── Dialog.Description (optional)
│   │   └── Close button       (optional — trailing "×")
│   ├── Dialog.Body            (required — main content)
│   └── Dialog.Footer          (optional — action buttons)
└── Drag handle               (mobile bottom sheet only)
```

Compound component. Trigger is external — typically a `Button`.

---

## Variants × Sizes × States

### Variants
- `modal` — centered modal (web/tablet default)
- `sheet` — bottom sheet (mobile-app default; can also be opted into on web)
- `drawer` — slides from inline-start or inline-end (used for filters, settings)

Atlas/Mobile-Native renders `Dialog` as `sheet` regardless of the `variant` prop unless `variant="drawer"` is explicitly set.

### Sizes
| Size | Modal max-width | Sheet height |
|---|---|---|
| `sm` | 400px | content (auto) |
| `md` | 560px | content (auto) |
| `lg` | 720px | 80vh max |
| `xl` | 960px | full-screen on small viewports |
| `full` | 100% with margin `spacing.6` | 100vh |

### States
- `closed` (unmounted)
- `opening` (enter transition)
- `open`
- `closing` (exit transition)

---

## Token mappings

### Overlay

Background: `oklch(from var(--atlas-background-overlay) l c h / 0.6)` — semantic alias for a dimming layer over current bg. Practically, `--atlas-overlay` token resolves to a dark/light scrim.
Z-index: `--atlas-z-overlay` (1200).

### Content

| Property | Token |
|---|---|
| Background | `--atlas-background` |
| Border | `--atlas-border-width-1` solid `--atlas-border` (subtle on web; no border on RN sheet) |
| Radius | Modal: `--atlas-radius-lg`. Sheet: `--atlas-radius-lg` on top corners only, 0 on bottom. Drawer: 0 on the edge it slides from. |
| Shadow | `--atlas-shadow-xl` |
| Padding | `spacing.6` (md). Sizes scale: sm `spacing.4`, lg `spacing.6`, xl `spacing.8`. |
| Z-index | `--atlas-z-modal` (1300) |

### Title / Description

Title: `--atlas-foreground`, `text-h3`.
Description: `--atlas-foreground-muted`, `text-body-sm`.
Close button: `ghost` Button at `icon` size.

### Drag handle (sheet only)

Width 36px, height 4px, color `--atlas-border-strong`, radius `--atlas-radius-full`, top margin `spacing.2`.

### Motion

Modal: scale 0.96→1 + fade over `--atlas-duration-base` `--atlas-easing-emphasized`.
Sheet: translate-y 100%→0 over `--atlas-duration-base` `--atlas-easing-emphasized`.
Drawer: translate-x (inline-end %)→0 over `--atlas-duration-base` `--atlas-easing-emphasized`.
Overlay: fade over `--atlas-duration-fast` `--atlas-easing-standard`.
Reduced motion: instant enter/exit, no translate, no scale.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | Centered modal, sized via `size`. Drawer variant for slide-in. |
| Tablet Web | Same as desktop; sizes `lg`/`xl` constrained by viewport with `spacing.8` margin. |
| Mobile Web | `size = sm`/`md` becomes a bottom sheet automatically (responsive override at `< sm` breakpoint). `lg`/`xl` become full-screen. |
| Mobile App (RN) | Default = bottom sheet, draggable to dismiss. `size = full` for full-screen modals. Uses `--atlas-safe-bottom` and `--atlas-safe-top` for inset padding. Drawer slides from inline-start/inline-end with native gesture. |

---

## Accessibility

- **Role** — `dialog` (web via Radix) / RN Reusables Dialog / native modal
- **aria-modal** — `"true"` while open; focus is trapped inside content
- **Labelling** — `aria-labelledby` points to `Dialog.Title`; `aria-describedby` to `Dialog.Description` if present
- **Initial focus** — first focusable element inside content; escape returns focus to the trigger
- **Keyboard** — `Esc` closes (unless `closeOnEscape=false`); `Tab`/`Shift+Tab` cycles focus inside the dialog
- **Pointer outside** — clicking overlay closes by default; opt out with `closeOnOverlayClick=false`
- **Scroll lock** — body scroll is locked while open
- **Screen reader** — announces title on open
- **Reduced motion** — instant transitions

---

## Code API

```ts
type DialogProps = {
  variant?: "modal" | "sheet" | "drawer";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  side?: "start" | "end";          // drawer only (logical, RTL-safe)
  className?: string;
  children?: React.ReactNode;
};

// Sub-components:
// Dialog.Trigger         — wraps the opening control (asChild support)
// Dialog.Content         — the modal surface
// Dialog.Header          — { children }
// Dialog.Title           — accessible name
// Dialog.Description     — optional supporting text
// Dialog.Body            — main content
// Dialog.Footer          — { children, justify? }
// Dialog.Close           — closes on click; asChild support
```

### Defaults

`variant = "modal"` (web) / `"sheet"` (RN) · `size = "md"` · `closeOnEscape = true` · `closeOnOverlayClick = true` · `side = "end"`.

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Size` | `size` |
| `Has description` | render `Dialog.Description` |
| `Has footer` | render `Dialog.Footer` |
| `Side` | `side` |

---

## Test checklist

- [ ] All variants × sizes render in Light + Dark
- [ ] Focus trap works; `Tab` cycles within content
- [ ] `Esc` closes (when enabled); focus returns to trigger
- [ ] Body scroll locked while open
- [ ] Mobile sheet variant uses safe-area insets
- [ ] Mobile sheet supports drag-to-dismiss
- [ ] Drawer slides from logical start/end (RTL-safe)
- [ ] `aria-labelledby` and `aria-describedby` wire up
- [ ] Reduced motion removes transitions
- [ ] No primitive tokens
- [ ] Figma `Dialog` = code `Dialog`
- [ ] Code Connect verified
