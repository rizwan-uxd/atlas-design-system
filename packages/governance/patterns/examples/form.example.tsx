import * as React from "react"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Field } from "@atlas/ui-web/compositions/Field/Field"
import { Checkbox } from "@atlas/ui-web/primitives/Checkbox/Checkbox"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { RadioGroup, RadioGroupItem } from "@atlas/ui-web/primitives/RadioGroup/RadioGroup"

type Errors = { name?: string; email?: string }

export function ProfileForm({ onSave }: { onSave: (v: { name: string; email: string; phone: string; plan: string; news: boolean }) => Promise<void> }) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [plan, setPlan] = React.useState("team")
  const [news, setNews] = React.useState(false)
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
      await onSave({ name, email, phone, plan, news })
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
      <Field label="Full name" required error={errors.name}>
        {(control) => <Input {...control} value={name} onChange={(e) => setName(e.target.value)} />}
      </Field>
      <Field label="Email" required error={errors.email}>
        {(control) => <Input {...control} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
      </Field>
      <Field label="Phone" optional>
        {(control) => <Input {...control} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />}
      </Field>
      <RadioGroup aria-label="Plan" value={plan} onValueChange={setPlan}>
        <RadioGroupItem value="personal" label="Personal" description="For one person." />
        <RadioGroupItem value="team" label="Team" description="Share projects with others." />
        <RadioGroupItem value="business" label="Business" description="Billing and admin controls." />
      </RadioGroup>
      <Checkbox label="Send me product news" checked={news} onCheckedChange={(c) => setNews(c === true)} />
      {failed && <Alert variant="danger" title="We couldn't save your details" description="Your entries are still here. Check your connection and try again." />}
      <Button type="submit" variant="primary" loading={saving}>Save</Button>
    </form>
  )
}
