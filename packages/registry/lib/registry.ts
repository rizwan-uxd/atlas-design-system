// The registry value and its types, from generated/runtimeRegistry.ts. Authored data lives in src/ and
// aliases.json; nothing here is hand-maintained per component.
import { aliasTable, components, entries, schemas } from "../generated/runtimeRegistry"

export type ProtocolPropSpec = { values?: string[]; narrowed?: string; required?: boolean }
export type Fallback = { type: string; props?: Record<string, unknown>; message: string }
export type Entry = {
  type: string
  aliasOf: string | null
  kind: "component" | "structural"
  element?: string
  protocolProps?: Record<string, ProtocolPropSpec>
  slots?: string[]
  events?: Record<string, { handler: string }>
  fallback?: Fallback
  nesting?: { parents?: string[]; children?: string[] }
  capabilities?: string[]
  /** Registered but not production-ready (DEC-097): the scaffolded components it waits on. */
  provisional?: { waitingOn: string[]; reason: string }
}

export const isProvisional = (e: Entry): boolean => e.provisional !== undefined
export type JsonSchema = Record<string, unknown>
export type Registry = {
  entries: Record<string, Entry>
  schemas: Record<string, JsonSchema>
  aliases: Record<string, string>
  /** Every Atlas component with facts (generated). fullCatalog reads it. */
  components: string[]
  /** Agent-visible names outside the catalog; set only by restrict(). The validator reports them as out-of-catalog. */
  withheld?: string[]
}

export const registry: Registry = {
  entries: entries as unknown as Record<string, Entry>,
  schemas: schemas as unknown as Record<string, JsonSchema>,
  aliases: aliasTable,
  components,
}
