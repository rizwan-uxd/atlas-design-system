---
summary: Sign the user in or create an account with email, social or passkey options and a one-time code step, including errors and resend.
---
# Auth

## Use when
- The user signs in, signs up, or verifies an email or phone with a one-time code.
- A returning user must prove who they are before a protected screen.

## Don't use when
- The user is already signed in and changes their password or profile. That is the Form pattern inside Settings.
- A single confirmation of a risky action is needed. Use `AlertDialog`, not a sign-in screen.
- Collecting account details after signup (name, workspace, use case). That is the Onboarding pattern.

## Decision rules
- Identifier-first. Step 1 asks for one email (or phone) and shows one primary `Button` "Continue". Do not show the password field until the account is known. Why: Uber, Notion, Linear and Claude all lead with one identifier field.
- Social and SSO choices (Google, Apple, passkey) go below the primary action, after an "or" divider made of two `Divider`s around the word. Each is `Button variant="outline"` with the provider name in the label ("Continue with Google"). Why: Notion, Uber, Perplexity.
- Prefer a code or magic link over a password. Offer password only as a secondary path (`Button variant="ghost"` "Use a password instead"). A password `Input` gets a visible show/hide control and a "Forgot password?" `Button variant="link"` on the label row. Why: Linear and Claude are passwordless; Descript, Amazon and Uber keep password as a fallback.
- Code step: say where the code was sent and show that address, with a "Use a different email" `Button variant="link"`. One `Input` with `inputMode="numeric"` and `autoComplete="one-time-code"`. Do not split the code into per-digit boxes until Atlas has an OTP component (see candidates).
- Resend: a `Button variant="ghost"` that is disabled with a live countdown ("Resend in 30s") and re-enables at 0. Why: Notion ("Resend in 16s") and Wise ("Resend email 0:59").
- Wrong or expired code, or wrong password → `invalid` on the control, the message in text under it wired with `aria-describedby`, and the entered value kept. Say what to do ("The code is incorrect. Check your email or resend."). Never an `Alert` per field error.
- Account blocked or request failed server-side → one `Alert variant="danger"` above the action, or an `AlertDialog` with a single action when the user must pick another route. Why: Uber ("Choose another option").
- Terms and privacy are one line of muted text under the actions, not a checkbox, unless law requires explicit consent (then `Checkbox` with `required`).
- Cross-link the opposite flow in one line ("Don't have an account? Sign up"). Use `Button variant="link"`.

## Components and variants
- `Label` variant: `default` · size: `md`
- `Input` variant: `default` · size: `md`
- `Button` variant: `primary`, `outline`, `ghost`, `link` · size: `md`
- `Divider`
- `Alert` variant: `danger` · size: `md`
- `Checkbox` variant: `default` · size: `md`

## Layout and density
- One centred column no wider than the content width token. Fields and groups use `--atlas-spacing-4`; the Label to control gap is `--atlas-spacing-1_5`.
- Order: product mark and one-line title → identifier or code field → primary action → "or" divider → alternative methods → legal line → cross-link.
- Primary action full width, once per screen. Alternative methods share one size (`md`).

## Hierarchy and composition
- The title states the step ("Check your email", "Enter your password"), not the brand.
- Show the identifier the user entered on every later step so they can correct it.
- Do not put the auth form inside a Card on a phone. Use a Card only when the form floats over a busy background.

## Responsive behavior
- Phone is the primary layout. The primary action is pinned to the bottom edge; with the keyboard open it moves up and stays visible above the keyboard, and the alternative methods and legal line scroll away beneath it.
- Phone: full-width controls, keyboard-safe spacing, `type="email"` or `inputMode` set so the right keyboard opens. Wider screens keep the single column; do not add a split hero that hides the form below the fold.

## States
- default · focus · invalid (field text error) · loading (Button `loading`, entered values kept) · resend cooldown (disabled Button with countdown) · server error (one Alert).
- empty: required identifier shows its error only after a submit attempt.
- success: move straight to the destination; do not show a "success" screen.

## Accessibility
- Every control has a `Label` with `htmlFor`. The code field sets `autoComplete="one-time-code"` so the OS can fill it.
- On a failed submit move focus to the first invalid field. Announce the resend countdown result politely, not every second.
- Show/hide password is a real button with an accessible name and `aria-pressed`. Do not block paste in any field.
- Error text is referenced with `aria-describedby`, never conveyed by colour alone.

## Anti-patterns
- Asking for email and password on the first screen when a code or passkey is available.
- Per-field `Alert`s, red borders with no text, or clearing the user's input after an error.
- A disabled Continue with no explanation.
- Split OTP digit boxes built from raw inputs.
- Hand-rolled social buttons instead of `Button`.

## Example
{{example}}
