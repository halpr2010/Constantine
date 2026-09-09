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

APPROACHES=""      # accumulates one line per built candidate
SURVIVORS=()

for i in $(seq 1 "$N"); do
  BRANCH="cand-$CYCLE-$i"
  echo
  echo "── candidate $i/$N — $BRANCH ────────────────────────"
  git checkout -q "$BEST" && git checkout -q -b "$BRANCH"

  DIVERSITY=""
  if [ -n "$APPROACHES" ]; then
    DIVERSITY="
APPROACHES ALREADY TAKEN IN THIS BURST — you must take a DIFFERENT one. Not a
variation in a value or a tuned parameter: a different mechanism, a different
composition, a different read of the reference. A near-twin of any of these is
rejected as a duplicate and occupies no slot, so it is wasted work:
$APPROACHES"
  fi

  claude -p --permission-mode acceptEdits --model opus \
    "You are candidate $i of $N in a VARIANT BURST on this repo. The founder
will see every candidate that clears the bar, ranked — so your job is to be a
genuinely distinct, fully-realised option, not a safe average of the others.

Read CLAUDE.md, DESIGN.md, design-refs/REFERENCES.md and experiments.md first.

Task: $TASK
$DIVERSITY

Constraints:
- ./scripts/floors.sh must pass. Run it. If it fails, fix it. A broken
  candidate is discarded before anyone looks at it.
- Never edit anything in .loop/ — those are the gate's baselines.
- Four palettes are live and none is pinned; your work must render correctly in
  all four.
- Commit on this branch. FIRST LINE of the commit message must be a one-line
  statement of YOUR APPROACH, in the form 'Approach: <what makes this
  different>'. That line is read back to later candidates and to the critic, so
  make it specific about mechanism." \
    > "$LOG/build-$i.log" 2>&1

  APPROACH="$(git log --format=%s -1 2>/dev/null | sed 's/^Approach: //')"
  echo "   approach: ${APPROACH:0:88}"

  if ! ./scripts/floors.sh > "$LOG/floors-$i.txt" 2>&1; then
    echo "   DISCARDED — floors failed"
    grep -m3 -E '✗|FAIL —' "$LOG/floors-$i.txt" | sed 's/^/     /'
    continue
  fi
  echo "   floors passed"
  APPROACHES="$APPROACHES
- $BRANCH: $APPROACH"
  SURVIVORS+=("$BRANCH")
  rm -rf "shots/$BRANCH" && ./scripts/capture.sh "$BRANCH" > /dev/null
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
