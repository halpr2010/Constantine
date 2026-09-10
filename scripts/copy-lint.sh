#!/usr/bin/env bash
# copy-lint.sh — §5 copy gate, enforced as an identity ratchet.
#
# §5 bans antithesis framing ("X, not Y" / "X. Not Y.") outright. The site
# currently carries nine of them (COPY-VIOLATIONS.md), so an absolute gate
# would reject every candidate including the ones that improve matters. The
# ratchet resolves it: a candidate may never ADD a violation, and adding is
# judged by IDENTITY — file plus matched text — not by net count. Otherwise a
# candidate could delete one violation, invent a worse one, and pass.
#
# Once the baseline reaches zero the ratchet is equivalent to the absolute
# ban, and §5 is enforced as written with no rule change needed.
#
#   copy-lint.sh --baseline   rewrite .loop/copy-baseline.txt from the worktree
#   copy-lint.sh              check the worktree against that baseline
#
# Scope: source files, because the ratchet keys on the file an agent edits.
# The em-dash budget is checked on rendered text instead (tests/copy.spec.ts):
# §5 states it per visible page, and source cannot tell rendered copy from an
# email subject line.
set -uo pipefail
cd "$(dirname "$0")/.."

BASELINE=".loop/copy-baseline.txt"
CURRENT="$(mktemp)"
trap 'rm -f "$CURRENT"' EXIT

# Emit "file<TAB>matched text" for every violation. Comments are stripped
# first: this file and DESIGN.md discuss the banned constructions by name, and
# a lint that trips over its own documentation is noise.
scan() {
  local f
  for f in $(git ls-files 'src/**/*.tsx' 'src/**/*.ts' | sort); do
    perl -0777 -ne '
      s{//[^\n]*}{}g;              # line comments
      s{/\*.*?\*/}{}gs;            # block comments
      s{\{/\*.*?\*/\}}{}gs;        # JSX comments
      while (/([^.!?\n]{6,}?,\s+not\s+[^.!?\n]{2,80}?)(?=[.!?"<{]|$)/gi) {
        my $m = $1; $m =~ s/\s+/ /g; $m =~ s/^\s+|\s+$//g;
        print "'"$f"'\t$m\n";
      }
      while (/((?:[A-Za-z][^.!?\n]{4,80})\.\s+Not\s+[^.!?\n]{2,60}\.)/g) {
        my $m = $1; $m =~ s/\s+/ /g; $m =~ s/^\s+|\s+$//g;
        print "'"$f"'\t$m\n";
      }
    ' "$f"
  done | sort -u
}

scan > "$CURRENT"
N=$(wc -l < "$CURRENT" | tr -d ' ')

if [ "${1:-}" = "--baseline" ]; then
  mkdir -p .loop
  cp "$CURRENT" "$BASELINE"
  echo "copy-lint: baseline recorded — $N violation(s)"
  exit 0
fi

if [ ! -f "$BASELINE" ]; then
  echo "copy-lint: FAIL — no baseline at $BASELINE (run --baseline on 'best')"
  exit 2
fi

BN=$(wc -l < "$BASELINE" | tr -d ' ')
ADDED=$(comm -13 "$BASELINE" "$CURRENT")
REMOVED=$(comm -23 "$BASELINE" "$CURRENT")

[ -n "$REMOVED" ] && {
  echo "copy-lint: $(printf '%s\n' "$REMOVED" | wc -l | tr -d ' ') violation(s) removed:"
  printf '%s\n' "$REMOVED" | sed 's/^/    - /'
}

if [ -n "$ADDED" ]; then
  echo "copy-lint: FAIL — $(printf '%s\n' "$ADDED" | wc -l | tr -d ' ') NEW violation(s) (baseline $BN, now $N):"
  printf '%s\n' "$ADDED" | sed 's/^/    + /'
  exit 1
fi

if [ "$N" -eq 0 ]; then
  echo "copy-lint: PASS — zero violations; the ratchet is now the absolute §5 ban"
else
  echo "copy-lint: PASS — no new violations ($N carried from a baseline of $BN)"
fi
