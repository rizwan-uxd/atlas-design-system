import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

type Failure = "declined" | "timeout" | "exhausted"

export function PaymentFailure({ kind, retrying, onRetry, onChangeCard, onSupport, onBack }:
  { kind: Failure; retrying: boolean; onRetry: () => void; onChangeCard: () => void; onSupport: () => void; onBack: () => void }) {
  // Declined: the card is the problem, so changing it is primary. Timeout: the request is, so retry is.
  // Exhausted: the user cannot fix it, so the manual path is primary and there is no retry.
  if (kind === "declined") return (
    <Alert variant="danger" title="Your card was declined"
      description="Your bank declined this card. Use a different card to finish paying."
      actions={<>
        <Button size="sm" variant="primary" onClick={onChangeCard}>Use a different card</Button>
        <Button size="sm" variant="outline" onClick={onSupport}>Contact support</Button>
      </>} />
  )
  if (kind === "exhausted") return (
    <Alert variant="danger" title="Payments are unavailable right now"
      description="We couldn't complete this after several tries. Contact support and we will finish the order for you."
      actions={<>
        <Button size="sm" variant="primary" onClick={onSupport}>Contact support</Button>
        <Button size="sm" variant="outline" onClick={onBack}>Go back</Button>
      </>} />
  )
  return (
    <Alert variant="danger" title="We couldn't reach the payment service"
      description="Your card has not been charged. Check your connection and try again."
      actions={<>
        <Button size="sm" variant="primary" loading={retrying} onClick={onRetry}>Try again</Button>
        <Button size="sm" variant="outline" onClick={onSupport}>Contact support</Button>
      </>} />
  )
}
