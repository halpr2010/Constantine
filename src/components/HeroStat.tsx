"use client";

import CaptureOverlay from "@/components/CaptureOverlay";
import MediaSlot from "@/components/MediaSlot";
import Reveal from "@/components/Reveal";
import { useVertical } from "@/components/VerticalContext";

/**
 * #scale — the PlayVision hero-stat layout (REFERENCES.md, 10/10).
 *
 * READ OFF THE PICTURE, not off prose about it. In
 * design-refs/strips/Playvision_Video_and_Hero_Stat.png and the full-resolution
 * frame beside it, the block is ONE dark field running edge to edge, with a
 * narrow copy column standing on the left of it and the clip occupying the
 * right ~60% and running off the right edge of the screen. The copy column is
 * eyebrow, then a numeral roughly four times the size of the body text, then
 * three lines of prose, then a hairline, then a marked eyebrow over four short
 * capability lines. Two things the prose about this reference got wrong and the
 * image settles: the clip does NOT sit in a card (there is no border and no
 * radius on its outer edge, because it has no outer edge), and the copy column
 * is not centred in a half — it is a column of about 26rem with a lot of air to
 * its right.
 *
 * WHAT IS DELIBERATELY DIFFERENT HERE, and it is one decision. In the reference
 * the stat is a headline standing beside a picture: the two are adjacent and
 * nothing binds them. Ours is a READING TAKEN OFF THE INSTRUMENT. The number is
 * stated at display scale top left, a leader runs out of the frame's left edge
 * toward it, and the arithmetic that produces it is laid along the foot of the
 * whole block as an instrument rail whose cells cross under both the copy and
 * the frame. So the stat sits above the media and is derived beneath it, and
 * the block reads as one measurement rather than as a claim next to an image.
 *
 * HONESTY (§9, and this is the part that had to be right before anything was
 * drawn). The figure is not a result and no venue produced it. It is arithmetic
 * on Constantine's own sample rate, which is a property of the pipeline we
 * build: four readings a second, 86,400 seconds in a day. The rail shows that
 * arithmetic in full so a reader can check the number instead of trusting it,
 * and the footnote says outright where it comes from. The fourth cell is the
 * same claim from the other side: the count of identities kept is zero, which
 * is §3 P5 stated as a quantity.
 *
 * The one figure that IS a venue number would be a client result, so there is
 * not one on this page.
 *
 * REGISTER. Product, same as #venue directly above it, so the ground does not
 * change across that boundary and the block needs no seam (§5's first scroll
 * requirement). #problem below already declares a product to canvas seam and
 * still gets the register it expects.
 *
 * MEDIA. The slot is a §4d component with pending content; see MediaSlot for
 * the swap contract and CaptureOverlay for how the pending state states its own
 * emptiness. Registry entry: "Hero walkthrough".
 */

type Content = {
  eyebrow: string;
  lede: string;
  listHead: string;
  list: string[];
  slate: string;
  slateBody: string;
  spec: string;
  slotLabel: string;
};

/** Arithmetic on the pipeline's own sample rate. Stated, so it can be checked. */
const HZ = 4;
const SECONDS_IN_A_DAY = 86_400;
const READINGS = HZ * SECONDS_IN_A_DAY; // 345,600
const fmt = (n: number) => n.toLocaleString("en-GB");

const MUSEUM: Content = {
  eyebrow: "Readings per camera, per day",
  lede: "Constantine samples each camera four times a second. Every reading holds where someone is standing, which way they are facing, and how long they have been there. One camera in one gallery produces 345,600 of them in a day, and none of them holds a face.",
  listHead: "What a reading holds",
  list: [
    "Floor position, as a point on your gallery plan.",
    "Facing, so a pause in front of a work reads differently from a walk past it.",
    "Dwell, timed from arrival to the moment the visitor moves on.",
    "Zone and minute, so counts roll up by room and by hour.",
  ],
  slate: "Nothing has been filmed here yet.",
  slateBody:
    "A 30 to 45 second clip of a gallery goes in this frame once a pilot venue gives us footage we are allowed to show. The marks around it are Constantine's overlay, drawn with nothing under it.",
  spec: "pilot capture · wide · 16:9",
  slotLabel:
    "Empty media slot: Constantine's zone overlay and reading card drawn on an unexposed frame, with every value left blank",
};

const GYM: Content = {
  eyebrow: "Readings per camera, per day",
  lede: "Constantine samples each camera four times a second. Every reading holds where someone is standing, which way they are facing, and how long they have been there. One camera on one gym floor produces 345,600 of them in a day, and none of them holds a face.",
  listHead: "What a reading holds",
  list: [
    "Floor position, as a point on your club plan.",
    "Facing, so a member working at a rack reads differently from one walking past it.",
    "Dwell, timed from the first rep to the moment the station clears.",
    "Zone and minute, so counts roll up by area and by hour.",
  ],
  slate: "Nothing has been filmed here yet.",
  slateBody:
    "A 30 to 45 second clip of a gym floor goes in this frame once a pilot club gives us footage we are allowed to show. The marks around it are Constantine's overlay, drawn with nothing under it.",
  spec: "pilot capture · wide · 16:9",
  slotLabel:
    "Empty media slot: Constantine's zone overlay and reading card drawn on an unexposed frame, with every value left blank",
};

/**
 * The rail. Identical in both verticals on purpose: a pipeline specification
 * does not change because the room does, and a figure that held steady across
 * two audiences is visibly a spec rather than a result.
 */
const RAIL: { k: string; v: string }[] = [
  { k: "sample rate", v: `${HZ} Hz` },
  { k: "seconds in a day", v: fmt(SECONDS_IN_A_DAY) },
  { k: "readings, one camera", v: fmt(READINGS) },
  { k: "identities kept", v: "0" },
];

export default function HeroStat() {
  const { vertical } = useVertical();
  const c = vertical === "gyms" ? GYM : MUSEUM;

  return (
    <section
      id="scale"
      data-ground="product"
      className="relative overflow-hidden py-28 md:py-36"
    >
      {/* The copy column stands on the site's own max-w-6xl left edge while the
          frame runs off the right of the screen, which is the reference's whole
          composition. See .statbleed in globals.css for why this is a padding
          rule rather than a container. */}
      <div className="statbleed grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <Reveal
            grammar="ink"
            className="w-fit text-xs font-medium tracking-wide text-fg-muted"
          >
            {c.eyebrow}
          </Reveal>
          {/* The numeral carries the section, and it IS the heading: the
              reference's block has no title above the number, and inventing one
              would put a line of chrome between the eyebrow and the figure it
              introduces. Sized off the reference's own ratio of roughly four to
              one against body copy. */}
          <Reveal grammar="focus" lag={0.06} className="mt-5 md:mt-6">
            <h2 className="text-[clamp(3.25rem,6.2vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-fg-primary">
              {fmt(READINGS)}
            </h2>
          </Reveal>

          <Reveal grammar="ghost" lag={0.16} className="mt-6 max-w-prose">
            <p className="text-sm text-fg-secondary md:text-base">{c.lede}</p>
          </Reveal>

          {/* The reference's one rule, between the prose and the capability
              list. It is inked left to right, so it draws rather than fades. */}
          <Reveal grammar="ink" lag={0.24} className="mt-8">
            <div aria-hidden className="h-px bg-line-hairline" />
          </Reveal>

          <Reveal
            grammar="ghost"
            lag={0.28}
            className="mt-8 flex items-center gap-2"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-marker-weak"
            />
            <span className="text-xs font-medium tracking-wide text-fg-muted">
              {c.listHead}
            </span>
          </Reveal>
          <ul className="mt-4 space-y-3">
            {c.list.map((item, i) => (
              <li key={item}>
                <Reveal
                  grammar="ghost"
                  lag={0.32 + 0.08 * i}
                  className="flex items-start gap-3 text-sm text-fg-muted-list"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-marker-weak"
                  />
                  {item}
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal grammar="settle" lag={0.1}>
          {/* A NESTED PRODUCT-REGISTER STAGE, declared 10 Sep 2026. The frame
              and its pending overlay are drawn in the ★ on-stage-only
              instrument scale, and they used to receive the product register
              from the section around them. Sections no longer carry a register
              — they declare the PAGE ground and paint nothing — so anything
              drawn in the instrument scale has to claim its own stage or it
              inherits whatever ground the reader has scrolled to. This is the
              same rule PrivacyStage, FloorLedger and the Outputs beats already
              follow, and §4d's registry already calls this slot product
              register, so it is the declaration catching up with the spec. */}
          <MediaSlot
            label={c.slotLabel}
            aspectSm="3 / 2"
            register="product"
            className="capture-frame rounded-xl border border-line-card lg:rounded-r-none lg:border-r-0"
          >
            <CaptureOverlay
              slate={c.slate}
              body={c.slateBody}
              spec={c.spec}
            />
          </MediaSlot>
        </Reveal>
      </div>

      {/* The derivation, laid along the foot of the block. The number above is
          checkable from these four cells, which is what makes it a measurement
          the reader can refuse rather than a claim they have to accept. */}
      <div className="mx-auto mt-14 max-w-6xl px-6 md:mt-16">
        <Reveal grammar="ink" lag={0.1}>
          <dl className="grid grid-cols-2 gap-px bg-line-hairline sm:grid-cols-4">
            {RAIL.map((cell) => (
              <div key={cell.k} className="bg-surface-page px-4 py-4 md:px-5">
                <dt>
                  <span className="font-mono text-[11px] tracking-wide text-fg-muted">
                    {cell.k}
                  </span>
                </dt>
                <dd className="mt-1.5">
                  <span className="text-xl font-semibold tracking-tight text-fg-primary md:text-2xl">
                    {cell.v}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal grammar="ghost" lag={0.2} className="mt-4">
          <p className="max-w-2xl text-xs text-fg-muted">
            These are the pipeline&apos;s own figures at its 4 Hz sample rate.
            No venue produced them, and the frame above holds no footage yet.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
