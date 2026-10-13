# Atlas: start here

One page for contributors and agents. The rules are in `AGENTS.md`; this page says where to begin.

## What Atlas is
A design system with three layers that must agree:

- **Figma** (file `cKYhfaHLCoyMHi9nKr63Ig`) is the authority for components, variants, tokens and usage.
- **`atlas/`** is a generated cache of Figma plus the repo. Agents read it first. It is never hand-edited. The one exception in practice is logging a gap: add an entry to `atlas/state/candidates.json`, then re-run `npm run atlas:sync`, which re-stamps it.
- **Code** implements it: `packages/ui-web` (React), `packages/ui-native` (React Native), tokens in `packages/tokens/atlas.tokens.css`.

When Figma and code disagree, Figma wins. Fix Figma first, then code.

## Where to look
| You need | Read |
|---|---|
| A component's props, variants, when to use it | `atlas/index.md`, then `atlas/<Name>.md` and `atlas/metadata/<Name>.json` |
| A product pattern (form, auth, data table, ...) | `packages/governance/patterns/<name>.md` |
| Whether something was already decided | `atlas/state/decisions.json` |
| Known gaps and unbuilt components | `atlas/state/candidates.json` |
| Figma and code drift | `atlas/state/discrepancies.json` |
| Deprecated assets and the replacement | `atlas/state/deprecations.json` |

## What not to hardcode
- No colours, sizes, spacing, radii or durations. Use semantic `--atlas-*` tokens only, never primitive ones such as `--atlas-blue-500`.
- No literal animation durations or easings. Use the motion tokens in `packages/ui-web/src/motion/`.
- No re-implementing a library component, and no deprecated asset.
- No new component or token on your own initiative. Compose the gap from primitives and log it in `atlas/state/candidates.json`.
- No physical CSS properties where a logical one exists (RTL).

## How agents change UI
| Task | Skill |
|---|---|
| Prototype a flow or screen (`app/prototypes/`) | `atlas-prototype` |
| Create or change a library component | `atlas-component` (Figma, then docs through sync, then code) |
| Refresh the snapshot from Figma | `atlas-figma-sync` |
| Check work before saying done | `atlas-verify` |

Prototypes never modify the library, and library changes never happen inside a prototype task.

## How to verify
```bash
npm run atlas:verify -- --scope "<globs>"   # design checks, token-lint, tsc, tests, usage, a11y, diff scope
npm run token-lint
npm test
npm run test:scripts
npm run atlas:sync:check                    # the snapshot is current
```
Report what ran and the actual result. "It compiles" is not done.

## Run it
```bash
npm run dev   # http://localhost:3030
```
