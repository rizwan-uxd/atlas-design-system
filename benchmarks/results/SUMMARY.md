# Atlas benchmark summary

## Phase 0 baseline — locked (medians, original analyzer, 2026-09-12)

| label | task | runs | context tok | output tok | cost $ | turns | time s | reads | off-task reads | tool calls | figma calls | rework edits | lint | tsc | raw els | num literals | coverage | registered | manual /20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline | T1 | 3 | 2244300 | 15781 | 0.9108234 | 40 | 195 | 16 | 0 | 39 | 0 | 0 | 0 | 0 | 1 | 32 | 7/7 7/7 7/7 | 3/3 | 15 |
| baseline | T2 | 3 | 1690897 | 9928 | 0.6866996000000001 | 28 | 115 | 10 | 1 | 26 | 0 | 2 | 0 | 0 | 1 | 5 | 3/6 5/6 5/6 | 3/3 | 14 |

## Mean (min–max) across runs

Correctness first — a label only wins if these are equal or better. Lower is better for every effort column.
- **files opened**: Read, Grep on a file, and files named in Bash commands (cat/sed/grep/python…).
- **source/verifier opened**: unique files under packages/ui-web/src, packages/tokens, scripts/, packages/governance, app/prototypes/_shared (except flowRegistry.ts) and other prototypes.
- **wasted exploration**: duplicate opens + docs/source of components the output doesn't import + off-task reads + verifier internals + failed/denied tool calls.
- **gap recognised**: the expected gap (meta.gapComponents) was logged in candidates.json; n/a when the workspace had no candidates.json (phase 0).

| task | label | runs | completed | registered | coverage | lint | tsc | raw els | manual /20 | final verify ok | turns | cost $ | cache read | context tok | output tok | tool calls | time s | files opened | via Bash | source/verifier opened | verify failures | first-pass verify | wasted exploration | gap recognised |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T1 | baseline | 3 | 3/3 | 3/3 | 7/7 7/7 7/7 | 0 | 0 | 0.67 (0–1) | 15 (run 3) | 2/3 | 39.67 (38–41) | 0.95 (0.91–1.02) | 2.18M (2.15M–2.22M) | 2.27M (2.23M–2.32M) | 15.5k (14.3k–16.5k) | 38.33 (37–39) | 176 (137–197) | 23.67 (19–30) | 7.33 (2–14) | 18.33 (17–19) | 1.67 (1–2) | 0/3 | 7 (2–12) | n/a |
| T1 | harness | 3 | 3/3 | 3/3 | 7/7 7/7 7/7 | 0 | 0 | 0 | – | 3/3 | 31.67 (29–34) | 0.55 (0.49–0.64) | 1.21M (1.01M–1.59M) | 1.28M (1.08M–1.66M) | 14.0k (12.5k–14.9k) | 28.67 (26–31) | 152 (131–162) | 14 (13–16) | 0 | 0.33 (0–1) | 0.33 (0–1) | 2/3 | 0.67 (0–1) | 3/3 logged any |
| T1 | harness-v2 | 3 | 3/3 | 3/3 | 7/7 7/7 7/7 | 0 | 0 | 0 | 16 (run 1) | 3/3 | 32.33 (29–36) | 0.78 (0.64–0.97) | 1.50M (1.12M–1.94M) | 1.57M (1.18M–2.02M) | 18.9k (14.8k–25.6k) | 29.33 (26–33) | 194 (160–242) | 13.33 (13–14) | 0 | 0 | 0.33 (0–1) | 2/3 | 0 | 3/3 logged any |
| T2 | baseline | 3 | 3/3 | 3/3 | 3/6 5/6 5/6 | 0 | 0 | 0.67 (0–1) | 14 (run 3) | 3/3 | 27.67 (24–31) | 0.70 (0.63–0.79) | 1.59M (1.35M–1.79M) | 1.67M (1.43M–1.88M) | 10.1k (9228–11.1k) | 26.33 (23–30) | 117 (95–142) | 13 (11–14) | 2.33 (1–4) | 9 (8–10) | 1 | 0/3 | 5.33 (5–6) | n/a |
| T2 | harness | 3 | 3/3 | 3/3 | 4/6 4/6 4/6 | 0 | 0 | 0 | – | 3/3 | 26.33 (23–29) | 0.47 (0.40–0.54) | 1.09M (822.9k–1.39M) | 1.16M (882.0k–1.46M) | 9453 (8178–10.2k) | 23.33 (20–26) | 115 (98–133) | 11.33 (11–12) | 0 | 0 | 0.33 (0–1) | 2/3 | 1 | 3/3 |
| T2 | harness-v2 | 3 | 3/3 | 3/3 | 5/6 5/6 5/6 | 0 | 0 | 0 | 16 (run 3) | 3/3 | 24.33 (23–25) | 0.51 (0.47–0.58) | 880.8k (753.9k–1.06M) | 942.2k (813.7k–1.12M) | 8912 (7515–10.8k) | 21.33 (20–22) | 101 (79–121) | 12.67 (12–13) | 0.33 (0–1) | 0.33 (0–1) | 0.33 (0–1) | 2/3 | 1 | 3/3 |
