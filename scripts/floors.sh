#!/usr/bin/env bash
# floors.sh — the D6 gate. Runs every mechanical floor and returns one verdict.
#
# Two kinds of rule, deliberately not conflated:
#   ABSOLUTE  — starts green, must stay green (palette floor, copy floors,
#               console errors, §9 honesty guards).
#   RATCHET   — starts red, may never worsen (the four §5 design floors that
#               assert features not yet built, and copy-lint's nine).
#
# The ratchet is keyed on test IDENTITY, not on a count. A candidate that
# fixes the progress bar and breaks reduced-motion has not improved anything,
# and a net-count gate would wave it through.
#
#   floors.sh --baseline   record the currently-failing tests as the baseline
#   floors.sh              gate the worktree against that baseline
set -uo pipefail
cd "$(dirname "$0")/.."

BASELINE=".loop/tests-baseline.txt"
RESULTS=".loop/last-run.json"
mkdir -p .loop

echo "── build ─────────────────────────────────────────────"
if ! npm run build > .loop/build.log 2>&1; then
  echo "floors: FAIL — build broken"; tail -20 .loop/build.log; exit 1
fi
echo "build ok"

echo "── tests ─────────────────────────────────────────────"
PLAYWRIGHT_JSON_OUTPUT_NAME="$RESULTS" \
  npx playwright test --reporter=json > /dev/null 2>&1
[ -f "$RESULTS" ] || { echo "floors: FAIL — no test results produced"; exit 1; }

# Fully-qualified title, so two tests with the same name in different files
# stay distinguishable.
FAILED="$(node -e '
const r = require("./.loop/last-run.json");
const out = [];
const walk = (s, path) => {
  for (const su of s.suites ?? []) walk(su, [...path, su.title]);
  for (const sp of s.specs ?? [])
    if (!sp.ok) out.push([...path, sp.title].filter(Boolean).join(" › "));
};
for (const s of r.suites ?? []) walk(s, [s.title]);
console.log([...new Set(out)].sort().join("\n"));
')"

TOTAL=$(node -e 'const r=require("./.loop/last-run.json");console.log((r.stats?.expected??0)+(r.stats?.unexpected??0)+(r.stats?.flaky??0))')
NFAIL=$([ -z "$FAILED" ] && echo 0 || printf '%s\n' "$FAILED" | wc -l | tr -d ' ')
echo "$TOTAL tests, $NFAIL failing"

if [ "${1:-}" = "--baseline" ]; then
  printf '%s\n' "$FAILED" | sed '/^$/d' > "$BASELINE"
  echo "floors: baseline recorded — $NFAIL known red(s)"
  ./scripts/copy-lint.sh --baseline
  exit 0
fi

echo "── copy ──────────────────────────────────────────────"
./scripts/copy-lint.sh; COPY=$?

echo "── ratchet ───────────────────────────────────────────"
[ -f "$BASELINE" ] || { echo "floors: FAIL — no baseline (run --baseline on 'best')"; exit 2; }
CUR="$(mktemp)"; printf '%s\n' "$FAILED" | sed '/^$/d' | sort -u > "$CUR"
NEW="$(comm -13 "$BASELINE" "$CUR")"
FIXED="$(comm -23 "$BASELINE" "$CUR")"
rm -f "$CUR"

[ -n "$FIXED" ] && { echo "fixed:"; printf '%s\n' "$FIXED" | sed 's/^/    ✓ /'; }

VERDICT=0
if [ -n "$NEW" ]; then
  echo "NEW failures (not in baseline):"; printf '%s\n' "$NEW" | sed 's/^/    ✗ /'
  VERDICT=1
fi
[ "$COPY" -ne 0 ] && VERDICT=1

echo "──────────────────────────────────────────────────────"
if [ "$VERDICT" -eq 0 ]; then
  echo "floors: PASS — no new failures, no new copy violations"
  [ "$NFAIL" -eq 0 ] && echo "  (all floors absolute now: the ratchet has reached zero)"
else
  echo "floors: FAIL — candidate discarded before the critic sees it"
fi
exit $VERDICT
