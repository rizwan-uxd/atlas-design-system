# NavBar

> Application shell navigation. Web = top app bar with nav links. Mobile App = top header + bottom tab bar (the single largest platform divergence in v1).

---

## Anatomy

### Web (top app bar)

```
NavBar
├── NavBar.Brand           (required — logo / wordmark + optional product name)
├── NavBar.Links           (optional — primary nav links, horizontal)
│   └── NavBar.Link        (one per destination)
├── NavBar.Actions         (optional — search, notifications, user menu, CTA Button)
└── NavBar.MobileMenu      (auto — hamburger trigger that opens a Drawer with the same Links)
```

### Mobile App (top header + bottom tabs)

```
NavBar
├── NavBar.Header                (required — top header bar)
│   ├── NavBar.Header.Leading    (optional — back button, hamburger, logo)
│   ├── NavBar.Header.Title      (required — current screen title)
│   └── NavBar.Header.Actions    (optional — icon buttons, max ~3)
└── NavBar.TabBar                (optional — bottom tab navigation)
    └── NavBar.Tab               (one per destination — icon + label)
```

The same `NavBar` component is used; consumers pick which slots to render. Atlas/Mobile-Native renders both `NavBar.Header` and `NavBar.TabBar` as the default navigation shell.

---

## Variants × Sizes × States

### Variants
- `default` — opaque surface
- `transparent` — for hero/landing pages; becomes `default` when scrolled
- `elevated` — adds shadow (used over content that scrolls under)

### Sizes
| Size | Web height | Mobile header height | Mobile tab bar height |
|---|---|---|---|
| `sm` | 48px | 44px | 56px |
| `md` | 64px | 56px | 64px |
| `lg` | 80px | 64px | 72px |

Mobile-app baseline: `md` minimum for both header and tab bar.

### States
- `default`
- `scrolled` (transparent → opaque, or shadow appears)
- `hidden` (mobile auto-hide on scroll, optional)

Per `NavBar.Link` / `NavBar.Tab`:
- `default` · `hover` (web) · `focus-visible` · `active` (current route) · `pressed` · `disabled`

---

## Token mappings

### NavBar surface

| Variant | background | border-block-end | shadow |
|---|---|---|---|
| default | `--atlas-background` | `--atlas-border-width-1` solid `--atlas-border` | none |
| transparent | `transparent` | none | none |
| transparent (scrolled) | `--atlas-background` | `--atlas-border-width-1` solid `--atlas-border` | `--atlas-shadow-sm` |
| elevated | `--atlas-background` | none | `--atlas-shadow-md` |

Z-index: `--atlas-z-sticky` (1100).

### NavBar.Link (web) / NavBar.Tab (mobile)

| State | color (link) | tab background | tab color |
|---|---|---|---|
| default | `--atlas-foreground-muted` | `transparent` | `--atlas-foreground-muted` |
| hover | `--atlas-foreground` | `--atlas-background-subtle` | n/a |
| active | `--atlas-foreground` | `transparent` | `--atlas-primary` |
| disabled | `--atlas-foreground-disabled` | `transparent` | `--atlas-foreground-disabled` |

Active link decoration: 2px underline `--atlas-primary` (web). Active tab indicator: icon + label color `--atlas-primary`; optional 2px top border or pill behind icon.

### NavBar.Brand

Logo color: `--atlas-foreground`. Wordmark next to logo: `text-h4`, `--atlas-foreground`.

### NavBar.Header.Title

Color: `--atlas-foreground`. Type: `text-body` (md) or `text-h4` (lg). Truncates with ellipsis when too long.

### Tab bar safe area

Padding-block-end: `--atlas-safe-bottom` so the tab bar respects iOS home indicator.

### Header safe area

Padding-block-start: `--atlas-safe-top`.

### Focus ring

`2px` `--atlas-focus-ring`, `2px` offset on focusable elements.

### Motion

Auto-hide (mobile): translate-y over `--atlas-duration-base` `--atlas-easing-emphasized`.
Scrolled state on transparent: background fade over `--atlas-duration-fast` `--atlas-easing-standard`.
Reduced motion: instant.

---

## Responsive behavior

| Platform | Notes |
|---|---|
| Responsive Desktop Web | Full top bar with brand + links + actions horizontally laid out. |
| Tablet Web | Same as desktop until `< md` (768px). |
| Mobile Web | Below `md`: links collapse into a hamburger that opens a `Drawer` (Dialog variant=`drawer`, side=`start`). Brand + actions remain. |
| Mobile App (RN) | Header at top (with safe-area-top inset) + bottom tab bar (with safe-area-bottom inset). No hamburger; primary navigation is the bottom tab bar. Header carries page-specific actions (back, share, more). |

Auto-hide on scroll is opt-in via `hideOnScroll` (mobile/tablet only).

---

## Accessibility

- **Role** — `<header>` and `<nav>` (web); `View` with `accessibilityRole="header"` (RN). Tab bar uses `accessibilityRole="tablist"` with each tab `accessibilityRole="tab"`.
- **Labelling** — `<nav aria-label="Primary">`; multiple navs (e.g., breadcrumbs) get distinct `aria-label`s
- **Active state** — `aria-current="page"` on the active link; `aria-selected="true"` on active tab
- **Keyboard** — Tab navigates between links; arrow keys cycle within tab bar (mobile equivalent uses native focus); `Enter`/`Space` activates
- **Skip link** — web NavBar should be preceded by a "Skip to main content" link (consumer-provided, but documented)
- **Screen reader** — announces brand, current page, and link count in nav
- **Mobile** — tab bar items announce label even when display shows icon only
- **Reduced motion** — instant scroll / auto-hide transitions

---

## Code API

```ts
type NavBarProps = {
  variant?: "default" | "transparent" | "elevated";
  size?: "sm" | "md" | "lg";
  hideOnScroll?: boolean;        // Mobile/tablet
  className?: string;
  children?: React.ReactNode;
};

// Web compound:
// NavBar.Brand        — { logo?, name?, href? }
// NavBar.Links        — { children }
// NavBar.Link         — { href, active?, leadingIcon?, badge? }
// NavBar.Actions      — { children }
// NavBar.MobileMenu   — auto-rendered when Links overflow on mobile

// Mobile-Native compound:
// NavBar.Header              — { children }
// NavBar.Header.Leading      — { children }       // Back button, hamburger, logo
// NavBar.Header.Title        — { children }
// NavBar.Header.Actions      — { children }       // Icon buttons; max ~3
// NavBar.TabBar              — { children }
// NavBar.Tab                 — { value, label, icon, badge?, active? }
```

### Defaults

`variant = "default"` · `size = "md"` · `hideOnScroll = false`.

Active link/tab is determined by consumer (passing `active=true` or matching route via a router integration).

### Code Connect mapping

| Figma property | React prop |
|---|---|
| `Variant` | `variant` |
| `Size` | `size` |
| `Has links` | render `NavBar.Links` |
| `Has actions` | render `NavBar.Actions` |
| `Has tab bar` | render `NavBar.TabBar` (mobile) |
| `Active link` | per-Link `active` |
| `Active tab` | per-Tab `active` |

In Figma, `NavBar` is a single component set with two top-level layout variants — `web` and `mobile-native` — that toggle which sub-slots are visible. The same code-side component renders the correct shell based on which sub-components are passed in.

---

## Test checklist

- [ ] All variants × sizes render in Light + Dark on both web and RN
- [ ] Below `md` breakpoint on web, links collapse into Drawer
- [ ] Active link has `aria-current="page"`
- [ ] Mobile tab bar announces labels via screen reader
- [ ] Header/tab bar respect safe-area insets on iOS
- [ ] Auto-hide on scroll works on mobile/tablet
- [ ] Transparent variant transitions to opaque on scroll
- [ ] RTL: links and actions flip inline order
- [ ] Mobile tap targets ≥ 44px
- [ ] No primitive tokens
- [ ] Figma `NavBar` = code `NavBar`
- [ ] Code Connect verified for both web and mobile-native shapes
