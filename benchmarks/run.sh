#!/usr/bin/env bash
# Atlas agent benchmark runner (macOS bash 3.2 compatible)
# Usage: benchmarks/run.sh <label> <task> [reps] [model]
#   e.g. benchmarks/run.sh baseline T1 3 sonnet
# Runs Claude Code headless on an isolated COPY of the repo (your working tree is never touched).
set -uo pipefail
LABEL=${1:?label, e.g. baseline}; TASK=${2:?task, e.g. T1}; REPS=${3:-3}; MODEL=${4:-${BENCH_MODEL:-sonnet}}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TDIR="$ROOT/benchmarks/tasks/$TASK"; [ -f "$TDIR/prompt.md" ] || { echo "no task $TASK"; exit 1; }
OUT="$ROOT/benchmarks/results/$LABEL/$TASK"; mkdir -p "$OUT"
command -v claude >/dev/null || { echo "claude CLI not found"; exit 1; }

# Record the environment that shapes context (user memory + user skills load in every run)
{
  echo "date: $(date -u +%FT%TZ)"; echo "model: $MODEL"; echo "claude: $(claude --version 2>/dev/null)"
  echo "user CLAUDE.md bytes: $(wc -c < "$HOME/.claude/CLAUDE.md" 2>/dev/null || echo 0)"
  echo "user skills: $(ls "$HOME/.claude/skills" 2>/dev/null | tr '\n' ' ')"
} > "$OUT/env.txt"

for i in $(seq 1 "$REPS"); do
  WS="${TMPDIR:-/tmp}/atlas-bench/$LABEL-$TASK-$i"; rm -rf "$WS"; mkdir -p "$WS"
  rsync -a --exclude node_modules --exclude .next --exclude .git --exclude benchmarks \
    --exclude '*.fig' --exclude .DS_Store --exclude tsconfig.tsbuildinfo \
    --exclude docs/ATLAS-AI-UPGRADE-PLAN.md "$ROOT/" "$WS/"
  ln -s "$ROOT/node_modules" "$WS/node_modules"
  # atlas-verify diffs against git HEAD, so the copy is committed as-is (phase 8; phase 0 copies had no .git)
  ( cd "$WS" && git init -q && printf '/node_modules\n/.next\n' >> .git/info/exclude && git add -A \
      && git -c user.name=bench -c user.email=bench@local commit -qm "bench base" )
  echo "▶ $LABEL $TASK run $i/$REPS  ($WS)"
  ( cd "$WS" && claude -p "$(cat "$TDIR/prompt.md")" --model "$MODEL" \
      --output-format stream-json --verbose --permission-mode acceptEdits \
      --allowedTools "Read,Glob,Grep,Write,Edit,MultiEdit,Skill,TodoWrite,Bash(npm run:*),Bash(npx tsc:*),Bash(node:*),Bash(ls:*)" \
      > "$OUT/run-$i.jsonl" 2> "$OUT/run-$i.err" )
  node "$ROOT/benchmarks/analyze.mjs" "$OUT/run-$i.jsonl" "$WS" "$TDIR/meta.json" > "$OUT/run-$i.json" \
    && echo "  ✓ analysed → results/$LABEL/$TASK/run-$i.json"
done
node "$ROOT/benchmarks/summarize.mjs" "$ROOT/benchmarks/results" && echo "Summary → benchmarks/results/SUMMARY.md"
