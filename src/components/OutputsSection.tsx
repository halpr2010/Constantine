"use client";

import GhostScene, { SceneVariant } from "@/components/GhostScene";
import { useVertical } from "@/components/VerticalContext";

/**
 * Outputs (§4) — the data → insight → action three-beat, per PlayVision.
 *
 * The reference pattern, read off design-refs/Playvision-workflow-{1,2,3}.png
 * rather than off prose about them: alternating rows, a short copy column on
 * one side, and on the other a dark stage carrying anonymised figures with
 * a translucent fragment of the product UI floating over them. Each beat shows
 * a DIFFERENT artefact, because that is what makes the three-beat an argument
 * instead of three restatements: a live count, a ranking, a brief.
 *
 * HONESTY (§9, and the reason every panel carries a marker). None of these
 * figures came from a venue. They are illustrative, drawn from a synthetic
 * floor plan, and each fragment says so on its own header so a screenshot
 * cropped out of context still carries the disclaimer. Ranked works are
 * numbered rather than named for the same reason.
 *
 * The section ground is the canvas register (this is buyer-path reading) and
 * each visual is a nested product-register stage, mirroring how HowItWorks
 * hosts the demo walls. Nothing here animates, so the reduced-motion floor is
 * unaffected.
 */

type FeedRow = { zone: string; count: string; dwell: string };
type RankRow = { label: string; value: string; pct: number };
type Tile = { value: string; label: string; up?: boolean };
type BriefItem = { title: string; why: string };

type Content = {
  framing: string;
  data: { body: string[]; meta: string; columns: [string, string, string]; rows: FeedRow[] };
  insight: { body: string[]; title: string; meta: string; rows: RankRow[]; tiles: Tile[] };
  action: { body: string[]; meta: string; items: BriefItem[]; exports: string };
};

const MUSEUM: Content = {
  framing:
    "Constantine sends three things into your week: a clean count of who is in each room, a ranked read on what changed, and a short list of things worth doing. Every panel below uses a synthetic gallery and illustrative figures.",
  data: {
    body: [
      "Each camera reports the same three things: how many people are in a zone, how long they stay, and which way they face. Counts land minute by minute for every room and every work on the wall.",
      "The footage stays in the building and is destroyed as it is processed. These numbers are the whole of what your dashboard holds.",
    ],
    meta: "Room 3 · 14:32",
    columns: ["Zone", "In zone", "Median dwell"],
    rows: [
      { zone: "North wall", count: "6", dwell: "41s" },
      { zone: "Centre island", count: "4", dwell: "22s" },
      { zone: "Doorway", count: "11", dwell: "6s" },
    ],
  },
  insight: {
    body: [
      "Overnight the counts become a ranking. You see which works held attention this week, which slipped, and how the room reads against the last hang.",
      "Open a row to get the hours behind it, so a curator can check the claim before acting on it.",
    ],
    title: "Attention this week",
    meta: "ranked · gallery 3",
    rows: [
      { label: "Work 04", value: "74s", pct: 100 },
      { label: "Work 11", value: "52s", pct: 70 },
      { label: "Work 07", value: "38s", pct: 51 },
      { label: "Work 02", value: "19s", pct: 26 },
    ],
    tiles: [
      { value: "74s", label: "median hold" },
      { value: "62%", label: "reach the room" },
      { value: "9", label: "places gained", up: true },
    ],
  },
  action: {
    body: [
      "Monday morning brings a short brief: what changed, what it is costing you in attention, and one thing to try. Each item carries the figures it came from.",
      "Take the brief into a board pack, a grant report, or your own tools through the API.",
    ],
    meta: "week 12",
    items: [
      {
        title: "Move Work 02 off the doorway wall",
        why: "It holds 19s against a room average of 44s, and the doorway zone turns over every 6s.",
      },
      {
        title: "Keep the late Thursday opening",
        why: "Arrivals peak 40 minutes before close and dwell holds through the last hour.",
      },
    ],
    exports: "CSV · board pack · API",
  },
};

const GYM: Content = {
  framing:
    "Constantine sends three things into your week: a clean count of who is on each part of the floor, a ranked read on what changed, and a short list of things worth doing. Every panel below uses a synthetic club and illustrative figures.",
  data: {
    body: [
      "Each camera reports the same three things: how many people are in a zone, how long they stay, and which equipment is in use. Counts land minute by minute across the whole floor.",
      "The footage stays in the building and is destroyed as it is processed. These numbers are the whole of what your dashboard holds.",
    ],
    meta: "Main floor · 18:05",
    columns: ["Zone", "In use", "Median session"],
    rows: [
      { zone: "Cardio", count: "9", dwell: "22 min" },
      { zone: "Free weights", count: "14", dwell: "31 min" },
      { zone: "Rack area", count: "4", dwell: "18 min" },
    ],
  },
  insight: {
    body: [
      "Overnight the counts become a ranking. You see which equipment earned its floor space this week, where members queued, and how the club reads against last month.",
      "Open a row to get the hours behind it, so an ops lead can check the claim before acting on it.",
    ],
    title: "Utilisation this week",
    meta: "ranked · main floor",
    rows: [
      { label: "Treadmills", value: "84%", pct: 100 },
      { label: "Cable stack", value: "61%", pct: 73 },
      { label: "Rowers", value: "44%", pct: 52 },
      { label: "Bikes", value: "27%", pct: 32 },
    ],
    tiles: [
      { value: "84%", label: "peak utilisation" },
      { value: "6 min", label: "longest wait" },
      { value: "3", label: "places gained", up: true },
    ],
  },
  action: {
    body: [
      "Monday morning brings a short brief: what changed, what it is costing you in floor time, and one thing to try. Each item carries the figures it came from.",
      "Take the brief into a club report, a capex case, or your own tools through the API.",
    ],
    meta: "week 12",
    items: [
      {
        title: "Move two bikes into the rack area",
        why: "Bikes sit at 27% while the racks hold a 6 minute wait at 18:00.",
      },
      {
        title: "Check treadmill 4",
        why: "Usage dropped out of its weekly pattern on Tuesday and has stayed low since.",
      },
    ],
    exports: "CSV · club report · API",
  },
};

/** The disclaimer travels with the artefact, not with the section. */
function FragmentHead({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-instrument-fg-strong">
          {title}
        </div>
        <div className="mt-0.5 truncate font-mono text-[10px] text-instrument-fg">
          {meta}
        </div>
      </div>
      <span className="shrink-0 rounded-full border border-line-hairline px-2 py-0.5 text-[10px] text-instrument-fg">
        Illustrative
      </span>
    </div>
  );
}

function FeedFragment({ c }: { c: Content["data"] }) {
  return (
    <>
      <FragmentHead title="Live zone feed" meta={c.meta} />
      <table className="mt-4 w-full border-collapse text-left">
        <thead>
          <tr>
            {c.columns.map((h, i) => (
              <th
                key={h}
                className={`pb-2 font-mono text-[10px] font-normal text-instrument-fg ${
                  i === 0 ? "" : "text-right"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.rows.map((r) => (
            <tr key={r.zone} className="border-t border-line-hairline">
              <td className="py-2 text-xs text-instrument-fg-strong">{r.zone}</td>
              <td className="py-2 text-right font-mono text-xs text-instrument-fg-strong">
                {r.count}
              </td>
              <td className="py-2 text-right font-mono text-xs text-instrument-fg">
                {r.dwell}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-instrument-fg">
        Aggregated counts only. No identity profiles.
      </p>
    </>
  );
}

function RankFragment({ c }: { c: Content["insight"] }) {
  return (
    <>
      <FragmentHead title={c.title} meta={c.meta} />
      <div className="mt-4 space-y-2">
        {c.rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 truncate font-mono text-[11px] text-instrument-fg">
              {r.label}
            </span>
            <span className="h-1.5 flex-1 rounded-full bg-instrument-well">
              <span
                className="block h-full rounded-full bg-instrument-fg-weak"
                style={{ width: `${r.pct}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right font-mono text-[11px] text-instrument-fg-strong">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {c.tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-instrument-well px-2 py-2 text-center">
            <div className="text-base font-semibold text-instrument-fg-strong">
              {t.up && <span className="text-accent-positive">↑</span>} {t.value}
            </div>
            <div className="mt-0.5 text-[10px] leading-tight text-instrument-fg">
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function BriefFragment({ c }: { c: Content["action"] }) {
  return (
    <>
      <FragmentHead title="Monday brief" meta={c.meta} />
      <ol className="mt-4 space-y-3">
        {c.items.map((it, i) => (
          <li key={it.title} className="flex gap-3">
            <span className="mt-0.5 shrink-0 font-mono text-[11px] text-instrument-fg">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium text-instrument-fg-strong">
                {it.title}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-instrument-fg">
                {it.why}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center justify-between pt-3">
        <span className="text-[10px] text-instrument-fg">Send to</span>
        <span className="font-mono text-[10px] text-instrument-fg-strong">
          {c.exports}
        </span>
      </div>
    </>
  );
}

/**
 * The stage. Silhouettes fill it; the fragment floats over them, inset rather
 * than overhanging, because an overhang at 390w pushes the panel past the
 * gutter and the §5 viewport rule cares about width as well as height.
 */
function Stage({
  variant,
  idPrefix,
  label,
  side,
  cast,
  children,
}: {
  variant: SceneVariant;
  idPrefix: string;
  label: string;
  /** Which edge the fragment hangs off at md+; the field mirrors to match. */
  side: "left" | "right";
  /** Which beat this is; the scene rotates its cast so the three differ. */
  cast: number;
  children: React.ReactNode;
}) {
  return (
    <div
      data-register="product"
      role="img"
      aria-label={label}
      className="relative h-[340px] w-full overflow-hidden rounded-xl border border-line-card md:h-[400px]"
    >
      <GhostScene variant={variant} idPrefix={idPrefix} mirror={side === "right"} cast={cast} />
      {/* At md+ the fragment takes ~2/3 of the width so a whole figure stands
          clear of it; below that it goes near-full-width and the figures read
          in the bands above and below instead. */}
      <div
        className={`absolute left-4 right-4 top-1/2 -translate-y-1/2 rounded-lg border border-line-hairline bg-stage/90 p-4 backdrop-blur-sm md:w-[66%] md:p-5 ${
          side === "left" ? "md:left-6 md:right-auto" : "md:left-auto md:right-6"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Beat({
  eyebrow,
  title,
  body,
  flip,
  stage,
}: {
  eyebrow: string;
  title: string;
  body: string[];
  flip?: boolean;
  stage: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-8 md:items-center md:gap-14 ${
        flip ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <div className="md:w-[42%]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-marker-weak" />
          <span className="text-xs font-medium tracking-wide text-fg-muted">
            {eyebrow}
          </span>
        </div>
        {/* Single-word display header, per §5's Claryo rule. */}
        <h3 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
          {title}
        </h3>
        {body.map((p) => (
          <p key={p} className="mt-4 max-w-prose text-sm text-fg-secondary md:text-base">
            {p}
          </p>
        ))}
      </div>
      <div className="md:w-[58%]">{stage}</div>
    </div>
  );
}

export default function OutputsSection() {
  const { vertical } = useVertical();
  const c = vertical === "gyms" ? GYM : MUSEUM;
  const place = vertical === "gyms" ? "gym floor" : "gallery";

  return (
    <section
      id="outputs"
      data-register="canvas"
      className="border-t border-line-hairline px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-xs font-medium tracking-wide text-fg-muted">Outputs</div>
        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          What lands on your desk
        </h2>
        <p className="mt-4 max-w-2xl text-fg-secondary">{c.framing}</p>

        <div className="mt-14 space-y-16 md:space-y-20">
          <Beat
            eyebrow="The feed"
            title="Data"
            body={c.data.body}
            stage={
              <Stage
                variant="tracks"
                idPrefix="out-data"
                side="left"
                cast={0}
                label={`Illustration: anonymised depth-rendered figures on a synthetic ${place} with detection boxes, behind a sample live zone feed`}
              >
                <FeedFragment c={c.data} />
              </Stage>
            }
          />
          <Beat
            eyebrow="The read"
            title="Insight"
            flip
            body={c.insight.body}
            stage={
              <Stage
                variant="heat"
                idPrefix="out-insight"
                side="right"
                cast={1}
                label={`Illustration: anonymised depth-rendered figures on a synthetic ${place} with engagement heat, behind a sample weekly ranking`}
              >
                <RankFragment c={c.insight} />
              </Stage>
            }
          />
          <Beat
            eyebrow="The move"
            title="Action"
            body={c.action.body}
            stage={
              <Stage
                variant="zones"
                idPrefix="out-action"
                side="left"
                cast={2}
                label={`Illustration: anonymised depth-rendered figures on a synthetic ${place} with a marked zone, behind a sample Monday brief`}
              >
                <BriefFragment c={c.action} />
              </Stage>
            }
          />
        </div>
      </div>
    </section>
  );
}
