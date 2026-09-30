"use client"

import { useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { AnimatedIcon } from "@atlas/ui-web/animated-icons"
import { usePrefersReducedMotion } from "@atlas/ui-web/motion"
import type { AnimatedIconProps } from "@atlas/ui-web/animated-icons"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Badge, type BadgeVariant } from "@atlas/ui-web/primitives/Badge/Badge"
import { Avatar, AvatarGroup } from "@atlas/ui-web/primitives/Avatar/Avatar"
import { CodeBlock } from "@atlas/ui-web/compositions/CodeBlock/CodeBlock"
import { ScrollProgress } from "@atlas/ui-web/primitives/ScrollProgress/ScrollProgress"

/* Motion Canvas — a study board, not production UI.
   Entries record what to adopt, adapt or reject before anything enters the library.
   Icons marked "not built" are study entries only; none are authored here. */

type Decision = "adopt" | "adapt" | "reject" | "undecided"
type Status = "built" | "not built" | "n/a"

interface Entry {
  name: string
  useCase: string
  /** What state the user learns from this motion. Entries that cannot answer are rejected. */
  stateExplained: string
  trigger: string
  motion: string
  a11y: string
  decision: Decision
  status: Status
  wrapper?: string
  preview?: (replay: number) => ReactNode
}

interface Section {
  id: string
  title: string
  blurb: string
  entries: Entry[]
}

const decisionVariant: Record<Decision, BadgeVariant> = {
  adopt: "success",
  adapt: "warning",
  reject: "danger",
  undecided: "neutral",
}

/** Icon preview that remounts on replay so `appear` / `success` one-shots can be watched again. */
const icon = (props: AnimatedIconProps) =>
  function IconPreview(replay: number) {
    return <AnimatedIcon key={replay} size="lg" {...props} />
  }

/** Scrollable panel with a container-scope ScrollProgress along its top edge. */
function ScrollProgressDemo() {
  const panel = useRef<HTMLDivElement>(null)
  return (
    <div style={{ position: "relative", inlineSize: "100%", maxInlineSize: "24rem" }}>
      <ScrollProgress scope="container" target={panel} aria-label="Reading progress" />
      <div
        ref={panel}
        tabIndex={0}
        aria-label="Scrollable article"
        style={{
          blockSize: "8rem",
          overflowY: "auto",
          padding: "var(--atlas-spacing-3)",
          fontSize: "var(--atlas-font-size-sm)",
          color: "var(--atlas-foreground-muted)",
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} style={{ margin: "0 0 var(--atlas-spacing-3)" }}>
            Paragraph {i + 1}. Scroll this panel and watch the bar above follow it.
          </p>
        ))}
      </div>
    </div>
  )
}

const sections: Section[] = [
  {
    id: "icons",
    title: "Animated Icons",
    blurb: "Installed registry entries, plus study-only entries for icons that do not exist yet.",
    entries: [
      {
        name: "check",
        stateExplained: "Saved / completed",
        useCase: "Save / success confirmation",
        trigger: "success (after form submit)",
        motion: "stroke draw + scale in",
        a11y: "Pair with visible text or a live region; the icon alone must not carry the message.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="check" tone="success" state="success" />',
        preview: icon({ name: "check", tone: "success", state: "success" }),
      },
      {
        name: "x",
        stateExplained: "Failed, or dismissed",
        useCase: "Error / dismiss",
        trigger: "error, press",
        motion: "shake (error), rotate-in (press)",
        a11y: "Dismiss usage needs a label (aria-label on the button). Shake honours reduced motion.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="x" tone="danger" state="error" />',
        preview: icon({ name: "x", tone: "danger", state: "error" }),
      },
      {
        name: "upload",
        stateExplained: "Direction of transfer (becomes real state only when tied to progress)",
        useCase: "Upload action",
        trigger: "hover, press",
        motion: "arrow slide up",
        a11y: "Decorative inside a labelled button; progress must be exposed separately.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="upload" trigger="hover" />',
        preview: icon({ name: "upload", trigger: "hover" }),
      },
      {
        name: "download",
        stateExplained: "Direction of transfer (becomes real state only when tied to progress)",
        useCase: "Download action",
        trigger: "hover, press",
        motion: "arrow slide down",
        a11y: "Decorative inside a labelled button; announce completion in text.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="download" trigger="hover" />',
        preview: icon({ name: "download", trigger: "hover" }),
      },
      {
        name: "search",
        stateExplained: "Search field is active / focused",
        useCase: "Search and filters",
        trigger: "hover, focus",
        motion: "lens nudge",
        a11y: "Search input keeps its own label; icon is decorative.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="search" trigger="focus" />',
        preview: icon({ name: "search", trigger: "hover" }),
      },
      {
        name: "refresh",
        stateExplained: "Sync in progress",
        useCase: "Refresh / sync",
        trigger: "press, loading",
        motion: "rotate (loops only while syncing)",
        a11y: "Set aria-busy on the region being refreshed; never loop when idle.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="refresh" state="loading" />',
        preview: icon({ name: "refresh", state: "loading" }),
      },
      {
        name: "bell",
        stateExplained: "A new notification has arrived",
        useCase: "Alerts and notifications",
        trigger: "appear, hover",
        motion: "swing",
        a11y: "Unread count needs text (badge with label), not motion.",
        decision: "adapt",
        status: "built",
        wrapper: '<AnimatedIcon name="bell" trigger="hover" />',
        preview: icon({ name: "bell", trigger: "hover" }),
      },
      {
        name: "settings",
        stateExplained: "None beyond a hover affordance; cannot answer the field on its own",
        useCase: "Sidebar / nav interaction",
        trigger: "hover",
        motion: "gear rotate",
        a11y: "Decorative next to a nav label.",
        decision: "reject",
        status: "built",
        wrapper: '<AnimatedIcon name="settings" trigger="hover" />',
        preview: icon({ name: "settings", trigger: "hover" }),
      },
      {
        name: "plug-connected",
        stateExplained: "Integration is now connected",
        useCase: "Connection / integration status",
        trigger: "success, hover",
        motion: "plug slide-in",
        a11y: "State (connected / disconnected) must also be written out.",
        decision: "adapt",
        status: "built",
        wrapper: '<AnimatedIcon name="plug-connected" tone="success" />',
        preview: icon({ name: "plug-connected", tone: "success", trigger: "hover" }),
      },
      {
        name: "chevron (expand / collapse)",
        stateExplained: "Expanded vs collapsed",
        useCase: "Expand / collapse",
        trigger: "press",
        motion: "rotate 180°",
        a11y: "aria-expanded on the trigger carries the state; rotation is a hint only.",
        decision: "undecided",
        status: "not built",
      },
      {
        name: "loading (spinner-style)",
        stateExplained: "Work in progress",
        useCase: "Loading states",
        trigger: "load",
        motion: "rotate / shimmer",
        a11y: "aria-busy plus visible text; Spinner primitive may already cover this.",
        decision: "undecided",
        status: "not built",
      },
      {
        name: "empty-state illustration icon",
        stateExplained: "None; the empty state is explained by text, motion adds nothing",
        useCase: "Empty states",
        trigger: "appear",
        motion: "fade + slight rise, once",
        a11y: "Explanatory text and a next action must be present without the motion.",
        decision: "reject",
        status: "not built",
      },
      {
        name: "panel-left-open (sidebar toggle)",
        stateExplained: "Sidebar open vs closed",
        useCase: "Sidebar / nav interaction",
        trigger: "hover, press",
        motion: "chevron nudge (hover), divider nudge (press), draw-in on appear",
        a11y: "aria-expanded and a label on the toggle button; the icon never carries the state alone.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="panel-left-open" trigger="hover" />',
        preview: icon({ name: "panel-left-open", trigger: "hover" }),
      },
      {
        name: "onboarding hint pulse",
        stateExplained: "Which control is new / unseen (first use only)",
        useCase: "Onboarding and first-use hints",
        trigger: "appear (first use only)",
        motion: "single pulse, then rest",
        a11y: "Dismissible; no infinite loop; hint text is readable without the pulse.",
        decision: "undecided",
        status: "not built",
      },
    ],
  },
  {
    id: "buttons",
    title: "Buttons",
    blurb: "Icons inside the real Button slots. Motion follows the parent's hover, focus and press.",
    entries: [
      {
        name: "Button + leading icon",
        stateExplained: "Action is about to run (hover / press acknowledgement)",
        useCase: "Primary action with a verb icon",
        trigger: "hover, focus, press (parent-driven)",
        motion: "icon plays its own hover animation",
        a11y: "Icon is decorative; the label names the action.",
        decision: "adopt",
        status: "built",
        wrapper: '<Button leadingIcon={<AnimatedIcon name="upload" trigger="hover" />}>Upload</Button>',
        preview: () => (
          <Button leadingIcon={<AnimatedIcon name="upload" trigger="hover" />}>Upload</Button>
        ),
      },
      {
        name: "Button + trailing icon",
        stateExplained: "Sync running (loading), press acknowledged",
        useCase: "Sync / refresh action",
        trigger: "press, loading",
        motion: "rotate while loading",
        a11y: "Button gets aria-busy while loading; label stays.",
        decision: "adopt",
        status: "built",
        wrapper: '<Button trailingIcon={<AnimatedIcon name="refresh" trigger="press" />}>Sync</Button>',
        preview: () => (
          <Button variant="secondary" trailingIcon={<AnimatedIcon name="refresh" trigger="press" />}>
            Sync
          </Button>
        ),
      },
      {
        name: "Icon-only Button",
        stateExplained: "Which toolbar control has focus / pointer",
        useCase: "Toolbar actions",
        trigger: "hover, focus",
        motion: "icon nudge",
        a11y: "aria-label is required; motion never replaces the label or tooltip.",
        decision: "adapt",
        status: "built",
        wrapper: '<Button iconOnly aria-label="Search"><AnimatedIcon name="search" trigger="hover" /></Button>',
        preview: () => (
          <Button iconOnly aria-label="Search" variant="secondary">
            <AnimatedIcon name="search" trigger="hover" />
          </Button>
        ),
      },
      {
        name: "Button press scale",
        stateExplained: "Pressed",
        useCase: "Tactile press feedback",
        trigger: "press",
        motion: "scale to ~0.98, token duration",
        a11y: "Disabled by reduced motion; state is still conveyed by colour and focus ring.",
        decision: "undecided",
        status: "n/a",
      },
    ],
  },
  {
    id: "feedback",
    title: "Feedback States",
    blurb: "Confirmation, error and loading. One-shot by default; loops only while work is in progress.",
    entries: [
      {
        name: "Save success",
        stateExplained: "Saved",
        useCase: "Inline save confirmation",
        trigger: "success",
        motion: "check stroke draw, then rest",
        a11y: "Announce “Saved” via role=status; do not rely on the icon.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="check" tone="success" state="success" />',
        preview: icon({ name: "check", tone: "success", state: "success" }),
      },
      {
        name: "Form error",
        stateExplained: "Submit failed",
        useCase: "Failed submit",
        trigger: "error",
        motion: "x shake, once",
        a11y: "Error text linked with aria-describedby; avoid shaking whole forms.",
        decision: "adapt",
        status: "built",
        wrapper: '<AnimatedIcon name="x" tone="danger" state="error" />',
        preview: icon({ name: "x", tone: "danger", state: "error" }),
      },
      {
        name: "Sync in progress",
        stateExplained: "Sync running",
        useCase: "Loading states",
        trigger: "load",
        motion: "refresh rotate loop",
        a11y: "aria-busy on the region; stop the loop when done.",
        decision: "adopt",
        status: "built",
        wrapper: '<AnimatedIcon name="refresh" state="loading" />',
        preview: icon({ name: "refresh", state: "loading" }),
      },
      {
        name: "Skeleton shimmer",
        stateExplained: "Content is loading",
        useCase: "Content placeholders",
        trigger: "load",
        motion: "shimmer",
        a11y: "Shimmer must be static under reduced motion; skeleton is aria-hidden.",
        decision: "adapt",
        status: "n/a",
      },
      {
        name: "Alert entrance",
        stateExplained: "A new message has arrived",
        useCase: "Alerts and notifications",
        trigger: "appear",
        motion: "fade + slide 8px",
        a11y: "role=alert / status carries the announcement, not the animation.",
        decision: "undecided",
        status: "n/a",
      },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    blurb: "Motion here must stay quiet; people use nav constantly.",
    entries: [
      {
        name: "Sidebar item icon",
        stateExplained: "Which nav item has pointer / focus",
        useCase: "Sidebar/nav interaction",
        trigger: "hover, focus",
        motion: "icon hover animation only",
        a11y: "Label always visible; active state by colour and aria-current.",
        decision: "adapt",
        status: "built",
        wrapper: '<AnimatedIcon name="settings" trigger="hover" />',
        preview: icon({ name: "settings", trigger: "hover" }),
      },
      {
        name: "Tabs indicator slide",
        stateExplained: "Which tab is now selected",
        useCase: "Tab switch",
        trigger: "press, arrow keys",
        motion: "slide underline",
        a11y: "Roving focus and aria-selected unchanged; indicator is visual only.",
        decision: "undecided",
        status: "n/a",
      },
      {
        name: "Accordion / expand",
        stateExplained: "Expanded vs collapsed",
        useCase: "Expand / collapse",
        trigger: "press",
        motion: "height + chevron rotate",
        a11y: "aria-expanded on trigger; content not hidden from AT mid-animation.",
        decision: "undecided",
        status: "not built",
      },
    ],
  },
  {
    id: "overlays",
    title: "Overlays",
    blurb: "Dialog, Drawer, Sheet, Tooltip. Entrance and exit only.",
    entries: [
      {
        name: "Dialog enter / exit",
        stateExplained: "A modal layer is now active / dismissed",
        useCase: "Modal",
        trigger: "open, close",
        motion: "fade + scale 0.98 → 1, emphasized / exit easing",
        a11y: "Focus trap and return focus are unaffected; exit must not delay focus return.",
        decision: "adapt",
        status: "n/a",
      },
      {
        name: "Sheet / Drawer slide",
        stateExplained: "A panel opened, and from which edge",
        useCase: "Side or bottom panels",
        trigger: "open, close",
        motion: "slide from edge",
        a11y: "Logical direction for RTL; reduced motion becomes a fade.",
        decision: "adapt",
        status: "n/a",
      },
      {
        name: "Tooltip fade",
        stateExplained: "None; fade timing does not convey state",
        useCase: "Hints on hover / focus",
        trigger: "hover, focus",
        motion: "fade, short",
        a11y: "Available on focus too; no motion-only reveal.",
        decision: "reject",
        status: "n/a",
      },
    ],
  },
  {
    id: "text",
    title: "Text / Number Motion",
    blurb: "Study only. Numbers people compare or copy should not animate.",
    entries: [
      {
        name: "Count-up stat",
        stateExplained: "None; value must be readable immediately, counting hides it",
        useCase: "Dashboard headline number",
        trigger: "appear (once)",
        motion: "number roll",
        a11y: "Final value in the DOM from the start; aria-label holds the end value.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Text swap on state change",
        stateExplained: "Save → Saved",
        useCase: "Button label: Save → Saved",
        trigger: "success",
        motion: "cross-fade",
        a11y: "Announce via live region; label width must not jump.",
        decision: "undecided",
        status: "n/a",
      },
    ],
  },
  {
    id: "animate-ui",
    title: "Animate UI Reference",
    blurb:
      "Visual reference only, from animate-ui.com docs (Icons, Primitives, Components). Nothing installed, no registry code copied. The Accessibility guide page could not be fetched, so its guidance is unverified here.",
    entries: [
      {
        name: "Primitive: Scroll Progress",
        useCase: "Reading position through a long page or scrollable panel",
        stateExplained: "How far through the content the reader is",
        trigger: "scroll",
        motion: "fill follows scroll position, eased with duration/fast",
        a11y: "Decorative by default; with an aria-label it is a progressbar updated in 5% steps. Reduced motion removes the ease.",
        decision: "adopt",
        status: "built",
        wrapper: '<ScrollProgress scope="container" target={ref} aria-label="Reading progress" />',
        preview: () => <ScrollProgressDemo />,
      },
      {
        name: "Primitive: Code Block (typing)",
        useCase: "Show a short snippet being written, e.g. onboarding or docs hero",
        stateExplained: "The code is being written, then complete",
        trigger: "mount, replay",
        motion: "characters revealed over duration (default 5000ms) with a blinking cursor",
        a11y: "Full code is exposed to assistive tech from the start; reduced motion shows it at once with no cursor.",
        decision: "adopt",
        status: "built",
        wrapper: '<CodeBlock variant="typing" filename="greet.ts" code={snippet} />',
        preview: (replay) => (
          <div style={{ inlineSize: "100%", maxInlineSize: "32rem" }}>
            <CodeBlock
              key={replay}
              variant="typing"
              filename="greet.ts"
              showLineNumbers
              duration={3000}
              code={'const greeting = "Hello, Atlas"\nfunction greet(name: string) {\n  return `${greeting}, ${name}`\n}'}
            />
          </div>
        ),
      },
      {
        name: "Primitive: Avatar Group (animated)",
        useCase: "Overlapping people stack; identify one member",
        stateExplained: "Which member is hovered or focused, and who they are",
        trigger: "hover, keyboard focus",
        motion: "member lifts forward out of the overlap; tooltip shows the name",
        a11y: "Members with alt are tab stops; tooltip describes on hover and focus. Reduced motion drops the lift, keeps the tooltip.",
        decision: "adopt",
        status: "built",
        wrapper: '<AvatarGroup variant="animated" aria-label="Project members">…</AvatarGroup>',
        preview: () => (
          <AvatarGroup variant="animated" size="lg" aria-label="Project members">
            <Avatar alt="Jane Cooper" initials="JC" />
            <Avatar alt="Dev Patel" initials="DP" />
            <Avatar alt="Sam Lee" initials="SL" />
            <Avatar alt="Aisha Khan" initials="AK" />
          </AvatarGroup>
        ),
      },
      {
        name: "Icon animations: path / path-loop",
        useCase: "Stroke draw for completion",
        stateExplained: "Completed (draw once); loop only while work runs",
        trigger: "success, load",
        motion: "pathLength 0→1, or 1→0→1",
        a11y: "Loop variant must stop when work ends; static end state under reduced motion.",
        decision: "adapt",
        status: "n/a",
      },
      {
        name: "Icon triggers: hover / tap / view",
        useCase: "When an icon plays",
        stateExplained: "Hover and tap acknowledge input; on-view explains nothing",
        trigger: "hover, tap, view",
        motion: "autoplay on entering viewport",
        a11y: "On-view autoplay has no state to explain; hover / tap already covered by trigger prop.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Effect: Highlight",
        useCase: "Moving active-item background",
        stateExplained: "Which item is active or hovered in a list or tab set",
        trigger: "hover, select",
        motion: "shared highlight slides between items",
        a11y: "Active item still needs aria-current / aria-selected; highlight is visual only.",
        decision: "adapt",
        status: "n/a",
      },
      {
        name: "Effect: Auto Height",
        useCase: "Container grows with content",
        stateExplained: "Content expanded or collapsed",
        trigger: "toggle",
        motion: "animated height",
        a11y: "Do not hide content from AT mid-animation; pair with aria-expanded.",
        decision: "adapt",
        status: "n/a",
      },
      {
        name: "Primitive: Switch / Toggle motion",
        useCase: "Animated thumb",
        stateExplained: "On vs off",
        trigger: "press",
        motion: "thumb slide",
        a11y: "Role=switch and aria-checked unchanged; already an Atlas primitive, motion via tokens only.",
        decision: "adapt",
        status: "n/a",
      },
      {
        name: "Text: Shimmering Text",
        useCase: "Text-level loading cue",
        stateExplained: "Something is being generated or loaded",
        trigger: "load",
        motion: "gradient sweep",
        a11y: "Static under reduced motion; announce busy state in text.",
        decision: "adapt",
        status: "n/a",
      },
      {
        name: "Text: Sliding / Rolling Number",
        useCase: "Live-value change",
        stateExplained: "Value just changed (only useful for live counters)",
        trigger: "value change",
        motion: "digit roll",
        a11y: "Final value in DOM immediately; not for tables or values people compare.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Text: Typing / Morphing / Splitting Text",
        useCase: "Decorative headline motion",
        stateExplained: "None",
        trigger: "load",
        motion: "character reveal",
        a11y: "Delays reading; no state conveyed.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Buttons: Ripple / Liquid / Flip",
        useCase: "Button hover flourishes",
        stateExplained: "None beyond pressed, which Atlas Button already handles",
        trigger: "hover, press",
        motion: "ripple, blob, flip",
        a11y: "Decorative; duplicates Button states.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Effects: Magnetic / Tilt / Particles / Shine",
        useCase: "Cursor-following decoration",
        stateExplained: "None",
        trigger: "hover",
        motion: "pointer-driven transform",
        a11y: "Pointer-only; no keyboard equivalent.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Backgrounds: Bubble / Fireworks / Hexagon",
        useCase: "Ambient decoration",
        stateExplained: "None",
        trigger: "load",
        motion: "looping background",
        a11y: "Looping decoration; violates restraint rules.",
        decision: "reject",
        status: "n/a",
      },
    ],
  },
  {
    id: "avoid",
    title: "Do Not Use / Too Much",
    blurb: "Patterns to reject. Kept here so the reasoning is recorded.",
    entries: [
      {
        name: "Animate every icon by default",
        stateExplained: "None",
        useCase: "Blanket icon animation",
        trigger: "any",
        motion: "any",
        a11y: "Noise competes with content and raises cognitive load.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Motion inside dense tables",
        stateExplained: "None",
        useCase: "Enterprise tables",
        trigger: "hover per row",
        motion: "any",
        a11y: "Scanning and comparison suffer; hundreds of animated nodes.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Looping background motion",
        stateExplained: "None",
        useCase: "Decoration",
        trigger: "load",
        motion: "infinite loop",
        a11y: "Violates pause / stop / hide expectations; loops are only for real in-progress work.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Animation in critical forms",
        stateExplained: "None",
        useCase: "Payments, sign-up, settings",
        trigger: "input, validation",
        motion: "any decorative motion",
        a11y: "Distracts at the point of error; use static text and focus management.",
        decision: "reject",
        status: "n/a",
      },
      {
        name: "Motion as the only signal",
        stateExplained: "None; motion may not be the only signal",
        useCase: "State communication",
        trigger: "any",
        motion: "any",
        a11y: "Motion must never replace a label or visible state.",
        decision: "reject",
        status: "n/a",
      },
    ],
  },
]

const field: React.CSSProperties = { margin: 0, fontSize: "var(--atlas-font-size-sm)" }
const fieldLabel: React.CSSProperties = { color: "var(--atlas-foreground-muted)" }

type MatrixCell = { label: string; props: Partial<AnimatedIconProps>; press?: boolean; note: string }

const matrixIcons: AnimatedIconProps["name"][] = ["check", "search", "settings", "refresh", "panel-left-open"]

const matrixCells: MatrixCell[] = [
  { label: "Idle", props: { state: "idle", trigger: "manual" }, note: "At rest, no animation." },
  { label: "Hover", props: { trigger: "hover" }, note: "Hover the button (or focus it with the keyboard)." },
  { label: "Pressed", props: { trigger: "press" }, note: "Press and hold the button.", press: true },
  { label: "Loading", props: { state: "loading" }, note: "Loops while work is in progress." },
  { label: "Success", props: { state: "success", tone: "success" }, note: "One-shot; Replay to watch again." },
  { label: "Error", props: { state: "error", tone: "danger" }, note: "One-shot shake; Replay to watch again." },
  { label: "Disabled", props: { disabled: true }, note: "Static and dimmed." },
]

function StatesMatrix() {
  const [replay, setReplay] = useState(0)
  const reduced = usePrefersReducedMotion()
  const cell: React.CSSProperties = {
    padding: "var(--atlas-spacing-3)",
    borderBlockEnd: "var(--atlas-border-width-1) solid var(--atlas-border-subtle)",
    textAlign: "center",
  }
  return (
    <section id="matrix" aria-labelledby="matrix-h" style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
      <div>
        <h2 id="matrix-h" style={{ margin: 0, fontSize: "var(--atlas-font-size-xl)", fontWeight: 600 }}>
          States Matrix
        </h2>
        <p style={{ margin: "var(--atlas-spacing-1) 0 0", color: "var(--atlas-foreground-muted)", fontSize: "var(--atlas-font-size-sm)" }}>
          check, search, settings, refresh and panel-left-open across every state <code>AnimatedIcon</code> supports today.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-3)" }}>
        <Button size="xs" variant="secondary" onClick={() => setReplay((n) => n + 1)}>
          Replay one-shots
        </Button>
        <span style={{ ...field, ...fieldLabel }}>Hover and Pressed need real pointer or keyboard input.</span>
      </div>
      <div style={{ overflowX: "auto", border: "var(--atlas-border-width-1) solid var(--atlas-border)", borderRadius: "var(--atlas-radius-lg)", background: "var(--atlas-surface-raised)" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "var(--atlas-font-size-sm)" }}>
          <thead>
            <tr>
              <th scope="col" style={{ ...cell, textAlign: "start" }}>State</th>
              {matrixIcons.map((n) => (
                <th key={n} scope="col" style={cell}>{n}</th>
              ))}
              <th scope="col" style={{ ...cell, textAlign: "start" }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {matrixCells.map((c) => (
              <tr key={c.label}>
                <th scope="row" style={{ ...cell, textAlign: "start" }}>{c.label}</th>
                {matrixIcons.map((n) => (
                  <td key={n} style={cell}>
                    <Button iconOnly variant="ghost" aria-label={`${n}, ${c.label.toLowerCase()} state`} disabled={c.props.disabled}>
                      <AnimatedIcon key={replay} name={n} {...c.props} />
                    </Button>
                  </td>
                ))}
                <td style={{ ...cell, textAlign: "start", color: "var(--atlas-foreground-muted)" }}>{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside
        aria-label="Reduced motion"
        style={{ padding: "var(--atlas-spacing-4)", border: "var(--atlas-border-width-1) solid var(--atlas-border)", borderRadius: "var(--atlas-radius-lg)", background: "var(--atlas-surface-raised)", display: "grid", gap: "var(--atlas-spacing-2)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-2)" }}>
          <h3 style={{ margin: 0, fontSize: "var(--atlas-font-size-base)", fontWeight: 600 }}>Reduced motion</h3>
          <Badge size="sm" variant={reduced ? "warning" : "neutral"}>
            {reduced ? "on in this browser" : "off in this browser"}
          </Badge>
        </div>
        <p style={{ ...field }}>
          No separate toggle and no new animation system. <code>MotionProvider</code> sets{" "}
          <code>MotionConfig reducedMotion=&quot;user&quot;</code>, which drops transform animation, and{" "}
          <code>AnimatedIcon</code> also drops opacity, path and loop animation, falling back to the static
          end state.
        </p>
        <p style={{ ...field, ...fieldLabel }}>
          To check: turn on “Reduce motion” in the OS accessibility settings, reload, and press Replay. Every
          cell above should render its end state without moving. State must still be readable from tone,
          labels and text.
        </p>
      </aside>
    </section>
  )
}

function EntryCard({ entry }: { entry: Entry }) {
  const [replay, setReplay] = useState(0)
  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--atlas-spacing-3)",
        padding: "var(--atlas-spacing-4)",
        background: "var(--atlas-surface-raised)",
        border: "var(--atlas-border-width-1) solid var(--atlas-border)",
        borderRadius: "var(--atlas-radius-lg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--atlas-spacing-2)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "var(--atlas-font-size-base)", fontWeight: 600 }}>
          {entry.name}
        </h3>
        <Badge variant={decisionVariant[entry.decision]} size="sm">
          {entry.decision}
        </Badge>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--atlas-spacing-3)",
          minHeight: "var(--atlas-spacing-16)",
          background: "var(--atlas-surface)",
          border: "var(--atlas-border-width-1) dashed var(--atlas-border-subtle)",
          borderRadius: "var(--atlas-radius-md)",
          color: "var(--atlas-foreground)",
        }}
      >
        {entry.preview ? (
          <>
            {entry.preview(replay)}
            <Button size="xs" variant="ghost" onClick={() => setReplay((n) => n + 1)}>
              Replay
            </Button>
          </>
        ) : (
          <span style={{ ...field, ...fieldLabel }}>
            {entry.status === "not built" ? "Not built — study entry only" : "No preview — study entry"}
          </span>
        )}
      </div>

      <dl style={{ margin: 0, display: "grid", gap: "var(--atlas-spacing-1)" }}>
        {[
          ["Use", entry.useCase],
          ["State it explains", entry.stateExplained],
          ["Trigger", entry.trigger],
          ["Motion", entry.motion],
          ["A11y", entry.a11y],
          ["Status", entry.status],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "var(--atlas-spacing-16) 1fr", gap: "var(--atlas-spacing-2)" }}>
            <dt style={{ ...field, ...fieldLabel }}>{k}</dt>
            <dd style={{ ...field, margin: 0 }}>{v}</dd>
          </div>
        ))}
      </dl>

      {entry.wrapper && (
        <code
          style={{
            fontSize: "var(--atlas-font-size-xs)",
            padding: "var(--atlas-spacing-2)",
            background: "var(--atlas-surface)",
            borderRadius: "var(--atlas-radius-sm)",
            overflowWrap: "anywhere",
          }}
        >
          {entry.wrapper}
        </code>
      )}
    </article>
  )
}

export default function MotionCanvasPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--atlas-background)",
        color: "var(--atlas-foreground)",
        fontFamily: "var(--atlas-font-sans)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--atlas-container-xl)",
          margin: "0 auto",
          padding: "var(--atlas-spacing-12) var(--atlas-spacing-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--atlas-spacing-10)",
        }}
      >
        <header>
          <Link
            href="/"
            style={{ fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)", textDecoration: "none" }}
          >
            ← Sandbox
          </Link>
          <h1 style={{ margin: "var(--atlas-spacing-3) 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-3xl)", fontWeight: 700 }}>
            Motion Canvas
          </h1>
          <p style={{ margin: 0, maxWidth: "var(--atlas-container-sm)", color: "var(--atlas-foreground-muted)" }}>
            A study board, not production design. Every card must say what state the motion explains; entries that cannot are rejected. Restrained motion: feedback and personality where it
            helps, never in place of a label or state. Icons marked “not built” are study entries only.
          </p>
          <nav aria-label="Sections" style={{ display: "flex", flexWrap: "wrap", gap: "var(--atlas-spacing-2)", marginTop: "var(--atlas-spacing-4)" }}>
            {[...sections.map((s) => ({ id: s.id, title: s.title })), { id: "matrix", title: "States Matrix" }].map((s) => (
              <a key={s.id} href={`#${s.id}`} style={{ fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground)" }}>
                {s.title}
              </a>
            ))}
          </nav>
        </header>

        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
            <div>
              <h2 id={`${s.id}-h`} style={{ margin: 0, fontSize: "var(--atlas-font-size-xl)", fontWeight: 600 }}>
                {s.title}
              </h2>
              <p style={{ margin: "var(--atlas-spacing-1) 0 0", color: "var(--atlas-foreground-muted)", fontSize: "var(--atlas-font-size-sm)" }}>
                {s.blurb}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--atlas-spacing-4)" }}>
              {s.entries.map((e) => (
                <EntryCard key={`${s.id}-${e.name}`} entry={e} />
              ))}
            </div>
          </section>
        ))}
        <StatesMatrix />
      </div>
    </div>
  )
}
