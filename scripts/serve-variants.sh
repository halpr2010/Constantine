#!/usr/bin/env bash
# serve-variants.sh — put every admitted variant in front of the founder at
# once: one preview port each, plus a contact sheet to scan before clicking.
#
# Reads .loop/variants.json, which the ranking critic wrote. Ranked order, so
# port 3101 is always the closest to the reference.
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
V="${1:-.loop/variants.json}"
[ -f "$V" ] || { echo "no variants file at $V"; exit 1; }

BRANCHES=$(node -pe '
  const v=require(process.argv[1]);
  (v.admitted||[]).sort((a,b)=>(a.rank||99)-(b.rank||99)).map(a=>a.branch).join(" ")
' "$ROOT/$V")
[ -n "$BRANCHES" ] || { echo "no admitted variants — the critic rejected them all"; exit 0; }

PORT=3101
for B in $BRANCHES; do
  WT=".preview/$B"
  { P=$(lsof -ti tcp:$PORT 2>/dev/null); [ -n "$P" ] && kill $P; } 2>/dev/null
  git worktree remove --force "$WT" 2>/dev/null
  git worktree add -f --detach "$WT" "$B" >/dev/null 2>&1 || { echo "  ✗ $B"; continue; }
  ln -s "$ROOT/node_modules" "$WT/node_modules" 2>/dev/null
  ( cd "$WT" && npm run build >/dev/null 2>&1 ) || { echo "  ✗ $B build failed"; PORT=$((PORT+1)); continue; }
  ( cd "$WT" && nohup npx next start -p "$PORT" >"$ROOT/.preview/$B.log" 2>&1 & )
  for _ in $(seq 1 90); do curl -sf -m 3 -o /dev/null "http://localhost:$PORT/" && break; sleep 1; done
  node -e '
    const v=require(process.env.ROOT+"/"+process.env.V);
    const a=(v.admitted||[]).find(x=>x.branch===process.env.B)||{};
    console.log(`  #${a.rank||"?"}  http://localhost:${process.env.PORT}  ${a.score||""}  ${(a.approach||"").slice(0,74)}`);
  ' ROOT="$ROOT" V="$V" B="$B" PORT="$PORT"
  PORT=$((PORT+1))
done

node scripts/variants-sheet.mjs "$V" 2>/dev/null && echo "  sheet → shots/variants.png"
node -pe '
  const v=require(process.argv[1]);
  const r=(v.rejected||[]);
  r.length ? "\n  rejected (not shown):\n"+r.map(x=>`    ${x.branch} — ${x.why}`).join("\n") : "";
' "$ROOT/$V"
