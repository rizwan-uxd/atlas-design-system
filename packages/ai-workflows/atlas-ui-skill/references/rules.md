# Atlas Rules — Six Guards (read on every activation)

## 1. token-enforcer

- No hex literals anywhere downstream.
- No primitive token references in components. Components compose semantic tokens only.
  - WRONG: `--atlas-blue-500`, `--atlas-color-brand-600`
  - RIGHT: `--atlas-primary`, `--atlas-primary-hover`
- No magic numbers for spacing / radius / motion / opacity / typography.
  - WRONG: `padding: 16px`, `border-radius: 8px`, `transition: 120ms ease-out`, `opacity: 0.5`
  - RIGHT: `padding: var(--atlas-spacing-4)`, `border-radius: var(--atlas-radius-md)`, `transition: ... var(--atlas-duration-fast) var(--atlas-easing-standard)`, `opacity: var(--atlas-opacity-disabled)`
- Tailwind utilities resolve via `@theme inline` in `atlas.tokens.css` — prefer `bg-primary`, `text-foreground`, `rounded-md`, `text-body` over arbitrary values.
- For tokens not yet exposed to Tailwind (motion, opacity), use bracket notation: `duration-[var(--atlas-duration-fast)]`, `disabled:opacity-[var(--atlas-opacity-disabled)]`.

## 2. component-scope-guard

- v1 surface is exactly 12 components: Button · Input · Label · Textarea · Checkbox · Switch · Card · Badge · Alert · Dialog · Tabs · NavBar.
- Do not invent new components. If a UI need can't be expressed via the 12, flag it — don't auto-create.
- Deferred list (do not invent these in v1): IconButton · Radio · Select · Avatar · Tag · Divider · Toast · Tooltip · Skeleton · Progress · Spinner · Breadcrumb · Pagination · Sidebar · Drawer/Sheet · BottomNav · Popover · DropdownMenu · CommandPalette · Container · Stack · Grid · Section · Spacer.
- Sub-components are dot-namespaced inside an existing component (`Card.Header`), not new components. In Figma, they are boolean variant properties on the same component set.

## 3. consistency-guard

- PascalCase names match between Figma and code. No spaces, no slashes inside component names.
- `/` in Figma is reserved for variant grouping inside component sets only.
- Identical enum strings between Figma `Variant`/`Size` and React `variant`/`size` props. No remapping.
- `State` in Figma is design-only; Code Connect ignores it. States in code are CSS pseudo-classes (`hover:`, `focus-visible:`, `active:`, `disabled:`) or runtime props (`disabled`, `loading`).
- Reuse the Button playbook for new components: CVA + Radix on web · trim `sizes`/`states` arrays for mobile · `combineAsVariants` for the matrix · `setExplicitVariableModeForCollection` for Light/Dark demo frames · hardcoded `VariableID:*` strings in build scripts (never `getLocalVariablesAsync` after page switch).

## 4. state-helper

Every interactive component must declare these states where the spec applies:

| State | Web | Mobile | Notes |
|---|---|---|---|
| `default` | ✓ | ✓ | At rest. |
| `hover` | ✓ | — | Pointer over. Mobile drops it. |
| `focus-visible` | ✓ | ✓ | Keyboard / external-keyboard focus. Always uses `--atlas-focus-ring`. |
| `active` / `pressed` | ✓ | ✓ | Pointer/touch down. |
| `disabled` | ✓ | ✓ | Reduced opacity via `--atlas-opacity-disabled`; sets `aria-disabled`. |
| `loading` | ✓ | ✓ | Spinner replaces leading icon; label remains; width does not collapse; sets `aria-busy="true"`. |

- `loading = true` forces `disabled = true` from a UX perspective.
- `disabled = true` prevents `onClick`/`onPress`. Sets `aria-disabled` and disabled token mappings.

## 5. structure-enforcer

- Logical properties only: `inline-start`, `inline-end`, `margin-inline-*`, `padding-inline-*`. Never `left` / `right`.
- Mobile-native interactive surfaces ≥ `--atlas-touch-min` (44px). Promote `sm` → `md` on mobile.
- Motion via `--atlas-duration-*` and `--atlas-easing-*` only. Default: `var(--atlas-duration-fast) var(--atlas-easing-standard)`.
- Respect `prefers-reduced-motion: reduce` — transitions reduce to `0ms`.
- Variant matrix lives in CVA, never in a per-state component branch.
- Layout uses `Atlas/Layout` modes (Mobile/Tablet/Desktop) and `Atlas/Responsive Type` modes for the same instances — switch modes per frame, do not duplicate components.
- All deliverables go into the workspace folder. No scattered files.

## 6. accessibility-lite

- Correct `role` (HTML `<button>` on web; Pressable on RN).
- Keyboard equivalents for every pointer interaction (`Enter` / `Space` on buttons, `Tab` for focus traversal).
- Visible focus ring via `--atlas-focus-ring`; never suppressed.
- Contrast ≥ 4.5:1 for text on background in **both** Light and Dark modes.
- `aria-busy="true"` while `loading`; `aria-disabled` mirrors `disabled`.
- `aria-label` required when `size === "icon"` (icon-only buttons) or any non-text-bearing interactive element.
- Reduced motion respected.
