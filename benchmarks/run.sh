#!/usr/bin/env bash
# Atlas agent benchmark runner (macOS bash 3.2 compatible)
# Usage: benchmarks/run.sh <label> <task> [reps] [model]
#   e.g. benchmarks/run.sh baseline T1 3 sonnet
# Runs Claude Code headless on an isolated COPY of the repo (your working tree is never touched).
#
# Phase 9 (pinned source) — set BENCH_COMMIT and the copy comes from that commit, never the working tree:
#   BENCH_COMMIT=d7967d7 benchmarks/run.sh harness-v2 T3 3 claude-sonnet-5
#   BENCH_COMMIT=d7967d7 BENCH_PATCH=benchmarks/phase-9/no-skill.patch benchmarks/run.sh no-skill T3 3 claude-sonnet-5
#   BENCH_DRY=1 …   build the workspace, run the fixture gate and record pins; no claude call, no spend
#   BENCH_ONLY=2 …  run only index 2 (an infrastructure replacement run)
# Phase 9 adds, before each run: fixture gate + pins check; before each batch: the spend check;
# after each run: model/MCP pin check and the batch-stop rules (benchmarks/phase-9/budget.mjs).
set -uo pipefail
LABEL=${1:?label, e.g. baseline}; TASK=${2:?task, e.g. T1}; REPS=${3:-3}; MODEL=${4:-${BENCH_MODEL:-sonnet}}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TDIR="$ROOT/benchmarks/tasks/$TASK"; [ -f "$TDIR/prompt.md" ] || { echo "no task $TASK"; exit 1; }
OUT="$ROOT/benchmarks/results/$LABEL/$TASK"; mkdir -p "$OUT"
command -v claude >/dev/null || { echo "claude CLI not found"; exit 1; }
COMMIT=${BENCH_COMMIT:-}; PATCH=${BENCH_PATCH:-}; DRY=${BENCH_DRY:-}; ONLY=${BENCH_ONLY:-}
P9="$ROOT/benchmarks/phase-9"
TYPE=$(node -e 'console.log(require(process.argv[1]).type || "prototype")' "$TDIR/meta.json")

SRC="$ROOT"
if [ -n "$COMMIT" ]; then
  # tracked files only: untracked/ignored files in the working tree can't leak into a pinned label
  SRC="${TMPDIR:-/tmp}/atlas-bench-src/$LABEL"; rm -rf "$SRC"; mkdir -p "$SRC"
  git -C "$ROOT" archive "$COMMIT" | tar -x -C "$SRC" || { echo "✗ cannot archive $COMMIT"; exit 1; }
  # project MCP enablement is local, untracked config; pinned by hash in pins.json
  mkdir -p "$SRC/.claude"; [ -f "$ROOT/.claude/settings.local.json" ] && cp "$ROOT/.claude/settings.local.json" "$SRC/.claude/"
  if [ -n "$PATCH" ]; then ( cd "$SRC" && git apply "$ROOT/$PATCH" ) || { echo "✗ patch $PATCH does not apply to $COMMIT"; exit 1; }; fi
  [ -z "$DRY" ] && { node "$P9/budget.mjs" pre "$TASK" "$([ -n "$ONLY" ] && echo 1 || echo "$REPS")" || exit 1; }
fi

# Record the environment that shapes context (user memory + user skills load in every run)
{
  echo "date: $(date -u +%FT%TZ)"; echo "model: $MODEL"; echo "claude: $(claude --version 2>/dev/null)"
  echo "source: ${COMMIT:-working tree}${PATCH:+ + $PATCH}"
  echo "user CLAUDE.md bytes: $(wc -c < "$HOME/.claude/CLAUDE.md" 2>/dev/null || echo 0)"
  echo "user skills: $(ls "$HOME/.claude/skills" 2>/dev/null | tr '\n' ' ')"
} > "$OUT/env.txt"

TOOLS="Read,Glob,Grep,Write,Edit,MultiEdit,Skill,TodoWrite,Bash(npm run:*),Bash(npx tsc:*),Bash(node:*),Bash(ls:*)"
EXTRA=()
if [ "$TYPE" = "component" ]; then
  TOOLS="$TOOLS,Bash(npx vitest:*),mcp__figma__get_metadata,mcp__figma__get_design_context,mcp__figma__get_variable_defs,mcp__figma__get_screenshot,mcp__figma__search_design_system,mcp__figma__get_code_connect_map,mcp__figma__get_libraries,mcp__figma__whoami"
  # a Figma write can't be approved headless, so it isn't offered at all
  EXTRA=(--disallowedTools "mcp__figma__use_figma" --max-turns 60)
fi

for i in $(seq 1 "$REPS"); do
  [ -n "$ONLY" ] && [ "$i" != "$ONLY" ] && continue
  WS="${TMPDIR:-/tmp}/atlas-bench/$LABEL-$TASK-$i"; rm -rf "$WS"; mkdir -p "$WS"
  rsync -a --exclude node_modules --exclude .next --exclude .git --exclude benchmarks \
    --exclude '*.fig' --exclude .DS_Store --exclude tsconfig.tsbuildinfo \
    --exclude docs/ATLAS-AI-UPGRADE-PLAN.md "$SRC/" "$WS/"
  ln -s "$ROOT/node_modules" "$WS/node_modules"
  # atlas-verify diffs against git HEAD, so the copy is committed as-is (phase 8; phase 0 copies had no .git)
  ( cd "$WS" && git init -q && printf '/node_modules\n/.next\n' >> .git/info/exclude && git add -A \
      && git -c user.name=bench -c user.email=bench@local commit -qm "bench base" )
  if [ -n "$COMMIT" ]; then
    if [ "$TYPE" = "component" ]; then
      node "$P9/validate-fixtures.mjs" "$WS" "$TASK" --live "$P9/live-figma.json" ${PATCH:+--no-skill} > "$OUT/run-$i.fixtures.json" \
        || { echo "  ✗ fixture gate failed — see results/$LABEL/$TASK/run-$i.fixtures.json"; exit 1; }
      echo "  ✓ fixture gate"
    fi
    node "$P9/pins.mjs" check "$WS" "$LABEL" ${DRY:+--record} || exit 1
  fi
  [ -n "$DRY" ] && { echo "  · dry run: workspace ready at $WS"; continue; }
  echo "▶ $LABEL $TASK run $i/$REPS  ($WS)"
  ( cd "$WS" && claude -p "$(cat "$TDIR/prompt.md")" --model "$MODEL" \
      --output-format stream-json --verbose --permission-mode acceptEdits \
      --allowedTools "$TOOLS" ${EXTRA[@]+"${EXTRA[@]}"} \
      > "$OUT/run-$i.jsonl" 2> "$OUT/run-$i.err" )
  node "$ROOT/benchmarks/analyze.mjs" "$OUT/run-$i.jsonl" "$WS" "$TDIR/meta.json" > "$OUT/run-$i.json" \
    && echo "  ✓ analysed → results/$LABEL/$TASK/run-$i.json"
  if [ -n "$COMMIT" ]; then
    node "$P9/budget.mjs" post "$LABEL" "$TASK" "$i" "$OUT/run-$i.json" || exit 1
    node "$P9/pins.mjs" post "$LABEL" "$OUT/run-$i.jsonl" "$TYPE" || exit 1
  else
    ERR=$(node -e 'const r=require(process.argv[1]); if (r.error) console.log(r.error)' "$OUT/run-$i.json" 2>/dev/null)
    [ -n "$ERR" ] && { echo "  ✗ run $i ended in an API error — stopping: $ERR"; exit 1; }
  fi
done
[ -n "$DRY" ] && exit 0
node "$ROOT/benchmarks/summarize.mjs" "$ROOT/benchmarks/results" && echo "Summary → benchmarks/results/SUMMARY.md"
