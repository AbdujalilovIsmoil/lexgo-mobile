import { WEEK_DAYS } from "../model/constants";

type T = (key: string, p?: Record<string, string | number>) => string;

// 514 → "8 h 34 m" (translated), 0 → "—".
export function fmtMinutes(min: number, t: T): string {
  if (!min) return "—";
  return t("admHrm.hm", { h: Math.floor(min / 60), m: min % 60 });
}

// Schedule days come as names ("monday") from the seed data and as 1..7 from the web form.
export function dayKey(day: string): string {
  const n = Number(day);
  return Number.isInteger(n) && n >= 1 && n <= 7 ? WEEK_DAYS[n - 1] : day.toLowerCase();
}

export const monthOf = (d: Date = new Date()): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const lastMonths = (n: number): string[] => Array.from({ length: n }, (_, i) => monthOf(new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)));
export const isTime = (v: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
export const maskTime = (raw: string): string => {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
};
