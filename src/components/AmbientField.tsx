"use client";

import { useEffect, useRef } from "react";
import { PALETTE_ATTRS } from "@/lib/motion";
import { rgbBytes, tokenOn } from "@/lib/palette";

/**
 * The ambient field (§5 "Ambient background"; reference
 * design-refs/strips/Claryo_Ambiance_and_Scroll_Functionality_3.png, 10/10).
 *
 * MECHANISM — a COARSE OCCUPANCY FIELD, MAGNIFIED.
 *
 * Every previous attempt at this drew blooms: radial gradients, one DOM node
 * or one canvas arc per blob. This draws no blobs at all. It rasterises a
 * scalar density field one pixel per 20 CSS px — about 3,200 pixels for a
 * 1440x900 frame — colour-maps it through a ramp built from tokens, and lets
 * the compositor magnify the result 20x. The softness is the magnification,
 * not a blur radius and not a gradient stop, which is why the blooms are
 * enormous, irregular and cheap at the same time: the whole frame costs fewer
 * samples than a 60x54 thumbnail.
 *
 * It is also the product's own idiom. A density grid over a floor is exactly
 * what Constantine computes; the ambience is that field with the venue
 * geometry drawn over it (VenuePlan), which is what the reference frame shows.
 *
 * WHY IT IS UNBOUNDED. §5 scores Slingshot 8 rather than 10 solely because its
 * field has edges where it starts and stops. Four properties remove every edge
 * here:
 *   1. The field is defined in WORLD space — document pixels, not element
 *      pixels. An element showing it is a window onto the field, not a
 *      container for it, so a pinned stage scrolls THROUGH the field instead
 *      of carrying it along, and any second window elsewhere on the page shows
 *      the same blooms continuing.
 *   2. Its sources repeat with period PERIOD down the world, using wrapped
 *      distance, so scrolling never runs out of field.
 *   3. Where density is zero the ramp resolves to --atmos-base, which IS the
 *      register's own ground. The field does not end anywhere; it thins into
 *      the page it is painted on.
 *   4. Its own window opens and closes by STRENGTH rather than by geometry —
 *      see the strength curve in VenueStage. There is no frame in the scroll
 *      where a bright field meets a dark ground along a line.
 *
 * Standing constraints from §5: product/atmosphere register only (the
 * technical register maps every atmos token to its flat ground, so the field
 * is invisible if it ever lands there), the hero demos stay the brightest and
 * most detailed thing on screen (the field opens below the hero rather than
 * behind it, and the hero is untouched), and it is fully static under
 * prefers-reduced-motion: one composed pose, drawn once, no rAF and no CSS
 * animation.
 */

/** World px between repeats of a source. Larger than any viewport, so a
 *  repeat is never on screen at the same time as its original. */
const PERIOD = 2400;

/** CSS px per field cell. 20 is where the bilinear magnification stops being
 *  visible: blooms are 500-1100px across, so the field changes by well under
 *  a ramp step per cell and the interpolation has nothing to facet. */
const CELL = 20;

/** The canvas over-hangs its clip box by this much on every side, so the
 *  blur's own soft edge is cut off rather than showing as a dark border. */
const BLEED = 40;

/**
 * Six sources on slow lissajous paths.
 *
 * SIZE AND SPACING ARE THE WHOLE DESIGN. The reference is bright blooms ON
 * PURE BLACK, so the sources have to be big enough to be soft and few enough
 * that black survives between them: rx around a third of the viewport width,
 * ry around a fifth of PERIOD, and cy spread down the period so only two or
 * three are ever vertically in range of one screen. A first pass used seven
 * wider ones and the frame came out as a single flat lilac wash with no black
 * anywhere, which is the "dark-grey ground" §5 explicitly rejects.
 *
 * The bright ones sit left of centre and the ones that reach the right edge
 * are the dim ones, because the step text stands in the right column and the
 * field must not be brightest underneath it.
 *
 * Frequencies are rad/s, set so a bloom centre travels roughly 30-50px in a
 * second: the two rejected fields were "completely static" and "drifted too
 * slowly to see", and tests/gimmicks.spec.ts samples 900ms apart. cx outside
 * [0,1] puts a source off-frame, so blooms enter and leave rather than pulsing
 * in place. rx/ry are fractions of viewport width and of PERIOD.
 */
const SOURCES = [
  { cx: 0.20, ax: 0.20, fx: 0.13, px: 0.0, cy: 0.06, ay: 0.045, fy: 0.10, py: 1.1, vy: -26, rx: 0.40, ry: 0.20, amp: 1.45 },
  { cx: 0.55, ax: 0.18, fx: 0.17, px: 2.1, cy: 0.29, ay: 0.050, fy: 0.12, py: 0.4, vy: -19, rx: 0.34, ry: 0.17, amp: 1.20 },
  { cx: 0.36, ax: 0.24, fx: 0.11, px: 4.0, cy: 0.50, ay: 0.045, fy: 0.08, py: 2.7, vy: -33, rx: 0.46, ry: 0.23, amp: 1.60 },
  { cx: -0.06, ax: 0.17, fx: 0.19, px: 1.3, cy: 0.70, ay: 0.040, fy: 0.14, py: 5.0, vy: -22, rx: 0.32, ry: 0.16, amp: 1.15 },
  { cx: 1.02, ax: 0.19, fx: 0.15, px: 3.4, cy: 0.86, ay: 0.050, fy: 0.09, py: 3.9, vy: -29, rx: 0.34, ry: 0.17, amp: 0.95 },
  { cx: 0.74, ax: 0.21, fx: 0.09, px: 5.2, cy: 0.40, ay: 0.060, fy: 0.13, py: 1.7, vy: -15, rx: 0.28, ry: 0.14, amp: 0.85 },
];

/** Colour ramp resolution. 256 entries is one per byte of density. */
const STEPS = 256;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export default function AmbientField({
  base = 1,
  strengthOf,
  className = "",
}: {
  /** Constant strength when the owner supplies no live measure. */
  base?: number;
  /**
   * Live strength, read AT DRAW TIME rather than pushed in as a prop or a ref
   * the owner updates on its own clock. Two clocks would mean the first frame
   * after a scroll paints last frame's strength, and the first frame after a
   * scroll is exactly the frame the ambient-visibility floor photographs.
   */
  strengthOf?: () => number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  // Kept current without re-running the effect: the callback identity changes
  // with every render of the owner, the drawing loop must not.
  const strengthFn = useRef(strengthOf);
  useEffect(() => {
    strengthFn.current = strengthOf;
  });

  useEffect(() => {
    const host = hostRef.current;
    const cv = cvRef.current;
    if (!host || !cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    // --- colour ------------------------------------------------------------
    // Built once per theme from the register's own atmos tokens, so the field
    // re-themes with everything else and its floor is exactly the ground it
    // sits on. Rebuilt when data-theme changes: the capture harness sets that
    // attribute at runtime, after mount.
    let lut = new Uint8Array(STEPS * 3);
    const buildLut = () => {
      const g = (n: string) => rgbBytes(tokenOn(host, n));
      const groundBase = g("atmos-base");
      const mid = g("atmos-mid");
      const core = g("atmos-core");
      const next = new Uint8Array(STEPS * 3);
      for (let i = 0; i < STEPS; i++) {
        const t = i / (STEPS - 1);
        // Two segments, both deliberately late. The first is a power curve
        // rather than a smoothstep so the bottom half of the range stays
        // almost entirely at the ground — that is what keeps black between
        // blooms black instead of lifting the whole frame to dark grey. The
        // second only reaches the bright core near the top of the range, so
        // the luminous centre appears where blooms cross rather than over
        // every bloom, which is the structure the reference frame has.
        const a = Math.pow(t, 2.1);
        const b = Math.pow(clamp01((t - 0.46) / 0.54), 1.6);
        for (let c = 0; c < 3; c++) {
          const low = groundBase[c] + (mid[c] - groundBase[c]) * a;
          next[i * 3 + c] = low + (core[c] - low) * b;
        }
      }
      lut = next;
    };
    buildLut();

    // --- geometry ----------------------------------------------------------
    let gw = 0;
    let gh = 0;
    let img: ImageData | null = null;
    let sinRow = new Float32Array(0);
    let cosCol = new Float32Array(0);
    let cssW = 0;

    const measure = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (w < 1 || h < 1) return false;
      cssW = w;
      const nw = Math.max(4, Math.ceil(w / CELL));
      const nh = Math.max(4, Math.ceil(h / CELL));
      if (nw === gw && nh === gh) return true;
      gw = nw;
      gh = nh;
      cv.width = gw;
      cv.height = gh;
      img = ctx.createImageData(gw, gh);
      sinRow = new Float32Array(gh);
      cosCol = new Float32Array(gw);
      return true;
    };

    // --- the field ---------------------------------------------------------
    const t0 = performance.now();
    // Scratch, allocated once: per-frame source state in screen/world units.
    const sx = new Float64Array(SOURCES.length);
    const sy = new Float64Array(SOURCES.length);
    const irx = new Float64Array(SOURCES.length);
    const iry = new Float64Array(SOURCES.length);

    const draw = (now: number) => {
      if (!measure() || !img) return;
      const t = reduce.matches ? 0 : (now - t0) / 1000;
      // World space: the document, not the element. This is what makes two
      // mounts one field, and what makes the pinned stage scroll THROUGH the
      // field rather than carrying it along.
      const worldY = window.scrollY + cv.getBoundingClientRect().top;
      const strength = strengthFn.current ? strengthFn.current() : base;
      const W = cssW;

      for (let i = 0; i < SOURCES.length; i++) {
        const s = SOURCES[i];
        sx[i] = (s.cx + s.ax * Math.sin(t * s.fx + s.px)) * W;
        sy[i] = s.cy * PERIOD + s.ay * PERIOD * Math.sin(t * s.fy + s.py) + t * s.vy;
        irx[i] = 1 / (s.rx * W);
        iry[i] = 1 / (s.ry * PERIOD);
      }

      // Domain warp. Separable — one trig per row and per column instead of
      // two per cell — which is what keeps a full frame under a millisecond.
      const wa = W * 0.13;
      const kx = (Math.PI * 2) / (W * 1.55);
      const ky = (Math.PI * 2) / (PERIOD * 0.62);
      for (let gy = 0; gy < gh; gy++) {
        sinRow[gy] = wa * Math.sin((worldY + gy * CELL) * ky + t * 0.17);
      }
      for (let gx = 0; gx < gw; gx++) {
        cosCol[gx] = wa * Math.cos(gx * CELL * kx - t * 0.13);
      }

      const data = img.data;
      let p = 0;
      for (let gy = 0; gy < gh; gy++) {
        const y0 = worldY + gy * CELL;
        const warpX = sinRow[gy];
        for (let gx = 0; gx < gw; gx++) {
          const x = gx * CELL + warpX;
          const y = y0 + cosCol[gx];
          let d = 0;
          for (let i = 0; i < SOURCES.length; i++) {
            const ex = (x - sx[i]) * irx[i];
            // Wrapped distance: the source exists once every PERIOD down the
            // world, so the field has no top and no bottom.
            let dy = y - sy[i];
            dy -= PERIOD * Math.round(dy / PERIOD);
            const ey = dy * iry[i];
            const u = ex * ex + ey * ey;
            if (u < 1) {
              const w = 1 - u;
              d += SOURCES[i].amp * w * w;
            }
          }
          // Soft saturation: one source at full amplitude lands around 0.75,
          // two crossing land around 0.9, and nothing ever clips. That gap is
          // what makes an overlap read as a lit centre rather than as a
          // plateau at the same value as its neighbours.
          const v = clamp01((1 - Math.exp(-d * 0.95)) * strength);
          const li = ((v * (STEPS - 1)) | 0) * 3;
          data[p] = lut[li];
          data[p + 1] = lut[li + 1];
          data[p + 2] = lut[li + 2];
          data[p + 3] = 255;
          p += 4;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    // --- scheduling --------------------------------------------------------
    // 30fps. The demos own the frame budget (§3); the atmosphere does not need
    // 60 and halving it halves the cost of the two mounts together.
    const MIN_DT = 32;
    let raf = 0;
    let last = -Infinity;
    let visible = true;
    let running = false;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < MIN_DT) return;
      last = now;
      draw(now);
    };
    const start = () => {
      if (running || reduce.matches) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    // First pose is drawn immediately, before any observer has had a chance to
    // fire: a field that is blank until it happens to be scrolled to is a
    // field that photographs as a flat fill.
    draw(performance.now());

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) {
          if (reduce.matches) draw(performance.now());
          else start();
        } else {
          stop();
        }
      },
      { rootMargin: "10%" }
    );
    io.observe(host);

    const onResize = () => {
      gw = gh = 0; // force re-measure
      draw(performance.now());
    };
    window.addEventListener("resize", onResize);

    const onPref = () => {
      stop();
      if (reduce.matches) draw(performance.now());
      else if (visible) start();
    };
    reduce.addEventListener("change", onPref);

    const themeWatch = new MutationObserver(() => {
      buildLut();
      draw(performance.now());
    });
    // Every attribute that changes what a token resolves to, not just the
    // theme. The page ground is one of them now (§5, THE PAGE GROUND) and it
    // changes as the visitor scrolls: this LUT was built once at mount, while
    // the entry gate had the page standing in the technical register, whose
    // atmos tokens are a flat white by design — so the field painted the whole
    // atmosphere block white and kept it. PALETTE_ATTRS includes the fade
    // marker's removal, which is when the crossing has settled and
    // getComputedStyle stops handing back an interpolated colour.
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: PALETTE_ATTRS,
    });

    return () => {
      stop();
      io.disconnect();
      themeWatch.disconnect();
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", onPref);
    };
  }, [base]);

  return (
    <div
      ref={hostRef}
      data-testid="ambient-field"
      aria-hidden
      // No CSS background of its own, deliberately. The canvas paints the
      // ground itself (density zero resolves to --atmos-base), and a painted
      // background here would register as a floating ground in
      // tests/themes.spec.ts and score the copy above it against the wrong
      // colour.
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas
        ref={cvRef}
        data-ambient-canvas=""
        className="absolute"
        // The over-hang plus the clip above is what keeps the blur's own soft
        // edge off screen. The blur itself is insurance against banding in the
        // dark end of the ramp, where 8-bit steps across a 900px bloom are
        // otherwise visible as rings.
        // Width and height are stated rather than left to inset stretching:
        // canvas is a replaced element, so `width: auto` on an absolutely
        // positioned one resolves to the intrinsic size from the width
        // attribute (4px here) instead of filling its offsets.
        style={{
          top: -BLEED,
          left: -BLEED,
          width: `calc(100% + ${BLEED * 2}px)`,
          height: `calc(100% + ${BLEED * 2}px)`,
          filter: "blur(12px)",
        }}
      />
    </div>
  );
}
