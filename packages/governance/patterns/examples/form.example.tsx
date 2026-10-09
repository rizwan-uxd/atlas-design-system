import * as React from "react"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Label } from "@atlas/ui-web/primitives/Label/Label"

type Errors = { name?: string; email?: string }

export function ProfileForm({ onSave }: { onSave: (v: { name: string; email: string }) => Promise<void> }) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [errors, setErrors] = React.useState<Errors>({})
  const [failed, setFailed] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    if (!name.trim()) next.name = "Enter your full name."
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address."
    setErrors(next)
    if (next.name || next.email) return
    setSaving(true)
    setFailed(false)
    try {
      await onSave({ name, email })
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
      <div>
        <Label htmlFor="name" required>Full name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
          invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
        {errors.name && <p id="name-error" style={{ color: "var(--atlas-danger)" }}>{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
        {errors.email && <p id="email-error" style={{ color: "var(--atlas-danger)" }}>{errors.email}</p>}
      </div>
      {failed && <Alert variant="danger" title="We couldn't save your details" description="Your entries are still here. Check your connection and try again." />}
      <Button type="submit" variant="primary" loading={saving}>Save</Button>
    </form>
  )
}
