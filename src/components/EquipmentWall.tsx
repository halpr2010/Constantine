"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import BenchPressWireframe from "@/components/BenchPressWireframe";
import StairmasterVideo from "@/components/StairmasterVideo";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type EquipmentWallProps = {
  /** Live mode only: which animated piece to render. */
  kind?: "bench" | "stair";
  title: string;
  chartColor: string;
  compact?: boolean;
  size?: "default" | "mini";
  /** Static, ranked leaderboard card — mirrors PaintingWall's static mode. */
  static?: boolean;
  /** False while this wall is on a hidden vertical: park and reset it. */
  active?: boolean;
  /** Static cards show a still of the equipment rather than the live animation. */
  imageSrc?: string;
  imageAlt?: string;
  fixedUtilisation?: number;
  rankingInGym?: number;
  /** Positive = moved up the ranking (green), negative = down (red). */
  rankingChange?: number;
  /** 12 monthly values, 0..1, for the static sparkline. */
  staticChartValues?: number[];
};

const DEFAULT_CHART_VALUES = [
  0.42, 0.48, 0.58, 0.52, 0.44, 0.35, 0.38, 0.52, 0.67, 0.78, 0.88, 0.94,
];
const CHART_LABELS = [
  { month: "Jan", index: 0 },
  { month: "Mar", index: 2 },
  { month: "Jun", index: 5 },
  { month: "Sep", index: 8 },
  { month: "Dec", index: 11 },
];

/**
 * EquipmentWall — the gym counterpart to PaintingWall (MonaLisaWall.tsx).
 *
 * The engagement engine is deliberately identical to the painting wall's, so the
 * two read as the same measurement on different surfaces:
 *   Utilisation      mirrors  Engagement Intensity  (same proximity falloff + lerp)
 *   Workout Time (s) mirrors  Attention (s)         (same 0.99 threshold + 0.1s tick)
 * Only the rendered object differs: a canvas of animated equipment instead of a
 * painting, whose tempo rises with utilisation the way a painting gains colour.
 */
export default function EquipmentWall({
  kind,
  title,
  chartColor,
  compact = false,
  size = "default",
  static: isStatic = false,
  active = true,
  imageSrc,
  imageAlt,
  fixedUtilisation,
  rankingInGym,
  rankingChange,
  staticChartValues,
}: EquipmentWallProps) {
  const isMini = size === "mini";
  const displayRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const [reveal, setReveal] = useState(isStatic ? 1 : 0);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const currentRevealRef = useRef(0);
  const targetRevealRef = useRef(0);
  const workoutStartRef = useRef<number | null>(null);
  const lastWorkoutUpdateRef = useRef(0);
  const samplesRef = useRef<{ t: number; v: number }[]>([]);
  const lastSampleRef = useRef(0);
  const lastPointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Identical constants to PaintingWall — utilisation must behave exactly like
  // engagement intensity, and workout time exactly like attention.
  const lerpSpeed = 0.22;
  const chartWindowSeconds = 10;
  const sampleInterval = 0.05;
  const intensityThreshold = 0.99;
  const workoutUpdateInterval = 0.1;

  useEffect(() => {
    // A static card is a frozen leaderboard entry: no proximity engine, no
    // animation loop, no pointer listeners.
    if (isStatic) return;
    // Parked on the hidden vertical: reset so utilisation and workout time
    // start from zero when this tab returns.
    if (!active) {
      targetRevealRef.current = 0;
      currentRevealRef.current = 0;
      workoutStartRef.current = null;
      lastWorkoutUpdateRef.current = 0;
      samplesRef.current = [];
      // Scheduled rather than called straight from the effect body, which the
      // compiler's set-state-in-effect rule rejects as a cascading render.
      const id = requestAnimationFrame(() => {
        setReveal(0);
        setWorkoutSeconds(0);
        const c = chartRef.current;
        const cx = c?.getContext("2d");
        if (c && cx) cx.clearRect(0, 0, c.width, c.height);
      });
      return () => cancelAnimationFrame(id);
    }
    let raf: number | null = null;

    const compute = () => {
      const displayEl = displayRef.current;
      if (!displayEl) return;

      const last = lastPointerRef.current;

      if (!last.active) {
        targetRevealRef.current = 0;
      } else {
        const r = displayEl.getBoundingClientRect();
        const mx = last.x;
        const my = last.y;

        const nearestX = clamp(mx, r.left, r.right);
        const nearestY = clamp(my, r.top, r.bottom);
        const d = Math.hypot(mx - nearestX, my - nearestY);

        // Same two-stage falloff as the painting wall: engagement starts
        // increasing from ~400px away, 100% only when directly on the object.
        const farScale = 400;
        const nearScale = 25;
        const farReach = Math.exp(-((d / farScale) ** 4));
        const nearSharpness = d < 50 ? Math.exp(-((d / nearScale) ** 2)) : 0.14;
        targetRevealRef.current = farReach * nearSharpness;
      }

      currentRevealRef.current = lerp(
        currentRevealRef.current,
        targetRevealRef.current,
        lerpSpeed
      );
      setReveal(currentRevealRef.current);

      const atFullIntensity = currentRevealRef.current >= intensityThreshold;
      const now = performance.now() / 1000;

      // Workout time accrues exactly like attention: only at full utilisation,
      // ticking every 0.1s, reset the moment utilisation drops off.
      if (atFullIntensity) {
        if (workoutStartRef.current === null) {
          workoutStartRef.current = now;
          setWorkoutSeconds(0);
          lastWorkoutUpdateRef.current = 0;
        } else {
          const elapsed = now - workoutStartRef.current;
          if (elapsed - lastWorkoutUpdateRef.current >= workoutUpdateInterval) {
            lastWorkoutUpdateRef.current = elapsed;
            setWorkoutSeconds(elapsed);
          }
        }
      } else {
        workoutStartRef.current = null;
        lastWorkoutUpdateRef.current = 0;
      }

      if (now - lastSampleRef.current >= sampleInterval) {
        lastSampleRef.current = now;
        samplesRef.current.push({ t: now, v: currentRevealRef.current });
        const cutoff = now - chartWindowSeconds;
        samplesRef.current = samplesRef.current.filter((s) => s.t > cutoff);
      }

      const canvas = chartRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const cw = canvas.clientWidth || 260;
          const ch = canvas.clientHeight || 44;
          if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width = cw;
            canvas.height = ch;
          }
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          if (samplesRef.current.length >= 2) {
            const padding = 2;
            const plotW = w - padding * 2;
            const plotH = h - padding * 2;
            const tMin = now - chartWindowSeconds;
            const tMax = now;
            const tRange = tMax - tMin;
            if (tRange >= 0.01) {
              ctx.strokeStyle = chartColor;
              ctx.lineWidth = 1;
              ctx.beginPath();
              for (let i = 0; i < samplesRef.current.length; i++) {
                const s = samplesRef.current[i];
                const x = padding + ((s.t - tMin) / tRange) * plotW;
                const y = padding + plotH - s.v * plotH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
        }
      }
    };

    const onPointer = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const loop = () => {
      compute();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Same listener set as the painting wall — deliberately no pointerleave,
    // which would drop utilisation while the pointer sits still.
    const opts = { capture: true } as AddEventListenerOptions;
    window.addEventListener("pointermove", onPointer, opts);
    window.addEventListener("pointerover", onPointer, opts);
    window.addEventListener("pointerenter", onPointer, opts);

    return () => {
      window.removeEventListener("pointermove", onPointer, opts);
      window.removeEventListener("pointerover", onPointer, opts);
      window.removeEventListener("pointerenter", onPointer, opts);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [chartColor, kind, isStatic, active]);

  // Static mode draws the 12-point monthly sparkline once, the same way
  // PaintingWall does for its leaderboard cards.
  useEffect(() => {
    if (!isStatic) return;
    const values = staticChartValues ?? DEFAULT_CHART_VALUES;

    const draw = () => {
      const canvas = chartRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cw = canvas.clientWidth || 140;
      const ch = canvas.clientHeight || 44;
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const labelH = 12;
      const pad = { top: 8, right: 12, bottom: labelH, left: 12 };
      const plotW = w - pad.left - pad.right;
      const plotH = h - pad.top - pad.bottom;
      const n = values.length;

      ctx.strokeStyle = chartColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = pad.left + (i / (n - 1)) * plotW;
        const y = pad.top + plotH - values[i] * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      const fontFamily =
        typeof document !== "undefined"
          ? getComputedStyle(document.body).fontFamily
          : "system-ui, sans-serif";
      ctx.font = `400 11px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      for (const { month, index } of CHART_LABELS) {
        const x = pad.left + (index / (n - 1)) * plotW;
        ctx.fillText(month, x, h - 3);
      }
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [isStatic, chartColor, staticChartValues]);

  const displaySize = isMini
    ? "h-[180px] w-[180px] md:h-[200px] md:w-[200px]"
    : compact
      ? "h-[300px] w-[225px] md:h-[380px] md:w-[285px]"
      : "h-[360px] w-[270px] md:h-[500px] md:w-[375px]";
  const plaqueSize = isMini
    ? "min-w-[200px] space-y-2.5 px-2 py-2 text-xs"
    : "min-w-[240px] space-y-3 px-2 py-3 text-sm";

  return (
    <div
      className={`relative h-full w-full flex-shrink-0 overflow-visible rounded-3xl ${
        isMini ? "min-h-[360px] md:min-h-[400px]" : "min-h-[480px] md:min-h-[600px]"
      }`}
    >
      {/* Floor background - matches page background */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ background: "#050505" }}
      />

      <div className="absolute inset-0 flex items-center justify-center overflow-visible">
        <div className="relative">
          {/* No panel tint or drop shadow here. A painting covers its card, so
              the tint never shows; this equipment is transparent line art, so a
              zinc-950/30 panel (~rgb(6,6,7)) and a 65% black shadow both read as
              a rectangle of a slightly different black against the page. */}
          <div
            className={`relative flex flex-col items-center ${
              isMini
                ? "w-[260px] rounded-[12px] p-2 md:w-[280px]"
                : "rounded-[20px] p-5"
            }`}
          >
            <div className="rounded-[16px] bg-transparent p-3">
              <div className="rounded-[12px] p-3">
                <div
                  ref={displayRef}
                  className={`relative overflow-hidden rounded-[10px] ${displaySize}`}
                  aria-label={
                    isStatic
                      ? title
                      : `${title} — utilisation rises as the pointer approaches`
                  }
                >
                  {imageSrc ? (
                    // No blend mode: these stills are already exported on the
                    // page's own background, so screening them would lift that
                    // backdrop above rgb(5,5,5) and reintroduce a seam.
                    <Image
                      src={imageSrc}
                      alt={imageAlt ?? title}
                      fill
                      sizes="200px"
                      className="object-contain"
                    />
                  ) : kind === "bench" ? (
                    // No colour ramp here: the filter's low-contrast, high-
                    // brightness rest state lifts the barbell's solid black
                    // plates to grey and washes the whole wireframe out. This
                    // graphic shows utilisation through motion instead.
                    <div className="absolute inset-0">
                      <BenchPressWireframe util={reveal} />
                    </div>
                  ) : (
                    <StairmasterVideo util={reveal} />
                  )}
                  {/* No sheen. The painting card's glass highlight reads as
                      glass over artwork, but over gym line art on the page
                      background it just washes a diagonal band up to
                      rgb(15,15,15) against a rgb(5,5,5) page. */}
                </div>
              </div>
            </div>

            {/* plaque */}
            <div className={`mt-0.5 w-full text-white/60 ${plaqueSize}`}>
              <div className="pb-4 text-center">
                <div className="font-medium text-white/80">{title}</div>
              </div>

              {isStatic ? (
                <>
                  {rankingInGym != null && (
                    <div className="flex items-center justify-between">
                      <span className="whitespace-nowrap">Ranking in Gym</span>
                      <span className="flex items-center gap-1">
                        #{rankingInGym}
                        {rankingChange != null && rankingChange !== 0 && (
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
                              rankingChange > 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            {rankingChange > 0 ? (
                              <>
                                <span aria-hidden>↑</span>
                                <span>(+{rankingChange})</span>
                              </>
                            ) : (
                              <>
                                <span aria-hidden>↓</span>
                                <span>({rankingChange})</span>
                              </>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="whitespace-nowrap">
                      Avg. Utilisation (%)
                    </span>
                    <span>{(fixedUtilisation ?? 0).toFixed(0)}%</span>
                  </div>
                  <div className="pt-1 text-center text-xs font-medium text-white/60">
                    Monthly Utilisation
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="whitespace-nowrap">Workout Time (s)</span>
                    <span style={{ opacity: 0.45 + reveal * 0.55 }}>
                      {workoutSeconds.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="whitespace-nowrap">Utilisation</span>
                    <span style={{ opacity: 0.45 + reveal * 0.55 }}>
                      {Math.round(reveal * 100)}%
                    </span>
                  </div>
                </>
              )}

              <div
                className={`${isStatic ? "" : "mt-4"} ${
                  isStatic && isMini ? "h-11 min-h-[44px]" : "h-11 min-h-[48px]"
                }`}
              >
                <canvas
                  ref={chartRef}
                  width={isMini ? 140 : 260}
                  height={44}
                  className={`w-full rounded bg-zinc-950/60 ${
                    isMini ? "min-w-[120px]" : "min-w-[200px]"
                  }`}
                  style={{
                    width: "100%",
                    height: "44px",
                    minWidth: isMini ? "120px" : "200px",
                  }}
                  aria-label={
                    isStatic
                      ? "Utilisation by month"
                      : "Utilisation over last 10 seconds"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
