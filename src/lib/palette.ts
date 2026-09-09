/**
 * The single path by which drawing code receives colour.
 *
 * Canvas cannot read CSS variables, so without this the demos would keep
 * hardcoded colours and every theme-variant screenshot would lie about the
 * most important elements on the page. Resolve tokens here; never inline a
 * colour literal in a component that draws.
 */
export type PaletteToken =
  | "chart-1"
  | "chart-2"
  | "chart-label"
  | "stage-surface"
  | "instrument-fg";

export function token(name: PaletteToken | string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
}

/**
 * The same bridge, read in the REGISTER SCOPE an element actually stands in.
 *
 * `token()` reads the root, which is correct for the demos: they are always
 * on-stage and the stage is theme-level. Anything that draws inside a
 * [data-register] block needs that block's remapped value instead — reading
 * the root there returns the page's register and the drawing silently paints
 * in the wrong one.
 */
export function tokenOn(el: Element, name: PaletteToken | string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(el).getPropertyValue(`--${name}`).trim();
}

/**
 * Any CSS colour the browser understands → straight sRGB bytes.
 *
 * Tokens built with color-mix(in oklab, ...) compute to an `oklab()` string,
 * so a regex reads them as unparseable and drawing code silently drops them.
 * Round-tripping through a 1x1 canvas makes the browser do the conversion, and
 * composites any alpha over the supplied ground so the result is a real colour
 * rather than a premultiplied surprise. Same trick tests/themes.spec.ts uses.
 */
let probe: CanvasRenderingContext2D | null = null;
export function rgbBytes(
  color: string,
  over: [number, number, number] = [0, 0, 0]
): [number, number, number] {
  if (typeof window === "undefined") return over;
  if (!probe) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    probe = cv.getContext("2d", { willReadFrequently: true });
    if (probe) probe.globalCompositeOperation = "copy";
  }
  if (!probe || !color) return over;
  // Two assignments: an unparseable value leaves fillStyle at the previous
  // one, so seeding with a known colour makes a bad token detectable rather
  // than inheriting whatever was set last.
  probe.fillStyle = "#000000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  const a = d[3] / 255;
  return [
    d[0] * a + over[0] * (1 - a),
    d[1] * a + over[1] * (1 - a),
    d[2] * a + over[2] * (1 - a),
  ];
}
