#!/bin/bash
# Generates a paste-ready context dump for starting a new Gemini session.
# Usage: ./scripts/context.sh        (prints to stdout)
#        ./scripts/context.sh | pbcopy  (copies to clipboard on macOS)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== PROJECT CONTEXT FOR GEMINI ==="
echo "Generated: $(date '+%Y-%m-%d %H:%M')"
echo ""

echo "--- PROJECT OVERVIEW (CLAUDE.md) ---"
cat "$ROOT/CLAUDE.md"
echo ""
echo ""

echo "--- DEVELOPMENT PLAN (docs/PLAN.md) ---"
cat "$ROOT/docs/PLAN.md"
echo ""
echo ""

echo "--- TASK BOARD (docs/TASKS.md) ---"
cat "$ROOT/docs/TASKS.md"
echo ""
echo ""

echo "--- RECENT WORK (docs/WORKLOG.md) ---"
cat "$ROOT/docs/WORKLOG.md"
echo ""
echo ""

echo "--- FILE TREE ---"
cd "$ROOT"
find app src -type f -name '*.ts' -o -name '*.tsx' | sort
echo ""
echo ""

echo "--- INSTRUCTIONS ---"
echo "You are helping plan features for The Flow Journal, a React Native gym tracking app."
echo "Use the context above to understand what exists and what's planned."
echo "When we finalize a plan, I will update docs/PLAN.md in the repo."
echo "=== END CONTEXT ==="
