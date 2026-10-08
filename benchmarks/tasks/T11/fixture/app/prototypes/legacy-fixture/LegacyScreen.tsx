import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

export function LegacyScreen() {
  return (
    <div>
      <Alert variant="neutral" title="Heads up" description="Maintenance tonight at 22:00." />
      <Button variant="link">View details</Button>
      <Button variant="link" size="sm">Dismiss</Button>
    </div>
  )
}
