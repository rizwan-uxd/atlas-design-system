# Atlas Target Architecture and Principles

> **Status: the stable north star.** This document states the target architecture and the principles
> it must satisfy. It is deliberately not a schedule and does not describe the current repository.
> Its content is kept as authored — amend it only to change the target itself.
>
> The companion `docs/ATLAS-DELIVERY-ROADMAP.md` translates this into repository changes, tests,
> ownership and measurable milestones, and records honestly which of the metrics below are currently
> passing, failing, or not measurable.

## Framing logic

Atlas should be framed as:

> **Tier 1 Component Registry + Tier 4 Semantic Tokens**

The logic is:

```text
Component Registry = What is allowed to exist
Semantic Tokens     = What each component means visually
Renderer            = How it is presented
Agent               = Which approved components should be composed
```

The Component Registry is the agent's controlled vocabulary. Semantic Tokens are the brand-aware visual language applied to that vocabulary.

The agent should select:

```json
{
  "type": "Button",
  "variant": "primary",
  "tone": "critical"
}
```

It should never select:

```json
{
  "backgroundColor": "#ff0000",
  "padding": "16px",
  "borderRadius": "8px"
}
```

## Target architecture

```text
Figma Variables and Components
              ↓
Token Sync and Validation
              ↓
Tier 4 Semantic Token Catalog
              ↓
Tier 1 Component Registry
              ↓
Dynamic Capability Filter
              ↓
Semantic Agent
              ↓
Compact UI Protocol
              ↓
Validator + Normalizer + Fallback Engine
              ↓
Atlas Renderer
              ↓
User Interaction
              ↓
State Delta Bridge
              ↺
```

## Implementation phases

### Phase 1: Establish the Atlas contracts

Create the contracts before building the agent.

Deliverables:

- Component naming rules
- Component schema format
- Semantic token naming rules
- Event and state format
- Protocol versioning strategy
- Fallback rules
- Accessibility requirements
- Brand and theme rules
- Component lifecycle and deprecation policy

Every component must declare:

- Properties
- Variants
- States
- Slots
- Events
- Accessibility requirements
- Responsive behavior
- Fallback component
- Supported token roles

### Phase 2: Build the Tier 4 Semantic Token system

Create semantic tokens based on meaning rather than raw values.

Examples:

```text
color.text.primary
color.text.muted
color.text.danger
color.surface.default
color.surface.raised
color.action.primary
color.border.subtle
color.focus.ring
space.component.gap
radius.control
type.body.default
```

Each brand should provide values for the same semantic token names:

```text
Brand A → color.action.primary
Brand B → color.action.primary
Client C → color.action.primary
```

The component never changes. Only the token mode changes.

Required capabilities:

- Brand modes
- Light and dark modes
- Responsive values
- Typography modes
- Motion modes
- Token validation
- Token deprecation
- Token export to code
- Token drift detection

### Phase 3: Build the Tier 1 Component Registry

Start with a controlled core catalog:

- Text
- Heading
- Stack
- Grid
- Button
- TextField
- Select
- Checkbox
- Card
- Alert
- Form
- Modal
- Progress
- EmptyState

Each registry entry should define:

```json
{
  "type": "Button",
  "props": {
    "label": "string",
    "variant": ["primary", "secondary", "danger"],
    "disabled": "boolean"
  },
  "events": ["press"],
  "states": ["default", "hover", "pressed", "loading", "disabled"],
  "fallback": "TextButton"
}
```

The registry becomes the single source of truth for what the agent and runtime are allowed to use.

### Phase 4: Build the semantic protocol

Define a compact, typed, streamable protocol.

Render message:

```json
{
  "op": "render",
  "id": "checkout",
  "tree": [
    {
      "type": "TextField",
      "id": "email",
      "props": {
        "label": "Email address"
      }
    }
  ]
}
```

State message:

```json
{
  "op": "state",
  "path": "checkout.email",
  "value": "user@example.com"
}
```

Event message:

```json
{
  "op": "event",
  "id": "submit",
  "name": "press"
}
```

The protocol must not accept:

- CSS
- HTML
- JSX
- Arbitrary JavaScript
- Raw design values
- Unregistered component names

### Phase 5: Build validation and fallback

Every message must pass through:

```text
Parse → Validate → Normalize → Apply defaults → Fallback → Render
```

The validator should:

- Reject unknown component types
- Remove invalid properties
- Apply safe defaults
- Enforce nesting rules
- Validate required fields
- Add accessibility requirements
- Replace unsupported components
- Preserve the rest of the render tree

Example:

```text
UnknownChart
    ↓
Fallback
    ↓
Card + Text("This content is unavailable")
```

No invalid agent output should be able to crash the page.

### Phase 6: Build bidirectional state synchronization

Every interactive component needs an event contract.

Examples:

```text
TextField → change
Button → press
Select → select
Checkbox → toggle
Form → submit
Modal → dismiss
```

State should be sent as deltas rather than full conversation history:

```json
{
  "op": "state",
  "path": "profile.name",
  "value": "Aisha"
}
```

Required features:

- Stable component IDs
- State paths
- Event IDs
- Ordering
- Acknowledgments
- Retry handling
- Duplicate-event protection
- Optimistic UI support
- Loading and error states

### Phase 7: Add dynamic context filtering

The agent should receive only the catalog subset required for the current task.

Example:

```text
Task: Build a payment form

Exposed catalog:
Form
TextField
Select
Button
Alert
OrderSummary
```

The full Atlas registry should never be included by default.

Filtering should be enforced outside the agent so the agent cannot bypass it.

### Phase 8: Add the agent

The agent should be added only after the registry, protocol, validator, and renderer are stable.

Its responsibilities:

- Understand intent
- Select components
- Compose valid trees
- Choose semantic variants
- Provide labels and accessibility metadata
- Respond to structured state deltas
- Request additional capabilities when necessary

Its responsibilities should not include:

- Writing CSS
- Writing markup
- Inventing components
- Choosing raw colors
- Controlling the DOM
- Bypassing validation

### Phase 9: Add Figma parity

Figma should contain:

- Brand variable collections
- Component variants
- All supported states
- Responsive constraints
- Accessibility annotations
- Semantic token names matching code

The Figma-to-code process should be automated:

```text
Figma Variables
      ↓
Token Export
      ↓
Validation
      ↓
Theme Files
      ↓
Atlas Runtime
```

The system should detect:

- Missing tokens
- Renamed tokens
- Unused tokens
- Value mismatches
- Unsupported modes
- Component-state mismatches

Figma defines the visual source. Atlas runtime defines the production behavior.

## North Star enforcement metrics

| Principle | Required metric | Passing target |
|---|---|---:|
| Catalog Over Code | Agent outputs containing CSS, HTML, JSX, or arbitrary markup | 0 |
| Catalog Over Code | Rendered nodes mapped to registered components | 100% |
| Catalog Over Code | Direct raw color or spacing values accepted by components | 0 |
| Grammar Parsimony | Protocol messages passing schema validation | 100% |
| Grammar Parsimony | Full conversation replay required for UI interaction | 0% |
| Grammar Parsimony | Median protocol size versus equivalent markup | At least 70% smaller |
| Grammar Parsimony | First valid streamed operation | Under 250 ms p95 |
| State Synchronization | Interactive components with typed event contracts | 100% |
| State Synchronization | User events lost or reordered | 0 |
| State Synchronization | Interactions requiring full-screen regeneration | 0% |
| State Synchronization | State acknowledgment latency | Under 300 ms p95 client-side |
| Fallback | Invalid payloads producing a safe render | 100% |
| Fallback | Unhandled render exceptions | 0 |
| Fallback | Components with declared fallback behavior | 100% |
| Fallback | Registered types (the M3 exit types) | 6 of 6 |
| Fallback | Registered types that are production-ready | 6 of 6 |
| Fallback | Fallback render latency | Under 100 ms p95 |
| Context Containment | Requests using filtered catalog capabilities | 100% |
| Context Containment | Requests exposing the full catalog | 0 |
| Context Containment | Prompt reduction from dynamic filtering | At least 50% |
| Context Containment | Irrelevant components exposed to the agent | 0 in evaluation tests |

## Supporting Atlas quality gates

### Accessibility

- 100% of core components pass automated accessibility checks.
- Contrast meets WCAG AA.
- Keyboard navigation works for every interactive component.
- Focus states are visible.
- Form errors are associated with their fields.
- Reduced-motion behavior is supported.

### Figma parity

- Token-name drift: 0.
- Missing code tokens: 0.
- Missing Figma tokens: 0.
- All supported brand modes compile successfully.
- Critical visual regression tests pass for every brand mode.

### Runtime quality

- No raw design values in component implementations.
- No component renders without a valid schema.
- No unsupported component can reach the renderer.
- Loading, empty, error, active, and disabled states exist for all interactive components.
- No horizontal overflow at supported breakpoints.

## Definition of done

Atlas has incorporated the five principles when:

1. The agent can only emit registry-approved semantic UI.
2. CSS and raw markup are impossible through the agent protocol.
3. Semantic tokens control brand and presentation changes.
4. Every interaction produces a typed state delta.
5. Invalid output always degrades safely.
6. The agent receives only task-relevant capabilities.
7. Figma and code tokens are automatically checked for drift.
8. The metrics above pass in automated tests and continuous integration.

The key implementation rule is:

> The agent proposes semantic intent; the registry limits what is legal; semantic tokens define the visual meaning; the renderer owns presentation; and the runtime guarantees recovery.
