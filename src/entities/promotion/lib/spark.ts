/** Bar heights (px, at least `min`) for a tiny trend chart; an all-zero series is flat. */
export function sparkBars(values: number[], max: number, min = 3): number[] {
  const top = Math.max(0, ...values);
  return values.map((v) => (top > 0 ? Math.max(min, Math.round((Math.max(0, v) / top) * max)) : min));
}
