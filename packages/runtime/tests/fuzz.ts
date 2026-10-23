// Schema-derived malformed payloads: start from the valid fixture and mutate it with values the protocol schemas
// forbid (wrong types, unknown types and props, markup, nesting the registry rejects, deep and huge values).
export const SEED = Number(process.env.FUZZ_SEED ?? 0xa71a5)

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TYPES = ["Form", "Field", "TextField", "Button", "Alert", "UnknownChart", "Dialog", "Modal", "", "form"]
const NASTY: unknown[] = [
  null, undefined, 0, -1, Number.NaN, true, "", "<div>x</div>", "color: red", "{alert(1)}", "javascript:alert(1)",
  "x".repeat(10_000), [], {}, [[[]]], { type: 42 }, { type: "UnknownChart" }, { type: "Form" },
  { type: "Button", slots: { children: [{ type: "Form" }] } }, { type: "TextField", props: {} },
  { type: "Field", slots: { children: [{ type: "Alert" }] } },
]
const KEYS = ["type", "props", "slots", "children", "variant", "name", "onClick", "style", "dangerouslySetInnerHTML", "__proto__"]

export function mutate(value: unknown, rand: () => number, depth = 0): unknown {
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)]
  if (rand() < 0.12 || depth > 8) return structuredClone(pick(NASTY))
  if (Array.isArray(value)) {
    const out = value.map((v) => mutate(v, rand, depth + 1))
    if (rand() < 0.2) out.push(mutate(pick(NASTY), rand, depth + 1))
    if (rand() < 0.1 && out.length) out.splice(Math.floor(rand() * out.length), 1)
    return out
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      if (rand() < 0.08) continue
      out[k] = k === "type" && rand() < 0.3 ? pick(TYPES) : mutate(v, rand, depth + 1)
    }
    if (rand() < 0.15) Object.defineProperty(out, pick(KEYS), { value: structuredClone(pick(NASTY)), enumerable: true, configurable: true, writable: true })
    return out
  }
  return rand() < 0.1 ? pick(NASTY) : value
}
