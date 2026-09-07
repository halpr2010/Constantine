#!/usr/bin/env bash
# capture.sh <label> — the critic's evidence for one candidate.
#
# Captures the six §7 views at both widths and both verticals, in ALL FOUR
# palettes, plus one full-page strip per palette. The palette is deliberately
# not pinned (§5 UNDER EVALUATION), so a candidate has to be judged in every
# register mapping it will have to live in — a feature that only composes in
# the dark theme is not finished.
set -euo pipefail
cd "$(dirname "$0")/.."
LABEL="${1:?usage: capture.sh <label>}"
rm -rf "shots/$LABEL"
for t in "" light-canvas dark-canvas instrument; do
  node scripts/screenshot.mjs "$LABEL/${t:-dark}" "$t" > /dev/null
done
node scripts/strip.mjs > /dev/null
mkdir -p "shots/$LABEL/strips" && cp shots/strips/*.png "shots/$LABEL/strips/"
echo "captured → shots/$LABEL ($(find "shots/$LABEL" -name '*.png' | wc -l | tr -d ' ') images)"
