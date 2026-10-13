import * as React from "react"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Card, CardContent, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { Field } from "@atlas/ui-web/compositions/Field/Field"
import { ListItem, ListItemActions, ListItemContent, ListItemDescription, ListItemTitle } from "@atlas/ui-web/compositions/ListItem/ListItem"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Progress } from "@atlas/ui-web/primitives/Progress/Progress"
import { RadioGroup, RadioGroupItem } from "@atlas/ui-web/primitives/RadioGroup/RadioGroup"

type Setup = { useCase: string; workspace: string; teammate: string }

const title = { fontSize: "var(--atlas-font-size-2xl)", fontWeight: "var(--atlas-font-weight-semibold)" }
const help = { fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }

export function SetupFlow({ onFinish }: { onFinish: (v: Setup) => Promise<void> }) {
  const [step, setStep] = React.useState(0)
  const [useCase, setUseCase] = React.useState("")
  const [workspace, setWorkspace] = React.useState("")
  const [teammate, setTeammate] = React.useState("")
  const [complete, setComplete] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const total = 3

  async function next(skip = false) {
    if (step < total - 1) return setStep(step + 1)
    setSaving(true)
    setFailed(false)
    try {
      await onFinish({ useCase, workspace, teammate: skip ? "" : teammate })
      setComplete(true)
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  if (complete) {
    return (
      <div role="status" style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
        <h1 style={title}>You're all set</h1>
        <p style={help}>Your workspace is ready. Your answers are saved.</p>
        <Button variant="primary">Go to home</Button>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-6)" }}>
      <Progress value={step + 1} max={total} label="Setup" valueLabel={`Step ${step + 1} of ${total}`} />
      {step === 0 ? (
        <div style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
          <h1 style={title}>How will you use the product?</h1>
          <p style={help}>We use this to set up your first screen.</p>
          <RadioGroup variant="card" aria-label="How you will use the product" value={useCase} onValueChange={setUseCase}>
            <RadioGroupItem value="team" label="For my team" description="Share docs and projects" />
            <RadioGroupItem value="personal" label="For personal use" description="Notes and tasks for you" />
            <RadioGroupItem value="school" label="For school" description="Coursework and research" />
          </RadioGroup>
        </div>
      ) : step === 2 ? (
        <div style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
          <h1 style={title}>Invite your team</h1>
          <p style={help}>You can also do this later.</p>
          <Field label="Teammate email" optional>
            {(control) => <Input {...control} type="email" inputMode="email" value={teammate} onChange={(e) => setTeammate(e.target.value)} />}
          </Field>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
          <h1 style={title}>Name your workspace</h1>
          <p style={help}>This is what your teammates will see.</p>
          <Field label="Workspace name" required>
            {(control) => <Input {...control} value={workspace} onChange={(e) => setWorkspace(e.target.value)} />}
          </Field>
        </div>
      )}
      {failed && <Alert variant="danger" title="We couldn't save your setup" description="Your answers are still here. Try again." />}
      {/* Pinned actions: Continue on top, Back and Skip below as ghost Buttons. Back is on every step but the first. */}
      <div style={{ display: "grid", gap: "var(--atlas-spacing-3)" }}>
        <Button variant="primary" loading={saving} disabled={step === 0 ? !useCase : step === 1 ? !workspace.trim() : false} onClick={() => next()}>
          {step === total - 1 ? "Finish" : "Continue"}
        </Button>
        <div style={{ display: "flex", gap: "var(--atlas-spacing-3)" }}>
          {step > 0 && <Button variant="ghost" style={{ flex: 1 }} onClick={() => setStep(step - 1)}>Back</Button>}
          {step === 2 && <Button variant="ghost" style={{ flex: 1 }} onClick={() => { setTeammate(""); next(true) }}>Skip</Button>}
        </div>
      </div>
    </div>
  )
}

type Task = { id: string; title: string; why: string; done: boolean; onStart: () => void }

export function GetStartedChecklist({ tasks, onDismiss }: { tasks: Task[]; onDismiss: () => void }) {
  const done = tasks.filter((t) => t.done).length
  return (
    <Card variant="outlined">
      <CardHeader action={<Button variant="ghost" size="sm" onClick={onDismiss}>Hide</Button>}>
        <CardTitle>Get started</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={done} max={tasks.length} label="Setup progress" valueLabel={`${done} of ${tasks.length} complete`} />
        <ul style={{ display: "grid", gap: "var(--atlas-spacing-2)", listStyle: "none", padding: 0 }}>
          {tasks.map((t) => (
            <ListItem key={t.id} as="li" variant="outline">
              <ListItemContent>
                <ListItemTitle style={t.done ? { textDecoration: "line-through" } : undefined}>{t.title}</ListItemTitle>
                <ListItemDescription>{t.why}</ListItemDescription>
              </ListItemContent>
              <ListItemActions>
                {t.done ? <span>Done</span> : <Button variant="ghost" size="sm" onClick={t.onStart}>Start</Button>}
              </ListItemActions>
            </ListItem>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
