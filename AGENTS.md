<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Atlas harness rules

The rules for working in this repo. Project state lives in `claude.md`; it carries no rules.

## 1. Source of truth
Figma is the design-system authority (components, variants, tokens, usage). The repo holds instructions, the generated `atlas/` snapshot, and the implementation.

- `atlas/` is a **cache of Figma, never a replacement**. Read it first.
- Figma and code disagree → **Figma wins.** Flag it, fix Figma first, then code.
- **Escalate to Figma MCP only when** the snapshot lacks the field you need, is marked stale, has `syncedAt: null`, or verification finds a mismatch. Say in your report that you escalated and why.
- Never edit `atlas/` by hand — it is generated. Fix the generator or the Figma file.

## 2. Context priority order
Read in this order and stop as soon as you can act:

1. The request itself
2. These rules + the routing table below
3. `atlas/index.md`, then `atlas/state/*.json` (was this already decided?)
4. `atlas/metadata/<Name>.json` and `atlas/<Name>.md` — only for components you will touch
5. `atlas/tokens.md` — only when custom layout is needed
6. Component source in `packages/ui-web/src` — only when the snapshot is insufficient
7. An existing prototype in `app/prototypes/` — only as a pattern example (shell, registry, frame)
8. Figma MCP — only under the escalation rule above

`docs/` is background for humans. Do not read it to build something.

## 3. Tool selection
**Understand → identify the context you're missing → pick the minimum tools → execute → verify.**
Prefer one targeted read over a sweep, Grep over Read when you need a single fact, and batch independent calls into one turn.

## 4. Task boundaries
- Do only the task asked. No working ahead to the next phase or component.
- No unrelated refactors, renames, reformatting, or drive-by "improvements".
- **Never add a new component or a new token** on your own initiative. A gap is composed locally from primitives and logged in `atlas/state/candidates.json`.
- Prototypes never modify the library. Library changes never happen inside a prototype task.
- Write web components into their tier: `primitives/` (Button, Input, Label, Textarea, Checkbox, Switch, Badge), `compositions/` (Alert, Card, Dialog), `patterns/` (Tabs), `layouts/` (NavBar) — all under `packages/ui-web/src/<tier>/<Name>/`. Native: `packages/ui-native/components/<Name>/`.
- Edit existing files in place. No duplicate or parallel implementations, no `/outputs`, no session scratch folders in the repo.

## 5. Execution loop
**Parse · scope · retrieve · plan · execute · verify · correct · report.**

- **Parse** what is actually being asked, including what is out of scope.
- **Scope** the files you expect to touch. Say so before editing more than a few.
- **Retrieve** by the priority order above, nothing more.
- **Plan** anything that touches more than one file.
- **Execute** in place.
- **Verify** — run the checks, don't assume. "It compiles" is not done.
- **Correct** what verification found, then verify again.
- **Report**: what changed, what was verified with the actual result, what is unresolved.

## 6. Uncertainty
**Never invent a design-system rule.** When a rule is unclear, resolve in this order:
`atlas/state/decisions.json` → `atlas/<Name>.md` → component source → Figma MCP.
If none of those answer it, **stop and name the missing decision** rather than guessing. A wrong guess that ships costs more than a question.

## 7. Tokens and cost
Before every read and every tool call: **does this materially change what I'm about to write?** If not, skip it.

- Don't re-read a file you already read this session.
- Don't read a component you aren't using.
- Don't open `docs/` plans, other platforms (`ui-native` from a web task), or framework docs unless the task is about them.
- Use only semantic design tokens (`--atlas-*`) — no hardcoded colours, sizes or spacing, and no primitive token refs (`--atlas-blue-500`) in app code.

## 8. Quality bar (every component and prototype)
Accessible (focus-visible, ARIA, keyboard) · all states (hover, active, disabled, loading, invalid) · logical CSS properties for RTL · token-based motion honouring `prefers-reduced-motion` · library components used as intended rather than re-implemented.

## 9. Routing table
Skills are **authored** in `.agents/skills/<name>/` (`SKILL.md` + `references/`), symlinked as `.claude/skills`. `atlas/` is **generated** and never hand-edited. Keep the two apart.

| Task | Use |
|---|---|
| Build a prototype flow or screen | `atlas-prototype` skill *(phase 7 — until it exists, follow §2 disclosure order and end with the verify checks)* |
| Create or change a library component | `atlas-component` skill *(phase 7)* |
| Refresh the snapshot from Figma | `atlas-figma-sync` skill + `scripts/atlas-sync.mjs` |
| Check work before reporting done | `atlas-verify` skill + `scripts/atlas-verify.mjs` (`npm run atlas:verify -- --scope "<globs>"`) |
| QA audit of a component | `docs/audits/QA-REPORT.md` only — never a new per-session file. Append the bug log (BUG-NNN: guard, location, description, fix) and the checklist, then update the Summary, Component Results and Session Progress tables. |
| Measure agent cost or quality | `benchmarks/run.sh <label> <task> <reps> <model>`, then score with `benchmarks/rubric.md` |

## 10. Git
Commit only when the task is complete and verified; never commit broken code.
QA sessions: `git add -A` → `git commit -m "qa(<component>): QA-<NN> audit — <N> bugs filed"` → `git push origin main` immediately (on rejection: `git pull --rebase origin main`, then push).

If the project folder is unreachable, **stop and say so.** Never silently fall back to another location.
