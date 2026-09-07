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
| 20260907-184421-1 | cand-20260907-184421-1 | pass | tie | cand | cand | tie | cand | promote | The graduations hang downward out of the nav rail into the content beneath, and at 390w that lands them on top of type the sticky nav already clips: in museums-privacy-390 the ticks strike through the half-hidden 'Privacy by design' H2, and in gyms-use-390 they cross the 'behaviour into decisions inside a club, across' body line. Fix both halves in one change — give every anchored section a scroll-margin-top equal to the nav height so its heading clears the rail at 390, and draw the graduations upward into the rail's own band so the instrument never overlays content. |

### Cycle 20260907-184421 — post-mortem (human verdict overrides critic)

**(human)** REJECTED the graduated-rule scroll bar. Critic said promote on
D2/D3/D5; founder rejected on sight. The critic was not wrong by its own
lights — it was reasoning without the reference.

Root cause, three layers, all upstream of the builder:

1. `DESIGN.md` §5 described the Slingshot bar as "a measurement instrument in
   the site's data-overlay idiom, not a generic loading strip". The reference
   shows a plain hairline. The spec editorialised a reference into a brief.
   (The gloss was itself an "X, not Y" construction, in the section that bans
   them.)
2. The cycle's task prompt repeated that gloss, hardening it.
3. **Nothing in the harness ever opened `design-refs/`.** Neither `CLAUDE.md`
   nor `scripts/critic.md` mentioned the directory, so the builder never saw
   `Slingshot-Scroll-Bar-1.png` and the critic praised the result for exactly
   the property that was wrong.

Layer 3 is the real defect: it would have produced the same drift for Claryo,
Pocket and Playvision. Fixed by adding a References section to both files,
with the rule that where prose and image disagree, the image wins.

Rebuilt as one hairline on the header's bottom edge. Floors still pass and the
390w graduation overlap the critic found is gone with the graduations.

**Lesson for later cycles:** a candidate can be faithful to the spec and still
be wrong, when the spec paraphrases a picture. Reference entries describe the
reference; interpretation belongs in the candidate.
