import * as React from "react"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Field } from "@atlas/ui-web/compositions/Field/Field"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Divider } from "@atlas/ui-web/primitives/Divider/Divider"
import { Input } from "@atlas/ui-web/primitives/Input/Input"

type Props = {
  onRequestCode: (email: string) => Promise<void>
  onVerifyCode: (email: string, code: string) => Promise<boolean>
  onSocial: (provider: "google" | "apple" | "passkey") => void
  onSignUp: () => void
}

export function SignIn({ onRequestCode, onVerifyCode, onSocial, onSignUp }: Props) {
  const [step, setStep] = React.useState<"email" | "code">("email")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [emailError, setEmailError] = React.useState<string>()
  const [codeError, setCodeError] = React.useState<string>()
  const [failed, setFailed] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setEmailError("Enter a valid email address.")
    setEmailError(undefined)
    setBusy(true)
    setFailed(false)
    try {
      await onRequestCode(email)
      setStep("code")
      setCooldown(30)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const ok = await onVerifyCode(email, code)
    setBusy(false)
    if (!ok) setCodeError("The code is incorrect. Check your email or resend.")
  }

  const muted = { color: "var(--atlas-foreground-muted)", fontSize: "var(--atlas-text-body-sm)" }
  const title = { fontSize: "var(--atlas-font-size-2xl)", fontWeight: "var(--atlas-font-weight-semibold)" }

  if (step === "code") {
    return (
      <form onSubmit={verify} noValidate style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
        <h1 style={title}>Check your email</h1>
        <p style={muted}>We sent a 6-digit code to <strong>{email}</strong>.</p>
        <Button type="button" variant="link" onClick={() => { setStep("email"); setCode(""); setCodeError(undefined) }}>
          Use a different email
        </Button>
        <Field label="Code" error={codeError}>
          {(control) => (
            <Input {...control} inputMode="numeric" autoComplete="one-time-code" value={code}
              onChange={(e) => setCode(e.target.value)} />
          )}
        </Field>
        <Button type="submit" variant="primary" loading={busy}>Continue</Button>
        <Button type="button" variant="ghost" disabled={cooldown > 0} onClick={() => sendCode()}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={sendCode} noValidate style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
      <h1 style={title}>Sign in</h1>
      <p style={muted}>Enter your email to continue.</p>
      <Field label="Email" error={emailError}>
        {(control) => (
          <Input {...control} type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        )}
      </Field>
      {failed && <Alert variant="danger" title="We couldn't send the code" description="Check your connection and try again." />}
      <Button type="submit" variant="primary" loading={busy}>Continue</Button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "var(--atlas-spacing-3)" }}>
        <Divider />
        <span style={muted}>or</span>
        <Divider />
      </div>
      <Button type="button" variant="outline" onClick={() => onSocial("google")}>Continue with Google</Button>
      <Button type="button" variant="outline" onClick={() => onSocial("apple")}>Continue with Apple</Button>
      <Button type="button" variant="outline" onClick={() => onSocial("passkey")}>Continue with a passkey</Button>
      <p style={{ ...muted, textAlign: "center" }}>By continuing you agree to the Terms and Privacy Policy.</p>
      <p style={{ ...muted, textAlign: "center" }}>
        Don't have an account? <Button type="button" variant="link" onClick={onSignUp}>Sign up</Button>
      </p>
    </form>
  )
}
