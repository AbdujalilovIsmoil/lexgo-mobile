import { asNum, type Dict } from "@/shared/lib/json";

export const n = (d: Dict | undefined, k: string): number => asNum(d?.[k]);

// Backend rates arrive as 0..1 or 0..100; show a whole percent either way.
export const pct = (v: number): number => Math.round(v <= 1 ? v * 100 : v);

// A rating needs a few reviews to read as reliable; fewer shows "new" (web: 5).
export const MIN_REVIEWS = 5;
