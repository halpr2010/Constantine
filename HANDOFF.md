# Handoff — where everything is

The Constantine marketing site. Next.js 16 App Router, React 19, Tailwind v4
(CSS-first), TypeScript. Deployed from `main` to constantineanalytics.com.

**Read `DESIGN.md` first.** It is the constitution and outranks every other
file: §3 protected elements, §5 visual language, §7 critic rubric, §8a
withdrawn requirements, §9 hard prohibitions. `CLAUDE.md` is the working
agreement on top of it.

---

## Styling

| Path | What |
|---|---|
| `src/app/globals.css` | **The whole design system.** 58KB. Token definitions, four themes, three per-section registers, the entry choreography, the ground machinery. Start here for anything visual. |
| `src/app/atmosphere.css` | The ambient field's own layer |
| `src/lib/palette.ts` | `token()` — the ONLY path by which canvas/chart code gets colour |
| `src/lib/motion.ts` | Shared motion helpers |
| `TOKENS.md` | The approved token vocabulary, with what each absorbs and why |

**Rules that will bite you:**
- No hex / `rgb()` / `rgba()` literals in components, canvas, or chart code.
  Two exceptions, both documented in place: brand logos in `StackSection.tsx`
  and the vertical marks in `VerticalSwitcher.tsx` — a trademark colour is not
  a theme value.
- Four palettes are live and none is pinned. Anything you build must render in
  all four; `tests/themes.spec.ts` enforces it.
- A `[data-register]` block must remap the FULL working-token set. Partial
  remaps have shipped invisible text and an invisible CTA three separate times.

## The ground system (the site's defining behaviour)

One ground for the whole page at any moment, cross-fading wholesale — never two
grounds meeting. 28 `@property`-registered colour tokens on `<html>` interpolate
ground and ink together.

`src/components/GroundDriver.tsx`, `ScrollStage.tsx`, `Reveal.tsx`, and the
ground blocks in `globals.css`.

## Icons, images, custom creations

| Path | What |
|---|---|
| `public/logos/` | 15 real vendor marks in full colour (AWS, Databricks, Snowflake, Tableau, Salesforce, Azure, Slack, Teams, Gmail, Excel…) used by `StackSection.tsx` |
| `public/Constantine_logo.png` | The brand mark — white dotted C on black. Header and OG card. **Frozen: never regenerate or restyle.** |
| `public/og-image.png` | Social share card |
| `public/*.png`, `public/stairmaster.mp4` | Demo and how-it-works imagery. Filenames are case-sensitive on Vercel's Linux even though macOS forgives it. |

Custom-drawn, no external assets:

- `AmbientField.tsx` — the drifting purple field
- `VenuePlan.tsx` / `VenueStage.tsx` — the technical wireframe with named zones
  and a labelled exemplar per zone
- `GhostFigure.tsx` / `GhostScene.tsx` — volumetric anonymised people. §5 is
  absolute: **no facial detail may ever resolve.**
- `MonaLisaWall.tsx` / `EquipmentWall.tsx` — the hover demos. **§3 protected.**
  Breaking, shrinking, quietening or slowing these is an automatic fail.
- `BenchPressWireframe.tsx`, `StairmasterVideo.tsx` — the gym demos
- `VerticalSwitcher.tsx` / `EntryView.tsx` — the entry selector
- `UseCaseGlyph.tsx`, `FloorLedger.tsx`, `PrivacyStage.tsx`, `HeroStat.tsx`

## Screenshots of the site as it stands

**`shots/current/`** — 184 images, regenerated 16 Sep 2026 from `main`.

```
shots/current/dark|light-canvas|dark-canvas|instrument/
    <vertical>-<view>-<width>.png      six §7 views, 1440 and 390, both verticals
shots/current/strips/                  full page, one per palette
shots/current/motion/drift.png         6 frames / 6s, NO cursor input
shots/current/motion/scroll.png        9 frames indexed by SCROLL POSITION
shots/current/motion/select.png        the entry selection transition
```

Regenerate with `./scripts/capture.sh <label>` against a server on :3000.

Everything else under `shots/` is stale candidate output from the build loop.
**Ignore it.** Only `shots/current/` reflects what is live.

## Verifying a change

`./scripts/floors.sh` — build, serve, 59 tests, copy lint. All floors are
absolute; there are no ratchets left, so any regression fails outright.

Screenshots lie about motion and about canvas (both are masked). Use the motion
strips, and `scripts/motion-strip.mjs` to make new ones.

## One gap you should know about

`design-refs/` — competitor reference screenshots and frame strips — is
**gitignored and exists only on the founder's machine**. The repo is public and
that material is a study of other companies' sites. `DESIGN.md` §6,
`design-refs/REFERENCES.md` and `scripts/reviewers/*.md` cite paths under it
that will not resolve in a clean clone. The founder's source recordings are the
record.
