// GENERATED — do not hand-edit. registry-build from packages/registry/src, generated/schemas and aliases.json; run npm run registry:build.
// Every registered entry and its protocol schema, bundled so the runtime reads the registry without fs (roadmap M4).
import aliases from "../aliases.json"
import AlertEntry from "../src/Alert.registry.json"
import AlertSchema from "./schemas/Alert.schema.json"
import ButtonEntry from "../src/Button.registry.json"
import ButtonSchema from "./schemas/Button.schema.json"
import FieldEntry from "../src/Field.registry.json"
import FieldSchema from "./schemas/Field.schema.json"
import FormEntry from "../src/Form.registry.json"
import FormSchema from "./schemas/Form.schema.json"
import TextFieldEntry from "../src/TextField.registry.json"
import TextFieldSchema from "./schemas/TextField.schema.json"

export const entries = {
  Alert: AlertEntry,
  Button: ButtonEntry,
  Field: FieldEntry,
  Form: FormEntry,
  TextField: TextFieldEntry,
}

export const schemas = {
  Alert: AlertSchema,
  Button: ButtonSchema,
  Field: FieldSchema,
  Form: FormSchema,
  TextField: TextFieldSchema,
}

export const aliasTable: Record<string, string> = aliases.aliases
