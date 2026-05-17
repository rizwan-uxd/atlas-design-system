# packages/ui-web

**Atlas React component library for Web.**

Stack: React 19 · Tailwind v4 · Radix UI · Atlas tokens

## Component classification

| Tier | Path | Components |
|------|------|-----------|
| **Primitives** | `src/primitives/` | Button, Input, Label, Textarea, Checkbox, Switch, Badge |
| **Compositions** | `src/compositions/` | Alert, Card, Dialog |
| **Patterns** | `src/patterns/` | Tabs |
| **Layouts** | `src/layouts/` | NavBar |
| **Templates** | `src/templates/` | _(coming soon)_ |

## Development
All components render in the **Atlas Web Sandbox** at `http://localhost:3000` (`npm run dev` from repo root).

## Validation
- `tests/` — component unit tests (Jest + Testing Library)
- `validations/` — token compliance checks, a11y audits, visual regression hooks
