# §5 copy violations — CLEARED

Source: all visible text rendered at http://localhost:3000, both verticals,
hidden panels excluded.

**Status: all nine rewritten.** `copy-lint.sh` reports 0 violations against a
baseline of 9, so the ratchet is now equivalent to the absolute §5 ban.

The adjudication question this file originally posed — rewrite the copy, or
scope the rule — was settled in DESIGN.md §5 on 30 Aug 2026: the ban is
absolute, not scoped to display headings or problem statements. This file was
still proposing a scoping compromise ("permit it in display headings and the
problem statement"); that option is closed, and the record below is what was
written instead.

Em-dashes: **0** in visible copy on both verticals, unchanged. (Two remain in
`PilotForm.tsx`, only in the outbound email's `subject` and `from_name` —
never rendered on the page.)

## What changed

Every claim is carried over intact. The antithesis frame was load-bearing
rhetorically and not at all factually: in each case the "not Y" half restated
the negative space of the "X" half, so the rewrite states the limit or the
benefit directly instead of staging a contrast.

### "X. Not Y." — both were section headings

| # | Vertical | Before | After |
|---|---|---|---|
| 1 | Museums | You can measure who came in. Not what held them. | Your visitor numbers stop at the gallery door. |
| 2 | Gyms | Your CRM records who cancelled. Not the friction that made them. | Your CRM records the cancellation and none of the friction behind it. |

Both were two-sentence contrasts, which §5 also flags as staccato aphorism
runs. One sentence each now, and the two verticals share an opening ("Your …")
so the switcher reads as one voice.

### "X, not Y"

| # | Location | Before | After |
|---|---|---|---|
| 3 | hero subtitle (both) | …movement, not just footfall. | …movement, beyond the footfall you already count. |
| 4 | Museums `#problem` point 1 | Footfall counts visits, not engagement. | Footfall counts visits and leaves engagement unmeasured. |
| 5 | Museums `#value` card 2 | …against a real before-and-after, not a hunch. | …against a real before-and-after, so you know whether it worked. |
| 6 | Gyms `#problem` point 1 | Turnstile counts entries, not what happens inside. | Turnstile data ends at the door and never reaches the floor. |
| 7 | Gyms `#problem` point 2 | Churn models see the outcome, not the cause. | Churn models flag the outcome once the cause has already happened. |
| 8 | Gyms `#value` card 1 | …follow real demand, not guesswork. | …follow real demand. |
| 9 | Gyms `#value` card 3 | …drops out of pattern the same day, not a week later. | …drops out of pattern on the same day it happens. |

Notes on the two that changed shape rather than wording:

- **3** kept the claim that Constantine measures past footfall. "beyond the
  footfall you already count" also does work the original did not: it tells a
  buyer the product adds to their existing counting rather than replacing it.
- **8** dropped its second half outright. "real demand" already carries the
  claim; "not guesswork" was the rhetorical figure and nothing else.
- **9**'s load-bearing claim is same-day detection, which survives verbatim.
  "not a week later" was a comparison to no stated baseline.

## Still not found

- Staccato aphorism runs: none.
- "That's why…" conclusions: none (floor-tested in `copy.spec.ts`).
- Solemn first-person essay tone: none detected mechanically; D4/D6 critic
  territory.

## Keeping it at zero

`copy-lint.sh` keys on violation IDENTITY (file + matched text), so a future
candidate cannot trade one of these back for a new one and pass on arithmetic.
With the baseline at zero every match is a new match, and the gate is the §5
ban as written. Nothing in `.loop/` was touched to get here; the baseline is
rewritten only by `--baseline` on `best` at promotion.
