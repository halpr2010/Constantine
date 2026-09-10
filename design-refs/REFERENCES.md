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
| ~~10~~ **DROPPED** | ~~Claryo Hero~~ | `Claryo_Ambient_Hero_Page.png` | ~~Hero after selection~~ | Background alternates between white technical line-work on full black and polished purple/steel imagery. Everything moves and settles cleanly. Not a 1:1 clone — the model for what a hero becomes once a vertical is chosen. | — |
| **10** | Claryo Scroll | `Claryo_Scroll_Functionality.png` | Scroll behaviour | Every scroll either changes the ground (purple/steel ↔ black-and-white technical) or fades in new content. Each scroll surfaces something. | — |
| **10** | Claryo Scroll 2 | `Claryo_Scroll_Functionality_2.png` | Stepped sections | Plan → Monitor → Orchestrate: previous step fades out, next fades in with its own imagery. Ground changes black↔white **without a visible dividing line** — scroll far enough and the page has simply become white, or black. | — |
| **10** | Claryo Ambience + Scroll 3 | `Claryo_Ambiance_and_Scroll_Functionality_3.png` | **Ambience** + stepped diagram | THE ambience target: bright purple blooms on **pure black**, continuously moving, obvious. A white technical wireframe sits on top and augments per step while the step text accumulates. | — |
| ~~10~~ **DROPPED** | ~~Claryo Interactive~~ | `Claryo_Interactive_functionality.png` | ~~Card hover~~ | **WITHDRAWN by founder, 09 Sep 2026: "scrap this idea and do not retry". Three working options were built and all three declined. Not to be queued again.** | — |
| **10** | PlayVision People | `Playvision_People_Movement.png` | Figures + scroll data | Animated figures, bodies annotated, insights surfacing on scroll; the data bound to each figure changes as you scroll. The deck framing around it is NOT wanted. | — |
| **10** | PlayVision Hero Stat | `Playvision_Video_and_Hero_Stat.png` | Hero layout | Product-demo video + hero stat layout. Build the layout now; the video slot stays a placeholder until real footage exists (§4d). Open `Playvision-Hero-Video.png` alongside the strip: it is the same screen at full resolution and is where the geometry is legible (one dark field edge to edge, a ~26rem copy column, the clip running off the right edge with no outer border). | — |
| **8** | Slingshot Ambience | `Slingshot_Ambience.png` | Ambience mechanism | Grainy, swirling, many brand-consistent colours, reacting to the cursor. | **Bounded.** Visible edges where the field starts and stops. Ours must be unbounded. |

### Ground change — the mechanism, corrected 10 Sep 2026

`Claryo-Ground-Black.png` and `Claryo-Ground-White.png` are the SAME CONTENT at
two moments: identical heading, identical three cards. In one the whole page is
black with white type; in the other the whole page is white with black type.

The content did not move. **The ground under the entire page changed, and the
foreground inverted with it.** There is never a boundary between two grounds
anywhere on screen, because only one ground exists at a time.

This is not what we built. Ours gives each section its own ground with a
transition band between them, so a boundary is always somewhere in view;
softening it produced a faded line instead of a hard one, which the founder
rejected: "we still see a straight (now faded) but clear line where the black
and white pages start."

## Anti-references

| Score | Reference | Strip | What went wrong — build the opposite |
|---|---|---|---|
| **2** | Slingshot Scroll (everything below the hero) | `Slingshot_Scroll.png` | Sections merge into one another with no clear boundary; long stretches where the page is nothing but a quote or a block of prose; **zero interactive features** after the hero; the closing CTA is so low-contrast it blends into the background. Confirmed in the strip: frames 3–8 are near-identical walls of grey text. |

Note the split verdict on Slingshot: **the hero is an 8, everything after it is a 2.**
Score attributes, not domains — a site can be a target and an anti-reference at once.

## This file is a work plan, not a reading list

RULE ADDED 08 Sep 2026, after the founder found his own 10/10 notes absent from
the site. Nine rows scored 10/10; only three were ever queued as tasks. The
registry was written, cited by the critic, and then not converted into work.

**Every 10/10 row that is not built yet is an open task, and must appear in
`scripts/tasks.tsv` until it is.** Before starting any cycle, walk this table
and check each target either exists on `best` or is in the queue. A reference
nobody was tasked with is the same as a reference nobody wrote down.

Status, 08 Sep 2026:

| Reference | Built? |
|---|---|
| Claryo Selector | on `best`, refined |
| Claryo Hero (purple/steel ↔ technical) | **DROPPED — founder declined both candidates** |
| Claryo Scroll | on `best` |
| Claryo Scroll 2 | on `best` |
| Claryo Ambience + custom objects | BUILT — field + augmenting venue plan at `#venue` |
| Claryo Interactive (card raise on hover) | **DROPPED — founder withdrew the requirement** |
| PlayVision People | on `best` (Outputs figures) |
| PlayVision Hero Stat | BUILT 09 Sep 2026 — `#scale`, stat + §4d slot (DESIGN.md §4) |
| Slingshot Ambience (8/10, unbounded correction) | folded into the ambience task |

## What the loop still needs from a new reference

1. A **score**, and if it is not 10, **what stops it**. The "why not 10" is worth
   more than the score: it converts taste into a defect a test can assert.
2. **Trigger → what changes → what stays.** "On selection the tab drifts to the
   top right and the view fades in" is three testable assertions. "Interactive
   and polished" is none.
3. Anti-references are wanted. A 2/10 prevents a whole class of wasted candidates.
