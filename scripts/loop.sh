#!/usr/bin/env bash
# loop.sh — run one cycle of N candidates against DESIGN.md.
#
#   ./scripts/loop.sh [N] [task]
#
# Each candidate: branch off `best` → build → mechanical gate → capture in all
# four palettes → pairwise critic → record. The gate runs BEFORE the critic on
# purpose: a candidate that breaks a floor is discarded without spending critic
# attention, which is the expensive part.
#
# Nothing is ever promoted automatically. A winning candidate's branch is left
# in place and named; promoting it to `best` is a human decision (§8).
set -uo pipefail
cd "$(dirname "$0")/.."

N="${1:-5}"
TASK="${2:-}"
CYCLE="$(date +%Y%m%d-%H%M%S)"
LOG=".loop/cycle-$CYCLE"
mkdir -p "$LOG"

command -v claude >/dev/null || { echo "loop: claude CLI not found"; exit 1; }
git diff --quiet && git diff --cached --quiet || {
  echo "loop: working tree is dirty — commit or stash first"; exit 1; }

START="$(git rev-parse --abbrev-ref HEAD)"
BEST="best"
git rev-parse --verify -q "$BEST" >/dev/null || { echo "loop: no '$BEST' branch"; exit 1; }

# The critic compares against `best`, so capture it once per cycle rather than
# once per candidate.
echo "══ capturing best ═══════════════════════════════════"
git checkout -q "$BEST"
npm run build > /dev/null 2>&1
pkill -f 'next-server' 2>/dev/null; sleep 1
nohup npx next start -p 3000 > /dev/null 2>&1 &
for i in $(seq 1 60); do curl -sf -m 5 -o /dev/null http://localhost:3000/ && break; sleep 1; done
./scripts/capture.sh best

WINNERS=()
for i in $(seq 1 "$N"); do
  BRANCH="cand-$CYCLE-$i"
  echo
  echo "══ candidate $i/$N — $BRANCH ═════════════════════════"
  git checkout -q "$BEST" && git checkout -q -b "$BRANCH"

  # The builder gets the constitution, the ledger and the gate. It does not get
  # the critic's rubric: a builder that optimises for the judge writes to the
  # rubric instead of to the design.
  claude -p --permission-mode acceptEdits --model opus \
    "You are candidate $i of $N in a design build loop on this repo.

Read CLAUDE.md, DESIGN.md and experiments.md first.

Task: ${TASK:-Pick the highest-value item from the opening backlog in CLAUDE.md, or the next_experiment from the most recent cycle in experiments.md if there is one. Do ONE coherent thing well rather than several things partially.}

Constraints:
- ./scripts/floors.sh must pass before you finish. Run it. If it fails, fix it.
- Never edit anything in .loop/ — those are the gate's baselines.
- Four palettes are live and none is pinned. Whatever you build must render
  correctly in all four; tests/themes.spec.ts will check.
- Commit your work on this branch with a message explaining the WHY.

You are candidate $i: if experiments.md shows an approach already tried, take a
genuinely different one rather than repeating it." \
    > "$LOG/build-$i.log" 2>&1

  echo "── gate ─────────────────────────────────────────────"
  if ! ./scripts/floors.sh > "$LOG/floors-$i.txt" 2>&1; then
    echo "DISCARDED — floors failed"
    tail -12 "$LOG/floors-$i.txt" | sed 's/^/    /'
    echo "| $CYCLE-$i | $BRANCH | FAIL | – | – | – | – | – | discarded | $(grep -m1 -E '✗|FAIL —' "$LOG/floors-$i.txt" | sed 's/|/;/g') |" >> experiments.md
    continue
  fi
  echo "floors passed"
  cp "$LOG/floors-$i.txt" .loop/floors.txt

  echo "── capture ──────────────────────────────────────────"
  pkill -f 'next-server' 2>/dev/null; sleep 1
  nohup npx next start -p 3000 > /dev/null 2>&1 &
  for j in $(seq 1 60); do curl -sf -m 5 -o /dev/null http://localhost:3000/ && break; sleep 1; done
  rm -rf shots/candidate && ./scripts/capture.sh candidate

  echo "── critic ───────────────────────────────────────────"
  rm -f .loop/verdict.json
  claude -p --permission-mode acceptEdits --model opus \
    "Read scripts/critic.md and follow it exactly. Judge shots/candidate against
shots/best. Write .loop/verdict.json and nothing else." \
    > "$LOG/critic-$i.log" 2>&1

  if [ -f .loop/verdict.json ]; then
    cp .loop/verdict.json "$LOG/verdict-$i.json"
    node -e '
      const v = require("./.loop/verdict.json"), d = v.dimensions ?? {};
      const c = (k) => (d[k]?.winner ?? "?").replace("candidate","cand");
      const row = ["'"$CYCLE-$i"'", "'"$BRANCH"'", "pass",
        c("D1"), c("D2"), c("D3"), c("D4"), c("D5"),
        v.verdict ?? "?", (v.next_experiment ?? "").replace(/\|/g, ";")];
      require("fs").appendFileSync("experiments.md", "| " + row.join(" | ") + " |\n");
      console.log("  verdict:", v.verdict, "—", v.reason ?? "");
      console.log("  next:", v.next_experiment ?? "(none)");
    '
    [ "$(node -pe 'require("./.loop/verdict.json").verdict' 2>/dev/null)" = "promote" ] && WINNERS+=("$BRANCH")
  else
    echo "  critic produced no verdict — see $LOG/critic-$i.log"
    echo "| $CYCLE-$i | $BRANCH | pass | – | – | – | – | – | no verdict | critic failed to write verdict.json |" >> experiments.md
  fi
done

git checkout -q "$START"
echo
echo "══ cycle $CYCLE complete ═════════════════════════════"
if [ ${#WINNERS[@]} -eq 0 ]; then
  echo "no candidate won. Two such cycles in a row means the spec is exhausted"
  echo "and needs sharpening, not more candidates (§8 plateau rule)."
else
  echo "won: ${WINNERS[*]}"
  echo
  echo "Promotion is a human decision (§8). To promote:"
  echo "    git checkout best && git merge --ff-only ${WINNERS[0]}"
  echo "    ./scripts/floors.sh --baseline    # re-arm the ratchets"
fi
echo "logs: $LOG   ledger: experiments.md"
