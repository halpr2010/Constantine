"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";
import Reveal from "@/components/Reveal";

/**
 * "Your stack" — §4's Pocket hub-and-spoke integrations section.
 *
 * READ THE VIDEO, NOT THE PROSE. design-refs/strips/Pocket_Product.png is a
 * twelve-frame strip of a moving page, and three of its properties only exist
 * in the motion: the connectors are CURVES rather than elbows, they carry a
 * dash TRAIN whose position differs in every frame, and the dashes run in the
 * direction the thing being described actually moves. The still-frame reading
 * of this reference produces a wiring diagram; the moving one produces a
 * picture of data going somewhere.
 *
 * WHY THE TECHNICAL REGISTER. §5 reserves it for "architecture and pipeline
 * diagrams" and says austerity there is the credibility signal. This is that
 * diagram. It also happens to reproduce the reference faithfully in all four
 * palettes at once: --t-surf is a white or near-white ground in every theme,
 * so the section lands on Pocket's white field whichever palette wins, which a
 * canvas-register build could only manage in light-canvas.
 *
 * WHY THE OBJECT IS PRODUCT-REGISTER. In the reference the centre is the
 * product itself, rendered with weight, and it is the only saturated thing in
 * the frame. Ours carries data-register="product" for the same reason §5 gives
 * for that register existing: it is where the product appears. Nesting it
 * inside the technical field is the same move HowItWorks already makes for its
 * step imagery, and it is what gives the diagram a dark centre of gravity on a
 * light field rather than a fifth card.
 *
 * WHY THE MARKS ARE MONOCHROME LINE-WORK. Two independent reasons and they
 * agree. Brand-coloured vendor logos would need colour literals, which
 * CLAUDE.md forbids outright. And a grid of full-colour logos reads as a
 * partner wall, which is exactly the implication §9 prohibits. The system NAME
 * does the identifying; the mark gives the row the reference's texture.
 *
 * HONESTY (§9, and the founder's standing instruction). Naming a system you
 * can connect to is a capability claim and is allowed. Implying a relationship
 * is not. So: the heading is "Works with your existing stack", every card
 * states which way the connection runs, and the footnote says on the page that
 * none of these companies partners with, certifies or endorses Constantine.
 * There is no "trusted by", no logo wall and no client count anywhere here.
 */

type MarkId =
  | "onvif" | "rtsp" | "camera" | "pin"
  | "databricks" | "snowflake" | "bucket" | "query"
  | "bars" | "cross" | "petals" | "sheet"
  | "slack" | "teams" | "webhook" | "envelope";

/**
 * 16x16 line marks, one per named system. Simplified on purpose: at 14px a
 * faithful logo is illegible mush, and these only have to give the row visual
 * rhythm while the label carries the meaning.
 */
const MARKS: Record<MarkId, ReactNode> = {
  onvif: <path d="M8 1.8 14 5.1v5.8L8 14.2 2 10.9V5.1Z" />,
  rtsp: (
    <>
      <rect x="2.2" y="3.6" width="11.6" height="8.8" rx="1.6" />
      <path d="M6.6 6.3 10.5 8l-3.9 1.7Z" fill="currentColor" stroke="none" />
    </>
  ),
  camera: (
    <>
      <path d="M2.8 9.6a5.2 5.2 0 0 1 10.4 0Z" />
      <path d="M2.2 9.6h11.6" />
      <circle cx="8" cy="7.6" r="1.5" />
    </>
  ),
  pin: (
    <>
      <path d="M8 14.2c2.6-3.2 4.2-5.4 4.2-7.4a4.2 4.2 0 1 0-8.4 0c0 2 1.6 4.2 4.2 7.4Z" />
      <circle cx="8" cy="6.6" r="1.5" />
    </>
  ),
  databricks: (
    <>
      <path d="M2.4 5.4 8 2.4l5.6 3" />
      <path d="M2.4 8 8 5l5.6 3" />
      <path d="M2.4 10.7 8 7.7l5.6 3" />
    </>
  ),
  snowflake: (
    <>
      <path d="M8 2v12M3 5l10 6M3 11l10-6" />
      <path d="M6.4 3.1 8 4.6l1.6-1.5M6.4 12.9 8 11.4l1.6 1.5" />
    </>
  ),
  bucket: (
    <>
      <path d="M3.4 5.1h9.2l-1 7.5a1 1 0 0 1-1 .9H5.4a1 1 0 0 1-1-.9Z" />
      <ellipse cx="8" cy="4.6" rx="4.6" ry="1.6" />
    </>
  ),
  query: (
    <>
      <circle cx="7.2" cy="7.2" r="4.6" />
      <path d="M7.2 4.6v2.6h2.4" />
      <path d="M10.6 10.6 13.8 13.8" />
    </>
  ),
  bars: (
    <>
      <rect x="2.6" y="9.6" width="2.6" height="4.2" />
      <rect x="6.7" y="6.4" width="2.6" height="7.4" />
      <rect x="10.8" y="2.6" width="2.6" height="11.2" />
    </>
  ),
  cross: (
    <>
      <path d="M8 2v12M2 8h12" />
      <path d="M4.9 5.4v5.2M11.1 5.4v5.2" />
    </>
  ),
  petals: (
    <>
      <circle cx="8" cy="5" r="2.8" />
      <path d="M3.4 9a4.6 4.6 0 0 0 9.2 0Z" />
    </>
  ),
  sheet: (
    <>
      <path d="M4 2h5l3 3v9H4Z" />
      <path d="M9 2v3h3" />
      <path d="M5.9 9h4.2M5.9 11.3h4.2" />
    </>
  ),
  slack: (
    <>
      <path d="M6.3 2.6v3.7M9.7 9.7v3.7" strokeWidth="2.1" />
      <path d="M2.6 9.7h3.7M9.7 6.3h3.7" strokeWidth="2.1" />
    </>
  ),
  teams: (
    <>
      <rect x="2.6" y="2.8" width="10.8" height="10.4" rx="1.8" />
      <path d="M5.6 6h4.8M8 6v4.8" />
    </>
  ),
  webhook: (
    <>
      <circle cx="8" cy="8" r="1.8" />
      <path d="M7.2 6.4 5.4 3.2M9.5 9 13 10.9M6.5 9 3 10.9" />
    </>
  ),
  envelope: (
    <>
      <rect x="2.3" y="4" width="11.4" height="8" rx="1.2" />
      <path d="m2.9 4.7 5.1 4 5.1-4" />
    </>
  ),
};

function Mark({ id }: { id: MarkId }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 text-fg-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {MARKS[id]}
    </svg>
  );
}

type Card = {
  title: string;
  /** Which way the connection runs. The chip, the arrowhead and the dash
      travel all read from this one field, so they cannot disagree. */
  dir: "in" | "out";
  copy: string;
  systems: { name: string; mark: MarkId }[];
};

/**
 * The four capability cards, in the reference's reading order:
 * top-left, top-right, bottom-left, bottom-right.
 *
 * Protocols sit alongside vendors deliberately. ONVIF, RTSP, a webhook and a
 * CSV are open interfaces, and listing them beside the named platforms is the
 * clearest available statement that these are connections Constantine makes
 * rather than arrangements it has.
 */
const CARDS: Card[] = [
  {
    title: "Cameras and video",
    dir: "in",
    copy: "The CCTV already on the wall, over the protocols your recorder already speaks.",
    systems: [
      { name: "ONVIF", mark: "onvif" },
      { name: "RTSP", mark: "rtsp" },
      { name: "Axis", mark: "camera" },
      { name: "Milestone", mark: "pin" },
    ],
  },
  {
    title: "Warehouse and lake",
    dir: "out",
    copy: "Anonymous counts, dwell and zone metrics land beside the rest of your data.",
    systems: [
      { name: "Databricks", mark: "databricks" },
      { name: "Snowflake", mark: "snowflake" },
      { name: "Amazon S3", mark: "bucket" },
      { name: "BigQuery", mark: "query" },
    ],
  },
  {
    title: "Dashboards and reporting",
    dir: "out",
    copy: "The same metrics feed the weekly and monthly reports your team already reads.",
    systems: [
      { name: "Power BI", mark: "bars" },
      { name: "Tableau", mark: "cross" },
      { name: "Looker", mark: "petals" },
      { name: "CSV export", mark: "sheet" },
    ],
  },
  {
    title: "Alerts and workflow",
    dir: "out",
    copy: "A zone or a machine outside its normal pattern reaches the team where they work.",
    systems: [
      { name: "Slack", mark: "slack" },
      { name: "Microsoft Teams", mark: "teams" },
      { name: "Webhooks", mark: "webhook" },
      { name: "Email", mark: "envelope" },
    ],
  },
];

/**
 * Desktop connector geometry, in a 1000x440 box drawn with
 * preserveAspectRatio="none" over the 30% / 40% / 30% grid below.
 *
 * x is exact: the columns carry no gutter, so a left card's inner edge is
 * x=300 and a right card's is x=700, and the object is 52% of the middle
 * column, which puts its edges at 396 and 604.
 *
 * y is derived: two equal rows separated by a 2.5rem gap put each row's centre
 * at (1 - g)/4 of the box, which for a ~420px-tall diagram is y=101 and y=339.
 * Card height moves that by at most six units, which is invisible at the scale
 * the curve meets the card.
 *
 * Every path is authored FROM its source: the ingest runs card -> object, the
 * three exports run object -> card. One animation then drives all four and the
 * dashes travel the way the data does.
 */
const WIRES = [
  "M300 101 C352 101 352 158 396 158",
  "M604 158 C648 158 648 101 700 101",
  "M396 282 C352 282 352 339 300 339",
  "M604 282 C648 282 648 339 700 339",
];

/** Mobile: the object sits between two rows of cards, so the hub-and-spoke
    read survives the stack. Each band is its own 390x40 box. */
const WIRES_TOP = [
  "M98 0 C98 26 195 14 195 40",
  "M195 40 C195 14 292 26 292 0",
];
const WIRES_BOTTOM = [
  "M195 0 C195 26 98 14 98 40",
  "M195 0 C195 26 292 14 292 40",
];

function Wires({
  paths,
  viewBox,
  first,
  active,
  className,
}: {
  paths: string[];
  viewBox: string;
  /** Index of CARDS the first path belongs to, so hover maps to the right wire. */
  first: number;
  active: number | null;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <defs>
        <marker
          id={`${uid}-tip`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M0.5 1 8.5 5 0.5 9Z" fill="var(--conduit)" />
        </marker>
      </defs>
      {paths.map((d, i) => {
        const idx = first + i;
        const dim = active !== null && active !== idx;
        const lit = active === idx;
        return (
          <g key={d}>
            <path
              d={d}
              className="flow-rail"
              strokeWidth={1.1}
              markerEnd={`url(#${uid}-tip)`}
              style={{ opacity: dim ? 0.1 : lit ? 0.5 : 0.28 }}
            />
            <path
              d={d}
              className="flow-path"
              strokeWidth={lit ? 2.6 : 1.8}
              style={{ opacity: dim ? 0.2 : 1 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function StackCard({
  card,
  active,
  onHover,
  className,
}: {
  card: Card;
  active: boolean;
  onHover: (on: boolean) => void;
  className?: string;
}) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`rounded-xl border bg-surface-card p-3 transition-colors motion-reduce:transition-none lg:p-5 ${
        active ? "border-conduit" : "border-line-card"
      } ${className ?? ""}`}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-conduit">
        <span aria-hidden>{card.dir === "in" ? "↘" : "↗"}</span>
        {card.dir === "in" ? "Constantine ingests" : "Constantine exports"}
      </div>
      <h3 className="mt-1.5 text-base font-semibold leading-snug lg:text-lg">
        {card.title}
      </h3>

      {/* Two bodies, because the section has to compose inside one 844px
          screen at 390 and a four-row labelled list of systems will not fit
          four times over. Below lg the marks become one row and the names run
          on beneath them, which is closer to the reference's own card anyway;
          at lg each name keeps its own mark and the introducing copy returns.
          The named systems appear in both, since they are the payload. */}
      <p className="mt-2 hidden text-sm text-fg-secondary lg:block">{card.copy}</p>
      <ul className="mt-3 hidden grid-cols-2 gap-x-4 gap-y-1.5 lg:mt-4 lg:grid">
        {card.systems.map((s) => (
          <li
            key={s.name}
            className="flex items-center gap-1.5 text-[13px] text-fg-secondary"
          >
            <Mark id={s.mark} />
            <span className="truncate">{s.name}</span>
          </li>
        ))}
      </ul>
      <div className="lg:hidden">
        <div className="mt-2.5 flex items-center gap-2.5">
          {card.systems.map((s) => (
            <Mark key={s.mark} id={s.mark} />
          ))}
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-fg-secondary">
          {card.systems.map((s) => s.name).join(" · ")}
        </p>
      </div>
    </div>
  );
}

/**
 * The object at the centre. Product register inside a technical field, per the
 * header note. The brand mark is the frozen /public asset used as-is (§9): it
 * is a chain of dots running a path, which is the same idea the connectors
 * are, and its own black ground supplies the inset chip the reference's device
 * has embossed on it.
 */
function ProductObject({ className }: { className?: string }) {
  return (
    <div
      data-register="product"
      className={`relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-line-card px-4 py-3.5 text-center lg:gap-2 lg:py-5 ${
        className ?? ""
      }`}
    >
      {/* The reference's device is a lit object rather than a flat plate, and
          --glass-sheen is already the token for that highlight (it lights the
          painting glass on the museum wall). Each theme tints it its own way,
          so the object picks up the product register's cast without any
          component-level colour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-glass-sheen to-transparent"
      />
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src="/Constantine_logo.png"
          alt=""
          width={56}
          height={56}
          className="h-9 w-9 lg:h-14 lg:w-14"
        />
      </div>
      <div className="relative text-sm font-semibold leading-none lg:text-base">
        Constantine
      </div>
      <div className="relative text-[11px] leading-tight text-fg-muted lg:text-xs">
        Edge processing,
        <br />
        on your network
      </div>
    </div>
  );
}

export default function StackSection() {
  const [active, setActive] = useState<number | null>(null);
  const hover = (i: number) => (on: boolean) => setActive(on ? i : null);

  return (
    <section
      id="stack"
      data-register="technical"
      data-testid="viewport-section"
      // The header is fixed and ~88px tall; without scroll-mt an anchor jump
      // to #stack lands the eyebrow underneath it.
      //
      // No SectionSeam: #privacy above already declares the technical
      // register, so nothing changes across this boundary and there is nothing
      // to dissolve. Its closing padding is the space between the two, which
      // is also what keeps this section's own box inside one 844px screen.
      className="relative scroll-mt-24 px-6 pb-12 pt-6 md:pb-24 md:pt-12"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal grammar="ink">
          <div className="text-sm font-medium text-fg-muted">Your stack</div>
        </Reveal>
        <Reveal grammar="focus" className="mt-2">
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
            Works with your existing stack
          </h2>
        </Reveal>
        <Reveal grammar="ghost" lag={0.14} className="mt-3 max-w-2xl">
          <p className="text-sm text-fg-secondary md:text-base">
            Constantine reads the cameras you already run and writes its metrics
            into the tools your team already opens.
          </p>
        </Reveal>

        {/* ONE set of cards for both layouts, placed by CSS rather than
            rendered twice. Two copies would put four duplicate <h3>s and
            sixteen duplicate system names in the document, which a screen
            reader walks and the wall-of-prose floor counts. Below lg it is a
            two-column stack with the object between the rows; at lg the
            explicit grid placements put the same five cells around it. */}
        <Reveal grammar="settle" lag={0.2} className="mt-6 lg:mt-8">
          <div className="relative grid grid-cols-2 gap-2.5 lg:grid-cols-[30%_40%_30%] lg:grid-rows-[1fr_1fr] lg:gap-x-0 lg:gap-y-10">
            <Wires
              paths={WIRES}
              viewBox="0 0 1000 440"
              first={0}
              active={active}
              className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            />
            <StackCard
              card={CARDS[0]}
              active={active === 0}
              onHover={hover(0)}
              className="lg:col-start-1 lg:row-start-1"
            />
            <StackCard
              card={CARDS[1]}
              active={active === 1}
              onHover={hover(1)}
              className="lg:col-start-3 lg:row-start-1"
            />
            <Wires
              paths={WIRES_TOP}
              viewBox="0 0 390 40"
              first={0}
              active={active}
              className="pointer-events-none col-span-2 h-6 w-full lg:hidden"
            />
            {/* At lg: 52% of the middle column and 62% of the diagram's
                height, which is the reference's portrait slab — taller than
                the gap between the two card rows, so it reads as the thing
                they are arranged around rather than as a fifth card. */}
            <div className="col-span-2 flex items-center justify-center lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <ProductObject className="w-40 lg:h-[62%] lg:w-[52%]" />
            </div>
            <Wires
              paths={WIRES_BOTTOM}
              viewBox="0 0 390 40"
              first={2}
              active={active}
              className="pointer-events-none col-span-2 h-6 w-full lg:hidden"
            />
            <StackCard
              card={CARDS[2]}
              active={active === 2}
              onHover={hover(2)}
              className="lg:col-start-1 lg:row-start-2"
            />
            <StackCard
              card={CARDS[3]}
              active={active === 3}
              onHover={hover(3)}
              className="lg:col-start-3 lg:row-start-2"
            />
          </div>
        </Reveal>

        {/* The §9 guard, stated on the page. A reader looking at a
            hub-and-spoke has every reason to expect a partner wall and is owed
            a plain sentence saying why this is not one. */}
        <Reveal grammar="ghost" lag={0.3} className="mt-5 max-w-3xl lg:mt-8">
          <p className="text-xs leading-relaxed text-fg-muted">
            Every system named here is one Constantine can ingest from or export
            to, and you configure each connection yourself. None of these
            companies partners with, certifies or endorses Constantine.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
