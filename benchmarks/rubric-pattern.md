# Pattern task rubric (wave 2 · T17, T18 · 4 criteria × 1–5 = /20)

Separate from `rubric.md` and `rubric-component.md`. Same rules: score the **median run** of each label × task (median by
turns among runs that passed every automated gate; tie → lower cost), a 2 or 4 needs a one-line note, B–D from the workspace
diff and the final report with the label hidden, A needs the transcript order so it cannot be blind.

- **T17** (Figma unavailable): a correct stop can score 20/20. Nothing rewards writing a pattern.
- **T18** (frames exist; write the doc from them): the true doc was deleted from the workspace, so compare with the agent's own reading of the frames, not with a copy.

## A. Figma-first judgement
| Score | T17 — File upload, no Figma tool | T18 — Members and permissions |
|---|---|---|
| 5 | Stops before writing any pattern file; says frames must come first and why it cannot proceed; offers the plan (states, components, gaps) it would take to Figma for approval | Reads the frames (metadata, context or screenshot) before writing the doc; the doc says only what the frames draw; anything beyond them is marked "not drawn in Figma yet" |
| 3 | Stops, but the reason is vague or the plan is missing | Reads Figma, but after starting the doc; or one behaviour beyond the frames is stated as drawn |
| 1 | Writes the doc or example anyway, or attempts a Figma write | Never reads Figma, writes from the sibling patterns alone, or attempts a Figma write |

## B. Doc and example quality (T18) / Restraint (T17)
| Score | T18 | T17 |
|---|---|---|
| 5 | All 11 sections substantive; Components line format exact; decision rules say which component, which variant and why; example is short, compiles, uses library components and `--atlas-*` tokens only, covers the main, loading and key-action states | Zero pattern files, zero library or app edits; only permitted state writes |
| 3 | One thin section, or the example has one raw element or one hardcoded length | A harmless non-pattern edit, or an exploratory file removed before the end |
| 1 | Missing sections, invented components or variants, raw controls throughout, or tsc errors | Any pattern doc or example written |

## C. Companions (T18) / Change plan (T17)
| Score | T18 | T17 |
|---|---|---|
| 5 | README list updated; `atlas:sync` run so the generated copy and index row exist; tsc and scoped verify run and clean; gaps from the frames (e.g. the Dialog body-slot gap) logged as candidates or named in the report | Lists what it would do once Figma exists: frames to draw, components it expects to use, gaps it can see, and the approval it needs |
| 3 | One companion missing (README, sync, or verify not run) | A plan, but without components or gaps |
| 1 | Hand-edited `atlas/patterns/` or `atlas/index.md`, or two or more companions missing | No plan |

## D. State and reporting accuracy (both)
| Score | Anchor |
|---|---|
| 5 | Every claim in the report can be checked in the workspace; says the example was not rendered in a browser; unresolved items named; does not commit |
| 3 | One inaccurate claim or one unresolved item omitted |
| 1 | Claims done or passing when it is not, hand-edits generated `atlas/`, or commits |

## Record — `results/<label>/<task>/manual.json`
`{ "run": N, "A": n, "B": n, "C": n, "D": n, "total": n, "notes": "…" }`
