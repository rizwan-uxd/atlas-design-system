---
summary: Manage a paid plan: current plan and renewal, payment method, invoice history, and the sensitive actions (change method, cancel), with past-due, failure and loading states.
---
# Payment and billing

## Use when
- The user pays for the product and needs to see what they are on, what they will be charged and when, how they pay, and what they have paid.
- The user must update a payment method, change plan or cancel.

## Don't use when
- A one-time purchase at checkout. Use the Form pattern as a flow with a review step.
- Preferences unrelated to money. Use the Settings pattern.
- A long, filterable transaction ledger. Use the Data table pattern.

## Decision rules
- The page is a stack of `Card variant="outlined"` groups in this order: Plan, Payment method, Invoices. Summary first, history last. One level of Card only.
- Plan group: the plan name, the price and interval, the next renewal date (or end date if cancelling) and a status `Badge`. State the exact amount and date ("$24.00 on 12 Nov 2026"), never "soon". Primary action is "Change plan"; it is a `Button variant="outline"`, because nothing on this page is more urgent than a failed payment.
- Payment method group: show only what the provider returns for display (brand, last four digits, expiry) in a `ListItem`. The "Update" `Button variant="outline"` opens a `Dialog`.
- **Never collect or store raw card numbers in Atlas inputs.** Card number, expiry and CVC are entered in the payment provider's hosted fields inside the Dialog body; your code receives a token. Atlas `Input` is for the name on the card, billing email and address only. Why: raw card data in your own fields puts your whole app in PCI scope.
- Invoices are a `Table` with date, description, amount and status `Badge` columns. Where the table has room, add a "Download" `Button variant="ghost"` per row as a fifth column (not drawn in Figma yet). Right-align amounts (`TableCell align="end"`) and format with the user's locale and currency. Show the 12 latest; link to the full list with the Data table pattern.
- Status mapping for `Badge`: `success` Paid, `warning` Due soon, `danger` Failed or Past due, `neutral` Refunded or Void, `info` Processing.
- A payment problem is an `Alert variant="danger"` at the top of the page (above the groups) with the reason in plain words and a single action ("Update payment method"). It stays until fixed; do not use a `Toast` for it.
- Cancelling is last and apart from the groups. It opens an `AlertDialog variant="destructive"` that states the consequence and the date access ends ("You keep access until 12 Nov 2026."), and names the data that will be lost if any. Offer pause or downgrade as a text alternative, not as a way to hide Cancel.
- A successful change shows the new state on the page at once (the Plan group updates, the Alert goes away) and a `Toast variant="success"` ("Payment method updated"). A failed one keeps the Dialog open, keeps the typed values and shows the provider's reason in an `Alert variant="danger"` inside the Dialog.
- Money formatting: one currency per page, symbol and decimals as the locale expects, never a float on screen. Taxes and totals are separate lines in an invoice view.

## Components and variants
- `Card` variant: `outlined` · size: `md`
- `Badge` variant: `success`, `warning`, `danger`, `neutral`, `info` · size: `md`
- `ListItem` variant: `default` · size: `md`
- `Table`
- `Button` variant: `outline`, `ghost`, `primary`, `destructive` · size: `md`
- `Dialog` variant: `default` · size: `md`
- `AlertDialog` variant: `destructive` · size: `md`
- `Alert` variant: `danger`, `warning` · size: `md`
- `Input` size: `md`
- `Field` size: `md`
- `Toast` variant: `success`, `danger`
- `Skeleton`
- `EmptyState` size: `md`

## Layout and density
- Single column inside the Navigation shell content column, groups separated by `--atlas-spacing-6`, rows inside a group by `--atlas-spacing-4`. Page title, then the payment Alert if any, then the groups.
- Label and value pairs are aligned in a consistent two-column grid; the action sits at the inline-end of the group header, not inside the rows.
- Build with logical properties; amounts use tabular figures so columns align, and stay right-aligned (end) in both text directions.

## Hierarchy and composition
- The amount due and the date are the most prominent text in the Plan group. Status is a Badge beside the plan name.
- Typography: page title `--atlas-text-h1`; plan name `--atlas-text-h3`; amount `--atlas-text-h2`; labels and helper text `--atlas-text-body-sm` in `foreground-muted`. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.
- Do not use a destructive or red style for anything except failure and the Cancel action.

## Responsive behavior
- Phone: groups are full width; the invoice `Table` switches to one `ListItem` per invoice (date and amount as the title, status as the description) because a table does not fit. Actions stack under the text.

## States
- default · active / trialing / cancelling (end date shown) / past due (danger Alert) · updating payment method (Dialog; its confirm `Button` shows `loading`, other controls disabled) · payment failed (error in the Dialog, values kept) · loading (`Skeleton` in each group, the title stays) · no invoices (`EmptyState`: "No invoices yet") · no payment method (the group says so with a primary "Add payment method") · error loading (`Alert variant="danger"` with Retry above the page body).

## Accessibility
- Amounts and dates are read as text, with `<time dateTime>` for dates. A status Badge has visible text, never colour alone.
- The Invoices table is named with `aria-label="Invoices"` (Figma draws no visible caption), column headers with `scope="col"`, and each Download button's `aria-label` names its invoice ("Download invoice from 12 Oct 2026").
- The Dialog and AlertDialog trap focus, name the action in the title, and return focus to their trigger. Provider hosted fields need visible labels and are reachable by Tab like any input.
- The payment Alert uses `role="alert"` only when it appears after load; the one present on first render is read in order.
- Errors are text next to the field or in the Alert, not colour alone.

## Anti-patterns
- Raw card number, expiry or CVC fields built from `Input` in the app.
- "Soon" or "next month" instead of an exact amount and date.
- A Toast as the only notice of a failed payment.
- Cancel as a primary button, near the Change plan button, or without stating the consequence and end date.
- Hiding Cancel behind support-only paths, or confusing wording for it.
- Colour-only status.
- Amounts in a left-aligned column or in mixed currencies.
- Clearing the Dialog's typed values when the update fails.

## Example
{{example}}
