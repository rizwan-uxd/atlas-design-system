# Figma ↔ Code parity audit — Atlas v1 (web)

_2026-09-11 · Figma file `cKYhfaHLCoyMHi9nKr63Ig` page `Atlas/Web` vs `packages/ui-web/src` exported types_

**Result: 2 of 12 components match. 10 have a mismatch.** Code Connect only works for Button today; for the other 10, an agent reading Figma gets names that don't exist in code.

| Component | Figma Variant | Code variant | Figma Size | Code size | Issue |
|---|---|---|---|---|---|
| Button | primary, secondary, outline, ghost, destructive, link | same | sm md lg icon | same | ✅ |
| Input | default, filled, unstyled | same | sm md lg | same | ✅ |
| Label | — | default, inline | sm md lg | same | Figma missing `inline` |
| Textarea | default, filled, unstyled | default, filled | sm md lg | same | Code missing `unstyled` |
| Checkbox | unchecked, checked, indeterminate | default, card | sm md lg | sm md | Figma uses Variant for **checked value**; card variant missing; lg missing in code |
| Switch | off, on | — | sm md lg | sm md | Figma uses Variant for **on/off value**; lg missing in code |
| Card | default, elevated, outlined | + filled | sm md lg | same | Figma missing `filled` |
| Badge | primary, neutral, success, warning, danger, info | default, secondary, success, warning, danger, info, outline | sm md lg | same | Different names; `outline` is a style, not a tone |
| Alert | info, success, warning, danger, neutral | info, success, warning, danger | sm md lg | sm md | Code missing neutral + lg; Figma models `dismissible` as a State |
| Dialog | default, destructive | modal, sheet, drawer | sm md lg full | + xl | **Two different axes**: Figma = intent, code = presentation |
| Tabs | line, pill, segmented | underline, pills, enclosed | sm md lg | same | Different names (segmented ≠ enclosed) |
| NavBar | default, bordered, floating | default, transparent, elevated | sm md lg | same | Different sets |

## File structure findings (corrected after Plugin API inspection)
- File has 4 original pages: Atlas/Web, Atlas/Mobile-Native, Atlas/Icons, To do components.
- No README page; demo/smoke-test frames mixed with components on Atlas/Web.
- Variables: 217 across 4 collections (Primitives 168, Semantic 39 Light/Dark, Layout 3, Responsive Type 7). **0 have WEB code syntax, 5 have descriptions.**
- No local text styles.
- Component descriptions: 8 of 12 have one (Input, Label, Switch empty); none have do/don't guidance.

### Step 1 done (2026-09-11)
- New `📖 README` page (was Atlas/Web): purpose, page map, naming rules, token rules, definition of done, parity status.
- One page per component: `Button` … `NavBar` (set at x0 y240; space above reserved for usage docs). No platform prefix: the page is the component; the native set joins it when mobile is in scope.
- Demo + smoke-test frames moved to `Sandbox (demos · smoke tests)`.
- Page dividers added. Mobile-Native, Icons, To do untouched.

## Resolution (agreed rule: Figma names win, real code-only options are added to Figma, value-type props get their own property)

| Component | Figma change | Code change |
|---|---|---|
| Button | — | — |
| Input | — | — |
| Label | add Variant `inline` | — |
| Textarea | — | add `unstyled` |
| Checkbox | Variant → `default, card`; new **Checked** = `unchecked, checked, indeterminate` | add size `lg` |
| Switch | Variant off/on → **Checked** boolean | add size `lg` |
| Card | add Variant `filled` | — |
| Badge | new **Appearance** = `default, outline` | variant `default→primary`, `secondary→neutral`, `outline` → `appearance="outline"` |
| Alert | State `dismissible` → **Dismissible** boolean; drop State | add variant `neutral`, size `lg` |
| Dialog | keep Variant `default, destructive`; new **Type** = `modal, sheet, drawer`; add size `xl` | current `variant` → `type`; new `variant` = `default, destructive` |
| Tabs | — | `underline→line`, `pills→pill`, `enclosed→segmented` (restyle to Figma) ⚠ visual check |
| NavBar | add Variant `transparent` | `elevated→floating`, add `bordered` ⚠ confirm elevated ≈ floating |

Breaking code renames (Badge, Dialog, Tabs, NavBar) → update call sites in `app/`, Code Connect files, contracts and tests in the same change.

## Web vs mobile (2026-09-11)
Same component, same variant names; mobile only trims the matrix: no `sm` size, no `hover` state (touch). **Exception: NavBar** — mobile variants are `top · bottom · floating-bottom`, a different pattern (bottom tab bar), likely a separate component when native is in scope.

## Metadata audit (2026-09-11)
| Component | Description | Do/don't | Doc link | Colors bound | Spacing/radius bound | Text tokenised |
|---|---|---|---|---|---|---|
| Button | spec pointer only | ✗ | ✗ | 274/274 | 228/372 | 108/108 |
| Input | **empty** | ✗ | ✗ | **102/117** | 75/120 | **0/45** |
| Label | **empty** | ✗ | ✗ | 18/18 | 0/9 | **0/18** |
| Textarea | tokens listed | ✗ | ✗ | 102/102 | 120/120 | **0/45** |
| Checkbox | variant count | ✗ | ✗ | 120/120 | – | – |
| Switch | **empty** | ✗ | ✗ | 78/78 | – | – |
| Card | one-liner | ✗ | ✗ | 165/165 | 180/180 | 90/90 |
| Badge | variant count | ✗ | ✗ | 72/72 | 108/108 | 36/36 |
| Alert | one-liner | ✗ | ✗ | 180/180 | 120/150 | 60/60 |
| Dialog | one-liner | ✗ | ✗ | 152/152 | 144/208 | 64/64 |
| Tabs | one-liner | ✗ | ✗ | 63/63 | 135/180 | 45/45 |
| NavBar | one-liner | ✗ | ✗ | 186/186 | 168/234 | 126/126 |

No component has when-to-use / do / don't guidance or a documentation link. Variables: 0/217 with WEB code syntax.
