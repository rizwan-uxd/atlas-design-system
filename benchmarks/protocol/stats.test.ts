import { describe, expect, it } from "vitest"
import { median, p95, reduction } from "./stats"

describe("bench/protocol stats >", () => {
  it("p95 is the nearest-rank 95th percentile (same rule as runtime-demo.spec.ts)", () => {
    expect(p95([5, 1, 3, 2, 4])).toBe(5)
    expect(p95(Array.from({ length: 20 }, (_, i) => i + 1))).toBe(19)
  })
  it("median is the lower middle value, 0 for none", () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2)
    expect(median([])).toBe(0)
  })
  it("reduction is 1 - filtered / full", () => expect(reduction(250, 1000)).toBe(0.75))
})
