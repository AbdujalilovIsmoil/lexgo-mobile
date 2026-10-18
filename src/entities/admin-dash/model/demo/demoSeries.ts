import type { Point } from "../types";

// ISO day `n` days before `today` (YYYY-MM-DD, local calendar arithmetic).
export function dayBefore(today: string, n: number): string {
  const [y, m, d] = today.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(y || 2026, (m || 1) - 1, (d || 1) - n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

// Fixed weekly rhythm so demo trends look like traffic, never random noise.
const SHAPE = [0.72, 0.88, 1.0, 1.12, 0.96, 1.24, 0.81, 0.93, 1.08, 1.31, 0.77, 0.9, 1.15, 1.02];
export function series(today: string, days: number, base: number, growth = 0.012): Point[] {
  return Array.from({ length: days }, (_, i) => ({ label: dayBefore(today, days - 1 - i), value: Math.round(base * SHAPE[i % SHAPE.length] * (1 + growth * i)) }));
}

export const entries = (o: Record<string, number>): Point[] => Object.entries(o).map(([label, value]) => ({ label, value }));
