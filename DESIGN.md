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

- **Persona gate** *(Claryo)* — `[PARTIAL — gap]`. A persistent two-way
  switcher exists and reconfigures every section of the page per vertical,
  but there is no full-screen "Are you running a…" gate moment, there are
  two personas (Museums & Galleries / Gyms) rather than three, and the
  per-persona skeleton has no outputs step.
  `src/components/VerticalContext.tsx`, `HeroSection.tsx` (switcher UI).
- **Gym use cases** in parallel structure to museums — `[PARTIAL — gap]`.
  Three cards cover equipment utilisation, layout configuration and fault
  detection. Peak-load staffing and member experience are absent; the
  member-facing card was removed on 28 Aug. `src/components/UseCases.tsx`.
- **Deeper use cases** — each as problem → mechanism → outcome with one
  concrete numeric example — `[UNBUILT]`. ADJUDICATION NEEDED: the numeric
  example conflicts with the standing instruction that case-study figures
  stay off the public marketing site.
- **Depth dial** *(Claryo's autonomy dial, adapted)* — `[UNBUILT]`.
- **Outputs** — the data → insight → action three-beat *(PlayVision)* —
  `[BUILT]` 07 Sep 2026. `src/components/OutputsSection.tsx`, with the
  silhouette treatment in `src/components/GhostScene.tsx`; sits at `#outputs`
  between use cases and the pilot form, per §1's use cases → outputs → the ask
  order. Three alternating rows, each a canvas-register copy column against a
  nested product-register stage carrying anonymised silhouettes with a
  translucent output fragment over them. Each beat shows a different artefact
  (a live zone feed, a ranked week, a Monday brief) so the three-beat is an
  argument rather than three restatements. Every figure is illustrative and
  says so on its own panel; ranked works are numbered rather than named. The
  "Outputs capture" media slot below is still `[UNBUILT]` — the section ships
  with drawn figures instead of a pending player.
- **"Your Stack" integrations** *(Pocket hub-and-spoke)* — `[UNBUILT]`.
- **Edge unit spec** *(Pocket annotated-callout treatment)* — `[UNBUILT]`.
- **Edge pipeline trust architecture** — `[UNBUILT]`.
- **Revenue generation** — commercial logic, not a price list —
  `[PARTIAL — gap]`. The Value section carries the commercial logic
  qualitatively (funder reporting, equipment ROI, measuring a refit), but
  there is no donor/sponsor or exhibition-pricing depth and no pricing.
  `src/components/ValueSection.tsx`.
- **Categorised FAQ** *(Pocket)* — `[UNBUILT]`.

### 4a. Already built, added by reconciliation

Sections that exist on the site but were absent from this spec. Recorded so
the loop does not rebuild them, and so their §5 conflicts are visible.

- **Hero: vertical switcher + dual interactive demos** — `[BUILT]`. The
  site's strongest asset and the subject of P1/P2.
  `src/components/HeroSection.tsx` and the four wall components.
- **Problem section (`#problem`)** — `[BUILT]`. Eyebrow, pain heading, lede
  and three supporting points; switches per vertical. Sits between hero and
  How it works. `src/components/ProblemSection.tsx`.
  §5 CONFLICT: both headings use the banned "X. Not Y." construction, and
  the eyebrow is ALL-CAPS, which §5 rejects.
- **Value section (`#value`)** — `[BUILT]`. Eyebrow, heading, four outcome
  cards and a closing line; switches per vertical. Overlaps the Revenue
  generation item above. `src/components/ValueSection.tsx`.
  §5 CONFLICT: three cards use "X, not Y"; eyebrow is ALL-CAPS.
- **How it works (`#how`)** — `[BUILT]`. Four steps per vertical; the
  subject of P4. `src/components/HowItWorks.tsx`.
- **Museum use cases (`#use`)** — `[BUILT]`. Three cards.
  `src/components/UseCases.tsx`.
- **Privacy (`#privacy`)** — `[BUILT]`. Subject of P5.
  `src/components/PrivacySection.tsx`.
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
- **Ambient background** — `[UNBUILT]`. `ParticleField.tsx` was deleted in the
  tokenisation session; §5 asks for this to be built fresh against the
  reduced-motion floor.
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
  There is NO `prefers-reduced-motion` handling anywhere in the codebase.
- **Viewport-fit discipline.** No sections are tagged (`viewport-section`
  count is 0) and no section currently composes within one viewport.

### 4c. Floors that pass without asserting anything (fix before relying on them)

Three tests are green that the runbook expected red. One is a real pass; two
are hollow and would let a regression through:

- **touch / tap** — GENUINE pass. Tapping fires `pointerover`, the walls act
  on it, and the timer runs. Keep.
- **reduced motion** — HOLLOW. It asserts
  `document.getAnimations()` has nothing running, but that API only sees Web
  Animations and CSS animations/transitions. Every demo here is
  requestAnimationFrame driving a canvas, which it cannot observe, so the
  test passes whether or not the site honours the preference — and it does
  not. Rewrite to assert the demos actually freeze under
  `prefers-reduced-motion`.
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

All three are `[UNBUILT]` as slots today.

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
No recognisable faces anywhere. Humans appear as anonymised luminous
grey-white tracked silhouettes — ideally rendered by the Constantine
pipeline itself (masks, pose skeletons, engagement heat), so imagery is a
true product output. This is the brand's privacy claim as visual language.

**Motion carries information** *(Claryo)*. Scroll-driven progressive
disclosure is encouraged where each step adds semantic content — a new
stage, annotation, or metric; sections may pin while content advances.
Decorative entrance animation (per-section fade-and-slide) stays banned.
User-triggered motion (the hover demos) is the star and gets the budget.

**Ambient background** *(Slingshot mechanism, our hues)*. A cursor-reactive
liquid gradient field is welcome in the product/atmosphere register under
hard constraints: low intensity (the hero demo remains the obvious
protagonist), zero measurable FPS impact on demo timers, fully static under
prefers-reduced-motion, never behind the technical register.

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

Screenshots in /design-refs/, cropped to the attribute named.

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
