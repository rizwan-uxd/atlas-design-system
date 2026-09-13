# Flow scaffold

Everything a new flow needs from `app/prototypes/_shared/`. Read this instead of opening
`tabby/` or `wise-home/`.

## Files
```
app/prototypes/<slug>/
├── page.tsx          "use client" · useFlowState + FlowShell + one step per key
├── schema.ts         <Flow>Data type, <FLOW>_INITIAL, <FLOW>_STEPS, <Flow>StepProps
├── brand.ts          only for a cloned brand: named colours with no semantic token (DEC-008)
└── steps/<Step>.tsx  one screen each, receives <Flow>StepProps
```
A single-screen prototype may skip `schema.ts`/`steps/` and render inside `FlowShell` directly
with `step={0} totalSteps={1} showProgress={false}`.

## Shared APIs (`app/prototypes/_shared/`)
| Import | Signature |
|---|---|
| `FlowShell` | `{ title, step, totalSteps, onReset?, showProgress? = true, phoneBackground?, statusBarTint?: "dark"\|"light", homeIndicatorTint?: "dark"\|"light", children }` — page chrome, progress bar and phone frame |
| `useFlowState<T>` | `({ totalSteps, initialData: T, param? = "step" })` → `{ step, data, next, back, goTo(i), patch(partial), reset }`; step is synced to `?step=N` |
| `mockSubmit<T>` | `(payload, { delayMs? = 800, failRate?, errorMessage? })` → resolves payload or throws `Error(errorMessage)` |
| `mockVerifyOtp` | `(code, { delayMs? = 700 })` → `false` for `"0000"`, else `true` |

`phoneBackground` takes a token string: `"var(--atlas-background)"`.

## Minimal example
```ts
// schema.ts
export type SendData = { amount: string; note: string }
export const SEND_INITIAL: SendData = { amount: "", note: "" }
export const SEND_STEPS = ["amount", "review", "done"] as const
export type SendStepProps = {
  data: SendData
  patch: (p: Partial<SendData>) => void
  next: () => void
  back: () => void
  goTo: (i: number) => void
}
```
```tsx
// page.tsx
"use client"
import { FlowShell } from "../_shared/FlowShell"
import { useFlowState } from "../_shared/useFlowState"
import { SEND_INITIAL, SEND_STEPS, SendData } from "./schema"
import { Amount } from "./steps/Amount"
// …

export default function SendFlowPage() {
  const flow = useFlowState<SendData>({ totalSteps: SEND_STEPS.length, initialData: SEND_INITIAL })
  const props = { data: flow.data, patch: flow.patch, next: flow.next, back: flow.back, goTo: flow.goTo }
  const key = SEND_STEPS[flow.step]
  return (
    <FlowShell title="Send money" step={flow.step} totalSteps={SEND_STEPS.length} onReset={flow.reset}
      phoneBackground="var(--atlas-background)">
      {key === "amount" && <Amount {...props} />}
      {/* … */}
    </FlowShell>
  )
}
```
```tsx
// steps/Amount.tsx — a submitting step with loading and error states
"use client"
import { useState } from "react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { mockSubmit } from "../../_shared/mockApi"
import type { SendStepProps } from "../schema"

export function Amount({ data, patch, next }: SendStepProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async () => {
    setBusy(true); setError(null)
    try { await mockSubmit(data); next() } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-4)", paddingInline: "var(--atlas-spacing-4)" }}>
      {/* Input / Label / Alert props: take them from atlas/<Name>.md */}
      <Button variant="primary" size="lg" disabled={!data.amount || busy} onClick={submit}>Continue</Button>
    </div>
  )
}
```

## Registry entry (`app/prototypes/_shared/flowRegistry.ts`)
Append to `flows`; the index page needs no other wiring.
```ts
{
  slug: "send-money",                 // = folder name, required by atlas-verify
  name: "Send money",
  description: "One sentence on what the flow shows.",
  exercises: ["Button", "Input", "Alert"],   // Atlas components actually rendered
  status: "in-progress",              // "in-progress" | "stable" | "experimental"
},
```
