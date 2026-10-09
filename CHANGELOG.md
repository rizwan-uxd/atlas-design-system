# Changelog

Atlas Design System. Versions follow semver for the library and tokens together. Source: git history and tags.

## Policy

- **Versioning.** MAJOR for a breaking change to a component API, variant or size value, or a token name or meaning. MINOR for a new component, variant, size or token. PATCH for fixes with no API change.
- **Breaking changes.** Listed under `### Breaking` with the replacement. The `*.contract.ts` file in `packages/governance/contracts/` changes in the same commit.
- **Deprecation.** Add an entry to `packages/governance/deprecations.json` (`since`, `removeIn`, `replacement`, `migration`), run `npm run atlas:sync`, and remove the asset no sooner than the next MAJOR. `atlas-verify` then rejects new uses of it.
- **Migration.** Each deprecation carries a one-paragraph migration; larger moves get a section here.
- Figma is the authority. A change lands in Figma first, then code, then this file.

## Unreleased (since v1.0.0, to 2026-10-09)

### Added
- Primitives: Select, Tooltip, Slider, RadioGroup, Progress, Bubble, Table, Avatar (with animated AvatarGroup), Divider, Spinner, Skeleton, Image, ScrollProgress, SidebarMenuRow.
- Compositions: AlertDialog, Drawer, Sheet, Toast, ButtonGroup, Chart, DatePicker, CodeBlock, ListItem.
- Patterns and layouts: Breadcrumb, DropdownMenu, Sidebar; NavBar breadcrumb and search slots.
- Motion layer (`motion/react`) and `AnimatedIcon` with a registry of animated icons; Tabs `animated` prop.
- Button `xs` size, icon-only property and icon slots. Tabs `outline` variant and vertical orientation. Textarea `unstyled`, Card `filled`, Alert `neutral` variants.
- `atlas/` generated snapshot, Figma sync, `atlas-verify`, benchmark kit.
- Governance: `deprecations.json` lifecycle registry with a `deprecated-usage` check in `atlas-verify`, `ownership.json`, `CODEOWNERS`, this changelog policy.
- AI-readable product patterns (form, data table, empty state, error recovery, settings) with Decision rules, anti-patterns and compiled examples under `atlas/patterns/`.
- Component tokens for Button, Input and Card (86 tokens, `--atlas-<component>-<variant>-<property>[-<state>]` and `--atlas-<component>-size-<size>-<property>`). Every token aliases a semantic token; they are for implementing Atlas components, and `atlas/tokens.md` labels them so product code keeps using semantic tokens. `token-lint` rejects aliases to primitives, other component tokens, literals or undefined tokens. Figma has a matching `Atlas/Component` collection. Native is not adopted.
- CI gates: `atlas:verify` and script tests on every PR and push; ESLint is blocking (existing errors recorded in `eslint-suppressions.json`, warnings capped); Playwright visual regression of the sandbox in light and dark with Linux baselines, and a manual `Visual baseline` workflow that opens a PR with new baselines. `Atlas Verify`, `Lint` and `Visual Regression` are required checks on `main`.
- Benchmark tasks T5 to T11 (patterns, error recovery, drift audit, deprecated migration) and AI-readiness metrics, with baseline, pattern and governance results.

### Changed
- Dark mode: Card default and outlined fill is `--atlas-surface` (was `--atlas-background`), so the card lifts off the page; Card default and outlined hover, Card filled hover and filled Input hover use `--atlas-background-hovered`; Button secondary hover and active use `--atlas-background-hovered`. Light mode is unchanged. Decisions DEC-053 to DEC-055.
- Card strokes stay `--atlas-border` (default) and `--atlas-border-strong` (outlined); Card gap is 8/12/16 and radius `--atlas-radius-lg` at every size, and Figma was aligned to the code.
- Figma descriptions now carry a one-line `CODE` entry for 10 components; the component docs in `atlas/` come from them. Stale `atlas/index.md` footer and `gaps.md` guidance corrected.
- Visual regression tolerance tightened (`threshold` 0.2 to 0.01, `maxDiffPixelRatio` 0.002 to 0.0005) and every differing section is now reported, not only the first. The old default could not see the dark-mode Card fill change (it ignored differences under about 53 of 255 grey levels). Linux baselines regenerated.

### Fixed
- Dark-mode hover that darkened instead of lightening: filled Input, Card filled and Button secondary (the Card case had a dark-only `color-mix` workaround from BUG-054, now removed).

### Breaking
- Tabs variants renamed to `line | pill | segmented` (`ddff0df`).
- Dialog variant narrowed to `default | destructive`; Drawer and Sheet extracted as their own components and Dialog's sheet and drawer variants removed (`38fc15b`, `2053836`, `c5cf4f4`).
- Badge tone renamed (`5612bf1`). Alert `dismissible` is now a boolean property (`a7f400b`). Switch gained a `Checked` property (`c1d282d`).

## 1.0.0 (2026-05-11)
- 12 v1 components: Button, Input, Label, Textarea, Checkbox, Switch, Badge, Alert, Card, Dialog, Tabs, NavBar.
- Atlas tokens in `packages/tokens/` with light and dark themes; React Native library in `packages/ui-native/`.
- QA sign-off: 14 sessions, 76 bugs filed and fixed (`docs/audits/QA-REPORT.md`).
