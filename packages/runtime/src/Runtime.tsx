"use client"
// The renderer. Every node is a memoised NodeView inside its own error boundary; Form, Field and TextField are
// composed here because Form is structural and Field hands its control props to a render-prop child.
import * as React from "react"
import { componentMap } from "@atlas/registry/generated/componentMap"
import type { Registry } from "@atlas/registry/lib"
import { Field, type FieldControlProps } from "@atlas/ui-web/compositions/Field/Field"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { fallbackFor } from "./fallback"
import { initialState, reduce, type RuntimeState } from "./store"
import type { Issue, SafeItem, SafeNode, ServerOp, Transport } from "./protocol"

type Components = Partial<Record<keyof typeof componentMap, React.ElementType>>
type Stable = {
  registry: Registry
  components: Record<string, React.ElementType>
  submit: (source: string) => void
  input: (path: string, value: string) => void
  report: (issue: Issue) => void
  onRender?: (path: string) => void
}
const StableContext = React.createContext<Stable | null>(null)
const FormContext = React.createContext<Pick<RuntimeState, "values" | "errors">>({ values: {}, errors: {} })
const useStable = () => React.useContext(StableContext) as Stable

export const silentTransport: Transport = { send: () => {}, subscribe: () => () => {} }

type Props = {
  registry: Registry
  transport: Transport
  initial?: ServerOp
  onIssues?: (issues: Issue[]) => void
  /** Called with a node's path each time it renders; the patch-scope test reads it. */
  onRender?: (path: string) => void
  /** Test seam: replaces componentMap entries (for example, a component that throws). */
  components?: Components
}

export function AtlasRuntime({ registry, transport, initial, onIssues, onRender, components }: Props) {
  const step = React.useMemo(() => reduce(registry), [registry])
  const [state, dispatch] = React.useReducer(step, initialState, (s) => (initial ? step(s, { kind: "server", op: initial }) : s))
  const seq = React.useRef(0)
  const values = React.useRef(state.values)
  React.useLayoutEffect(() => { values.current = state.values }, [state.values])

  React.useEffect(() => transport.subscribe((op) => {
    performance.mark(`atlas:op:${op.seq}`)
    dispatch({ kind: "server", op })
  }), [transport])

  const stable = React.useMemo<Stable>(() => ({
    registry,
    components: { ...componentMap, ...components } as Record<string, React.ElementType>,
    submit: (source) => {
      seq.current += 1
      performance.mark(`atlas:send:${seq.current}`)
      transport.send({ kind: "event", seq: seq.current, type: "submit", source, values: { ...values.current } })
    },
    input: (path, value) => dispatch({ kind: "input", path, value }),
    report: (issue) => onIssues?.([issue]),
    onRender,
  }), [registry, components, transport, onIssues, onRender])

  React.useEffect(() => { if (state.issues.length) onIssues?.(state.issues) }, [state.issues, onIssues])

  const measured = React.useRef(0)
  React.useLayoutEffect(() => {
    for (const ack of state.acks.slice(measured.current)) {
      if (performance.getEntriesByName(`atlas:send:${ack}`).length) performance.measure("atlas:ack", `atlas:send:${ack}`)
    }
    measured.current = state.acks.length
  }, [state.acks])
  React.useLayoutEffect(() => {
    const f = state.fallbackSeq
    if (f !== null && performance.getEntriesByName(`atlas:op:${f}`).length) performance.measure("atlas:fallback", `atlas:op:${f}`)
  }, [state.fallbackSeq])

  const form = React.useMemo(() => ({ values: state.values, errors: state.errors }), [state.values, state.errors])
  return (
    <StableContext.Provider value={stable}>
      <FormContext.Provider value={form}>
        <div data-atlas-runtime="">{state.root && <NodeView node={state.root} parentType={null} />}</div>
      </FormContext.Provider>
    </StableContext.Provider>
  )
}

function Items({ items, parentType }: { items: SafeItem[] | undefined; parentType: string }) {
  return <>{(items ?? []).map((it, i) => (typeof it === "string" ? <React.Fragment key={`t${i}`}>{it}</React.Fragment> : <NodeView key={it.path} node={it} parentType={parentType} />))}</>
}
const slot = (items: SafeItem[] | undefined, parentType: string) => (items && items.length ? <Items items={items} parentType={parentType} /> : undefined)
const tag = (n: SafeNode) => ({ "data-atlas-node": "", "data-atlas-type": n.type, "data-atlas-path": n.path })

const NodeView = React.memo(function NodeView({ node, parentType }: { node: SafeNode; parentType: string | null }) {
  const s = useStable()
  s.onRender?.(node.path)
  return <NodeBoundary node={node} stable={s}>{renderNode(node, parentType, s)}</NodeBoundary>
})

function renderNode(node: SafeNode, parentType: string | null, s: Stable): React.ReactNode {
  if (s.registry.entries[node.type].kind === "structural") {
    return (
      <form {...tag(node)} noValidate onSubmit={(e) => { e.preventDefault(); s.submit(node.path) }}>
        <Items items={node.slots.children} parentType={node.type} />
      </form>
    )
  }
  if (node.type === "Field") return <div className="atlas-node" {...tag(node)}><FieldView node={node} /></div>
  if (node.type === "TextField") return <TextFieldView node={node} control={null} />
  const Component = s.components[node.type]
  const slots = Object.fromEntries(Object.entries(node.slots).map(([k, v]) => [k, slot(v, node.type)]))
  // DEC-084: a Button placed directly in a Form submits it.
  const submit = node.type === "Button" && parentType === "Form" ? { type: "submit" } : {}
  return <div className="atlas-node" {...tag(node)}><Component {...node.props} {...slots} {...submit} /></div>
}

function FieldView({ node }: { node: SafeNode }) {
  const { errors } = React.useContext(FormContext)
  const controls = node.slots.children ?? []
  const text = controls.find((c): c is SafeNode => typeof c !== "string" && c.type === "TextField")
  const key = text ? `form.${text.props.name as string}` : null
  const error = key && errors[key] ? errors[key] : slot(node.slots.error, "Field")
  return (
    <Field {...node.props} label={slot(node.slots.label, "Field")} helpText={slot(node.slots.helpText, "Field")}
      labelAction={slot(node.slots.labelAction, "Field")} error={error}>
      {(control) => <>{controls.map((c, i) => (typeof c === "string" ? <React.Fragment key={`t${i}`}>{c}</React.Fragment>
        : c.type === "TextField" ? <TextFieldView key={c.path} node={c} control={control} />
        : <NodeView key={c.path} node={c} parentType="Field" />))}</>}
    </Field>
  )
}

function TextFieldView({ node, control }: { node: SafeNode; control: FieldControlProps | null }) {
  const s = useStable()
  const { values } = React.useContext(FormContext)
  const key = `form.${node.props.name as string}`
  return (
    <div className="atlas-node" {...tag(node)}>
      <Input {...node.props} {...(control ?? {})} value={values[key] ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => s.input(key, e.target.value)} />
    </div>
  )
}

class NodeBoundary extends React.Component<{ node: SafeNode; stable: Stable; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: unknown) {
    this.props.stable.report({ path: this.props.node.path, code: "render-error", detail: String(error) })
  }
  render() {
    if (!this.state.failed) return this.props.children
    const { node, stable } = this.props
    const fb = fallbackFor(node.type, stable.registry, node.path)
    // The terminal (Alert) failing falls back to itself; rendering it again would loop, so it renders nothing.
    return fb && fb.type !== node.type ? <NodeView node={fb} parentType={null} /> : null
  }
}
