// Compiled validators from the generated protocol schemas, one ajv instance per registry object, so the runtime
// checks a prop with exactly the schema registry-build emitted and never a hand copy of it.
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020"
import type { JsonSchema, Registry } from "@atlas/registry/lib"

type Cache = { ajv: Ajv2020; nodes: Map<string, ValidateFunction>; props: Map<string, ValidateFunction | null> }
const caches = new WeakMap<Registry, Cache>()

function cache(r: Registry): Cache {
  let c = caches.get(r)
  if (!c) { c = { ajv: new Ajv2020({ allErrors: false, strict: false }), nodes: new Map(), props: new Map() }; caches.set(r, c) }
  return c
}

export function nodeValidator(r: Registry, type: string): ValidateFunction | null {
  if (!Object.hasOwn(r.schemas, type)) return null
  const c = cache(r)
  let v = c.nodes.get(type)
  if (!v) { v = c.ajv.compile(r.schemas[type]); c.nodes.set(type, v) }
  return v
}

export function propValidator(r: Registry, type: string, prop: string): ValidateFunction | null {
  const key = `${type}.${prop}`
  const c = cache(r)
  if (c.props.has(key)) return c.props.get(key) ?? null
  const props = ((r.schemas[type]?.properties as JsonSchema | undefined)?.props as JsonSchema | undefined)?.properties as Record<string, JsonSchema> | undefined
  const v = props && Object.hasOwn(props, prop) ? c.ajv.compile(props[prop]) : null
  c.props.set(key, v)
  return v
}
