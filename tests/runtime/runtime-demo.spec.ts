// M4 runtime metrics on app/runtime-demo. Test titles are exact metric names from metrics.manifest.json: they are
// top-level (no describe), because metrics-report reads suites[].specs[].title.
import path from "node:path"
import { expect, test, type Page } from "@playwright/test"

type Wire = { op?: string; kind?: string; seq: number; ack?: number; path?: string }
const wire = (page: Page) => page.evaluate(() => window.__atlasRuntime!.log()) as Promise<Wire[]>
const p95 = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.max(0, Math.ceil(xs.length * 0.95) - 1)]

test.beforeEach(async ({ page }) => {
  await page.goto("/runtime-demo")
  await page.waitForFunction(() => window.__atlasRuntime !== undefined)
})

test("runtime-demo > every node carries a registered data-atlas-type", async ({ page }) => {
  const types = await page.evaluate(() => window.__atlasRuntime!.types)
  const nodes = page.locator("[data-atlas-runtime] [data-atlas-node]")
  await expect(nodes).toHaveCount(6)
  for (const t of await nodes.evaluateAll((ns) => ns.map((n) => n.getAttribute("data-atlas-type")))) expect(types).toContain(t)
  await expect(page.locator("[data-atlas-runtime] [style]")).toHaveCount(0)
  await page.addScriptTag({ path: path.resolve("node_modules/axe-core/axe.min.js") })
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run(n: Element): Promise<{ violations: Array<{ id: string; nodes: unknown[] }> }> } }).axe
    return (await axe.run(document.querySelector("[data-atlas-runtime]")!)).violations.map((v) => `${v.id} (${v.nodes.length})`)
  })
  expect(violations).toEqual([])
})

test("runtime-demo > interaction sends a state delta, not a re-render", async ({ page }) => {
  await page.getByLabel(/Work email/).fill("nope")
  await page.getByLabel(/Organisation/).fill("Acme")
  await page.getByRole("button", { name: "Request access" }).click()
  const error = page.getByText("Enter a valid work email")
  await expect(error).toBeVisible()
  const ops = (await wire(page)).filter((m) => m.op)
  expect(ops.filter((m) => m.op === "render")).toHaveLength(1)
  expect(ops).toContainEqual(expect.objectContaining({ op: "state", path: "form.email" }))
  const describedBy = (await page.getByLabel(/Work email/).getAttribute("aria-describedby")) ?? ""
  const errorId = await error.evaluate((n) => n.closest("[id]")?.id ?? "")
  expect(errorId).not.toBe("")
  expect(describedBy.split(" ")).toContain(errorId)
  await expect(page.locator(`[id="${errorId}"]`)).toHaveAttribute("role", "alert")
})

test("runtime-demo > 50 rapid submits keep strictly increasing sequence", async ({ page }) => {
  await page.evaluate(() => { const f = document.querySelector("form")!; for (let i = 0; i < 50; i++) f.requestSubmit() })
  await page.waitForFunction(() => (window.__atlasRuntime!.log() as Array<{ op?: string }>).filter((m) => m.op === "ack").length === 50)
  const log = await wire(page)
  const events = log.filter((m) => m.kind === "event").map((m) => m.seq)
  expect(events).toEqual(Array.from({ length: 50 }, (_, i) => i + 1))
  const server = log.filter((m) => m.op).map((m) => m.seq)
  expect(server.every((s, i) => i === 0 || s > server[i - 1])).toBe(true)
  expect(log.filter((m) => m.op === "ack").map((m) => m.ack)).toEqual(events)
})

test("runtime-demo > patch updates only the addressed subtree", async ({ page }) => {
  await page.locator('[data-atlas-type="Field"]').evaluateAll((ns) => ns.forEach((n, i) => ((n as unknown as { __mark: number }).__mark = i + 1)))
  await page.evaluate(() => { window.__atlasRuntime!.renders.length = 0 })
  await page.evaluate(() => window.__atlasRuntime!.inject({ op: "patch", at: "/slots/children/3", node: { type: "Alert", props: { variant: "info" }, slots: { title: ["Patched"] } } }))
  await expect(page.getByText("Patched")).toBeVisible()
  const marks = await page.locator('[data-atlas-type="Field"]').evaluateAll((ns) => ns.map((n) => (n as unknown as { __mark?: number }).__mark))
  expect(marks).toEqual([1, 2])
  const rendered = [...new Set(await page.evaluate(() => window.__atlasRuntime!.renders))]
  expect(rendered.sort()).toEqual(["", "/slots/children/3"])
})

test("runtime-demo > state ack p95", async ({ page }, info) => {
  for (let i = 0; i < 50; i++) {
    await page.evaluate(() => document.querySelector("form")!.requestSubmit())
    await page.waitForFunction((n) => performance.getEntriesByName("atlas:ack").length >= n, i + 1)
  }
  const ms = await page.evaluate(() => performance.getEntriesByName("atlas:ack").map((e) => e.duration))
  info.annotations.push({ type: "ack p95 ms", description: p95(ms).toFixed(1) })
  console.info(`runtime-demo ack p95 ${p95(ms).toFixed(1)} ms over ${ms.length}`)
  expect(p95(ms)).toBeLessThan(600) // gate = 2 × the 300 ms north-star target (roadmap M4)
})

test("runtime-demo > fallback render p95", async ({ page }, info) => {
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => window.__atlasRuntime!.inject({ op: "patch", at: "/slots/children/3", node: { type: "UnknownChart" } }))
    await page.waitForFunction((n) => performance.getEntriesByName("atlas:fallback").length >= n, i + 1)
  }
  await expect(page.getByText("This content is unavailable").first()).toBeVisible()
  await expect(page.locator('[data-atlas-type="Field"]')).toHaveCount(2)
  const ms = await page.evaluate(() => performance.getEntriesByName("atlas:fallback").map((e) => e.duration))
  info.annotations.push({ type: "fallback p95 ms", description: p95(ms).toFixed(1) })
  console.info(`runtime-demo fallback p95 ${p95(ms).toFixed(1)} ms over ${ms.length}`)
  expect(p95(ms)).toBeLessThan(200) // gate = 2 × the 100 ms north-star target
})
