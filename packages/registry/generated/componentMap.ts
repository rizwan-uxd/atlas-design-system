// GENERATED — do not hand-edit. registry-build from packages/registry/src and aliases.json; run npm run registry:build.
// Registered type → the Atlas component that renders it, through deep imports: there is no barrel,
// and this map is provably complete because it is generated from the registry (roadmap M4).
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Field } from "@atlas/ui-web/compositions/Field/Field"
import { Input } from "@atlas/ui-web/primitives/Input/Input"

export const componentMap = {
  Alert,
  Button,
  Field,
  TextField: Input,
} as const

/** Structural types are composed by the runtime from registered components, not rendered by one. */
export const structuralTypes = ["Form"] as const

export type RegisteredType = keyof typeof componentMap | (typeof structuralTypes)[number]
