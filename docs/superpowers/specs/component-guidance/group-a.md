## Avatar
USE WHEN
· Showing a person or entity beside a name in a list row, comment, header or member list.
· Showing a stack of members (AvatarGroup), optionally with an add button.
· Showing presence next to a person (showStatus).
DON'T USE WHEN
· The avatar must be pressed on its own → wrap it in Button.
· Showing a logo or product/content picture → Image.
· Showing a count or a text label → Badge.
HOW TO USE
· Pass src for a photo, initials as the fallback, or icon; order is valid image, then initials, then person icon.
· Beside a visible name, set alt="" (decorative). With no adjacent name, give meaningful alt text.
· For presence, set showStatus and a statusLabel so the dot is exposed as text, never colour alone.
· Use AvatarGroup for stacks; give it an aria-label. Pass size/shape on the group, not on each member.
· Default shape is circle; use squircle only for non-person entities (teams, orgs) if the design calls for it.
DO
· Keep initials to 1-2 characters.
· Match size to the adjacent text (xs-sm in dense rows, lg-xl in profile headers).
DON'T
· Attach onClick to an Avatar; it has no interactive states.
· Mix sizes or shapes inside one group.
RELATED
· Image — Avatar is identity with fallbacks; Image is a ratio-locked picture.
· Badge — Avatar identifies who; Badge labels or counts.

## Badge
USE WHEN
· Marking the status of a row or object (Active, Failed, Draft).
· Showing a count or category tag next to a label or tab.
· Showing a removable filter or tag chip (removable + onRemove).
DON'T USE WHEN
· The user must act on it → Button.
· The message needs a sentence of explanation → Alert.
· Showing a transient confirmation → Toast.
HOW TO USE
· Children are required; keep to one or two words.
· Default variant is neutral and size md; use sm in dense rows, lg only for prominent headers.
· Pick variant by meaning: success, warning, danger, info for state; primary for emphasis; neutral for plain categories.
· Use appearance="outline" for a quieter badge beside filled content.
· dot adds a leading status dot; for removable, set onRemove and removeLabel so the remove button has a name.
DO
· Let the variant carry the meaning (danger means a problem).
· Pair colour with text; the label must read on its own.
DON'T
· Use variants decoratively.
· Use onClick on a Badge to imitate a button.
RELATED
· Button — Badge reports state; Button triggers an action.
· Alert — Badge is a label; Alert is a block message.
· Avatar — Badge labels; Avatar identifies a person.
NOTE: Existing doc speaks of Variant/State names (Figma); in code the intent prop is `variant`, and `disabled` is a prop. Badge also accepts onClick, which the doc discourages for faking buttons.

## Bubble
USE WHEN
· Showing one message in a chat, comment thread or assistant conversation.
· Grouping consecutive messages from one sender (BubbleGroup).
· Attaching quick reactions to a message (BubbleReactions).
DON'T USE WHEN
· Showing a system or status notice → Alert.
· Showing a short label or count → Badge.
· Showing a card, list row or long document → Card or ListItem.
HOW TO USE
· Set align="end" for the current user's messages and align="start" (default) for others.
· Default variant is primary; use primary for own messages, secondary or muted for replies, tinted or outline for secondary emphasis, destructive for failed messages.
· Wrap consecutive messages in BubbleGroup (role="group").
· For a link or button bubble, set asChild with a real a or button child; do not put onClick on the div.
· Give BubbleReactions an aria-label if it carries meaning; otherwise it is decorative.
DO
· Use one variant per sender within a group.
· Keep text conversational and short per bubble.
DON'T
· Nest interactive controls inside a non-interactive bubble.
· Use destructive for anything other than failed or error messages.
RELATED
· Alert — Bubble is conversational content; Alert is a system notice.
· Card — Bubble is a single message; Card is a content container.

## Button
USE WHEN
· Submitting a form, confirming or cancelling, or opening a dialog.
· Any action that changes state or starts a process.
· Icon-only tool actions (iconOnly) with an accessible name.
DON'T USE WHEN
· Navigating to another page or route → a link (variant="link" only styles an anchor; use asChild with the router link).
· A choice takes effect instantly as an on/off → Switch.
· Several related actions in a compact row → ButtonGroup.
HOW TO USE
· Children are the label; default variant is primary, default size is md.
· Use one primary per view; secondary or outline for supporting actions, ghost for low-emphasis and toolbar actions, destructive for irreversible actions, link for inline text actions.
· Set iconOnly with an aria-label; use leadingIcon or trailingIcon for icon plus text.
· Set loading for async work; it keeps the width and blocks repeat clicks.
· To render a link or router element, use asChild with that element as the child.
DO
· Start labels with a verb ("Save changes", not "OK").
· Keep sizes consistent within a row of actions.
DON'T
· Nest a Button inside a Button or an anchor.
· Use destructive for anything reversible.
RELATED
· DropdownMenu — Button runs one action; DropdownMenu offers several.
· Switch — Button triggers an action; Switch toggles a setting.
· Badge — Button is pressed; Badge only displays.
NOTE: Existing doc uses Figma names (Icon only, State=loading); in code these are the iconOnly and loading props.

## Checkbox
USE WHEN
· Several options can be chosen independently from a list.
· One opt-in needs explicit consent (terms, remember me).
· A parent row summarises partly selected children (checked="indeterminate").
DON'T USE WHEN
· The choice takes effect immediately without a save → Switch.
· Exactly one option from a set → RadioGroup.
· The control performs an action → Button.
HOW TO USE
· Give it a label prop (or pair with Label via id); clicking the label must toggle it.
· Use description for supporting text; use variant="card" when each option is a bordered, selectable tile.
· Controlled: checked + onCheckedChange; uncontrolled: defaultChecked.
· Set invalid together with one visible error message below the group (link it with aria-describedby), and required where the choice is mandatory.
· Default size is md; match the size of neighbouring controls.
DO
· Write labels as positive statements ("Send me updates").
· Keep a stable option order between renders.
DON'T
· Offer indeterminate as a value the user can pick; it is a parent summary only.
· Put an error on every row, or signal error by colour alone.
RELATED
· Switch — Checkbox is saved with a form; Switch applies immediately.
· RadioGroup — Checkbox allows many; RadioGroup allows exactly one.

## Divider
USE WHEN
· Separating a title from its body or rows in a key/value list.
· Separating inline links or columns (orientation="vertical").
· Marking a heavier break (tone="strong") or a quiet one (tone="subtle").
DON'T USE WHEN
· Creating space between items → gap or padding.
· Outlining a container → Card (or the container's own border).
· Grouping content that needs a visible heading → a section title.
HOW TO USE
· Default is horizontal and tone default; it fills its container (width or height).
· Use tone="inverse" only on a filled or brand surface.
· Set decorative when the line is purely visual; leave it off when it separates meaningful sections (exposes role=separator).
· Vertical dividers need a container with a defined height.
DO
· Use sparingly; prefer spacing to separate related items.
· Keep one tone per list.
DON'T
· Use it as a spacer.
· Add a label or inset; labelled and inset dividers are not in v1.
RELATED
· Card — Divider is a line; Card is a bordered container.

## Image
USE WHEN
· Showing photos, thumbnails or covers in cards and lists where layout must not shift.
· Content needs a fixed aspect ratio (ratio="16:9", "1:1", "4:3" and so on).
· A picture needs a loading placeholder and an error fallback.
DON'T USE WHEN
· Showing a person or entity identity → Avatar.
· Showing a glyph or symbol → a lucide-react icon.
· Decorative backgrounds → CSS background-image.
HOW TO USE
· src and alt are required; pass alt="" only for decorative images.
· Default ratio is auto (natural size); set an explicit ratio inside cards and grids to prevent layout shift.
· fit defaults to cover; use contain when cropping would lose content (logos, diagrams).
· radius is optional (none, sm, md, lg, xl, full); fallback replaces the default error icon.
· The image fills container width; size it with the parent, not with fixed pixels.
DO
· Write alt text that describes content or purpose.
· Match radius to the surrounding Card.
DON'T
· Omit alt.
· Use full radius to fake an avatar.
RELATED
· Avatar — Image is a ratio-locked picture; Avatar is identity with fallbacks.
· Skeleton — Image already shows its own loading state; use Skeleton for non-image content.

## Input
USE WHEN
· Collecting one line of text, email, number, search or password.
· A search bar or inline edit where the container owns the border (variant="unstyled").
· A field needs a unit, symbol or icon (prefix, suffix, leadingIcon, trailingIcon).
DON'T USE WHEN
· Multi-line text → Textarea.
· Choosing from a fixed set → Select, or RadioGroup for 2-6 visible options.
· Picking a date → DatePicker.
HOW TO USE
· Pair with a Label whose htmlFor matches the input id; use native type for email, number, password.
· Default variant is default, size md; filled suits tinted surfaces; unstyled only inside a bordered container.
· Set invalid with a visible error message linked by aria-describedby; set loading while validating or searching.
· Put units and currencies in prefix or suffix, not in the placeholder.
· Use native input attributes (disabled, readOnly, required, name, autoComplete).
DO
· Keep placeholders as example formats only.
· Match Label size to Input size.
DON'T
· Use placeholder as the only label.
· Disable an input to show read-only content; use readOnly.
RELATED
· Textarea — Input is one line; Textarea is multi-line.
· Select — Input is free text; Select picks from a fixed list.
NOTE: Existing doc says State=error; in code the prop is `invalid`.

## Label
USE WHEN
· Naming any Input, Textarea or Select, stacked above or beside it.
· Marking a field required or optional (required / optional props).
· Naming a standalone Checkbox or Switch that has no label prop.
DON'T USE WHEN
· Writing a heading or legend → a heading element.
· Wrapping unrelated content → a plain element.
· The control already renders its own label (Checkbox or Switch with label prop) → nothing extra.
HOW TO USE
· Children are required; set htmlFor to the control's id.
· Default variant stacks above the control; use variant="inline" for checkbox/switch rows beside the control.
· Match size (sm, md, lg) to the control; default is md.
· Use required or optional, not both (required wins); never type an asterisk.
· Mirror the control's disabled and invalid states on the Label.
DO
· Keep labels short noun phrases.
· Put aria-required on the control, not the Label.
DON'T
· Repeat the label text in the placeholder.
· Use Label as visual text for non-form content.
RELATED
· Input — Label names the field; Input collects the value.
· Checkbox — Checkbox has its own label prop; use Label only when composing separately.
NOTE: Existing doc says State=error; in code the prop is `invalid`.

## Progress
USE WHEN
· A task with a known percentage or step count (upload, export, multi-step form).
· A running task of unknown length (indeterminate).
· Showing completion alongside a label, value text and helper text.
DON'T USE WHEN
· A short wait with no layout → Spinner.
· Content still loading into a known layout → Skeleton.
· Letting the user choose a value → Slider.
HOW TO USE
· Set value and max for determinate; set indeterminate when duration is unknown (value is then ignored).
· Name it: use label, or aria-label / aria-labelledby when no visible label.
· Use valueLabel for the visible value ("42%") and helperText for context; add aria-valuetext when the number needs words ("Step 2 of 5").
· It fills its container width; size it by the parent.
DO
· Update value in steps users can read, not continuously jittering.
· Show helperText on completion or error context.
DON'T
· Use indeterminate when you know the percentage.
· Use it for page-scroll position.
RELATED
· ScrollProgress — Progress is task completion; ScrollProgress is reading position.
· Spinner — Progress shows an extent; Spinner shows only activity.

## RadioGroup
USE WHEN
· Choosing exactly one option from a short list (2-6) with every option visible.
· Options need a description or a bordered, selectable tile (variant="card").
· A 2-3 short-option choice fits in a row (direction="horizontal").
DON'T USE WHEN
· Several options can be picked → Checkbox.
· An immediate on/off → Switch.
· A long list → Select or DropdownMenu.
HOW TO USE
· Compose RadioGroup with a RadioGroupItem per option; each item needs value and label (description optional).
· Name the group with aria-label or aria-labelledby.
· Controlled: value + onValueChange; uncontrolled: defaultValue. Set name for form posts.
· Default variant is default, size md (sm available), direction vertical.
· Set invalid with one error message below the group; set required where a choice is mandatory; disabled on the group or an item.
DO
· Preselect a safe default when one exists.
· Keep option labels parallel and short.
DON'T
· Use fewer than 2 or more than about 6 options.
· Use horizontal for long labels or more than three options.
RELATED
· Checkbox — RadioGroup picks one; Checkbox picks many.
· Select — RadioGroup shows all options; Select hides them in a menu.
· Tabs — RadioGroup sets a value; Tabs switch visible content.
