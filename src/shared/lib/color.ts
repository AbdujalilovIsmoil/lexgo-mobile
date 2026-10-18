/** Mixes a #rrggbb colour towards white (amount 0..1) — the light end of a gradient. */
export function lighten(hex: string, amount = 0.4): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v + (255 - v) * amount).toString(16).padStart(2, "0");
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
}
