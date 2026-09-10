# TOKENS.md — colour vocabulary (APPROVED 30 Aug 2026, with amendments)

Register-scoped semantic tokens for the tokenisation session. Nothing is
refactored until this is approved: the vocabulary is the expensive part to
change later, because every theme file and every component references it.

**★ = brand-stable, CONDITIONALLY.** A ★ token holds its value across all
four register themes *only while it renders on the stage* (see
`--stage-surface`). Everything unmarked differs per theme.

**GENERAL DEMOTION RULE.** Brand-stability is contextual, not intrinsic. Any
★ token demotes to theme-scoped the moment it is used outside the stage —
and once demoted it carries the same obligations as any canvas token,
including per-theme AA contrast against its actual ground. A token may not
keep ★ by asserting brand intent while rendering on a surface that breaks
it. Themes must therefore define a demoted value for every ★ token they
place off-stage.

Scope note: 47 distinct colour expressions across 10 files. The table below
absorbs all of them.

**THE WORKING TOKENS ARE REGISTERED PROPERTIES, 10 Sep 2026.** §5 requirement 1
makes the page carry ONE ground that cross-fades, and the way it does that is by
declaring the twenty-eight tokens below with `@property … syntax: "<color>"` so
they can be transitioned on `<html>` (see THE PAGE GROUND in `globals.css`).
Three obligations follow, and all three have already been broken once:

1. **A new colour token joins the transition list.** Add it to all three
   register blocks AND to the `@property` set and `transition-property`, or it
   snaps while everything around it fades.
2. **An alias is substituted where it is DECLARED.** `--stage-surface:
   var(--surface-page)` and `--instrument-well: var(--surface-inset-soft)` were
   both written on `:root` and therefore resolved against the ROOT — which is
   now the page ground rather than a theme constant, so both followed the reader
   down the page and the demo walls went white on the entry gate. Item 6 below
   is right that an alias cannot drift; it is only safe when what it points at
   is declared on the same element.
3. **`--stage-surface` is a theme literal in all four themes now**, not an
   alias, which is exactly what keeps the ★ demotion rule below meaningful: the
   stage has to be theme-level for the instrument whites to hold their value.

---

## R1 · Canvas register — page ground and reading surfaces

| Token | Role | Absorbs |
|---|---|---|
| `--surface-page` | the page ground | `#050505` ×5 (incl. `globals.css --background`), `rgb(5,5,5)` ×2 |
| `--surface-card` | section cards | `bg-zinc-900/40` ×4 |
| `--surface-inset` | wells inside cards: inputs, chart backgrounds, plaque panel | `bg-zinc-950` ×2, `bg-zinc-950/60` ×2, `bg-zinc-950/30` ×1 |
| `--surface-control` | the hero switcher track | `bg-zinc-900/60` ×1 |
| `--border-hairline` | section separators | `border-zinc-800/50` ×8 |
| `--border-card` | card outlines | `border-zinc-800` ×5 |
| `--border-input` / `--border-input-focus` | form fields | `border-zinc-700` ×2, `border-zinc-600` ×2 |

## R1 · Text scale

| Token | Role | Absorbs |
|---|---|---|
| `--text-primary` | headings, input text | `text-zinc-50` ×6 |
| `--text-secondary` | body copy | `text-zinc-400` ×19 |
| `--text-muted` | captions, card descriptions, labels | `text-zinc-500` ×14 |
| `--text-emphasis` | bolded spans, privacy sub-headings | `text-zinc-300` ×4, `text-zinc-200` ×1 |
| `--text-subtle` | footer copyright | `text-zinc-600` ×1 |
| `--marker-weak` | the Problem section's list dots | `bg-zinc-600` ×1 |

## R2 · Product / atmosphere register — the demos

**`--stage-surface`** — the ground the demos are rendered on. Deliberately
independent of `--surface-page`: the walls keep their dark stage even when
the canvas register goes light, which is what preserves the gallery-wall and
gym-floor idiom and keeps the instrument scale legible. In the dark theme
`--stage-surface` equals `--surface-page`, which is why variant zero renders
identically.


Everything a wall draws or overlays. This is the register that must reach
canvas code through the bridge.

| Token | Role | Absorbs | ★ |
|---|---|---|---|
| `--instrument-fg` | plaque label text | `text-white/60` ×5 | ★ on-stage-only |
| `--instrument-fg-strong` | plaque titles | `text-white/80` ×2 | ★ on-stage-only |
| `--instrument-fg-weak` | plaque subtitles, hero eyebrow | `text-white/70` ×1, `text-white/50` ×1 | ★ on-stage-only |
| `--instrument-well` | chart background | `bg-zinc-950/60` ×2 | |
| `--chart-label` | month labels drawn on canvas | `rgba(255,255,255,0.75)` ×2 **(live canvas code)** | |
| `--chart-1` | first demo series (Mona Lisa, treadmill, bench) | `rgba(239,68,68,0.8)` ×4 | ★ conditional: stage-only |
| `--chart-2` | second series (Monet, bike, stairmaster) | `rgba(59,130,246,0.8)` ×4 | ★ conditional: stage-only |
| `--wall-backdrop` | the wall ground behind a card | ALIAS of `--stage-surface`, never a copy | |
| `--card-shadow` | painting drop shadow | `rgba(0,0,0,0.65)` ×1 | |
| `--glass-sheen` | painting glass highlight | `via-white/10` ×1 | |

## R3 · Technical register — reserved

No component uses it yet (§4 pipeline and edge-unit sections are UNBUILT).
Reserve `--tech-surface`, `--tech-ink`, `--tech-rule` so the themes can
define all three registers from day one, per §5.

## Cross-register · action and semantics

| Token | Role | Absorbs | ★ |
|---|---|---|---|
| `--action-bg` / `--action-bg-hover` / `--action-fg` | the single CTA (§5) | `bg-white` ×4, `bg-zinc-200` ×3, `text-black` ×4 | |
| `--accent-positive` | ✓ marks, upward rank, form success | `text-emerald-500` ×5, `text-emerald-500/80` ×1, `text-emerald-400` ×1 | theme-scoped; hue constrained to green; AA required per theme |
| `--accent-negative` | downward rank, form error | `text-red-500` ×2, `text-red-400` ×1 | ★ |

---

## Judgment calls — ADJUDICATED 30 Aug 2026

1. **`text-zinc-400` ×19 splits.** Into `--text-secondary` (body copy) and
   `--text-muted-list` where it is a receding list item, so a light theme can
   move one without the other. SPLIT AS BUILT: 17 of the 19 source
   occurrences are body copy (ledes, nav, chips, closing lines) and took
   `--text-secondary`; 2 are the shared list-item classNames in HowItWorks
   and ProblemSection — each rendering many items — and took
   `--text-muted-list`. Both hold the same value in the dark theme, so
   variant zero is unaffected; they diverge the moment a light theme needs
   list items to recede without lightening body copy.
2. **Instrument whites: ★ on-stage-only.** They stay white because they only
   ever render on `--stage-surface`. Move one off-stage and the demotion rule
   applies.
3. **`--chart-1/2`: ★ conditional on stage-only rendering.** Same basis.
4. **`--accent-positive`: theme-scoped.** Hue constrained to green, AA
   required against each theme's ground. The ★ did break, as expected.
5. **`ParticleField.tsx`: delete.** Dead, and the §5 ambient background
   should be built fresh against the reduced-motion floor.
6. **`--wall-backdrop`: alias `--stage-surface`.** An alias cannot drift; a
   copy is what produced the seam twice. Still true, and safe, because
   `--stage-surface` is now a literal per theme — see obligation 2 in the scope
   note above for the version of this that was not safe.

## Correction to a figure I gave earlier

I previously said "24 `rgba()` literals in canvas code". That over-counted.
Live drawing code contains **2** colour literals (the two chart-label
whites); the equipment canvas painter was deleted when the bench became a
wireframe and the stairmaster a video. The rest were `chartColor` props at
call sites (8), inline backdrop styles (2), a shadow (1), comments (3), and
`ParticleField`'s dead 8. The canvas bridge is therefore a smaller job than
stated — but the exit criterion stands unchanged, since props and literals
both have to resolve to tokens for variant renders to be truthful.

---

## Refactor result (30 Aug 2026)

Exit criteria, all met:

1. **All references resolved.** 130 utility replacements across 10 files,
   plus the inline wall backdrops, the painting shadow, the two canvas
   chart labels and the eight `chartColor` props.
2. **Zero colour literals in drawing code.** The only remaining matches in
   `src/` are three JSX comments recording measured values. `chartColor`
   (a literal) became `chartToken` (a name resolved through the bridge).
3. **Suite green, no new reds.** 11 pass, 4 fail — the same four standing
   backlog items as before the refactor.
4. **Variant zero pixel-identical: 24/24 screenshots byte-identical**
   across both verticals, both viewports, six views each.

Bridge verified in the browser: `--chart-1` resolves to `#ef4444cc`
(= `rgba(239,68,68,0.8)`), `--chart-2` to `#3b82f6cc`, `--chart-label` to
`#ffffffbf` — the same colours as before, now arriving by token. The live
chart painted 146 pixels in chart-1's hue and 0 in any other. The alias held:
`--wall-backdrop` === `--stage-surface` === `#050505`.

`ParticleField.tsx` deleted (dead since before this session, 8 literals).
