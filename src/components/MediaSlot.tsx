"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion, stillQuery } from "@/lib/motion";

/**
 * MediaSlot — §4d rule 1 in one component: "a slot is a finished component
 * with pending content".
 *
 * The box is declared once and never moves. With no `src` it renders whatever
 * pending state its caller passes; the day a clip exists, the same box renders
 * a <video> at the identical aspect ratio, so the swap is a one-line prop
 * change and costs zero layout. That is the whole of the file-drop contract,
 * and it is why the pending state is a CHILD rather than a fallback baked in
 * here: a slot's emptiness is a design problem specific to the section it sits
 * in, while the geometry and the playback contract are not.
 *
 * PLAYBACK CONTRACT (§4d rule 1): muted, looped, inline, metadata-only preload,
 * and PARKED under prefers-reduced-motion on its poster frame. §5's scope note
 * puts autoplaying footage squarely in the ambient half of the ambient/
 * interaction split, so the preference stops it outright rather than slowing
 * it. The effect also listens for the preference changing, because the
 * capture harness and tests/gimmicks.spec.ts both flip it after mount.
 *
 * FLOOR (§4d rule 5, and tests/media.spec.ts): the slot is tagged
 * data-testid="media-slot" and publishes its declared ratio as data-aspect, so
 * the floor can assert that poster and video share dimensions without knowing
 * which state it caught. That floor is CONDITIONAL: zero slots on the page is
 * a legitimate pass.
 */
export default function MediaSlot({
  src,
  poster,
  aspect = "16 / 9",
  aspectSm,
  label,
  register,
  className,
  children,
}: {
  /** Drop the clip in /public and pass its path. Filenames are case-sensitive
      on Vercel's Linux build even though macOS will forgive you locally. */
  src?: string;
  /** The still the slot holds before playback and under reduced motion. */
  poster?: string;
  /** CSS aspect-ratio at md and above, and the ratio the clip is authored at. */
  aspect?: string;
  /** Optional ratio below md. §4d permits a mobile-specific shape, and a 16:9
      frame is 192px tall on a 390px screen, which is not enough room for the
      slot to say anything about itself. Both ratios are published, so the
      floor can measure whichever one is in force. */
  aspectSm?: string;
  /** What the footage shows, for anyone who cannot see it. */
  label: string;
  /** The register the frame is a stage IN. A slot is drawn in the ★
      on-stage-only instrument scale, and since sections declare the PAGE
      ground rather than carrying a register of their own, a slot that does not
      claim one inherits whatever ground the reader has scrolled to. */
  register?: "canvas" | "product" | "technical";
  className?: string;
  /** The pending state. Rendered only while `src` is absent. */
  children: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const apply = () => {
      if (prefersReducedMotion()) {
        v.pause();
        v.currentTime = 0;
        return;
      }
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    apply();
    const q = stillQuery();
    q?.addEventListener("change", apply);
    return () => q?.removeEventListener("change", apply);
  }, [src]);

  return (
    <div
      data-testid="media-slot"
      data-register={register}
      data-aspect={aspect}
      data-aspect-sm={aspectSm ?? aspect}
      data-slot-state={src ? "filled" : "pending"}
      style={
        {
          "--slot-aspect": aspect,
          "--slot-aspect-sm": aspectSm ?? aspect,
        } as CSSProperties
      }
      className={`media-slot relative w-full overflow-hidden ${className ?? ""}`}
    >
      {src ? (
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        children
      )}
    </div>
  );
}
