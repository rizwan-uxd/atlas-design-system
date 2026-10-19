---
summary: Manage who has access to a workspace and what each person can do: a table of members with role and status, and the sensitive actions (invite, change role, remove), with protected-owner and loading states.
---
# Members and permissions

## Use when
- People share a workspace and an admin must see who has access, change roles, invite people and remove them.
- Every member has one role from a short list (for example Owner, Admin, Member).

## Don't use when
- Personal preferences. Use the Settings pattern.
- A long, filterable audit log. Use the Data table pattern.
- One person's full profile. Use the Detail view pattern.

## Decision rules
- The page header holds the title "Members" and one `Button variant="primary"` ("Invite member"). It is the only primary action on the page.
- Members are a `Table` inside one `Card variant="outlined"`: Member (`Avatar`, name and email), Role, Status and a row-actions menu. The current user's row says "(You)".
- Change a role in place with a `Select` of 2 to 4 fixed roles. It saves at once and confirms with a `Toast`; if saving fails, revert the `Select` and show a danger `Toast`. Never a free-text role.
- Status is a `Badge` with a text label: `success` Active, `warning` Pending. A pending invite shows "Invited as <role>" instead of a role `Select`, and its row menu offers Resend and Revoke.
- The row-actions menu is a `DropdownMenu` on an icon-only `Button variant="ghost"` with an `aria-label` naming the person ("Actions for Sam Ortiz"). Remove is the last item and `destructive`.
- Removing a member opens an `AlertDialog variant="destructive"` that names the person, says what they lose and what stays, and whether they can be invited again. The confirm button repeats the name ("Remove Sam").
- Invite opens a `Dialog` with an email `Field` and a role `Field` (`Select`). The description explains what each role can do, so the user does not guess. The confirm button reads "Send invite".
- The last Owner cannot be demoted or removed. Disable the role `Select` and the row menu, and say why in an `Alert variant="info"` above the table ("Dana Lee is the only Owner. Make another member an Owner before changing this role or removing Dana."). A disabled control always has its reason in text nearby.
- Do not draw a permissions matrix in each row. If roles need finer permissions, link to a role description page; the row shows the role name only.
- Never offer a destructive row action on the current user's own row other than "Leave workspace", which is a separate action.

## Components and variants
- `Card` variant: `outlined` · size: `md`
- `Table`
- `Avatar` size: `sm`
- `Select` size: `md`
- `Badge` variant: `success`, `warning` · size: `md`
- `Button` variant: `primary`, `ghost`, `destructive` · size: `md`
- `DropdownMenu`
- `Dialog` variant: `default` · size: `md`
- `AlertDialog` variant: `destructive` · size: `md`
- `Field` size: `md`
- `Alert` variant: `info` · size: `md`
- `Toast` variant: `success`, `danger`
- `Skeleton`

## Layout and density
- Single column inside the Navigation shell content column. Header row: title at the inline-start, Invite member at the inline-end. `--atlas-spacing-4` between the header, the Alert and the Card.
- Table columns: Member fills, Role a fixed width so the `Select` boxes align, Status and the actions column are as narrow as their content. Build with logical properties so the table mirrors in RTL.
- Rows have `--atlas-spacing-2` vertical padding so the `Avatar` and two text lines are not cramped.

## Hierarchy and composition
- The title is the largest text. In each row the name is primary and the email is smaller and muted.
- Typography: page title `--atlas-text-h1`; names `--atlas-text-body-sm`, emails `--atlas-text-caption` in `foreground-muted`. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.
- Put people in the Table only. Do not nest a Card per member.

## Responsive behavior
- Phone: the Table becomes one `ListItem` per member (name as the title, "Role · Status" as the description, `Avatar` as the media), and the row actions open from the same menu. Invite member stays under the title, full width.

## States
- default · role changed (the Select shows the new role and a success Toast) · role change failed (revert and a danger Toast) · pending invite · last Owner protected (disabled controls and an info Alert) · inviting (the Dialog's confirm `Button` shows `loading`) · removing (the AlertDialog's confirm shows loading) · loading (`Skeleton` rows, the header stays).

## Accessibility
- The table has an accessible name (`aria-label="Members"`; Figma draws no visible caption), column headers with `scope="col"`, and every row's controls name the person ("Role for Sam Ortiz", "Actions for Sam Ortiz").
- A disabled `Select` or menu explains itself in visible text, not only in a tooltip.
- The Dialog and AlertDialog trap focus, name the action in the title, and return focus to their trigger. After a member is removed, move focus to the table.
- Status is read as text ("Active", "Pending"), never colour alone.

## Anti-patterns
- Removing a member without naming them and the consequence.
- A disabled control with no stated reason.
- Role as free text.
- Letting the last Owner be removed or demoted.
- A matrix of permission checkboxes inside each row.
- Changing a role with no confirmation that it saved.

## Example
{{example}}
