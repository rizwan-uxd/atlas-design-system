## Alert

USE WHEN
· A form-level error, a warning above a step, or a notice that stays in the page flow until the condition clears.
· The user needs an explanation plus a recovery action (Button inside the Alert).
· A status must remain visible after the user navigates back or rereads the page.

DON'T USE WHEN
· A short confirmation of a completed action ("Saved") → Toast.
· The user must decide before continuing → Dialog or AlertDialog.
· One field is invalid → field-level message under that field.
· A small status label on an item → Badge.

HOW TO USE
· Set `variant` to the meaning: info (default guidance), success, warning, danger (failed or will fail), neutral. Default size is md; use sm for dense panels, lg for page-level notices.
· Pass `title`, `description`, or both; never render an empty Alert. Put recovery Buttons in `actions`.
· Set `dismissible` with `onDismiss` only for notices that stop being true once read.
· Keep the title to a few words and the description to one or two sentences; say what happened and what to do next.

DO
· Place it in flow, next to what it describes.
· Use `hideIcon` or a custom `icon` only when the default per-variant icon is wrong.

DON'T
· Make it dismissible while the condition is still true.
· Add one Alert per field error.

RELATED
· Toast — transient and out of flow; Alert persists in flow.
· Dialog — interrupts to collect a decision; Alert never blocks.

## AlertDialog

USE WHEN
· The user must explicitly confirm or cancel before anything happens: delete, discard, revoke, send to many.
· The action is irreversible or costly and an accidental click-away must not dismiss the prompt.
· The question has exactly two outcomes (cancel or proceed).

DON'T USE WHEN
· Content needs a form, rich body, or an optional close control → Dialog.
· The message needs no decision → Alert.
· The action is reversible and cheap → run it and offer Undo in a Toast.
· A secondary panel or navigation → Sheet or Drawer.

HOW TO USE
· Compose AlertDialog > AlertDialogTrigger (`asChild` on a Button) + AlertDialogContent > AlertDialogTitle, AlertDialogDescription, AlertDialogFooter > AlertDialogCancel, AlertDialogAction.
· Set `variant="destructive"` on AlertDialogContent for delete/irreversible actions; default otherwise. Default size is md; sm for a one-line confirm.
· Always render Title and Description. Cancel goes before Action; put the work in `AlertDialogAction onClick`.
· For async work set `state="loading"` on AlertDialogContent; Action shows busy and is disabled, so it cannot be dismissed mid-flight.
· Label buttons with the verb ("Delete project"), not "OK" or "Yes". State what is lost in the description.

DO
· Name the object and the consequence in the title or description.
· Control with `open` and `onOpenChange` when the action is async.

DON'T
· Add a close X or expect click-outside to dismiss; neither exists (Escape still closes it).
· Put form fields or extra links inside.

RELATED
· Dialog — general modal with optional close; AlertDialog is confirm-only with no close control.
· Alert — inline, no decision; AlertDialog blocks until the user chooses.
· Toast — after-the-fact result; AlertDialog is the before-the-fact gate.

NOTE: atlas/Dialog.md lists "confirming a destructive or irreversible action" under USE WHEN; per AlertDialog metadata/source that case belongs to AlertDialog, and Dialog is written here as the general modal.

## ButtonGroup

USE WHEN
· A few related actions on one object belong together: alignment, view mode, a split action.
· Options share one visual control and sit side by side or stacked.
· Icon-only toolbar-style actions need one connected border.

DON'T USE WHEN
· Actions are unrelated → separate Buttons with spacing.
· Switching between content panels → Tabs.
· Picking one value from a form option list → RadioGroup or Select.
· Many or overflow actions → DropdownMenu.

HOW TO USE
· Wrap ButtonGroupButton (or ButtonGroupIconButton) children in ButtonGroup; the container sets each item's position.
· Default `orientation` is horizontal; use `vertical` only in narrow side columns. Default `size` is md; set it on the group, not the items.
· Give the group an `aria-label` (or `aria-labelledby`); it is `role="group"`. Give every icon-only item an `aria-label`.
· Keep 2 to 5 items with short labels (one or two words).

DO
· Order items by frequency or logical sequence.
· Use ButtonGroup items for plain actions, one style throughout.

DON'T
· Mix sizes or put non-Button children inside.
· Use it as a tab bar.

RELATED
· Tabs — switches visible content; ButtonGroup triggers actions.
· DropdownMenu — hides actions behind one trigger; ButtonGroup shows them all.

## Card

USE WHEN
· Grouping related content on a bordered or raised surface: a settings group, summary block, or selectable option.
· A repeated tile in a grid or dashboard with a title, body, and footer actions.
· A whole surface is clickable or selectable (`interactive`, `selected`).

DON'T USE WHEN
· A container used only for spacing → a plain element.
· A row in a list with leading visual and action → ListItem.
· A persistent message → Alert.
· Tabular data → Table.

HOW TO USE
· Compose Card > CardHeader (CardTitle, CardDescription), CardContent, CardFooter; do not style your own header row.
· Default `variant` is default; `outlined` for flat pages, `elevated` for emphasis on a plain background, `filled` for quiet grouping. Default size is md; sm for dense grids, lg for hero tiles.
· For a clickable card set `interactive` with `onClick`; add `selected` for a chosen option and `disabled` to block it. Do not nest other buttons or links in an interactive Card.
· One idea per card: a short title, an optional one-line description.

DO
· Keep the same variant and size within a group of cards.
· Put actions in CardFooter.

DON'T
· Nest a Card inside a Card.
· Use `elevated` on a surface already raised, such as a Dialog.

RELATED
· ListItem — a compact row with media and action; Card is a free-form surface.
· Alert — a status message; Card holds content.

## Chart

USE WHEN
· One metric over time or across categories (visitors per day, revenue per month).
· A dashboard tile needing a title, description, and a switch between series.
· A plot that may be loading or empty.

DON'T USE WHEN
· A single number → Card.
· Exact values the user must read or compare in rows → Table.
· Several series sharing a legend; the v1 plot draws one bar series.
· Progress toward a goal → Progress.

HOW TO USE
· Compose Chart > ChartHeader (ChartTitle, ChartDescription, optional ChartStats > ChartStat), ChartContent with ChartBar items, optional ChartLegend > ChartLegendItem.
· Set `state` to `default`, `loading`, or `empty`; render loading or empty instead of an empty plot.
· Always write a title and a description that says what the chart shows, in text.
· Use ChartStats only to toggle series; the selected stat carries the muted fill.

DO
· One chart per Chart card.
· Label with text; never rely on colour alone.

DON'T
· Add gridlines or labels beyond the axis labels drawn.
· Put more than one series in a v1 chart.

RELATED
· Card — a generic surface; Chart is a card specialised for a plot.
· Table — exact tabular values; Chart shows shape and trend.
· Progress — one value toward a target.

## CodeBlock

USE WHEN
· Showing a short, readable snippet, install command, or example in docs or onboarding.
· The user should copy the code in one click.
· A terminal-style intro that writes itself out (`variant="typing"`).

DON'T USE WHEN
· The user must edit the text → Textarea.
· Long files or an editor experience → link to the file or a Table of excerpts.
· Inline code inside a sentence → plain text in a code element.
· A one-line value the user copies from a form → Input (read-only).

HOW TO USE
· `code` is required. Default `variant` is default (full code at once); `typing` only for hero or onboarding moments, with `writing`, `duration`, `delay`, and `onDone` to control it. Default size is md.
· Name the block: set `filename` or `language` with `showHeader`. This is its accessible name.
· Turn on `showLineNumbers` only when lines are referenced in surrounding text.
· Use `copyLabel` for localisation and `onCopy` for analytics; the copy confirmation announces "Copied".
· Keep snippets to about 15 lines; text is monospace with no syntax colour.

DO
· Keep one command or one concept per block.
· Show the header whenever a filename helps.

DON'T
· Use `typing` for reference docs users scan.
· Put prose or secrets in the block.

RELATED
· Textarea — editable multiline text; CodeBlock is read-only display.
· Card — general surface; CodeBlock is a code-specific panel with copy.

## DatePicker

USE WHEN
· A single date must be chosen from a calendar (due date, booking date, birthdate).
· A date range must be chosen (`mode="range"`: check-in/out, reporting window).
· Users type or phrase dates rather than click: use DatePickerInput (typed) or DatePickerNaturalInput ("next Friday").

DON'T USE WHEN
· Only a month or year is needed → Select.
· A relative offset or a number → Input or Slider.
· A time of day → Input with `type="time"` next to the DatePicker.
· Showing a date, not choosing one → plain text.

HOW TO USE
· Compose DatePicker > one of DatePickerTrigger, DatePickerInput, DatePickerNaturalInput, then DatePickerContent. Control with `value` and `onValueChange`.
· Default `mode` is single; range makes value a `[start, end]` tuple.
· Always set `placeholder` naming the expected value ("Pick a date" / "Pick a range"). Set `invalid` on the trigger for errors.
· For distant dates (birthdates) use `captionLayout="dropdown"` on DatePickerContent, single mode only; tune with `yearRange`.
· Pair with a Label; add `aria-label` if no visible label exists. Arrow keys move between cells; Escape closes and returns focus.

DO
· Show an error message under the field when `invalid`.
· Use the Trigger for picking, Input for exact entry.

DON'T
· Build a custom time picker.
· Use a DatePicker for far-past dates without the dropdown caption.

RELATED
· Select — pick from a list; DatePicker opens a calendar grid.
· Input — free text; DatePickerInput adds a calendar and date parsing.

## Dialog

USE WHEN
· A short focused form or detail view that must not lose the page behind it.
· Content that needs a title, body, and footer actions, with a close control.
· A secondary task the user can cancel at any time.

DON'T USE WHEN
· A decision that must be made, especially destructive or irreversible, with no close control → AlertDialog.
· A message needing no decision → Alert.
· A panel anchored to a screen edge → Sheet or Drawer.
· Long content that deserves its own page → a page route.

HOW TO USE
· Compose Dialog > DialogTrigger, DialogContent > DialogHeader (with DialogTitle), DialogDescription, DialogBody, DialogFooter, DialogClose.
· Default `variant` is default; `destructive` colours the confirming action only for a risky submit. Default size is md; sm for brief prompts, lg or xl for forms, `full` for immersive tasks.
· Control with `open` and `onOpenChange`. The header close control is on by default (`showClose` on DialogHeader); keep it.
· Always give DialogTitle (names it for screen readers). Put cancel before the confirming action in the footer. Focus trap and Escape are built in.

DO
· Describe what will happen and what cannot be undone.
· Use the `loading` state while submitting.

DON'T
· Stack dialogs.
· Use it for a destructive confirmation that must not be dismissed accidentally.

RELATED
· AlertDialog — confirm-only, no close X, no click-outside dismiss; Dialog allows both.
· Sheet — edge-anchored panel; Dialog is centred.
· Alert — inline and non-blocking.

NOTE: atlas/Dialog.md says Dialog confirms destructive or irreversible actions; metadata/source place that on AlertDialog, so Dialog is positioned as the general modal here.

## Drawer

USE WHEN
· A persistent side menu or secondary panel docked to the start or end edge (a mobile nav drawer).
· Navigation or filters that sit beside the main content without replacing it.
· A side panel with header, content, and footer that the user opens repeatedly.

DON'T USE WHEN
· A centred, momentary decision or form → Dialog.
· A bottom sheet on mobile, or a top panel → Sheet.
· A must-answer confirmation → AlertDialog.
· Permanent app navigation on desktop → Sidebar.

HOW TO USE
· Compose Drawer > DrawerContent; pass `side` as `start` or `end` only. Default size is md; sm for menus, lg or xl for forms, `full` for mobile nav.
· Keep the flush edge flat and the free edge rounded (handled by the component).
· `closeOnEscape` and `closeOnOverlayClick` are available on DrawerContent; keep both on unless the panel holds unsaved input.
· Include a title in the header so the panel is named for assistive tech.

DO
· Use `start` for navigation, `end` for details and settings.
· Keep one drawer open at a time.

DON'T
· Add a drag handle; Drawer has none.
· Use `top` or `bottom` sides; they do not exist here.

RELATED
· Sheet — same anatomy, 4 sides, only `bottom` has a drag handle; use for bottom sheets and top panels.
· Dialog — centred modal; Drawer is edge-docked.
· Sidebar — always-visible layout navigation.

## ListItem

USE WHEN
· A list row with a leading visual, title, description, and an optional action (people, files, links, settings).
· A vertical media card with 3:2 media above text and action (`direction="vertical"`).
· A dense list of repeated entities.

DON'T USE WHEN
· A free-form content surface → Card.
· A navigation row in a sidebar → SidebarMenuRow.
· Tabular data with sortable columns → Table.
· A plain text list with no leading visual or action → a plain list element.

HOW TO USE
· Compose ListItem > ListItemMedia, ListItemContent (ListItemTitle, ListItemDescription), ListItemActions; hide parts by omitting them.
· Default `direction` is horizontal (compact row); `vertical` for media cards. Default `variant` is default; `outline` for separated rows, `muted` for quiet grouping. Default size is md; sm for dense lists.
· ListItemMedia `type` is `icon`, `tile`, or `image`; set `decorative` when the media adds nothing for assistive tech. Media holds an Avatar or Avatar Group.
· Render `as="li"` inside a `ul`/`ol`; default is `div`. Put a Button or an icon in ListItemActions, one action per item.

DO
· Keep titles to one line and descriptions to one or two.
· Use the same variant and size down a list.

DON'T
· Put more than one action in ListItemActions.
· Nest ListItems.

RELATED
· Card — a general container; ListItem is a structured row with media and action.
· Table — column-based data; ListItem is a stack of entities.
· SidebarMenuRow — navigation row; ListItem is a content row.

## Sheet

USE WHEN
· A bottom sheet on mobile (`side="bottom"`, with the drag handle): actions, filters, pickers.
· An edge-anchored panel from the top, start, or end that keeps page context visible.
· A secondary task or detail panel that the user can swipe or tap away.

DON'T USE WHEN
· A centred, momentary decision → Dialog.
· A must-answer confirmation → AlertDialog.
· A persistent start/end side menu with no handle → Drawer.
· A transient message → Toast.

HOW TO USE
· Compose Sheet > SheetContent; pass `side` as `bottom`, `top`, `start`, or `end`. Default size is md; `full` for tall mobile sheets.
· Only `side="bottom"` shows the drag handle; do not add one to the others.
· `closeOnEscape` and `closeOnOverlayClick` are on SheetContent; keep both on unless unsaved input would be lost.
· Include a header title; focus trap, scroll lock, and Escape work as in Dialog.

DO
· Default to `bottom` for mobile; `end` for desktop detail panels.
· Keep content short enough to scan in one scroll.

DON'T
· Add a handle to top/start/end.
· Use for a destructive confirmation.

RELATED
· Drawer — start/end only, no handle, side-panel naming; Sheet adds top and bottom.
· Dialog — centred modal; Sheet is edge-anchored.
· AlertDialog — blocking confirm; Sheet is dismissible.

## Toast

USE WHEN
· Confirming a completed action ("Link copied", "Changes saved").
· Reporting a background result the user did not wait for (upload finished, sync failed).
· Offering a short undo or retry for a reversible action (one ToastAction).

DON'T USE WHEN
· The message must persist or the user must not miss it → Alert (inline).
· A decision is needed → Dialog or AlertDialog.
· The content is long, rich, or has more than one action → Dialog or Alert.
· A field-level validation error → field-level message.

HOW TO USE
· Mount `<Toaster />` once, then call `toast({ ... })` from anywhere; or compose Toast > ToastTitle, ToastDescription, ToastAction, ToastClose inside ToastProvider and ToastViewport.
· Default `variant` is default (neutral); use `success` or `danger` only when the outcome is that status. `icon` is off unless set.
· `ToastAction` requires `altText` (describes the action for assistive tech); one short verb label (Undo, Retry, View).
· Title one line, description one or two short lines, sentence case. Include ToastClose unless the toast auto-dismisses with no action.

DO
· Pair a danger toast with an inline error if the user must act.
· Keep wording factual and past tense.

DON'T
· Stack more than three toasts.
· Put critical information only in a toast.

RELATED
· Alert — persistent and in flow; Toast is transient and out of flow.
· AlertDialog — blocks for a decision; Toast never blocks.
· Dialog — user-initiated task; Toast reports an outcome.
