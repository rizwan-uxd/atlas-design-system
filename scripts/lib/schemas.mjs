/**
 * schemas — validate every JSON input before anything reads it (M2).
 *
 * WHY THIS EXISTS. atlas-verify and atlas-sync used to JSON.parse their inputs and optional-chain into
 * them, so a renamed field silently DISABLED a check while it went on printing PASS. The schemas in
 * packages/governance/schemas/ are plain JSON Schema (2020-12) data, so the M4 runtime validator can
 * ship them to a browser unchanged; ajv compiles them here.
 *
 * Coverage is a ratchet: every *.json under a watched directory must match an INPUTS rule. A new JSON
 * file with no schema fails rather than going unvalidated.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Ajv2020 from "ajv/dist/2020.js"

export const SCHEMA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../packages/governance/schemas")
const BASE = "https://atlas.design-system/schemas/"

/**
 * Each repo input → the schema that describes it. `required` inputs fail when absent; `min` is the
 * fewest files a glob may match (an empty atlas/metadata is not a clean snapshot, it is no snapshot).
 */
export const INPUTS = [
  { glob: "atlas/metadata/*.json", schema: "metadata.schema.json", min: 1, nameMatchesFile: true },
  { glob: "atlas/index.json", schema: "index.schema.json", required: true },
  { glob: "atlas/tokens.json", schema: "tokens.schema.json", required: true },
  ...["status", "discrepancies", "decisions", "candidates", "deprecations", "ownership"].map((n) =>
    ({ glob: `atlas/state/${n}.json`, schema: `state.schema.json#/$defs/${n}`, required: true })),
  { glob: "packages/governance/deprecations.json", schema: "governance.schema.json#/$defs/deprecations", required: true },
  { glob: "packages/governance/ownership.json", schema: "governance.schema.json#/$defs/ownership", required: true },
  { glob: "packages/governance/private-vars.allow.json", schema: "governance.schema.json#/$defs/privateVarsAllow", required: true },
  { glob: "packages/registry/figma-axis-map.json", schema: "governance.schema.json#/$defs/figmaAxisMap", required: true },
  { glob: "packages/registry/aliases.json", schema: "registry.schema.json#/$defs/aliases", required: true },
  { glob: "packages/registry/contract-props.json", schema: "registry.schema.json#/$defs/contractProps", required: true },
  { glob: "packages/registry/src/*.registry.json", schema: "registry.schema.json#/$defs/entry", min: 1, typeMatchesFile: true },
  { glob: "packages/registry/generated/*.facts.json", schema: "registry.schema.json#/$defs/facts", nameMatchesFile: true },
  { glob: "packages/registry/generated/elements.json", schema: "registry.schema.json#/$defs/elements" },
  { glob: "packages/runtime/tests/fixtures/*.json", schema: "protocol.schema.json#/$defs/fixture", min: 1 },
]
/**
 * Directories whose every *.json must be covered by an INPUTS rule. Schemas themselves are exempt:
 * the authored ones here, and the protocol schemas registry-build generates, which it compiles with
 * ajv in strict mode (that validates them against the 2020-12 meta-schema) and diff-gates.
 */
export const WATCHED = ["atlas", "packages/governance", "packages/registry", "packages/runtime"]
const EXEMPT = /^packages\/(governance\/schemas|registry\/generated\/schemas)\/|^packages\/runtime\/package\.json$/

let ajv
/** One compiled validator per schema id, sharing $refs through common.schema.json. */
export function validator(schema) {
  if (!ajv) {
    ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true })
    for (const f of fs.readdirSync(SCHEMA_DIR)) if (f.endsWith(".schema.json")) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, f), "utf8")))
  }
  const v = ajv.getSchema(BASE + schema)
  if (!v) throw new Error(`schemas: no schema ${schema} in ${SCHEMA_DIR}`)
  return v
}

/** `/path/to/field must be string` — the JSON pointer first, so a message names the exact field. */
const describe = (e) => `${e.instancePath || "/"} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ""}`

/** Validate parsed data against a schema id. Returns a list of messages; empty means valid. */
export function validate(schema, data) {
  const v = validator(schema)
  return v(data) ? [] : v.errors.map(describe)
}

const globToRe = (g) => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*") + "$")

function walk(root, rel, out) {
  const abs = path.join(root, rel)
  if (!fs.existsSync(abs)) return out
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const r = path.posix.join(rel, e.name)
    if (e.isDirectory()) walk(root, r, out)
    else if (e.name.endsWith(".json")) out.push(r)
  }
  return out
}

/**
 * Read and validate every JSON input under `root`.
 * @returns {{ files: {file, schema, ok, errors, data}[], problems: string[], valid: (file) => object|undefined }}
 * `problems` holds what is not tied to one file's content: a missing required input, too few matches,
 * a JSON file no rule covers. `valid(file)` returns parsed data only for a file that passed.
 */
export function loadInputs(root) {
  const all = WATCHED.flatMap((d) => walk(root, d, [])).filter((f) => !EXEMPT.test(f)).sort()
  const files = [], problems = [], covered = new Set()

  for (const input of INPUTS) {
    const re = globToRe(input.glob)
    const matches = all.filter((f) => re.test(f))
    matches.forEach((f) => covered.add(f))
    if (input.required && matches.length === 0) problems.push(`${input.glob} is missing`)
    if (input.min && matches.length < input.min) problems.push(`${input.glob} matched ${matches.length} file(s), expected at least ${input.min}`)

    for (const file of matches) {
      let data, errors
      try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) }
      catch (e) { errors = [`is not valid JSON: ${e.message}`] }
      // a schema that fails to compile throws out of validate(): that is a broken schema, not bad data,
      // and it must stop the run rather than be reported against the input
      if (!errors) errors = validate(input.schema, data)
      const stem = path.basename(file).split(".")[0]
      if (!errors.length && input.nameMatchesFile && data.name !== stem)
        errors.push(`/name is ${JSON.stringify(data.name)} but the file is ${path.basename(file)}`)
      if (!errors.length && input.typeMatchesFile && data.type !== stem)
        errors.push(`/type is ${JSON.stringify(data.type)} but the file is ${path.basename(file)}`)
      files.push({ file, schema: input.schema, ok: errors.length === 0, errors, data: errors.length ? undefined : data })
    }
  }
  for (const f of all) if (!covered.has(f)) problems.push(`${f} has no schema — add a rule to INPUTS in scripts/lib/schemas.mjs`)

  const byFile = new Map(files.map((f) => [f.file, f]))
  return { files, problems, valid: (file) => byFile.get(file)?.data }
}
