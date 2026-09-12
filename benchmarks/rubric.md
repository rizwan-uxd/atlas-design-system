# Manual quality rubric (score each run's best representative, 1–5 each, /20)

The bench sandbox can't run the dev server (its `node_modules` is a symlink and Turbopack rejects it). To look at a run:

```bash
cp -R "$TMPDIR/atlas-bench/<label>-<task>-<n>/app/prototypes/<slug>" app/prototypes/review-<slug>
npm run dev        # → http://localhost:3030/prototypes/review-<slug>
rm -rf app/prototypes/review-<slug>   # when done
```
(No leading underscore: Next.js treats `_name` as a private folder and the route 404s. The flow won't appear on the index — it isn't in the registry under that name — so open the URL directly.)

| Criterion | 1 | 5 |
|---|---|---|
| **Visual fidelity** | Looks generic / off-brand | Indistinguishable from a designer-built Atlas screen |
| **Hierarchy & spacing** | Cramped or inconsistent rhythm | Clear hierarchy, consistent Atlas spacing scale |
| **States & behaviour** | Happy path only | Disabled/invalid/loading/confirm/success all correct |
| **System discipline** | Reinvents library components, ad-hoc styles | Library components used correctly; gaps composed from primitives and flagged |

Record in `results/<label>/<task>/manual.json`:
```json
{ "run": 1, "fidelity": 4, "hierarchy": 4, "states": 3, "discipline": 4, "total": 15, "notes": "…" }
```
**Rule:** an "after" result only counts as a win if its manual total and automated quality (lint, tsc, raw elements, coverage) are equal or better than baseline.
