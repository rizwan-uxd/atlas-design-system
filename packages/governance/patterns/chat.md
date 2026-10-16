---
summary: A conversation between people or with an assistant: a scrolling message list of grouped bubbles, a composer pinned below it, and sending, failed, empty and new-message states.
---
# Chat

## Use when
- The user exchanges short messages in turn with other people or an assistant, and the newest message matters most.
- The conversation is a thread that grows over time and is read from the bottom.

## Don't use when
- A one-off comment on a record. Use a `ListItem` list with a `Textarea` and a Submit `Button` (the Form pattern).
- A system or status notice. Use `Alert` or `Toast`.
- A list of conversations to choose from. Use the Data table or Search and filter pattern; this pattern is one open thread.

## Decision rules
- Each message is a `Bubble`. The current user's messages use `align="end"` and `variant="primary"`; everyone else's use `align="start"` and `variant="secondary"`. One variant per sender within a group.
- Consecutive messages from one sender go in one `BubbleGroup`, with the sender's `Avatar` and name once above or beside the group, not on every bubble. A new group starts when the sender changes or after a long pause.
- Do not repeat a timestamp on every bubble. If the product shows time, show it once per group, as muted text beside the sender's name (not drawn in Figma yet).
- A failed message uses `Bubble variant="destructive"` with a visible "Not sent" text and a "Retry" `Button variant="ghost"` next to it. `destructive` is for failed messages only.
- A message that is still being sent stays in place with a muted "Sending" text; do not move it when it is confirmed.
- The composer is a `Textarea` with `autoGrow` and `maxRows`, plus an icon-only Send `Button variant="primary"` with an `aria-label`. Enter sends and Shift+Enter inserts a new line; say so in the composer's placeholder or help text. Disable Send, not the textarea, while the draft is empty.
- Never clear the draft until the message is accepted by the list. On failure the bubble shows the failed state and the text is not lost.
- Reactions use `BubbleReactions` on the bubble's bottom edge, and carry an `aria-label` that states what they mean ("2 reactions: thumbs up").
- An assistant reply that is being generated shows a `Spinner size="sm"` in a `Bubble variant="muted"` with the text "Thinking". Replace it in place with the reply.
- Scroll rule: new messages scroll into view only when the user is already at the bottom. If they have scrolled up, keep their position and show a "New messages" `Button variant="outline"` that scrolls down.

## Components and variants
- `Bubble` variant: `primary`, `secondary`, `muted`, `destructive`
- `Avatar` size: `sm`
- `Textarea` size: `md`
- `Button` variant: `primary`, `ghost`, `outline` · size: `md`
- `Spinner` size: `sm`
- `Divider`
- `EmptyState` size: `md`
- `Skeleton`

## Layout and density
- One column filling the height of the content area: the message list scrolls, the composer stays pinned to the bottom edge. Build with logical properties so "start" and "end" mirror in RTL.
- `--atlas-spacing-1` between bubbles in a group, `--atlas-spacing-4` between groups, `--atlas-spacing-3` between the composer's textarea and Send.
- A bubble is at most about 75% of the list width so the sender's side stays readable; long words wrap.

## Hierarchy and composition
- The messages are the content; chrome stays quiet. The thread title (the other person or the assistant's name) is the only heading, in the page header.
- Typography: thread title `--atlas-text-h3`; sender name and time `--atlas-text-body-sm` in `foreground-muted`; message text is the Bubble's own. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.
- Put no forms or cards inside a bubble. Attachments and rich content belong beside the bubble as a `Card` linked to it.

## Responsive behavior
- Phone: the list fills the screen and the composer sits above the on-screen keyboard; the bubble limit rises to about 85%. Wider screens keep one column at a readable width; do not spread bubbles across the full width.

## States
- default · sending · failed (destructive Bubble with Retry) · empty (no messages: `EmptyState` with the first prompt) · loading history (`Skeleton` bubbles at the top; older messages are added above without moving the view) · assistant generating (Spinner bubble) · offline (an `Alert variant="warning"` above the composer, the draft is kept) · disabled (conversation closed: the composer is replaced with a short text saying why).

## Accessibility
- The message list is a `role="log"` region with an accessible name, so new messages are announced politely without moving focus. Do not make every bubble focusable.
- Each `BubbleGroup` has `role="group"` and an `aria-label` naming the sender ("Dana Lee").
- The composer `Textarea` has a visible label or an `aria-label`; Send has an `aria-label`. A failed message's Retry is a real button reachable by Tab.
- State is never colour alone: sending, failed and sent each have text.
- Respect `prefers-reduced-motion` when scrolling to new messages (jump instead of animating).

## Anti-patterns
- Avatar and timestamp repeated on every bubble.
- Forcing the list to the bottom while the user is reading older messages.
- Clearing the draft before the message is accepted, or losing it on failure.
- A failed message that only turns red with no text or Retry.
- Disabling the textarea while a message sends.
- Nesting buttons or forms inside a non-interactive bubble.
- Using `Alert` or `Toast` for a message in the conversation.

## Example
{{example}}
