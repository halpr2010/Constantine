#!/usr/bin/env bash
# overnight.sh — work the backlog unattended, leaving branches to review.
#
# One loop.sh cycle per task. Every candidate branches from `best` and NOTHING
# is promoted: the critic has already been demonstrably confident and wrong
# (see experiments.md 20260907-184421-1), so an unattended promotion would let
# a rejected design become the base for everything after it. Independent
# branches cost a little duplicated effort and cannot compound a mistake.
#
# Tasks are ordered by what is worth having in the morning, not by cost.
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p .loop

# overnight.sh [SKIP] — skip the first SKIP tasks, to resume an interrupted run.
SKIP="${1:-0}"
SUMMARY=".loop/overnight-$(date +%Y%m%d-%H%M).md"
START_TIME=$(date +%s)

# "N<TAB>task". N>1 only where variety is worth more than breadth.
TASKS=$(cat <<'EOF'
2	Rebuild the §5 ambient background. Read the REWRITTEN "Ambient background" entry in DESIGN.md §5 first - it was rewritten on 08 Sep after two candidates built to the old wording were rejected as "completely static". THE EFFECT COMES FIRST: the field must visibly and continuously move of its own accord - slow fluid drift, lobes crossing and separating, the surface never still - with cursor reactivity modulating that motion rather than replacing it. A field that only moves when the cursor moves does not satisfy this and will fail tests/gimmicks.spec.ts "ambient field moves on its own, with no cursor input". It must also be clearly visible as atmosphere; "ambient field is visible, not imperceptible" checks that it is not a flat fill. Both floors are currently red and are yours to turn green. Mount it with data-testid="ambient-field". Continuous compositor-driven animation is explicitly NOT an FPS violation. It still must never sit behind the technical register, and must be a still image under prefers-reduced-motion.
2	Make the page flow rather than stack. Read the AMENDED "Motion carries information" entry in DESIGN.md §5 - the previous ban on entrance animation was LIFTED on 08 Sep because the founder asked for exactly that mechanism: "when you scroll, features go from hidden to appearing in turn, or changing colour, or fading in... at the moment you get block colours at each new section". Build scroll-driven progressive disclosure across the page: content arriving in sequence rather than all at once, and register changes reading as transitions instead of the hard colour edges they are today. Open design-refs/Claryo-scroll-1.png, -2.png and -3.png first. Motion must feel authored and sequenced, carrying the argument forward - not one uniform fade-and-slide applied to every block, which is what the old ban was protecting against. Everything must freeze under prefers-reduced-motion with every element in its final revealed state, and the existing reduced-motion floor will check it. Do not touch the hero demos (§3).
1	Rework the Outputs section figures. The section itself was praised - do not redesign it. The single problem is that the people read as flat icons. Open design-refs/Playvision-design-anoymous-player.png and the CLARIFIED "People are never identifiable" entry in DESIGN.md §5. The reference figures are VOLUMETRIC: real human proportion and pose, visible musculature and depth, a grainy luminous grey-white surface with soft glowing edges, like depth-sensor output. They read as a real person rendered anonymous, not as a pictogram. No facial detail may resolve - that rule is absolute and is what makes the anonymity real. Build this in code (SVG/CSS/canvas) against tokens; if you conclude it genuinely cannot be reached without a produced image asset, say so explicitly in your commit message rather than shipping a weak approximation.
EOF
)

{
  echo "# Overnight run — $(date '+%Y-%m-%d %H:%M')"
  echo
  echo "Base: \`best\` = $(git rev-parse --short best). Nothing promoted; every"
  echo "branch below is yours to review."
  echo
} > "$SUMMARY"

i=0
while IFS=$'\t' read -r N TASK; do
  [ -z "${TASK:-}" ] && continue
  i=$((i+1))
  [ "$i" -le "$SKIP" ] && { echo "──── task $i skipped (resume)"; continue; }
  SHORT="$(printf '%s' "$TASK" | cut -c1-70)"
  echo
  echo "████ task $i (N=$N) — $SHORT…"
  echo "     $(date '+%H:%M')"
  # Mark the ledger before the cycle so the summary reports THIS task's rows.
  # Reading "the last N rows" reported task 1's verdict under all eight
  # headings on the first run.
  BEFORE=$(grep -c '^| 20' experiments.md 2>/dev/null || echo 0)

  if ! ./scripts/loop.sh "$N" "$TASK" 2>&1 | sed 's/^/     /'; then
    echo "     !! task $i did not complete cleanly — continuing"
  fi

  # A dirty tree stops every later task dead (loop.sh refuses to start), so
  # never carry one forward. Anything left uncommitted here is a bug worth
  # seeing in the morning, not worth losing the night to.
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "     !! tree left dirty by task $i — committing so later tasks can run"
    git add -A && git commit -q -m "overnight: salvage uncommitted state after task $i" || true
  fi

  {
    echo "## Task $i — $SHORT…"
    echo
    ROWS=$(grep '^| 20' experiments.md 2>/dev/null | tail -n +$((BEFORE + 1)))
    [ -n "$ROWS" ] && printf '%s\n' "$ROWS" || echo "_no candidate completed_"
    echo
  } >> "$SUMMARY"
done <<< "$TASKS"

MINS=$(( ($(date +%s) - START_TIME) / 60 ))
{
  echo "## Branches to review"
  echo
  git branch --list 'cand-*' --sort=-committerdate | sed 's/^..//' | sed 's/^/- `/;s/$/`/'
  echo
  echo "Ran $i task(s) in ${MINS} min. Promote with:"
  echo '```'
  echo "git checkout best && git merge --ff-only <branch>"
  echo "./scripts/floors.sh --baseline"
  echo '```'
} >> "$SUMMARY"

echo
echo "══ overnight complete — ${MINS} min ═══════════════════"
cat "$SUMMARY"
