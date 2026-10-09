import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Card, CardContent } from "@atlas/ui-web/compositions/Card/Card"

export function DriftScreen() {
  return (
    <Card variant="outlined">
      <CardContent>
        <div style={{ padding: 13, color: "#0b6bff" }}>Balance</div>
        <div style={{ background: "var(--atlas-blue-500)" }}>Highlight</div>
        <div style={{ borderColor: "var(--atlas-brand-accent)" }}>Border</div>
        <button type="button" style={{ background: "rgb(20, 20, 20)" }}>Pay</button>
        <div onClick={() => {}}>Details</div>
        <Button variant="primary">Save</Button>
      </CardContent>
    </Card>
  )
}
