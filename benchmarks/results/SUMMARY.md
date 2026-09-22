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
| T1 | harness-v3 | 3 | 3/3 | 3/3 | 7/7 6/7 7/7 | 0 | 0 | 0 | – | 3/3 | 34.33 (28–39) | 0.79 (0.73–0.81) | 1.49M (1.15M–1.69M) | 1.57M (1.23M–1.76M) | 18.9k (17.8k–20.9k) | 31.33 (25–36) | 197 (187–212) | 15 (13–16) | 0.33 (0–1) | 2 (0–3) | 0 | 3/3 | 0.33 (0–1) | 3/3 logged any |
| T2 | baseline | 3 | 3/3 | 3/3 | 3/6 5/6 5/6 | 0 | 0 | 0.67 (0–1) | 14 (run 3) | 3/3 | 27.67 (24–31) | 0.70 (0.63–0.79) | 1.59M (1.35M–1.79M) | 1.67M (1.43M–1.88M) | 10.1k (9228–11.1k) | 26.33 (23–30) | 117 (95–142) | 13 (11–14) | 2.33 (1–4) | 9 (8–10) | 1 | 0/3 | 5.33 (5–6) | n/a |
| T2 | harness | 3 | 3/3 | 3/3 | 4/6 4/6 4/6 | 0 | 0 | 0 | – | 3/3 | 26.33 (23–29) | 0.47 (0.40–0.54) | 1.09M (822.9k–1.39M) | 1.16M (882.0k–1.46M) | 9453 (8178–10.2k) | 23.33 (20–26) | 115 (98–133) | 11.33 (11–12) | 0 | 0 | 0.33 (0–1) | 2/3 | 1 | 3/3 |
| T2 | harness-v2 | 3 | 3/3 | 3/3 | 5/6 5/6 5/6 | 0 | 0 | 0 | 16 (run 3) | 3/3 | 24.33 (23–25) | 0.51 (0.47–0.58) | 880.8k (753.9k–1.06M) | 942.2k (813.7k–1.12M) | 8912 (7515–10.8k) | 21.33 (20–22) | 101 (79–121) | 12.67 (12–13) | 0.33 (0–1) | 0.33 (0–1) | 0.33 (0–1) | 2/3 | 1 | 3/3 |
| T2 | harness-v3 | 3 | 3/3 | 3/3 | 5/6 5/6 5/6 | 0 | 0 | 0 | – | 3/3 | 23.67 (22–25) | 0.47 (0.44–0.51) | 812.5k (727.3k–898.9k) | 871.0k (784.5k–959.3k) | 7386 (6604–8756) | 20.67 (19–22) | 95.33 (85–112) | 11.67 (11–12) | 0 | 0 | 0 | 3/3 | 0.67 (0–1) | 3/3 |

## Phase 9 — component tasks, mean (min–max) across runs

Gates first (proposal §8.1); a count is runs passing. H columns are the §5B source signals: mean (min–max), then [runs where the
signal is present] — a hypothesis reproduces at ≥2/3 in harness-v2. Effort columns are reported, not used for acceptance.

| task | label | runs | completed | all gates | figma writes | stop decision ok | tests | tsc | verify ok | stamped | in scope | manual /20 | H1 state-file reads [runs] | H2 other tests [runs] | H3 sync runs [runs over limit] | H4 invalid DISC [runs] | H5 other components [runs] | turns | cost $ | cache read | files opened | figma reads | max-turns exits |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T3 | harness-v2 | 3 | 3/3 | 2/3 | 0 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 3/3 | 19 (run 3) | 2.33 (2–3) [3/3] | 0.33 (0–1) [1/3] | 2.33 (1–3) [2/3] | 0 [0/3] | 2 (1–3) [3/3] | 45 (42–49) | 1.06 (0.98–1.17) | 2.45M (2.22M–2.62M) | 19 (15–23) | 3.33 (2–5) | 0/3 |
| T3 | harness-v2-t3f2 | 3 | 3/3 | 2/3 | 0 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 3/3 | 20 (run 1) | 3.67 (3–4) [3/3] | 0 [0/3] | 3 [3/3] | 0 [0/3] | 0 [0/3] | 42.33 (39–45) | 0.87 (0.83–0.94) | 2.08M (1.94M–2.27M) | 18.67 (15–21) | 2.67 (2–3) | 0/3 |
| T3 | harness-v3 | 3 | 3/3 | 2/3 | 0 | 2/3 | 3/3 | 0 | 2/3 | 2/3 | 3/3 | – | 2 [3/3] | 0.33 (0–1) [1/3] | 1 (0–2) [0/3] | 0 [0/3] | 0.33 (0–1) [1/3] | 33 (17–43) | 0.73 (0.47–0.96) | 1.49M (628.7k–2.18M) | 13.33 (10–16) | 2.33 (1–3) | 0/3 |
| T3 | harness-v3-t3f2 | 3 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 3/3 | 19 (run 1) | 2.67 (2–3) [3/3] | 0 [0/3] | 1.33 (1–2) [0/3] | 0 [0/3] | 0 [0/3] | 40 (38–42) | 0.81 (0.75–0.87) | 1.85M (1.65M–2.11M) | 15.67 (15–16) | 1.67 (1–3) | 0/3 |
| T3 | harness-v4-t3f2 | 3 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 3/3 | 20 (run 1) | 3 (2–5) [3/3] | 0 [0/3] | 2.33 (2–3) [1/3] | 0 [0/3] | 0 [0/3] | 39.67 (37–41) | 0.86 (0.77–0.91) | 2.09M (1.67M–2.42M) | 16.33 (14–20) | 1.33 (1–2) | 0/3 |
| T3 | harness-v5-t3f2 | 1 | 0/1 | 0/1 | 0 | 0/1 | 1/1 | 0 | 0/1 | 0/1 | 1/1 | – | 0 [0/1] | 0 [0/1] | 0 [0/1] | 0 [0/1] | 0 [0/1] | 3 | 0.13 | 18.4k | 0 | 0 | 0/1 |
| T3 | harness-v6-t3f2 | 3 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 3/3 | – | 2.33 (2–3) [3/3] | 0 [0/3] | 1 [0/3] | 0 [0/3] | 0 [0/3] | 34.67 (33–36) | 0.78 (0.72–0.85) | 1.65M (1.52M–1.79M) | 14.67 (13–16) | 2 | 0/3 |
| T3 | no-skill | 3 | 3/3 | 0/3 | 0 | 3/3 | 3/3 | 0 | 1/3 | 0/3 | 2/3 | – | 2.67 (2–4) [3/3] | 0 [0/3] | 0.67 (0–1) [0/3] | 0 [0/3] | 0 [0/3] | 32.67 (27–40) | 0.80 (0.63–0.93) | 1.77M (1.35M–2.06M) | 12.67 (10–16) | 5 (4–6) | 0/3 |
| T3 | no-skill-t3f2 | 3 | 3/3 | 0/3 | 0 | 3/3 | 3/3 | 0 | 3/3 | 2/3 | 3/3 | – (run null) | 2 [3/3] | 0 [0/3] | 1 [0/3] | 0 [0/3] | 0.33 (0–1) [1/3] | 30 (24–36) | 0.76 (0.65–0.90) | 1.84M (1.50M–2.37M) | 10.67 (9–13) | 2.67 (2–3) | 0/3 |
| T4 | harness-v2 | 3 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 0 | 3/3 | 0/3 | 3/3 | 14 (run 2) | 3 (2–5) [3/3] | 0 [0/3] | 0 [0/3] | 0 [0/3] | 0.67 (0–2) [1/3] | 14.33 (12–18) | 0.33 (0.30–0.36) | 408.2k (308.1k–474.6k) | 10.33 (8–14) | 0 | 0/3 |
| T4 | harness-v3 | 3 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | 0 | 3/3 | 0/3 | 3/3 | – | 2 [3/3] | 0 [0/3] | 0 [0/3] | 0 [0/3] | 0 [0/3] | 21 (16–25) | 0.50 (0.38–0.64) | 722.2k (318.1k–1.13M) | 13 (12–15) | 2 (0–5) | 0/3 |
| T4 | no-skill | 3 | 3/3 | 0/3 | 0 | 0/3 | 3/3 | 0 | 1/3 | 0/3 | 0/3 | – | 2.33 (2–3) [3/3] | 0 [0/3] | 1 [0/3] | 0 [0/3] | 3.33 (0–7) [2/3] | 53.33 (38–72) | 1.31 (1.11–1.60) | 3.27M (2.51M–4.23M) | 26.33 (16–35) | 0.33 (0–1) | 0/3 |
