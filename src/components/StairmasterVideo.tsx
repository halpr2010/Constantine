"use client";

import { useEffect, useRef } from "react";

/**
 * StairmasterVideo — the stairmaster's counterpart to the bench wireframe.
 * A looping wireframe clip whose playback is driven by `util` (0..1), the same
 * proximity value that feeds the Utilisation metric:
 *   util 0   -> paused on a still frame (an idle machine)
 *   util > 0 -> playing and looping, MIN_RATE..MAX_RATE with utilisation
 * Muted + playsInline so the browser permits programmatic play/pause.
 */

const MIN_RATE = 0.35; // barely turning over the moment it engages
const MAX_RATE = 2.0; // full pace at 100% utilisation
const START_AT = 0.25; // the machine only comes into use at 25% utilisation

// Only the clip's final 4 seconds are used. The native `loop` attribute can
// only cycle a whole file, so the segment is wrapped by hand instead.
const LOOP_START = 4.0;
const LOOP_END = 8.0;

// The clip is 1280x720, but the machine only occupies x 379-792, y 31-696 of
// that frame — roughly a fifth of the area, with wide black margins either
// side. Scaling the video up and offsetting it crops to the machine, so it
// fills the card the way the bench wireframe does. The card is clipped, so the
// discarded margins never show. Values derived from that measured box; nudge
// LEFT/TOP to re-centre, ZOOM to tighten or loosen the crop.
const ZOOM_PCT = 235.8; // video width, as a percentage of the card width
const LEFT_PCT = -57.9; // of card width
const TOP_PCT = -0.3; // of card height

export default function StairmasterVideo({ util = 0 }: { util?: number }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (util < START_AT) {
      if (!v.paused) v.pause();
      return;
    }

    // Ramp MIN_RATE..MAX_RATE across the active range, so it eases in at the
    // threshold instead of snapping straight to a mid-range speed.
    const t = Math.min(1, (util - START_AT) / (1 - START_AT));
    v.playbackRate = MIN_RATE + (MAX_RATE - MIN_RATE) * t;
    // Only call play() on the paused -> playing edge. `util` changes every
    // frame, and firing play() each time would spawn a promise per frame.
    if (v.paused) {
      if (v.currentTime < LOOP_START || v.currentTime >= LOOP_END) {
        v.currentTime = LOOP_START;
      }
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [util]);

  // Keep playback inside the loop window.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;
    let handle = 0;

    const wrap = () => {
      if (v.currentTime >= LOOP_END - 0.05 || v.currentTime < LOOP_START - 0.05) {
        v.currentTime = LOOP_START;
      }
    };

    // requestVideoFrameCallback fires per presented frame, so the wrap lands
    // within a frame of the out point. timeupdate only fires ~4x/sec, which at
    // 2x playback would overshoot noticeably.
    type RVFC = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
      cancelVideoFrameCallback?: (h: number) => void;
    };
    const rv = v as RVFC;
    const hasRVFC = typeof rv.requestVideoFrameCallback === "function";

    if (hasRVFC) {
      const step = () => {
        if (cancelled) return;
        wrap();
        handle = rv.requestVideoFrameCallback!(step);
      };
      handle = rv.requestVideoFrameCallback!(step);
    } else {
      v.addEventListener("timeupdate", wrap);
    }

    // Backstop, and it also parks the idle frame inside the window.
    const onEnded = () => {
      v.currentTime = LOOP_START;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    const onLoaded = () => {
      if (v.currentTime < LOOP_START) v.currentTime = LOOP_START;
    };
    v.addEventListener("ended", onEnded);
    v.addEventListener("loadedmetadata", onLoaded);
    if (v.readyState >= 1) onLoaded();

    return () => {
      cancelled = true;
      if (hasRVFC && rv.cancelVideoFrameCallback) rv.cancelVideoFrameCallback(handle);
      else v.removeEventListener("timeupdate", wrap);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src="/stairmaster.mp4"
      muted
      playsInline
      preload="auto"
      className="absolute"
      style={{
        width: `${ZOOM_PCT}%`,
        // Tailwind Preflight sets `video { max-width: 100% }`, which would cap
        // the zoom at the card width and silently undo the crop.
        maxWidth: "none",
        height: "auto",
        left: `${LEFT_PCT}%`,
        top: `${TOP_PCT}%`,
        display: "block",
        // The clip is white line art on pure black, which sits darker than the
        // page. Screen blending maps that black to the backdrop exactly, so the
        // wireframe floats on the page colour instead of on a black rectangle.
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
}
