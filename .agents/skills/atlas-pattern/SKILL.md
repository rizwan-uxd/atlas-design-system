---
name: atlas-pattern
description: Write or change an Atlas screen pattern (packages/governance/patterns/<slug>.md and its example) — "add a detail view pattern", "write the chat pattern", "update the settings pattern", "draw the pattern frames". Works Figma first (a Pattern / <Name> page of existing component instances), then the pattern doc and compiled example, then atlas:sync, and ends with atlas-verify. Not for building a prototype screen in app/prototypes (that is atlas-prototype) and not for a library component (that is atlas-component).
---

# atlas-pattern

A pattern is composition guidance: which existing components to use for a kind of screen, in what
order, and what never to do. Figma is the authority, so it runs in one direction:
**Figma frames → pattern doc + example → `npm run atlas:sync` → `atlas-verify`.**
Writing the doc before the frames exist is the mistake this skill prevents.

## Scope — one pattern per task
- Writes: the Figma page `Pattern / <Name>` (only after the user approves the plan),
  `packages/governance/patterns/<slug>.md`, `packages/governance/patterns/examples/<slug>.example.tsx`,
  the pattern list in `packages/governance/README.md`, `atlas/` **only through** `npm run atlas:sync`,
  and gap rows in `atlas/state/candidates.json`.
- Never: a new component, a new token, `packages/ui-web`, `app/prototypes`, hand edits to `atlas/`.
  A gap is composed from existing primitives and logged as a candidate; a pattern never invents a component.

## Steps
1. **Parse and look up** — name the pattern, its slug and the screen it covers. Read `atlas/index.md`
   (the Patterns table and the component table) and **one sibling pattern** in
   `packages/governance/patterns/` as the section template. Read `atlas/<Name>.md` only for components
   the pattern will name. If a pattern with the slug exists, you are changing it, not writing a new one.
2. **Figma frames first** — **read `references/figma-frames.md` now (required)**. State the plan (states,
   components, gaps with no Atlas token) and **get approval** before any `use_figma` write; then build the
   frames from existing component instances, screenshot them and show the result. If the Figma tool fails
   (proxy 403, `whoami` fails), **stop and say so**: do not write the doc without frames.
3. **Doc and example** — **read `references/doc-template.md` before writing (required)**. Write the doc
   from the frames: it may only say what Figma draws, and anything it adds beyond the frames is marked
   "not drawn in Figma yet". Components named under "Components and variants" must exist in
   `atlas/index.md`, with variants and sizes Figma draws (sub-parts such as `BubbleGroup` are not components).
4. **Sync** — `npm run atlas:sync`. It validates every section, component, variant and size, embeds the
   example and writes `atlas/patterns/<slug>.md` plus the `atlas/index.md` row. Read its full output;
   a `✗ pattern validation failed` line names the fix. Never edit the generated copy.
5. **Compile and verify** — `npx tsc --noEmit` (the example is compiled), then the `atlas-verify` skill
   with scope `packages/governance/**,atlas/patterns/**,atlas/index.md`. Run `npm ci` first in a fresh
   container. The example is not rendered by these checks: say so in the report.
6. **Report** — the Figma page and frame ids, files changed, what the doc says that Figma does not draw,
   gaps logged, and the verify summary line.

## Approval gates
1. **Plan** — states, components, token bindings, gaps. Scope or taste questions go in one
   `AskUserQuestion` first. Stop and wait.
2. **Figma built** — node ids and a screenshot (Light, plus mobile). Stop and wait before the doc.
3. **Doc checked** — sync, tsc and verify output. Stop; do not commit.
4. **Final** — only after a yes: commit the pattern's files alone; push, PR and merge each wait for the user.

## Rules
- Figma and the doc disagree → Figma wins; fix the doc, or draw the missing frame.
- No new components or tokens (AGENTS.md §4). The doc uses `--atlas-*` names that exist in `atlas/tokens.md`.
- An ambiguous design rule stops the task: name the missing decision (AGENTS.md §6).
- Figma writes are outward-facing: describe the edit and wait for a yes before `use_figma`.

## References — required reads, at the step that names them
- `references/figma-frames.md` — the page layout, the clone recipe, component gotchas, screenshots.
- `references/doc-template.md` — required sections, the Components line format, the example rules.
