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

SUMMARY=".loop/overnight-$(date +%Y%m%d-%H%M).md"
START_TIME=$(date +%s)

# "N<TAB>task". N>1 only where variety is worth more than breadth.
TASKS=$(cat <<'EOF'
2	Build the §5 ambient background: a cursor-reactive liquid gradient field, the Slingshot mechanism in OUR hues. Open design-refs/Slingshot-CTA-Title-Page.png first. Hard constraints from §5, all of them load-bearing: it lives ONLY in the product/atmosphere register, never behind the technical register; low intensity so the hero demo stays the obvious protagonist; ZERO measurable FPS impact on the demo timers; and fully static under prefers-reduced-motion, which tests/gimmicks.spec.ts checks by screenshot-hashing an idle canvas. ParticleField.tsx was deleted in the tokenisation session, so build this fresh against tokens - no colour literals. It must read correctly in all four palettes.
1	Close the two red viewport-fit floors. §5 requires every scroll-step section to compose completely within one viewport at 1440x900 and 390x844 - heading, copy and visual visible together. Adopt data-testid="viewport-section" on the sections the rule should govern (the test asserts n > 0, so the rule must actually be adopted) and make them fit. While you are in this area, fix the pre-existing bug a critic found: anchored sections have no scroll-margin-top, so a jump to #privacy leaves the heading half-clipped behind the sticky nav at 390w.
1	Close the red reduced-motion floor. Under prefers-reduced-motion the page must be static and complete: zero running Web Animations, an idle canvas whose screenshot hash does not change over 500ms, and all key content reachable by plain scroll. Read the SCOPE note in DESIGN.md §5 first - the distinction is AMBIENT vs INTERACTION. Idle and ambient motion must freeze; user-initiated response (hover or tap driving the attention and utilisation timers) is interaction feedback and must KEEP working. Killing the demos to pass this is a §3 protected-element failure, not a fix.
1	Clear the copy backlog. COPY-VIOLATIONS.md lists nine "X, not Y" and "X. Not Y." constructions; §5 bans them absolutely and the ban is NOT scoped to headings. Rewrite all nine in the target register from §5: plain, concrete, benefit-led vendor copy. Keep every claim the same - this is a rewrite, not a retreat, and the privacy claims in particular are load-bearing and floor-tested. Run ./scripts/copy-lint.sh; the baseline should fall from 9.
1	Build the "Your Stack" integrations section (§4, Pocket hub-and-spoke). Open design-refs/Pocket-Product-Features.png and Pocket-Feature-Cards-1.png first. §4's honesty guard is absolute and §9 makes it a hard prohibition: spokes are CATEGORIES of system Constantine can export to (ticketing, BI, CRM, access control), never named vendors, never logos, never anything implying a partnership that does not exist. Animated flow arrows are welcome; they must freeze under prefers-reduced-motion.
1	Build the Outputs section (§4): the data to insight to action three-beat, per PlayVision. Open design-refs/Playvision-workflow-1.png, -2.png and -3.png first. Show what an operator actually receives. Every figure must be visibly synthetic or illustrative - no fabricated client results (§9). Humans appear only as anonymised silhouettes; no identifiable faces anywhere.
1	Build the corner next-section preview (§5, Claryo) that the scroll bar is specified to pair with. Open design-refs/Claryo-scroll-1.png, -2.png and -3.png first. It keeps heavy scroll choreography navigable. It must be unobtrusive, must not overlap the hero demos at any width, and must be static under prefers-reduced-motion.
1	Build the categorised FAQ (§4, Pocket). Open design-refs/Pocket-Privacy-1.png and Pocket-Privacy-2.png first. Categories should follow the buyer's real questions - privacy, deployment, integration, commercial. Answer in the §5 copy register; no em-dash pivots, no "X, not Y" constructions, and copy-lint will check.
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
  SHORT="$(printf '%s' "$TASK" | cut -c1-70)"
  echo
  echo "████ task $i (N=$N) — $SHORT…"
  echo "     $(date '+%H:%M')"
  ./scripts/loop.sh "$N" "$TASK" 2>&1 | sed 's/^/     /'
  {
    echo "## Task $i — $SHORT…"
    echo
    tail -20 experiments.md | grep -E '^\| 20' | tail -"$N" || echo "_no rows recorded_"
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
