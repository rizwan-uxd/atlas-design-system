# Changelog

Atlas Design System. Versions follow semver for the library and tokens together. Source: git history and tags.

## Policy

- **Versioning.** MAJOR for a breaking change to a component API, variant or size value, or a token name or meaning. MINOR for a new component, variant, size or token. PATCH for fixes with no API change.
- **Breaking changes.** Listed under `### Breaking` with the replacement. The `*.contract.ts` file in `packages/governance/contracts/` changes in the same commit.
- **Deprecation.** Add an entry to `packages/governance/deprecations.json` (`since`, `removeIn`, `replacement`, `migration`), run `npm run atlas:sync`, and remove the asset no sooner than the next MAJOR. `atlas-verify` then rejects new uses of it.
- **Migration.** Each deprecation carries a one-paragraph migration; larger moves get a section here.
- Figma is the authority. A change lands in Figma first, then code, then this file.

## Unreleased (since v1.0.0, to 2026-10-02)

### Added
- Primitives: Select, Tooltip, Slider, RadioGroup, Progress, Bubble, Table, Avatar (with animated AvatarGroup), Divider, Spinner, Skeleton, Image, ScrollProgress, SidebarMenuRow.
- Compositions: AlertDialog, Drawer, Sheet, Toast, ButtonGroup, Chart, DatePicker, CodeBlock, ListItem.
- Patterns and layouts: Breadcrumb, DropdownMenu, Sidebar; NavBar breadcrumb and search slots.
- Motion layer (`motion/react`) and `AnimatedIcon` with a registry of animated icons; Tabs `animated` prop.
- Button `xs` size, icon-only property and icon slots. Tabs `outline` variant and vertical orientation. Textarea `unstyled`, Card `filled`, Alert `neutral` variants.
- `atlas/` generated snapshot, Figma sync, `atlas-verify`, benchmark kit.

### Breaking
- Tabs variants renamed to `line | pill | segmented` (`ddff0df`).
- Dialog variant narrowed to `default | destructive`; Drawer and Sheet extracted as their own components and Dialog's sheet and drawer variants removed (`38fc15b`, `2053836`, `c5cf4f4`).
- Badge tone renamed (`5612bf1`). Alert `dismissible` is now a boolean property (`a7f400b`). Switch gained a `Checked` property (`c1d282d`).

## 1.0.0 (2026-05-11)
- 12 v1 components: Button, Input, Label, Textarea, Checkbox, Switch, Badge, Alert, Card, Dialog, Tabs, NavBar.
- Atlas tokens in `packages/tokens/` with light and dark themes; React Native library in `packages/ui-native/`.
- QA sign-off: 14 sessions, 76 bugs filed and fixed (`docs/audits/QA-REPORT.md`).
