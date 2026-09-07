# Experiments ledger

One row per candidate. `next_experiment` from each verdict seeds the next
cycle — this file is the only channel by which the loop learns anything, so a
rejected candidate with a sharp lesson is worth more than a vague promotion.

Written by `scripts/loop.sh`. Add human verdicts by hand; mark them **(human)**.

## Baseline — cycle 0

Recorded at `best` = `d5fa7cb` + registers/palette-floor.

| Measure | State |
|---|---|
| Playwright | 39 tests, 4 red (all §5 features not yet built) |
| Copy violations | 9 (`X, not Y`), absolute ban, ratcheted |
| Palettes live | 4 — dark, light-canvas, dark-canvas, instrument; none pinned |
| Registers | canvas / product / technical, full-token remap, floor-tested |

Known red, and deliberately so:

- `scroll progress bar exists, starts empty, completes at page end`
- `viewport-fit: tagged sections compose within one screen (desktop)`
- `viewport-fit: tagged sections compose within one screen (mobile)`
- `reduced motion: page is static and complete`

## Cycles

| # | Candidate | Floors | D1 | D2 | D3 | D4 | D5 | Verdict | Lesson |
|---|---|---|---|---|---|---|---|---|---|
