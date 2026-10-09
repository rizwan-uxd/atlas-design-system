/**
 * Atlas AnimatedIcon — toggle trigger and the useanimations Media icons
 *
 * Coverage:
 *   1. Timeline — sampling, easing endpoints, source frame timing, the skip-forward end quirk
 *   2. Toggle — initial pose, controlled changes, reduced motion, disabled, unique mask ids
 *   3. Poses — pressed and unpressed states of the on/off and play/pause icons
 *   4. axe accessibility check per media icon
 */

import React from "react"
import { describe, it, expect } from "vitest"
import { act, render } from "@testing-library/react"
import { axe } from "jest-axe"
import { MotionConfig } from "motion/react"
import { MotionProvider } from "@atlas/ui-web/motion"
import { AnimatedIcon, animatedIconRegistry, type AnimatedIconName } from "@atlas/ui-web/animated-icons"
import { EASE, frameSeconds, sample } from "@atlas/ui-web/animated-icons/timeline"

const TOGGLE_ICONS: AnimatedIconName[] = [
  "volume", "mic", "mic-v2", "video", "video-v2", "play-pause-circle", "play-pause", "skip-back", "skip-forward",
]
const MEDIA_ICONS: AnimatedIconName[] = ["airplay", ...TOGGLE_ICONS]

const svgOf = (container: HTMLElement) => container.querySelector("svg") as SVGSVGElement
const part = (svg: SVGSVGElement, name: string) => svg.querySelector(`[data-track="${name}"]`) as SVGElement

const still = (ui: React.ReactElement) => (
  <MotionProvider>
    <MotionConfig reducedMotion="always">{ui}</MotionConfig>
  </MotionProvider>
)

describe("timeline", () => {
  it("holds the first and last value outside the keys", () => {
    const keys = [[10, 2, EASE.inOut], [20, 8]] as const
    expect(sample(keys, 0)).toBe(2)
    expect(sample(keys, 99)).toBe(8)
  })

  it("eases between keys and reaches both ends", () => {
    const keys = [[0, 0, EASE.inOut], [10, 1]] as const
    expect(sample(keys, 5)).toBeCloseTo(0.5, 2)
    expect(sample(keys, 2)).toBeLessThan(0.2)
  })

  it("plays 0 to frames − 1 at the 30 fps source rate", () => {
    expect(frameSeconds(30)).toBeCloseTo(29 / 30)
    expect(frameSeconds(8)).toBeCloseTo(7 / 30)
  })

  it("keeps the source quirk: skip-forward ends smaller than skip-back", () => {
    const render = (name: AnimatedIconName) => {
      const { container } = render_(name)
      const toggle = animatedIconRegistry[name].toggle!
      toggle.render(svgOf(container), toggle.frames - 1)
      return part(svgOf(container), "tri-b").getAttribute("transform")!
    }
    const scaleOf = (t: string) => Number(/scale\(([\d.]+)/.exec(t)![1])
    expect(scaleOf(render("skip-forward"))).toBeCloseTo(0.957, 2)
    expect(scaleOf(render("skip-back"))).toBeCloseTo(0.999, 2)
  })
})

function render_(name: AnimatedIconName, props: Partial<React.ComponentProps<typeof AnimatedIcon>> = {}) {
  return render(still(<AnimatedIcon name={name} trigger="toggle" {...props} />))
}

describe("AnimatedIcon — toggle", () => {
  it.each(TOGGLE_ICONS)("%s defines a toggle timeline", (name) => {
    expect(animatedIconRegistry[name].toggle?.frames).toBeGreaterThan(1)
  })

  it("starts in the pressed pose without animating when pressed on mount", () => {
    const { container } = render_("mic", { pressed: true })
    const slash = part(svgOf(container), "slash")
    expect(slash.style.visibility).toBe("visible")
    expect(Number.parseFloat(slash.style.strokeDasharray)).toBeGreaterThan(0.99)
    expect(svgOf(container)).toHaveAttribute("data-pressed", "true")
  })

  it("starts unpressed with no slash", () => {
    const { container } = render_("mic")
    expect(part(svgOf(container), "slash").style.visibility).toBe("hidden")
  })

  it("jumps between poses under reduced motion and back again", () => {
    const { container, rerender } = render_("volume")
    rerender(still(<AnimatedIcon name="volume" trigger="toggle" pressed />))
    expect(part(svgOf(container), "slash").style.visibility).toBe("visible")
    expect(part(svgOf(container), "wave-outer").style.visibility).toBe("hidden")
    rerender(still(<AnimatedIcon name="volume" trigger="toggle" pressed={false} />))
    expect(part(svgOf(container), "slash").style.visibility).toBe("hidden")
    expect(part(svgOf(container), "wave-outer").style.visibility).toBe("visible")
  })

  it("jumps instantly when disabled", () => {
    const { container, rerender } = render_("video", { disabled: true })
    rerender(still(<AnimatedIcon name="video" trigger="toggle" disabled pressed />))
    expect(part(svgOf(container), "slash").style.visibility).toBe("visible")
  })

  it("morphs play-pause between a pause and a play triangle", () => {
    const { container, rerender } = render_("play-pause")
    const left = part(svgOf(container), "bar-left")
    const pause = left.getAttribute("d")
    rerender(still(<AnimatedIcon name="play-pause" trigger="toggle" pressed />))
    expect(left.getAttribute("d")).not.toBe(pause)
    expect(Number(part(svgOf(container), "bar-right").style.opacity)).toBe(0)
  })

  it("holds the last frame of a momentary icon, then restarts from frame 0 on the next change", () => {
    expect(animatedIconRegistry["skip-forward"].toggle?.momentary).toBe(true)
    const { container, rerender } = render_("skip-forward")
    const b = part(svgOf(container), "tri-b")
    expect(b.style.display).toBe("none")
    rerender(still(<AnimatedIcon name="skip-forward" trigger="toggle" pressed />))
    expect(b.style.display).toBe("")
    expect(part(svgOf(container), "tri-a").style.display).toBe("none")
    rerender(still(<AnimatedIcon name="skip-forward" trigger="toggle" pressed={false} />))
    // Reduced motion: jumps to the end pose again. It does not rewind to the start.
    expect(b.style.display).toBe("")
  })

  it("gives every instance its own mask id", () => {
    const { container } = render(
      still(
        <>
          <AnimatedIcon name="mic" trigger="toggle" />
          <AnimatedIcon name="mic" trigger="toggle" />
        </>,
      ),
    )
    const ids = [...container.querySelectorAll("mask")].map((m) => m.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    container.querySelectorAll("svg").forEach((svg, i) => {
      expect(svg.querySelector("g[mask]")?.getAttribute("mask")).toBe(`url(#${ids[i]})`)
    })
  })

  it("ignores pressed unless the trigger is toggle", () => {
    const { container } = render(still(<AnimatedIcon name="mic" pressed />))
    expect(part(svgOf(container), "slash").style.visibility).toBe("hidden")
    expect(svgOf(container)).not.toHaveAttribute("data-pressed")
  })

  it("keeps airplay as a loop with no toggle", () => {
    expect(animatedIconRegistry.airplay.toggle).toBeUndefined()
    expect(animatedIconRegistry.airplay.loop).toBeTypeOf("function")
  })
})

describe("AnimatedIcon — media icons a11y", () => {
  it.each(MEDIA_ICONS)("%s has no axe violations, decorative and labelled", async (name) => {
    const { container } = render_(name)
    expect(await axe(container)).toHaveNoViolations()
    const labelled = render(still(<AnimatedIcon name={name} label={name} />))
    expect(await axe(labelled.container)).toHaveNoViolations()
  })
})

const wait = (ms: number) => act(async () => { await new Promise((r) => setTimeout(r, ms)) })

describe("AnimatedIcon — toggle playback", () => {
  const skip = (pressed: boolean) => (
    <MotionProvider>
      <AnimatedIcon name="skip-forward" trigger="toggle" pressed={pressed} />
    </MotionProvider>
  )

  it("restarts a momentary icon from frame 0 on every change, even mid-flight", async () => {
    const { container, rerender } = render(skip(false))
    const svg = svgOf(container)
    expect(part(svg, "tri-b").style.display).toBe("none")
    rerender(skip(true))
    await wait(1450)
    expect(part(svg, "tri-b").style.display).toBe("")
    expect(part(svg, "tri-a").style.display).toBe("none")
    rerender(skip(false))
    await wait(40)
    expect(part(svg, "tri-b").style.display).toBe("none")
    expect(part(svg, "tri-a").style.display).toBe("")
  })

  const dash = (svg: SVGSVGElement) => Number.parseFloat(part(svg, "slash").style.strokeDasharray || "0")
  const ui = (pressed: boolean) => (
    <MotionProvider>
      <AnimatedIcon name="video" trigger="toggle" pressed={pressed} />
    </MotionProvider>
  )

  it("plays forward, reverses from the current frame mid-flight, and settles", async () => {
    const { container, rerender } = render(ui(false))
    const svg = svgOf(container)
    expect(dash(svg)).toBe(0)

    rerender(ui(true))
    await wait(200)
    const mid = dash(svg)
    expect(mid).toBeGreaterThan(0.05)
    expect(mid).toBeLessThan(0.95)

    rerender(ui(false))
    await wait(60)
    const back = dash(svg)
    expect(back).toBeLessThan(mid)
    expect(back).toBeGreaterThan(0)

    await wait(900)
    expect(part(svg, "slash").style.visibility).toBe("hidden")

    rerender(ui(true))
    await wait(900)
    expect(dash(svg)).toBeGreaterThan(0.99)
  })
})
