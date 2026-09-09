#!/usr/bin/env bash
# burst.sh <N> <task> — generate N genuinely different options for ONE
# attribute, gate them hard, rank the survivors, and serve every one that
# clears the bar.
#
# Why this exists alongside loop.sh: loop.sh uses Best-of-N as a FILTER, so
# even at N=8 the founder sees one survivor. Here it is a GENERATOR. The
# founder's constraint was explicit — "I still want a very high bar set as to
# the outputs that I review, I would just like more options that take
# different approaches" — so the bar does not move. What changes is that
# everything clearing it gets shown, ranked, instead of all but one being
# thrown away.
#
# Two mechanisms make the options actually different:
#   1. Each builder is told what approaches earlier candidates in this burst
#      already took, and must take another. loop.sh only ever said "you are
#      candidate i of N", which is why A and B kept arriving near-identical.
#   2. The ranking critic rejects a candidate that merely duplicates another,
#      so a near-twin cannot occupy a slot.
set -uo pipefail
cd "$(dirname "$0")/.."

N="${1:?usage: burst.sh <N> <task>}"
TASK="${2:?usage: burst.sh <N> <task>}"
CYCLE="$(date +%Y%m%d-%H%M%S)"
LOG=".loop/burst-$CYCLE"
ROOT="$(pwd)"
# Builders run concurrently. They spend nearly all their time waiting on the
# model rather than on CPU, so the limit is memory and the odd overlapping
# `next build`, not cores.
LANES="${BURST_LANES:-4}"
# Guarantee at least two waves. With N=4 and 4 lanes the whole burst ran blind
# and three of four converged on "cards grow upward off a shared datum", which
# defeats the point. Halving the lanes costs wall-clock and buys back the
# diversity signal that makes the options genuinely different.
[ "$LANES" -gt $(( (N + 1) / 2 )) ] && LANES=$(( (N + 1) / 2 ))
[ "$LANES" -lt 1 ] && LANES=1
mkdir -p "$LOG"

command -v claude >/dev/null || { echo "burst: claude CLI not found"; exit 1; }
git diff --quiet && git diff --cached --quiet || {
  echo "burst: working tree is dirty — commit or stash first"; exit 1; }

START="$(git rev-parse --abbrev-ref HEAD)"
BEST="best"
git rev-parse --verify -q "$BEST" >/dev/null || { echo "burst: no '$BEST' branch"; exit 1; }

serve() {  # serve() <dir> <port>
  ( cd "$1" && nohup npx next start -p "$2" >/dev/null 2>&1 & )
  for _ in $(seq 1 90); do curl -sf -m 3 -o /dev/null "http://localhost:$2/" && return 0; sleep 1; done
  return 1
}

echo "══ burst $CYCLE — $N candidates ══════════════════════"
git checkout -q "$BEST"
npm run build > /dev/null 2>&1
{ P=$(lsof -ti tcp:3000); [ -n "$P" ] && kill $P; } 2>/dev/null; sleep 1
serve . 3000 || { echo "burst: best would not serve"; exit 1; }
./scripts/capture.sh best

# Build every candidate CONCURRENTLY, each in its own git worktree on its own
# port. Sequential building is what turned an 8-candidate burst into a
# 6.75-hour night: ~50 minutes each, almost all of it idle.
#
# The cost is the diversity signal — a candidate can only be told about
# approaches that finished before it started. So lanes go in WAVES of $LANES,
# and each wave learns what every earlier wave did. Within a wave candidates are
# blind to each other; the ranking critic rejects duplicates anyway.
mkdir -p .burst
APPROACHES=""
SURVIVORS=()
BUILT=()

i=0
while [ "$i" -lt "$N" ]; do
  WAVE=()
  for _ in $(seq 1 "$LANES"); do
    [ "$i" -ge "$N" ] && break
    i=$((i+1))
    BRANCH="cand-$CYCLE-$i"; WT=".burst/$BRANCH"; PORT=$((3200 + i))
    git worktree add -f -b "$BRANCH" "$WT" "$BEST" >/dev/null 2>&1 || { echo "  x $BRANCH worktree"; continue; }
    ln -s "$ROOT/node_modules" "$WT/node_modules" 2>/dev/null
    DIV=""
    [ -n "$APPROACHES" ] && DIV="
APPROACHES ALREADY TAKEN IN THIS BURST - you must take a DIFFERENT one. Not a
variation in a value or a tuned parameter: a different mechanism, a different
composition, a different read of the reference. A near-twin is rejected as a
duplicate and occupies no slot, so it is wasted work:
$APPROACHES"
    ( cd "$WT" && PORT="$PORT" SITE_URL="http://localhost:$PORT" \
      claude -p --permission-mode acceptEdits --model opus \
      "You are candidate $i of $N in a VARIANT BURST. The founder sees every
candidate that clears the bar, ranked - so be a genuinely distinct, fully
realised option, not a safe average of the others.

Read CLAUDE.md, DESIGN.md, design-refs/REFERENCES.md and experiments.md first.

Task: $TASK
$DIV

Constraints:
- You are in an isolated git worktree on branch $BRANCH. Other candidates build
  at the same time in their own worktrees; ignore them.
- Any server you start MUST use port $PORT, never 3000. Run the gate as
  PORT=$PORT ./scripts/floors.sh and it must pass before you finish.
- Never edit anything in .loop/ - those are the gate's baselines.
- Four palettes are live and none is pinned; your work must render in all four.
- Commit on this branch. FIRST LINE of the commit message must be
  'Approach: <what makes this different>' - it is read back to later candidates
  and to the ranking critic, so be specific about mechanism." ) \
      > "$LOG/build-$i.log" 2>&1 &
    WAVE+=("$i"); echo "   lane $i started (port $PORT)"
  done
  wait
  for j in "${WAVE[@]}"; do
    BR="cand-$CYCLE-$j"
    A="$(git log --format=%s -1 "$BR" 2>/dev/null | sed 's/^Approach: //')"
    echo "   cand $j: ${A:0:86}"
    [ -n "$A" ] && APPROACHES="$APPROACHES
- $BR: $A"
    BUILT+=("$BR")
  done
done

# Release the worktrees BEFORE gating. `git worktree add -b` leaves each branch
# checked out in its worktree, and git refuses to check out a branch that is
# checked out elsewhere - so every gating checkout failed with 2>/dev/null
# swallowing the error, and the burst reported zero survivors from four
# perfectly good candidates.
for BR in "${BUILT[@]}"; do git worktree remove --force ".burst/$BR" 2>/dev/null; done
git worktree prune

# Gate and capture sequentially in the main tree: ~5 of the ~50 minutes per
# candidate, so there is nothing to win by parallelising them.
for BR in "${BUILT[@]}"; do
  echo; echo "-- gating $BR --------------------------------------"
  git checkout -q "$BR" || { echo "   SKIPPED - cannot check out $BR"; continue; }
  if ! ./scripts/floors.sh > "$LOG/floors-${BR##*-}.txt" 2>&1; then
    echo "   DISCARDED - floors failed"
    grep -m3 -E 'x |FAIL --' "$LOG/floors-${BR##*-}.txt" | sed 's/^/     /'
    continue
  fi
  echo "   floors passed"
  SURVIVORS+=("$BR")
  rm -rf "shots/$BR" && ./scripts/capture.sh "$BR" > /dev/null
done

git checkout -q "$START"

if [ ${#SURVIVORS[@]} -eq 0 ]; then
  echo; echo "burst: no candidate survived the gate. Nothing to show."
  echo "logs: $LOG"; exit 0
fi

echo
echo "── ranking ${#SURVIVORS[@]} survivor(s) ───────────────────────"
printf '%s\n' "${SURVIVORS[@]}" > "$LOG/survivors.txt"
rm -f .loop/variants.json
claude -p --permission-mode acceptEdits --model opus \
  "Read scripts/rank.md and follow it exactly. You are ranking a variant burst.

The task these are all variants of:
$TASK

Candidates that passed the gate, with the approach each one claims:
$APPROACHES

Captures are in shots/<branch>/ for each, and shots/best/ for the incumbent.
Compare against the relevant design-refs/REFERENCES.md row and its strip.
Write .loop/variants.json and nothing else." \
  > "$LOG/rank.log" 2>&1

[ -f .loop/variants.json ] && cp .loop/variants.json "$LOG/variants.json"
echo "logs: $LOG"
