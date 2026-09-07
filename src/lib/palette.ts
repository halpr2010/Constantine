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
