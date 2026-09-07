# §5 copy violations — for adjudication

Source: all visible text rendered at http://localhost:3000, both verticals,
hidden panels excluded. Nothing has been rewritten. Each line needs a
decision: **rewrite the copy**, or **scope the §5 rule** so it does not apply
here (e.g. permit the construction in display headings, ban it in prose).

Em-dashes: **0** in visible copy on both verticals. The §5 limit of 2 per
page is satisfied. (Two em-dashes remain in `PilotForm.tsx` but only in the
outbound email's `subject` and `from_name` — never rendered on the page.)

## "X. Not Y." — the antithesis cousin, §5 banned

| # | Vertical | Section | Text |
|---|---|---|---|
| 1 | Museums | `#problem` h2 | "You can measure who came in. Not what held them." |
| 2 | Gyms | `#problem` h2 | "Your CRM records who cancelled. Not the friction that made them." |

Both are the section's main heading. These were written to the brief supplied
on 30 Aug, which post-dates §5.

## "X, not Y" — antithesis framing, §5 banned

| # | Vertical | Section | Text |
|---|---|---|---|
| 3 | both | hero subtitle | "…attention, engagement and movement, not just footfall." |
| 4 | Museums | `#problem` point 1 | "Footfall counts visits, not engagement." |
| 5 | Museums | `#value` card 2 | "…against a real before-and-after, not a hunch." |
| 6 | Gyms | `#problem` point 1 | "Turnstile counts entries, not what happens inside." |
| 7 | Gyms | `#problem` point 2 | "Churn models see the outcome, not the cause." |
| 8 | Gyms | `#value` card 1 | "…follow real demand, not guesswork." |
| 9 | Gyms | `#value` card 3 | "…drops out of pattern the same day, not a week later." |

## Not found

- Staccato aphorism runs: none detected.
- "That's why…" conclusions: none.
- Solemn first-person essay tone: none detected mechanically; D4/D6 critic
  territory.

## Why this matters before the loop starts

`scripts/copy-lint.sh` (Phase 4) fails on any "X, not Y" construction. As it
stands the current site fails its own floor gate, so **every candidate would
be rejected before the critic ever sees it**. One of these has to move: the
copy, or the rule.

Worth noting the tension: this construction is doing real work in the Problem
section, where the whole point is a contrast between what operators can
measure and what they cannot. A blanket ban may be the wrong instrument.
A plausible scoping: permit it in display headings and the problem statement,
ban it in body prose and card copy — which would clear 1, 2 and 4/6/7 and
leave 3, 5, 8, 9 to rewrite.
