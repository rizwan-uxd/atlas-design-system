import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

type Failure = "declined" | "timeout"

export function PaymentFailure({ kind, retrying, onRetry, onChangeCard, onSupport }:
  { kind: Failure; retrying: boolean; onRetry: () => void; onChangeCard: () => void; onSupport: () => void }) {
  // Declined: the card is the problem, so changing it is primary. Timeout: the request is, so retry is.
  return kind === "declined" ? (
    <Alert variant="danger" title="Your card was declined"
      description="You haven't been charged. Use a different card, or contact your bank."
      actions={<>
        <Button size="sm" variant="primary" onClick={onChangeCard}>Use a different card</Button>
        <Button size="sm" variant="ghost" onClick={onSupport}>Contact support</Button>
      </>} />
  ) : (
    <Alert variant="danger" title="The payment timed out"
      description="We couldn't confirm it went through. Your details are saved; try again in a moment."
      actions={<>
        <Button size="sm" variant="primary" loading={retrying} onClick={onRetry}>Try again</Button>
        <Button size="sm" variant="ghost" onClick={onSupport}>Contact support</Button>
      </>} />
  )
}
