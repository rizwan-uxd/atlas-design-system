/**
 * Atlas motion foundation — test suite
 *
 * Coverage:
 *   1. Parsers — durations and cubic-bezier strings
 *   2. Token parity — defaultMotionTokens equals the values in atlas.tokens.css
 *   3. Resolution — resolveMotionTokens reads live CSS variables
 *   4. Presets — built from tokens, no literals
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, it, expect } from "vitest"
import {
  createMotionPresets,
  defaultMotionTokens,
  parseBezier,
  parseDuration,
  resolveMotionTokens,
} from "@atlas/ui-web/motion"

const css = readFileSync(resolve(__dirname, "../../tokens/atlas.tokens.css"), "utf8")
const cssValue = (name: string) => new RegExp(`${name}:\\s*([^;]+);`).exec(css)?.[1].trim() ?? ""

describe("motion — parsers", () => {
  it("parses ms and s durations", () => {
    expect(parseDuration("120ms", 9)).toBeCloseTo(0.12)
    expect(parseDuration("1s", 9)).toBe(1)
    expect(parseDuration(" 0ms ", 9)).toBe(0)
  })

  it("falls back on anything that is not a duration", () => {
    expect(parseDuration("", 9)).toBe(9)
    expect(parseDuration("fast", 9)).toBe(9)
  })

  it("parses cubic-bezier strings", () => {
    expect(parseBezier("cubic-bezier(0.2, 0, 0, 1)", [1, 1, 1, 1])).toEqual([0.2, 0, 0, 1])
  })

  it("falls back on malformed beziers", () => {
    expect(parseBezier("ease", [1, 1, 1, 1])).toEqual([1, 1, 1, 1])
    expect(parseBezier("cubic-bezier(1, 2)", [1, 1, 1, 1])).toEqual([1, 1, 1, 1])
  })
})

describe("motion — token parity with atlas.tokens.css", () => {
  const { duration, easing, pulseOpacity } = defaultMotionTokens

  it.each(Object.keys(duration))("duration %s", (name) => {
    const fromCss = parseDuration(cssValue(`--atlas-duration-${name}`), NaN)
    expect(duration[name as keyof typeof duration]).toBeCloseTo(fromCss)
  })

  it.each(Object.keys(easing))("easing %s", (name) => {
    const fromCss = parseBezier(cssValue(`--atlas-easing-${name}`), [NaN, NaN, NaN, NaN])
    expect(easing[name as keyof typeof easing]).toEqual(fromCss)
  })

  it("pulse opacity", () => {
    expect(pulseOpacity).toBe(Number.parseFloat(cssValue("--atlas-opacity-pulse")))
  })
})

describe("motion — resolveMotionTokens", () => {
  it("reads live CSS variables", () => {
    const el = document.createElement("div")
    el.style.setProperty("--atlas-duration-fast", "500ms")
    el.style.setProperty("--atlas-easing-standard", "cubic-bezier(0.1, 0.2, 0.3, 0.4)")
    document.body.appendChild(el)
    const tokens = resolveMotionTokens(el)
    expect(tokens.duration.fast).toBeCloseTo(0.5)
    expect(tokens.easing.standard).toEqual([0.1, 0.2, 0.3, 0.4])
    el.remove()
  })

  it("keeps defaults for variables that are not set", () => {
    const tokens = resolveMotionTokens(document.createElement("div"))
    expect(tokens).toEqual(defaultMotionTokens)
  })
})

describe("motion — presets", () => {
  it("derive durations and easings from the tokens", () => {
    const presets = createMotionPresets(defaultMotionTokens)
    expect(presets.quick.duration).toBe(defaultMotionTokens.duration.fast)
    expect(presets.enter.ease).toEqual([...defaultMotionTokens.easing.standard])
    expect(presets.emphasis.ease).toEqual([...defaultMotionTokens.easing.emphasized])
    expect(presets.exit.ease).toEqual([...defaultMotionTokens.easing.exit])
    expect(presets.spin.duration).toBe(defaultMotionTokens.duration.spin)
    expect(presets.spin.repeat).toBe(Infinity)
    expect(presets.pulse.duration).toBe(defaultMotionTokens.duration.pulse)
  })

  it("follow a changed token", () => {
    const presets = createMotionPresets({
      ...defaultMotionTokens,
      duration: { ...defaultMotionTokens.duration, fast: 0.5 },
    })
    expect(presets.quick.duration).toBe(0.5)
  })
})
