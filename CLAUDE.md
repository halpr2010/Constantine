# Constantine website — working agreement

Next.js 16 App Router · React 19 · Tailwind v4 (CSS-first) · TypeScript.
Deployed from `main` to constantineanalytics.com via Vercel.

`DESIGN.md` is the constitution and outranks this file. Read §3 (protected
elements), §5 (visual language) and §9 (hard prohibitions) before changing
anything visual.

## The loop

`scripts/loop.sh` runs cycles of N candidates. Each candidate is a branch off
`best`; the mechanical gate runs first and discards failures before the critic
spends attention on them; survivors are captured in all four palettes and
judged pairwise per §7. Verdicts and the `next_experiment` line land in
`experiments.md`, which is the only thing that carries learning between cycles.

Opening backlog — this is the work, not a list of defects to clear by hand:
- 4 red Playwright tests (`scroll-progress`, viewport-fit desktop + mobile,
  reduced-motion) asserting §5 features not yet built.
- 9 `X, not Y` copy violations (`COPY-VIOLATIONS.md`). The ban is absolute;
  the ratchet exists only because the site starts non-compliant.
  CLEARED — all nine rewritten, `copy-lint.sh` is at 0. Once this promotes and
  `--baseline` runs on `best`, the ratchet becomes the absolute §5 ban and any
  new construction is a hard fail.

## References — look at them

`design-refs/` holds screenshots of every site §6 cites, named for the
attribute they demonstrate (`Slingshot-Scroll-Bar-1.png`, `Claryo-scroll-2.png`,
`Pocket-Privacy-1.png`, …). §6 says what to take from each and what to ignore.

**Before building anything §6 names, open the reference image for it.** Read
the picture, not just the prose about the picture. DESIGN.md's descriptions are
secondary sources and have been wrong: the scroll-bar entry called for "a
measurement instrument in the site's data-overlay idiom", the reference shows a
plain hairline, and a candidate that followed the prose built an engraved ruler
that was rejected on sight. Where the prose and the image disagree, the image
wins and you fix the prose in the same commit.

## Gates

Run `./scripts/floors.sh` before claiming anything works. Two rule kinds:

- **Absolute** — starts green, must stay green: the palette floor
  (`themes.spec.ts`), copy floors (`copy.spec.ts`), console errors, §9 honesty
  guards.
- **Ratchet** — starts red, may never worsen, keyed on IDENTITY not count:
  the 4 design floors and the 9 copy violations. Fixing one red and breaking
  another is a FAIL, which a net-count gate would miss.

Never edit a baseline in `.loop/` to make a gate pass. Baselines are rewritten
only by `--baseline` on `best`, when work is promoted.

`scripts/coverage.mjs` is not a gate — it is the instrument behind §5's "every
scroll surfaces something". It reports content coverage and the longest empty
band per scroll frame, at the same nine positions and the same viewport
`motion-strip.mjs` uses, so a claim about page rhythm can be checked rather than
asserted. Run it before and after anything that changes section spacing,
register assignment or the ground sequence.

## Colour

Never write a hex, `rgb()` or `rgba()` literal in a component, a canvas, or
chart code. Every colour comes from a token in `TOKENS.md`.

- Markup: Tailwind utilities mapped in `@theme inline` (`text-fg-secondary`,
  `bg-surface-card`, `border-line-hairline`).
- Canvas / video / chart code: `token()` from `src/lib/palette.ts`, read at
  draw time. It is the single path by which drawing code receives colour; a
  literal alongside it means the demos stop re-theming and every variant
  screenshot lies about the most important elements on the page.

Four palettes are live and NONE is pinned (§5 UNDER EVALUATION). Build against
the working tokens and a feature renders in all four. Do not "fix" the palette
on your own initiative, and do not add a theme-specific token to a component:
`text-instrument-fg` on the step numerals is exactly how they ended up
invisible at 1.00:1 in every theme.

**One ground, declared per section.** REWRITTEN 10 Sep 2026 — this used to read
"Sections claim ground with `data-register`", and that architecture is what the
founder rejected twice (§5 requirement 1). There are now two scopes and they do
different jobs:

- A TOP-LEVEL SECTION declares `data-ground="canvas|product|technical"` and
  paints nothing. `GroundDriver` reads whichever declaration owns the middle of
  the viewport and writes it to `<html>`, where the whole token table
  cross-fades. Exactly one ground exists at any moment and it covers the
  viewport, so no boundary between two grounds can appear on screen.
- A NESTED PANEL claims `data-register="..."` and does paint. That is a stage
  standing on the ground — PrivacyStage, FloorLedger, the Outputs beats, the
  #stack hub, the demo walls, the #scale capture frame.

Both scopes read the same table at the foot of `globals.css`, which must remap
the FULL working-token set — a partial remap leaves text at the parent's values
and washes the section out. When you add a colour token, add it to all three
register blocks AND register it with `@property` in the THE PAGE GROUND block,
or it will snap while everything around it fades.

Two traps this architecture sets, both already sprung once:
- Anything drawn in the ★ on-stage scale (`--instrument-*`) must be inside a
  declared stage. There is no section register to inherit any more.
- A `:root` alias written as `var(--some-working-token)` is substituted where it
  is DECLARED, so it follows the ROOT — which is now the page ground, not a
  theme constant. `--stage-surface` and `--instrument-well` were both written
  that way and both followed the reader down the page.
- A canvas that caches token values must watch `PALETTE_ATTRS`
  (`src/lib/motion.ts`), not just `data-theme`.

## Media and honesty

Never fabricate a client, testimonial, result or partnership. Never present
stock or generated footage as product output. Never show an identifiable human
face — people appear only as anonymised silhouettes (§5). A considered
placeholder is a legitimate deliverable (§4d); it must not imply footage exists
that does not.

Brand assets in `/public` are frozen: never regenerate or restyle them. Asset
filenames must match case exactly — macOS is case-insensitive and Vercel's
Linux build is not, so `Stairmaster.mp4` referenced as `stairmaster.mp4` works
locally and 404s in production.

## Comments

Comment the non-obvious: why a threshold is what it is, what a magic number was
measured against, which constraint a workaround exists for. Do not narrate what
the code already says.
