"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type PaintingWallProps = {
  src: string;
  alt: string;
  title: string;
  chartColor: string;
  compact?: boolean;
  minColorFloor?: number;
  plaqueSubtitle?: string;
  size?: "default" | "compact" | "mini";
  fixedAttentionTime?: number;
  rankingInExhibition?: number;
  /** Change in ranking (positive = moved up, negative = moved down) */
  rankingChange?: number;
  static?: boolean;
  /** 12 monthly values for static chart (Jan–Dec), should peak in Dec */
  staticChartValues?: number[];
};

export default function PaintingWall({
  src,
  alt,
  title,
  chartColor,
  compact = false,
  minColorFloor = 0.45,
  plaqueSubtitle,
  size = "default",
  fixedAttentionTime,
  rankingInExhibition,
  rankingChange,
  static: isStatic = false,
  staticChartValues: staticChartValuesProp,
}: PaintingWallProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const paintingRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  const [reveal, setReveal] = useState(0);
  const [attentionSeconds, setAttentionSeconds] = useState(0);
  const currentRevealRef = useRef(0);
  const targetRevealRef = useRef(0);
  const attentionStartRef = useRef<number | null>(null);
  const lastAttentionUpdateRef = useRef(0);
  const samplesRef = useRef<{ t: number; v: number }[]>([]);
  const lastSampleRef = useRef(0);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const lerpSpeed = 0.22;
  const chartWindowSeconds = 10;
  const sampleInterval = 0.05;
  const intensityThreshold = 0.99;
  const attentionUpdateInterval = 0.1;

  // Static monthly chart: 12 data points, 5 x-axis labels (Jan, Mar, Jun, Sep, Dec)
  const defaultChartValues = useMemo(
    () => [0.42, 0.48, 0.58, 0.52, 0.44, 0.35, 0.38, 0.52, 0.67, 0.78, 0.88, 0.94],
    []
  );
  const staticChartValues = staticChartValuesProp ?? defaultChartValues;
  const staticChartLabels = useMemo(
    () => [
      { month: "Jan", index: 0 },
      { month: "Mar", index: 2 },
      { month: "Jun", index: 5 },
      { month: "Sep", index: 8 },
      { month: "Dec", index: 11 },
    ],
    []
  );

  useEffect(() => {
    let raf: number | null = null;

    const compute = () => {
      const imageEl = imageRef.current;
      if (!imageEl) return;

      const last = lastPointerRef.current;

      if (isStatic) {
        targetRevealRef.current = 1;
        currentRevealRef.current = 1;
        setReveal(1);
        const now = performance.now() / 1000;
        if (samplesRef.current.length === 0) {
          for (let i = 0; i < 50; i++) {
            samplesRef.current.push({ t: now - (50 - i) * 0.2, v: 1 });
          }
        }
      } else if (!last.active) {
        targetRevealRef.current = 0;
      } else {
        const r = imageEl.getBoundingClientRect();
        const mx = last.x;
        const my = last.y;

        const nearestX = clamp(mx, r.left, r.right);
        const nearestY = clamp(my, r.top, r.bottom);
        const d = Math.hypot(mx - nearestX, my - nearestY);

        // Far reach: engagement starts increasing from ~400px away.
        // Sharp falloff near painting: 100% only when d=0 (mouse directly on painting).
        const farScale = 400;
        const nearScale = 25;
        const farReach = Math.exp(-((d / farScale) ** 4));
        const nearSharpness = d < 50 ? Math.exp(-((d / nearScale) ** 2)) : 0.14;
        const rawT = farReach * nearSharpness;
        targetRevealRef.current = rawT;
      }

      currentRevealRef.current = lerp(
        currentRevealRef.current,
        targetRevealRef.current,
        lerpSpeed
      );
      setReveal(currentRevealRef.current);

      const atFullIntensity = currentRevealRef.current >= intensityThreshold;
      const now = performance.now() / 1000;

      if (atFullIntensity) {
        if (attentionStartRef.current === null) {
          attentionStartRef.current = now;
          setAttentionSeconds(0);
          lastAttentionUpdateRef.current = 0;
        } else {
          const elapsed = now - attentionStartRef.current;
          if (elapsed - lastAttentionUpdateRef.current >= attentionUpdateInterval) {
            lastAttentionUpdateRef.current = elapsed;
            setAttentionSeconds(elapsed);
          }
        }
      } else {
        attentionStartRef.current = null;
        lastAttentionUpdateRef.current = 0;
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
          // Match canvas resolution to display size to avoid stretched text
          const cw = canvas.clientWidth || (isMini ? 140 : 260);
          const ch = canvas.clientHeight || 44;
          if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width = cw;
            canvas.height = ch;
          }
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          if (isStatic) {
            // Static monthly chart: 12 data points, 5 x-axis labels
            const labelH = 12;
            const padding = { top: 8, right: 12, bottom: labelH, left: 12 };
            const plotW = w - padding.left - padding.right;
            const plotH = h - padding.top - padding.bottom;
            const n = staticChartValues.length;

            ctx.strokeStyle = chartColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < n; i++) {
              const x = padding.left + (i / (n - 1)) * plotW;
              const y = padding.top + plotH - staticChartValues[i] * plotH;
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
            for (const { month, index } of staticChartLabels) {
              const x = padding.left + (index / (n - 1)) * plotW;
              ctx.fillText(month, x, h - 3);
            }
          } else if (samplesRef.current.length >= 2) {
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
                const y = padding + plotH - (s.v * plotH);
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
      if (raf == null) loop();
    };

    const loop = () => {
      compute();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const opts = { capture: true } as AddEventListenerOptions;
    if (!isStatic) {
      window.addEventListener("pointermove", onPointer, opts);
      window.addEventListener("pointerover", onPointer, opts);
      window.addEventListener("pointerenter", onPointer, opts);
      // Don't use pointerleave - it can cause engagement to drop when mouse is stationary.
      // We keep last position and only update on pointermove.
    }

    return () => {
      if (!isStatic) {
        window.removeEventListener("pointermove", onPointer, opts);
        window.removeEventListener("pointerover", onPointer, opts);
        window.removeEventListener("pointerenter", onPointer, opts);
      }
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [chartColor, isStatic, staticChartValues, staticChartLabels]);

  // Compute filters from reveal so:
  // far: 5% color minimum (not fully white)
  // near: full color
  const styles = useMemo(() => {
    const t = minColorFloor + (1 - minColorFloor) * reveal;
    const grayscale = 1 - t;
    const saturate = 0.1 + t * 0.9;
    const brightness = 2.7 - t * 1.5;
    const contrast = 0.15 + t * 0.95;

    // Wall “color intensity” (subtle)
    return {
      paintingFilter: `grayscale(${grayscale}) saturate(${saturate}) brightness(${brightness}) contrast(${contrast})`,
    };
  }, [reveal, minColorFloor]);

  const isMini = size === "mini";
  const imageSize = isMini
    ? "h-[180px] w-[135px] md:h-[200px] md:w-[150px]"
    : compact
      ? "h-[300px] w-[225px] md:h-[380px] md:w-[285px]"
      : "h-[360px] w-[270px] md:h-[500px] md:w-[375px]";
  const plaqueSize = isMini ? "min-w-[200px] space-y-2.5 px-2 py-2 text-xs" : "min-w-[240px] space-y-3 px-2 py-3 text-sm";
  const chartSize = isMini ? "min-h-[32px] h-8" : "min-h-[48px] h-11";

  return (
    <div
      ref={wrapRef}
      className={`relative h-full w-full flex-shrink-0 overflow-visible rounded-3xl ${
        isMini ? "min-h-[360px] md:min-h-[400px]" : "min-h-[480px] md:min-h-[600px]"
      }`}
    >
      {/* Wall background - matches page background */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ background: "#050505" }}
      />

      {/* Painting area */}
      <div className="absolute inset-0 flex items-center justify-center overflow-visible">
        <div className="relative">
          {/* frame + painting */}
            <div
              ref={paintingRef}
              className={`relative flex flex-col items-center rounded-[20px] bg-zinc-950/30 shadow-[0_40px_90px_rgba(0,0,0,0.65)] ${
                isMini ? "w-[260px] p-2 rounded-[12px] md:w-[280px]" : "p-5"
              }`}
            >
            {/* outer frame */}
            <div className={`rounded-[16px] ${
              isMini ? "rounded-[10px] overflow-hidden p-0 bg-transparent" : "p-3 bg-transparent"
            }`}>
              {/* inner mat */}
              <div className={`rounded-[12px] ${
                isMini ? "rounded-[8px] overflow-hidden p-0" : "rounded-[12px] p-3"
              }`}>
                {/* actual image */}
                <div
                  ref={imageRef}
                  className={`relative overflow-hidden rounded-[10px] ${imageSize}`}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    priority
                    className="object-cover"
                    style={{
                      filter: styles.paintingFilter,
                      transition: "filter 120ms ease-out",
                    }}
                  />
                  {/* subtle glass reflection */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-40" />
                </div>
              </div>
            </div>

            {/* small plaque */}
            <div className={`mt-0.5 w-full text-white/60 ${plaqueSize}`}>
              <div className="text-center pb-4">
                <div className="font-medium text-white/80">{title}</div>
                {plaqueSubtitle && (
                  <div className="mt-1 text-xs text-white/50">
                    {plaqueSubtitle}
                  </div>
                )}
              </div>
              {rankingInExhibition != null && (
                <div className="flex items-center justify-between">
                  <span className="whitespace-nowrap">Ranking in Exhibition</span>
                  <span className="flex items-center gap-1" style={{ opacity: 0.45 + reveal * 0.55 }}>
                    #{rankingInExhibition}
                    {rankingChange != null && rankingChange !== 0 && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
                          rankingChange > 0 ? "text-emerald-500" : "text-red-500"
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
                  {isStatic ? "Avg. Attention Time (s)" : "Attention (s)"}
                </span>
                <span style={{ opacity: 0.45 + reveal * 0.55 }}>
                  {(fixedAttentionTime ?? attentionSeconds).toFixed(1)}
                </span>
              </div>
              {!isStatic && (
                <div className="flex items-center justify-between">
                  <span className="whitespace-nowrap">Engagement Intensity</span>
                  <span style={{ opacity: 0.45 + reveal * 0.55 }}>
                    {Math.round(reveal * 100)}%
                  </span>
                </div>
              )}
              {isStatic && (
                <div className="pt-1 text-center text-xs font-medium text-white/60">
                  Monthly Engagement
                </div>
              )}
              <div className={`${isStatic ? "" : "mt-4"} ${isStatic && isMini ? "min-h-[44px] h-11" : chartSize}`}>
                <canvas
                  ref={chartRef}
                  width={isMini ? 140 : 260}
                  height={isStatic && isMini ? 44 : isMini ? 28 : 44}
                  className={`w-full rounded bg-zinc-950/60 ${isMini ? "min-w-[120px]" : "min-w-[200px]"}`}
                  style={{
                    width: "100%",
                    height: isStatic && isMini ? "44px" : isMini ? "28px" : "44px",
                    minWidth: isMini ? "120px" : "200px",
                  }}
                  aria-label={isStatic ? "Engagement by month" : "Engagement intensity over last 10 seconds"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
