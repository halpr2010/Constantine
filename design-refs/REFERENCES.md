# Scored reference registry

Founder-scored, 08 Sep 2026. This is the target list. §6 of DESIGN.md says what
to take from each site in the abstract; this says **how hard to chase it** and,
where a reference is not a 10, exactly what stops it being one.

How to use it:
- **Open the strip before building anything the row names.** Strips live in
  `design-refs/strips/` and are 12 frames sampled across the clip, so motion
  reads as change between cells.
- **A 10/10 is a target to match**, not a suggestion to nod at. "Close to the
  reference" is the bar, not "better than what we had".
- **A low score is an anti-reference.** Its "why not 10" column is a defect
  list — build the opposite, and expect to be judged on it.
- Source videos are gitignored (several exceed GitHub's 100MB file limit).
  The strips are tracked and are what the loop reads.

## Targets

| Score | Reference | Strip | Attribute | What to take | Why not 10 |
|---|---|---|---|---|---|
| **10** | Claryo Selector | `Clary_Selector.png` | Entry view | "Are you a…" centred on white, three pills; hover colourises the pill; on selection the tab **drifts to the top right** and the chosen view **fades in cleanly**. Constantine's opening screen should be this, with Museums & Galleries / Gyms. | — |
| **10** | Claryo Hero | `Claryo_Ambient_Hero_Page.png` | Hero after selection | Background alternates between white technical line-work on full black and polished purple/steel imagery. Everything moves and settles cleanly. Not a 1:1 clone — the model for what a hero becomes once a vertical is chosen. | — |
| **10** | Claryo Scroll | `Claryo_Scroll_Functionality.png` | Scroll behaviour | Every scroll either changes the ground (purple/steel ↔ black-and-white technical) or fades in new content. Each scroll surfaces something. | — |
| **10** | Claryo Scroll 2 | `Claryo_Scroll_Functionality_2.png` | Stepped sections | Plan → Monitor → Orchestrate: previous step fades out, next fades in with its own imagery. Ground changes black↔white **without a visible dividing line** — scroll far enough and the page has simply become white, or black. | — |
| **10** | Claryo Ambience + Scroll 3 | `Claryo_Ambiance_and_Scroll_Functionality_3.png` | **Ambience** + stepped diagram | THE ambience target: bright purple blooms on **pure black**, continuously moving, obvious. A white technical wireframe sits on top and augments per step while the step text accumulates. | — |
| **10** | Claryo Interactive | `Claryo_Interactive_functionality.png` | Card hover | Hovering a card raises it and reveals its detail. | — |
| **10** | PlayVision People | `Playvision_People_Movement.png` | Figures + scroll data | Animated figures, bodies annotated, insights surfacing on scroll; the data bound to each figure changes as you scroll. The deck framing around it is NOT wanted. | — |
| **10** | PlayVision Hero Stat | `Playvision_Video_and_Hero_Stat.png` | Hero layout | Product-demo video + hero stat layout. Build the layout now; the video slot stays a placeholder until real footage exists (§4d). | — |
| **8** | Slingshot Ambience | `Slingshot_Ambience.png` | Ambience mechanism | Grainy, swirling, many brand-consistent colours, reacting to the cursor. | **Bounded.** Visible edges where the field starts and stops. Ours must be unbounded. |

## Anti-references

| Score | Reference | Strip | What went wrong — build the opposite |
|---|---|---|---|
| **2** | Slingshot Scroll (everything below the hero) | `Slingshot_Scroll.png` | Sections merge into one another with no clear boundary; long stretches where the page is nothing but a quote or a block of prose; **zero interactive features** after the hero; the closing CTA is so low-contrast it blends into the background. Confirmed in the strip: frames 3–8 are near-identical walls of grey text. |

Note the split verdict on Slingshot: **the hero is an 8, everything after it is a 2.**
Score attributes, not domains — a site can be a target and an anti-reference at once.

## What the loop still needs from a new reference

1. A **score**, and if it is not 10, **what stops it**. The "why not 10" is worth
   more than the score: it converts taste into a defect a test can assert.
2. **Trigger → what changes → what stays.** "On selection the tab drifts to the
   top right and the view fades in" is three testable assertions. "Interactive
   and polished" is none.
3. Anti-references are wanted. A 2/10 prevents a whole class of wasted candidates.
