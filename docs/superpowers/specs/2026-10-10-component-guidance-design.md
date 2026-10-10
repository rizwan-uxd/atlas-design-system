# Component usage guidance for agents (gate 1: drafts for approval)

Date: 2026-10-10 · Status: draft, awaiting owner approval · Scope: all 38 web components, guidance text only (no tokens, no components, no code)

## Goal
Agents pick a component from a table and then read its doc. Give every component the same decisive guidance so they (1) choose the right component and (2) use it correctly without opening source.

## Template (every component)
| Section | Content |
|---|---|
| USE WHEN | 2-4 situational triggers |
| DON'T USE WHEN | 2-4 items, each ending `→ <alternative>` that exists in the library |
| HOW TO USE | 3-5 imperative lines: required parts, default variant and size, props that must be set, accessibility, content rules. Facts only from metadata and source |
| DO / DON'T | 2-3 short rules each |
| RELATED | one line per confusable neighbour: what differs |

Written to the pattern used by mature systems: situational triggers, a named alternative on every "don't", one place per fact, and the decision rule first so it survives skim-reading.

## Drafts (review these)
- `component-guidance/group-a.md`: Avatar, Badge, Bubble, Button, Checkbox, Divider, Image, Input, Label, Progress, RadioGroup (11)
- `component-guidance/group-b.md`: Breadcrumb, DropdownMenu, NavBar, ScrollProgress, Select, Sidebar, SidebarMenuRow, Skeleton, Slider, Spinner, Switch, Table, Tabs, Textarea, Tooltip (15)
- `component-guidance/group-c.md`: Alert, AlertDialog, ButtonGroup, Card, Chart, CodeBlock, DatePicker, Dialog, Drawer, ListItem, Sheet, Toast (12)

38 of 38 present. Every DON'T alternative is an existing component or a plain fallback (a field-level message, a native element).

## Decisions needed (drafts follow the recommendation)
1. **Dialog vs AlertDialog.** `atlas/Dialog.md` says Dialog confirms destructive or irreversible actions; AlertDialog's metadata and source assign that case to AlertDialog. Drafts follow the source: Dialog is the general modal, AlertDialog is the must-decide destructive case (no outside-click dismissal). Changes the existing Dialog text. Recommend: accept.
2. **Prop names.** Existing docs use Figma property names (`State=error`, `Icon only`, `State=loading`); the code props are `invalid`, `iconOnly`, `loading`. HOW TO USE uses the code names, because agents write code. Recommend: accept; the generated Variants block already shows the Figma-side names.
3. **Stale statements fixed.** DropdownMenu said a select is not in v1.1 (Select exists); Tooltip pointed to a Popover (not in the library; now DropdownMenu or Dialog); NavBar described the bottom tab bar as native-only (NavBarTabBar exists on web); Select's size thresholds were inconsistent (draft: five or fewer options vs more than five); Table's doc covered only the head part. Recommend: accept.
4. **Sidebar has no `atlas/Sidebar.md`**, so no Figma description exists to carry it. The draft is written; writing it to Figma depends on a Sidebar component set existing there (checked at gate 2). If none exists it is logged as a discrepancy and left in the snapshot only after the set exists.
5. **Unverified advice** (flagged by the drafters, to be checked or cut at review): Drawer `start` for navigation and `end` for details; sm/md/lg size suggestions; the 15-line and 2-to-5-item limits in group C; Avatar default shape and size; RadioGroup "2-6 options" (from existing doc comments, not metadata); Slider and Skeleton lean on the existing docs with no source check beyond defaults.
6. **Behavioural bug found, out of scope:** Sidebar accepts `onCollapsedChange` but the source never calls it, so callers must wire the toggle's `onClick`. Recommend filing it separately rather than documenting around it forever.

## Delivery: four gates
1. Plan: this spec and the three drafts. Stops here for approval.
2. Figma built: set the component-set descriptions for all 38 in one `use_figma` pass (load `figma-use` first), then read back and diff against the drafts. Figma wins, so descriptions must be right before any sync.
3. Code and verify: `node scripts/atlas-sync.mjs --pull` (skill `atlas-figma-sync`), record the decision in `atlas/state/decisions.json`, run `atlas:verify`. Optional follow-ups, only if approved: a generated "Use for / Not for" column in `atlas/index.md`, and an `atlas-sync --check` guard requiring USE WHEN and DON'T USE WHEN in every doc.
4. Final approval: owner. No new tokens or components, so no `atlas-approved-new` label.

## Out of scope
Benchmarks and scoring, tokens, new components, Sidebar behaviour fix, native.
