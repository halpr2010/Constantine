"use client";

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
  kind: "bench" | "stair";
  title: string;
  chartColor: string;
  compact?: boolean;
};

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
}: EquipmentWallProps) {
  const displayRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const [reveal, setReveal] = useState(0);
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
  }, [chartColor, kind]);

  const displaySize = compact
    ? "h-[300px] w-[225px] md:h-[380px] md:w-[285px]"
    : "h-[360px] w-[270px] md:h-[500px] md:w-[375px]";

  return (
    <div className="relative h-full w-full flex-shrink-0 overflow-visible rounded-3xl min-h-[480px] md:min-h-[600px]">
      {/* Floor background - matches page background */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ background: "#050505" }}
      />

      <div className="absolute inset-0 flex items-center justify-center overflow-visible">
        <div className="relative">
          <div className="relative flex flex-col items-center rounded-[20px] bg-zinc-950/30 p-5 shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
            <div className="rounded-[16px] bg-transparent p-3">
              <div className="rounded-[12px] p-3">
                <div
                  ref={displayRef}
                  className={`relative rounded-[10px] ${
                    // The barbell's near plate deliberately overhangs the
                    // bench image to the left, so this box must not clip.
                    kind === "bench" ? "overflow-visible" : "overflow-hidden"
                  } ${displaySize}`}
                  aria-label={`${title} — utilisation rises as the pointer approaches`}
                >
                  {kind === "bench" ? (
                    // No colour ramp here: the filter's low-contrast, high-
                    // brightness rest state lifts the barbell's solid black
                    // plates to grey and washes the whole wireframe out. This
                    // graphic shows utilisation through motion instead.
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BenchPressWireframe util={reveal} />
                    </div>
                  ) : (
                    <StairmasterVideo util={reveal} />
                  )}
                  {/* subtle sheen, mirrors the painting's glass */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-40" />
                </div>
              </div>
            </div>

            {/* plaque */}
            <div className="mt-0.5 w-full min-w-[240px] space-y-3 px-2 py-3 text-sm text-white/60">
              <div className="pb-4 text-center">
                <div className="font-medium text-white/80">{title}</div>
              </div>
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
              <div className="mt-4 h-11 min-h-[48px]">
                <canvas
                  ref={chartRef}
                  width={260}
                  height={44}
                  className="w-full min-w-[200px] rounded bg-zinc-950/60"
                  style={{ width: "100%", height: "44px", minWidth: "200px" }}
                  aria-label="Utilisation over last 10 seconds"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
