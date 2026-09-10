# DESIGN.md — Constantine Website Constitution (v2)

This file is the specification the build loop serves. The agent iterates the
code; the human iterates this file. When an iteration produces something wrong,
the fix is a sharper sentence here, not a re-prompt. Provenance: v2 rules are
derived from the founder's annotated reactions to four reference sites
(Claryo, PlayVision, Slingshot AI, Pocket) — captured 07 Sep 2026.

---

## 1. What this site is

Constantine turns existing commercial CCTV into anonymous, privacy-preserving
behavioural analytics for physical spaces (museums, galleries, gyms). The
website's job, in priority order:

1. Make a venue operator (curator, gym ops lead, director) believe this is a
   serious, trustworthy company they could pilot tomorrow.
2. Let them *feel* the product within 5 seconds via the interactive demos.
3. Answer the privacy question so thoroughly it stops being an objection.
4. Show the commercial logic: use cases → outputs → revenue.

Audience is a buyer, not a VC. Vendor-sales tone, not pitch-deck tone.

## 2. Character statement

**Professional but never corporate-sterile. Playful but never toy-like.**

The playfulness IS the product demo: every "gimmick" on this site is
Constantine's real metrics demonstrated on the visitor's own behaviour.
Polish must amplify the interactive elements, never mute them. If a change
makes the site more generic-SaaS and less "the analytics are watching you
watch the art," it is a regression regardless of how clean it looks.

Toward: precise, calm, confident, gallery-grade, quietly witty.
Away from: corporate, loud, template-SaaS, gimmicky-cheap,
surveillance-creepy (tone around cameras is always privacy-first).

## 3. PROTECTED ELEMENTS — removing or breaking any is an automatic FAIL

Covered by functional tests in `tests/gimmicks.spec.ts`. The loop may
restyle, reposition, or extend these; never remove, disable, or dumb down.
Descriptions verified against the implementations on 30 Aug 2026; where the
build had moved on, the description is corrected here rather than the code.

- **P1. Hero interactive demo, Museums tab** — hover on painting cards drives
  a live "Attention (s)" timer and "Engagement Intensity %".
  ACCURATE. `src/components/MonaLisaWall.tsx`, `HeroSection.tsx`.
- **P2. Hero interactive demo, Gyms tab** — equipment cards drive
  "Workout Time (s)" and "Utilisation %". CORRECTED on three counts: the
  cards are a bench-press wireframe with an animated barbell and a
  Stairmaster video, not canvas line art; the tab switch is NOT instant, the
  two panels cross-fade through black (400ms out, 140ms hold, 400ms in); and
  each vertical's engagement now resets while hidden, so the incoming set
  starts from zero rather than inheriting the other's value.
  `src/components/EquipmentWall.tsx`, `BenchPressWireframe.tsx`,
  `StairmasterVideo.tsx`, `HeroSection.tsx`.
- **P3. Insight section live cards** — CORRECTED: there are now two sets, and
  they are static ranked cards rather than live hover demos. Museums shows
  Vermeer/Rothko with "Ranking in Exhibition", avg attention and a 12-point
  monthly sparkline; Gyms shows Treadmill/Exercise Bike with "Ranking in
  Gym", "Avg. Utilisation (%)" and the same sparkline.
  `src/components/HowItWorks.tsx` (step 4 of each flow),
  `EquipmentWall.tsx` (static mode).
- **P4. Integrate → Calibrate → Measure → Insight sequence.** CORRECTED:
  museums has four steps; gyms also has four since Insight was added on
  29 Aug. The museum steps use photography; the gym steps use dark-themed
  line illustrations, so "with its real photography" holds for museums only.
  `src/components/HowItWorks.tsx`.
- **P5. Privacy section substance** — the three guarantees (no identity
  profiles, no facial recognition, edge processing) and both Q&As. Copy may
  be clarified, never weakened. CORRECTED: one shared section serves both
  verticals; only the noun changes (visitor / member).
  `src/components/PrivacySection.tsx`.
- **P6. "Request a pilot" flow** with the 15-minute checklist promise.
  CORRECTED: the form posts to Web3Forms and emails the submission, with
  pending/success/error states. The trailing checklist detail ("camera
  placement, calibration, zone authoring") was removed on 29 Aug; the
  15-minute promise itself remains. `src/components/PilotForm.tsx`.

## 4. Sections to BUILD (the expansion brief)

Status tags reconciled against the codebase on 30 Aug 2026. The loop targets
only `[UNBUILT]` and `[PARTIAL]` items. `[SLOT-BUILT — awaiting media]`
(see §4d) counts as complete and is NOT a target.

- **Persona gate** *(Claryo)* — `[PARTIAL — gap]`. UPDATED 08 Sep 2026: the
  full-screen "Are you a…" moment now exists (see the Vertical selector item
  below), and the switcher that reconfigures every section is the same
  control. Remaining gap: two personas (Museums & Galleries / Gyms) rather
  than three, and the per-persona skeleton has no outputs step.
  `src/components/VerticalContext.tsx`, `EntryView.tsx`,
  `VerticalSwitcher.tsx`.
- **Gym use cases** in parallel structure to museums — `[PARTIAL — gap]`.
  Three cards cover equipment utilisation, layout configuration and fault
  detection. Peak-load staffing and member experience are absent; the
  member-facing card was removed on 28 Aug. `src/components/UseCases.tsx`.
- **Deeper use cases** — each as problem → mechanism → outcome with one
  concrete numeric example — `[UNBUILT]`. ADJUDICATION NEEDED: the numeric
  example conflicts with the standing instruction that case-study figures
  stay off the public marketing site.
- **Vertical selector — the site's entry view** *(Claryo, 10/10)* —
  `[BUILT]` 08 Sep 2026, REFINED the same day against three founder notes, and
  again 09 Sep 2026 (see THE SECOND REFINEMENT PASS below).
  `src/components/EntryView.tsx` (the question),
  `VerticalSwitcher.tsx` (the track, its markers and its drift),
  `VerticalContext.tsx` (the answer, remembered), the entry block in
  `src/app/globals.css`, the seam in `HeroSection.tsx`, and the dock slots and
  header attributes in `src/app/page.tsx`.
  HOW IT WAS BUILT, for the next candidate: the track is ONE DOM node in both
  places rather than two that hand off. It is absolutely positioned in the
  document while the question stands, so it scrolls like content; on selection
  it is re-anchored to the viewport at the pixel it already occupies and
  transitions to the header dock slot's measured rect. Measuring the slot is
  what makes the landing correct at 390, where the header gives the track its
  own row, and at 1440, where it lands between the nav and the pilot CTA. The
  entry view unmounts rather than hiding, because `scripts/screenshot.mjs`
  captures `section` first and a hidden-but-present entry section makes that
  frame the gate instead of the hero.
  THE THREE REFINEMENTS, 08 Sep 2026, and what each one turned on:
  1. **The ground is the TECHNICAL register**, not canvas. The founder note was
     "the reference uses a WHITE ground and ours is black". Canvas is the
     register §5 *describes* as light, but it is only light in one of the four
     live palettes, so three quarters of the site opened on black. Technical is
     light in all four (#ffffff / #eceff3 / #ffffff / #f4f7f9, black ink), and
     §5's own description of it — strict black and white, austerity as the
     credibility signal — is a literal description of the reference frame. This
     is a register reassignment, not a palette fix, so it does not touch the
     UNDER EVALUATION decision in §5. The header joins the same register while
     the gate stands, and the nav and pilot CTA are hidden, because the
     reference's entry screen holds the wordmark, the question and the pills
     and nothing else.
  2. **The markers differentiate the verticals.** They were one green square
     that moved with the pill, so the two options were identical until hovered.
     Each choice now carries its own inline mark — a hung frame for Museums &
     Galleries, a loaded bar for Gyms — present on both labels at rest. The
     reference differentiates by HUE; we differentiate by FORM, deliberately:
     the entry stands in the strict black-and-white register, and a second
     saturated accent would have to clear AA on four grounds while still
     reading as the same brand. A shape does not, and each mark names what
     Constantine measures in that space.
  3. **Geometry and path measured, not guessed.**
     `design-refs/Claryo-Tab-Selector.png` is strip frames 1–2 at full
     resolution and is the source for every number: question centre at 34% of
     the viewport at ~64px (it was 48px, which is most of why ours read as a
     caption over a control), track centre at 51.5%, a ~93px track around a
     ~63px pill with symmetric flanks. The explanatory subline is gone — the
     reference screen holds only the question and the pills. The drift now runs
     X and Y on different easings from two nested transforms, so the track
     rises to the header band first and then runs along it to the corner
     instead of cutting a straight diagonal across the hero demo.
  THE SECOND REFINEMENT PASS, 09 Sep 2026. The three notes above were answered;
  this pass carried the same three further and closed the item the first pass
  deferred.
  1. **The question stands through the drift**, which is what the previous entry
     left to the next candidate: reference frame 3 has the greyed question still
     standing as the tab reaches the corner, and ours left at 280ms against a
     1000ms drift. The blocker was named as the layout shift, and the fix is not
     the fixed overlay suggested there — a fixed entry view an unanswered
     visitor cannot scroll past breaks §4's "nothing here gates anything" and
     tests/reveal.spec.ts, which walks the whole page without ever answering.
     Instead the block stays in flow while the question stands and leaves the
     FLOW and the SCREEN at different times: EntryView measures its own rect in
     a layout effect and re-anchors itself, fixed and `pointer-events: none`, at
     the pixel it already occupies. The 100vh shift therefore lands on the click,
     when nothing is being pointed at, rather than inside the 1500ms hover
     window that discarded candidate 20260908-173122-1. Everything else follows
     from the hero then being laid out at document top behind an opaque ground:
     the entry ground lifting IS the chosen view's fade-in, so the hero's own
     `entry-chosen-view` animation is gone and there is one crossing rather than
     two fades arranged to look like one. `answered` now flips as the tab lands
     (1000ms), under the still-opaque ground, so the hero's crossing seam and the
     header's return to the page register are both invisible at the instant they
     happen. NOTE for anyone touching this: `.entry-view[data-state="leaving"]`
     needs its `z-index: 40`. Out of flow, the sheet and the hero occupy the same
     pixels with `z-index: auto`, and the later element in the document wins —
     without it the ground is fully opaque and simply painted underneath, which
     looks exactly like the fade running instantly.
  2. **The corner is empty when the tab arrives.** Nav and the pilot CTA are laid
     out through the drift — the dock slot's landing rect is measured against
     them and would move if they arrived afterwards — but held at opacity 0, so
     the tab travels across a bare band instead of over the nav links, and the
     chrome arrives with the chosen view. The header's bottom hairline is also
     off while the gate stands: at 8% of the entry's own ink it drew a grey line
     straight across a white screen the reference keeps empty, and §5's first
     scroll requirement is that grounds never meet along a visible line.
  3. **Geometry re-measured, and the markers made tiles.** Against
     `design-refs/Claryo-Tab-Selector.png` at its true 1410px width the track is
     ~98px around a ~70px pill with ~21px labels; ours were 81 / 65 / 17, a
     control the size of a form widget where the reference has the only object on
     the screen. The desktop step is now 95 / 68 / 19, and `dockScale` is
     per-width (0.68 desktop, 0.8 below 768) so the docked track still sits
     inside an 88px header row with air.
     The markers were two hairline glyphs, and hairlines of the same weight in
     the same box carry the same visual mass — at 17px the two choices still read
     as a pair of small dark ticks and the difference only arrived once the label
     had been read, which is the founder note it was meant to answer. The
     founder's word is TILE and the reference mark is a solid swatch, so they are
     solid now, and the differentiator is the tile's own OUTLINE: a PORTRAIT tile
     for Museums & Galleries (a hung frame), a LANDSCAPE one for Gyms (a loaded
     bar). Each is a single `fill-rule="evenodd"` path so the interior is a true
     hole — the mark sits on the raised pill when lit and on the track when not,
     and a knockout painted in either ground's colour would be wrong on the
     other.
  ORIGINAL BRIEF, kept for the record. CONFIRMED by founder 08 Sep 2026: this is the FIRST thing a
  visitor sees, ahead of the hero. Reference:
  `design-refs/strips/Clary_Selector.png`, and
  `design-refs/Claryo-Tab-Selector.png` for the same screen at full resolution
  — open the second one, it is where the geometry is legible. "Are you a…"
  centred on a clean light ground, one pill per vertical (Museums & Galleries / Gyms); hover
  colourises the pill; on selection the tab **drifts to the top right** and the
  chosen view **fades in cleanly**, the tab remaining there as the control for
  switching.
  REQUIRED TESTIDS (the capture harness drives these; without them the critic
  cannot see past the gate and scores the whole site on one screen, which is
  what happened on the first attempt): `vertical-selector` on the gate itself,
  and `select-museums` / `select-gyms` on the two choices. The existing
  `hero-tab-museums` / `hero-tab-gyms` must keep working wherever the switch
  control ends up, because the floors drive them.
  Three decisions attached, for adjudication if a candidate disagrees:
  the choice is remembered locally so returning visitors are not re-gated;
  the existing in-hero switcher is retired so there is one control, not two;
  and deep links (`#privacy`) and crawlers must never land behind an
  unanswered question — the selector cannot gate content from a direct link,
  which is also what keeps the existing floors meaningful.
- **Hero stat + product-demo slot** *(PlayVision, 10/10)* — `[BUILT]` 09 Sep
  2026, with the media slot `[SLOT-BUILT — awaiting media]`.
  `src/components/HeroStat.tsx` (the block), `MediaSlot.tsx` (the §4d swap and
  playback contract), `CaptureOverlay.tsx` (the pending state), the
  `.statbleed` / `.media-slot` / `.capture-frame` rules in `globals.css`, and
  `tests/media.spec.ts` (the §4d rule 5 floor). Sits at `#scale` between
  `#venue` and `#problem`, in the product register, so it shares the
  atmosphere block's ground and neither needs a seam.
  Reference: `design-refs/strips/Playvision_Video_and_Hero_Stat.png`, with
  `design-refs/Playvision-Hero-Video.png` for the geometry. See the §6
  PlayVision entry for what the picture actually shows, which is not what §6
  said before this cycle.
  DECISIONS, for the next candidate.
  1. **The stat is a reading, and the layout says so.** In the reference the
     number is a headline standing beside a picture and nothing binds the two.
     Here the number is stated at display scale top left, a leader runs out of
     the frame's left edge toward it, and the arithmetic that produces it is
     laid along the FOOT of the whole block as a four-cell instrument rail
     crossing under both columns. The stat therefore sits above the media and
     is derived beneath it.
  2. **The figure is a specification, and it shows its working.** 345,600 is
     4 Hz times 86,400 seconds, which is arithmetic on our own sample rate
     rather than anything a venue produced. §9 forbids fabricated results and
     the honest way past that is not a disclaimer, it is publishing the
     derivation: the rail names both factors and the product, so a reader can
     check the number instead of trusting it. The fourth cell is `identities
     kept 0`, which is §3 P5 restated as a quantity. The figure is identical in
     both verticals on purpose — a number that does not move when the room
     changes is visibly a spec.
  3. **The placeholder states its emptiness by drawing the instrument with
     nothing in it.** No still, no render, no simulated feed, no figure: crop
     marks and a thirds grid on the register's own ground, two authored zones,
     and a reading card whose every value is a BLANK RULE rather than a dash,
     so no glyph can be misread as a measurement. The corner tally reads
     `frames 0 · readings 0`, both true. The absence is legible as data.
- **Depth dial** *(Claryo's autonomy dial, adapted)* — `[UNBUILT]`.
- **Outputs** — the data → insight → action three-beat *(PlayVision)* —
  `[BUILT]` 07 Sep 2026, figures rebuilt 08 Sep 2026.
  `src/components/OutputsSection.tsx`, with scene composition in
  `src/components/GhostScene.tsx` and the figure renderer in
  `src/components/GhostFigure.tsx`; sits at `#outputs`
  between use cases and the pilot form, per §1's use cases → outputs → the ask
  order. Three alternating rows, each a canvas-register copy column against a
  nested product-register stage carrying anonymised figures with a
  translucent output fragment over them. Each beat shows a different artefact
  (a live zone feed, a ranked week, a Monday brief) so the three-beat is an
  argument rather than three restatements. Every figure is illustrative and
  says so on its own panel; ranked works are numbered rather than named. The
  "Outputs capture" media slot below is still `[UNBUILT]` — the section ships
  with drawn figures instead of a pending player.
- **"Your Stack" integrations** *(Pocket hub-and-spoke)* — `[BUILT]` 08 Sep
  2026. `src/components/StackSection.tsx`, at `#stack` between `#privacy` and
  `#use`. Reference: `design-refs/strips/Pocket_Product.png`, which is a VIDEO
  and where the three things a still reading misses all live: the connectors
  are curves, they carry a travelling dash train, and the dashes run the way
  the data does. Four capability cards around the product object, one ingest
  (cameras and video) and three exports (warehouse, dashboards, alerts), each
  naming the real systems it connects to.
  DECISIONS, for the next candidate. The section takes the TECHNICAL register:
  §5 reserves it for architecture diagrams, and it also lands the reference's
  white ground in all four palettes at once, which a canvas-register build
  could only manage in light-canvas. The object at the centre nests
  `data-register="product"` inside it, because that register is where the
  product appears, and that is what gives the diagram a dark centre of gravity
  on a light field. It carries no seam: `#privacy` above already declares
  technical, so nothing changes across that boundary.
  `--conduit` is a new working token (per theme AND per register) rather than a
  use of `--chart-2`: `--chart-2` is the palette's blue but is ★ on-stage-only,
  and these lines are drawn off the stage, so the demotion rule would have
  required a per-theme value regardless.
  HONESTY, per §9 and the founder's standing instruction: naming a system you
  can connect to is a capability claim and is allowed, implying a relationship
  is not. The framing is "works with your existing stack", every card states
  the direction of the connection, and a footnote on the page says that none of
  the companies named partners with, certifies or endorses Constantine. The
  marks are drawn monochrome, which is both the §9 answer to a partner wall and
  the only option CLAUDE.md's colour rule leaves.
- **Edge unit spec** *(Pocket annotated-callout treatment)* — `[UNBUILT]`.
- **Edge pipeline trust architecture** — `[UNBUILT]`.
- **Revenue generation** — commercial logic, not a price list —
  `[PARTIAL — gap]`. The Value section carries the commercial logic
  qualitatively (funder reporting, equipment ROI, measuring a refit), but
  there is no donor/sponsor or exhibition-pricing depth and no pricing.
  `src/components/ValueSection.tsx`.
- **Categorised FAQ** *(Pocket)* — `[BUILT]` 07 Sep 2026.
  `src/components/FaqSection.tsx`, between `#use` and `#pilot`. Four
  categories (privacy, deployment, integration, commercial) on a rail, each
  opening a panel of three answers over a chip row of the category's claims,
  per the Pocket privacy module. Tagged `viewport-section`; it composes
  within 1440×900 and 390×844 in every state a reader can reach.

### 4a. Already built, added by reconciliation

Sections that exist on the site but were absent from this spec. Recorded so
the loop does not rebuild them, and so their §5 conflicts are visible.

- **Hero: dual interactive demos** — `[BUILT]`. The site's strongest asset
  and the subject of P1/P2. `src/components/HeroSection.tsx` and the four
  wall components. CORRECTED 08 Sep 2026: the in-hero switcher is retired per
  the §4 decision, so the hero is now nothing but its demos and the one
  control lives in the header. `hero-tab-museums` / `hero-tab-gyms` moved
  with it and still drive the same state.
- **Problem section (`#problem`)** — `[BUILT]`. Eyebrow, pain heading, lede
  and three supporting points; switches per vertical. Sits between hero and
  How it works. `src/components/ProblemSection.tsx`.
  §5 CONFLICT: both headings use the banned "X. Not Y." construction, and
  the eyebrow is ALL-CAPS, which §5 rejects.
  VISUAL ADDED 09 Sep 2026: `FloorLedger` in `blind` mode, beside the lede and
  the three points. See the Value entry below — it is one object, not two.
- **Value section (`#value`)** — `[BUILT]`. Eyebrow, heading, four outcome
  cards and a closing line; switches per vertical. Overlaps the Revenue
  generation item above. `src/components/ValueSection.tsx`.
  REGISTER CHANGED 09 Sep 2026, canvas → TECHNICAL, and its seam deleted. It
  declared canvas between `#how` and `#privacy`, which both declare technical,
  so the page went black, white, black across three consecutive sections and the
  two crossings cost 403px of empty ramp in and 406px out for 489px of content —
  more page than the section itself. Claryo changes ground when the ARGUMENT
  changes, never for one beat inside a run. `#how`, `#value`, `#privacy` and
  `#stack` are one run — what the system does, what it answers, what it refuses
  to hold, where it plugs in — so the page crosses into that ground once, at
  `#how`, and out of it once, at `#use`. `#privacy`'s seam went with it: nothing
  changes across that boundary any more.
  §5 CONFLICT: three cards use "X, not Y"; eyebrow is ALL-CAPS.
  VISUAL ADDED 09 Sep 2026: `src/components/FloorLedger.tsx`, ONE object shared
  with `#problem` and shown in two states. A day in the venue, one track per
  zone: at `#problem` only the door track carries data and the four zone tracks
  are empty rails marked `unrecorded`; at `#value` the identical geometry is
  written on end to end with each zone's peak hour marked. The two sections are
  the same sentence read forwards and backwards, so they get the same
  instrument rather than two unrelated illustrations, and a reader meets the
  blanks filled in. Deliberately NOT the `#venue` plan: the plan answers
  "where", and what `#problem` is missing is "when, and for how long". Both
  panels are nested product-register stages inside their canvas-register
  sections, and both carry an Illustrative chip (§4d rule 2).
- **How it works (`#how`)** — `[BUILT]`. Four steps per vertical; the
  subject of P4. `src/components/HowItWorks.tsx`.
  CORRECTED 09 Sep 2026. `data-register="product"` sat on the CARD WRAPPER of
  any step carrying a demo, and only step 4 does, so three light bordered cards
  were followed by a borderless black slab at the same radius: the spine that
  the section is built around threaded three cards and a different component.
  The register belongs to the demo INSIDE the card — a nested product-register
  stage, the same rule PrivacyStage, FloorLedger and the Outputs beats already
  follow — so all four steps now carry one ground, one border and one radius,
  and only the stage holding the two Insight readings is dark.
- **Museum use cases (`#use`)** — `[BUILT]`. Three cards.
  `src/components/UseCases.tsx`.
  VISUAL ADDED 09 Sep 2026: `src/components/UseCaseGlyph.tsx`. §5's standard
  card is "eyebrow → title → copy → clean product visual" and these three
  stopped after the copy, which is why the block was the flattest thing on the
  page. Each card now ends in the reading its use case produces. THREE KINDS,
  NOT SIX DRAWINGS: both verticals ask the same three shapes of question
  (`ranked`, `delta`, `anomaly`), so the switcher changes the values and the
  caption rather than the artwork. The glyphs are pushed to the bottom of the
  card with `mt-auto`, because three cards with different amounts of copy
  otherwise leave the row of readings stepped.
- **Privacy (`#privacy`)** — `[BUILT]`. Subject of P5.
  `src/components/PrivacySection.tsx`, with the figures in
  `src/components/PrivacyStage.tsx`.
  VISUAL ADDED 09 Sep 2026, and it is the section's argument rather than
  decoration. See the §5 "People are never identifiable" entry for the
  mechanism. The section is now two columns at lg — claim column beside the
  panel, the two Q&As as Pocket promise cards below — which is also what keeps
  heading, claims, panel and both answers inside 1440×900. §3 P5 is untouched:
  the three guarantees and both Q&As are all still present, and the panel
  states them a fourth time in a picture.
- **Pilot form (`#pilot`)** — `[BUILT]`. Subject of P6.
  `src/components/PilotForm.tsx`.
- **Brand assets** — `[BUILT]`. Share image and tab icon.
  `public/og-image.png`, `src/app/icon.png`. Freeze per §9.

### 4b. Site-wide divergences from §5 (for adjudication, not yet actioned)

- **Palette.** The site is a single dark register (`#050505`) throughout.
  §5 specifies a three-register system with a clean white/light canvas.
  This is the largest spec/repo gap and affects every future candidate.
- **Typography.** The site uses Geist and Geist Mono. §5 specifies Inter
  Display for headings and NB International for body.
- **Ambient background** — `[BUILT]` 08 Sep 2026, both halves.
  `src/components/AmbientField.tsx` (the field), `VenuePlan.tsx` (the object),
  `VenueStage.tsx` (the pinned run that composes them), and
  `src/app/atmosphere.css` (the per-register colour ramp). It sits at `#venue`
  between the hero and `#problem`, in the product register, and both ambient
  floors in `tests/gimmicks.spec.ts` are green. See the §5 entry for the
  mechanism. `ParticleField.tsx` stayed deleted; nothing was revived.
- **Scroll progress bar** — `[BUILT]` 07 Sep 2026.
  `src/components/ScrollProgress.tsx`, rendered inside the header in
  `src/app/page.tsx`. One hairline on the header's bottom edge growing left to
  right, per the Slingshot reference. Built first as a graduated rule and
  rejected; see experiments.md 20260907-184421-1. The §5 corner next-section
  preview it pairs with is still `[UNBUILT]`.
- **Accessibility floor.** CORRECTED 30 Aug 2026 after running the suite:
  tap DOES start the demos on touch, because the walls listen for
  `pointerover` as well as `pointermove` and a tap fires it. That is
  incidental rather than designed, and there is no explicit touch affordance.
  CORRECTED AGAIN 09 Sep 2026: `prefers-reduced-motion` is now handled
  everywhere that moves — the scroll grammar, the entry drift, the seams, the
  ambient field, the venue run, and, as of this cycle, the two demo walls and
  the bench wireframe. Measured with `scripts/rm-audit.mjs`: at both widths and
  on both verticals the page runs ZERO requestAnimationFrame callbacks while
  idle and every viewport frame is byte-identical 600ms later. The remaining
  gap in this entry is the touch affordance, not the preference.
- **Viewport-fit discipline.** CORRECTED 07 Sep 2026: the rule is adopted.
  `#faq` carries `data-testid="viewport-section"` and both floors are green.
  Every other section is still untagged, and `#how` in particular (3113px at
  390) is the scroll-step section the rule was really written for.

### 4c. Floors that pass without asserting anything (fix before relying on them)

Three tests are green that the runbook expected red. One is a real pass; two
are hollow and would let a regression through:

- **touch / tap** — GENUINE pass. Tapping fires `pointerover`, the walls act
  on it, and the timer runs. Keep.
- **reduced motion** — WAS HOLLOW, CLOSED 09 Sep 2026. It asserted
  `document.getAnimations()` has nothing running, but that API only sees Web
  Animations and CSS animations/transitions. Every demo here is
  requestAnimationFrame driving a canvas, which it cannot observe, so the
  test passed whether or not the site honoured the preference — and it did
  not. It now samples the demo canvas twice 500ms apart with no interaction,
  photographs the whole viewport twice at the atmosphere block (which is what
  covers the ambient field and the venue wireframe, neither of which is inside
  a card), and is paired with a second test asserting that hover STILL drives
  the timers under the preference — because the cheapest way to pass a
  stillness check is to stop the demos, which §3 forbids.
- **viewport-fit (mobile)** — HOLLOW. It loops over zero tagged sections and
  passes trivially. The desktop variant asserts `n > 0` first and correctly
  fails. Add the same guard to the mobile test.

### 4d. Media slots (product video & custom showcases)

The loop may design, build, and proactively recommend placements for product
footage and custom showcases even when no media file exists yet.

1. **A slot is a finished component with pending content.** It ships fully
   styled and tested: defined placement, aspect ratio (default 16:9 desktop;
   9:16 permitted for mobile-specific slots), poster frame, playback
   contract (muted, loop, lazy-loaded, no motion under
   `prefers-reduced-motion`), and file-drop swap — replacing the media file
   requires zero layout changes.
2. **Placeholder honesty.** The pending state uses assets from the frozen
   library (anonymised silhouette renders, register-appropriate diagrams)
   and may be labelled as forthcoming pilot footage. NEVER: stock or
   AI-generated video presented as product footage, fabricated screen
   recordings, or any fill implying footage exists. This falls under §9.
3. **The registry is the shot list.** Every slot gets an entry below with
   location, a one-line purpose, and a footage spec (what the clip must
   show, duration target, which visual register it sits in). The registry is
   the founder's filming brief.
4. **Status.** Slots use `[SLOT-BUILT — awaiting media]`, which the loop
   treats as complete. Recommending a new slot means adding a registry entry
   plus rationale in experiments.md; building it needs no separate approval
   if it passes all floors.
5. **Floors.** Tagged slots (`data-testid="media-slot"`) must render their
   poster state: no 404s, no broken players, no layout shift on swap (poster
   and video share dimensions).

CONDITIONAL FLOOR, NOT AN ADOPTION FLOOR. The media-slot test must NOT
assert `n > 0`. Slots are discretionary, so a page with zero slots passes
legitimately and the rule reads "if you build a slot, it must meet these
floors". This is the opposite of the viewport-fit test, where `n > 0` is
required because §5 mandates adoption. Do not "fix" one to match the other.

**Registry — opening entries**

| Slot | Purpose | Footage spec |
|---|---|---|
| Hero walkthrough | Constantine live in a museum | Silhouettes + engagement overlays on real gallery footage, ~30–45s, product/atmosphere register. Claryo hero-video pattern. |
| Measure step clip | Engagement zones drawn live | Zones drawing over anonymised venue footage, ~15s, sits in P4's Measure step. PlayVision annotated-footage pattern. |
| Outputs capture | Dashboard fragment in motion | Fragment updating from live floor data, ~15s, outputs section. |
| Scale capture | The one camera the stat is counting | One fixed wide of a whole gallery or gym floor, 30–45s, 16:9, product register, at `#scale`. It must be a WIDE that holds the zones the overlay draws, since the block's whole argument is that this single view produces 345,600 readings a day. Anonymisation is not optional here: pipeline output only, no recognisable face in any frame (§9). Drop the file in `/public`, pass `src` and `poster` to `MediaSlot` in `HeroStat.tsx`, and nothing else changes. |

The first three are `[UNBUILT]` as slots today. Scale capture is
`[SLOT-BUILT — awaiting media]` and is therefore NOT a target (§4d rule 4).

## 5. Visual language (v2 — founder-stated, no longer assumed)

**Three-register palette system** *(Claryo × Pocket convergence)*:
- **Canvas**: clean white/light for reading and buyer-path sections.
- **Product/atmosphere register**: silvers + purple gradients wherever the
  product or its demos appear — heroes, feature imagery, scroll moments.
- **Technical register**: strict black-and-white for architecture and
  pipeline diagrams. Austerity here is the credibility signal. The ambient
  background never appears behind this register.
Pin the SYSTEM with our own hue calibration — do not clone Claryo's chrome
cubes or any reference's exact gradients.

UNDER EVALUATION (30 Aug 2026). The palette above is aspirational: the site
is currently a single dark register (`#050505`) throughout, so this is the
largest spec/repo gap and it gates D2 for every candidate. Rather than
decide it in the abstract, the direction will be chosen from rendered
variants, judged as Best-of-N with the human as critic — the §8 pattern
applied to a foundational decision before the loop takes over incremental
ones.

VARIANTS ARE REGISTER MAPPINGS, NOT GLOBAL RECOLOURS. §5 does not ask
"dark or light?"; it specifies three registers that may differ per section.
A theme file that inverts everything globally makes every variant look wrong
and teaches nothing. Each candidate theme must define all three registers.
Starting set: (a) current dark everywhere; (b) white canvas + silver/purple
product + black technical (the literal §5 reading); (c) dark canvas +
silver/purple product + black technical (Claryo-leaning); (d) one wildcard.
Judgement is on the six §7 views side by side, where register interplay is
what is actually being decided.

TOKENISATION SESSION — EXIT CRITERIA. Canvas and video drawing code cannot
read CSS variables, so tokenising only the Tailwind classes would leave the
hover demos and charts hardcoded and every variant screenshot would lie
about the most important elements on the page. The session is done when all
four hold:
1. All ~130 colour references (104 Tailwind utilities, 24 rgba() literals,
   4 hex) resolve to tokens.
2. ZERO rgba()/hex colour literals remain in canvas or chart drawing code.
   Stated as an absence, not as "a bridge exists" — otherwise the bridge
   lands alongside the 24 literals and the demos still do not re-theme.
   The bridge (getComputedStyle on the root into a JS palette object before
   drawing) becomes the single path by which drawing code receives colour.
3. Suite green, with the four standing reds permitted as pre-existing
   backlog under the ratchet: no NEW reds.
4. Variant zero: the current dark theme renders pixel-identical to its
   pre-tokenisation screenshots, proving the refactor changed structure and
   not appearance. Until a direction is pinned here, D2 is judged on internal
register discipline and craft, NOT on conformance to the three-register
system, and the loop must not "fix" the palette on its own initiative.

**People are never identifiable** *(PlayVision, elevated to hard rule)*.
No recognisable faces anywhere. CLARIFIED 08 Sep 2026: "silhouette" has been
read as a flat icon-like cut-out, which is wrong and was rejected on the
Outputs section. See design-refs/Playvision-design-anoymous-player.png — the
figures are VOLUMETRIC: real human proportion and pose, visible musculature and
depth, a grainy luminous grey-white surface with soft glowing edges, like the
output of a depth sensor. They read as a real person rendered anonymous, not as
a pictogram. Identity is absent because no facial detail is resolved, not
because the body is abstracted away.
Humans appear as anonymised luminous grey-white tracked figures — ideally
rendered by the Constantine pipeline itself (masks, pose skeletons, engagement
heat), so imagery is a true product output. This is the brand's privacy claim
as visual language.

IMPLEMENTED 08 Sep 2026, in code, with no produced image asset —
`src/components/GhostFigure.tsx`. A figure is a posed skeleton in head-heights
grown into overlapping anatomical masses at partial alpha; the accumulated
alpha is a height field, and an SVG filter lights it, grains it and blooms its
edge. Anyone extending this should read that file's header before authoring
new artwork: the two things that make it volumetric rather than flat are the
NESTED SHELLS (a mass emitted at 100/66/34% radius so its cross-section is a
dome and not a plateau) and clipping BOTH lighting passes to the height field.
The word "silhouette" is retired from this entry because it is what produced
the pictogram.

EXTENDED 09 Sep 2026 to `#privacy`, where the figures make the argument rather
than illustrate it. `src/components/PrivacyStage.tsx`. Founder ask: give the
privacy section people whose faces never resolve, and let them SHOW the
no-tracking claim instead of the prose asserting it.

THE MECHANISM, stated so it is not re-derived. The frame is cut by a VERTICAL
BOUNDARY, the edge device. Left of it is the room, and it is the only place a
body exists; right of it is the record, and it holds a floor position, a
facing, a dwell and nothing else. The bodies do not stop at the line by being
cropped: the figure mask carries a gradient that EATS them over the last 70
units before it, so "the video is destroyed as it is processed" is drawn rather
than stated and you can see where it stops. Each figure's data is bound AT THE
FEET, and that is a content decision — what survives the device is a position
and an orientation, so the track id, the facing arrow and the leader all attach
to the floor mark. Binding a pose skeleton to the body would have drawn a claim
the product does not make. The leader crosses the boundary and terminates in a
handle on the far side, because the position DOES get through and it is all
that does.

Read off `design-refs/strips/Playvision_People_Movement.png` rather than off
prose about it, the 10/10 reference binds data to a body three ways: hairline
geometry drawn onto the figure, small mono readouts floating beside it on
leaders, and a dark stats card headed by an anonymous player number. All three
are reused; only the payload differs, because ours has to be an argument about
what is NOT held, so the card ends in `identity none`, `face signature not
computed`, `raw video destroyed at source`.

At 390 the record card DOCKS BELOW the room instead of floating over it. At
46% of a 342px panel every column truncated to an ellipsis and the payload of
the whole panel was three rows of "zon…". The right of the boundary being empty
on a phone is not a loss; it is the point.

Two rules this does not bend: nothing is ever added inside the head outline,
and the panel is a nested product-register stage, so the instrument scale is
on-stage white and the figures read identically in all four palettes.

**Motion carries information** *(Claryo)*. AMENDED 08 Sep 2026 — founder
verdict: "the website feels too segmented rather than flowing as it should".

The page must read as one continuous journey, not a stack of blocks. As the
visitor scrolls, content should arrive: elements appearing in turn rather than
all at once, fading in, changing state, revealing in sequence. Register changes
must be transitions rather than hard colour edges — today each new section
lands as an abrupt block of colour, which is the specific thing being
rejected.

THE PREVIOUS BAN IS LIFTED. This section used to read "Decorative entrance
animation (per-section fade-and-slide) stays banned", which forbade the very
mechanism now being asked for. The intent behind the ban survives as a quality
bar, not a prohibition: motion must feel authored and sequenced, carrying the
argument forward, rather than a uniform fade-and-slide applied indiscriminately
to every block. Sections may pin while content advances.

TWO REQUIREMENTS ADDED 08 Sep 2026 from founder-scored video
(`Claryo_Scroll_Functionality_2.png`, 10/10):

1. NO VISIBLE DIVIDING LINE between grounds. Scrolling far enough leaves the
   page simply having become white, or black. Today each register change lands
   as a hard colour edge, which is the specific thing rejected.
2. A REVEAL ENDS IN A READABLE STATE. Measured on the first scroll-flow
   candidate: 44 text elements never reached full opacity while sitting 80px
   clear of both viewport edges after a 700ms settle — headings at 0.14, body
   copy at 0.28. Scroll-linked opacity must be a transition INTO readability,
   never a permanent dimmer that peaks at one exact scroll position. Enforced
   by tests/reveal.spec.ts.

ANTI-REFERENCE (`Slingshot_Scroll.png`, 2/10): sections merging with no clear
boundary; stretches that are nothing but a quote or a block of prose; no
interactive features below the hero; a closing CTA so low-contrast it blends
into the background. Do not reproduce any of these.

CLEARED 09 Sep 2026, second clause. `tests/reveal.spec.ts` fails any section
over 300 characters with nothing to look at, and four were failing: `#problem`
(434), `#value` (565), `#privacy` (811) and `#use` (322). All four now carry a
visual and the floor is green, so it hardens from a ratchet into an absolute
gate: any new copy-heavy section must ship with its picture. One rule was used
for all four rather than four bespoke treatments — every visual is a NESTED
PRODUCT-REGISTER STAGE inside its section, which is how the Outputs beats and
the HowItWorks demo walls already work, so the instrument scale is on-stage
white and one build renders in all four palettes.

User-triggered motion (the hover demos) is still the star and still gets the
budget. All scroll motion freezes under prefers-reduced-motion, with every
element in its final revealed state.

BUILT 08 Sep 2026, REBUILT the same day against the two requirements above.
`src/components/ScrollStage.tsx` (the driver), `Reveal.tsx` (the grammar
vocabulary), `SectionSeam.tsx` (register transitions), and the disclosure block
in `globals.css`.

The first build bound opacity CONTINUOUSLY to where an element sat in the
viewport, on the reasoning that the page should answer the visitor's own
movement. That is what produced requirement 2: a continuous binding is a
dimmer, and it peaks at one scroll offset. Scroll position now decides only
WHEN a reveal starts; the transition then runs to completion on its own clock
and latches. The measured floor went from 29 elements stranded between 0.16 and
0.97 to none.

FROM THE REFERENCE, not from this prose: in Claryo-scroll-2.png the
un-revealed item ("Orchestrate") is DIM, not absent — legible as shape before
it resolves. No grammar here fades from zero. That keeps the page from reading
as empty mid-scroll, and it is also what keeps the content inside
`copy.spec.ts`'s visible-text walk, which drops anything at opacity 0.

Register transitions are a DISSOLVE STRADDLING THE BOUNDARY, not a band laid
after it. Each section's seam starts most of a viewport above its own top edge
and reaches full opacity some way inside it, holding the outgoing ground
underneath the lower half so the crossing has something to dissolve out of.
Measured down a content-free column, the worst single-row luminance step at any
register change is under 1% of the range it traverses; the same measurement on
the band version reads 48%. Use cases, the pilot form and the footer now all
declare the canvas register, which removes the last undeclared change on the
page — the one between the last section and the closing CTA.

THE BOUNDARY BUDGET, 09 Sep 2026. The seams were correct and the page was still
failing requirement (a): the flow reviewer measured content coverage across the
nine scroll frames at 85 / 70 / 35 / 86 / 36 / 77 / 28 / 83 / 56 percent, with
single unbroken empty bands of 444, 329 and 301 CSS px. Every band was a section
boundary and every boundary was built the same way — a closing `pb-40 md:pb-52`
meeting an opening `pt-40 md:pt-48`, about 400px of ground with nothing on it,
which is exactly enough for the ~350px crossing to happen in front of nothing.
Neither Claryo scroll reference ever does that: in
`Claryo_Scroll_Functionality.png` frames 4→5 the dark ground climbs while the
white section's headline and body are still on screen, and in `_2.png` frames
4→5 the outgoing row is still leaving the top edge as the next heading arrives
at the bottom. Consecutive frames always overlap in content.

The closing and opening space is now ONE GOVERNED NUMBER, `--band` in
globals.css, applied through `.section-band` — 96px below 768, 112px above, so
the widest boundary gap on the page is 224px. It is a token rather than nine
Tailwind class lists so the budget is auditable: one grep says what every
boundary costs. `.section-band` also carries the anchor clearance the old
padding used to supply by accident.

`--seam-h` is sized against that budget rather than independently. The crossing
has a fully ambiguous middle — roughly 0.36 to 0.72 of its length, where neither
register's text colour would be legible — and that stretch has to fit between
the last line above the boundary and the first line below it. At 42vh it spans
boundary-76 to boundary+60 against a 112px pad, and no copy is read through it
at any viewport height.

`scripts/coverage.mjs` is the instrument, and it exists because the numbers
above cost a reviewer an afternoon and could not be checked. It reports coverage
and the longest unbroken empty band per frame, at the same nine scroll positions
and the same viewport the motion strip uses. A row counts as CARRYING if it
holds high-frequency detail, not if it differs from the page ground — a
ground-difference test scores a lineless crossing as a screenful of content,
which is the exact defect being measured. Measured after this change: 85 / 70 /
52 / 85 / 58 / 64 / 51 / 79 / 52, worst band 305px, and that last one is the
atmosphere block's own composition rather than a boundary — `#venue` is a pinned
stage whose bottom third is empty by design, and it is founder-approved.

THE HEADER OBSERVES WHAT IS UNDER IT, 09 Sep 2026. `HeaderRegister.tsx`. §4
already built half of this for the entry view; after selection the header
reverted to the ROOT ground and held it for the whole page, so over a section of
opposite polarity it painted a band across the top of every frame — the reviewer
measured its edge stepping 53 → 114 → 255 across 3 CSS px, inverted in
light-canvas. The border went in the previous cycle and the band stayed. The
header now takes the register of the section its own foot is standing on. Two
things are load-bearing and should not be re-derived: the switch line is the
header's FOOT, because the seam is weighted 56% above the boundary and its alpha
passes half at very nearly the boundary itself, so switching there puts the
header's change at the same moment and the same place on screen as the ground's;
and the header's fill stays TRANSLUCENT rather than taking the register block's
opaque `background`, because the seam beneath it is still ramping for ~170px
after the switch and a flat fill of the arrived-at register held over a ground
that is still crossing is the band again, one register later.

Three consequences worth stating so they are not re-discovered:
- Reveals LATCH. Scrolling back up must not un-tell the argument.
- The driver only ever dims an element that is BELOW the fold when it first
  sees it. Anything already on screen at hydration is marked revealed
  untouched, so the page cannot darken what the visitor is looking at.
- The §7 sheets and the full-page strips must SCROLL the page before capturing
  it (`scripts/settle.mjs`), and then wait out the longest reveal, because the
  pass only starts them. The motion strip deliberately does not settle:
  composition evidence and motion evidence are different jobs.

**Ambient background** *(Claryo — 10/10; Slingshot — 8/10)*. REWRITTEN AGAIN
08 Sep 2026 from founder-scored video. Reference:
`design-refs/strips/Claryo_Ambiance_and_Scroll_Functionality_3.png`.

Bright purple blooms on **pure black**, large and soft, continuously moving and
plainly visible — not a wash over a dark-grey ground. A white technical
wireframe may sit on top and augment per scroll step. THE FIELD IS UNBOUNDED:
Slingshot scores 8 rather than 10 solely because its field has visible edges
where it starts and stops, so a candidate reproducing the swirl AND the
boundaries has copied the defect.

Slingshot's implementation is a WebGL2 fragment shader — noise-driven flow
field with a ping-pong feedback buffer for advection (source captured in
design-refs/). Claryo's target look does not require that machinery, and
Claryo scores higher; do not reach for a fluid simulation to hit it.

REOPENED 08 Sep 2026. It was parked after the founder said "ambient should be
reverted as we need to work on that significantly in future changes" — read as
"shelve the feature" when it meant "discard these two attempts". Founder has
since asked where the ambience is. It is live work again, and it is the
highest-priority item on the list.

Also still missing, and never tasked: the CUSTOM OBJECTS. The reference is not
only a colour field — a white technical wireframe sits over the blooms and
augments per scroll step (Claryo_Ambiance_and_Scroll_Functionality_3.png, and
the hero line-work in Claryo_Ambient_Hero_Page.png). The registers exist as
colour; the objects and their motion do not exist at all.

Standing constraints: product/atmosphere register only, never behind the
technical register; the hero demo stays the brightest, most detailed thing on
screen; no measurable FPS cost to the demo timers (continuous
compositor-driven animation is NOT a violation); fully static under
prefers-reduced-motion.

BUILT 08 Sep 2026, both halves, at `#venue` between the hero and `#problem`.
`AmbientField.tsx`, `VenuePlan.tsx`, `VenueStage.tsx`, `atmosphere.css`.

MECHANISM, stated because §5 now asks for a choice between approaches rather
than between tunings: the field is A COARSE OCCUPANCY FIELD, MAGNIFIED. It
rasterises a scalar density field at one pixel per 20 CSS px — roughly 3,000
pixels for a whole 1440x900 frame — maps it through a colour ramp built from
tokens, and lets the compositor magnify the result. There are no blobs, no
gradient stops and no shader; the softness is the magnification. It is also
the product's own idiom, since a density grid over a floor is what Constantine
computes.

Three things a later candidate should not have to re-derive:

1. UNBOUNDEDNESS IS STRUCTURAL, not a large blur. The field is defined in
   DOCUMENT coordinates, so an element showing it is a window onto it rather
   than a container for it, and the pinned stage scrolls THROUGH the field.
   Its sources repeat down the world with wrapped distance, so scrolling never
   reaches a bottom. `--atmos-base` is defined to equal the register's own
   ground, so empty field IS the page. And the block opens and closes by
   STRENGTH rather than by geometry: while its top edge is still on screen the
   field is at zero, so there is no frame in the scroll where a bright field
   meets a dark ground along a line. That last one is the whole of Slingshot's
   missing two points.
2. SIZE AND SPACING ARE THE DESIGN. A first pass used seven wide sources and
   produced one flat lilac wash with no black anywhere, which is the
   "dark-grey ground" this entry rejects. Six narrower ones, spread down the
   period so only two or three are in range of a screen, plus a ramp whose
   lower half stays at the ground, is what gives bright blooms ON BLACK.
3. THE OBJECT DRAWS, IT DOES NOT FADE. From
   `Claryo_Ambient_Hero_Page.png` frames 4-5, which the prose above never
   described: the line-work BUILDS — one line becomes a full wireframe with
   small square vertex handles on it. So every augmentation here is
   stroke-dashoffset, and the square handles are reused as camera positions.
   The four steps are Constantine's own: footprint, zones, sightlines,
   movement, per vertical.

The hero was deliberately left untouched. §3 makes the demos the brightest and
most detailed thing on screen, and the atmosphere opens underneath them rather
than behind them.

**Scroll progress bar** *(Slingshot)*. A single hairline on the header's
bottom edge, growing left to right as the page scrolls. See
design-refs/Slingshot-Scroll-Bar-{1,2}.png: no graduations, no section marks,
no read head — the restraint is the whole effect. Pairs with a corner
next-section preview *(Claryo)* so heavy scroll choreography stays navigable.
CORRECTED 07 Sep 2026. This entry previously read "styled as a measurement
instrument in the site's data-overlay idiom, not a generic loading strip".
That gloss described nothing Slingshot does, and a candidate built faithfully
to it produced an engraved ruler the founder rejected on sight. Reference
entries describe the reference; interpretation belongs in the candidate.

**Viewport-fit discipline** *(anti-pattern from Pocket)*. Every scroll-step
section must compose completely within one viewport at 1440×900 and 390×844
— heading, copy, and visual visible together, no scroll-jiggling to
complete a thought. Tagged sections are asserted in tests.

**Single CTA** *(Slingshot)*. "Request a pilot" is the only primary action —
persistent in nav, repeated at decision points. Everything else is
secondary link styling. No CTA accretion ("book demo" / "learn more" /
"contact us" competing).

**Content modules** *(Pocket)*. The standard card: eyebrow (purple, not
ALL-CAPS mono) → black title → 1–2 lines of copy → clean product visual.
New sections use this module; do not invent a new layout per section.
Single-word display headers for major sections *(Claryo)*: Integrate.
Calibrate. Measure. Insight.

**Typography** (CONFIRMED via DevTools on reference sites):
- Display: **Inter Display** (Bold/ExtraBold) — free, SIL OFL; use the
  Display optical variant at heading sizes only. Single-word section
  headers set in this.
- Body: **NB International** (Regular, + Medium if needed) — licensed from
  Neubau; self-host woff2. Interim stand-in until licensed: regular Inter.
- Fallback stack: "NB International", Inter, system-ui, sans-serif.
- Rule: the two faces never appear at similar size/weight side by side —
  Inter Display owns large display work, NB International owns text. The
  loop NEVER substitutes or adds typefaces. Body line length < 80ch.

**Reduced motion & accessibility floor**: scrollytelling degrades to a
static, complete page (all content visible, nothing trapped behind
triggers); demos work via tap on touch devices; WCAG AA contrast; visible
keyboard focus; alt text everywhere.

SCOPE (30 Aug 2026) — the distinction the tests enforce is AMBIENT vs
INTERACTION, and it matters because a candidate could otherwise pass the
reduced-motion test by killing the demos, breaching §3 P1/P2:
- Ambient and idle motion MUST freeze under `prefers-reduced-motion`. That
  covers the liquid background and any canvas or chart that keeps redrawing
  while nobody is touching it. The test samples a demo canvas twice, 500ms
  apart, with no interaction, and requires identical pixels.
- User-initiated response MAY still animate. Hover or tap driving the
  attention/utilisation timers is interaction feedback, not ambient motion.
  Disabling it to pass the test is a §3 failure, not a fix.

CLOSED 09 Sep 2026, and the principle that resolved it is worth keeping:
UNDER THE PREFERENCE, THE DEMO'S CLOCK BECOMES THE VISITOR'S CLOCK. The walls
were the last thing moving on an untouched page, and not because anything was
visibly animating — engagement was zero, the painting was at rest, the numbers
read 0.0. What moved was the ten-second window under the trace, which advances
its time axis every frame whether or not anybody is there. Both walls now start
their loop on a pointer and PARK the moment engagement is back at rest
(`src/lib/motion.ts`, `MonaLisaWall.tsx`, `EquipmentWall.tsx`), so hover still
drives attention, utilisation and workout time exactly as before, and an
untouched page runs no frame callbacks at all.

Three things a later candidate should not have to re-derive:

1. A LOOP THAT PARKS NEEDS A REST FRAME. §5 asks for static AND complete, and a
   canvas that simply stops is blank on first load. The resting chart is the
   full window flat at zero — which is exactly what the live trace decays to,
   so it is the honest reading rather than a decoration.
2. A CANVAS DRAWN ONCE STILL HAS TO RE-THEME. Four palettes are live and the
   harness flips `data-theme` AFTER mount, so code that redrew every frame
   picked that up by accident. Anything that draws once must subscribe to
   resize and to that attribute (`onRedraw`), or its variant screenshot lies.
   The Insight sparklines were repainting an unchanging chart sixty times a
   second purely to get this for free; they now draw once and subscribe.
3. A CYCLE IS AMBIENT EVEN WHEN ITS AMPLITUDE IS ZERO. The bench rep repeats on
   its own clock and only looks still when idle because the swing is multiplied
   by utilisation. Under the preference the cycle is dropped and the bar's
   POSITION carries the metric instead: racked when unused, lifted clear of the
   hooks at full utilisation. Same information, no loop.

**Copy register** (founder-rejected the essay/manifesto register — copy
must not read like AI writing). Target: plain, concrete, benefit-led
vendor copy in the Claryo register ("Gain real-time visibility across your
operation so you can predict and catch exceptions in real-time").
BANNED constructions in all site copy:
- Em-dash rhetorical pivots ("stronger promise — and why we'll…").
- "X, not Y" antithesis framing ("an architectural decision, not a
  policy one") and its cousin "X. Not Y."
- Staccato aphorism runs ("Policies can change. Architecture has to be
  rebuilt.").
- "That's why…" conclusion sentences; solemn first-person essay tone.
Mechanical check: flag any page whose copy contains an "X, not Y"
construction or more than 2 em-dashes total.
ADJUDICATED 30 Aug 2026: the ban is absolute. It is NOT scoped to prose, and
NOT relaxed for display headings or problem statements. The nine violations
standing on the site at reconciliation are the loop's opening copy backlog,
in the same way the red Playwright tests are its opening functional backlog.
See COPY-VIOLATIONS.md for the list and locations.
GATE MECHANICS: because the site starts non-compliant, `copy-lint.sh` must
run as a RATCHET during convergence, not as absolute pass/fail. A candidate
passes if it has no more violations than `best` AND introduces no new ones,
where "new" is judged by violation IDENTITY (file + matched text), never by
net count — otherwise a candidate that fixes one violation and introduces a
different one passes on arithmetic while the copy has not improved.
Once `best` reaches zero the ratchet is equivalent to absolute zero and the
gate hardens permanently. Without this, a candidate that fixes five of nine
violations still fails, is discarded, and the loop can never converge on the
rule it is being asked to enforce. Critic enforces the rest
under D4/D6. The privacy section uses the Pocket structure — framing
sentence + layered plain-declarative promise cards — written in this same
register, NOT as an essay.

**Explicitly rejected** (template tells + reference dislikes): ALL-CAPS mono
eyebrow labels, YC-orange accents, D2C conversion machinery (urgency
pricing, badge walls, review-widget sprawl, hype copy), warm-cream +
terracotta AI-brand look, uniform rounded-card grids with grey shadows,
"→" on every CTA, Slingshot's palette/font.

## 6. References — annotated, attribute-specific

**`design-refs/REFERENCES.md` is the authority and outranks this list.** It
carries the founder's score per attribute, the frame strip to open, and — where
a reference is not a 10 — exactly what stops it being one. This section says
what to take in the abstract; the registry says how hard to chase it.

Score attributes, not sites: Slingshot's hero is an 8 and everything below it
is a 2. Anti-references are binding — a candidate exhibiting a named defect
from a low-scored row is a regression however tidy it looks.

Stills in /design-refs/, cropped to the attribute named. Motion references are
`.mov` (gitignored — several exceed GitHub's 100MB file limit) with 12-frame
strips in /design-refs/strips/, which is what the loop reads.

- **Claryo (claryo.co + /world-model + /solutions)** — PRIMARY STRUCTURAL.
  Take: scroll-as-argument progressive disclosure; persona gate with
  repeated per-persona skeleton; stepped-dial device; silver/purple
  atmosphere + black-and-white technical split; single-word headers;
  annotated product photos; next-section preview thumbnail; "records what
  was scanned, not what happened" copy standard. Ignore: warehouse content;
  don't clone the chrome-cube hero.
- **PlayVision (withplayvision.ai)** — CONTENT TREATMENTS. Take: anonymised
  ghost-silhouette rendering of people (site-wide rule, generate via own
  pipeline); data → insight → action three-beat; insight-panel UI fragments.
  Ignore: page palette, orange accent, mono-caps labels, bullet-heavy
  styling.
  CORRECTED 07 Sep 2026, against workflow-{1,2,3} and
  design-anoymous-player.png. This entry previously read "hero stat +
  annotated real footage + capability bullets proof pattern". None of the
  three workflow frames shows annotated real footage, a hero stat, or a
  bullet: each is a two-column row of eyebrow + short display heading + one
  prose paragraph, set against a dark panel of ghost silhouettes with a
  translucent UI fragment floating over them, and the rows alternate side.
  The fragment is the payload and it differs per row (a result list, bars
  plus stat tiles, a tagged timeline), which is what makes the three-beat
  read as a sequence.
  PARTLY UN-CORRECTED 09 Sep 2026, against
  `design-refs/strips/Playvision_Video_and_Hero_Stat.png` and
  `design-refs/Playvision-Hero-Video.png`. The 07 Sep correction was right
  about the three workflow frames and wrong to conclude the hero stat does not
  exist: it is a DIFFERENT screen, and the strip above is a picture of it. One
  dark field edge to edge; a ~26rem copy column standing on the left of it
  carrying eyebrow, a numeral about four times body size, three lines of prose,
  a hairline, then a marked eyebrow over four short capability lines; and the
  clip occupying the right ~60% and running off the right edge of the screen,
  with no border and no radius on that outer edge. The bullets ARE bullets, and
  they are the one part to ignore — §5 bans the mono-caps eyebrow above them
  and the site has its own marked-list idiom. Everything else in that frame is
  the layout the founder called perfect. Built at `#scale`; see §4.
- **Slingshot AI (slingshotai.com)** — MECHANISMS + VOICE. Take: scroll
  progress bar; cursor-reactive liquid background (mechanism only, our
  hues, subordinated to hero demo); single-CTA discipline. Ignore:
  palette, font, all other styling. REJECTED: the manifesto/essay voice —
  founder verdict is it reads solemn and AI-written; see Copy register
  rules in §5.
- **Pocket (heypocket.com)** — MODULES + BUYER PATH. Take: white canvas
  with silver/purple product register; annotated product callout diagram;
  eyebrow/title/copy/photo card module; hub-and-spoke integrations with
  animated flow arrows; spatial encryption/privacy visual; layered
  privacy promise cards + "sits in your real conversations…" framing-
  sentence pattern; categorised FAQ. Ignore: D2C conversion machinery;
  and its viewport-fit failure is codified as our rule in §5.
- **Anti-reference**: [FILL — a generic AI-SaaS template site] — "the
  corporate-sterile look we are explicitly avoiding."
- **Strongest reference: this site's own hero demo.** Extend its
  character; never import another site's personality over it.

## 7. Critic rubric (pairwise: candidate vs current best)

Judge from screenshots (1440w + 390w; hero, how-it-works, use-cases,
outputs, privacy, integrations) with fresh context. Per dimension: pick the
better version, one sentence why. Candidate WINS only if it wins ≥3 of
D1–D5 and regresses on none. D6 is pass/fail, not comparative.

- **D1. Hierarchy & scannability** — pitch graspable in 10 seconds?
- **D2. Visual craft** — register discipline (§5 palette system), type,
  spacing; absence of rejected tells.
- **D3. Brand character** — demos intact and MORE prominent; silhouette
  rule respected; still unmistakably Constantine?
  SELECTOR CARVE-OUT, 08 Sep 2026. The founder-confirmed entry view (§4) puts
  a selection screen AHEAD of the hero by design. That is not a D3 regression
  and must never be scored as one: judge the demos' prominence WITHIN the view
  they occupy once a vertical is chosen, not by how far down the page they sit
  on first load. Two candidates split on this exact point — one critic reasoned
  correctly that "its existence is not a demotion", the other applied the
  blanket rule and rejected it — which means the rubric, not the work, was at
  fault. A candidate that shrinks, quietens or slows the demos inside the
  post-selection view is still a regression.
- **D4. Content persuasiveness** — problem → mechanism → outcome; does each
  persona find their path; is the stack/integration story credible?
- **D5. Consistency** — new sections use the §5 card module and register
  system; nothing bolted-on.
- **D6. Floors (pass/fail)** — all Playwright tests green (gimmicks,
  progress bar, viewport-fit, reduced-motion, touch); Lighthouse perf ≥ 90
  / a11y ≥ 95; no console errors; NO identifiable faces anywhere; honesty
  guards intact (no fabricated clients/partnerships).
  PLACEHOLDER ADDENDUM (§4d): a well-executed placeholder state is NOT a
  deficiency. Judge the slot's design, not the absence of media. Without
  this, a vision judge reliably scores "has real video" over "has
  placeholder" and the loop learns never to build slots at all.
  RATCHET RULE (30 Aug 2026): floors whose starting state is already failing
  are enforced as ratchets, not absolutes — the measure may never worsen
  against `best`, and hardens to the absolute target once first met. This
  applies to copy-lint now and to Lighthouse when it joins. An absolute gate
  on a failing baseline discards every candidate that improves it.

> Anchors: /design-refs/anchors/ — one screenshot each of a 9, 6, 3 on D2
> and D3 [FILL when available].

## 8. Cadence & stopping criteria

- N=5 candidates per cycle; critic filters to best 1–2; human reviews top
  candidates + critic log; verdicts fold back into THIS FILE.
- Plateau rule: two cycles with no D1–D5 wins → stop and flag that this
  spec is exhausted and needs sharpening.
- Opening backlog: the nine §5 copy violations recorded in
  COPY-VIOLATIONS.md, plus the red functional tests. These are the loop's
  starting work, not defects to be fixed by hand first.
- Status-tag convention: any supervised session that builds or changes a §4
  item updates that item's status tag in the same commit. The spec and the
  repo drift otherwise, and the loop wastes candidates rebuilding what
  already exists.

### 8a. Withdrawn requirements — do not queue these again

- **Corner next-section preview** *(Claryo, paired with the scroll bar in §5)* —
  WITHDRAWN by founder 09 Sep 2026: "do not promote the next-section preview we
  will not be using this feature." A candidate was built and promoted; it is not
  to be merged or rebuilt. The §5 sentence pairing it with the scroll progress
  bar no longer applies.
- **Card elevation / raise-on-hover** *(was Claryo Interactive, 10/10)* —
  WITHDRAWN by founder 09 Sep 2026: "scrap this idea and do not retry to
  complete a feature update for the hover cards they are no longer needed."
  Three working candidates were built and ranked 8/7/7; all three were
  declined. The reference row survives in REFERENCES.md marked DROPPED so that
  the work-plan rule does not resurrect it as an unbuilt 10/10.

## 9. Hard prohibitions

- No fabricated client names, testimonials, results, or implied
  partnerships (integration spokes framed per §4 honesty guard).
- No stock or AI-generated video presented as product footage, no fabricated
  screen recordings, and no placeholder that implies footage exists which
  does not (§4d rule 2).
- No regenerating/restyling frozen brand assets in /public.
- No weakening privacy copy for layout convenience; no tracking scripts on
  a privacy-branded site.
- No identifiable human faces in any imagery, anywhere, ever.
