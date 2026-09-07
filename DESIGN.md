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

- **P1. Hero interactive demo, Museums tab** — hover on painting cards drives
  a live "Attention (s)" timer and "Engagement Intensity %".
- **P2. Hero interactive demo, Gyms tab** — equipment cards (incl. Stairmaster
  video) drive "Workout Time (s)" and "Utilisation %"; instant tab switch.
- **P3. Insight section live cards** — Vermeer/Rothko exhibition ranking with
  movement indicators, avg attention, monthly engagement visual.
- **P4. Integrate → Calibrate → Measure → Insight sequence** with its real
  photography. Steps may be redesigned, never merged or cut.
- **P5. Privacy section substance** — the three guarantees (no identity
  profiles, no facial recognition, edge processing) and both Q&As. Copy may
  be clarified, never weakened.
- **P6. "Request a pilot" flow** with the 15-minute checklist promise.

## 4. Sections to BUILD (the expansion brief)

- **Persona gate** *(Claryo)*. Full-screen "Are you running a…" moment —
  Museum / Gallery / Gym — that reconfigures the page per persona, with a
  persistent switcher so nobody is trapped. Each persona gets the SAME
  skeleton: hero demo → how-it-works → use cases → outputs → pilot. This
  structurally fixes the current gap (Gyms tab exists; gym use cases don't).
- **Gym use cases** in parallel structure to museums: equipment utilisation &
  purchasing, layout optimisation, peak-load staffing, member experience.
- **Deeper use cases** — each as problem → mechanism → outcome with one
  concrete numeric example (illustrative pre-customer, labelled as such;
  never fabricated client results).
- **Depth dial** *(Claryo's autonomy dial, adapted)*. Stepped interactive
  bars: Count → Dwell → Engagement → Prediction → Recommendation. Level 1 is
  what a footfall counter already does; the dial shows breadth of value
  without over-specifying, and gestures at roadmap.
- **Outputs** — the data → insight → action three-beat *(PlayVision)*:
  anonymised tracked footage → dashboard fragment with real-looking numbers
  (exhibition ranking, dwell distribution, utilisation curve) → the decision
  it drove. Dashboard fragments use the site's own overlay idiom (P3 style).
- **"Your Stack" integrations** *(Pocket hub-and-spoke)*. Constantine
  centred; animated arrows flowing out to destination boxes: cloud storage
  (S3/Azure), warehouses (Databricks, Snowflake), BI (Power BI, Tableau),
  reporting (email/Slack). Arrows depict data flow — legitimate informative
  motion. HONESTY GUARD: spokes are integration *destinations via API/
  export*, framed as "connects to your existing stack" — never implied
  certified partnerships.
- **Edge unit spec** *(Pocket annotated-callout treatment)*. The Orin-class
  device centred with feature lines: processes on-device, no frames stored,
  no facial recognition models present, PoE, footprint, works with existing
  CCTV. Serves the IT stakeholder; half the callouts are privacy proofs.
- **Edge pipeline trust architecture** *(Claryo world-model treatment +
  Pocket's spatial-encryption idea)*. Numbered stages 01–04 in the
  black-and-white register: Capture → Process on-device → Discard frames →
  Emit anonymous metrics — with "what never leaves the building" drawn
  spatially (the building wall is the line; only anonymous metrics cross it).
- **Revenue generation** — commercial logic, not a price list: donor &
  sponsor reporting, exhibition pricing evidence, dwell-uplift from layout,
  equipment ROI. Pricing specifics only if/when added here.
- **Categorised FAQ** *(Pocket)* — Installation / Privacy & compliance /
  Data & outputs / Pilots. Pre-answers the pilot-form emails.

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

**Scroll progress bar** *(Slingshot)*. Persistent thin horizontal bar
showing page position — styled as a measurement instrument in the site's
data-overlay idiom, not a generic loading strip. Pairs with a corner
next-section preview *(Claryo)* so heavy scroll choreography stays
navigable.

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
construction or more than 2 em-dashes total. Critic enforces the rest
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
  pipeline); hero stat + annotated real footage + capability bullets proof
  pattern; data → insight → action three-beat; insight-panel UI fragments.
  Ignore: page palette, orange accent, mono-caps labels, bullet-heavy
  styling.
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

> Anchors: /design-refs/anchors/ — one screenshot each of a 9, 6, 3 on D2
> and D3 [FILL when available].

## 8. Cadence & stopping criteria

- N=5 candidates per cycle; critic filters to best 1–2; human reviews top
  candidates + critic log; verdicts fold back into THIS FILE.
- Plateau rule: two cycles with no D1–D5 wins → stop and flag that this
  spec is exhausted and needs sharpening.

## 9. Hard prohibitions

- No fabricated client names, testimonials, results, or implied
  partnerships (integration spokes framed per §4 honesty guard).
- No regenerating/restyling frozen brand assets in /public.
- No weakening privacy copy for layout convenience; no tracking scripts on
  a privacy-branded site.
- No identifiable human faces in any imagery, anywhere, ever.
