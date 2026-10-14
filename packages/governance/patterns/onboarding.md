---
summary: Get a new user from first sign-in to a working account with a short setup flow, then a get-started checklist inside the product.
---
# Onboarding

## Use when
- A new user or new workspace needs a few answers before the product is useful (use case, name, invite teammates).
- Features need guided first use after setup: a checklist of 3 to 7 tasks with progress.

## Don't use when
- The user only signs in or verifies a code. That is the Auth pattern.
- Collecting many unrelated details up front. Ask only what changes the first screen; collect the rest in context later.
- Explaining a single new feature to existing users. Use a `Toast` or an inline `Alert variant="info"`, not a flow.

## Decision rules
- Two stages. Stage 1 is a short blocking setup flow of 3 to 5 steps, one question per step. Stage 2 is a non-blocking "Get started" checklist on the home screen. Why: Linear and Vercel use a short setup, then a checklist; Notion and Perplexity add a use-case question first.
- One primary `Button` per step ("Continue"). Back is `Button variant="ghost"` and always available except on step 1. Show where the user is with a `Stepper` (3 to 5 steps, each named in one or two words, `current` is the 1-based step). It is display only: Continue and Back move between steps, not the markers. Why: Wise labels each step in a step bar; Linear and Perplexity use dots.
- A choice between 2 to 4 named paths ("For my team", "Personal", "School") → `RadioGroup variant="card"`, each item with `label` and a one-line `description`. Selecting a card does not advance; Continue does. Why: Notion, Perplexity and Vercel plan type.
- Free-text answers → `Field` around an `Input`. Role or company size → `Field` around a `Select`. Required answers set `required`; an optional step's field sets `optional`. Do not hand-wire `Label` + `Input`. Never ask for something the product can infer.
- Every optional step has a visible "Skip" (`Button variant="ghost"`) or "I'll do this later" on invite steps. Skipping must not trap the user in a half-set-up state. Why: Linear "I'll do this later".
- Checklist: a `Card variant="outlined"` titled "Get started" with a `Progress` ("3 of 6 complete"). Each row is a `ListItem` with title, one line of why, and an action; done rows show a check and strike through. The checklist can be dismissed and comes back from a menu. Why: Vercel Production Checklist, Klaviyo and HoneyBook setup guides, Dropbox "Get to know".
- Completion: replace the checklist with one confirmation line and one primary action ("Go to home"), not a full-screen celebration. Why: Klaviyo "Set up complete".
- Save answers as the user moves. Leaving and returning resumes at the same step.
- A failed save → one `Alert variant="danger"` above Continue; keep the answers. See the Error recovery pattern.

## Components and variants
- `Stepper` orientation: `horizontal` · size: `md` (setup flow)
- `Progress` (checklist)
- `RadioGroup` variant: `card` · size: `md`
- `Field` size: `md`
- `Label` variant: `default` · size: `md` (inside Field)
- `Input` variant: `default` · size: `md`
- `Select` size: `md`
- `Button` variant: `primary`, `ghost` · size: `md`
- `Card` variant: `outlined` · size: `md`
- `ListItem` variant: `outline` · size: `md`
- `Alert` variant: `danger` · size: `md`

## Layout and density
- Setup flow: one centred column at the content width token; step title, one line of help, the control, then actions. Spacing `--atlas-spacing-6` between those blocks and `--atlas-spacing-4` between fields.
- Checklist: a single Card in the main column of the home screen, rows separated by the border token, not nested Cards.

## Hierarchy and composition
- Step title is a question the user can answer ("How will you use the product?"), help text states why it is asked.
- The Stepper sits above the title. Primary action last; Back and Skip on the same row as ghost.
- The checklist leads with the task that gives value fastest, not a settings task.
- Typography: Step title `--atlas-font-size-2xl`, semibold; help text `--atlas-text-body-sm` in `foreground-muted`. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.

## Responsive behavior
- Phone is the primary layout. Single column; the primary action is pinned to the bottom edge with Back and Skip as a row of ghost Buttons below it. Cards stack. Checklist rows keep the action visible; do not hide it in a menu.
- When the keyboard is open, the pinned actions move up and stay visible above it. Never let the keyboard cover Continue.
- Back returns to the previous step with its answer still filled in. Leaving and returning resumes the same step.
- Wider screens centre the same column at the content width; the primary action sits at the end of the row.

## States
- default · selected (card with checked state) · invalid · loading (Continue `loading`) · skipped · complete.
- empty: a step with no choice keeps Continue enabled only where an answer is required; otherwise offers Skip.
- error: save failure in one Alert; answers stay.

## Accessibility
- The group of cards is a named radio group (`aria-label`). The Stepper is named (`aria-label`, for example "Setup"), the current step carries `aria-current="step"`, and each status is also written for assistive technology. The checklist `Progress` has an accessible label and value text.
- Focus moves to the new step's title on Continue and Back. Checked rows are announced as completed, not only struck through.
- Do not auto-advance on selection.

## Anti-patterns
- A long wizard that asks for everything before showing the product.
- A modal tour that cannot be dismissed.
- A stepper with no name, a progress bar with no label, or a checklist with no way to hide it.
- Asking for the same data the user already gave at signup.

## Example
{{example}}
