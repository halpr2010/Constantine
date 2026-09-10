#!/usr/bin/env bash
# preview.sh <branch> [branch...] — serve candidates side by side, live.
#
# Each branch gets its own git worktree and its own port, so they run at the
# same time and you can flip between tabs. Screenshots cannot answer anything
# about a cursor-reactive field; this can.
#
# node_modules and .next are per-worktree: node_modules is symlinked back to
# the main checkout (same lockfile, so the tree is identical), .next is not,
# because two builds sharing one .next overwrite each other's output.
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
BASE_PORT=3101
PORT=$BASE_PORT
mkdir -p .preview

if [ "${1:-}" = "--stop" ]; then
  pkill -f 'next start -p 31' 2>/dev/null
  git worktree list | grep '.preview/' | awk '{print $1}' | while read -r w; do
    git worktree remove --force "$w" 2>/dev/null
  done
  rm -rf .preview
  echo "  previews stopped"
  exit 0
fi
echo

for B in "$@"; do
  WT=".preview/$B"
  if [ ! -d "$WT" ]; then
    git worktree add -f "$WT" "$B" > /dev/null 2>&1 || { echo "  ✗ $B — no such branch"; continue; }
  fi
  [ -e "$WT/node_modules" ] || ln -s "$ROOT/node_modules" "$WT/node_modules"
  ( cd "$WT" && npm run build > /dev/null 2>&1 ) || { echo "  ✗ $B — build failed"; continue; }
  ( cd "$WT" && nohup npx next start -p "$PORT" > "$ROOT/.preview/$B.log" 2>&1 & )
  for i in $(seq 1 60); do
    curl -sf -m 3 -o /dev/null "http://localhost:$PORT/" && break; sleep 1
  done
  printf '  %-28s http://localhost:%s\n' "$B" "$PORT"
  PORT=$((PORT+1))
done

echo
echo "  Theme switch (paste in the browser console on any of them):"
echo "    document.documentElement.setAttribute('data-theme','light-canvas')"
echo "    …or 'dark-canvas', 'instrument'; removeAttribute to go back to dark."
echo
echo "  Stop them all:  ./scripts/preview.sh --stop"
