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
| 20260907-193223-1 | cand-20260907-193223-1 | pass | cand | cand | tie | tie | cand | promote | Give the field visible overlap structure in the two palettes where it currently reads as one flat radial vignette rather than crossing fields: in instrument and light-canvas the hero shows a single centre-weighted wash, while dark-canvas shows two distinguishable lobes and is much closer to Slingshot-CTA-Title-Page.png. Try three or four fields per palette with deliberately offset centres pushed toward the frame edges so at least two overlaps fall inside the 1440x900 hero band, and hold the per-field alpha where it is so the intensity ceiling does not move; judge success by whether the instrument hero shows a hue shift where two fields cross rather than a smooth falloff from one centre. |
| 20260907-193223-2 | cand-20260907-193223-2 | pass | tie | cand | cand | tie | cand | promote | Close viewport-fit at 390 by rebuilding the hero demo pair as a single paged card. The hero section captures 390x1705 in BOTH best and candidate — 2.0x the 844px viewport — because the two full-size demo cards stack vertically below the copy block, which is exactly what the red mobile viewport-fit floor is measuring; the second card (Stairmaster / Water Lily Pond) sits entirely below the fold with roughly 250px of empty gap above it. Make the pair one card at <=430px tall with a swipe or dot pager between the two subjects, so heading, copy, CTA and one live demo compose within 844px. Keep both demos mounted and interactive so the timers still run on tap; hiding one to save height would breach P1/P2. |
| 20260907-202212-1 | cand-20260907-202212-1 | pass | cand | best | tie | best | tie | reject | Keep the scroll-margin-top offset and the viewport-section tagging exactly as built — that part is right and is the whole D1 win — then redo the 390 fit without horizontal rails: make use-cases and value a 2-up compact grid (or 4 tighter full-width cards with the body copy cut to two lines) so every card stays on screen, restore the privacy chips to full-width rows, and give the privacy panel back enough bottom padding that 'because it does not exist.' is not sliced. Then extend data-testid="viewport-section" to the how-it-works section, which is 2856px at 390 and 1960px at 1440 and is the scroll-step section the rule was written for; splitting its four steps into a pinned one-step-at-a-time sequence is the real work the floor is asking for. |
| 20260907-204637-1 | cand-20260907-204637-1 | pass | tie | tie | tie | tie | tie | reject | Fix the sticky-nav anchor collision, which is the one defect visible in these sheets and is worth a genuine D1+D2 win rather than another invisible one. At 390w in all four palettes and both verticals, jumping to an anchored section leaves its heading under the header: 'Privacy by design' is struck through by the nav bar in privacy-390 (gyms and museums), 'Fitness Space Use' plus its first copy line is struck through in gyms-use-390, and 'What you can now answer' is hidden entirely in museums-value-390 so the section opens on a bare 'THE VALUE' eyebrow. Give every anchored section a scroll-margin-top equal to the header height (measure it, do not guess — the nav is ~64px at 390w and the hairline sits on its bottom edge), tag those same sections data-testid="viewport-section", and trim the section's vertical rhythm until heading, copy and visual compose inside 390x844 and 1440x900. That closes both red viewport-fit floors and, unlike this candidate, the improvement will actually appear in the capture the critic scores. |
| 20260907-210542-1 | cand-20260907-210542-1 | FAIL | – | – | – | – | – | discarded |     ✗ gimmicks.spec.ts › P1 — Museums hero demo › cards track independently |
| 20260907-211305-1 | cand-20260907-211305-1 | pass | tie | cand | tie | cand | cand | promote | At 390w the sticky header bisects section headings when a section is scrolled to: in privacy-museums-390 "Privacy by design" is sliced through its x-height by the header in all four palettes, in both best and candidate, and value-390 puts the header block between the eyebrow and the first card. Give every anchored section a scroll-margin-top equal to the header height (plus a few px), and verify by capturing #privacy and #value at 390x844 in dark and light-canvas — the heading must clear the header entirely. Secondary, fold into the same candidate: the dark palette's product register has no surface separation from the page ground, so the new integrations panel loses its edge, its connector hairlines and its hub chip; raise the product-register surface token in dark so the panel reads as a distinct field the way it does in dark-canvas. |
| 20260907-213539-1 | cand-20260907-213539-1 | pass | cand | cand | cand | cand | tie | promote | The Use Cases block is now the flattest thing on the page: at 1440w "Museum & Gallery Use Cases" is three text-only cards about 90px tall with no visual at all, sitting directly above an Outputs section that gives every beat a ghost-silhouette panel with a floating UI fragment. Rebuild it on the same module — keep the three category cards, but give the section one panel showing the fragment that category would actually produce (a floor plan with zone counts for Museums & Galleries, a run-of-show timeline for Temporary Exhibitions, an arrivals curve for Cultural Venues) — and reuse GhostScene rather than authoring new artwork, since it is static SVG and already reads correctly in all four palettes. |
| 20260907-220250-1 | cand-20260907-220250-1 | pass | cand | cand | tie | tie | cand | promote | Close the two viewport-fit reds by tagging the right unit: museums-how at 390 is 3113px tall because all four numbered steps live in one section, so tagging the section can never fit 844px — tag each Integrate/Calibrate/Measure/Insight step as its own data-testid="viewport-section" so the unit that must compose is one step's heading + copy + visual, and cap each step's visual so the tallest (Insight, which carries two ranked cards side by side) still clears 844px at 390 and 900px at 1440. |
| 20260907-224009-1 | cand-20260907-224009-1 | pass | cand | cand | tie | cand | cand | promote | Adopt viewport-fit on #how, which §4b names as the section the rule was written for: it is 3113px tall at 390 and it also leaks horizontally — the Insight step's `w-[280px] shrink-0` card rail places its second card at x=345..625, so document.scrollWidth is 625 against a 390 viewport and the whole page scrolls sideways. Rebuild step 4 as a single-card-per-screen rail clipped inside its own overflow-x container, then tag each of the four steps data-testid="viewport-section" so heading, copy and visual land together at both widths. |
