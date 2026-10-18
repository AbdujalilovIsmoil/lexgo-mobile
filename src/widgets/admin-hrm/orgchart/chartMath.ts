export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2.4;
const KEEP = 80; // px of the chart that must stay on screen

export const clamp = (v: number, lo: number, hi: number) => {
  "worklet";
  return Math.min(hi, Math.max(lo, v));
};

// Content is scaled around its own centre, so its centre sits at (cw/2 + t). Keep at least KEEP px of the chart visible.
export const bound = (cw: number, vw: number, k: number) => {
  "worklet";
  return { lo: KEEP - (cw * k) / 2 - cw / 2, hi: vw - KEEP + (cw * k) / 2 - cw / 2 };
};
