Build a new prototype flow called "payment-error" — a mobile checkout payment step that handles failure, like the other prototypes in this project.

Steps:
1. Payment — card number, expiry and CVC fields, an order total, and a "Pay now" button. Submitting takes a moment and then fails.
2. Failure — the payment fails with a card-declined error. Tell the user what happened, keep what they entered, let them try again, and give them another way forward (use a different card, or contact support).
3. A way to simulate a network timeout instead of a decline, which needs different wording and a different primary recovery action.

Use the Atlas design system. Register the flow so it appears on the prototypes index. When you're done, make sure it passes the token lint.
