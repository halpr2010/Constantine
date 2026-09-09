#!/usr/bin/env bash
# commit-to-best.sh "<message>" — commit the working tree to `best`, and refuse
# if that is not where we are.
#
# Three separate times, harness work I committed landed on a candidate branch
# instead of best: the loop owns the working tree and checks branches out under
# me, so "check the branch, then commit" is a race I lose. The toolchain, the
# reviewers, a founder-reported bug fix and the parallelisation all had to be
# cherry-picked back afterwards. Checking BEFORE the commit is not enough — this
# checks after, and says so loudly.
set -uo pipefail
cd "$(dirname "$0")/.."
MSG="${1:?usage: commit-to-best.sh \"<message>\"}"

if pgrep -f 'scripts/(overnight|loop|burst)\.sh' >/dev/null; then
  echo "REFUSING: a run owns this working tree. Stop it first, or you will"
  echo "commit onto whatever branch it last checked out."
  exit 1
fi

BR="$(git rev-parse --abbrev-ref HEAD)"
[ "$BR" = "best" ] || { echo "REFUSING: on '$BR', not 'best'."; exit 1; }

git add -A
git commit -q -m "$MSG" || { echo "nothing to commit"; exit 0; }

AFTER="$(git rev-parse --abbrev-ref HEAD)"
if [ "$AFTER" != "best" ]; then
  echo "WARNING: HEAD moved to '$AFTER' during the commit — verify placement."
  exit 1
fi
echo "committed to best: $(git log --oneline -1)"
