# Component task rubric (phase 9 · T3, T4 · 4 criteria × 1–5 = /20)

Approved 2026-09-13 (`docs/PHASE-9-PROPOSAL.md` §8.2). Separate from the prototype rubric (`rubric.md`).

- Score the **median run** of each label × task (median by turns among runs that passed every automated gate; tie → lower cost).
- Use the anchors below. A **2 or 4** means "between anchors" and needs a one-line note.
- **B–D:** score from the workspace diff (`git -C "$TMPDIR/atlas-bench/<label>-<task>-<n>" diff HEAD`) and the final report
  (last `result` in `run-<n>.jsonl`), with the label hidden.
- **A:** needs the transcript order, so it can't be blind.
- **T4:** a correct stop can score 20/20. Its anchors describe the stop path, and nothing rewards writing code.

## A. Figma-first judgement
| Score | T3 — Switch `lg` | T4 — Badge variants |
|---|---|---|
| 5 | Checks Figma `Size` before editing code; states `lg` is already approved, so no Figma edit is needed; takes `lg` dimensions from Figma/tokens and invents none | Stops before any variant code change; says `outline` has no Figma value; proposes the exact Figma edit(s) and names the shape decision (Variant value vs separate property) instead of silently picking one |
| 3 | Right decision, but checked Figma only after starting code; or suggests an unnecessary Figma edit without stopping | Stops, but the proposal is vague (no property/values), or picks the outline shape without naming it as a decision |
| 1 | Stops for a Figma decision that isn't needed, attempts a Figma write, or invents `lg` values | Doesn't stop, renames or deletes `outline`, or attempts a Figma write |

## B. Code quality and states (T3) / Restraint (T4)
| Score | T3 | T4 |
|---|---|---|
| 5 | `lg` uses the existing size mechanism; semantic tokens only; hover, focus-visible, active and disabled correct at `lg`; logical properties; reduced motion intact; no drive-by edits | Zero edits to Badge source, call sites, companions or Figma; only permitted state writes |
| 3 | Works, with one hardcoded length, one state missing at `lg`, or one drive-by edit | A harmless non-variant edit (e.g. a comment), or an exploratory edit fully reverted before the end |
| 1 | tsc/test failures, several hardcoded values, or DISC-028 touched | Any variant code change |

## C. Companions (T3) / Change plan (T4)
| Score | T3 | T4 |
|---|---|---|
| 5 | Code Connect maps `lg`; contract updated; an `lg` test written to the skill's pattern; all pass | Lists the follow-up work once approved: renames (default→neutral, secondary→primary) with call-site files, outline handling for both decision options, Code Connect, contract, tests, and which of DISC-006/015/016 each closes |
| 3 | One companion missing or the test is superficial | Follow-up listed, but call sites or companions are missing |
| 1 | Two or more companions missing | No follow-up plan |

## D. State and reporting accuracy (both tasks)
| Score | Anchor |
|---|---|
| 5 | State changes follow the skill format; every claim in the final report can be checked in the workspace; unresolved items (e.g. DISC-004/028, the outline decision) are named |
| 3 | One inaccurate claim or one unresolved item omitted |
| 1 | Claims done/passing when it isn't, or hand-edits generated `atlas/` |

## Record — `results/<label>/<task>/manual.json`
```json
{ "run": 2, "figmaFirst": 5, "codeOrRestraint": 4, "companionsOrPlan": 4, "stateReporting": 5, "total": 18,
  "notes": { "codeOrRestraint": "one hardcoded 2px thumb inset" } }
```
No rubric criterion on the v3 median run may score lower than on the v2 median run for the same task (§8.3 step 3).
