# Atlas v1 — Component Scope & Packaging

> Locks the v1 boundary. Step 3 (per-component specs) builds against this doc.

---

## Locked decisions

| Topic | Decision |
|---|---|
| **Packaging** | Two libraries sharing tokens — **Atlas/Web** + **Atlas/Mobile-Native** |
| **v1 scope** | **Lean — 12 components** |
| **Mobile-app tech** | **React Native** (Expo recommended for prototyping) |
| **Web code stack** | **React + Tailwind v4 + Radix UI + class-variance-authority (CVA)** |
| **Mobile code stack** | **React Native + NativeWind v4 + React Native Reusables (RN Primitives) + CVA** |
| **Naming** | **PascalCase**, identical between Figma component name and code component name |

Tokens (`atlas.tokens.json`) are the single source of truth for both libraries. Web consumes via `atlas.tokens.css`; mobile consumes via a generated RN theme object derived from the same DTCG file.

---

## v1 component list (12)

| # | Component | Atlas/Web | Atlas/Mobile-Native | Notes |
|---|---|---|---|---|
| 1 | **Button** | ✓ | ✓ | Identical API and variants. Mobile sizes use `touch.min` (44px). |
| 2 | **Input** | ✓ | ✓ | RN uses `TextInput` with platform keyboard hints (`keyboardType`, `autoCapitalize`). |
| 3 | **Label** | ✓ | ✓ | Form-field label with required/optional state. |
| 4 | **Textarea** | ✓ | ✓ | RN expressed as `<TextInput multiline />`. |
| 5 | **Checkbox** | ✓ | ✓ | RN uses Reusables checkbox primitive; same variants. |
| 6 | **Switch** | ✓ | ✓ | RN uses native `Switch`; web uses Radix Switch. |
| 7 | **Card** | ✓ | ✓ | Slots: Header / Content / Footer. Mobile padding starts at `spacing.4`. |
| 8 | **Badge** | ✓ | ✓ | Variants: default, secondary, success, warning, danger, info. |
| 9 | **Alert** | ✓ | ✓ | Inline (not toast). Variants: info, success, warning, danger. |
| 10 | **Dialog** | ✓ (modal centered) | ✓ (bottom sheet) | Same component name; mobile-native expression is a bottom sheet by default, full-screen on small viewports. |
| 11 | **Tabs** | ✓ (top tabs) | ✓ (top tabs) | Mobile uses `react-native-tab-view` or Reusables tabs; bottom-tab navigation is part of NavBar. |
| 12 | **NavBar** | ✓ (top app bar + nav links) | ✓ (top header + bottom tab bar) | The single largest platform divergence — mobile-native NavBar covers both surfaces. |

### Why these 12

These cover ~80% of typical product screens: forms (Input/Label/Textarea/Checkbox/Switch/Button), content surfaces (Card/Badge/Alert), modal flows (Dialog), in-page navigation (Tabs), and shell navigation (NavBar). Anything not in this list can be composed from these or deferred.

---

## Deferred to v1.1+ (post-spec, post-build)

Foundations: IconButton · Radio · Select  
Display: Avatar · Tag · Divider  
Feedback: Toast · Tooltip · Skeleton · Progress · Spinner  
Navigation: Breadcrumb · Pagination · Sidebar · Drawer/Sheet · BottomNav (extracted from NavBar)  
Overlays: Popover · DropdownMenu · CommandPalette  
Layout primitives: Container · Stack · Grid · Section · Spacer (likely shipped as utilities, not formal components)

---

## Repository / library structure

Proposed layout once we begin building:

```
atlas/
├── packages/
│   ├── tokens/                    # Source of truth — the DTCG file lives here
│   │   ├── atlas.tokens.json
│   │   ├── atlas.tokens.css       # Generated for web
│   │   ├── atlas.figma.tokens.json
│   │   └── atlas.theme.native.ts  # Generated RN theme object
│   │
│   ├── web/                       # Atlas/Web library
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── …
│   │   ├── primitives/            # Radix re-exports + a11y helpers
│   │   └── index.ts
│   │
│   └── mobile/                    # Atlas/Mobile-Native library
│       ├── components/
│       │   ├── Button/
│       │   ├── Input/
│       │   └── …
│       ├── primitives/            # RN Primitives / Reusables wrappers
│       └── index.ts
│
└── apps/
    ├── docs/                      # Storybook or equivalent
    └── playground/                # Live sandbox for development
```

Component folders within both `web/` and `mobile/` follow the same shape:

```
Button/
├── Button.tsx                     # Component
├── Button.variants.ts             # CVA variant config
├── Button.types.ts                # Props
├── Button.stories.tsx             # Storybook
└── index.ts                       # Barrel export
```

---

## Naming convention

**PascalCase, no spaces, no slashes.** The Figma component name and the code component name are identical:

- Figma: `Button` · Code: `Button`
- Figma: `Card` · Code: `Card`
- Figma: `NavBar` · Code: `NavBar`

Inside Figma, use `/` only for **variant grouping** within a component set (e.g., variant property `size = sm | md | lg`), never to split component names. This keeps Code Connect mappings 1-to-1 with no name reconciliation.

Sub-components / slots are namespaced with dot notation in code and `/` in Figma:

- Code: `Card.Header`, `Card.Content`, `Card.Footer`
- Figma: a single `Card` component set with header/content/footer as boolean variants

---

## Cross-cutting standards (every v1 component must obey)

**Tokens.** Components reference semantic tokens only, never primitives. No hex literals, no magic numbers. Spacing comes from the 14-step scale; type sizes come from either the static scale or responsive role tokens (`text-h1`–`caption`).

**Theming.** Every component must look correct in Light and Dark mode without component-level overrides. Achieved automatically when only semantic tokens are used.

**RTL.** Use logical CSS properties (`margin-inline-start`, `padding-inline-end`, etc.) on web and `start`/`end` semantics on RN. No `left`/`right` in component code.

**Touch targets.** Mobile-native components must have hit areas ≥ `touch.min` (44px). Web components on touch viewports follow the same rule.

**A11y.** WCAG 2.1 AA contrast minimum. Focus rings are visible (`--atlas-focus-ring`), tab order is logical, ARIA roles match Radix / RN Primitives recommendations. Keyboard equivalents for every pointer interaction on web.

**Motion.** Use only `motion.duration.*` and `motion.easing.*` tokens. Default transition is `var(--atlas-duration-fast) var(--atlas-easing-standard)`. Respect `prefers-reduced-motion`.

**Variants.** Defined via CVA on both platforms. Variant prop names are identical between web and mobile (`variant`, `size`, `state`, etc.).

---

## What this unlocks

With v1 scope locked, Step 3 (component specs) can begin: write `_template.md`, then `Button.md` as the reference, then batch the remaining 11. Every spec produces matched Figma + Web + Mobile-Native artifacts during the build phase, with Code Connect closing the Figma → React loop.

---

## Open follow-ups (not blocking Step 3)

These can be answered in parallel with spec writing:

1. **Repo init** — pnpm workspace? Turbo? Single repo or multi-repo? *Lean recommendation: single pnpm workspace with the layout above.*
2. **Storybook** — Storybook 8 with `@storybook/react-vite` for web; `@storybook/react-native` for mobile. *Or skip and use a simple playground app.*
3. **Versioning / release** — Changesets? Semantic-release? *Recommendation: Changesets, single version across packages.*
4. **Distribution** — npm? Private registry? Source-only (consumer copies code, ShadCN-style)? *Lean recommendation: ShadCN-style source distribution for v1; promote to npm later.*

None of these block component spec writing. Lock them when you're ready to start the build phase.
