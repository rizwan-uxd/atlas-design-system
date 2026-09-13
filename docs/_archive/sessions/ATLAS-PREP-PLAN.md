# Atlas Design System — Prep Plan (v1)

> **Goal:** Get to a state where we can build the Atlas Figma library and matching code components for **Responsive Desktop / Tablet / Mobile Web / Mobile App**, with one-step Figma → working prototype.
>
> **Status:** Plan only. No implementation until Riz approves each step.

---

## Step 1 — Extend tokens for multi-platform

### Why
Current Atlas tokens cover color, spacing, radius, type, motion, shadow. They do **not** cover: breakpoints, grids, containers, z-index, touch targets, safe areas, or responsive type. All of these are required to build components that work across desktop / tablet / mobile-web / mobile-app.

### Decisions needed from Riz (proposed defaults — say yes/no/change)

| Token group | Proposed values |
|---|---|
| **Breakpoints** | `sm 640px · md 768px · lg 1024px · xl 1280px · 2xl 1440px` (Tailwind v4 defaults) |
| **Grid columns** | `4 cols mobile · 8 cols tablet · 12 cols desktop` |
| **Gutter / margin** | Gutter from spacing scale (4, 6, 8 per bp); page margin (4, 6, 8) |
| **Container max-width** | `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440` |
| **Touch target** | `min 44px (iOS) · comfortable 48px (Android) · spacious 56px` |
| **Z-index** | `base 0 · dropdown 100 · sticky 200 · overlay 300 · modal 400 · popover 500 · toast 600` |
| **Responsive type** | Mobile-first; h1 `28→36→48`, h2 `22→28→36`, body stays 16. Token under `typography.responsive.{role}` with bp keys |
| **Safe area** | `safe-top · safe-bottom · safe-inline-start · safe-inline-end` aliasing `env(safe-area-inset-*)` |
| **Density (optional)** | `comfortable / compact` modifier — defer to v2 unless you want it now |

### Deliverables
- Update `atlas.tokens.json` — add new groups under `atlas.layout.*`, `atlas.zIndex.*`, `atlas.touch.*`, `atlas.typography.responsive.*`
- Update `atlas.tokens.css` — add CSS vars + `@media` blocks for responsive type
- Update `atlas.figma.tokens.json` — add new primitive variables; consider a `Breakpoint` mode collection
- Update `MIGRATION.md` — note the additions

### Effort
~30 min after Riz confirms the table above.

---

## Step 2 — Lock v1 component scope and packaging

### Why
Without a locked scope and packaging decision, the Figma file structure and code library structure can't begin. This step is mostly decisions, lightly written up.

### Decisions needed

**(a) v1 component list — proposed**

```
Foundations    Button · IconButton · Input · Textarea · Label · Checkbox
               Radio · Switch · Select
Display        Card · Badge · Avatar · Tag · Divider
Feedback       Alert · Toast · Tooltip · Skeleton · Progress · Spinner
Navigation     Tabs · Breadcrumb · Pagination · NavBar · Sidebar
               BottomNav (mobile) · Drawer/Sheet
Overlays       Dialog/Modal · Popover · DropdownMenu · CommandPalette
Layout         Container · Stack · Grid · Section · Spacer
```

That's ~30 components. We can trim to a smaller v1 (e.g., 12) if you want a faster first cycle.

**(b) Platform packaging — choose one**

| Option | Pros | Cons |
|---|---|---|
| **A. Single responsive library** | One source of truth; less duplication; faster | Mobile-app idioms (bottom sheet, large title, native nav) are awkward as variants |
| **B. Two libraries: Atlas/Web + Atlas/Mobile-Native** ⭐ recommended | Clean mental model; native patterns get proper expression; tokens shared across both | More files to maintain; cross-library updates need discipline |

**(c) Code stack**

Proposed: **React + Tailwind v4 + Radix UI primitives + class-variance-authority (CVA)** — this mirrors the ShadCN approach Atlas inherits from, and gives you free a11y primitives.

**(d) Naming convention**

Proposed: PascalCase, identical between Figma component name and React component name (e.g., `Button`, `IconButton`, `BottomNav`). No spaces, no slashes (use Figma's `/` only for variant grouping inside a component set).

### Deliverables
- `ATLAS-COMPONENTS-V1.md` — locked component list, packaging decision, code stack, naming convention

### Effort
~30 min total: 15 min for decisions, 15 min to write the doc.

---

## Step 3 — Component spec doc

### Why
The spec is the contract. Both the Figma build and the code build read from it. Without it, Figma and code drift.

### Spec template (per component)

```
# <ComponentName>

## Anatomy
- Parts, slots, with a labelled diagram or list

## Variants × Sizes × States
- Variant: default | secondary | outline | ghost | destructive | link
- Size: sm | md | lg | icon
- State: default | hover | focus-visible | active | disabled | loading
- Full matrix or truth table

## Token mappings
- For each (variant × state): bg, fg, border, radius, padding tokens

## Responsive behavior
- Desktop / Tablet / Mobile-web / Mobile-app expectations
- Touch-target rule on mobile

## Accessibility
- Role, ARIA, keyboard, focus ring, contrast targets

## Code API
- Props, slots, defaults
- Code Connect mapping notes (Figma prop → React prop)
```

### Approach
1. Write `ATLAS-SPEC/_template.md` (the template above, formalised)
2. Apply to **Button** as the reference spec — review together, lock the format
3. Batch remaining specs in groups of 5–6 components per session

### Deliverables
- `ATLAS-SPEC/_template.md`
- `ATLAS-SPEC/Button.md` (reference)
- `ATLAS-SPEC/<each-component>.md` (batched in subsequent sessions)

### Effort
- Template + Button reference: ~45 min
- Remaining specs: ~15–20 min each, batched

---

## After these 3 steps — what unlocks

Once Steps 1–3 are done, the build phase becomes mechanical:

1. Create the Atlas Figma file(s) per the packaging decision
2. Import the extended Variables
3. Build each component in Figma against its spec
4. Write each React component against the same spec
5. Wire **Code Connect** so a Figma frame round-trips to React with one click

That's the path to "design tomorrow → working prototype same day."

---

## What I need from you to start Step 1

A simple `yes` / `change X to Y` pass on the Step 1 decision table above. Once locked, I'll update the three token files and `MIGRATION.md` in one go.
