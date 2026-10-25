// Pure helpers for the protocol bench; p95 matches tests/runtime/runtime-demo.spec.ts (nearest rank).
export const p95 = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.max(0, Math.ceil(xs.length * 0.95) - 1)]
export const reduction = (filtered: number, full: number) => 1 - filtered / full
