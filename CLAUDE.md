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

**Registers, not global themes.** Sections claim ground with
`data-register="canvas|product|technical"`. A `[data-register]` block must
remap the FULL working-token set — a partial remap leaves text at the parent
theme's values and washes the section out. When you add a token, add it to all
three register blocks in the same edit.

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
