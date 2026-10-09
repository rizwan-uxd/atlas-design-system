---
summary: A screen of preferences and account actions: instant toggles, a few saved fields, appearance choice, and a destructive action.
---
# Settings

## Use when
- The user manages preferences or account options, grouped by topic (notifications, appearance, account).

## Don't use when
- A one-time data entry task. Use the Form pattern.
- A wizard. Use a flow with steps.

## Decision rules
- Instant on/off preference → `Switch` with `label` and `description`, applies immediately, no Save. Never put a Switch in a block that has a Submit for the same value.
- Choice between 2–4 short named options (theme: Light / Dark / System) → `Tabs variant="segmented"` (`TabsRoot` + `TabsList` + `TabsTrigger`), with `aria-label` on the list. Options that need descriptions → `RadioGroup variant="card"`.
- Choice from a long list (language, time zone) → `Select`.
- Free-text values that need explicit saving (display name) → the Form pattern inside the group with its own Save `Button`.
- Group by topic. Each group is a `Card variant="outlined"` with a `CardHeader`/`CardTitle` naming the group. One level of Card only.
- Destructive or irreversible account actions (Sign out, Delete account) sit last, apart from the groups, and open an `AlertDialog variant="destructive"` that names what will happen.
- Never use a `Switch` for a destructive action.
- Confirm that an instant change took effect without a dialog: the control itself changes state. Use a `Toast` only when a change needs undo or fails (then revert the control and show danger).

## Components and variants
- `Card` variant: `outlined` · size: `md`
- `Switch` size: `md`
- `Tabs` variant: `segmented` · size: `md`
- `Select` size: `md`
- `Button` variant: `ghost`, `destructive` · size: `md`
- `AlertDialog` variant: `destructive` · size: `md`
- `Avatar` size: `lg`

## Layout and density
- Single column. Groups separated by `--atlas-spacing-6`; rows inside a group by `--atlas-spacing-4`.
- Profile summary (Avatar, name, email) at the top, outside the groups.
- Keep each row to a label, one line of description and one control.

## Hierarchy and composition
- Order by frequency of use: profile → notifications → appearance → account actions last.
- The destructive trigger is a `Button variant="destructive"`, full width, last on the page.

## Responsive behavior
- Phone: one column, full-width rows. Wider screens keep one column at the content width; do not spread rows into a grid.

## States
- default · changed (control shows new value immediately) · disabled (a setting unavailable, with the reason in the description) · saving (only for explicit-Save fields) · error (revert the control and show a `Toast variant="danger"`).
- loading: `Skeleton` rows until values arrive.

## Accessibility
- Each Switch has a visible label; Tabs list has an `aria-label`; the dialog names the action in its title and moves focus into the dialog.
- Do not rely on colour to show on/off; the Switch state is conveyed by the control.

## Anti-patterns
- Save button for a block of Switches.
- Switch used to trigger a destructive action.
- Cards nested inside Cards to group rows.
- Raw buttons forming a segmented control.
- Sign out or Delete with no confirmation naming the consequence.

## Example
{{example}}
